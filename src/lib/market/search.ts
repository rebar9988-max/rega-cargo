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
