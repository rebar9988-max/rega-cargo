/**
 * Bring For Me Phase 1: fixed vocabularies and technical limits.
 * None of these is a business number (rates, fees, weights): those are owner-editable
 * settings (settings.ts) and stay unfilled until the owner sets them.
 */

/** Source currencies a product price may be in. Prices are kept in this currency. */
export const CURRENCIES = ["USD", "EUR", "TRY", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Same slugs as StoreCategory (src/lib/stores.ts); customs and size estimates are per category. */
export const CATEGORIES = [
  "beauty",
  "fashion",
  "electronics",
  "home",
  "baby",
  "sports",
  "food",
  "gaming",
  "auto",
  "pets",
  "general",
] as const;
export type Category = (typeof CATEGORIES)[number];

/** Freight zones. Which zone a governorate belongs to is an owner setting, not code. */
export const ZONES = ["kurdistan", "rest_of_iraq"] as const;
export type Zone = (typeof ZONES)[number];

/** Iraqi governorates (identifiers only). The customer chooses one; there is no default. */
export const GOVERNORATES = [
  { id: "erbil", name: "Erbil" },
  { id: "sulaymaniyah", name: "Sulaymaniyah" },
  { id: "duhok", name: "Duhok" },
  { id: "halabja", name: "Halabja" },
  { id: "baghdad", name: "Baghdad" },
  { id: "basra", name: "Basra" },
  { id: "nineveh", name: "Nineveh" },
  { id: "kirkuk", name: "Kirkuk" },
  { id: "anbar", name: "Anbar" },
  { id: "diyala", name: "Diyala" },
  { id: "salahuddin", name: "Salah ad-Din" },
  { id: "babil", name: "Babil" },
  { id: "karbala", name: "Karbala" },
  { id: "najaf", name: "Najaf" },
  { id: "qadisiyyah", name: "Al-Qadisiyyah" },
  { id: "wasit", name: "Wasit" },
  { id: "maysan", name: "Maysan" },
  { id: "dhi_qar", name: "Dhi Qar" },
  { id: "muthanna", name: "Al-Muthanna" },
] as const;
export type GovernorateId = (typeof GOVERNORATES)[number]["id"];
export const GOVERNORATE_IDS: ReadonlySet<string> = new Set(GOVERNORATES.map((g) => g.id));

/**
 * Technical limits of one Phase 1 shipment (a cart is exactly one shipment).
 * Weight and size caps reuse the existing /quote limits (QUOTE_LIMITS: 70 kg, 200 cm, 50 pieces).
 */
export const LIMITS = {
  maxLines: 30,
  maxPieces: 50,
  maxDistinctStores: 5,
  maxQuantityPerLine: 20,
  maxItemWeightG: 70_000,
  /** One shipment per cart in Phase 1: the summed chargeable weight may not pass this. */
  maxShipmentChargeableG: 70_000,
  maxDimMm: 2_000,
  maxPriceMinor: 1_000_000_000,
} as const;

/** Bumped whenever the calculation rules change; stored with every quote. */
export const ENGINE_VERSION = 1;

/** The total is rounded UP to the next multiple of this many IQD. */
export const ROUNDING_STEP_IQD = 250;
