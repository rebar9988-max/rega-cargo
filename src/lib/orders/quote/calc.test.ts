import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateQuote,
  missingSettings,
  type Coupon,
  type QuoteItem,
  type QuoteSettings,
} from "./calc.ts";
import { CATEGORIES, CURRENCIES, ZONES } from "./constants.ts";
import { buildSettings } from "./settings.ts";

/**
 * TEST FIXTURE NUMBERS ONLY. These are not R&L prices: the app ships with no business numbers
 * and refuses to quote until the owner fills the settings in.
 */
function settings(patch: (s: QuoteSettings) => void = () => {}): QuoteSettings {
  const s: QuoteSettings = {
    fxMicro: { USD: 1_500_000_000, EUR: 1_600_000_000, TRY: 40_000_000, GBP: 1_900_000_000 },
    volumetricDivisor: 5000,
    freightPerKgIqd: { kurdistan: 10_000, rest_of_iraq: 12_000 },
    minFreightIqd: 20_000,
    customsBp: Object.fromEntries(
      CATEGORIES.map((c) => [c, c === "electronics" ? 1000 : 500]),
    ) as QuoteSettings["customsBp"],
    rlFeeIqd: 5_000,
    delivery: {
      erbil: { zone: "kurdistan", feeIqd: 4_000 },
      baghdad: { zone: "rest_of_iraq", feeIqd: 6_000 },
    },
    freeDelivery: { thresholdIqd: 200_000, basis: "after_discount" },
    estimates: Object.fromEntries(
      CATEGORIES.map((c) => [c, { weightG: 500, lengthMm: 200, widthMm: 150, heightMm: 100 }]),
    ) as QuoteSettings["estimates"],
    validityHours: 48,
  };
  patch(s);
  return s;
}

const NOW = new Date("2026-10-20T12:00:00.000Z");
const item = (patch: Partial<QuoteItem> = {}): QuoteItem => ({
  id: "i1",
  storeKey: "amazon",
  priceMinor: 2000,
  currency: "EUR",
  quantity: 1,
  category: "fashion",
  weightG: 1000,
  lengthMm: 400,
  widthMm: 300,
  heightMm: 200,
  ...patch,
});
const run = (
  items: QuoteItem[],
  s = settings(),
  governorate: string | null = "erbil",
  coupon: Coupon | null = null,
) => calculateQuote(items, s, { governorate, coupon, now: NOW });
const ok = (r: ReturnType<typeof run>) => {
  if (!r.ok) throw new Error(JSON.stringify(r));
  return r.quote;
};
// Error variants carry different fields (field, limit, reason, missing): read them loosely.
type AnyError = {
  code: string;
  field?: string;
  limit?: string;
  reason?: string;
  missing?: string[];
};
const fail = (r: ReturnType<typeof run>): AnyError => {
  if (r.ok) throw new Error("expected a refusal");
  return r.error as AnyError;
};
const coupon = (patch: Partial<Coupon> = {}): Coupon => ({
  code: "WELCOME",
  kind: "fixed_iqd",
  value: 5000,
  maxDiscountIqd: null,
  minItemsIqd: null,
  startsAt: null,
  expiresAt: "2026-12-31T00:00:00.000Z",
  active: true,
  ...patch,
});

