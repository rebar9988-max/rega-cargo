import { test } from "node:test";
import assert from "node:assert/strict";
import { splitLeadIns } from "./lead-in.ts";

test("label list with trailing sentences", () => {
  const r = splitLeadIns("Language: rl-lang-v4. Bazaar/Delivery choice: rl-service-v1 (also a cookie, so the page opens the same way). Recent searches: rl-recent-v1. An offline copy of the app (service worker). These stay in your browser.");
  assert.deepEqual(r.items.map((i) => i.label), ["Language", "Bazaar/Delivery choice", "Recent searches"]);
  assert.equal(r.items[1].text, "rl-service-v1 (also a cookie, so the page opens the same way).");
  assert.equal(r.rest, "An offline copy of the app (service worker). These stay in your browser.");
  assert.equal(r.lead, "");
});

test("sorani labels", () => {
  const r = splitLeadIns("زمان: rl-lang-v4. فرۆشگا دڵخوازەکان: rl-favs-v1. ئەمانە لە وێبگەڕەکەتدا دەمێننەوە.");
  assert.deepEqual(r.items.map((i) => i.label), ["زمان", "فرۆشگا دڵخوازەکان"]);
  assert.equal(r.rest, "ئەمانە لە وێبگەڕەکەتدا دەمێننەوە.");
});

test("single lead-in", () => {
  const r = splitLeadIns("گومرگ: لەناو نرخەکەدا نییە، پێش وەرگرتنی بارەکە پشتڕاست دەکرێتەوە");
  assert.equal(r.items.length, 1);
  assert.equal(r.items[0].label, "گومرگ");
});

test("ordinary sentences with a long pre-colon stay plain", () => {
  const line = "A request from the shop-request form stores only: the shop, the product link.";
  const r = splitLeadIns(line);
  assert.equal(r.items.length, 0);
  assert.equal(r.lead, line);
});

test("label after a lead sentence", () => {
  const r = splitLeadIns("R&L, [company name and address — pending]. Contact: 2233rega@gmail.com.");
  assert.equal(r.lead, "R&L, [company name and address — pending].");
  assert.deepEqual(r.items, [{ label: "Contact", text: "2233rega@gmail.com." }]);
});
