import { SITEMAP_PATHS, SEO_LOCALES, localeUrl } from "../../src/lib/seo";

export default function sitemapRoute() {
  const urls = SITEMAP_PATHS.flatMap((path) =>
    SEO_LOCALES.map((lang) => {
      const alternates = [
        ...SEO_LOCALES.map(
          (locale) =>
            `<xhtml:link rel="alternate" hreflang="${locale}" href="${localeUrl(path, locale)}"/>`,
        ),
        `<xhtml:link rel="alternate" hreflang="x-default" href="${localeUrl(path, "ckb")}"/>`,
      ].join("");
      return `  <url><loc>${localeUrl(path, lang)}</loc>${alternates}</url>`;
    }),
  ).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
