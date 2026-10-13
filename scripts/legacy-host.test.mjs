import { test } from "node:test";
import assert from "node:assert/strict";
import { legacyHostResponse, redirectHosts, wrapWorker, UNREGISTER_SW } from "./legacy-host.mjs";
import { entrySource, patchConfig } from "./wrap-legacy-host.mjs";

const OLD = "https://rega-cargo.rebar9988.workers.dev";

test("old host: any page 301s to the same path + query on the custom domain", () => {
  for (const path of [
    "/",
    "/stores?x=1",
    "/market/abc?q=a%20b&page=2",
    "/manifest.webmanifest",
    "/offline.html",
    "/assets/x.js",
  ]) {
    const res = legacyHostResponse(new Request(OLD + path));
    assert.equal(res.status, 301, path);
    assert.equal(res.headers.get("location"), "https://www.rlgo.net" + path);
  }
});

test("old host: non-GET uses 308 so the method is kept", () => {
  const res = legacyHostResponse(new Request(OLD + "/api/x?a=1", { method: "POST", body: "{}" }));
  assert.equal(res.status, 308);
  assert.equal(res.headers.get("location"), "https://www.rlgo.net/api/x?a=1");
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
  assert.match(body, /client\.navigate\("https:\/\/www\.rlgo\.net" \+ u\.pathname/);
  assert.match(body, /skipWaiting/);
  // claim before navigate (navigate needs control), unregister last
  assert.ok(body.indexOf("clients.claim()") < body.indexOf("client.navigate("));
  assert.ok(body.indexOf("client.navigate(") < body.indexOf("registration.unregister()"));
});

test("primary host, staging and anything else pass through", async () => {
  for (const u of [
    "https://www.rlgo.net/sw.js",
    "https://www.rlgo.net/",
    "https://cargo.regaplatform.com/",
    "https://rega-cargo-staging.rebar9988.workers.dev/",
    "https://example.com/",
  ]) {
    assert.equal(legacyHostResponse(new Request(u)), null, u);
    assert.equal(legacyHostResponse(new Request(u), { RL_LEGACY_REDIRECT_HOSTS: "" }), null, u);
  }
  const worker = wrapWorker({ fetch: () => new Response("app"), other: 1 });
  assert.equal(worker.other, 1);
  assert.equal(await (await worker.fetch(new Request("https://www.rlgo.net/"))).text(), "app");
  assert.equal((await worker.fetch(new Request(OLD + "/"))).status, 301);
});

test("apex rlgo.net always 301s to www with path + query", () => {
  const res = legacyHostResponse(
    new Request("https://rlgo.net/stores/request?store=zara&intent=buy"),
  );
  assert.equal(res.status, 301);
  assert.equal(
    res.headers.get("location"),
    "https://www.rlgo.net/stores/request?store=zara&intent=buy",
  );
});

test("cargo.regaplatform.com redirects only when listed in RL_LEGACY_REDIRECT_HOSTS", async () => {
  const env = { RL_LEGACY_REDIRECT_HOSTS: " Cargo.RegaPlatform.com , " };
  for (const path of [
    "/",
    "/stores?cat=fashion",
    "/stores?fav=1",
    "/track?code=RL-ABC",
    "/quote",
  ]) {
    const res = legacyHostResponse(new Request("https://cargo.regaplatform.com" + path), env);
    assert.equal(res.status, 301, path);
    assert.equal(res.headers.get("location"), "https://www.rlgo.net" + path);
  }
  const post = legacyHostResponse(
    new Request("https://cargo.regaplatform.com/api/x", { method: "POST", body: "{}" }),
    env,
  );
  assert.equal(post.status, 308);
  const sw = legacyHostResponse(new Request("https://cargo.regaplatform.com/sw.js"), env);
  assert.equal(sw.headers.get("cache-control"), "no-store");
  // The wrapper passes the Worker env through.
  const worker = wrapWorker({ fetch: () => new Response("app") });
  assert.equal(
    (await worker.fetch(new Request("https://cargo.regaplatform.com/"), env)).status,
    301,
  );
  assert.equal(await (await worker.fetch(new Request("https://www.rlgo.net/"), env)).text(), "app");
});

test("the primary host can never be configured to redirect to itself", () => {
  const env = { RL_LEGACY_REDIRECT_HOSTS: "www.rlgo.net,cargo.regaplatform.com" };
  assert.ok(!redirectHosts(env).includes("www.rlgo.net"));
  assert.equal(legacyHostResponse(new Request("https://www.rlgo.net/"), env), null);
});

test("other REGA hosts are never redirected, even if misconfigured", () => {
  const env = {
    RL_LEGACY_REDIRECT_HOSTS:
      "cargo.regaplatform.com,regaplatform.com,www.regaplatform.com,example.com",
  };
  for (const u of ["https://regaplatform.com/", "https://www.regaplatform.com/"]) {
    assert.equal(legacyHostResponse(new Request(u), env), null, u);
  }
});

test("build wrapper: entry re-exports Nitro's module and config routes sw/manifest/offline to the Worker", () => {
  const src = entrySource("index.mjs");
  assert.match(src, /export \* from "\.\/index\.mjs"/);
  assert.match(src, /export default wrapWorker\(inner\)/);
  const cfg = patchConfig({
    main: "index.mjs",
    assets: { binding: "ASSETS", directory: "../public" },
  });
  assert.equal(cfg.main, "legacy-host-entry.mjs");
  assert.equal(cfg.assets.binding, "ASSETS");
  assert.equal(cfg.assets.run_worker_first, true);
});

test("all HTTP variants go directly to canonical HTTPS, preserving encoded paths and queries", () => {
  for (const origin of ["http://rlgo.net", "http://www.rlgo.net", "https://rlgo.net"]) {
    for (const path of [
      "/",
      "/stores/request?store=zara&intent=buy",
      "/assets/app.js?v=a%20b&x=%2F",
      "/sw.js",
      "/a%2Fb?q=%26%3D",
    ]) {
      for (const method of ["GET", "HEAD", "POST", "OPTIONS"]) {
        // Existing HTTPS service-worker installs need an executable recovery
        // worker: redirecting the script would prevent unregistering them.
        if (origin === "https://rlgo.net" && path === "/sw.js") continue;
        const response = legacyHostResponse(new Request(origin + path, { method }));
        assert.equal(response.status, method === "GET" || method === "HEAD" ? 301 : 308);
        assert.equal(response.headers.get("location"), "https://www.rlgo.net" + path);
        assert.equal(
          legacyHostResponse(new Request(response.headers.get("location"), { method })),
          null,
        );
      }
    }
  }
});
