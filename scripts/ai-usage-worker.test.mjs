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
