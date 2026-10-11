import { test } from "node:test";
import assert from "node:assert/strict";
import { checkImage, MAX_IMAGE_BYTES, readDimensions, sniffKind } from "./image.ts";
import { cleanText, extractModelContent, parseIdentifyOutput } from "./schema.ts";
import { consumeUsage, memoryUsageStore, parseCap, refundUsage, visitorId } from "./usage.ts";
import {
  AI_MODEL,
  handleIdentify,
  handleStatus,
  storeLimiter,
  type AiBinding,
  type IdentifyEnv,
} from "./identify.server.ts";
import { landedEstimate } from "./landed.ts";

// --- tiny synthetic images -------------------------------------------------
function png(w: number, h: number) {
  const b = new Uint8Array(33);
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
  new DataView(b.buffer).setUint32(16, w);
  new DataView(b.buffer).setUint32(20, h);
  return b;
}
function jpeg(w: number, h: number) {
  // SOI, APP0 (len 16), SOF0 (len 17): FF C0 00 11 08 HH HH WW WW ...
  const app0 = [0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 1, 1, 0, 0, 1, 0, 1, 0, 0];
  const sof = [
    0xff,
    0xc0,
    0x00,
    0x11,
    0x08,
    h >> 8,
    h & 255,
    w >> 8,
    w & 255,
    3,
    1,
    0x22,
    0,
    2,
    0x11,
    1,
    3,
    0x11,
    1,
  ];
  return new Uint8Array([0xff, 0xd8, ...app0, ...sof, 0xff, 0xd9]);
}
function webpVp8x(w: number, h: number) {
  const b = new Uint8Array(30);
  b.set([...new TextEncoder().encode("RIFF"), 0, 0, 0, 0, ...new TextEncoder().encode("WEBPVP8X")]);
  const W = w - 1;
  const H = h - 1;
  b.set([W & 255, (W >> 8) & 255, (W >> 16) & 255, H & 255, (H >> 8) & 255, (H >> 16) & 255], 24);
  return b;
}

test("image sniffing ignores declared types and reads real dimensions", () => {
  assert.equal(sniffKind(png(10, 10)), "png");
  assert.equal(sniffKind(jpeg(10, 10)), "jpeg");
  assert.equal(sniffKind(webpVp8x(10, 10)), "webp");
  assert.equal(sniffKind(new TextEncoder().encode("<svg onload=alert(1)>")), null);
  assert.deepEqual(readDimensions(jpeg(800, 600), "jpeg"), { width: 800, height: 600 });
  assert.deepEqual(readDimensions(webpVp8x(1024, 768), "webp"), { width: 1024, height: 768 });
  assert.deepEqual(checkImage(png(640, 480)), {
    ok: true,
    info: { kind: "png", width: 640, height: 480, mime: "image/png" },
  });
});

test("image checks reject oversize, tiny, huge-dimension and non-image payloads", () => {
  assert.deepEqual(checkImage(new Uint8Array(MAX_IMAGE_BYTES + 1)), {
    ok: false,
    error: "too_large",
  });
  assert.deepEqual(checkImage(png(32, 32)), { ok: false, error: "bad_dimensions" });
  assert.deepEqual(checkImage(png(5000, 300)), { ok: false, error: "bad_dimensions" });
  assert.deepEqual(checkImage(new TextEncoder().encode("GIF89a.........")), {
    ok: false,
    error: "unsupported",
  });
});

// --- schema ----------------------------------------------------------------
const good = {
  category: "beauty",
  brand: "Nivea",
  model: "Creme 150 ml",
  visibleText: ["NIVEA", "Creme", "NIVEA"],
  attributes: ["blue tin", "round"],
  confidence: "high",
  counterfeitSignals: ["Possible sign, not proof: logo slightly blurred"],
};

