import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { http1Get, type Conn } from "./http1.ts";
import { createDohResolver } from "./dns.server.ts";
import { safeFetchPage, type FetchDeps, type FetchLimits } from "./safe-fetch.ts";

const enc = new TextEncoder();

/** An in-memory connection that records what was written and replays a canned answer. */
function fakeConn(reply: string | Uint8Array, chunk = 64) {
  const bytes = typeof reply === "string" ? enc.encode(reply) : reply;
  let at = 0;
  const written: string[] = [];
  let closed = false;
  const conn: Conn = {
    async read() {
      if (at >= bytes.length) return null;
      const out = bytes.slice(at, at + chunk);
      at += chunk;
      return out;
    },
    async write(b) {
      written.push(new TextDecoder().decode(b));
    },
    close() {
      closed = true;
    },
  };
  return { conn, written, isClosed: () => closed };
}

const opts = { userAgent: "T/1", accept: "text/html", maxBodyBytes: 1000, maxHeaderBytes: 2000 };
const html = (extra = "") =>
  `HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\n${extra}\r\n`;

describe("http1Get", () => {
  it("sends a strict identity-encoded GET with Connection: close", async () => {
    const f = fakeConn(html("Content-Length: 2\r\n") + "ok");
    await http1Get(f.conn, "shop.com", "/p?id=1", opts);
    assert.equal(
      f.written[0],
      "GET /p?id=1 HTTP/1.1\r\nHost: shop.com\r\nUser-Agent: T/1\r\nAccept: text/html\r\nAccept-Language: en\r\nAccept-Encoding: identity\r\nConnection: close\r\n\r\n",
    );
  });
  it("refuses a request that could smuggle a header", async () => {
    const f = fakeConn("");
    const r = await http1Get(f.conn, "shop.com", "/p\r\nX: 1", opts);
    assert.deepEqual(r, { ok: false, error: "bad_request" });
    assert.equal(f.written.length, 0);
  });
  it("reads content-length, chunked and until-close bodies", async () => {
    const a = await http1Get(
      fakeConn(html("Content-Length: 5\r\n") + "hello").conn,
      "a.com",
      "/",
      opts,
    );
    const b = await http1Get(
      fakeConn(
        "HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n3\r\nhel\r\n2\r\nlo\r\n0\r\n\r\n",
      ).conn,
      "a.com",
      "/",
      opts,
    );
    const c = await http1Get(fakeConn(html() + "hello").conn, "a.com", "/", opts);
    for (const r of [a, b, c]) {
      assert.ok(r.ok);
      assert.equal(new TextDecoder().decode(r.res.body), "hello");
    }
  });
  it("caps the body (declared, chunked and unframed)", async () => {
    const big = "x".repeat(2000);
    const r1 = await http1Get(
      fakeConn(html("Content-Length: 2000\r\n") + big).conn,
      "a.com",
      "/",
      opts,
    );
    const r2 = await http1Get(
      fakeConn(`HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n7d0\r\n${big}\r\n0\r\n\r\n`)
        .conn,
      "a.com",
      "/",
      opts,
    );
    const r3 = await http1Get(fakeConn(html() + big).conn, "a.com", "/", opts);
    for (const r of [r1, r2, r3]) assert.deepEqual(r, { ok: false, error: "too_large" });
  });
  it("caps headers", async () => {
    const r = await http1Get(
      fakeConn(`HTTP/1.1 200 OK\r\nX: ${"a".repeat(5000)}\r\n\r\n`).conn,
      "a.com",
      "/",
      opts,
    );
    assert.deepEqual(r, { ok: false, error: "headers_too_large" });
  });
  it("refuses compression, ambiguous framing, junk and truncated bodies", async () => {
    const cases: [string, string][] = [
      [html("Content-Encoding: gzip\r\nContent-Length: 1\r\n") + "x", "unsupported_encoding"],
      [html("Content-Length: 1\r\nContent-Length: 2\r\n") + "xx", "bad_response"],
      ["HTTP/1.1 200 OK\r\nTransfer-Encoding: gzip\r\n\r\nx", "bad_response"],
      ["NOT HTTP\r\n\r\n", "bad_response"],
      ["HTTP/1.1 100 Continue\r\n\r\n", "bad_response"],
      [html("Content-Length: 10\r\n") + "short", "bad_response"],
      [html("Content-Length: abc\r\n") + "x", "bad_response"],
      [html().replace("\r\n\r\n", "\r\n folded\r\n\r\n") + "x", "bad_response"],
    ];
    for (const [reply, error] of cases) {
      const r = await http1Get(fakeConn(reply).conn, "a.com", "/", opts);
      assert.deepEqual(r, { ok: false, error }, reply.slice(0, 40));
    }
  });
  it("does not read a redirect body", async () => {
    const r = await http1Get(
      fakeConn("HTTP/1.1 302 Found\r\nLocation: https://b.com/\r\n\r\n").conn,
      "a.com",
      "/",
      opts,
    );
    assert.ok(r.ok);
    assert.equal(r.res.headers["location"], "https://b.com/");
    assert.equal(r.res.body.length, 0);
  });
});

