import { test } from "node:test";
import assert from "node:assert/strict";
import { createHtmlCache } from "./html-cache.ts";
import renderPriority from "../../server/middleware/0-b-render-priority.ts";

const html = (body: string, extra: Record<string, string> = {}) =>
  new Response(body, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", ...extra },
  });

test("render priority keeps API responses and explicit asset hints intact", async () => {
  const api = new Response('{"ok":true}', { headers: { "content-type": "application/json" } });
  assert.equal(await renderPriority(null, () => api), api);
  assert.equal(await api.text(), '{"ok":true}');
  const result = await renderPriority(null, () =>
    html(
      '<link rel="modulepreload" href="/entry.js"/><link rel="modulepreload" href="/a.js"/><link rel="modulepreload" fetchpriority="high" href="/b.js"/><link rel="preload" as="font" href="/c.woff2"/><main>Content</main>',
      { "x-check": "preserved", "content-length": "1" },
    ),
  );
  assert.ok(result instanceof Response);
  assert.equal(result.headers.get("x-check"), "preserved");
  assert.equal(result.headers.has("content-length"), false);
  const body = await result.text();
  assert.match(body, /href="\/entry.js" fetchpriority="high"/);
  assert.match(body, /href="\/a.js" fetchpriority="low"/);
  assert.match(body, /fetchpriority="high" href="\/b.js"/);
  assert.match(body, /as="font" href="\/c.woff2"\/>/);
  assert.match(body, /<main>Content<\/main>/);
});

function setup(ttlMs = 60_000, maxEntries = 2) {
  let clock = 0;
  let renders = 0;
  const cache = createHtmlCache({
    paths: ["/", "/stores", "/quote"],
    ttlMs,
    maxEntries,
    now: () => clock,
  });
  const get = (path: string, init: { method?: string; host?: string; make?: () => unknown } = {}) =>
    cache.handle(
      {
        method: init.method ?? "GET",
        url: new URL(`https://x.test${path}`),
        host: init.host ?? "x.test",
      },
      () => {
        renders += 1;
        return init.make ? init.make() : html(`page ${path} #${renders}`);
      },
    ) as Promise<Response>;
  return { cache, get, renders: () => renders, tick: (ms: number) => (clock += ms) };
}

test("second request for an allow-listed page is served without rendering", async () => {
  const s = setup();
  const first = await s.get("/stores");
  assert.equal(first.headers.get("x-rl-cache"), "miss");
  const second = await s.get("/stores");
  assert.equal(second.headers.get("x-rl-cache"), "hit");
  assert.equal(await second.text(), "page /stores #1");
  assert.equal(s.renders(), 1);
});

test("query strings, other paths and non-GET always render", async () => {
  const s = setup();
  await s.get("/track?code=1");
  await s.get("/track?code=1");
  await s.get("/?install=1");
  await s.get("/?install=1");
  await s.get("/market");
  await s.get("/market");
  await s.get("/", { method: "POST" });
  await s.get("/", { method: "POST" });
  assert.equal(s.renders(), 8);
  assert.equal(s.cache.size(), 0);
});

test("responses with cookies, errors, encodings or non-HTML are never stored", async () => {
  const s = setup(60_000, 10);
  await s.get("/", { make: () => html("a", { "set-cookie": "s=1" }) });
  await s.get("/stores", {
    make: () => new Response("err", { status: 500, headers: { "content-type": "text/html" } }),
  });
  await s.get("/quote", { make: () => html("z", { "content-encoding": "br" }) });
  await s.get("/quote", {
    make: () => new Response("{}", { headers: { "content-type": "application/json" } }),
  });
  assert.equal(s.cache.size(), 0);
});

test("entries expire after the TTL and are keyed by host", async () => {
  const s = setup(1000);
  await s.get("/");
  await s.get("/", { host: "other.test" });
  assert.equal(s.renders(), 2);
  s.tick(1001);
  const again = await s.get("/");
  assert.equal(again.headers.get("x-rl-cache"), "miss");
  assert.equal(s.renders(), 3);
});

test("cache size is bounded", async () => {
  const s = setup(60_000, 2);
  await s.get("/");
  await s.get("/stores");
  await s.get("/quote");
  assert.equal(s.cache.size(), 2);
  await s.get("/");
  assert.equal(s.renders(), 4);
});

test("a host outside the allow-list is never cached", async () => {
  let renders = 0;
  const cache = createHtmlCache({
    paths: ["/"],
    ttlMs: 1000,
    maxEntries: 4,
    hosts: ["cargo.regaplatform.com"],
  });
  const get = (host: string) =>
    cache.handle({ method: "GET", url: new URL("https://cargo.regaplatform.com/"), host }, () => {
      renders += 1;
      return html("ok");
    });
  await get("evil.example");
  await get("evil.example");
  await get("cargo.regaplatform.com");
  await get("cargo.regaplatform.com");
  assert.equal(renders, 3);
});

test("the remembered service cookie gets its own cache entry and never leaks across", async () => {
  const { serviceFromCookieHeader } = await import("./service-choice.ts");
  let n = 0;
  const cache = createHtmlCache({
    paths: ["/"],
    ttlMs: 60_000,
    maxEntries: 4,
    vary: (headers) =>
      serviceFromCookieHeader(headers.get("cookie")) === "delivery" ? "delivery" : "",
  });
  const get = (cookie?: string) =>
    cache.handle(
      {
        method: "GET",
        url: new URL("https://x.test/"),
        host: "x.test",
        headers: new Headers(cookie ? { cookie } : {}),
      },
      () => html(cookie?.includes("delivery") ? `delivery #${++n}` : `bazaar #${++n}`),
    ) as Promise<Response>;
  assert.equal(await (await get()).text(), "bazaar #1");
  assert.equal(await (await get("a=1; rl-service=delivery")).text(), "delivery #2");
  assert.equal(await (await get("rl-service=delivery")).text(), "delivery #2");
  assert.equal(await (await get()).text(), "bazaar #1");
  // Arbitrary cookie values collapse to the default entry instead of growing the cache.
  assert.equal(await (await get("rl-service=<script>")).text(), "bazaar #1");
  assert.equal(await (await get("rl-service=deliveryX")).text(), "bazaar #1");
  assert.equal(cache.size(), 2);
});

test("the appearance script is permitted by its exact CSP hash without unsafe-inline scripts", async () => {
  const { createHash } = await import("node:crypto");
  const { APPEARANCE_SCRIPT, APPEARANCE_CSP } = await import("./appearance-script.ts");
  const { default: secure } = await import("../../server/middleware/0-a-security.ts");
  assert.equal(
    APPEARANCE_CSP,
    `'sha256-${createHash("sha256").update(APPEARANCE_SCRIPT).digest("base64")}'`,
  );
  const response = await secure(
    null,
    () =>
      new Response(`<html><script>${APPEARANCE_SCRIPT}</script></html>`, {
        headers: { "content-type": "text/html" },
      }),
  );
  assert.ok(response instanceof Response);
  const policy = response.headers.get("content-security-policy") ?? "";
  const scripts = policy.split(";").find((value) => value.trim().startsWith("script-src")) ?? "";
  assert.ok(scripts.includes(APPEARANCE_CSP));
  assert.ok(!scripts.includes("unsafe-inline"));
  const nonce = scripts.match(/'nonce-([^']+)'/)?.[1];
  assert.ok(nonce);
  assert.ok((await response.text()).includes(`nonce="${nonce}"`));
});