describe("calculateQuote: the formula", () => {
  it("Items + Customs + Freight + R&L fee + Home delivery - Coupon, rounded up to 250", () => {
    const q = ok(run([item()]));
    // 20.00 EUR x 1600 = 32,000; customs 5% = 1,600; 40x30x20 cm / 5000 = 4.8 kg x 10,000 = 48,000
    assert.equal(q.breakdown.itemsIqd, 32_000);
    assert.equal(q.breakdown.customsIqd, 1_600);
    assert.equal(q.freight.chargeableG, 4_800);
    assert.equal(q.breakdown.freightIqd, 48_000);
    assert.equal(q.breakdown.rlFeeIqd, 5_000);
    assert.equal(q.breakdown.homeDeliveryIqd, 4_000);
    assert.equal(q.breakdown.couponIqd, 0);
    assert.equal(q.breakdown.rawTotalIqd, 90_600);
    assert.equal(q.breakdown.totalIqd, 90_750);
    assert.equal(q.breakdown.roundingIqd, 150);
    assert.equal(q.isEstimate, true);
    assert.deepEqual(q.destination, { governorate: "erbil", zone: "kurdistan" });
  });

  it("every amount is a whole IQD integer", () => {
    const q = ok(run([item({ priceMinor: 1999, quantity: 3, weightG: 733 })]));
    for (const v of Object.values(q.breakdown)) assert.ok(Number.isSafeInteger(v));
    for (const line of q.lines)
      for (const v of [line.itemsIqd, line.customsIqd]) assert.ok(Number.isSafeInteger(v));
  });

  it("converts with an exact 6-decimal rate, half-up (19.99 x 1,520.5 = 30,394.795 -> 30,395)", () => {
    const s = settings((x) => (x.fxMicro.EUR = 1_520_500_000));
    const q = ok(run([item({ priceMinor: 1999 })], s));
    assert.equal(q.breakdown.itemsIqd, 30_395);
  });

  it("the rate decides: the same price converts differently per currency", () => {
    const q = ok(
      run([
        item({ id: "usd", currency: "USD", priceMinor: 1000, quantity: 2 }),
        item({ id: "try", currency: "TRY", priceMinor: 50_000 }),
        item({ id: "gbp", currency: "GBP", priceMinor: 1000 }),
        item({ id: "eur", currency: "EUR", priceMinor: 1000 }),
      ]),
    );
    const by = Object.fromEntries(
      q.lines.map((l: { id: string; itemsIqd: number }) => [l.id, l.itemsIqd]),
    );
    assert.deepEqual(by, { usd: 30_000, try: 20_000, gbp: 19_000, eur: 16_000 });
    assert.equal(q.breakdown.itemsIqd, 85_000);
  });

  it("customs use the category rate of each line", () => {
    const q = ok(
      run([
        item({ id: "a", category: "electronics", priceMinor: 1000 }),
        item({ id: "b", category: "fashion", priceMinor: 1000 }),
      ]),
    );
    // 16,000 each: electronics 10% = 1,600, fashion 5% = 800
    assert.deepEqual(
      q.lines.map((l: { customsIqd: number }) => l.customsIqd),
      [1_600, 800],
    );
    assert.equal(q.breakdown.customsIqd, 2_400);
  });
});

