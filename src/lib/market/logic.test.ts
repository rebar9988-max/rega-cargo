import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  areaOnly,
  canSetJobStatus,
  cheapest,
  cleanContact,
  cleanImage,
  cleanMoney,
  contactHref,
  offerTotal,
  rankOffers,
  slugify,
} from "../market.ts";
import { MarketError } from "../market.ts";
import { validateMarketSearch } from "./search.ts";
import { primaryJourney } from "../navigation.ts";

describe("marketplace query and journey deep links", () => {
  it("preserves page numbers encoded as URL strings, with the existing server bounds", () => {
    assert.equal(validateMarketSearch({ page: "2", q: "kettle" }).page, 2);
    for (const page of ["0", "-1", "1.5", "101", "Infinity", "garbage", {}])
      assert.equal(validateMarketSearch({ page }).page, 1);
    assert.equal(validateMarketSearch({ page: 100 }).page, 100);
  });
  it("normalizes unsupported filters and distinguishes real marketplace and external requests", () => {
    assert.equal(validateMarketSearch({ stock: "maybe", sort: "sponsored" }).stock, "");
    assert.equal(validateMarketSearch({ sort: "sponsored" }).sort, "price");
    assert.equal(primaryJourney("/market/kettle"), "/market");
    assert.equal(primaryJourney("/stores/request"), "/stores/request");
    assert.equal(primaryJourney("/stores"), "/stores/request");
    assert.equal(primaryJourney("/account/RG-TEST"), "/account");
    assert.equal(primaryJourney("/marketplace"), null);
  });
});

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

describe("contacts, images and slugs", () => {
  it("allows only https, tel and mailto", () => {
    assert.equal(cleanContact("mailto:2233rega@gmail.com"), "mailto:2233rega@gmail.com");
    assert.equal(cleanContact("tel:+9647500000000"), "tel:+9647500000000");
    assert.equal(contactHref("https://shop.example/a"), "https://shop.example/a");
    assert.equal(contactHref("not a link"), null);
    assert.throws(() => cleanContact("javascript:alert(1)"), MarketError);
    assert.throws(() => cleanContact("data:text/html,hi"), MarketError);
    assert.throws(() => cleanContact("call me"), MarketError);
  });
  it("allows bazaar paths only, and hides street addresses from open jobs", () => {
    assert.equal(cleanImage("/bazaar/kettle.jpg"), "/bazaar/kettle.jpg");
    assert.throws(() => cleanImage("https://evil.example/a.jpg"), MarketError);
    assert.throws(() => cleanImage("/bazaar/../secret"), MarketError);
    assert.equal(areaOnly("Erbil, 12 Main Street"), "Erbil");
    assert.match(slugify("Electric kettle"), /^electric-kettle-[a-f0-9]{8}$/);
  });
});
