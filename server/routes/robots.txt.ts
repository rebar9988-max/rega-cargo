import { siteOrigin } from "../../src/lib/seo";

/** robots.txt: private/app-only paths disallowed; staging (RL_NOINDEX=1) is fully disallowed. */
export default function robotsRoute() {
  const env = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const body =
    env?.RL_NOINDEX === "1"
      ? "User-agent: *\nDisallow: /\n"
      : [
          "User-agent: *",
          "Disallow: /admin",
          "Disallow: /market/sell",
          "Disallow: /api/",
          "Disallow: /_serverFn/",
          "",
          `Sitemap: ${siteOrigin()}/sitemap.xml`,
          "",
        ].join("\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
