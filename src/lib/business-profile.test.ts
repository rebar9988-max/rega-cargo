import assert from "node:assert/strict";
import { test } from "node:test";
import { BUSINESS_FIELDS, BUSINESS_POLICIES, businessReadiness } from "./business-profile.ts";

test("missing and placeholder legal data block release", () => {
  for (const value of [null, {}, { legalName: "[Company pending]" }]) {
    assert.equal(businessReadiness(value).ready, false);
    assert.equal(businessReadiness(value).profile, null);
  }
});
test("every policy and locale, verification source and date are required", () => {
  const fixture: Record<string, unknown> = Object.fromEntries(
    BUSINESS_FIELDS.map((k) => [k, "test fixture"]),
  );
  fixture.verifiedAt = "2026-10-13T00:00:00Z";
  for (const key of BUSINESS_POLICIES)
    fixture[key] = Object.fromEntries(
      ["ckb", "ku", "de", "en", "ar", "fa", "tr"].map((lang) => [lang, "test policy fixture"]),
    );
  assert.equal(businessReadiness(fixture, Date.parse("2026-10-14")).ready, true);
  delete (fixture.complaints as Record<string, string>).ckb;
  assert.deepEqual(businessReadiness(fixture, Date.parse("2026-10-14")).missing, [
    "complaints.ckb",
  ]);
  fixture.verifiedAt = "2030-01-01";
  assert.ok(businessReadiness(fixture, Date.parse("2026-10-14")).missing.includes("verifiedAt"));
});
