/**
 * Owner-editable Bring For Me settings: the closed registry of keys, value validation and the
 * conversion of stored rows into the typed QuoteSettings used by calculateQuote().
 *
 * Pure (no database, no framework). Stored in `bfm_settings` (key text, value jsonb).
 *
 * The code ships NO business numbers. Only two keys have a code default, both policy rather
 * than money: the volumetric divisor (5000, the spec's default) and the free-delivery basis
 * ("after_discount", the conservative reading). Every other key is "unfilled" until the owner
 * sets it, and a quote that needs an unfilled key is refused.
 */
import { CATEGORIES, CURRENCIES, GOVERNORATES, ZONES, type Category } from "./constants.ts";
import type { QuoteSettings, SizeEstimate } from "./calc.ts";

export type SettingKind = "int" | "enum";
export type SettingDef = {
  key: string;
  group: string;
  label: string;
  unit: string;
  kind: SettingKind;
  min?: number;
  max?: number;
  values?: readonly string[];
  default?: number | string;
};

const defs: SettingDef[] = [];
const add = (def: SettingDef) => defs.push(def);

for (const c of CURRENCIES) {
  add({
    key: `fx.${c}`,
    group: "exchange_rates",
    label: `IQD per 1 ${c}, times 1,000,000 (1 ${c} = 1,520.5 IQD is stored as 1520500000)`,
    unit: "micro_iqd",
    kind: "int",
    min: 1,
    max: 1_000_000_000_000,
  });
}
add({
  key: "volumetric_divisor",
  group: "freight",
  label: "Volumetric divisor (L x W x H in cm / divisor = kg)",
  unit: "number",
  kind: "int",
  min: 1000,
  max: 100_000,
  default: 5000,
});
for (const z of ZONES) {
  add({
    key: `freight.${z}_per_kg_iqd`,
    group: "freight",
    label: `Freight Germany to ${z === "kurdistan" ? "Kurdistan" : "rest of Iraq"}, per chargeable kg`,
    unit: "iqd",
    kind: "int",
    min: 0,
    max: 10_000_000,
  });
}
add({
  key: "freight.minimum_iqd",
  group: "freight",
  label: "Minimum freight per shipment",
  unit: "iqd",
  kind: "int",
  min: 0,
  max: 100_000_000,
});
for (const c of CATEGORIES) {
  add({
    key: `customs_bp.${c}`,
    group: "customs",
    label: `Customs rate for ${c}, in basis points (500 = 5%)`,
    unit: "bp",
    kind: "int",
    min: 0,
    max: 10_000,
  });
}
add({
  key: "fee.rl_iqd",
  group: "fees",
  label: "R&L service fee per shipment",
  unit: "iqd",
  kind: "int",
  min: 0,
  max: 100_000_000,
});
for (const g of GOVERNORATES) {
  add({
    key: `delivery.${g.id}.zone`,
    group: "delivery",
    label: `Freight zone of ${g.name}`,
    unit: "zone",
    kind: "enum",
    values: ZONES,
  });
  add({
    key: `delivery.${g.id}.fee_iqd`,
    group: "delivery",
    label: `Home delivery fee in ${g.name}`,
    unit: "iqd",
    kind: "int",
    min: 0,
    max: 100_000_000,
  });
}
add({
  key: "free_delivery.threshold_iqd",
  group: "delivery",
  label: "Item value from which home delivery is free",
  unit: "iqd",
  kind: "int",
  min: 0,
  max: 10_000_000_000,
});
add({
  key: "free_delivery.basis",
  group: "delivery",
  label: "Free-delivery threshold measured before or after the coupon",
  unit: "enum",
  kind: "enum",
  values: ["after_discount", "before_discount"],
  default: "after_discount",
});
add({
  key: "quote.validity_hours",
  group: "quotes",
  label: "Hours a quote estimate stays valid",
  unit: "hours",
  kind: "int",
  min: 1,
  max: 720,
});
for (const c of CATEGORIES) {
  for (const [suffix, label, max] of [
    ["weight_g", "weight in grams", 70_000],
    ["length_mm", "length in mm", 2_000],
    ["width_mm", "width in mm", 2_000],
    ["height_mm", "height in mm", 2_000],
  ] as const) {
    add({
      key: `estimate.${c}.${suffix}`,
      group: "estimates",
      label: `Typical ${c} item: ${label} (used only when the item has none)`,
      unit: suffix.endsWith("_g") ? "g" : "mm",
      kind: "int",
      min: 1,
      max,
    });
  }
}

export const SETTING_DEFS: readonly SettingDef[] = defs;
const BY_KEY = new Map(defs.map((d) => [d.key, d]));
export const SETTING_KEYS: ReadonlySet<string> = new Set(BY_KEY.keys());

