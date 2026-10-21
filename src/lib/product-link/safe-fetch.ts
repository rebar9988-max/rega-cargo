/**
 * Fetch ONE product page without any SSRF path. Pure orchestration with injected I/O, so the
 * whole policy is unit-tested; production wires it to DNS-over-HTTPS and Workers TCP sockets
 * (dns.server.ts, transport.server.ts).
 *
 * For every hop (the first URL and each redirect):
 *   1. the URL passes parseImportUrl / parseRedirectTarget (https, no credentials, default port,
 *      no IP literal, no internal name);
 *   2. the host is resolved through DoH and EVERY address must be public;
 *   3. the connection is opened to one of those exact verified IPs (TLS name = the host), so the
 *      address that was checked is the address that is used. If the runtime cannot do that the
 *      transport throws and the import fails closed;
 *   4. the answer is read with hard size and time limits.
 *
 * A store that refuses us (401/403/429 or a challenge) is reported as "blocked_by_store" and the
 * caller falls back to manual entry. We never retry with other headers or identities.
 */
import { http1Get, type Conn } from "./http1.ts";
import {
  onlyPublicAddresses,
  parseImportUrl,
  parseRedirectTarget,
  type ParsedImportUrl,
} from "./ssrf.ts";

export type FetchDeps = {
  /** All A/AAAA addresses of `host`. May throw. */
  resolve(host: string): Promise<string[]>;
  /** TCP+TLS to exactly `ip`, certificate and SNI checked against `host`. May throw. */
  connect(ip: string, host: string): Promise<Conn>;
};

export type FetchLimits = {
  maxRedirects: number;
  maxBodyBytes: number;
  maxHeaderBytes: number;
  totalTimeoutMs: number;
};

export const DEFAULT_FETCH_LIMITS: FetchLimits = {
  maxRedirects: 3,
  maxBodyBytes: 1_048_576, // 1 MiB of HTML is plenty for metadata
  maxHeaderBytes: 16_384,
  totalTimeoutMs: 8_000,
};

/** Honest, fixed identity. Never rotated, never a browser look-alike. */
export const IMPORT_USER_AGENT = "RLGo-LinkPreview/1.0 (+https://www.rlgo.net)";
const ACCEPT = "text/html,application/xhtml+xml;q=0.9";

export type FetchFailure =
  | "invalid_url"
  | "blocked_host" // a non-public address, or a name that is not allowed
  | "dns_failed"
  | "redirect_limit"
  | "redirect_invalid"
  | "blocked_by_store" // 401 / 403 / 429
  | "http_error"
  | "too_large"
  | "unsupported_content"
  | "timeout"
  | "network"
  | "bad_response";

export type SafeFetchResult =
  | {
      ok: true;
      finalUrl: string;
      host: string;
      status: number;
      contentType: string;
      html: string;
      redirects: number;
    }
  | { ok: false; reason: FetchFailure; status?: number };

const REDIRECT = new Set([301, 302, 303, 307, 308]);

function decodeBody(bytes: Uint8Array, contentType: string): string {
  const label =
    /charset\s*=\s*"?([a-z0-9_.:-]+)"?/i.exec(contentType)?.[1]?.toLowerCase() ?? "utf-8";
  try {
    return new TextDecoder(label).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

export async function safeFetchPage(
  rawUrl: unknown,
  deps: FetchDeps,
  limits: FetchLimits = DEFAULT_FETCH_LIMITS,
): Promise<SafeFetchResult> {
  const first = parseImportUrl(rawUrl);
  if (!first.ok) return { ok: false, reason: "invalid_url" };

  // Holder object: assigned inside async closures, read by the timer and the final cleanup.
  const live: { conn: Conn | null } = { conn: null };
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<SafeFetchResult>((resolve) => {
    timer = setTimeout(() => {
      try {
        live.conn?.close();
      } catch {
        /* already closed */
      }
      resolve({ ok: false, reason: "timeout" });
    }, limits.totalTimeoutMs);
  });

  const work = (async (): Promise<SafeFetchResult> => {
    let target: ParsedImportUrl = first.value;
    for (let hop = 0; hop <= limits.maxRedirects; hop++) {
      // -- 2. resolve and vet every answer
      let answers: string[];
      try {
        answers = await deps.resolve(target.host);
      } catch {
        return { ok: false, reason: "dns_failed" };
      }
      if (!answers.length) return { ok: false, reason: "dns_failed" };
      const vetted = onlyPublicAddresses(answers);
      if (!vetted.ok) return { ok: false, reason: "blocked_host" };

      // -- 3. connect to a verified IP only
      let conn: Conn | null = null;
      for (const ip of vetted.ips.slice(0, 2)) {
        try {
          conn = await deps.connect(ip, target.host);
          break;
        } catch {
          conn = null;
        }
      }
      if (!conn) return { ok: false, reason: "network" };
      live.conn = conn;

      // -- 4. one bounded GET
      let result;
      try {
        result = await http1Get(conn, target.host, target.url.pathname + target.url.search, {
          userAgent: IMPORT_USER_AGENT,
          accept: ACCEPT,
          maxBodyBytes: limits.maxBodyBytes,
          maxHeaderBytes: limits.maxHeaderBytes,
        });
      } catch {
        return { ok: false, reason: "network" };
      } finally {
        try {
          conn.close();
        } catch {
          /* ignore */
        }
        live.conn = null;
      }
      if (!result.ok) {
        if (result.error === "too_large" || result.error === "headers_too_large") {
          return { ok: false, reason: "too_large" };
        }
        if (result.error === "unsupported_encoding")
          return { ok: false, reason: "unsupported_content" };
        return { ok: false, reason: "bad_response" };
      }

      const { status, headers, body } = result.res;
      if (REDIRECT.has(status)) {
        if (hop === limits.maxRedirects) return { ok: false, reason: "redirect_limit", status };
        const location = headers["location"];
        if (!location) return { ok: false, reason: "redirect_invalid", status };
        const next = parseRedirectTarget(target.url, location);
        if (!next.ok) return { ok: false, reason: "redirect_invalid", status };
        target = next.value;
        continue;
      }
      if (status === 401 || status === 403 || status === 429) {
        return { ok: false, reason: "blocked_by_store", status };
      }
      if (status < 200 || status >= 300) return { ok: false, reason: "http_error", status };

      const contentType = headers["content-type"] ?? "";
      if (!/^\s*(text\/html|application\/xhtml\+xml)\b/i.test(contentType)) {
        return { ok: false, reason: "unsupported_content", status };
      }
      return {
        ok: true,
        finalUrl: target.url.href,
        host: target.host,
        status,
        contentType,
        html: decodeBody(body, contentType),
        redirects: hop,
      };
    }
    return { ok: false, reason: "redirect_limit" };
  })().catch((): SafeFetchResult => ({ ok: false, reason: "network" }));

  try {
    return await Promise.race([work, deadline]);
  } finally {
    clearTimeout(timer);
    try {
      live.conn?.close();
    } catch {
      /* ignore */
    }
  }
}
