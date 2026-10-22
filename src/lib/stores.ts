import { getJson, setJson } from "./storage.ts";

/**
 * Stable category slugs. The first six predate the ten-group catalogue and keep their URLs
 * (?cat=beauty …); food, gaming, auto and pets complete the ten primary groups (src/lib/catalogue.ts).
 */
export type StoreCategory =
  | "beauty"
  | "fashion"
  | "electronics"
  | "home"
  | "baby"
  | "sports"
  | "food"
  | "gaming"
  | "auto"
  | "pets"
  | "general";

export type StoreNote = "amazon" | "ebay" | "otto" | "zalando" | "shein" | "sephora" | "link";

export type StoreCaution = "perfume" | "aerosol" | "battery" | "cosmetics";

/** Extend this data configuration when additional store origins are introduced. */
export const STORE_COUNTRIES = ["DE", "CH", "IT", "FR", "GB", "INT"] as const;

export type StoreEntry = {
  id: string;
  name: string;
  host: string;
  url: string;
  country: (typeof STORE_COUNTRIES)[number];
  categories: StoreCategory[];
  note: StoreNote;
  caution: StoreCaution[];
};

/** Official storefronts only. None of these are partnerships. */
export const STORES: StoreEntry[] = [
  {
    id: "amazon-de",
    name: "Amazon",
    host: "amazon.de",
    url: "https://www.amazon.de/",
    country: "DE",
    categories: [
      "general",
      "electronics",
      "home",
      "baby",
      "fashion",
      "beauty",
      "sports",
      "food",
      "gaming",
      "auto",
      "pets",
    ],
    note: "amazon",
    caution: ["battery", "aerosol"],
  },
  {
    id: "otto",
    name: "OTTO",
    host: "otto.de",
    url: "https://www.otto.de/",
    country: "DE",
    categories: ["home", "fashion", "electronics", "baby", "sports", "gaming"],
    note: "otto",
    caution: ["battery"],
  },
  {
    id: "ebay-de",
    name: "eBay",
    host: "ebay.de",
    url: "https://www.ebay.de/",
    country: "DE",
    categories: ["general", "electronics", "fashion", "home", "sports", "gaming", "auto", "pets"],
    note: "ebay",
    caution: ["battery"],
  },
  {
    id: "zalando",
    name: "Zalando",
    host: "zalando.de",
    url: "https://www.zalando.de/",
    country: "DE",
    categories: ["fashion"],
    note: "zalando",
    caution: [],
  },
  {
    id: "dm",
    name: "dm",
    host: "dm.de",
    url: "https://www.dm.de/",
    country: "DE",
    categories: ["beauty", "home", "baby", "food", "pets"],
    note: "link",
    caution: ["perfume", "aerosol", "cosmetics"],
  },
  {
    id: "rossmann",
    name: "Rossmann",
    host: "rossmann.de",
    url: "https://www.rossmann.de/",
    country: "DE",
    categories: ["beauty", "home", "baby", "food", "pets"],
    note: "link",
    caution: ["perfume", "aerosol", "cosmetics"],
  },
  {
    id: "douglas",
    name: "Douglas",
    host: "douglas.de",
    url: "https://www.douglas.de/",
    country: "DE",
    categories: ["beauty"],
    note: "link",
    caution: ["perfume", "aerosol", "cosmetics"],
  },
  {
    id: "sephora",
    name: "Sephora",
    host: "sephora.de",
    url: "https://www.sephora.de/",
    country: "DE",
    categories: ["beauty"],
    note: "sephora",
    caution: ["perfume", "aerosol", "cosmetics"],
  },
  {
    id: "decathlon",
    name: "Decathlon",
    host: "decathlon.de",
    url: "https://www.decathlon.de/",
    country: "DE",
    categories: ["sports"],
    note: "link",
    caution: ["battery"],
  },
  {
    id: "shein",
    name: "SHEIN",
    host: "shein.com",
    url: "https://www.shein.com/",
    country: "INT",
    categories: ["fashion"],
    note: "shein",
    caution: [],
  },
  {
    id: "idealo",
    name: "idealo",
    host: "idealo.de",
    url: "https://www.idealo.de/",
    country: "DE",
    categories: [
      "general",
      "electronics",
      "home",
      "beauty",
      "fashion",
      "sports",
      "baby",
      "food",
      "gaming",
      "auto",
      "pets",
    ],
    note: "link",
    caution: [],
  },
];

