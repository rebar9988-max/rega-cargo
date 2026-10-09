import type { GoodId, StoreCategory } from "./stores.ts";
import { isProhibitedQuery } from "./compliance/check.ts";

/**
 * Brands shown on the Bazaar brand rail (home and /stores). Logos only, never text-only
 * tiles: every brand has an official, self-hosted logo (public/brand-logos/LOGOS.md,
 * public/store-logos/LOGOS.md). A brand without a usable official logo is not listed.
 * Names only: no products, no prices.
 */
export const BRANDS: { name: string; category: StoreCategory; logo: string }[] = [
  { name: "NIVEA", category: "beauty", logo: "/brand-logos/nivea-2021.svg" },
  { name: "L'ORÉAL", category: "beauty", logo: "/brand-logos/loreal.svg" },
  { name: "GARNIER", category: "beauty", logo: "/brand-logos/garnier.svg" },
  { name: "SEPHORA", category: "beauty", logo: "/store-logos/sephora.svg" },
  { name: "ZARA", category: "fashion", logo: "/brand-logos/zara.svg" },
  { name: "H&M", category: "fashion", logo: "/brand-logos/hm.svg" },
  { name: "ZALANDO", category: "fashion", logo: "/store-logos/zalando.svg" },
  { name: "AMAZON", category: "electronics", logo: "/store-logos/amazon-de.svg" },
  { name: "OTTO", category: "home", logo: "/store-logos/otto.svg" },
  { name: "DECATHLON", category: "sports", logo: "/store-logos/decathlon.svg" },
];

/**
 * Brands findable in search (text suggestion rows). This is the rail brands plus the ones
 * dropped from the rail because there is no usable official logo (KÉRASTASE: no SVG on Commons).
 */
export const SEARCH_BRANDS: { name: string; category: StoreCategory; logo?: string }[] = [
  ...BRANDS,
  { name: "KÉRASTASE", category: "beauty" },
];

/** Order of the "new collection" rail (also the trending row in search). */
export const COLLECTION_ORDER: GoodId[] = [
  "sneakers",
  "earbuds",
  "perfume",
  "dress",
  "cream",
  "kettle",
  "baby",
  "ball",
];

/** idealo.de public search. Prices are only ever shown on idealo itself. */
/** idealo search link, or null for a prohibited term (no link is ever made to one). */
export function idealoSearchUrl(query: string): string | null {
  if (!query.trim() || isProhibitedQuery(query)) return null;
  return `https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=${encodeURIComponent(query.trim())}`;
}
