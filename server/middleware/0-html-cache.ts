/**
 * Serves warm copies of the public, user-independent pages (see
 * src/lib/html-cache.ts for the safety rules). Named `0-…` so it wraps the
 * other middleware and caches their final output.
 */
import { createHtmlCache } from "../../src/lib/html-cache";

const ALLOWED_HOSTS = [
  "cargo.regaplatform.com",
  "rega-cargo.rebar9988.workers.dev",
  "rega-cargo-staging.rebar9988.workers.dev",
];

const cache = createHtmlCache({
  paths: ["/", "/stores", "/quote", "/track", "/customs", "/contact"],
  ttlMs: 60_000,
  maxEntries: 32,
  hosts: ALLOWED_HOSTS,
});

interface HtmlCacheEvent {
  url: URL;
  req: { method: string; headers: Headers };
}

export default function htmlCacheMiddleware(
  event: HtmlCacheEvent,
  next: () => unknown | Promise<unknown>,
) {
  // Key on the Worker's own URL host only. Ignore x-forwarded-host (client-controlled).
  const host = event.url.host;
  return cache.handle({ method: event.req.method ?? "GET", url: event.url, host }, next);
}
