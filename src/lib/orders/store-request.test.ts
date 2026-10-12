import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkProductUrl, cleanField, normalizePhone, validateStoreRequest } from "./store-request.ts";
import { STORES } from "../stores.ts";

const amazon = STORES.find((s) => s.id === "amazon-de")!;
const base = { intent: "buy", storeId: "amazon-de", url: "https://www.amazon.de/dp/B0TEST", qty: "2", dest: "ebl", phone: "+49 151 2345678" };

describe("product link", () => {
  it("accepts https links on the store's domain or subdomains", () => {
    assert.equal(checkProductUrl("https://www.amazon.de/dp/X", amazon).ok, true);
    assert.equal(checkProductUrl("https://amazon.de/x", amazon).ok, true);
  });
  it("rejects other schemes, userinfo, ports, look-alike hosts and long links", () => {
    for (const bad of [
      "javascript:alert(1)",
      "http://www.amazon.de/x",
      "data:text/html,hi",
      "https://user:pw@www.amazon.de/x",
      "https://www.amazon.de:8443/x",
      "",
      `https://www.amazon.de/${"a".repeat(2000)}`,
    ])
      assert.deepEqual(checkProductUrl(bad, amazon), { ok: false, error: "url" }, bad);
    for (const bad of ["https://evil.com/", "https://amazon.de.evil.com/", "https://evilamazon.de/", "https://www.otto.de/x"])
      assert.deepEqual(checkProductUrl(bad, amazon), { ok: false, error: "host" }, bad);
  });
  it("without a selected store, only domains from the store list", () => {
    assert.equal(checkProductUrl("https://www.otto.de/p/1", undefined).ok, true);
    assert.equal(checkProductUrl("https://evil.com/", undefined).ok, false);
  });
});

describe("request validation", () => {
  it("accepts a valid request and keeps only minimal, cleaned fields", () => {
    const r = validateStoreRequest({ ...base, size: " M\u0000\u202e ", notes: "ﬁne  note", extra: "dropped", name: "x" }, null);
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.deepEqual(Object.keys(r.data).sort(), ["color", "dest", "intent", "item", "notes", "phone", "qty", "size", "storeId", "url"]);
    assert.equal(r.data.size, "M");
    assert.equal(r.data.notes, "fine note");
    assert.equal(r.data.qty, 2);
    assert.equal(r.data.phone, "+491512345678");
  });
  it("quantity must be an integer 1–20", () => {
    for (const qty of ["0", "21", "1.5", "-1", "abc", "", "1e1", 100])
      assert.deepEqual(validateStoreRequest({ ...base, qty }, null), { ok: false, error: "qty" }, String(qty));
    assert.equal(validateStoreRequest({ ...base, qty: 20 }, null).ok, true);
  });
  it("destination must be a real destination id", () => {
    assert.deepEqual(validateStoreRequest({ ...base, dest: "mars" }, null), { ok: false, error: "dest" });
  });
  it("needs a way to contact the customer", () => {
    assert.deepEqual(validateStoreRequest({ ...base, phone: "" }, null), { ok: false, error: "contact" });
    assert.deepEqual(validateStoreRequest({ ...base, phone: "12345" }, null), { ok: false, error: "contact" });
    assert.equal(validateStoreRequest({ ...base, phone: "" }, "+9647501234567").ok, true);
    // Pre-auth shape check: contact is checked later, everything else already here.
    assert.equal(validateStoreRequest({ ...base, phone: "" }, null, { requireContact: false }).ok, true);
    assert.deepEqual(validateStoreRequest({ ...base, url: "https://evil.com/" }, null, { requireContact: false }), { ok: false, error: "host" });
  });
  it("rejects unknown store or item ids and bad links", () => {
    assert.deepEqual(validateStoreRequest({ ...base, storeId: "evil" }, null), { ok: false, error: "invalid" });
    assert.deepEqual(validateStoreRequest({ ...base, url: "https://evil.com/x" }, null), { ok: false, error: "host" });
    assert.deepEqual(validateStoreRequest({ ...base, url: "javascript:alert(1)" }, null), { ok: false, error: "url" });
  });
  it("cleans and caps text (NFKC, control and bidi characters, 500 for notes)", () => {
    assert.equal(cleanField("a\u0007b\u2066c", 10), "a b c");
    assert.equal(cleanField("x".repeat(600), 500).length, 500);
    assert.equal(normalizePhone("0049 151 2345678"), "+491512345678");
    assert.equal(normalizePhone("+0 123"), null);
  });
  it("accepts Iraqi mobiles written locally and Kurdish/Arabic digits", () => {
    assert.equal(normalizePhone("0750 123 4567"), "+9647501234567");
    assert.equal(normalizePhone("750-123-4567"), "+9647501234567");
    assert.equal(normalizePhone("٠٧٥٠١٢٣٤٥٦٧"), "+9647501234567");
    assert.equal(normalizePhone("۰۷۵۰ ۱۲۳ ۴۵۶۷"), "+9647501234567");
    assert.equal(normalizePhone("+964 750 123 4567"), "+9647501234567");
    // Other short or malformed local numbers are still refused, never guessed.
    assert.equal(normalizePhone("0750 123"), null);
    assert.equal(normalizePhone("066 123 4567"), null);
    assert.equal(validateStoreRequest({ ...base, phone: "٠٧٧٠١٢٣٤٥٦٧" }, null).ok, true);
  });
});
