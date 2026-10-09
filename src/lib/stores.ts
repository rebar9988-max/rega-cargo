import { getJson, setJson } from "./storage.ts";

export type StoreCategory = "beauty" | "fashion" | "electronics" | "home" | "baby" | "sports" | "general";

export type StoreNote = "amazon" | "ebay" | "otto" | "zalando" | "shein" | "sephora" | "link";

export type StoreCaution = "perfume" | "aerosol" | "battery" | "cosmetics";

export type StoreEntry = {
  id: string;
  name: string;
  host: string;
  url: string;
  country: "DE" | "INT";
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
    categories: ["general", "electronics", "home", "baby", "fashion", "beauty", "sports"],
    note: "amazon",
    caution: ["battery", "aerosol"],
  },
  {
    id: "otto",
    name: "OTTO",
    host: "otto.de",
    url: "https://www.otto.de/",
    country: "DE",
    categories: ["home", "fashion", "electronics", "baby", "sports"],
    note: "otto",
    caution: ["battery"],
  },
  {
    id: "ebay-de",
    name: "eBay",
    host: "ebay.de",
    url: "https://www.ebay.de/",
    country: "DE",
    categories: ["general", "electronics", "fashion", "home", "sports"],
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
    categories: ["beauty", "home", "baby"],
    note: "link",
    caution: ["perfume", "aerosol", "cosmetics"],
  },
  {
    id: "rossmann",
    name: "Rossmann",
    host: "rossmann.de",
    url: "https://www.rossmann.de/",
    country: "DE",
    categories: ["beauty", "home", "baby"],
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
    categories: ["general", "electronics", "home", "beauty", "fashion", "sports", "baby"],
    note: "link",
    caution: [],
  },
];

/** Self-hosted official logo (Wikimedia Commons; see public/store-logos/LOGOS.md). */
export function storeLogo(id: string): string {
  return `/store-logos/${id}.svg`;
}

export const STORE_CATEGORIES: StoreCategory[] = [
  "beauty",
  "fashion",
  "electronics",
  "home",
  "baby",
  "sports",
  "general",
];

export function readFavs(): string[] {
  if (typeof window === "undefined") return [];
  return getJson("favs", (value) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 100) : null), []);
}

export function writeFavs(ids: string[]) {
  setJson("favs", ids.slice(0, 100));
}

export function storeById(id: string | undefined) {
  return STORES.find((store) => store.id === id);
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

export type GoodId = "perfume" | "cream" | "sneakers" | "dress" | "earbuds" | "kettle" | "baby" | "ball";

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
