/**
 * Old wishlist links carried a JSON-quoted value (`/stores?fav=%221%22`).
 * Redirect them permanently to the plain form (`?fav=1`) so only one URL exists.
 */
interface Event {
  url: URL;
}

export default function legacyLinks(event: Event) {
  const url = event.url;
  if (url.pathname !== "/stores" && url.pathname !== "/stores/" && url.pathname !== "/") return;
  if (url.searchParams.get("fav") !== '"1"') return;
  const next = new URL(url.pathname, url.origin);
  for (const [key, value] of url.searchParams) next.searchParams.append(key, key === "fav" ? "1" : value);
  return new Response(null, { status: 301, headers: { location: `${next.pathname}${next.search}`, "cache-control": "public, max-age=86400" } });
}