test("valid model JSON is parsed, de-duplicated and kept", () => {
  const out = parseIdentifyOutput(JSON.stringify(good));
  assert.ok(out);
  assert.equal(out.category, "beauty");
  assert.deepEqual(out.visibleText, ["NIVEA", "Creme"]);
  assert.equal(out.confidence, "high");
});

test("model output is treated as untrusted: HTML, links and prices are stripped", () => {
  const out = parseIdentifyOutput({
    ...good,
    brand: "<img src=x onerror=alert(1)>Nivea",
    model: "Buy at https://evil.example/now for €9.99",
    attributes: ["visit www.shop.com", "costs 12,50 EUR", "blue"],
    category: "weapons",
    confidence: "certain",
  });
  assert.ok(out);
  assert.equal(out.brand, "Nivea");
  assert.ok(!/https?:|€|9\.99/.test(out.model ?? ""), out.model ?? "");
  assert.deepEqual(out.attributes, ["visit", "costs", "blue"]);
  assert.equal(out.category, "general");
  assert.equal(out.confidence, "low");
  assert.equal(cleanText("a\u202Eb\u0000c", 10), "a b c");
});

test("formatted prices with localized decimal digits never reach AI result fields", () => {
  for (const text of ["€١٢٣", "١٢٣ EUR", "٢٥٬٠٠٠ IQD", "$۱۲۳٫۴۵", "۱۲۳   TL", "£१२३", "१२३ USD", "€   12.50"]) {
    assert.equal(cleanText(text, 80), "", text);
  }
  const out = parseIdentifyOutput({
    ...good,
    brand: "€١٢٣",
    model: "٢٥٬٠٠٠ IQD",
    visibleText: ["Widget", "۱۲۳ EUR"],
    attributes: ["blue", "$۱۲۳٫۴۵"],
  });
  assert.ok(out);
  assert.equal(out.brand, null);
  assert.equal(out.model, null);
  assert.deepEqual(out.visibleText, ["Widget"]);
  assert.deepEqual(out.attributes, ["blue"]);
  assert.equal(cleanText("Model ۱۲۳ blue", 80), "Model ۱۲۳ blue");
});

test("unusable output is rejected; fenced JSON and both reply shapes are accepted", () => {
  assert.equal(parseIdentifyOutput("I think it's a kettle"), null);
  assert.equal(parseIdentifyOutput({ brand: "x" }), null);
  assert.ok(parseIdentifyOutput("```json\n" + JSON.stringify(good) + "\n```"));
  assert.equal(extractModelContent({ choices: [{ message: { content: "{}" } }] }), "{}");
  assert.equal(extractModelContent({ response: "{}" }), "{}");
});

// --- usage limits ------------------------------------------------------------
test("per-visitor hourly limit and hard daily cap", async () => {
  const store = memoryUsageStore();
  const base = { day: "2026-10-08", hour: "2026-10-08T21", dailyCap: 3, perVisitorHourly: 2 };
  assert.deepEqual(await consumeUsage(store, { ...base, visitor: "a" }), { ok: true, used: 1 });
  assert.deepEqual(await consumeUsage(store, { ...base, visitor: "a" }), { ok: true, used: 2 });
  assert.deepEqual(await consumeUsage(store, { ...base, visitor: "a" }), {
    ok: false,
    reason: "rate_limited",
  });
  assert.deepEqual(await consumeUsage(store, { ...base, visitor: "b" }), { ok: true, used: 3 });
  assert.deepEqual(await consumeUsage(store, { ...base, visitor: "c" }), {
    ok: false,
    reason: "daily_cap",
  });
  assert.deepEqual(
    await consumeUsage(store, { ...base, day: "2026-10-09", hour: "2026-10-09T00", visitor: "c" }),
    {
      ok: true,
      used: 1,
    },
  );
  assert.equal(parseCap("50", 200), 50);
  assert.equal(parseCap("abc", 200), 200);
  assert.equal(parseCap(undefined, 200), 200);
  assert.equal(parseCap("-3", 200), 200);
  const id = await visitorId("203.0.113.9", "2026-10-08");
  assert.match(id, /^[0-9a-f]{24}$/);
  assert.ok(!id.includes("203"));
  assert.notEqual(id, await visitorId("203.0.113.9", "2026-10-09"));
});

