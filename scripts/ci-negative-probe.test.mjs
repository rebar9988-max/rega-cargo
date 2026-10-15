// TEMPORARY negative probe (owner-approved, never merge): this test fails on purpose so the
// Workers Builds branch check must turn red if the non-production command really runs `npm test`.
import { test } from "node:test";
import assert from "node:assert/strict";

test("CI negative probe: deliberately failing test", () => {
  assert.fail("deliberate failure: Workers Builds must report this branch as failed");
});
