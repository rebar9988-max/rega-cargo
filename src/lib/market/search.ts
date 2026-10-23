/** One query contract for marketplace forms, deep links and navigation. */
export const DEFAULT_MARKET_SEARCH = {
  q: "",
  category: "",
  brand: "",
  min: "",
  max: "",
  stock: "",
  sort: "price",
  page: 1,
  saved: "",
};
export function validateMarketSearch(search: Record<string, unknown>) {
  const page = Number(search.page);
  return {
    q: typeof search.q === "string" ? search.q : "",
    category: typeof search.category === "string" ? search.category : "",
    brand: typeof search.brand === "string" ? search.brand : "",
    min: typeof search.min === "string" ? search.min : "",
    max: typeof search.max === "string" ? search.max : "",
    stock: search.stock === "in" ? "in" : "",
    sort: search.sort === "new" ? "new" : "price",
    page: Number.isSafeInteger(page) && page > 0 && page <= 100 ? page : 1,
    saved: search.saved === "1" || search.saved === true ? "1" : "",
  };
}

/** True when the shopper narrowed the list (sort order alone does not narrow it). */
export function isMarketFiltered(search: ReturnType<typeof validateMarketSearch>) {
  return Boolean(
    search.q ||
    search.category ||
    search.brand ||
    search.min ||
    search.max ||
    search.stock ||
    search.saved,
  );
}

/**
 * What the marketplace page shows for a result. An empty catalogue (nothing listed, nothing
 * filtered) says so honestly and skips filters that could not narrow anything; an empty
 * filtered result keeps the filters and offers a reset; the pager appears only with pages.
 */
export function marketView(
  search: ReturnType<typeof validateMarketSearch>,
  count: number,
  pages: number,
) {
  const filtered = isMarketFiltered(search);
  const catalogueEmpty = count === 0 && !filtered && search.page === 1;
  return {
    filters: !catalogueEmpty,
    empty: count > 0 ? null : catalogueEmpty ? ("catalogue" as const) : ("filtered" as const),
    reset: count === 0 && filtered,
    pager: pages > 1 || search.page > 1,
  };
}