/** Countries of the European stores directory, in the owner's order (2026-10-22). */
export const EUROPEAN_COUNTRIES = ["DE", "CH", "IT", "FR", "GB"] as const;
export type EuropeanCountry = (typeof EUROPEAN_COUNTRIES)[number];

export function isEuropeanCountry(value: string | undefined): value is EuropeanCountry {
  return EUROPEAN_COUNTRIES.includes(value as EuropeanCountry);
}

/**
 * A country storefront of a retailer already in STORES, shown only in the European stores
 * directory. `brand` is that retailer's STORES id (its logo, notes and Bring For Me entry).
 * Each URL was opened on its official site on 2026-10-22 (docs/verification).
 */
export type DirectoryStore = Omit<StoreEntry, "country"> & {
  country: EuropeanCountry;
  brand: string;
};

const storefront = (brand: string, country: EuropeanCountry, host: string): DirectoryStore => {
  const base = STORES.find((store) => store.id === brand)!;
  return {
    ...base,
    id: `${brand.replace(/-de$/, "")}-${country.toLowerCase()}`,
    host,
    url: `https://www.${host}/`,
    country,
    brand,
    // The brand's API notes describe its German site; no approval is known for this one.
    note: "link",
  };
};

export const REGIONAL_STOREFRONTS: DirectoryStore[] = [
  storefront("zalando", "CH", "zalando.ch"),
  storefront("decathlon", "CH", "decathlon.ch"),
  storefront("ebay-de", "CH", "ebay.ch"),
  storefront("amazon-de", "IT", "amazon.it"),
  storefront("zalando", "IT", "zalando.it"),
  storefront("ebay-de", "IT", "ebay.it"),
  storefront("decathlon", "IT", "decathlon.it"),
  storefront("sephora", "IT", "sephora.it"),
  storefront("douglas", "IT", "douglas.it"),
  storefront("amazon-de", "FR", "amazon.fr"),
  storefront("zalando", "FR", "zalando.fr"),
  storefront("ebay-de", "FR", "ebay.fr"),
  storefront("decathlon", "FR", "decathlon.fr"),
  storefront("sephora", "FR", "sephora.fr"),
  storefront("amazon-de", "GB", "amazon.co.uk"),
  storefront("zalando", "GB", "zalando.co.uk"),
  storefront("ebay-de", "GB", "ebay.co.uk"),
  storefront("decathlon", "GB", "decathlon.co.uk"),
  storefront("sephora", "GB", "sephora.co.uk"),
];

/**
 * The European stores directory: the STORES entries in an authorized country, then the
 * country storefronts. Stores elsewhere (SHEIN, "INT") stay in STORES for every other use.
 */
export const DIRECTORY_STORES: DirectoryStore[] = [
  ...STORES.flatMap((store) =>
    isEuropeanCountry(store.country) ? [{ ...store, country: store.country, brand: store.id }] : [],
  ),
  ...REGIONAL_STOREFRONTS,
];

/**
 * Every store Bring For Me accepts (owner instruction 2026-10-22): STORES plus the verified
 * country storefronts. Requests are validated against this list (lib/orders/store-request.ts),
 * so a storefront's product links must be on its own official host. STORES alone still drives
 * the header search and the R&L AI shop-name filter.
 */
export const BRING_FOR_ME_STORES: StoreEntry[] = [...STORES, ...REGIONAL_STOREFRONTS];

/** Self-hosted official logo (Wikimedia Commons; see public/store-logos/LOGOS.md). */
export function storeLogo(id: string): string {
  return `/store-logos/${id}.svg`;
}

