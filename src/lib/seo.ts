/**
 * Per-page title, description and canonical. The canonical origin comes from
 * the Worker var SITE_URL (set per environment in wrangler.jsonc) so it can be
 * switched to a custom domain later without code changes.
 */
const FALLBACK_ORIGIN = "https://rega-cargo.rebar9988.workers.dev";

export function siteOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  const env = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const raw = env?.SITE_URL ?? (typeof process !== "undefined" ? process.env.SITE_URL : undefined);
  return typeof raw === "string" && /^https:\/\/[^/]+/.test(raw) ? raw.replace(/\/+$/, "") : FALLBACK_ORIGIN;
}

export function seo(input: { path: string; title: string; description: string; noindex?: boolean }) {
  const meta: Record<string, string>[] = [
    { title: input.title },
    { name: "description", content: input.description },
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
  ];
  if (input.noindex) meta.push({ name: "robots", content: "noindex" });
  const links = input.noindex ? [] : [{ rel: "canonical", href: `${siteOrigin()}${input.path}` }];
  return { meta, links };
}

/** Public, indexable pages for sitemap.xml. */
export const SITEMAP_PATHS = ["/", "/stores", "/quote", "/market", "/customs", "/contact", "/impressum", "/privacy", "/terms"];
