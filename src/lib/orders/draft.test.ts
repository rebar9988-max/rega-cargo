import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clearOrderDraft,
  DRAFT_TTL_MS,
  orderDraftKey,
  readOrderDraft,
  requestEmailDraft,
  writeOrderDraft,
} from "./draft.ts";

function memory() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
    removeItem: (k: string) => {
      values.delete(k);
    },
  };
}
test("opt-in drafts survive a reload without contacts, notes, declarations or tokens", () => {
  const s = memory(),
    key = orderDraftKey("zalando", "buy"),
    now = 100;
  assert.equal(
    writeOrderDraft(
      s,
      key,
      {
        url: "https://www.zalando.de/shoes?size=42",
        qty: "2",
        dest: "sul",
        phone: "+964123",
        notes: "private",
        declared: true,
        token: "secret",
      },
      now,
    ),
    true,
  );
  assert.deepEqual(readOrderDraft(s, key, now), {
    version: 1,
    expiresAt: now + DRAFT_TTL_MS,
    url: "https://www.zalando.de/shoes?size=42",
    qty: "2",
    dest: "sul",
  });
  assert.doesNotMatch(s.getItem(key)!, /private|declared|phone|token/);
  writeOrderDraft(
    s,
    key,
    { url: "https://www.zalando.de/shoes?size=42", qty: "2", dest: "sul" },
    now + 100,
  );
  assert.equal(
    readOrderDraft(s, key, now + 100)?.expiresAt,
    now + DRAFT_TTL_MS,
    "reload does not prolong an unchanged draft",
  );
  assert.notEqual(key, orderDraftKey("zalando", "ship"));
  assert.equal(clearOrderDraft(s, key), true);
  assert.equal(readOrderDraft(s, key, now), null);
});
test("expired, corrupt and sensitive drafts are discarded", () => {
  const s = memory(),
    k = "draft";
  writeOrderDraft(s, k, { url: "", qty: "1", dest: "ebl" }, 100);
  assert.equal(readOrderDraft(s, k, 100 + DRAFT_TTL_MS), null);
  for (const url of [
    "javascript:alert(1)",
    "https://user:pass@example.com",
    "https://example.com?access_token=secret",
    "https://example.com#private",
  ]) {
    assert.equal(writeOrderDraft(s, k, { url }, 100), false);
    assert.equal(s.getItem(k), null);
  }
  s.setItem(k, "{bad");
  assert.equal(readOrderDraft(s, k), null);
  const unavailable = {
    getItem: () => {
      throw Error("disabled");
    },
    setItem: () => {
      throw Error("full");
    },
    removeItem: () => {
      throw Error("disabled");
    },
  };
  assert.equal(readOrderDraft(unavailable, k), null);
  assert.equal(writeOrderDraft(unavailable, k, { url: "" }), false);
});
test("email fallback encodes user text and cannot inject recipients or headers", () => {
  const href = requestEmailDraft("2233rega@gmail.com", [
    ["link", "https://example.com/?x=&y=1"],
    ["notes", "hello\r\nBcc: bad@example.com"],
  ]);
  assert.ok(href.startsWith("mailto:2233rega@gmail.com?subject="));
  assert.equal((href.match(/&/g) ?? []).length, 1);
  assert.doesNotMatch(href, /\r|\n/);
});