/**
 * Width ÷ height of each logo's SVG viewBox (checked against the files in directory.test.ts).
 * Wordmarks range from 1.5 (dm) to 7.7 (Sephora), so one fixed height makes some logos tiny
 * and others heavy.
 */
export const STORE_LOGO_RATIO: Record<string, number> = {
  "amazon-de": 603 / 182,
  decathlon: 1958 / 389,
  dm: 163.4859612 / 108.1751412,
  douglas: 680.307 / 126.352,
  "ebay-de": 1000 / 400.75098,
  idealo: 246.25 / 57.5,
  otto: 100 / 37,
  rossmann: 1684.853 / 235.91749,
  sephora: 1000 / 129.6,
  shein: 106 / 22,
  zalando: 131.7 / 24,
};

/**
 * Display size for a store logo with the same visual weight as its neighbours: every logo gets
 * about the same area, inside a maximum box, at its own proportions (never stretched).
 */
export function storeLogoSize(
  id: string,
  box: { area: number; maxWidth: number; maxHeight: number },
): { width: number; height: number } {
  const ratio = STORE_LOGO_RATIO[id] ?? 4;
  let width = Math.sqrt(box.area * ratio);
  let height = width / ratio;
  if (width > box.maxWidth) {
    width = box.maxWidth;
    height = width / ratio;
  }
  if (height > box.maxHeight) {
    height = box.maxHeight;
    width = height * ratio;
  }
  return { width: Math.round(width), height: Math.round(height) };
}
/** Retailer rail tiles and store-card logo tiles: one size rule each. */
export const RAIL_LOGO = { area: 900, maxWidth: 76, maxHeight: 24 } as const;
export const CARD_LOGO = { area: 1100, maxWidth: 88, maxHeight: 28 } as const;

/** The logo id of a store: its retailer (brand) for a country storefront, else its own id. */
export function storeBrand(store: StoreEntry | DirectoryStore): string {
  return "brand" in store ? store.brand : store.id;
}

/** Filter order: the ten primary groups in catalogue order, then the store-wide "general" bucket. */
export const STORE_CATEGORIES: StoreCategory[] = [
  "electronics",
  "sports",
  "baby",
  "home",
  "food",
  "gaming",
  "beauty",
  "auto",
  "fashion",
  "pets",
  "general",
];

export function readFavs(): string[] {
  if (typeof window === "undefined") return [];
  return getJson(
    "favs",
    (value) =>
      Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string").slice(0, 100)
        : null,
    [],
  );
}

export function writeFavs(ids: string[]) {
  setJson("favs", ids.slice(0, 100));
}

export function storeById(id: string | undefined) {
  return BRING_FOR_ME_STORES.find((store) => store.id === id);
}

export function hostAllowed(store: StoreEntry | undefined, raw: string) {
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    if (!store) return host.length > 0;
    return host === store.host || host.endsWith(`.${store.host}`);
  } catch {
    return false;
  }
}

export type GoodId =
  "perfume" | "cream" | "sneakers" | "dress" | "earbuds" | "kettle" | "baby" | "ball";

export type Good = {
  id: GoodId;
  image: string;
  category: StoreCategory;
  storeId: string;
};

export const GOODS: Good[] = [
  { id: "perfume", image: "/bazaar/perfume.jpg", category: "beauty", storeId: "douglas" },
  { id: "cream", image: "/bazaar/cream.jpg", category: "beauty", storeId: "dm" },
  { id: "sneakers", image: "/bazaar/sneakers.jpg", category: "fashion", storeId: "zalando" },
  { id: "dress", image: "/bazaar/dress.jpg", category: "fashion", storeId: "shein" },
  { id: "earbuds", image: "/bazaar/earbuds.jpg", category: "electronics", storeId: "amazon-de" },
  { id: "kettle", image: "/bazaar/kettle.jpg", category: "home", storeId: "otto" },
  { id: "baby", image: "/bazaar/baby.jpg", category: "baby", storeId: "rossmann" },
  { id: "ball", image: "/bazaar/ball.jpg", category: "sports", storeId: "decathlon" },
];

export function goodById(id: string | undefined) {
  return GOODS.find((good) => good.id === id);
}