// --- endpoint (AI binding mocked) --------------------------------------------
function mockAi(
  reply: unknown,
  calls: Array<{ model: string; input: Record<string, unknown> }> = [],
): AiBinding {
  return {
    async run(model, input) {
      calls.push({ model, input });
      if (reply instanceof Error) throw reply;
      return reply;
    },
  };
}

function upload(opts: { consent?: string; bytes?: Uint8Array; origin?: string } = {}) {
  const form = new FormData();
  if (opts.consent !== undefined) form.set("consent", opts.consent);
  form.set("image", new Blob([new Uint8Array(opts.bytes ?? jpeg(800, 600))], { type: "image/jpeg" }), "p.jpg");
  return new Request("https://rl.test/api/ai/identify", {
    method: "POST",
    body: form,
    headers: { origin: opts.origin ?? "https://rl.test", "cf-connecting-ip": "198.51.100.7" },
  });
}

const on: IdentifyEnv = { RL_AI_ENABLED: "true", RL_AI_DAILY_CAP: "2" };

test("feature flag off (production default) hides the endpoint and status", async () => {
  const res = await handleIdentify(upload({ consent: "1" }), {
    env: { AI: mockAi({}) },
    skipGate: true, usage: storeLimiter(memoryUsageStore()),
  });
  assert.equal(res.status, 404);
  assert.deepEqual(await handleStatus({ RL_AI_ENABLED: "false", AI: mockAi({}) }).json(), {
    enabled: false,
  });
  assert.deepEqual(await handleStatus({ RL_AI_ENABLED: "true", AI: mockAi({}) }).json(), {
    enabled: true,
  });
});

test("consent, origin and image validation happen before any inference", async () => {
  const calls: Array<{ model: string; input: Record<string, unknown> }> = [];
  const deps = { env: { ...on, AI: mockAi({}, calls) }, skipGate: true, usage: storeLimiter(memoryUsageStore()) };
  assert.equal((await handleIdentify(upload({}), deps)).status, 400);
  assert.equal(
    (await handleIdentify(upload({ consent: "1", origin: "https://evil.test" }), deps)).status,
    403,
  );
  assert.equal(
    (
      await handleIdentify(
        upload({ consent: "1", bytes: new TextEncoder().encode("not an image") }),
        deps,
      )
    ).status,
    415,
  );
  assert.equal(
    (await handleIdentify(upload({ consent: "1", bytes: jpeg(20, 20) }), deps)).status,
    415,
  );
  assert.equal(calls.length, 0);
});

test("valid photo → strict JSON result from the mocked model; no prices or links pass through", async () => {
  const calls: Array<{ model: string; input: Record<string, unknown> }> = [];
  const reply = {
    choices: [
      { message: { content: JSON.stringify({ ...good, model: "Creme — only €3.99 at shop.de" }) } },
    ],
  };
  const res = await handleIdentify(upload({ consent: "1" }), {
    env: { ...on, AI: mockAi(reply, calls) },
    skipGate: true, usage: storeLimiter(memoryUsageStore()),
  });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("cache-control"), "no-store");
  const body = (await res.json()) as {
    ok: boolean;
    result: { brand: string; model: string };
    model: string;
  };
  assert.equal(body.ok, true);
  assert.equal(body.model, AI_MODEL);
  assert.equal(body.result.brand, "Nivea");
  assert.ok(!/€|3\.99|shop\.de/.test(body.result.model), body.result.model);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].model, "@cf/google/gemma-4-26b-a4b-it");
  const user = (calls[0].input.messages as Array<{ content: unknown }>)[1].content as Array<{
    type: string;
    image_url?: { url: string };
  }>;
  assert.match(user[1].image_url?.url ?? "", /^data:image\/jpeg;base64,/);
  assert.equal((calls[0].input.response_format as { type: string }).type, "json_schema");
});

