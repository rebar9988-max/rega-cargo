import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sw = readFileSync(new URL("../../public/sw.js", import.meta.url), "utf8");

test("service worker does not cache market or saved views and clears pages on sign-out", () => {
  assert.match(sw, /function pageKey/);
  assert.match(sw, /pathname \+ url\.search/);
  assert.doesNotMatch(sw, /PUBLIC_PAGES = \/\^\\\/\(\?:\|quote\|track\|stores\|market/);
  assert.match(sw, /rl-sign-out/);
  assert.match(sw, /params\.has\("saved"\)/);
});
