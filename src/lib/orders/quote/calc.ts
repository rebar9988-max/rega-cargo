/**
 * calculateQuote: the one pure cost-estimate function for Bring For Me (Phase 1).
 *
 *   Total = Items + Customs + Freight + R&L fee + Home delivery - Coupon
 *
 * Exact integer arithmetic only (BigInt inside, safe integers at the edges): no floating-point
 * money anywhere. Prices stay in their source currency (minor units) and are converted to whole
 * IQD with the stored rate. A quote is an ESTIMATE, never a final price.
 *
 * Rounding rules (written into every quote snapshot):
 *  - item value, customs, freight, coupon: half-up to whole IQD, per line where there are lines;
 *  - chargeable weight: half-up to 0.1 kg (same convention as the existing pricing);
 *  - the total is rounded UP to the next 250 IQD.
 * Nothing here has a built-in business number: a missing setting refuses the quote.
 */
import {
  CATEGORIES,
  CURRENCIES,
  GOVERNORATE_IDS,
  LIMITS,
  ROUNDING_STEP_IQD,
  ZONES,
  type Category,
  type Currency,
  type Zone,
} from "./constants.ts";

export type SizeEstimate = {
  weightG: number | null;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
};

/** Typed owner settings. `null` = not filled in (see settings.ts for the stored keys). */
export type QuoteSettings = {
  /** IQD per 1 unit of the currency, times 1,000,000 (an integer, so rates keep 6 decimals). */
  fxMicro: Record<Currency, number | null>;
  volumetricDivisor: number | null;
  freightPerKgIqd: Record<Zone, number | null>;
  minFreightIqd: number | null;
  customsBp: Record<Category, number | null>;
  rlFeeIqd: number | null;
  delivery: Record<string, { zone: Zone | null; feeIqd: number | null } | undefined>;
  freeDelivery: {
    thresholdIqd: number | null;
    basis: "after_discount" | "before_discount" | null;
  };
  estimates: Record<Category, SizeEstimate>;
  validityHours: number | null;
};

export type QuoteItem = {
  id: string;
  /** Distinct-store key (store id or host); null counts as one unknown store. */
  storeKey: string | null;
  /** Unit price in minor units (cents, kuruş, pence) of `currency`. */
  priceMinor: number;
  currency: string;
  quantity: number;
  category: string;
  weightG: number | null;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
};

export type Coupon = {
  code: string;
  kind: "fixed_iqd" | "percent_bp";
  value: number;
  maxDiscountIqd: number | null;
  /** Minimum item value (IQD) the cart must reach before the coupon applies. */
  minItemsIqd: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  active: boolean;
};

export type QuoteOptions = {
  governorate: string | null | undefined;
  coupon?: Coupon | null;
  /** Injected so the function stays pure. */
  now: Date;
};

export type QuoteError =
  | { code: "empty_cart" }
  | { code: "invalid_item"; itemId: string; field: string }
  | { code: "limit_exceeded"; limit: "lines" | "pieces" | "stores" | "weight" }
  | { code: "destination_required" }
  | { code: "unknown_destination" }
  | { code: "missing_settings"; missing: string[] }
  | {
      code: "coupon_not_eligible";
      reason: "inactive" | "not_started" | "expired" | "minimum_not_met" | "invalid" | "unknown";
    };

export type QuoteLine = {
  id: string;
  itemsIqd: number;
  customsIqd: number;
  actualG: number;
  volumetricG: number;
  chargeableG: number;
  weightSource: "item" | "category_estimate";
  sizeSource: "item" | "category_estimate";
};

export type Quote = {
  isEstimate: true;
  destination: { governorate: string; zone: Zone };
  breakdown: {
    itemsIqd: number;
    customsIqd: number;
    freightIqd: number;
    rlFeeIqd: number;
    homeDeliveryIqd: number;
    couponIqd: number;
    subtotalIqd: number;
    rawTotalIqd: number;
    roundingIqd: number;
    totalIqd: number;
  };
  freight: {
    zone: Zone;
    chargeableG: number;
    chargeableKgTenths: number;
    ratePerKgIqd: number;
    minimumIqd: number;
    minimumApplied: boolean;
  };
  freeDelivery: {
    thresholdIqd: number;
    basis: "after_discount" | "before_discount";
    spentIqd: number;
    leftIqd: number;
    reached: boolean;
  };
  coupon: { code: string; discountIqd: number } | null;
  lines: QuoteLine[];
  /** Every setting this quote used (flat key to value). Saved with the quote. */
  settingsUsed: Record<string, number | string>;
  rounding: Record<string, string>;
  validityHours: number;
  expiresAt: string;
};

