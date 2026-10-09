import { test } from "node:test";
import assert from "node:assert/strict";
import { parseKg } from "./quote-search.ts";

test("kg accepts the new plain number and the old quoted-string links", () => {
  assert.equal(parseKg(3.2), 3.2);
  assert.equal(parseKg("3.2"), 3.2);
  assert.equal(parseKg("3,2"), 3.2);
  assert.equal(parseKg(" 12 "), 12);
  assert.equal(parseKg(""), undefined);
  assert.equal(parseKg("abc"), undefined);
  assert.equal(parseKg(-1), undefined);
  assert.equal(parseKg(0), undefined);
  assert.equal(parseKg("1e9"), undefined);
  assert.equal(parseKg({}), undefined);
});
