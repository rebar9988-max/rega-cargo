// Old production URLs -> primary domain. Runs in the Worker *before* Nitro (see
// scripts/wrap-legacy-host.mjs), because Nitro serves public assets ahead of
// any middleware. Pure: no imports, so it is bundled as-is and unit-tested.
//
// Primary domain since 2026-10-13: https://www.rlgo.net. The apex and the old
// workers.dev host always redirect. The previous production domain
// (cargo.regaplatform.com) redirects only once it is listed in the Worker var
// RL_LEGACY_REDIRECT_HOSTS (comma-separated), so the cutover — and its
// rollback — is a config change that never touches the new domain.
export const LEGACY_HOSTS = ["rega-cargo.rebar9988.workers.dev", "rlgo.net"];
export const CANONICAL_ORIGIN = "https://www.rlgo.net";
const CANONICAL_HOST = new URL(CANONICAL_ORIGIN).hostname;

/** Always-redirected hosts plus the ones named in env.RL_LEGACY_REDIRECT_HOSTS. */
export function redirectHosts(env) {
  const extra =
    typeof env?.RL_LEGACY_REDIRECT_HOSTS === "string" ? env.RL_LEGACY_REDIRECT_HOSTS : "";
  const hosts = [
    ...LEGACY_HOSTS,
    ...extra
      .split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean),
  ];
  // Never redirect the primary host to itself.
  return hosts.filter(
    (h) => h !== CANONICAL_HOST && (LEGACY_HOSTS.includes(h) || h === "cargo.regaplatform.com"),
  );
}

// Replaces the app's service worker on the old host: drop all caches,
// unregister, and move open windows/installed PWAs to the same path on the new
// domain.
export const UNREGISTER_SW = `// R&L moved to ${CANONICAL_ORIGIN}
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    try { for (const key of await caches.keys()) await caches.delete(key); } catch {}
    // navigate() only works on clients this worker controls, so claim first.
    try { await self.clients.claim(); } catch {}
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      try {
        const u = new URL(client.url);
        await client.navigate("${CANONICAL_ORIGIN}" + u.pathname + u.search + u.hash);
      } catch {}
    }
    try { await self.registration.unregister(); } catch {}
  })());
});
`;

/** Response for a request on a legacy host, or null to continue normally. */
export function legacyHostResponse(request, env) {
  const url = new URL(request.url);
  const legacy = redirectHosts(env).includes(url.hostname.toLowerCase());
  const insecurePrimary = url.hostname.toLowerCase() === CANONICAL_HOST && url.protocol === "http:";
  if (!legacy && !insecurePrimary) return null;
  if (legacy && url.protocol === "https:" && url.pathname === "/sw.js") {
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
      return legacyHostResponse(request, env) ?? worker.fetch(request, env, ctx);
    },
  };
}
