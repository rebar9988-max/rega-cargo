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

test("calculator dimension URLs preserve a real box and discard unsafe values", async () => {
  const { parseDim } = await import("./quote-search.ts");
  for (const value of [0, -1, 201, Infinity, "not-a-number", {}, "9999999999999999999999999999"])
    assert.equal(parseDim(value), undefined);
  assert.equal(parseDim("60"), 60);
  assert.equal(parseDim("25,5"), 25.5);
  assert.equal(parseDim(undefined), undefined);
});

test("locale URLs preserve Sorani/Kurmanji identity and reject unsafe loader identifiers", async () => {
  const { validateLocaleSearch } = await import("./locale-search.ts");
  assert.deepEqual(validateLocaleSearch({ lang: "ckb" }), { lang: "ckb" });
  assert.deepEqual(validateLocaleSearch({ lang: "ku" }), { lang: "ku" });
  assert.deepEqual(validateLocaleSearch({ lang: "ar" }), { lang: "ar" });
  for (const lang of ["../../env", {}, [], "invalid", undefined])
    assert.equal(validateLocaleSearch({ lang }).lang, undefined);
});
