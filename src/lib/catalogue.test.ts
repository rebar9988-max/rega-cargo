import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PRIMARY_CATEGORIES,
  PUBLISHED_STORE_CATEGORIES,
  SUBCATEGORIES,
  findSubcategory,
  isPublishedCategory,
  publishedSubcategories,
  subcategorySearchUrl,
} from "./catalogue.ts";
import { catalogueCopy } from "./catalogue-copy.ts";
import { selectBazaar } from "./bazaar-listing.ts";
import { validateBazaarSearch } from "./bazaar-search.ts";
import { isProhibitedQuery } from "./compliance/check.ts";
import { suggest } from "./search/index.ts";
import { LANGS } from "./langs.ts";
import { STORES, STORE_CATEGORIES } from "./stores.ts";
import { storeCopy } from "./store-copy.ts";

const labels = storeCopy("en").goods;
const BANNED = ["vodka", "cigarettes", "vape", "pork bacon", "wine", "جگەرە", "خمر"];

test("ten primary categories, no duplicates, original six slugs kept", () => {
  assert.equal(PRIMARY_CATEGORIES.length, 10);
  assert.equal(new Set(PRIMARY_CATEGORIES).size, 10);
  for (const old of ["beauty", "fashion", "electronics", "home", "baby", "sports"]) {
    assert.ok((PRIMARY_CATEGORIES as readonly string[]).includes(old), old);
  }
  assert.equal(new Set(STORE_CATEGORIES).size, STORE_CATEGORIES.length);
});

test("every category and subcategory has a label in every language", () => {
  for (const { id: lang } of LANGS) {
    const copy = catalogueCopy(lang);
    const names = storeCopy(lang).categories;
    for (const cat of PRIMARY_CATEGORIES) {
      assert.ok(names[cat]?.trim(), `${lang} ${cat}`);
      for (const sub of SUBCATEGORIES[cat])
        assert.ok(copy.subs[cat][sub.id]?.trim(), `${lang} ${cat}/${sub.id}`);
    }
  }
});

test("subcategory ids are unique within a category and never tobacco, vape or alcohol terms", () => {
  for (const cat of PRIMARY_CATEGORIES) {
    const ids = SUBCATEGORIES[cat].map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, cat);
    for (const sub of SUBCATEGORIES[cat]) {
      if (sub.idealo) assert.equal(isProhibitedQuery(sub.idealo), false, sub.idealo);
      for (const { id: lang } of LANGS)
        assert.equal(isProhibitedQuery(catalogueCopy(lang).subs[cat][sub.id]), false);
    }
  }
});

test("food awaits owner approval: not published, no stores or goods, no search row", () => {
  assert.equal(isPublishedCategory("food"), false);
  assert.ok(!PUBLISHED_STORE_CATEGORIES.includes("food"));
  const direct = selectBazaar({ params: { cat: "food" }, favs: [], labels });
  assert.deepEqual([direct.goods.length, direct.stores.length], [0, 0]);
  for (const { id: lang } of LANGS) {
    assert.ok(!suggest("food", lang).categories.some((c) => c.id === "food"), lang);
  }
  assert.equal(publishedSubcategories("food").length, 0);
  assert.equal(findSubcategory("food", "pantry"), undefined);
  // Regulated subcategories of otherwise published groups are held back too.
  assert.equal(findSubcategory("pets", "food"), undefined);
  assert.equal(findSubcategory("beauty", "health"), undefined);
  assert.equal(subcategorySearchUrl({ id: "x", idealo: null }), null);
});

test("published categories list stores that cover them, and every store category is known", () => {
  for (const store of STORES)
    for (const c of store.categories) assert.ok(STORE_CATEGORIES.includes(c), `${store.id} ${c}`);
  for (const cat of ["electronics", "gaming", "auto", "pets"] as const) {
    assert.ok(selectBazaar({ params: { cat }, favs: [], labels }).stores.length > 0, cat);
  }
});

test("banned products never appear in listings, category pages or search", () => {
  for (const q of BANNED) {
    assert.equal(isProhibitedQuery(q), true, q);
    const listing = selectBazaar({ params: { q }, favs: [], labels });
    assert.deepEqual([listing.goods.length, listing.stores.length], [0, 0], q);
    for (const cat of PRIMARY_CATEGORIES) {
      const inCat = selectBazaar({ params: { q, cat }, favs: [], labels });
      assert.deepEqual([inCat.goods.length, inCat.stores.length], [0, 0], `${q} in ${cat}`);
    }
    for (const { id: lang } of LANGS) {
      const hits = suggest(q, lang);
      assert.equal(hits.blocked, true, `${q} ${lang}`);
      assert.equal(
        hits.stores.length + hits.brands.length + hits.categories.length + hits.items.length,
        0,
      );
    }
  }
});

test("?sub= is kept as a plain string and ignored when it does not belong to ?cat=", () => {
  assert.equal(validateBazaarSearch({ cat: "electronics", sub: "tablets" }).sub, "tablets");
  assert.equal(findSubcategory("electronics", "tablets")?.id, "tablets");
  assert.equal(findSubcategory("electronics", "pantry"), undefined);
  assert.equal(findSubcategory("nope", "tablets"), undefined);
});
