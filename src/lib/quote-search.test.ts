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

test("URL inputs: kg 0.1–70, from/to only from the allowlist", async () => {
  const { parseFrom, parseTo } = await import("./quote-search.ts");
  assert.equal(parseKg("-5"), undefined);
  assert.equal(parseKg("abc"), undefined);
  assert.equal(parseKg("999999"), undefined);
  assert.equal(parseKg("70.01"), undefined);
  assert.equal(parseKg("0.05"), undefined);
  assert.equal(parseKg("70"), 70);
  assert.equal(parseKg("0.1"), 0.1);
  assert.equal(parseKg("NaN"), undefined);
  assert.equal(parseKg("Infinity"), undefined);
  assert.equal(parseFrom("ber"), "ber");
  assert.equal(parseFrom("<script>"), undefined);
  assert.equal(parseTo("ebl"), "ebl");
  assert.equal(parseTo("mars"), undefined);
});
