import assert from "node:assert/strict";
import { test } from "node:test";
import { CONTACT_KEYS, missingContactKeys, parseBusinessContact, whatsappLink } from "./business.ts";

test("nothing configured: everything hidden, all keys reported missing", () => {
  const contact = parseBusinessContact({});
  assert.deepEqual(contact, {});
  assert.deepEqual(missingContactKeys(contact), Object.values(CONTACT_KEYS));
});

test("valid values are shown, normalised", () => {
  const contact = parseBusinessContact({
    RL_CONTACT_PHONE: "00964 750 123 4567",
    RL_CONTACT_WHATSAPP: "+964 (750) 123-4567",
    RL_CONTACT_HOURS: "Sat–Thu 09:00–18:00",
    RL_CONTACT_TIMEZONE: "Asia/Baghdad",
    RL_WAREHOUSE_ADDRESS: "Test street 1, Test city",
    RL_WAREHOUSE_MAP_URL: "https://maps.app.goo.gl/abc",
  });
  assert.equal(contact.phone, "+9647501234567");
  assert.equal(contact.whatsapp, "+9647501234567");
  assert.equal(contact.timezone, "Asia/Baghdad");
  assert.equal(contact.mapUrl, "https://maps.app.goo.gl/abc");
  assert.deepEqual(missingContactKeys(contact), []);
  assert.equal(whatsappLink(contact.whatsapp ?? ""), "https://wa.me/9647501234567");
});

test("invalid or incomplete values stay hidden", () => {
  const contact = parseBusinessContact({
    RL_CONTACT_PHONE: "call us",
    RL_CONTACT_WHATSAPP: "12",
    RL_CONTACT_HOURS: "9-5",
    RL_CONTACT_TIMEZONE: "Mars/Olympus",
    RL_WAREHOUSE_MAP_URL: "https://maps.app.goo.gl/abc",
  });
  assert.deepEqual(contact, {}, "hours need a real time zone; a map link needs an address");
  const bad = parseBusinessContact({ RL_WAREHOUSE_ADDRESS: "x st", RL_WAREHOUSE_MAP_URL: "https://evil.example/maps" });
  assert.equal(bad.address, "x st");
  assert.equal(bad.mapUrl, undefined, "only known map hosts");
  const js = parseBusinessContact({ RL_WAREHOUSE_ADDRESS: "x st", RL_WAREHOUSE_MAP_URL: "javascript:alert(1)" });
  assert.equal(js.mapUrl, undefined);
});
