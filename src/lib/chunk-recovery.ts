/** What Chromium, Firefox and WebKit report when a code-split module fails to load. */
const MODULE_LOAD_FAILED = [
  "Failed to fetch dynamically imported module",
  "error loading dynamically imported module",
  "Importing a module script failed",
];

/** Automatic reloads per page within the window; a module that keeps failing shows the error page. */
export const CHUNK_RELOADS = 2;
export const CHUNK_RELOAD_WINDOW_MS = 60_000;

const ROUTER_RELOAD_KEY = "tanstack_router_reload:";

function routerReloadKeys(): Set<string> {
  try {
    return new Set(Object.keys(sessionStorage).filter((key) => key.startsWith(ROUTER_RELOAD_KEY)));
  } catch {
    return new Set();
  }
}

/** The router's reload markers when this document started (read before the app renders). */
const routerKeysAtStart = typeof window === "undefined" ? null : routerReloadKeys();

/** Whether TanStack Router itself is reloading this document for the error (its marker is new). */
export function routerIsReloading(error: unknown): boolean {
  if (!routerKeysAtStart || !(error instanceof Error)) return false;
  return (
    routerReloadKeys().has(ROUTER_RELOAD_KEY + error.message) &&
    !routerKeysAtStart.has(ROUTER_RELOAD_KEY + error.message)
  );
}

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";
  return MODULE_LOAD_FAILED.some((prefix) => message.startsWith(prefix));
}

/**
 * Whether the route error page should reload to recover from a page module that failed to load
 * (a dropped request, or a deploy that replaced the files). TanStack Router reloads once per
 * error message for the whole tab, and WebKit gives every failed module the same message, so
 * after one recovery Safari stayed on the error page without navigation. This counts reloads per
 * page and time instead, records each before reloading so it can never loop, and stands aside
 * while the router's own reload of this document is already under way.
 */
export function shouldReloadForChunk(
  error: unknown,
  page: string,
  now: number,
  storage: Pick<Storage, "getItem" | "setItem"> | null,
  routerReloading = false,
): boolean {
  if (routerReloading || !storage || !isChunkLoadError(error)) return false;
  const key = `rl_chunk_reload:${page}`;
  try {
    const [since, count] = (storage.getItem(key) ?? "").split("|").map(Number);
    const fresh = !since || now - since >= CHUNK_RELOAD_WINDOW_MS;
    if (!fresh && count >= CHUNK_RELOADS) return false;
    storage.setItem(key, fresh ? `${now}|1` : `${since}|${count + 1}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reload after refreshing this page's modules in the HTTP cache. WebKit otherwise reuses a module
 * whose connection dropped, so a plain script reload failed again without a new request.
 */
export async function reloadWithFreshModules(timeoutMs = 5_000): Promise<void> {
  const urls = new Set<string>();
  for (const link of document.querySelectorAll<HTMLLinkElement>('link[rel="modulepreload"]'))
    urls.add(link.href);
  for (const script of document.querySelectorAll<HTMLScriptElement>('script[type="module"][src]'))
    urls.add(script.src);
  const sameOrigin = [...urls].filter((url) => url && new URL(url).origin === location.origin);
  await Promise.race([
    Promise.all(sameOrigin.map((url) => fetch(url, { cache: "reload" }).catch(() => undefined))),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
  location.reload();
}
