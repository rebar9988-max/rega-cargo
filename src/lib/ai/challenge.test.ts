import assert from "node:assert/strict";
import test from "node:test";
import { signAiToken, spendAiToken, verifyAiToken } from "./challenge.ts";

test("page token verifies only inside its window", async () => {
  const now = 1_700_000_000_000;
  const token = await signAiToken("secret", now);
  assert.equal(await verifyAiToken("secret", token, now + 1000), true);
  assert.equal(await verifyAiToken("other", token, now + 1000), false);
  assert.equal(await verifyAiToken("secret", token, now + 11 * 60 * 1000), false);
  assert.equal(await verifyAiToken("secret", "1.nope", now), false);
  assert.notEqual(
    token,
    await signAiToken("secret", now),
    "simultaneous visitors receive different one-time tokens",
  );
  assert.equal(await verifyAiToken("secret", `${token}.extra`, now + 1000), false);
});

test("a gate token is spent on first use and refused on replay", async () => {
  const secret = "s".repeat(40);
  const spent = new Map<string, number>();
  const store = {
    get: async (key: string) => spent.get(key),
    put: async (key: string, exp: number) => void spent.set(key, exp),
  };
  const token = await signAiToken(secret, 1_000);
  assert.equal(await spendAiToken(secret, token, 2_000, store), true);
  assert.equal(await spendAiToken(secret, token, 2_000, store), false);
  assert.equal(await spendAiToken(secret, `${token}x`, 2_000, store), false);
  const other = await signAiToken(secret, 1_500);
  assert.equal(await spendAiToken(secret, other, 2_000, store), true);
});
