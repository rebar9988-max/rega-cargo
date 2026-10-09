import { SITEMAP_PATHS, siteOrigin } from "../../src/lib/seo";

export default function sitemapRoute() {
  const origin = siteOrigin();
  const urls = SITEMAP_PATHS.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