/** A stored value for `key`, or null (= clear it). Unknown keys and bad values are refused. */
export function parseSettingValue(
  key: string,
  value: unknown,
): { ok: true; value: number | string | null } | { ok: false } {
  const def = BY_KEY.get(key);
  if (!def) return { ok: false };
  if (value === null) return { ok: true, value: null };
  if (def.kind === "int") {
    if (typeof value !== "number" || !Number.isSafeInteger(value)) return { ok: false };
    if (value < (def.min ?? 0) || value > (def.max ?? Number.MAX_SAFE_INTEGER))
      return { ok: false };
    return { ok: true, value };
  }
  if (typeof value !== "string" || !def.values?.includes(value)) return { ok: false };
  return { ok: true, value };
}

export type SettingRow = { key: string; value: unknown };

function valueFor(map: Map<string, unknown>, key: string): number | string | null {
  const def = BY_KEY.get(key);
  const stored = map.get(key);
  if (stored !== undefined && stored !== null) {
    const parsed = parseSettingValue(key, stored);
    // A stored value that no longer validates counts as unfilled, never as a number.
    if (parsed.ok && parsed.value !== null) return parsed.value;
    return null;
  }
  return def?.default ?? null;
}

const intOrNull = (v: number | string | null) => (typeof v === "number" ? v : null);

/** Typed settings from stored rows. Missing rows become `null` (or the two code defaults). */
export function buildSettings(rows: readonly SettingRow[]): QuoteSettings {
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const int = (key: string) => intOrNull(valueFor(map, key));
  const fxMicro = Object.fromEntries(CURRENCIES.map((c) => [c, int(`fx.${c}`)]));
  const freightPerKgIqd = Object.fromEntries(ZONES.map((z) => [z, int(`freight.${z}_per_kg_iqd`)]));
  const customsBp = Object.fromEntries(CATEGORIES.map((c) => [c, int(`customs_bp.${c}`)]));
  const estimates = Object.fromEntries(
    CATEGORIES.map((c) => [
      c,
      {
        weightG: int(`estimate.${c}.weight_g`),
        lengthMm: int(`estimate.${c}.length_mm`),
        widthMm: int(`estimate.${c}.width_mm`),
        heightMm: int(`estimate.${c}.height_mm`),
      } satisfies SizeEstimate,
    ]),
  );
  const delivery: QuoteSettings["delivery"] = {};
  for (const g of GOVERNORATES) {
    const zone = valueFor(map, `delivery.${g.id}.zone`);
    delivery[g.id] = {
      zone: zone === "kurdistan" || zone === "rest_of_iraq" ? zone : null,
      feeIqd: int(`delivery.${g.id}.fee_iqd`),
    };
  }
  const basis = valueFor(map, "free_delivery.basis");
  return {
    fxMicro: fxMicro as QuoteSettings["fxMicro"],
    volumetricDivisor: int("volumetric_divisor"),
    freightPerKgIqd: freightPerKgIqd as QuoteSettings["freightPerKgIqd"],
    minFreightIqd: int("freight.minimum_iqd"),
    customsBp: customsBp as QuoteSettings["customsBp"],
    rlFeeIqd: int("fee.rl_iqd"),
    delivery,
    freeDelivery: {
      thresholdIqd: int("free_delivery.threshold_iqd"),
      basis: basis === "after_discount" || basis === "before_discount" ? basis : null,
    },
    estimates: estimates as Record<Category, SizeEstimate>,
    validityHours: int("quote.validity_hours"),
  };
}

export type SettingState = "filled" | "default" | "unfilled";
export type SettingStatus = SettingDef & {
  value: number | string | null;
  state: SettingState;
  revision: number | null;
};

/** Every key with its current value and whether the owner has filled it in. */
export function describeSettings(
  rows: readonly (SettingRow & { revision?: number })[],
): SettingStatus[] {
  const map = new Map(rows.map((r) => [r.key, r]));
  return defs.map((def) => {
    const row = map.get(def.key);
    const stored = row ? parseSettingValue(def.key, row.value) : null;
    if (stored?.ok && stored.value !== null) {
      return { ...def, value: stored.value, state: "filled", revision: row?.revision ?? null };
    }
    if (def.default !== undefined) {
      return { ...def, value: def.default, state: "default", revision: row?.revision ?? null };
    }
    return { ...def, value: null, state: "unfilled", revision: row?.revision ?? null };
  });
}

/** Keys that have no value and no default: what the owner still has to fill in. */
export function unfilledKeys(rows: readonly SettingRow[]): string[] {
  return describeSettings(rows)
    .filter((s) => s.state === "unfilled")
    .map((s) => s.key);
}