test("daily cap, per-visitor limit, timeout and bad output map to clear errors", async () => {
  const usage = storeLimiter(memoryUsageStore());
  const ok = { choices: [{ message: { content: JSON.stringify(good) } }] };
  const deps = { env: { ...on, AI: mockAi(ok) }, skipGate: true, usage };
  assert.equal((await handleIdentify(upload({ consent: "1" }), deps)).status, 200);
  assert.equal((await handleIdentify(upload({ consent: "1" }), deps)).status, 200);
  const capped = await handleIdentify(upload({ consent: "1" }), deps);
  assert.equal(capped.status, 429);
  assert.equal(((await capped.json()) as { error: string }).error, "daily_cap");

  const slow: AiBinding = {
    run: () => new Promise((resolve) => setTimeout(() => resolve(ok), 200)),
  };
  const timedOut = await handleIdentify(upload({ consent: "1" }), {
    env: { ...on, RL_AI_DAILY_CAP: "100", AI: slow },
    skipGate: true, usage: storeLimiter(memoryUsageStore()),
    timeoutMs: 20,
  });
  assert.equal(timedOut.status, 504);

  const garbage = await handleIdentify(upload({ consent: "1" }), {
    env: {
      ...on,
      RL_AI_DAILY_CAP: "100",
      AI: mockAi({ choices: [{ message: { content: "sorry, no JSON" } }] }),
    },
    skipGate: true, usage: storeLimiter(memoryUsageStore()),
  });
  assert.equal(garbage.status, 502);
  assert.equal(((await garbage.json()) as { error: string }).error, "invalid_output");
});

// --- landed cost -------------------------------------------------------------
test("landed-cost estimate = item + corridor shipping + duty estimate", () => {
  const est = landedEstimate({
    priceEur: 150,
    weightKg: 2,
    originId: "ber",
    destId: "ebl",
    contents: "personal",
  });
  assert.ok(est);
  // economy default: 2 kg × 4.6 = 9.2 → minimum 22 €; personal ≤ 200 € → no duty.
  assert.deepEqual(est, {
    itemEur: 150,
    shippingEur: 22,
    dutyEur: 0,
    totalEur: 172,
    totalIqd: 261440,
    chargeableKg: 2,
  });
  const commercial = landedEstimate({
    priceEur: 300,
    weightKg: 10,
    destId: "sul",
    contents: "commercial",
  });
  assert.ok(commercial);
  assert.equal(commercial.dutyEur, 24);
  assert.equal(commercial.shippingEur, 50);
  assert.equal(commercial.totalEur, 374);
  assert.equal(landedEstimate({ priceEur: Number.NaN, weightKg: 1 }), null);
  assert.equal(landedEstimate({ priceEur: 10, weightKg: 0 }), null);
});

test("header flag: on only with RL_AI_ENABLED=true and an AI binding", async () => {
  const { rlAiEnabled } = await import("./flag.ts");
  const g = globalThis as { __env__?: Record<string, unknown> };
  const saved = g.__env__;
  try {
    g.__env__ = { RL_AI_ENABLED: "false", AI: {} };
    assert.equal(rlAiEnabled(), false);
    g.__env__ = { RL_AI_ENABLED: "true" };
    assert.equal(rlAiEnabled(), false);
    g.__env__ = { RL_AI_ENABLED: "true", AI: {} };
    assert.equal(rlAiEnabled(), true);
  } finally {
    g.__env__ = saved;
  }
});

