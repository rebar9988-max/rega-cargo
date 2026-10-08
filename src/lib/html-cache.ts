/**
 * Tiny per-isolate cache for public pages whose HTML is identical for every
 * visitor (language, theme and sign-in state are all resolved client-side).
 * Serving a warm copy skips React SSR, the Worker's main CPU cost.
 *
 * Deliberately conservative:
 * - GET only, exact allow-listed paths, no query string (query-driven pages
 *   and `?install=1` always render fresh);
 * - only 200 `text/html` responses without `set-cookie` or `content-encoding`;
 * - bounded size (oldest entry evicted) and a short TTL; every deploy starts
 *   with an empty cache because it runs in fresh isolates.
 */
export type HtmlCacheOptions = {
  paths: readonly string[];
  ttlMs: number;
  maxEntries: number;
  now?: () => number;
  /** When set, only these hosts are cached. Client-supplied forwarded hosts must not be passed in. */
  hosts?: readonly string[];
};

type Entry = { body: string; headers: [string, string][]; at: number };

export function createHtmlCache({ paths, ttlMs, maxEntries, now = Date.now, hosts }: HtmlCacheOptions) {
  const allowed = new Set(paths);
  const entries = new Map<string, Entry>();

  return {
    size: () => entries.size,
    async handle(
      req: { method: string; url: URL; host: string },
      next: () => unknown | Promise<unknown>,
    ): Promise<unknown> {
      if (req.method.toUpperCase() !== "GET" || req.url.search || !allowed.has(req.url.pathname))
        return next();
      if (hosts && !hosts.includes(req.host.toLowerCase().replace(/:\d+$/, ""))) return next();
      const key = `${req.host}${req.url.pathname}`;
      const hit = entries.get(key);
      if (hit && now() - hit.at < ttlMs) {
        const headers = new Headers(hit.headers);
        headers.set("x-rl-cache", "hit");
        return new Response(hit.body, { status: 200, headers });
      }
      if (hit) entries.delete(key);

      const result = await next();
      if (
        !(result instanceof Response) ||
        result.status !== 200 ||
        result.headers.has("set-cookie") ||
        result.headers.has("content-encoding") ||
        !String(result.headers.get("content-type") ?? "").includes("text/html")
      ) {
        return result;
      }
      const body = await result.text();
      const headers = new Headers(result.headers);
      headers.delete("content-length");
      if (entries.size >= maxEntries) {
        const oldest = entries.keys().next().value;
        if (oldest !== undefined) entries.delete(oldest);
      }
      entries.set(key, { body, headers: [...headers], at: now() });
      headers.set("x-rl-cache", "miss");
      return new Response(body, { status: 200, headers });
    },
  };
}
