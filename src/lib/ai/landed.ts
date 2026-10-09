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
};

export type LandedEstimate = {
  itemEur: number;
  shippingEur: number;
  dutyEur: number;
  totalEur: number;
  totalIqd: number;
  chargeableKg: number;
};

export function landedEstimate(input: LandedInput): LandedEstimate | null {
  const { priceEur, weightKg } = input;
  if (!Number.isFinite(priceEur) || !Number.isFinite(weightKg)) return null;
  if (priceEur <= 0 || priceEur > 50_000 || weightKg <= 0 || weightKg > 500) return null;
  const price = priceShipment({
    mode: getMode(input.modeId),
    origin: getOrigin(input.originId),
    dest: getDest(input.destId),
    weightKg,
    l: 0,
    w: 0,
    h: 0,
  });
  // Integer cents throughout; IQD is converted once, from the final cent total.
  const itemCents = toCents(priceEur);
  const itemEur = itemCents / 100;
  const dutyCents = toCents(dutyEstimate(input.contents ?? "personal", itemEur));
  const totalCents = itemCents + price.totalCents + dutyCents;
  return {
    itemEur,
    shippingEur: price.total,
    dutyEur: dutyCents / 100,
    totalEur: totalCents / 100,
    totalIqd: iqdFromCents(totalCents),
    chargeableKg: price.chargeable,
  };
}
