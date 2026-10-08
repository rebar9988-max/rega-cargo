/**
 * Serves warm copies of the public, user-independent pages (see
 * src/lib/html-cache.ts for the safety rules). Named `0-…` so it wraps the
 * other middleware and caches their final output.
 */
import { createHtmlCache } from "../../src/lib/html-cache";

const cache = createHtmlCache({
  paths: ["/", "/stores", "/quote", "/track", "/customs", "/contact"],
  ttlMs: 60_000,
  maxEntries: 32,
});

interface HtmlCacheEvent {
  url: URL;
  req: { method: string; headers: Headers };
}

export default function htmlCacheMiddleware(
  event: HtmlCacheEvent,
  next: () => unknown | Promise<unknown>,
) {
  const host =
    event.req.headers.get("x-forwarded-host") ?? event.req.headers.get("host") ?? event.url.host;
  return cache.handle({ method: event.req.method ?? "GET", url: event.url, host }, next);
}
