import { test } from "node:test";
import assert from "node:assert/strict";
import { suggest, screen, ITEM_IDEALO } from "../search/index.ts";
import { SEARCH_BRANDS, idealoSearchUrl } from "../catalog.ts";
import { GOODS, STORES } from "../stores.ts";
import { LANGS } from "../langs.ts";
import { storeCopy } from "../store-copy.ts";
import { checkText, findMatches } from "./check.ts";
import { isProhibitedAiResult } from "../ai/identify.server.ts";

const PROHIBITED_QUERIES = [
  "vodka",
  "جگەرە",
  "sigara",
  "خمر",
  "Vodka Absolut",
  "الخمر",
  "cheap beer",
  "ویسکی",
  "Zigaretten",
];

test("a prohibited query gives no hits, no correction, no idealo row (every language)", () => {
  for (const q of PROHIBITED_QUERIES) {
    for (const { id } of LANGS) {
      const r = suggest(q, id);
      assert.equal(r.blocked, true, q);
      assert.equal(r.stores.length + r.brands.length + r.categories.length + r.items.length, 0, q);
      assert.equal(r.idealoTerm, "", q);
    }
  }
});

test("normal queries still work: nivea, ginger, dm, rossmann, douglas", () => {
  const nivea = suggest("nivea", "en");
  assert.ok(!nivea.blocked);
  assert.ok(nivea.brands.some((b) => b.id.toLowerCase() === "nivea"));
  assert.ok(idealoSearchUrl(nivea.idealoTerm));
  const ginger = suggest("ginger", "en");
  assert.ok(!ginger.blocked);
  assert.equal(ginger.idealoTerm, "ginger");
  for (const store of ["dm", "rossmann", "douglas"])
    assert.ok(
      suggest(store, "en").stores.some((s) => s.id === store),
      store,
    );
});

test("idealo links are never made for a prohibited term", () => {
  for (const q of PROHIBITED_QUERIES) assert.equal(idealoSearchUrl(q), null, q);
  assert.equal(idealoSearchUrl(""), null);
  assert.match(idealoSearchUrl("NIVEA") ?? "", /^https:\/\/www\.idealo\.de\//);
});

test("bundled catalogue (stores, brands, goods, idealo terms) has nothing prohibited", () => {
  const names: string[] = [
    ...STORES.flatMap((s) => [s.name, s.host]),
    ...SEARCH_BRANDS.map((b) => b.name),
    ...Object.values(ITEM_IDEALO),
    ...LANGS.flatMap(({ id }) => GOODS.map((g) => storeCopy(id).goods[g.id])),
  ];
  const bad = names.filter((n) => checkText(n).decision !== "allow");
  assert.deepEqual(bad, []);
});

test("the index screen drops prohibited entries and synonyms", () => {
  const entry = (id: string, terms: string[]) => ({
    kind: "brand",
    id,
    terms,
    label: () => id,
    dest: { type: "external", href: idealoSearchUrl(id) ?? "" },
    idealo: id,
  });
  const out = screen([
    entry("Smirnoff Vodka", ["smirnoff"]),
    entry("Nivea", ["nivea", "beer shampoo"]),
  ] as never);
  assert.equal(out.length, 1);
  assert.deepEqual((out[0] as { terms: string[] }).terms, ["nivea"]);
  // nothing in the live index carries a prohibited word
  for (const q of ["nivea", "dm", "shoes", "phone"]) {
    for (const hit of [...suggest(q, "en").brands, ...suggest(q, "en").items])
      assert.equal(findMatches(hit.label).length, 0);
  }
});

test("AI: a prohibited product returns no result; perfume 'Alcohol Denat.' does not", () => {
  const base = {
    category: "other",
    brand: null,
    model: null,
    visibleText: [],
    attributes: [],
    confidence: "high",
    counterfeitSignals: [],
  };
  assert.ok(
    isProhibitedAiResult({ ...base, brand: "Absolut", visibleText: ["VODKA", "40% vol"] } as never),
  );
  assert.ok(isProhibitedAiResult({ ...base, visibleText: ["Marlboro", "cigarettes"] } as never));
  assert.ok(
    !isProhibitedAiResult({
      ...base,
      brand: "Chanel",
      visibleText: ["Eau de parfum", "Alcohol Denat."],
    } as never),
  );
  assert.ok(!isProhibitedAiResult({ ...base, brand: "NIVEA", visibleText: ["Creme"] } as never));
});
