import { test } from "node:test";
import assert from "node:assert/strict";
import { isProhibitedQuery } from "./compliance/check.ts";
import { LANGS } from "./langs.ts";
import { refHomeCopy } from "./ref-home-copy.ts";
import { CATEGORY_TILES, featuredGoods, tileIsPublished } from "./ref-home-data.ts";
import { storeCopy } from "./store-copy.ts";

test("reference home: category tiles only link to published catalogue views", () => {
  assert.equal(
    CATEGORY_TILES.length,
    7,
    "seven tiles plus the 'More' tile make the eight positions",
  );
  for (const tile of CATEGORY_TILES) assert.ok(tileIsPublished(tile), `${tile.key} is published`);
});

test("reference home: featured examples never include a banned product, in any language", () => {
  for (const lang of LANGS) {
    const labels = storeCopy(lang.id).goods;
    const goods = featuredGoods(labels);
    assert.equal(goods.length, 4, lang.id);
    for (const good of goods)
      assert.equal(
        isProhibitedQuery(`${good.id} ${labels[good.id] ?? ""}`),
        false,
        `${lang.id} ${good.id}`,
      );
  }
  // The filter really removes banned labels (it is not a no-op).
  const banned = featuredGoods({ earbuds: "Vodka" });
  assert.equal(
    banned.some((good) => good.id === "earbuds"),
    false,
  );
});

test("reference home: copy is complete in every language and makes no commercial claims", () => {
  for (const lang of LANGS) {
    const c = refHomeCopy(lang.id);
    assert.equal(c.benefits.length, 4, lang.id);
    assert.equal(Object.keys(c.cats).length, 8, lang.id);
    const all = JSON.stringify(c);
    assert.doesNotMatch(all, /[€$]|IQD|\d\s?%|★/, `${lang.id}: no prices, discounts or ratings`);
    assert.equal(isProhibitedQuery(all), false, lang.id);
  }
  assert.equal(refHomeCopy("ckb").searchPlaceholder, "گەڕان بەدوای کاڵا، مارکە، یان خزمەتگوزاری…");
  assert.deepEqual(refHomeCopy("ckb").titleLines, ["جیهانەکەت", "نوێ بکەرەوە"]);
});