export type QuoteResult = { ok: true; quote: Quote } | { ok: false; error: QuoteError };

const isInt = (v: unknown): v is number => typeof v === "number" && Number.isSafeInteger(v);
const isNonNeg = (v: unknown): v is number => isInt(v) && v >= 0;
const isPos = (v: unknown): v is number => isInt(v) && v > 0;
const isBp = (v: unknown): v is number => isInt(v) && v >= 0 && v <= 10_000;
const isZone = (v: unknown): v is Zone =>
  typeof v === "string" && (ZONES as readonly string[]).includes(v);
const isCurrency = (v: unknown): v is Currency =>
  typeof v === "string" && (CURRENCIES as readonly string[]).includes(v);
const isCategory = (v: unknown): v is Category =>
  typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);

/** Half-up integer division for non-negative operands. */
function divHalfUp(n: bigint, d: bigint): bigint {
  return (2n * n + d) / (2n * d);
}

function validate(items: readonly QuoteItem[]): QuoteError | null {
  if (items.length === 0) return { code: "empty_cart" };
  if (items.length > LIMITS.maxLines) return { code: "limit_exceeded", limit: "lines" };
  let pieces = 0;
  const stores = new Set<string>();
  for (const item of items) {
    const bad = (field: string): QuoteError => ({
      code: "invalid_item",
      itemId: String(item?.id ?? ""),
      field,
    });
    if (typeof item?.id !== "string" || !item.id) return bad("id");
    if (!isPos(item.priceMinor) || item.priceMinor > LIMITS.maxPriceMinor) return bad("price");
    if (!isCurrency(item.currency)) return bad("currency");
    if (!isInt(item.quantity) || item.quantity < 1 || item.quantity > LIMITS.maxQuantityPerLine)
      return bad("quantity");
    if (!isCategory(item.category)) return bad("category");
    if (item.weightG !== null && (!isPos(item.weightG) || item.weightG > LIMITS.maxItemWeightG))
      return bad("weight");
    for (const [field, dim] of [
      ["length", item.lengthMm],
      ["width", item.widthMm],
      ["height", item.heightMm],
    ] as const) {
      if (dim !== null && (!isPos(dim) || dim > LIMITS.maxDimMm)) return bad(field);
    }
    pieces += item.quantity;
    stores.add(item.storeKey ?? "unknown");
  }
  if (pieces > LIMITS.maxPieces) return { code: "limit_exceeded", limit: "pieces" };
  if (stores.size > LIMITS.maxDistinctStores) return { code: "limit_exceeded", limit: "stores" };
  return null;
}

const hasSize = (i: QuoteItem) => i.lengthMm !== null && i.widthMm !== null && i.heightMm !== null;

/** The settings this exact cart and destination needs. Empty list = the quote can be computed. */
export function missingSettings(
  items: readonly QuoteItem[],
  settings: QuoteSettings,
  governorate: string,
): string[] {
  const missing: string[] = [];
  const need = (ok: boolean, key: string) => {
    if (!ok && !missing.includes(key)) missing.push(key);
  };
  need(isPos(settings.volumetricDivisor), "volumetric_divisor");
  for (const currency of new Set(items.map((i) => i.currency))) {
    if (isCurrency(currency)) need(isPos(settings.fxMicro[currency]), `fx.${currency}`);
  }
  const delivery = settings.delivery[governorate];
  need(isZone(delivery?.zone), `delivery.${governorate}.zone`);
  need(isNonNeg(delivery?.feeIqd), `delivery.${governorate}.fee_iqd`);
  if (isZone(delivery?.zone)) {
    need(isNonNeg(settings.freightPerKgIqd[delivery.zone]), `freight.${delivery.zone}_per_kg_iqd`);
  }
  need(isNonNeg(settings.minFreightIqd), "freight.minimum_iqd");
  need(isNonNeg(settings.rlFeeIqd), "fee.rl_iqd");
  need(isNonNeg(settings.freeDelivery.thresholdIqd), "free_delivery.threshold_iqd");
  need(
    settings.freeDelivery.basis === "after_discount" ||
      settings.freeDelivery.basis === "before_discount",
    "free_delivery.basis",
  );
  need(isPos(settings.validityHours), "quote.validity_hours");
  for (const item of items) {
    if (!isCategory(item.category)) continue;
    const category = item.category;
    need(isBp(settings.customsBp[category]), `customs_bp.${category}`);
    const est = settings.estimates[category];
    if (item.weightG === null) need(isPos(est.weightG), `estimate.${category}.weight_g`);
    if (!hasSize(item)) {
      need(isPos(est.lengthMm), `estimate.${category}.length_mm`);
      need(isPos(est.widthMm), `estimate.${category}.width_mm`);
      need(isPos(est.heightMm), `estimate.${category}.height_mm`);
    }
  }
  return missing;
}

