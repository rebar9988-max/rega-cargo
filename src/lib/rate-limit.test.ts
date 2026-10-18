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
    assert.equal(await allow("quote", "1.1.1.1"), true, "no binding (local dev) stays open");
  } finally {
    g.__env__ = before;
  }
});

test("a missing RL_LIMIT binding refuses the request in production and stays open in dev and tests", async () => {
  const g = globalThis as Env;
  const before = g.__env__;
  const mode = process.env.NODE_ENV;
  const error = console.error;
  const logged: string[] = [];
  console.error = (...args: unknown[]) => logged.push(args.join(" "));
  try {
    g.__env__ = {};
    process.env.NODE_ENV = "production";
    assert.equal(await allow("book", "1.1.1.1"), false, "production without the binding fails closed");
    assert.equal(await allow("request", "1.1.1.1"), false);
    assert.ok(logged.some((line) => line.includes("RL_LIMIT binding is missing")));
    g.__env__ = undefined;
    assert.equal(await allow("book", "1.1.1.1"), false, "no environment at all is the same");
    for (const open of ["development", "test"]) {
      process.env.NODE_ENV = open;
      assert.equal(await allow("book", "1.1.1.1"), true, open);
    }
    // With the binding present, production behaves exactly as before.
    process.env.NODE_ENV = "production";
    g.__env__ = { RL_LIMIT: { limit: async () => ({ success: true }) } };
    assert.equal(await allow("book", "1.1.1.1"), true);
  } finally {
    console.error = error;
    process.env.NODE_ENV = mode;
    g.__env__ = before;
  }
});
