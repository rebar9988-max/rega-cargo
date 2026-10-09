import type { GoodId, StoreCategory } from "./stores.ts";
import { isProhibitedQuery } from "./compliance/check.ts";

/** Brands shown on the Bazaar brand rail. Names only: no products, no prices. */
export const BRANDS: { name: string; category: StoreCategory }[] = [
  { name: "NIVEA", category: "beauty" },
  { name: "L'ORÉAL", category: "beauty" },
  { name: "GARNIER", category: "beauty" },
  { name: "KÉRASTASE", category: "beauty" },
  { name: "SEPHORA", category: "beauty" },
  { name: "ZARA", category: "fashion" },
  { name: "H&M", category: "fashion" },
  { name: "ZALANDO", category: "fashion" },
  { name: "AMAZON", category: "electronics" },
  { name: "OTTO", category: "home" },
  { name: "DECATHLON", category: "sports" },
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