function couponProblem(
  coupon: Coupon,
  itemsIqd: number,
  now: Date,
): Extract<QuoteError, { code: "coupon_not_eligible" }>["reason"] | null {
  const valid =
    coupon &&
    typeof coupon.code === "string" &&
    (coupon.kind === "fixed_iqd" || coupon.kind === "percent_bp") &&
    isPos(coupon.value) &&
    (coupon.kind === "fixed_iqd" || coupon.value <= 10_000) &&
    (coupon.maxDiscountIqd === null || isNonNeg(coupon.maxDiscountIqd)) &&
    (coupon.minItemsIqd === null || isNonNeg(coupon.minItemsIqd));
  if (!valid) return "invalid";
  if (coupon.active !== true) return "inactive";
  const at = now.getTime();
  if (coupon.startsAt !== null) {
    const start = Date.parse(coupon.startsAt);
    if (Number.isNaN(start)) return "invalid";
    if (at < start) return "not_started";
  }
  // A coupon must expire: no expiry date means it is not usable.
  if (coupon.expiresAt === null) return "invalid";
  const end = Date.parse(coupon.expiresAt);
  if (Number.isNaN(end)) return "invalid";
  if (at >= end) return "expired";
  if (coupon.minItemsIqd !== null && itemsIqd < coupon.minItemsIqd) return "minimum_not_met";
  return null;
}

