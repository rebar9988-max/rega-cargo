/**
 * Absolute Open Graph image for the current host. The document already carries
 * the R&L title and an official image; crawlers want an absolute URL. The
 * Grok install tutorial is not served.
 */
import { BRAND_ASSETS } from "../../src/lib/brand-assets";
interface Event {
  url: URL;
}

export default async function rlOg(event: Event, next: () => Promise<unknown>): Promise<unknown> {
  const result = await next();
  if (!(result instanceof Response) || !result.body) return result;
  const type = result.headers.get("content-type") ?? "";
  if (!type.includes("text/html") || result.headers.get("content-encoding")) return result;
  const origin = event.url.origin.replace(/"/g, "");
  const tag = `<meta property="og:image" content="${origin}${BRAND_ASSETS.social}">`;
  const html = (await result.text()).replace("</head>", `${tag}</head>`);
  const headers = new Headers(result.headers);
  headers.delete("content-length");
  return new Response(html, { status: result.status, statusText: result.statusText, headers });
}
