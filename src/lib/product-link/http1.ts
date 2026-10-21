/**
 * A tiny, bounded HTTP/1.1 GET client over an already-connected byte stream.
 *
 * Why it exists: on Cloudflare Workers `fetch()` resolves the host name itself, so the address we
 * checked could differ from the one used (DNS rebinding). The import feature therefore opens the
 * TCP/TLS connection to the checked IP itself (see transport.server.ts) and speaks HTTP over it
 * with this client. Pure and transport-agnostic, so it is unit-tested with in-memory streams.
 *
 * Deliberately minimal and strict: GET only, `Connection: close`, `Accept-Encoding: identity`
 * (a compressed answer is refused, never decoded), headers and body hard-capped, malformed or
 * ambiguous framing refused.
 */

export interface Conn {
  /** Next chunk, or null at end of stream. */
  read(): Promise<Uint8Array | null>;
  write(bytes: Uint8Array): Promise<void>;
  close(): void;
}

export type HttpResponse = { status: number; headers: Record<string, string>; body: Uint8Array };
export type Http1Error =
  | "bad_request"
  | "bad_response"
  | "headers_too_large"
  | "too_large"
  | "unsupported_encoding";

export type Http1Options = {
  userAgent: string;
  accept: string;
  maxBodyBytes: number;
  maxHeaderBytes: number;
};

const enc = new TextEncoder();
const dec = new TextDecoder("latin1");

class Buffered {
  private buf = new Uint8Array(0);
  private ended = false;
  private conn: Conn;
  constructor(conn: Conn) {
    this.conn = conn;
  }

  private append(chunk: Uint8Array) {
    const next = new Uint8Array(this.buf.length + chunk.length);
    next.set(this.buf);
    next.set(chunk, this.buf.length);
    this.buf = next;
  }

  /** Pull one more chunk into the buffer. False at end of stream. */
  async fill(): Promise<boolean> {
    if (this.ended) return false;
    const chunk = await this.conn.read();
    if (!chunk) {
      this.ended = true;
      return false;
    }
    this.append(chunk);
    return true;
  }

  get length() {
    return this.buf.length;
  }
  indexOfCRLF(from = 0): number {
    for (let i = from; i + 1 < this.buf.length; i++) {
      if (this.buf[i] === 13 && this.buf[i + 1] === 10) return i;
    }
    return -1;
  }
  indexOfHeaderEnd(): number {
    for (let i = 0; i + 3 < this.buf.length; i++) {
      if (
        this.buf[i] === 13 &&
        this.buf[i + 1] === 10 &&
        this.buf[i + 2] === 13 &&
        this.buf[i + 3] === 10
      ) {
        return i;
      }
    }
    return -1;
  }
  take(n: number): Uint8Array {
    const out = this.buf.slice(0, n);
    this.buf = this.buf.slice(n);
    return out;
  }
  peekText(n: number): string {
    return dec.decode(this.buf.subarray(0, n));
  }
  takeAll(): Uint8Array {
    return this.take(this.buf.length);
  }
}