test("rate-limit key: IPv4 as is, IPv6 grouped by /64", async () => {
  const { ipKey } = await import("./usage.ts");
  assert.equal(ipKey("203.0.113.7"), "203.0.113.7");
  assert.equal(ipKey("2a09:bac5:27b0:db9::15e:ed"), "2a09:bac5:27b0:db9::/64");
  assert.equal(ipKey("2a09:bac5:27b0:0db9:1:2:3:4"), "2a09:bac5:27b0:db9::/64");
  assert.equal(ipKey("2001:db8::1"), "2001:db8:0:0::/64");
  assert.equal(ipKey("::1"), "0:0:0:0::/64");
  assert.equal(ipKey("2001:DB8:0:0:ffff::"), "2001:db8:0:0::/64");
});

test("per-visitor daily limit, reserved share for new visitors, and refund", async () => {
  const store = memoryUsageStore();
  const base = { day: "2026-10-08", hour: "2026-10-08T21", dailyCap: 100, perVisitorHourly: 10, perVisitorDaily: 5, reserve: 20 };
  for (let i = 0; i < 5; i++) assert.equal((await consumeUsage(store, { ...base, visitor: "a" })).ok, true);
  assert.equal((await consumeUsage(store, { ...base, visitor: "a" })).ok, false);
  const near = memoryUsageStore();
  near.data.set("day:2026-10-08", 80);
  near.data.set("ipday:2026-10-08:old", 1);
  assert.equal((await consumeUsage(near, { ...base, visitor: "old" })).ok, false);
  near.data.set("ipday:2026-10-08:new", 0);
  assert.equal((await consumeUsage(near, { ...base, visitor: "fresh" })).ok, true);
  await refundUsage(near, { day: "2026-10-08", hour: "2026-10-08T21", visitor: "fresh" });
  assert.equal(near.data.get("day:2026-10-08"), 80);
});

test("per-IP burst limit answers 429 before the body is read; oversized upload is 413", async () => {
  const calls: Array<{ model: string; input: Record<string, unknown> }> = [];
  let n = 0;
  const deps = {
    env: { ...on, AI: mockAi({}, calls) },
    skipGate: true,
    usage: storeLimiter(memoryUsageStore()),
    limit: async () => ++n <= 1,
  };
  assert.equal((await handleIdentify(upload({ consent: "1", bytes: new TextEncoder().encode("x") }), deps)).status, 415);
  assert.equal((await handleIdentify(upload({ consent: "1" }), deps)).status, 429);
  const big = new Uint8Array(MAX_IMAGE_BYTES + 100_000);
  big.set([0xff, 0xd8, 0xff]);
  assert.equal((await handleIdentify(upload({ consent: "1", bytes: big }), { ...deps, limit: undefined })).status, 413);
  assert.equal(calls.length, 0);
});

test("AI text never names a shop, a price or a link", () => {
  assert.equal(cleanText("Nike Air from Amazon, €49.99, see zalando.de", 80), "Nike Air from , see");
  assert.equal(cleanText("eBay seller says 20 EUR", 80), "seller says");
  assert.equal(cleanText("Admiral cream", 80), "Admiral cream");
});

test("failed provider attempts remain bounded after visitor refunds", async (t) => {
  for (const failure of ["model_error", "timeout", "invalid_output"] as const) {
    await t.test(failure, async () => {
      const store = memoryUsageStore();
      let calls = 0;
      const deps = {
        env: {
          ...on,
          AI: {
            async run() {
              calls += 1;
              if (failure === "model_error") throw new Error("provider failed");
              if (failure === "timeout") return new Promise(() => {});
              return { response: "not JSON" };
            },
          },
        },
        skipGate: true,
        usage: storeLimiter(store),
        timeoutMs: 5,
        now: () => new Date("2026-10-11T12:00:00Z"),
      };
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const response = await handleIdentify(upload({ consent: "1" }), deps);
        assert.equal(response.status, failure === "timeout" ? 504 : 502);
        assert.equal((await response.json()).error, failure);
      }
      // Refunds still restore the visitor's allowance, but cannot undo provider work.
      assert.equal(store.data.get("day:2026-10-11"), 0);
      const capped = await handleIdentify(upload({ consent: "1" }), deps);
      assert.equal(capped.status, 429);
      assert.equal((await capped.json()).error, "daily_cap");
      assert.equal(calls, 2);
    });
  }
});

