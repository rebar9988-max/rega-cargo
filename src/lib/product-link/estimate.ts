import {
  DESTS,
  getDest,
  getMode,
  getOrigin,
  iqdFromCents,
  priceShipment,
  MODES,
} from "../corridor.ts";
import { QUOTE_LIMITS, dimInRange, kgInRange } from "../quote-search.ts";

/**
 * Shipping ESTIMATE for a product link. The weight (and optional box size) comes from the
 * customer: we never guess it from a product page. Same pricing formula as /quote; the
 * result is an estimate, not a binding price, and excludes the goods and customs duty.
 */
export type LinkEstimateInput = {
  kg: unknown;
  l?: unknown;
  w?: unknown;
  h?: unknown;
  dest: unknown;
  mode?: unknown;
};

export type LinkEstimate = {
  estimate: true;
  shippingEur: number;
  shippingIqd: number;
  chargeableKg: number;
  daysMin: number;
  daysMax: number;
  modeId: string;
  destId: string;
};

export function estimateLinkShipping(input: LinkEstimateInput): LinkEstimate | null {
  const kg = Number(input.kg);
  if (!kgInRange(kg)) return null;
  const dest = DESTS.find((d) => d.id === input.dest);
  if (!dest) return null;
  const dim = (v: unknown) => {
    if (v == null || v === "") return 0;
    const n = Number(v);
    return dimInRange(n) ? n : NaN;
  };
  const [l, w, h] = [dim(input.l), dim(input.w), dim(input.h)];
  if ([l, w, h].some(Number.isNaN)) return null;
  const mode = MODES.find((m) => m.id === input.mode) ?? getMode(undefined);
  // Collection city: Düsseldorf is the Rhine-area desk nearest to the Cologne warehouse.
  const price = priceShipment({
    mode,
    origin: getOrigin("dus"),
    dest: getDest(dest.id),
    weightKg: kg,
    l,
    w,
    h,
  });
  return {
    estimate: true,
    shippingEur: price.total,
    shippingIqd: iqdFromCents(price.totalCents),
    chargeableKg: price.chargeable,
    daysMin: mode.days[0],
    daysMax: mode.days[1],
    modeId: mode.id,
    destId: dest.id,
  };
}

export { QUOTE_LIMITS };
