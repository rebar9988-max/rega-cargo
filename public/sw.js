/* R&L service worker: offline-capable app shell for slow mobile networks.
 *
 * - Pages (public routes only): network first; if the network is slower than
 *   NAV_TIMEOUT_MS, or offline, serve the last good copy; else /offline.html.
 * - /assets/* (content-hashed, immutable): cache first.
 * - Images, fonts, logos: stale-while-revalidate.
 * - NEVER cached: non-GET, cross-origin, /api/* (auth, AI), /_serverFn/*,
 *   sign-in-gated pages, and responses marked no-store.
 * Updating: bump VERSION (old caches are deleted on activate). The worker
 * takes over immediately; pages stay network first, so nobody gets stuck.
 * Kill switch: replace this file with one that calls self.registration.unregister().
 */
const VERSION = "rl-sw-v6";
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const STATIC = `${VERSION}-static`;
const NAV_TIMEOUT_MS = 3500;
const OFFLINE = "/offline"; // assets serve /offline.html at /offline (307 otherwise)
const PRECACHE = ["/", OFFLINE, "/rega-logo-168.webp", "/favicon.png?v=6"];
const PUBLIC_PAGES = /^\/(?:|quote|track|stores|contact|customs|ai)\/?$/;
const NEVER = /^\/(?:api|_serverFn|admin|move|__grok\/(?!icon|manifest))(?:\/|$)/;
const STATIC_RE = /\.(?:png|jpe?g|webp|avif|svg|ico|woff2?)$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => Promise.all(PRECACHE.map((url) => cache.add(new Request(url, { cache: "reload" })).catch(() => undefined))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => !key.startsWith(`${VERSION}-`)).map((key) => caches.delete(key)));
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable().catch(() => undefined);
      await self.clients.claim();
    })(),
  );
});

/** Navigations cannot be answered with a redirected response: rebuild it. */
async function clean(response) {
  if (!response || !response.redirected) return response;
  return new Response(await response.blob(), { status: response.status, statusText: response.statusText, headers: response.headers });
}

function cacheable(response) {
  if (!response || response.status !== 200 || response.type !== "basic") return false;
  const cc = response.headers.get("cache-control") || "";
  return !/no-store|private/i.test(cc);
}

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

function pageKey(url) {
  if (!PUBLIC_PAGES.test(url.pathname)) return null;
  if (url.pathname === "/market" || url.pathname.startsWith("/market/")) return null;
  const params = new URLSearchParams(url.search);
  if (params.has("saved")) return null;
  return url.pathname + url.search;
}

async function page(event, url) {
  const cache = await caches.open(PAGES);
  const key = pageKey(url);
  let saved = Promise.resolve();
  const network = (async () => {
    const preload = await event.preloadResponse;
    const response = preload || (await fetch(event.request));
    if (key && cacheable(response)) {
      saved = cache.put(key, response.clone()).catch(() => undefined);
    }
    return response;
  })();
  event.waitUntil(network.then(() => saved, () => undefined));
  const cached = key ? await clean(await cache.match(key)) : undefined;
  if (!cached) {
    try {
      return await network;
    } catch {
      return (await clean(await cache.match(OFFLINE))) || Response.error();
    }
  }
  const timeout = new Promise((resolve) => setTimeout(() => resolve(cached), NAV_TIMEOUT_MS));
  return Promise.race([network.catch(() => cached), timeout]);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (cacheable(response)) {
    await cache.put(request, response.clone());
    trim(cacheName, 200);
  }
  return response;
}

async function staleWhileRevalidate(event, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(event.request);
  const refresh = fetch(event.request).then(async (response) => {
    if (cacheable(response)) {
      await cache.put(event.request, response.clone());
      trim(cacheName, 120);
    }
    return response;
  });
  if (hit) {
    event.waitUntil(refresh.catch(() => undefined));
    return hit;
  }
  return refresh;
}

self.addEventListener("message", (event) => {
  if (event.data === "rl-sign-out") {
    event.waitUntil(caches.delete(PAGES));
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (NEVER.test(url.pathname) || url.pathname === "/sw.js") return;
  if (request.mode === "navigate") {
    event.respondWith(page(event, url));
    return;
  }
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request, ASSETS));
    return;
  }
  if (STATIC_RE.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event, STATIC));
  }
});