test("attempt budget carries existing usage forward and resets on the next UTC day", async () => {
  const store = memoryUsageStore();
  const input = { day: "2026-10-11", hour: "2026-10-11T23", visitor: "a", dailyCap: 2, perVisitorHourly: 10 };
  store.data.set("day:2026-10-11", 1);
  assert.equal((await consumeUsage(store, input)).ok, true);
  await refundUsage(store, input);
  assert.deepEqual(await consumeUsage(store, input), { ok: false, reason: "daily_cap" });
  assert.equal((await consumeUsage(store, { ...input, day: "2026-10-12", hour: "2026-10-12T00" })).ok, true);
});

test("malformed provider envelopes produce invalid_output instead of throwing", async () => {
  for (const reply of [
    { choices: [{ message: 42 }] },
    { choices: [{ message: "content" }] },
    { choices: [null] },
    { choices: "not an array" },
    { response: null },
  ]) {
    const response = await handleIdentify(upload({ consent: "1" }), {
      env: { ...on, AI: mockAi(reply) }, skipGate: true, usage: storeLimiter(memoryUsageStore()),
    });
    assert.equal(response.status, 502);
    assert.equal((await response.json()).error, "invalid_output");
  }
  assert.equal(extractModelContent({ choices: [{ message: 42 }], response: "{}" }), "{}");
});

test("a refund outage keeps the original classified provider failure", async () => {
  const response = await handleIdentify(upload({ consent: "1" }), {
    env: { ...on, AI: mockAi(new Error("provider secret must not appear")) },
    skipGate: true,
    usage: {
      async consume() { return { ok: true, used: 1 }; },
      async refund() { throw new Error("storage secret must not appear"); },
    },
  });
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { ok: false, error: "model_error" });
});

test("origin validation includes the protocol and port before inference", async () => {
  const calls: Array<{ model: string; input: Record<string, unknown> }> = [];
  const deps = { env: { ...on, AI: mockAi({ response: JSON.stringify(good) }, calls) }, skipGate: true, usage: storeLimiter(memoryUsageStore()) };
  for (const origin of ["http://rl.test", "https://rl.test:444", "null"]) {
    assert.equal((await handleIdentify(upload({ consent: "1", origin }), deps)).status, 403);
  }
  assert.equal(calls.length, 0);
  assert.equal((await handleIdentify(upload({ consent: "1", origin: "https://rl.test:443" }), deps)).status, 200);
});

test("unavailable AI or usage storage fails before any provider invocation", async () => {
  const calls: Array<{ model: string; input: Record<string, unknown> }> = [];
  const ai = mockAi({ response: JSON.stringify(good) }, calls);
  for (const deps of [
    { env: { ...on, AI: ai }, skipGate: true },
    { env: on, usage: storeLimiter(memoryUsageStore()), skipGate: true },
    { env: { ...on, AI: ai }, skipGate: true, usage: { async consume(): Promise<never> { throw new Error("private storage diagnostics"); } } },
  ]) {
    const response = await handleIdentify(upload({ consent: "1" }), deps);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { ok: false, error: "unavailable" });
  }
  assert.equal(calls.length, 0);
});

test("prohibited model results never expose a product, price or recommendation", async () => {
  const response = await handleIdentify(upload({ consent: "1" }), {
    env: { ...on, AI: mockAi({ response: JSON.stringify({ ...good, model: "Vape pod", visibleText: ["Nicotine"], attributes: ["Buy now at https://evil.test for €20"] }) }) },
    skipGate: true, usage: storeLimiter(memoryUsageStore()),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: false, error: "no_result" });
});
