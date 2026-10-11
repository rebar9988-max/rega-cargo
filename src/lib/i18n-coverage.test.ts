import { test } from "node:test";
import assert from "node:assert/strict";
import { LANGS } from "./langs.ts";
import { SEO_MESSAGES } from "./seo-messages.ts";
import { productLinkCopy } from "./product-link/copy.ts";
import { redesignCopy } from "./redesign-copy.ts";
import { storeCopy } from "./store-copy.ts";
import { catalogueCopy } from "./catalogue-copy.ts";

const ids = LANGS.map((l) => l.id);
const others = ids.filter((id) => id !== "en");

test("every language has the same SEO pages, with non-empty title and description", () => {
  const paths = Object.keys(SEO_MESSAGES.en);
  for (const id of ids) {
    assert.deepEqual(Object.keys(SEO_MESSAGES[id]).sort(), [...paths].sort(), `${id}: page list`);
    for (const path of paths) {
      const m = SEO_MESSAGES[id][path];
      assert.ok(m.title.trim() && m.description.trim(), `${id} ${path}: empty`);
    }
  }
});

test("SEO descriptions are translated: no language repeats the English sentence", () => {
  for (const id of others)
    for (const [path, m] of Object.entries(SEO_MESSAGES[id]))
      assert.notEqual(
        m.description,
        SEO_MESSAGES.en[path].description,
        `${id} ${path} description is still English`,
      );
});

test("product-link copy is complete and translated in all seven languages", () => {
  const en = productLinkCopy("en");
  const keys = Object.keys(en).sort();
  const errorKeys = Object.keys(en.errors).sort();
  for (const id of ids) {
    const c = productLinkCopy(id);
    assert.deepEqual(Object.keys(c).sort(), keys, `${id}: keys`);
    assert.deepEqual(Object.keys(c.errors).sort(), errorKeys, `${id}: error keys`);
    for (const [k, v] of Object.entries(c))
      if (typeof v === "string") assert.ok(v.trim(), `${id}.${k} empty`);
    for (const [k, v] of Object.entries(c.errors)) assert.ok(v.trim(), `${id}.errors.${k} empty`);
  }
  for (const id of others) {
    const c = productLinkCopy(id);
    assert.notEqual(c.lede, en.lede, `${id}: lede is still English`);
    assert.notEqual(c.disclaimer, en.disclaimer, `${id}: disclaimer is still English`);
    // Hard rule 2: the not-an-official-partner note must stay visible in every language.
    assert.match(c.disclaimer, /R&L/, `${id}: disclaimer names R&L`);
  }
});

const leaves = (o: unknown, p = ""): [string, string][] =>
  Array.isArray(o)
    ? o.flatMap((v, i) => leaves(v, `${p}[${i}]`))
    : o && typeof o === "object"
      ? Object.entries(o).flatMap(([k, v]) => leaves(v, `${p}.${k}`))
      : typeof o === "string"
        ? [[p, o]]
        : [];

test("redesign copy (header, footer, home, marketplace) is complete in all seven languages", () => {
  const en = leaves(redesignCopy("en"));
  const enKeys = en.map(([k]) => k);
  for (const id of others) {
    const c = leaves(redesignCopy(id));
    assert.deepEqual(
      c.map(([k]) => k),
      enKeys,
      `${id}: same keys and list lengths as English`,
    );
    for (const [k, v] of c) assert.ok(v.trim(), `${id}${k} is empty`);
    // Hero titles are authored on fixed lines; the line count must match.
    for (const key of ["heroTitle", "heroShippingTitle"] as const)
      assert.equal(
        redesignCopy(id)[key].split("\n").length,
        redesignCopy("en")[key].split("\n").length,
        `${id}.${key} lines`,
      );
  }
});

test("redesign copy has no English left in ku, de, fa and tr", () => {
  const en = new Map(leaves(redesignCopy("en")));
  // Words that are the same in these languages or are symbols/brands.
  const shared = new Set([".designTitle", ".announcement"]);
  for (const id of ["ku", "de", "fa", "tr"] as const)
    for (const [k, v] of leaves(redesignCopy(id)))
      if (!shared.has(k) && /[A-Za-z]{4,}/.test(en.get(k) ?? "") && v === en.get(k))
        assert.fail(`${id}${k} is still English: ${v}`);
});

test("the not-an-official-partner note stays in every language (hard rule 2)", () => {
  for (const id of ids) assert.match(redesignCopy(id).noPartner, /R&L/, `${id}.noPartner`);
});

test("store and catalogue copy are translated in every language", () => {
  const en = new Map(leaves(storeCopy("en")));
  const enCat = new Map(leaves(catalogueCopy("en")));
  // Words that are the same in these languages (loanwords).
  const sharedCat: Record<string, string[]> = {
    de: [
      ".subs.electronics.smartphones",
      ".subs.electronics.tablets",
      ".subs.sports.fitness",
      ".subs.sports.camping",
      ".subs.food.snacks",
    ],
    tr: [".subs.sports.fitness"],
  };
  for (const id of others) {
    const store = leaves(storeCopy(id));
    assert.deepEqual(
      store.map(([k]) => k),
      [...en.keys()],
      `${id}: store keys`,
    );
    for (const [k, v] of store)
      if (/[A-Za-z]{4,}/.test(en.get(k) ?? "") && v === en.get(k) && !/^[A-Z0-9 .&\-+/@]+$/.test(v))
        assert.fail(`${id} store${k} is still English: ${v}`);
    const cat = leaves(catalogueCopy(id));
    assert.deepEqual(
      cat.map(([k]) => k),
      [...enCat.keys()],
      `${id}: catalogue keys`,
    );
    for (const [k, v] of cat)
      if (
        /[A-Za-z]{4,}/.test(enCat.get(k) ?? "") &&
        v === enCat.get(k) &&
        !(sharedCat[id] ?? []).includes(k)
      )
        assert.fail(`${id} catalogue${k} is still English: ${v}`);
  }
});

test("the not-an-official-partner badge on store cards names R&L in every language (hard rule 2)", () => {
  for (const id of ids) assert.match(storeCopy(id).notPartner, /R&L/, `${id}.notPartner`);
});
