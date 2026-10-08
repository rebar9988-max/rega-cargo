/** URL search params shared by "/" and "/stores/" (both render the Bazaar). */
export type BazaarSearch = { q?: string; cat?: string; fav?: string; who?: string };

export function validateBazaarSearch(search: Record<string, unknown>): BazaarSearch {
  const str = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim().slice(0, 80) : undefined;
  return {
    q: str(search.q),
    cat: str(search.cat),
    fav: search.fav === "1" ? "1" : undefined,
    who: str(search.who),
  };
}
