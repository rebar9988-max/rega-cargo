import { test } from "node:test";
import assert from "node:assert/strict";
import { editDistance, fold, foldWithMap } from "./normalize.ts";
import { markRange, suggest } from "./index.ts";

test("folding unifies Arabic, Persian and Kurdish letters, diacritics and Latin case", () => {
  assert.equal(fold("كريم"), fold("کرێم"));
  assert.equal(fold("نيفيا"), fold("نیڤیا"));
  assert.equal(fold("ەمە"), fold("همه"));
  assert.equal(fold("مُحَمَّد"), fold("محمد"));
  assert.equal(fold("Crème"), "creme");
  assert.equal(fold("KÉRASTASE"), "kerastase");
  assert.equal(fold("Fußball"), "fussball");
  assert.equal(fold("ئەمازۆن"), fold("امازون"));
  assert.equal(fold("هدفون بی‌سیم"), "هدفون بی سیم");
  assert.equal(fold("٣٫٢"), "3 2");
});

test("the fold map points back at original characters", () => {
  const { text, map } = foldWithMap("Crème X");
  assert.equal(text, "creme x");
  assert.equal(map.length, text.length);
  assert.equal(map[text.indexOf("x")], 6);
});

test("edit distance stops early past the budget", () => {
  assert.equal(editDistance("zalnado", "zalando", 2), 1);
  assert.equal(editDistance("abc", "xyz123", 1), 2);
});

const ids = (hits: { id: string }[]) => hits.map((hit) => hit.id);

test("brands match across scripts", () => {
  for (const q of ["nivea", "NIVEA", "نیڤیا", "نيفيا", "niv"]) {
    assert.ok(ids(suggest(q, "ckb").brands).includes("NIVEA"), q);
  }
  assert.ok(ids(suggest("loreal", "en").brands).includes("L'ORÉAL"));
});

test("items match by any language name or synonym", () => {
  for (const q of ["creme", "cream", "کرێم", "كريم", "krem", "Gesichtscreme"]) {
    assert.ok(ids(suggest(q, "ckb").items).includes("cream"), q);
  }
  for (const q of ["پێڵاو", "پیلاو", "sneaker", "schuhe", "کفش", "ayakkabı"]) {
    assert.ok(ids(suggest(q, "en").items).includes("sneakers"), q);
  }
});

test("stores and categories match, with small typos tolerated", () => {
  assert.equal(suggest("zalnado", "en").stores[0]?.id, "zalando");
  assert.equal(suggest("amazn", "en").stores[0]?.id, "amazon-de");
  assert.equal(suggest("ئەمازۆن", "ckb").stores[0]?.id, "amazon-de");
  assert.ok(ids(suggest("parfum", "de").items).includes("perfume"));
  assert.ok(ids(suggest("جلوبەرگ", "ckb").categories).includes("fashion"));
  assert.ok(ids(suggest("elektronik", "tr").categories).includes("electronics"));
  assert.ok(ids(suggest("kids", "en").categories).includes("baby"));
});

test("labels follow the app language and highlight only what is shown", () => {
  const hit = suggest("کرێم", "ckb").items.find((item) => item.id === "cream");
  assert.equal(hit?.label, "کرێمی دەموچاو");
  assert.deepEqual(hit?.mark, [0, 4]);
  const en = suggest("کرێم", "en").items.find((item) => item.id === "cream");
  assert.equal(en?.label, "Face cream");
  assert.equal(en?.mark, null);
  assert.deepEqual(markRange("Zalando", "zal"), [0, 3]);
  assert.deepEqual(markRange("Face cream", "cre"), [5, 8]);
});

test("idealo gets German terms for Arabic-script queries and Latin text as typed", () => {
  assert.equal(suggest("پێڵاو", "ckb").idealoTerm, "Sneaker");
  assert.equal(suggest("نیڤیا", "ckb").idealoTerm, "NIVEA");
  assert.equal(suggest("nivea creme", "en").idealoTerm, "nivea creme");
  assert.equal(suggest("کاڵایەکی نەناسراو", "ckb").idealoTerm, "کاڵایەکی نەناسراو");
});

test("nothing matches nonsense and empty input", () => {
  const none = suggest("qqqqzzzz", "en");
  assert.equal(none.stores.length + none.brands.length + none.categories.length + none.items.length, 0);
  assert.equal(suggest("   ", "en").stores.length, 0);
});

test("destinations are the existing pages or idealo search", () => {
  const s = suggest("zalando", "en").stores[0];
  assert.deepEqual(s.dest, { type: "route", to: "/stores", search: { q: "Zalando" } });
  const c = suggest("sport", "en").categories[0];
  assert.deepEqual(c.dest, { type: "route", to: "/stores", search: { cat: "sports" } });
  const i = suggest("kettle", "en").items[0];
  assert.equal(i.dest.type === "external" && i.dest.href, "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=Wasserkocher");
});

test("a brand match also offers its category", () => {
  const result = suggest("nivea", "en");
  assert.equal(result.brands[0]?.label, "NIVEA");
  assert.equal(result.categories[0]?.id, "beauty");
  assert.deepEqual(result.categories[0]?.dest, { type: "route", to: "/stores", search: { cat: "beauty" } });
});
