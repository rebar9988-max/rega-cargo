import {
  dutyEstimate,
  getDest,
  getMode,
  getOrigin,
  iqdFromCents,
  priceShipment,
  toCents,
  type Contents,
} from "../corridor.ts";

/**
 * Optional landed-cost ESTIMATE for a product the visitor already has a price
 * for (they type it; the AI never supplies prices). Uses the same corridor
 * pricing and duty rules as /quote.
 */
export type LandedInput = {
  priceEur: number;
  weightKg: number;
  originId?: string;
  destId?: string;
  modeId?: string;
  contents?: Contents;
  l?: number;
  w?: number;
  h?: number;
  shopShippingEur?: number;
  serviceFeeEur?: number;
};

export type LandedEstimate = {
  itemEur: number;
  shippingEur: number;
  dutyEur: number;
  totalEur: number;
  totalIqd: number;
  chargeableKg: number;
  dimensionsKnown: boolean;
  shopShippingEur: number | null;
  serviceFeeEur: number | null;
  unknownCosts: string[];
};

export function landedEstimate(input: LandedInput): LandedEstimate | null {
  const { priceEur, weightKg } = input;
  if (!Number.isFinite(priceEur) || !Number.isFinite(weightKg)) return null;
  if (priceEur <= 0 || priceEur > 50_000 || weightKg <= 0 || weightKg > 500) return null;
  const dimensions = [input.l, input.w, input.h];
  const dimensionsKnown = dimensions.every((value) => value !== undefined);
  if (
    dimensions.some((value) => value !== undefined) &&
    (!dimensionsKnown ||
      dimensions.some((value) => !Number.isFinite(value) || value! <= 0 || value! > 300))
  )
    return null;
  for (const fee of [input.shopShippingEur, input.serviceFeeEur]) {
    if (fee !== undefined && (!Number.isFinite(fee) || fee < 0 || fee > 50_000)) return null;
  }
  const price = priceShipment({
    mode: getMode(input.modeId),
    origin: getOrigin(input.originId),
    dest: getDest(input.destId),
    weightKg,
    l: input.l ?? 0,
    w: input.w ?? 0,
    h: input.h ?? 0,
  });
  // Integer cents throughout; IQD is converted once, from the final cent total.
  const itemCents = toCents(priceEur);
  const itemEur = itemCents / 100;
  const dutyCents = toCents(dutyEstimate(input.contents ?? "personal", itemEur));
  const totalCents =
    itemCents +
    price.totalCents +
    dutyCents +
    toCents(input.shopShippingEur ?? 0) +
    toCents(input.serviceFeeEur ?? 0);
  return {
    itemEur,
    shippingEur: price.total,
    dutyEur: dutyCents / 100,
    totalEur: totalCents / 100,
    totalIqd: iqdFromCents(totalCents),
    chargeableKg: price.chargeable,
    dimensionsKnown,
    shopShippingEur:
      input.shopShippingEur === undefined ? null : toCents(input.shopShippingEur) / 100,
    serviceFeeEur: input.serviceFeeEur === undefined ? null : toCents(input.serviceFeeEur) / 100,
    unknownCosts: [
      ...(!dimensionsKnown ? ["dimensions"] : []),
      ...(input.shopShippingEur === undefined ? ["shopShipping"] : []),
      ...(input.serviceFeeEur === undefined ? ["serviceFee"] : []),
    ],
  };
}