describe("calculateQuote: chargeable weight and freight", () => {
  it("uses the larger of actual and volumetric weight (volumetric wins)", () => {
    const q = ok(run([item({ weightG: 1_000 })]));
    assert.equal(q.lines[0]!.actualG, 1_000);
    assert.equal(q.lines[0]!.volumetricG, 4_800);
    assert.equal(q.lines[0]!.chargeableG, 4_800);
  });

  it("actual weight wins when it is larger", () => {
    const q = ok(run([item({ weightG: 6_000, lengthMm: 100, widthMm: 100, heightMm: 100 })]));
    assert.equal(q.lines[0]!.volumetricG, 200);
    assert.equal(q.lines[0]!.chargeableG, 6_000);
    assert.equal(q.breakdown.freightIqd, 60_000);
  });

  it("the divisor is a setting, not a constant", () => {
    const s = settings((x) => (x.volumetricDivisor = 6000));
    assert.equal(ok(run([item()], s)).lines[0]!.volumetricG, 4_000);
  });

  it("applies the minimum freight per shipment", () => {
    const q = ok(run([item({ weightG: 500, lengthMm: 100, widthMm: 100, heightMm: 100 })]));
    // 0.5 kg x 10,000 = 5,000 < 20,000
    assert.equal(q.freight.minimumApplied, true);
    assert.equal(q.breakdown.freightIqd, 20_000);
  });

  it("does not apply the minimum when freight is higher", () => {
    assert.equal(ok(run([item()])).freight.minimumApplied, false);
  });

  it("sums chargeable weight across lines into ONE shipment and rounds to 0.1 kg once", () => {
    const q = ok(
      run([
        item({ id: "a", weightG: 1_040, lengthMm: 100, widthMm: 100, heightMm: 100 }),
        item({ id: "b", weightG: 1_040, lengthMm: 100, widthMm: 100, heightMm: 100 }),
      ]),
    );
    assert.equal(q.freight.chargeableG, 2_080);
    assert.equal(q.freight.chargeableKgTenths, 21); // 20.8 -> 21 tenths (half-up)
    assert.equal(q.breakdown.freightIqd, 21_000);
  });

  it("multiplies weight by quantity", () => {
    const q = ok(
      run([item({ quantity: 3, weightG: 2_000, lengthMm: 100, widthMm: 100, heightMm: 100 })]),
    );
    assert.equal(q.lines[0]!.chargeableG, 6_000);
  });

  it("uses the other zone's rate for a governorate in the other zone", () => {
    const q = ok(run([item()], settings(), "baghdad"));
    assert.equal(q.destination.zone, "rest_of_iraq");
    assert.equal(q.breakdown.freightIqd, 57_600); // 4.8 kg x 12,000
    assert.equal(q.breakdown.homeDeliveryIqd, 6_000);
  });

  it("unknown size and weight fall back to the category estimate, and say so", () => {
    const q = ok(run([item({ weightG: null, lengthMm: null, widthMm: null, heightMm: null })]));
    const line = q.lines[0]!;
    assert.equal(line.weightSource, "category_estimate");
    assert.equal(line.sizeSource, "category_estimate");
    assert.equal(line.actualG, 500);
    assert.equal(line.volumetricG, 600); // 200x150x100 mm / 5000
    assert.equal(q.settingsUsed["estimate.fashion.weight_g"], 500);
  });

  it("a partly known size counts as unknown size", () => {
    const q = ok(run([item({ lengthMm: 400, widthMm: null, heightMm: null })]));
    assert.equal(q.lines[0]!.sizeSource, "category_estimate");
  });
});

describe("calculateQuote: rounding", () => {
  it("rounds the total UP to the next 250 IQD", () => {
    // raw 90,600 -> 90,750
    assert.equal(ok(run([item()])).breakdown.totalIqd % 250, 0);
    for (const price of [1001, 1002, 1250, 1999, 3333]) {
      const q = ok(run([item({ priceMinor: price })]));
      assert.equal(q.breakdown.totalIqd % 250, 0);
      assert.ok(q.breakdown.totalIqd >= q.breakdown.rawTotalIqd);
      assert.ok(q.breakdown.totalIqd - q.breakdown.rawTotalIqd < 250);
    }
  });

  it("an exact multiple of 250 is not pushed up", () => {
    // make raw an exact multiple: choose fee so that 90,600 + x = 90,750
    const s = settings((x) => (x.rlFeeIqd = 5_150));
    const q = ok(run([item()], s));
    assert.equal(q.breakdown.rawTotalIqd, 90_750);
    assert.equal(q.breakdown.totalIqd, 90_750);
    assert.equal(q.breakdown.roundingIqd, 0);
  });
});

