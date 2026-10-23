import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CHUNK_RELOAD_WINDOW_MS,
  isChunkLoadError,
  shouldReloadForChunk,
} from "./chunk-recovery.ts";

function memory() {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
  };
}

const webkit = new TypeError("Importing a module script failed.");
const chromium = (file: string) =>
  new TypeError(`Failed to fetch dynamically imported module: https://www.rlgo.net/assets/${file}`);

test("module load failures are recognised in Chromium, Firefox and WebKit only", () => {
  assert.ok(isChunkLoadError(webkit));
  assert.ok(isChunkLoadError(chromium("track-1.js")));
  assert.ok(isChunkLoadError(new TypeError("error loading dynamically imported module: x.js")));
  for (const other of [
    new Error("Database not configured"),
    new TypeError("x is undefined"),
    "Importing a module script failed.",
    null,
  ])
    assert.equal(isChunkLoadError(other), false);
});

test("WebKit's shared message still recovers each page once (the flaky navigation root cause)", () => {
  const storage = memory();
  // One failure on /market, then one on /track in the same tab: both pages reload once.
  assert.equal(shouldReloadForChunk(webkit, "/market?lang=en", 1_000, storage), true);
  assert.equal(shouldReloadForChunk(webkit, "/track?lang=en", 2_000, storage), true);
});

test("a module that keeps failing shows the error page instead of reloading in a loop", () => {
  const storage = memory();
  assert.equal(shouldReloadForChunk(chromium("track-1.js"), "/track", 1_000, storage), true);
  assert.equal(shouldReloadForChunk(chromium("track-1.js"), "/track", 2_000, storage), false);
  assert.equal(
    shouldReloadForChunk(chromium("track-1.js"), "/track", 1_000 + CHUNK_RELOAD_WINDOW_MS, storage),
    true,
  );
});

test("the router's own reload of the same document is not doubled", () => {
  const storage = memory();
  assert.equal(shouldReloadForChunk(webkit, "/track", 1_000, storage, true), false);
  // Its next failure (the router has spent its one reload) still recovers once.
  assert.equal(shouldReloadForChunk(webkit, "/track", 2_000, storage, false), true);
});

test("other errors, or no usable storage, never reload", () => {
  assert.equal(shouldReloadForChunk(new Error("boom"), "/track", 1, memory()), false);
  assert.equal(shouldReloadForChunk(webkit, "/track", 1, null), false);
  const blocked = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => undefined,
  };
  assert.equal(shouldReloadForChunk(webkit, "/track", 1, blocked), false);
});