function concat(parts: Uint8Array[], total: number): Uint8Array {
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** Request line + headers for a GET. Refuses anything that could smuggle a second header. */
export function buildRequest(
  host: string,
  pathAndQuery: string,
  opts: Http1Options,
): Uint8Array | null {
  const bad = /[\r\n\u0000]/;
  if (bad.test(host) || bad.test(pathAndQuery) || bad.test(opts.userAgent) || bad.test(opts.accept))
    return null;
  if (!pathAndQuery.startsWith("/") || /\s/.test(pathAndQuery)) return null;
  const text =
    `GET ${pathAndQuery} HTTP/1.1\r\n` +
    `Host: ${host}\r\n` +
    `User-Agent: ${opts.userAgent}\r\n` +
    `Accept: ${opts.accept}\r\n` +
    `Accept-Language: en\r\n` +
    `Accept-Encoding: identity\r\n` +
    `Connection: close\r\n\r\n`;
  return enc.encode(text);
}

export async function http1Get(
  conn: Conn,
  host: string,
  pathAndQuery: string,
  opts: Http1Options,
): Promise<{ ok: true; res: HttpResponse } | { ok: false; error: Http1Error }> {
  const request = buildRequest(host, pathAndQuery, opts);
  if (!request) return { ok: false, error: "bad_request" };
  await conn.write(request);

  const reader = new Buffered(conn);
  // ---- header block
  let end = reader.indexOfHeaderEnd();
  while (end === -1) {
    if (reader.length > opts.maxHeaderBytes) return { ok: false, error: "headers_too_large" };
    if (!(await reader.fill())) return { ok: false, error: "bad_response" };
    end = reader.indexOfHeaderEnd();
  }
  if (end > opts.maxHeaderBytes) return { ok: false, error: "headers_too_large" };
  const head = dec.decode(reader.take(end + 4)).slice(0, -4);
  const lines = head.split("\r\n");
  const statusLine = /^HTTP\/1\.[01] (\d{3})(?: |$)/.exec(lines[0] ?? "");
  if (!statusLine) return { ok: false, error: "bad_response" };
  const status = Number(statusLine[1]);
  if (status < 200) return { ok: false, error: "bad_response" }; // 1xx: not expected, refuse

  const headers: Record<string, string> = {};
  for (const line of lines.slice(1)) {
    if (/^[ \t]/.test(line)) return { ok: false, error: "bad_response" }; // obsolete line folding
    const colon = line.indexOf(":");
    if (colon <= 0) return { ok: false, error: "bad_response" };
    const name = line.slice(0, colon).trim().toLowerCase();
    if (!/^[!#$%&'*+.^_`|~0-9a-z-]+$/.test(name)) return { ok: false, error: "bad_response" };
    const value = line.slice(colon + 1).trim();
    if (name in headers) {
      // Conflicting framing headers are a request-smuggling signal.
      if (name === "content-length" && headers[name] !== value)
        return { ok: false, error: "bad_response" };
      if (name === "transfer-encoding" || name === "location") continue;
      headers[name] = `${headers[name]}, ${value}`;
    } else {
      headers[name] = value;
    }
  }

  const contentEncoding = (headers["content-encoding"] ?? "identity").toLowerCase();
  if (contentEncoding !== "identity" && contentEncoding !== "")
    return { ok: false, error: "unsupported_encoding" };

  const noBody = status === 204 || status === 304 || (status >= 300 && status < 400);
  if (noBody) {
    // Redirects and "not modified" carry nothing we want; do not read more from the peer.
    return { ok: true, res: { status, headers, body: new Uint8Array(0) } };
  }

  const te = headers["transfer-encoding"]?.toLowerCase();
  if (te !== undefined && te !== "chunked") return { ok: false, error: "bad_response" };

  // ---- body
  if (te === "chunked") {
    const parts: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      let lineEnd = reader.indexOfCRLF();
      while (lineEnd === -1) {
        if (reader.length > 1024) return { ok: false, error: "bad_response" };
        if (!(await reader.fill())) return { ok: false, error: "bad_response" };
        lineEnd = reader.indexOfCRLF();
      }
      const sizeText = reader.peekText(lineEnd).split(";")[0]!.trim();
      if (!/^[0-9a-fA-F]{1,8}$/.test(sizeText)) return { ok: false, error: "bad_response" };
      reader.take(lineEnd + 2);
      const size = parseInt(sizeText, 16);
      if (size === 0) break; // trailers, if any, are ignored
      if (total + size > opts.maxBodyBytes) return { ok: false, error: "too_large" };
      while (reader.length < size + 2) {
        if (!(await reader.fill())) return { ok: false, error: "bad_response" };
      }
      parts.push(reader.take(size));
      if (reader.take(2).join(",") !== "13,10") return { ok: false, error: "bad_response" };
      total += size;
    }
    return { ok: true, res: { status, headers, body: concat(parts, total) } };
  }

  const lengthText = headers["content-length"];
  if (lengthText !== undefined) {
    if (!/^[0-9]{1,12}$/.test(lengthText)) return { ok: false, error: "bad_response" };
    const length = Number(lengthText);
    if (length > opts.maxBodyBytes) return { ok: false, error: "too_large" };
    while (reader.length < length) {
      if (!(await reader.fill())) return { ok: false, error: "bad_response" };
    }
    return { ok: true, res: { status, headers, body: reader.take(length) } };
  }

  // No framing: the body ends when the server closes the connection.
  for (;;) {
    if (reader.length > opts.maxBodyBytes) return { ok: false, error: "too_large" };
    if (!(await reader.fill())) break;
  }
  return { ok: true, res: { status, headers, body: reader.takeAll() } };
}