describe("calculateQuote: coupons", () => {
  it("a fixed coupon is subtracted", () => {
    const q = ok(run([item()], settings(), "erbil", coupon()));
    assert.equal(q.breakdown.couponIqd, 5_000);
    assert.equal(q.breakdown.rawTotalIqd, 85_600);
    assert.equal(q.breakdown.totalIqd, 85_750);
    assert.deepEqual(q.coupon, { code: "WELCOME", discountIqd: 5_000 });
  });

  it("a percent coupon applies to everything except home delivery", () => {
    // base = 32,000 + 1,600 + 48,000 + 5,000 = 86,600 ; 10% = 8,660
    const q = ok(run([item()], settings(), "erbil", coupon({ kind: "percent_bp", value: 1000 })));
    assert.equal(q.breakdown.couponIqd, 8_660);
    assert.equal(q.breakdown.rawTotalIqd, 86_600 + 4_000 - 8_660);
  });

  it("respects the maximum discount", () => {
    const q = ok(
      run(
        [item()],
        settings(),
        "erbil",
        coupon({ kind: "percent_bp", value: 1000, maxDiscountIqd: 3_000 }),
      ),
    );
    assert.equal(q.breakdown.couponIqd, 3_000);
  });

  it("never lets a coupon make the total negative", () => {
    const q = ok(run([item()], settings(), "erbil", coupon({ value: 9_999_999 })));
    assert.equal(q.breakdown.couponIqd, 86_600); // capped at the base
    assert.equal(q.breakdown.rawTotalIqd, 4_000); // only home delivery remains
    assert.ok(q.breakdown.totalIqd >= 0);
  });

  it("refuses an expired, not-yet-started, inactive or too-small-cart coupon", () => {
    const reason = (c: Coupon) => fail(run([item()], settings(), "erbil", c)).reason;
    assert.equal(reason(coupon({ expiresAt: "2026-10-20T12:00:00.000Z" })), "expired");
    assert.equal(reason(coupon({ startsAt: "2026-11-01T00:00:00.000Z" })), "not_started");
    assert.equal(reason(coupon({ active: false })), "inactive");
    assert.equal(reason(coupon({ minItemsIqd: 1_000_000 })), "minimum_not_met");
    assert.equal(reason(coupon({ expiresAt: null })), "invalid");
    assert.equal(reason(coupon({ value: 0 })), "invalid");
    assert.equal(reason(coupon({ kind: "percent_bp", value: 10_001 })), "invalid");
  });

  it("a coupon never changes the stored settings used", () => {
    const base = ok(run([item()])).settingsUsed;
    const withCoupon = ok(run([item()], settings(), "erbil", coupon())).settingsUsed;
    assert.deepEqual(withCoupon, base);
  });
});

describe("calculateQuote: free-delivery progress", () => {
  const big = item({ priceMinor: 13_000 }); // 13,000 x 16 = 208,000 IQD of goods

  it("home delivery is free once the threshold is reached, and progress is data", () => {
    const q = ok(run([big]));
    assert.equal(q.freeDelivery.reached, true);
    assert.equal(q.freeDelivery.spentIqd, 208_000);
    assert.equal(q.freeDelivery.thresholdIqd, 200_000);
    assert.equal(q.freeDelivery.leftIqd, 0);
    assert.equal(q.breakdown.homeDeliveryIqd, 0);
  });

  it("below the threshold it reports spent, threshold and left", () => {
    const q = ok(run([item()]));
    assert.deepEqual(
      { r: q.freeDelivery.reached, s: q.freeDelivery.spentIqd, l: q.freeDelivery.leftIqd },
      { r: false, s: 32_000, l: 168_000 },
    );
  });

  it("measured AFTER the coupon by default", () => {
    const q = ok(run([big], settings(), "erbil", coupon({ value: 20_000 })));
    assert.equal(q.freeDelivery.basis, "after_discount");
    assert.equal(q.freeDelivery.spentIqd, 188_000);
    assert.equal(q.freeDelivery.reached, false);
    assert.equal(q.breakdown.homeDeliveryIqd, 4_000);
  });

  it("measured BEFORE the coupon when the setting says so", () => {
    const s = settings((x) => (x.freeDelivery.basis = "before_discount"));
    const q = ok(run([big], s, "erbil", coupon({ value: 20_000 })));
    assert.equal(q.freeDelivery.spentIqd, 208_000);
    assert.equal(q.freeDelivery.reached, true);
    assert.equal(q.breakdown.homeDeliveryIqd, 0);
  });
});

