import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canSetJobStatus, cheapest, cleanContact, cleanMoney, offerTotal, rankOffers } from "../market.ts";
import { MarketError } from "../market.ts";

describe("marketplace offers", () => {
  it("sorts by price plus shipping and keeps sold-out last", () => {
    const ranked = rankOffers([
      { price: 1000, shipping: 500, stock: "in" as const },
      { price: 900, shipping: 0, stock: "out" as const },
      { price: 800, shipping: 400, stock: "in" as const },
    ]);
    assert.deepEqual(
      ranked.map((row) => row.total),
      [offerTotal(800, 400), offerTotal(1000, 500), offerTotal(900, 0)],
    );
    assert.equal(cheapest(ranked)?.total, 1200);
  });

  it("rejects a fake price and a non-https link", () => {
    assert.throws(() => cleanMoney("12.5", 100, false), MarketError);
    assert.throws(() => cleanMoney(0, 100, false), MarketError);
    assert.equal(cleanMoney(15000, 50000000, false), 15000);
    assert.throws(() => cleanContact("http://shop.example"), MarketError);
    assert.equal(cleanContact("https://shop.example"), "https://shop.example");
  });
});

describe("delivery status", () => {
  it("lets only the driver move one step, and the requester cancel", () => {
    assert.equal(canSetJobStatus("accepted", "picked_up", "courier"), true);
    assert.equal(canSetJobStatus("accepted", "delivered", "courier"), false);
    assert.equal(canSetJobStatus("requested", "accepted", "courier"), false);
    assert.equal(canSetJobStatus("picked_up", "cancelled", "requester"), true);
    assert.equal(canSetJobStatus("delivered", "cancelled", "requester"), false);
  });
});
