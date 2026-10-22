import { isProhibitedQuery } from "./compliance/check.ts";
import { isPublishedCategory } from "./catalogue.ts";
import { GOODS, STORES, type Good, type StoreEntry } from "./stores.ts";
import type { BazaarSearch } from "./bazaar-search.ts";

export const AUDIENCE_GOODS: Record<string, readonly string[]> = {
  women: ["perfume", "cream", "dress"],
  men: ["sneakers", "earbuds", "ball"],
  kids: ["baby", "ball"],
};
const AUDIENCE_CATEGORIES: Record<string, readonly string[]> = {
  women: ["beauty", "fashion"],
  men: ["fashion", "electronics", "sports"],
  kids: ["baby", "sports"],
};
/** Presentation filters reuse the permanent compliance checker; there is no bypass option. */
type ListedStore = Pick<StoreEntry, "id" | "name" | "host" | "categories"> & {
  country: string;
  /** The STORES id a country storefront belongs to; `?store=` matches it as well as `id`. */
  brand?: string;
};

export function selectBazaar<S extends ListedStore = StoreEntry>({
  params,
  favs,
  labels,
  goods = GOODS,
  stores = STORES as unknown as readonly S[],
}: {
  params: BazaarSearch;
  favs: readonly string[];
  labels: Record<string, string>;
  goods?: readonly Good[];
  stores?: readonly S[];
}): { goods: Good[]; stores: S[]; blocked: boolean } {
  const query = (params.q ?? "").trim().toLowerCase();
  if (isProhibitedQuery(query)) return { goods: [], stores: [], blocked: true };
  // A category awaiting owner approval lists nothing, even by direct URL.
  if (params.cat && !isPublishedCategory(params.cat))
    return { goods: [], stores: [], blocked: false };
  const audience = AUDIENCE_GOODS[params.who ?? ""];
  const categories = AUDIENCE_CATEGORIES[params.who ?? ""];
  const common = (store: S) =>
    (!params.store || params.store === store.id || params.store === store.brand) &&
    (!params.country || params.country === store.country) &&
    (!params.fav || favs.includes(store.id)) &&
    !isProhibitedQuery(`${store.name} ${store.host}`);
  return {
    blocked: false,
    goods: goods.filter((good) => {
      const store = stores.find((item) => item.id === good.storeId);
      const text = `${good.id} ${labels[good.id] ?? ""} ${store?.name ?? ""} ${store?.host ?? ""}`;
      return (
        !!store &&
        common(store) &&
        !isProhibitedQuery(text) &&
        (!audience || audience.includes(good.id)) &&
        (!params.cat || good.category === params.cat) &&
        (!query || text.toLowerCase().includes(query))
      );
    }),
    stores: stores.filter(
      (store) =>
        common(store) &&
        (!categories || store.categories.some((category) => categories.includes(category))) &&
        (!params.cat || store.categories.includes(params.cat as never)) &&
        (!query || `${store.name} ${store.host}`.toLowerCase().includes(query)),
    ),
  };
}