describe("calculateQuote: refusals", () => {
  it("refuses an empty cart", () => assert.equal(fail(run([])).code, "empty_cart"));

  it("refuses zero quantity (and other bad quantities)", () => {
    for (const quantity of [0, -1, 1.5, 21, Number.NaN]) {
      const e = fail(run([item({ quantity })]));
      assert.deepEqual([e.code, e.field], ["invalid_item", "quantity"]);
    }
  });

  it("refuses bad prices, currencies and sizes instead of guessing", () => {
    assert.equal(fail(run([item({ priceMinor: 0 })])).field, "price");
    assert.equal(fail(run([item({ priceMinor: 19.99 })])).field, "price");
    assert.equal(fail(run([item({ currency: "unknown" })])).field, "currency");
    assert.equal(fail(run([item({ category: "weapons" })])).field, "category");
    assert.equal(fail(run([item({ weightG: 0 })])).field, "weight");
    assert.equal(fail(run([item({ heightMm: 5_000 })])).field, "height");
  });

  it("needs a destination chosen by the customer, and a known one", () => {
    assert.equal(fail(run([item()], settings(), null)).code, "destination_required");
    assert.equal(fail(run([item()], settings(), "")).code, "destination_required");
    assert.equal(fail(run([item()], settings(), "atlantis")).code, "unknown_destination");
  });

  it("enforces the documented limits (lines, pieces, distinct stores)", () => {
    const many = Array.from({ length: 31 }, (_, i) => item({ id: `i${i}` }));
    assert.deepEqual(fail(run(many)), { code: "limit_exceeded", limit: "lines" });
    const pieces = [
      item({ id: "a", quantity: 20 }),
      item({ id: "b", quantity: 20 }),
      item({ id: "c", quantity: 11 }),
    ];
    assert.deepEqual(fail(run(pieces)), { code: "limit_exceeded", limit: "pieces" });
    const stores = ["s1", "s2", "s3", "s4", "s5", "s6"].map((k, i) =>
      item({ id: `i${i}`, storeKey: k }),
    );
    assert.deepEqual(fail(run(stores)), { code: "limit_exceeded", limit: "stores" });
    // one shipment: the summed chargeable weight is capped too (3 x 30 kg = 90 kg > 70 kg)
    const heavy = ["a", "b", "c"].map((id) => item({ id, weightG: 30_000 }));
    assert.deepEqual(fail(run(heavy)), { code: "limit_exceeded", limit: "weight" });
    assert.ok(run([item({ weightG: 30_000 }), item({ id: "b", weightG: 30_000 })]).ok);
  });

  it("is deterministic and does not mutate its inputs", () => {
    const items = [item()];
    const s = settings();
    const before = JSON.stringify([items, s]);
    const a = run(items, s);
    const b = run(items, s);
    assert.deepEqual(a, b);
    assert.equal(JSON.stringify([items, s]), before);
  });
});

