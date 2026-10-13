import type { Lang } from "./langs";
import { seoCopy } from "./seo-copy";
/**
 * Per-page title, description and canonical. The canonical origin comes from
 * the Worker var SITE_URL (set per environment in wrangler.jsonc) so it can be
 * switched to a custom domain later without code changes.
 */
const FALLBACK_ORIGIN = "https://www.rlgo.net";

export function siteOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  const env = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const raw = env?.SITE_URL ?? (typeof process !== "undefined" ? process.env.SITE_URL : undefined);
  return typeof raw === "string" && /^https:\/\/[^/]+/.test(raw)
    ? raw.replace(/\/+$/, "")
    : FALLBACK_ORIGIN;
}

export const SEO_LOCALES = ["ckb", "ar", "en", "ku"] as const;
export function localeUrl(path: string, lang: Lang) {
  return `${siteOrigin()}${path}${lang === "ckb" ? "" : `?lang=${lang}`}`;
}
export function seo(input: {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
  lang?: Lang;
}) {
  const lang = input.lang ?? "ckb";
  const localized = seoCopy(lang, input.path);
  const title = localized?.title ?? input.title,
    description = localized?.description ?? input.description;
  const url = localeUrl(input.path, lang);
  const meta: Record<string, string>[] = [
    { title: title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    {
      property: "og:locale",
      content:
        lang === "ckb" ? "ckb_IQ" : lang === "ar" ? "ar_IQ" : lang === "ku" ? "ku_IQ" : "en_GB",
    },
    { property: "og:image", content: `${siteOrigin()}/og.jpg` },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (input.noindex) meta.push({ name: "robots", content: "noindex" });
  const links = input.noindex
    ? []
    : [
        { rel: "canonical", href: url },
        ...SEO_LOCALES.map((locale) => ({
          rel: "alternate",
          hrefLang: locale,
          href: localeUrl(input.path, locale),
        })),
        { rel: "alternate", hrefLang: "x-default", href: localeUrl(input.path, "ckb") },
      ];
  return { meta, links };
}

/** Public, indexable pages for sitemap.xml. */
export const SITEMAP_PATHS = [
  "/",
  "/stores",
  "/quote",
  "/market",
  "/customs",
  "/prohibited-items",
  "/contact",
  "/impressum",
  "/privacy",
  "/terms",
];
