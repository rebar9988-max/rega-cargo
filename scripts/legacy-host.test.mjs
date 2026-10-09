import { test } from "node:test";
import assert from "node:assert/strict";
import { legacyHostResponse, wrapWorker, UNREGISTER_SW } from "./legacy-host.mjs";
import { entrySource, patchConfig } from "./wrap-legacy-host.mjs";

const OLD = "https://rega-cargo.rebar9988.workers.dev";

test("old host: any page 301s to the same path + query on the custom domain", () => {
  for (const path of ["/", "/stores?x=1", "/market/abc?q=a%20b&page=2", "/manifest.webmanifest", "/offline.html", "/assets/x.js"]) {
    const res = legacyHostResponse(new Request(OLD + path));
    assert.equal(res.status, 301, path);
    assert.equal(res.headers.get("location"), "https://cargo.regaplatform.com" + path);
  }
});

test("old host: non-GET uses 308 so the method is kept", () => {
  const res = legacyHostResponse(new Request(OLD + "/api/x?a=1", { method: "POST", body: "{}" }));
  assert.equal(res.status, 308);
  assert.equal(res.headers.get("location"), "https://cargo.regaplatform.com/api/x?a=1");
});

test("old host: /sw.js is a no-store self-unregistering worker that moves clients", async () => {
  const res = legacyHostResponse(new Request(OLD + "/sw.js"));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("cache-control"), "no-store");
  assert.match(res.headers.get("content-type"), /javascript/);
  const body = await res.text();
  assert.equal(body, UNREGISTER_SW);
  assert.match(body, /registration\.unregister\(\)/);
  assert.match(body, /caches\.delete/);
  assert.match(body, /client\.navigate\("https:\/\/cargo\.regaplatform\.com" \+ u\.pathname/);
  assert.match(body, /skipWaiting/);
});

test("new host, staging and anything else pass through", async () => {
  for (const u of ["https://cargo.regaplatform.com/sw.js", "https://rega-cargo-staging.rebar9988.workers.dev/", "https://example.com/"]) {
    assert.equal(legacyHostResponse(new Request(u)), null, u);
  }
  const worker = wrapWorker({ fetch: () => new Response("app"), other: 1 });
  assert.equal(worker.other, 1);
  assert.equal(await (await worker.fetch(new Request("https://cargo.regaplatform.com/"))).text(), "app");
  assert.equal((await worker.fetch(new Request(OLD + "/"))).status, 301);
});

test("build wrapper: entry re-exports Nitro's module and config routes sw/manifest/offline to the Worker", () => {
  const src = entrySource("index.mjs");
  assert.match(src, /export \* from "\.\/index\.mjs"/);
  assert.match(src, /export default wrapWorker\(inner\)/);
  const cfg = patchConfig({ main: "index.mjs", assets: { binding: "ASSETS", directory: "../public" } });
  assert.equal(cfg.main, "legacy-host-entry.mjs");
  assert.equal(cfg.assets.binding, "ASSETS");
  assert.deepEqual(cfg.assets.run_worker_first, ["/sw.js", "/manifest.webmanifest", "/offline.html"]);
});
