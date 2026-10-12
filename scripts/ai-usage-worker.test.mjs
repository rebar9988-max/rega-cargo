import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

// Resolve from Wrangler itself: an unrelated root Miniflare copy may be older
// than the runtime actually used by the locked deployment toolchain.
const wranglerRequire = createRequire(import.meta.resolve("wrangler/package.json"));
const { build } = wranglerRequire("esbuild");
const { Miniflare, convertV4MiniflareOptions } = wranglerRequire("miniflare");

// Exercise the production Durable Object in workerd, using existing Wrangler tooling.
// This harness has no AI binding, remote resources, credentials or persistent database.
test("AI usage Durable Object keeps budgets across refunds, concurrency and UTC rollover", async (t) => {
  const bundle = await build({
    stdin: {
      contents: `
        export { RlAiUsage } from "./exports.cloudflare.ts";
        export default {
          async fetch(request, env) {
            const { operation, input } = await request.json();
            const stub = env.RL_AI_USAGE.get(env.RL_AI_USAGE.idFromName("global"));
            const result = operation === "consume" ? await stub.consume(input)
              : operation === "refund" ? await stub.refund(input)
              : operation === "issue" ? await stub.issue(input.now)
              : await stub.verify(input.token, input.now);
            return Response.json(result ?? null);
          }
        };`,
      resolveDir: process.cwd(),
    },
    bundle: true,
    format: "esm",
    platform: "node",
    external: ["cloudflare:workers"],
    write: false,
  });
  const mf = new Miniflare(convertV4MiniflareOptions({
    modules: true,
    script: bundle.outputFiles[0].text,
    compatibilityDate: "2025-09-15",
    compatibilityFlags: ["nodejs_compat"],
    durableObjects: { RL_AI_USAGE: { className: "RlAiUsage", useSQLite: true } },
  }));
  const input = (day, visitor = "a", cap = 2) => ({
    day, hour: `${day}T23`, visitor, dailyCap: cap, perVisitorHourly: 20,
  });
  const call = async (operation, input) => {
    const response = await mf.dispatchFetch("https://rl.test/", {
      method: "POST", body: JSON.stringify({ operation, input }),
    });
    assert.equal(response.status, 200);
    return response.json();
  };
  try {
    await t.test("refunds cannot reopen the global attempt budget", async () => {
      const data = input("2026-10-11");
      for (let i = 0; i < 2; i += 1) {
        assert.equal((await call("consume", data)).ok, true);
        await call("refund", data);
      }
      assert.deepEqual(await call("consume", data), { ok: false, reason: "daily_cap" });
    });
    await t.test("a late refund cannot erase the new day's budget or its signing key", async () => {
      const now = Date.parse("2026-10-12T00:00:00Z");
      const token = await call("issue", { now });
      assert.equal((await call("consume", input("2026-10-12", "new", 1))).ok, true);
      await call("refund", input("2026-10-11"));
      assert.equal(await call("verify", { token, now }), true);
      assert.deepEqual(await call("consume", input("2026-10-12", "new", 1)), { ok: false, reason: "daily_cap" });
    });
    await t.test("a delayed consume cannot roll the day backwards", async () => {
      assert.equal((await call("consume", input("2026-10-13", "new", 1))).ok, true);
      assert.deepEqual(await call("consume", input("2026-10-12", "old", 1)), { ok: false, reason: "daily_cap" });
      assert.deepEqual(await call("consume", input("2026-10-13", "new", 1)), { ok: false, reason: "daily_cap" });
    });
    await t.test("concurrent callers cannot exceed the cap", async () => {
      const results = await Promise.all(Array.from({ length: 20 }, (_, i) => call("consume", input("2026-10-14", `visitor-${i}`, 3))));
      assert.equal(results.filter((r) => r.ok).length, 3);
      assert.equal(results.filter((r) => r.reason === "daily_cap").length, 17);
    });
  } finally {
    await mf.dispose();
  }
});

test("the actual AI challenge route preserves modes and classifies binding outages", async (t) => {
  const bundle = await build({
    stdin: {
      contents: `
        import challenge from "./server/routes/api/ai/challenge.ts";
        import identify from "./server/routes/api/ai/identify.ts";
        export default {
          async fetch(request) {
            const scenario = new URL(request.url).searchParams.get("scenario");
            globalThis.__env__ = {
              TURNSTILE_SECRET: scenario === "turnstile" ? "test-only-secret" : "",
              TURNSTILE_SITE_KEY: scenario === "turnstile" ? "test-only-site-key" : "",
              RL_AI_USAGE: {
                idFromName() { return "global"; },
                get() {
                  if (scenario === "namespace" || scenario === "identify-namespace")
                    throw new Error("private namespace diagnostics");
                  return {
                    async consume() { throw new Error("challenge must not charge usage"); },
                    async verify() { return false; },
                    async issue() {
                      if (scenario === "issue") throw new Error("private issuance diagnostics");
                      return "test-only-token";
                    },
                  };
                },
              },
            };
            if (scenario === "identify-namespace")
              return identify({ req: new Request("https://rl.test/api/ai/identify", { method: "POST" }) });
            return challenge();
          },
        };`,
      resolveDir: process.cwd(),
    },
    bundle: true,
    format: "esm",
    platform: "node",
    external: ["cloudflare:workers", "node:crypto"],
    write: false,
  });
  const mf = new Miniflare(convertV4MiniflareOptions({
    modules: true,
    script: bundle.outputFiles[0].text,
    compatibilityDate: "2025-09-15",
    compatibilityFlags: ["nodejs_compat"],
  }));
  const call = (scenario) => mf.dispatchFetch(`https://rl.test/api/ai/challenge?scenario=${scenario}`);
  try {
    await t.test("issuance and namespace outages return a private no-store unavailable response", async () => {
      const responses = [];
      for (const scenario of ["issue", "namespace"]) {
        responses.push(await call(scenario));
      }
      assert.deepEqual(responses.map((response) => response.status), [503, 503]);
      for (const response of responses) {
        assert.equal(response.headers.get("cache-control"), "no-store");
        assert.deepEqual(await response.json(), { mode: "unavailable" });
      }
    });
    await t.test("successful issuance preserves the token contract without caching it", async () => {
      const response = await call("token");
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.deepEqual(await response.json(), { mode: "token", token: "test-only-token" });
    });
    await t.test("Turnstile retains precedence and its existing contract", async () => {
      const response = await call("turnstile");
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.deepEqual(await response.json(), { mode: "turnstile", siteKey: "test-only-site-key" });
    });
    await t.test("identify namespace failure returns unavailable without constructing a gateway", async () => {
      const response = await call("identify-namespace");
      assert.equal(response.status, 503);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.deepEqual(await response.json(), { ok: false, error: "unavailable" });
    });
  } finally {
    await mf.dispose();
  }
});