describe("calculateQuote: a missing setting refuses the quote (no invented numbers)", () => {
  const missingOf = (patch: (s: QuoteSettings) => void, items = [item()], gov = "erbil") => {
    const e = fail(run(items, settings(patch), gov));
    assert.equal(e.code, "missing_settings");
    return e.missing ?? [];
  };

  it("exchange rate of a currency in the cart", () => {
    assert.deepEqual(
      missingOf((s) => (s.fxMicro.EUR = null)),
      ["fx.EUR"],
    );
  });
  it("only the rates of currencies actually in the cart are required", () => {
    ok(
      run(
        [item()],
        settings((s) => (s.fxMicro.USD = null)),
      ),
    );
  });
  it("freight rate of the destination's zone, and the minimum", () => {
    assert.deepEqual(
      missingOf((s) => (s.freightPerKgIqd.kurdistan = null)),
      ["freight.kurdistan_per_kg_iqd"],
    );
    assert.deepEqual(
      missingOf((s) => (s.minFreightIqd = null)),
      ["freight.minimum_iqd"],
    );
    ok(
      run(
        [item()],
        settings((s) => (s.freightPerKgIqd.rest_of_iraq = null)),
        "erbil",
      ),
    );
  });
  it("customs rate of the category", () => {
    assert.deepEqual(
      missingOf((s) => (s.customsBp.fashion = null)),
      ["customs_bp.fashion"],
    );
  });
  it("R&L fee, free-delivery threshold and basis, validity", () => {
    assert.deepEqual(
      missingOf((s) => (s.rlFeeIqd = null)),
      ["fee.rl_iqd"],
    );
    assert.deepEqual(
      missingOf((s) => (s.freeDelivery.thresholdIqd = null)),
      ["free_delivery.threshold_iqd"],
    );
    assert.deepEqual(
      missingOf((s) => (s.freeDelivery.basis = null)),
      ["free_delivery.basis"],
    );
    assert.deepEqual(
      missingOf((s) => (s.validityHours = null)),
      ["quote.validity_hours"],
    );
  });
  it("the destination's zone and delivery fee (a governorate nobody filled in)", () => {
    assert.deepEqual(
      missingOf(() => {}, [item()], "basra"),
      ["delivery.basra.zone", "delivery.basra.fee_iqd"],
    );
  });
  it("category estimates only when the item has no weight or size", () => {
    const bare = item({ weightG: null, lengthMm: null, widthMm: null, heightMm: null });
    const m = missingOf(
      (s) =>
        (s.estimates.fashion = { weightG: null, lengthMm: null, widthMm: null, heightMm: null }),
      [bare],
    );
    assert.deepEqual(m, [
      "estimate.fashion.weight_g",
      "estimate.fashion.length_mm",
      "estimate.fashion.width_mm",
      "estimate.fashion.height_mm",
    ]);
    ok(
      run(
        [item()],
        settings(
          (s) =>
            (s.estimates.fashion = {
              weightG: null,
              lengthMm: null,
              widthMm: null,
              heightMm: null,
            }),
        ),
      ),
    );
  });
  it("a zero or negative stored rate counts as missing", () => {
    assert.deepEqual(
      missingOf((s) => (s.fxMicro.EUR = 0)),
      ["fx.EUR"],
    );
    assert.deepEqual(
      missingOf((s) => (s.volumetricDivisor = 0)),
      ["volumetric_divisor"],
    );
  });
  it("lists every missing key at once", () => {
    const m = missingOf((s) => {
      s.rlFeeIqd = null;
      s.minFreightIqd = null;
      s.fxMicro.EUR = null;
    });
    assert.deepEqual([...m].sort(), ["fee.rl_iqd", "freight.minimum_iqd", "fx.EUR"]);
  });
  it("a settings object built from NO stored rows only has the two policy defaults", () => {
    const empty = buildSettings([]);
    assert.equal(empty.volumetricDivisor, 5000);
    assert.equal(empty.freeDelivery.basis, "after_discount");
    for (const c of CURRENCIES) assert.equal(empty.fxMicro[c], null);
    for (const z of ZONES) assert.equal(empty.freightPerKgIqd[z], null);
    assert.equal(empty.rlFeeIqd, null);
    assert.equal(empty.minFreightIqd, null);
    assert.equal(empty.validityHours, null);
    assert.equal(empty.freeDelivery.thresholdIqd, null);
    assert.ok(missingSettings([item()], empty, "erbil").length > 5);
    assert.equal(fail(run([item()], empty)).code, "missing_settings");
  });
});

describe("calculateQuote: snapshot", () => {
  it("records exactly the settings that were used", () => {
    const q = ok(run([item()]));
    assert.deepEqual(q.settingsUsed, {
      volumetric_divisor: 5000,
      "delivery.erbil.zone": "kurdistan",
      "delivery.erbil.fee_iqd": 4000,
      "freight.kurdistan_per_kg_iqd": 10000,
      "freight.minimum_iqd": 20000,
      "fee.rl_iqd": 5000,
      "free_delivery.threshold_iqd": 200000,
      "free_delivery.basis": "after_discount",
      "quote.validity_hours": 48,
      "fx.EUR": 1_600_000_000,
      "customs_bp.fashion": 500,
    });
    assert.equal(q.validityHours, 48);
    assert.equal(q.expiresAt, "2026-10-22T12:00:00.000Z");
    assert.ok(q.rounding.total.includes("250"));
  });
});