// ---------------------------------------------------------------------------------------------

type Site = { ips?: string[]; reply: string; fail?: boolean };
function world(sites: Record<string, Site>) {
  const log = {
    resolved: [] as string[],
    connected: [] as string[],
    conns: [] as ReturnType<typeof fakeConn>[],
  };
  const deps: FetchDeps = {
    async resolve(host) {
      log.resolved.push(host);
      const s = sites[host];
      if (!s) throw new Error("nxdomain");
      return s.ips ?? ["93.184.216.34"];
    },
    async connect(ip, host) {
      log.connected.push(`${ip}|${host}`);
      const s = sites[host]!;
      if (s.fail) throw new Error("refused");
      const f = fakeConn(s.reply);
      log.conns.push(f);
      return f.conn;
    },
  };
  return { deps, log };
}
const page = (body = "<html></html>") => html(`Content-Length: ${body.length}\r\n`) + body;
const redirect = (to: string, code = 301) => `HTTP/1.1 ${code} Moved\r\nLocation: ${to}\r\n\r\n`;
const fast: FetchLimits = {
  maxRedirects: 3,
  maxBodyBytes: 100_000,
  maxHeaderBytes: 8_000,
  totalTimeoutMs: 500,
};

describe("safeFetchPage", () => {
  it("fetches a page from the verified IP, with the host as TLS name", async () => {
    const w = world({ "shop.com": { reply: page("<title>Hi</title>") } });
    const r = await safeFetchPage("https://shop.com/p/1", w.deps, fast);
    assert.ok(r.ok);
    assert.equal(r.html, "<title>Hi</title>");
    assert.equal(r.finalUrl, "https://shop.com/p/1");
    assert.deepEqual(w.log.connected, ["93.184.216.34|shop.com"]);
    assert.equal(w.log.conns[0]!.isClosed(), true);
  });

  it("rejects bad input before any network activity", async () => {
    const w = world({});
    for (const u of [
      "http://shop.com/",
      "https://127.0.0.1/",
      "https://shop.com:8080/",
      "a b",
      5,
      "https://x.com/ https://y.com/",
    ]) {
      const r = await safeFetchPage(u, w.deps, fast);
      assert.deepEqual(r, { ok: false, reason: "invalid_url" }, String(u));
    }
    assert.equal(w.log.resolved.length, 0);
  });

  it("refuses a host that resolves to a private address and never connects", async () => {
    for (const ips of [
      ["127.0.0.1"],
      ["10.0.0.5"],
      ["169.254.169.254"],
      ["::1"],
      ["93.184.216.34", "192.168.0.10"],
      ["::ffff:127.0.0.1"],
    ]) {
      const w = world({ "evil.com": { ips, reply: page() } });
      const r = await safeFetchPage("https://evil.com/", w.deps, fast);
      assert.deepEqual(r, { ok: false, reason: "blocked_host" }, ips.join());
      assert.equal(w.log.connected.length, 0);
    }
  });

  it("reports a DNS failure or an empty answer as dns_failed", async () => {
    const none = world({});
    assert.deepEqual(await safeFetchPage("https://nope.com/", none.deps, fast), {
      ok: false,
      reason: "dns_failed",
    });
    const empty = world({ "e.com": { ips: [], reply: page() } });
    assert.deepEqual(await safeFetchPage("https://e.com/", empty.deps, fast), {
      ok: false,
      reason: "dns_failed",
    });
  });

  it("re-resolves and re-vets EVERY redirect hop", async () => {
    const w = world({
      "a.com": { reply: redirect("https://b.com/x") },
      "b.com": { reply: redirect("/y") },
      "b2.com": { reply: page("never") },
    });
    w.deps.resolve = async (h) => {
      w.log.resolved.push(h);
      return [h === "b.com" ? "93.184.216.35" : "93.184.216.34"];
    };
    const r = await safeFetchPage("https://a.com/", w.deps, { ...fast });
    // a.com -> b.com -> /y on b.com, whose reply is itself a redirect loop: bounded by maxRedirects.
    assert.deepEqual(r, { ok: false, reason: "redirect_limit", status: 301 });
    assert.deepEqual(w.log.resolved, ["a.com", "b.com", "b.com", "b.com"]);
  });

  it("refuses a redirect into a private address (the classic SSRF) at the name or IP level", async () => {
    for (const to of [
      "https://127.0.0.1/admin",
      "https://169.254.169.254/latest/meta-data",
      "http://shop.com/x",
      "https://localhost/",
      "https://[::1]/",
      "https://shop.com:8443/",
      "file:///etc/passwd",
      "",
    ]) {
      const w = world({ "shop.com": { reply: redirect(to) } });
      const r = await safeFetchPage("https://shop.com/", w.deps, fast);
      assert.equal(r.ok, false);
      assert.ok(!r.ok && ["redirect_invalid"].includes(r.reason), `${to} -> ${!r.ok && r.reason}`);
      assert.equal(w.log.connected.length, 1, "only the first hop is ever connected");
    }
  });

  it("refuses a redirect to a public NAME that resolves privately (rebinding)", async () => {
    const w = world({
      "shop.com": { reply: redirect("https://rebind.example-cdn.com/") },
      "rebind.example-cdn.com": { ips: ["10.1.2.3"], reply: page("secret") },
    });
    const r = await safeFetchPage("https://shop.com/", w.deps, fast);
    assert.deepEqual(r, { ok: false, reason: "blocked_host" });
    assert.deepEqual(w.log.connected, ["93.184.216.34|shop.com"]);
  });

  it("follows a normal redirect to a public host", async () => {
    const w = world({
      "short.shop.com": { reply: redirect("https://www.shop.com/p/9", 302) },
      "www.shop.com": { reply: page("<b>ok</b>") },
    });
    const r = await safeFetchPage("https://short.shop.com/abc", w.deps, fast);
    assert.ok(r.ok);
    assert.equal(r.finalUrl, "https://www.shop.com/p/9");
    assert.equal(r.redirects, 1);
  });

  it("stops after too many redirects and on a redirect with no Location", async () => {
    const loop = world({ "a.com": { reply: redirect("https://a.com/next") } });
    assert.deepEqual(await safeFetchPage("https://a.com/", loop.deps, fast), {
      ok: false,
      reason: "redirect_limit",
      status: 301,
    });
    assert.equal(loop.log.connected.length, 4);
    const bare = world({ "a.com": { reply: "HTTP/1.1 302 Found\r\n\r\n" } });
    assert.deepEqual(await safeFetchPage("https://a.com/", bare.deps, fast), {
      ok: false,
      reason: "redirect_invalid",
      status: 302,
    });
  });

  it("treats 401/403/429 as blocked_by_store, once, with no retry", async () => {
    for (const code of [401, 403, 429]) {
      const w = world({ "shop.com": { reply: `HTTP/1.1 ${code} X\r\nContent-Length: 0\r\n\r\n` } });
      const r = await safeFetchPage("https://shop.com/", w.deps, fast);
      assert.deepEqual(r, { ok: false, reason: "blocked_by_store", status: code });
      assert.equal(w.log.connected.length, 1);
    }
  });

  it("other HTTP errors, non-HTML, oversize, junk and connection failure", async () => {
    const run = async (reply: string, fail = false) =>
      safeFetchPage("https://shop.com/", world({ "shop.com": { reply, fail } }).deps, {
        ...fast,
        maxBodyBytes: 50,
      });
    assert.deepEqual(await run("HTTP/1.1 404 NF\r\nContent-Length: 0\r\n\r\n"), {
      ok: false,
      reason: "http_error",
      status: 404,
    });
    assert.deepEqual(await run("HTTP/1.1 500 E\r\nContent-Length: 0\r\n\r\n"), {
      ok: false,
      reason: "http_error",
      status: 500,
    });
    assert.deepEqual(
      await run("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 2\r\n\r\n{}"),
      { ok: false, reason: "unsupported_content", status: 200 },
    );
    assert.deepEqual(
      await run("HTTP/1.1 200 OK\r\nContent-Type: image/png\r\nContent-Length: 2\r\n\r\nxx"),
      { ok: false, reason: "unsupported_content", status: 200 },
    );
    assert.deepEqual(await run(page("x".repeat(500))), { ok: false, reason: "too_large" });
    assert.deepEqual(await run("garbage"), { ok: false, reason: "bad_response" });
    assert.deepEqual(await run("", true), { ok: false, reason: "network" });
  });

  it("falls back to a second verified IP, never to an unverified one", async () => {
    const tried: string[] = [];
    const deps: FetchDeps = {
      resolve: async () => ["93.184.216.34", "93.184.216.35", "93.184.216.36"],
      connect: async (ip) => {
        tried.push(ip);
        if (ip.endsWith(".34")) throw new Error("down");
        return fakeConn(page("ok")).conn;
      },
    };
    const r = await safeFetchPage("https://shop.com/", deps, fast);
    assert.ok(r.ok);
    assert.deepEqual(tried, ["93.184.216.34", "93.184.216.35"]);
  });

  it("fails closed when the runtime cannot bind the IP (transport throws)", async () => {
    const deps: FetchDeps = {
      resolve: async () => ["93.184.216.34"],
      connect: async () => {
        throw new Error("sockets_unavailable");
      },
    };
    assert.deepEqual(await safeFetchPage("https://shop.com/", deps, fast), {
      ok: false,
      reason: "network",
    });
  });

  it("times out a server that never answers, and closes the connection", async () => {
    let conn: Conn | null = null;
    let closed = false;
    const deps: FetchDeps = {
      resolve: async () => ["93.184.216.34"],
      connect: async () => {
        conn = {
          read: () => new Promise(() => {}),
          write: async () => {},
          close: () => void (closed = true),
        };
        return conn;
      },
    };
    const r = await safeFetchPage("https://slow.com/", deps, { ...fast, totalTimeoutMs: 60 });
    assert.deepEqual(r, { ok: false, reason: "timeout" });
    assert.equal(closed, true);
  });

  it("decodes the declared charset and survives a bogus one", async () => {
    const latin = new Uint8Array([
      ...enc.encode(
        "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=iso-8859-1\r\nContent-Length: 1\r\n\r\n",
      ),
      0xe9,
    ]);
    const w = world({ "shop.com": { reply: "" } });
    w.deps.connect = async () => fakeConn(latin).conn;
    const r = await safeFetchPage("https://shop.com/", w.deps, fast);
    assert.ok(r.ok);
    assert.equal(r.html, "é");
    const w2 = world({
      "shop.com": {
        reply:
          "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=bogus-xyz\r\nContent-Length: 2\r\n\r\nok",
      },
    });
    const r2 = await safeFetchPage("https://shop.com/", w2.deps, fast);
    assert.ok(r2.ok);
    assert.equal(r2.html, "ok");
  });
});

