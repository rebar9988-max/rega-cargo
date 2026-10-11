import { test } from "node:test";
import assert from "node:assert/strict";
import { LANGS } from "./langs.ts";
import { SEO_MESSAGES } from "./seo-messages.ts";
import { productLinkCopy } from "./product-link/copy.ts";

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
      assert.notEqual(m.description, SEO_MESSAGES.en[path].description, `${id} ${path} description is still English`);
});

test("product-link copy is complete and translated in all seven languages", () => {
  const en = productLinkCopy("en");
  const keys = Object.keys(en).sort();
  const errorKeys = Object.keys(en.errors).sort();
  for (const id of ids) {
    const c = productLinkCopy(id);
    assert.deepEqual(Object.keys(c).sort(), keys, `${id}: keys`);
    assert.deepEqual(Object.keys(c.errors).sort(), errorKeys, `${id}: error keys`);
    for (const [k, v] of Object.entries(c)) if (typeof v === "string") assert.ok(v.trim(), `${id}.${k} empty`);
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
