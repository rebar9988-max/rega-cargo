import assert from "node:assert/strict";
import { test } from "node:test";
import { QUOTE_TTL_MS, priceQuote, quoteBookingKey, signQuote, timingSafeEqual, verifyQuote } from "./quote-token.ts";
import { newTrackingId, normalizeTrackingId, publicTrackingId } from "./orders/tracking-id.ts";

const SECRET = "x".repeat(40);
const input = { fromId: "ber", toId: "ebl", mode: "economy", kg: 3.2, l: 40, w: 30, h: 20 };

test("server prices with the unchanged formula", () => {
  const priced = priceQuote(input);
  assert.ok(priced);
  // 40*30*20/5000 = 4.8 kg chargeable; 4.8 * 4.60 = 22.08 ≥ 22 minimum.
  assert.equal(priced.chargeable, 4.8);
  assert.equal(priced.total, 22.08);
});

test("rejects unknown places, modes and out-of-range sizes", () => {
  assert.equal(priceQuote({ ...input, fromId: "xxx" }), null);
  assert.equal(priceQuote({ ...input, mode: "free" }), null);
  assert.equal(priceQuote({ ...input, kg: 0 }), null);
  assert.equal(priceQuote({ ...input, l: 400 }), null);
});

test("signed quote verifies, expires after 30 minutes, and rejects tampering", async () => {
  const priced = priceQuote(input);
  assert.ok(priced);
  const now = 1_700_000_000_000;
  const { token } = await signQuote(priced, SECRET, now);
  assert.equal((await verifyQuote(token, SECRET, now + 1000))?.total, 22.08);
  assert.equal(await verifyQuote(token, SECRET, now + QUOTE_TTL_MS + 1), null);
  assert.equal(await verifyQuote(token, "y".repeat(40), now), null);
  const [body, sig] = token.split(".");
  const forged = JSON.parse(Buffer.from(body, "base64url").toString());
  forged.total = 1;
  const forgedBody = Buffer.from(JSON.stringify(forged)).toString("base64url");
  assert.equal(await verifyQuote(`${forgedBody}.${sig}`, SECRET, now), null);
  assert.equal(await verifyQuote("garbage", SECRET, now), null);
});

test("timingSafeEqual", () => {
  assert.equal(timingSafeEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2])), true);
  assert.equal(timingSafeEqual(new Uint8Array([1, 2]), new Uint8Array([1, 3])), false);
  assert.equal(timingSafeEqual(new Uint8Array([1]), new Uint8Array([1, 2])), false);
});

test("tracking ids are random, well-formed and accepted by the lookup", () => {
  const ids = new Set(Array.from({ length: 500 }, () => newTrackingId()));
  assert.equal(ids.size, 500);
  for (const id of ids) {
    assert.match(id, /^RG-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
    assert.equal(normalizeTrackingId(id.toLowerCase()), id);
  }
  assert.equal(normalizeTrackingId("RG-48291"), "RG-48291");
  assert.equal(normalizeTrackingId("'; drop"), null);
});

test("public tracking lookup refuses short, enumerable legacy codes", () => {
  const id = newTrackingId();
  assert.equal(publicTrackingId(id.toLowerCase()), id);
  assert.equal(publicTrackingId("RG-48291"), null);
  assert.equal(publicTrackingId("RG-ABCD"), null);
  assert.equal(publicTrackingId("RG-ABCD-EFGH"), null);
  assert.equal(publicTrackingId("RG-IIII-OOOO-LLLL"), null);
});

test("a signed quote maps to one stable booking key", async () => {
  const priced = priceQuote(input);
  assert.ok(priced);
  const a = await signQuote(priced, SECRET, 1_000);
  const b = await signQuote(priced, SECRET, 2_000);
  assert.equal(quoteBookingKey(a.token), quoteBookingKey(a.token));
  assert.notEqual(quoteBookingKey(a.token), quoteBookingKey(b.token));
  assert.match(quoteBookingKey(a.token), /^quote:[A-Za-z0-9_-]{43}$/);
});
