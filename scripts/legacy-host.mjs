// Old production URL -> custom domain. Runs in the Worker *before* Nitro (see
// scripts/wrap-legacy-host.mjs), because Nitro serves public assets ahead of
// any middleware. Pure: no imports, so it is bundled as-is and unit-tested.
export const LEGACY_HOSTS = ["rega-cargo.rebar9988.workers.dev"];
export const CANONICAL_ORIGIN = "https://cargo.regaplatform.com";

/** Static paths that must reach the Worker (wrangler assets.run_worker_first). */
export const WORKER_FIRST_PATHS = ["/sw.js", "/manifest.webmanifest", "/offline.html"];

// Replaces the app's service worker on the old host: drop all caches,
// unregister, and move open windows/installed PWAs to the same path on the new
// domain.
export const UNREGISTER_SW = `// R&L moved to ${CANONICAL_ORIGIN}
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    try { for (const key of await caches.keys()) await caches.delete(key); } catch {}
    try { await self.registration.unregister(); } catch {}
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      try {
        const u = new URL(client.url);
        await client.navigate("${CANONICAL_ORIGIN}" + u.pathname + u.search + u.hash);
      } catch {}
    }
  })());
});
`;

/** Response for a request on a legacy host, or null to continue normally. */
export function legacyHostResponse(request) {
  const url = new URL(request.url);
  if (!LEGACY_HOSTS.includes(url.hostname.toLowerCase())) return null;
  if (url.pathname === "/sw.js") {
    return new Response(UNREGISTER_SW, {
      status: 200,
      headers: {
        "content-type": "application/javascript; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex",
      },
    });
  }
  const method = request.method.toUpperCase();
  return new Response(null, {
    // 308 keeps the method/body for non-GET (e.g. a stale form POST).
    status: method === "GET" || method === "HEAD" ? 301 : 308,
    headers: {
      location: CANONICAL_ORIGIN + url.pathname + url.search,
      "cache-control": "public, max-age=3600",
      "x-robots-tag": "noindex",
    },
  });
}

/** Wrap a module Worker's default export so legacy hosts never reach the app. */
export function wrapWorker(worker) {
  return {
    ...worker,
    fetch(request, env, ctx) {
      return legacyHostResponse(request) ?? worker.fetch(request, env, ctx);
    },
  };
}
