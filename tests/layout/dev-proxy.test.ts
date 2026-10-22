/**
 * The layout suite reads status codes through `wrangler dev`'s ProxyWorker, which drops the
 * occasional request under load. These are the rules that decide what a sequence of attempts
 * proves — deterministic, no browser and no dev server involved.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { denialVerdict, isAccepted, isDevProxyDrop, type Attempt } from "./dev-proxy.ts";

const drop: Attempt = {
  status: 500,
  body:
    "Error: Network connection lost.\n    at async Object.fetch " +
    "(file:///app/node_modules/wrangler/node_modules/miniflare/dist/src/workers/core/entry.worker.js:5333:22)",
};
const denied: Attempt = { status: 403, body: "" };

describe("isDevProxyDrop", () => {
  it("recognises only the proxy's own dropped-request answer", () => {
    assert.equal(isDevProxyDrop(drop), true);
    assert.equal(isDevProxyDrop({ status: 500, body: "Network Connection Lost" }), true);
  });
  it("treats every other response as a real answer, including other 500s", () => {
    for (const attempt of [
      denied,
      { status: 500, body: "" },
      { status: 500, body: "TypeError: x is not a function" },
      { status: 503, body: "Network connection lost." },
      { status: 200, body: "Network connection lost." },
      { status: 429, body: "" },
    ] satisfies Attempt[]) {
      assert.equal(isDevProxyDrop(attempt), false);
    }
  });
});

describe("isAccepted", () => {
  it("counts any non-error status as acceptance", () => {
    for (const status of [200, 201, 204, 301, 302, 399]) {
      assert.equal(isAccepted({ status, body: "" }), true);
    }
    for (const status of [400, 401, 403, 404, 429, 500, 503]) {
      assert.equal(isAccepted({ status, body: "" }), false);
    }
  });
});

describe("denialVerdict", () => {
  it("reports the first real answer, skipping dropped attempts", () => {
    assert.deepEqual(denialVerdict([denied]), { ok: true, status: 403 });
    assert.deepEqual(denialVerdict([drop, denied]), { ok: true, status: 403 });
    assert.deepEqual(denialVerdict([drop, drop, drop, denied]), { ok: true, status: 403 });
  });
  it("never hides a real failure behind a dropped attempt", () => {
    assert.deepEqual(denialVerdict([drop, { status: 500, body: "boom" }]), {
      ok: true,
      status: 500,
    });
    assert.deepEqual(denialVerdict([drop, { status: 429, body: "" }]), { ok: true, status: 429 });
  });
  it("fails on an acceptance wherever it appears, even followed by a refusal", () => {
    assert.deepEqual(denialVerdict([{ status: 200, body: "" }]), {
      ok: false,
      reason: "accepted",
      status: 200,
    });
    assert.deepEqual(denialVerdict([drop, { status: 302, body: "" }, denied]), {
      ok: false,
      reason: "accepted",
      status: 302,
    });
    assert.deepEqual(denialVerdict([denied, { status: 201, body: "" }]), {
      ok: false,
      reason: "accepted",
      status: 201,
    });
  });
  it("refuses to pass when every attempt was dropped, or none was made", () => {
    assert.deepEqual(denialVerdict([drop, drop, drop, drop]), { ok: false, reason: "all_dropped" });
    assert.deepEqual(denialVerdict([]), { ok: false, reason: "all_dropped" });
  });
});