export function calculateQuote(
  items: readonly QuoteItem[],
  settings: QuoteSettings,
  options: QuoteOptions,
): QuoteResult {
  const invalid = validate(items);
  if (invalid) return { ok: false, error: invalid };
  const governorate = options.governorate;
  if (!governorate) return { ok: false, error: { code: "destination_required" } };
  if (!GOVERNORATE_IDS.has(governorate))
    return { ok: false, error: { code: "unknown_destination" } };
  const missing = missingSettings(items, settings, governorate);
  if (missing.length) return { ok: false, error: { code: "missing_settings", missing } };

  // Everything below is guaranteed present by missingSettings().
  const delivery = settings.delivery[governorate]!;
  const zone = delivery.zone as Zone;
  const divisor = BigInt(settings.volumetricDivisor as number);
  const used: Record<string, number | string> = {
    volumetric_divisor: settings.volumetricDivisor as number,
    [`delivery.${governorate}.zone`]: zone,
    [`delivery.${governorate}.fee_iqd`]: delivery.feeIqd as number,
    [`freight.${zone}_per_kg_iqd`]: settings.freightPerKgIqd[zone] as number,
    "freight.minimum_iqd": settings.minFreightIqd as number,
    "fee.rl_iqd": settings.rlFeeIqd as number,
    "free_delivery.threshold_iqd": settings.freeDelivery.thresholdIqd as number,
    "free_delivery.basis": settings.freeDelivery.basis as string,
    "quote.validity_hours": settings.validityHours as number,
  };

  let itemsIqd = 0n;
  let customsIqd = 0n;
  let totalG = 0n;
  const lines: QuoteLine[] = [];
  for (const item of items) {
    const currency = item.currency as Currency;
    const category = item.category as Category;
    const rate = settings.fxMicro[currency] as number;
    const bp = settings.customsBp[category] as number;
    const est = settings.estimates[category];
    used[`fx.${currency}`] = rate;
    used[`customs_bp.${category}`] = bp;

    const lineItems = divHalfUp(
      BigInt(item.priceMinor) * BigInt(item.quantity) * BigInt(rate),
      100n * 1_000_000n,
    );
    const lineCustoms = divHalfUp(lineItems * BigInt(bp), 10_000n);

    const weightFromItem = item.weightG !== null;
    const unitWeightG = BigInt(weightFromItem ? (item.weightG as number) : (est.weightG as number));
    if (!weightFromItem) used[`estimate.${category}.weight_g`] = est.weightG as number;
    const sizeFromItem = hasSize(item);
    const [l, w, h] = sizeFromItem
      ? [item.lengthMm as number, item.widthMm as number, item.heightMm as number]
      : [est.lengthMm as number, est.widthMm as number, est.heightMm as number];
    if (!sizeFromItem) {
      used[`estimate.${category}.length_mm`] = l;
      used[`estimate.${category}.width_mm`] = w;
      used[`estimate.${category}.height_mm`] = h;
    }
    // cm3 / divisor = kg  =>  mm3 / divisor = g
    const unitVolumetricG = divHalfUp(BigInt(l) * BigInt(w) * BigInt(h), divisor);
    const qty = BigInt(item.quantity);
    const actualG = unitWeightG * qty;
    const volumetricG = unitVolumetricG * qty;
    const chargeableG = actualG > volumetricG ? actualG : volumetricG;

    itemsIqd += lineItems;
    customsIqd += lineCustoms;
    totalG += chargeableG;
    lines.push({
      id: item.id,
      itemsIqd: Number(lineItems),
      customsIqd: Number(lineCustoms),
      actualG: Number(actualG),
      volumetricG: Number(volumetricG),
      chargeableG: Number(chargeableG),
      weightSource: weightFromItem ? "item" : "category_estimate",
      sizeSource: sizeFromItem ? "item" : "category_estimate",
    });
  }

  // Phase 1 prices ONE shipment per cart, so the whole cart has to fit in one.
  if (totalG > BigInt(LIMITS.maxShipmentChargeableG)) {
    return { ok: false, error: { code: "limit_exceeded", limit: "weight" } };
  }

  // One shipment: chargeable weight is summed, rounded half-up to 0.1 kg, then rated once.
  const kgTenths = divHalfUp(totalG, 100n);
  const ratePerKg = BigInt(settings.freightPerKgIqd[zone] as number);
  const rated = divHalfUp(kgTenths * ratePerKg, 10n);
  const minFreight = BigInt(settings.minFreightIqd as number);
  const minimumApplied = rated < minFreight;
  const freightIqd = minimumApplied ? minFreight : rated;
  const rlFeeIqd = BigInt(settings.rlFeeIqd as number);

  // Coupon: applies to everything except home delivery, never more than that base.
  const base = itemsIqd + customsIqd + freightIqd + rlFeeIqd;
  let discount = 0n;
  let coupon: { code: string; discountIqd: number } | null = null;
  if (options.coupon) {
    const problem = couponProblem(options.coupon, Number(itemsIqd), options.now);
    if (problem) return { ok: false, error: { code: "coupon_not_eligible", reason: problem } };
    discount =
      options.coupon.kind === "fixed_iqd"
        ? BigInt(options.coupon.value)
        : divHalfUp(base * BigInt(options.coupon.value), 10_000n);
    if (options.coupon.maxDiscountIqd !== null) {
      const cap = BigInt(options.coupon.maxDiscountIqd);
      if (discount > cap) discount = cap;
    }
    if (discount > base) discount = base;
    coupon = { code: options.coupon.code, discountIqd: Number(discount) };
  }

  // Free-delivery progress is measured on the item value, before or after the coupon (setting).
  const basis = settings.freeDelivery.basis as "after_discount" | "before_discount";
  const afterDiscount = itemsIqd > discount ? itemsIqd - discount : 0n;
  const spent = basis === "after_discount" ? afterDiscount : itemsIqd;
  const threshold = BigInt(settings.freeDelivery.thresholdIqd as number);
  const reached = spent >= threshold;
  const homeDelivery = reached ? 0n : BigInt(delivery.feeIqd as number);

  const raw = base + homeDelivery - discount; // >= 0 because discount <= base
  const step = BigInt(ROUNDING_STEP_IQD);
  const total = ((raw + step - 1n) / step) * step;

  const hours = settings.validityHours as number;
  return {
    ok: true,
    quote: {
      isEstimate: true,
      destination: { governorate, zone },
      breakdown: {
        itemsIqd: Number(itemsIqd),
        customsIqd: Number(customsIqd),
        freightIqd: Number(freightIqd),
        rlFeeIqd: Number(rlFeeIqd),
        homeDeliveryIqd: Number(homeDelivery),
        couponIqd: Number(discount),
        subtotalIqd: Number(base),
        rawTotalIqd: Number(raw),
        roundingIqd: Number(total - raw),
        totalIqd: Number(total),
      },
      freight: {
        zone,
        chargeableG: Number(totalG),
        chargeableKgTenths: Number(kgTenths),
        ratePerKgIqd: Number(ratePerKg),
        minimumIqd: Number(minFreight),
        minimumApplied,
      },
      freeDelivery: {
        thresholdIqd: Number(threshold),
        basis,
        spentIqd: Number(spent),
        leftIqd: Number(reached ? 0n : threshold - spent),
        reached,
      },
      coupon,
      lines,
      settingsUsed: used,
      rounding: {
        itemsAndCustoms: "half_up_whole_iqd_per_line",
        chargeableWeight: "half_up_to_100_g",
        freightAndCoupon: "half_up_whole_iqd",
        total: `up_to_next_${ROUNDING_STEP_IQD}_iqd`,
      },
      validityHours: hours,
      expiresAt: new Date(options.now.getTime() + hours * 3_600_000).toISOString(),
    },
  };
}