describe("createDohResolver", () => {
  const reply = (records: Record<string, unknown>) =>
    (async (url: string) => {
      const type = new URL(url).searchParams.get("type")!;
      const body = records[type];
      if (body === "http-error") return { ok: false, json: async () => ({}) };
      return { ok: true, json: async () => body ?? { Status: 0 } };
    }) as never;

  it("collects A and AAAA address records, ignoring CNAME and other records", async () => {
    const resolve = createDohResolver(
      reply({
        A: {
          Status: 0,
          Answer: [
            { type: 5, data: "cdn.shop.com." },
            { type: 1, data: "93.184.216.34" },
          ],
        },
        AAAA: {
          Status: 0,
          Answer: [
            { type: 28, data: "2606:2800:220:1::1" },
            { type: 16, data: "txt" },
          ],
        },
      }),
    );
    assert.deepEqual(await resolve("shop.com"), ["93.184.216.34", "2606:2800:220:1::1"]);
  });
  it("returns nothing for NXDOMAIN, tolerates one family failing, throws when both fail", async () => {
    assert.deepEqual(
      await createDohResolver(reply({ A: { Status: 3 }, AAAA: { Status: 3 } }))("x.com"),
      [],
    );
    assert.deepEqual(
      await createDohResolver(
        reply({ A: { Status: 0, Answer: [{ type: 1, data: "1.2.3.4" }] }, AAAA: "http-error" }),
      )("x.com"),
      ["1.2.3.4"],
    );
    await assert.rejects(
      createDohResolver(reply({ A: "http-error", AAAA: "http-error" }))("x.com"),
    );
  });
  it("sends the host as an encoded query to the Cloudflare DoH endpoint", async () => {
    const urls: string[] = [];
    const resolve = createDohResolver((async (
      url: string,
      init: { headers: Record<string, string> },
    ) => {
      urls.push(url);
      assert.equal(init.headers.accept, "application/dns-json");
      return { ok: true, json: async () => ({ Status: 0 }) };
    }) as never);
    await resolve("shop.com");
    assert.ok(
      urls.every((u) => u.startsWith("https://cloudflare-dns.com/dns-query?name=shop.com&type=")),
    );
  });
});
