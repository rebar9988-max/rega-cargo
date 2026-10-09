import assert from "node:assert/strict";
import { test } from "node:test";
import { PROHIBITED } from "./compliance/rules.ts";
import { ITEMS_COPY } from "./items-copy.ts";
import { hasEasternDigits } from "./numbers.ts";

test("prohibited-items page names every compliance category in all 7 languages", () => {
  const slugs = PROHIBITED.map((category) => category.slug).sort();
  assert.equal(Object.keys(ITEMS_COPY).length, 7);
  for (const [lang, copy] of Object.entries(ITEMS_COPY)) {
    assert.deepEqual(Object.keys(copy.categories).sort(), slugs, lang);
    assert.equal(copy.restricted.length, ITEMS_COPY.en.restricted.length, lang);
    assert.equal(copy.route.length, ITEMS_COPY.en.route.length, lang);
    assert.equal(hasEasternDigits(JSON.stringify(copy)), false, lang);
    // Restricted items are never presented as approved.
    assert.ok(copy.notApproved.length > 3, lang);
  }
});
