import assert from "node:assert/strict";
import test from "node:test";
import { signAiToken, verifyAiToken } from "./challenge.ts";

test("page token verifies only inside its window", async () => {
  const now = 1_700_000_000_000;
  const token = await signAiToken("secret", now);
  assert.equal(await verifyAiToken("secret", token, now + 1000), true);
  assert.equal(await verifyAiToken("other", token, now + 1000), false);
  assert.equal(await verifyAiToken("secret", token, now + 11 * 60 * 1000), false);
  assert.equal(await verifyAiToken("secret", "1.nope", now), false);
});
