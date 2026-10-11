/** URL search params shared by "/" and "/stores/" (both render the Bazaar). */
export type BazaarSearch = {
  q?: string;
  cat?: string;
  /** Subcategory id within `cat` (src/lib/catalogue.ts); a search refinement, not a stock filter. */
  sub?: string;
  fav?: 1;
  who?: string;
  store?: string;
  country?: string;
};

export function validateBazaarSearch(search: Record<string, unknown>): BazaarSearch {
  const str = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim().slice(0, 80) : undefined;
  return {
    q: str(search.q),
    cat: str(search.cat),
    sub: str(search.sub),
    // Plain `fav=1` (the router parses it as the number 1); old links sent `fav=%221%22` ("1").
    fav: search.fav === 1 || search.fav === "1" ? 1 : undefined,
    who: str(search.who),
    store: str(search.store),
    country: str(search.country),
  };
}
