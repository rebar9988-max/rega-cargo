import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cleanPin, toE164 } from "./format.ts";

describe("world phone numbers", () => {
  it("keeps the country code and drops a leading zero", () => {
    assert.equal(toE164("964", "0750 123 4567"), "+9647501234567");
    assert.equal(toE164("49", "15123456789"), "+4915123456789");
    assert.equal(toE164("1", "2025550143"), "+12025550143");
  });

  it("rejects a short number and a pin that is not six digits", () => {
    assert.equal(toE164("964", "123"), null);
    assert.equal(cleanPin("12ab"), null);
    assert.equal(cleanPin("448190"), "448190");
    assert.equal(cleanPin("4481"), null);
  });
});
