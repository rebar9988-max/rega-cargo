import assert from "node:assert/strict";
import { test } from "node:test";
import { allow } from "./rate-limit.server.ts";

type Env = { __env__?: Record<string, unknown> };

test("rate limit fails closed when the limiter errors", async () => {
  const g = globalThis as Env;
  const before = g.__env__;
  const keys: string[] = [];
  try {
    g.__env__ = {
      RL_LIMIT: {
        limit: async ({ key }: { key: string }) => {
          keys.push(key);
          return { success: key.endsWith(":1.1.1.1") };
        },
      },
    };
    assert.equal(await allow("quote", "1.1.1.1"), true);
    assert.equal(await allow("quote", "2.2.2.2"), false);
    assert.deepEqual(keys, ["quote:1.1.1.1", "quote:2.2.2.2"]);
    g.__env__ = { RL_LIMIT: { limit: async () => Promise.reject(new Error("down")) } };
    const error = console.error;
    console.error = () => {};
    try {
      assert.equal(await allow("quote", "1.1.1.1"), false);
    } finally {
      console.error = error;
    }
    g.__env__ = {};
    assert.equal(await allow("quote", "1.1.1.1"), false, "missing binding fails closed in every environment");
  } finally {
    g.__env__ = before;
  }
});


test("missing identity and malformed binding results cannot grant access", async () => {
  const g = globalThis as Env;
  const before = g.__env__;
  try {
    let calls = 0;
    g.__env__ = { RL_LIMIT: { limit: async () => { calls += 1; return { success: true }; } } };
    for (const ip of ["", " ", "unknown"])
      assert.equal(await allow("book", ip), false);
    assert.equal(calls, 0);
    g.__env__ = { RL_LIMIT: { limit: async () => ({ success: "yes" }) } };
    assert.equal(await allow("track", "1.1.1.1"), false);
    g.__env__ = undefined;
    assert.equal(await allow("store", "1.1.1.1"), false);
  } finally { g.__env__ = before; }
});
