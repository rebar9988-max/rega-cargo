/**
 * Product-link parsing for the (flagged) link-assist feature. Pure and isomorphic.
 *
 * Safety: the server NEVER fetches the user's URL. We only parse it, accept https links on a
 * fixed provider allow-list, and rebuild a canonical link from the provider + product id, so
 * query strings, redirectors, credentials, ports and IP hosts can never travel further.
 * Short links (amzn.to, a.co …) are refused: following them would need a redirect.
 */
export const LINK_MAX = 2000;

export type ProviderId = "amazon" | "ebay" | "aliexpress";

const DOMAINS: Record<ProviderId, readonly string[]> = {
  amazon: [
    "amazon.de",
    "amazon.com",
    "amazon.co.uk",
    "amazon.fr",
    "amazon.it",
    "amazon.es",
    "amazon.nl",
    "amazon.pl",
    "amazon.se",
  ],
  ebay: [
    "ebay.de",
    "ebay.com",
    "ebay.co.uk",
    "ebay.fr",
    "ebay.it",
    "ebay.es",
    "ebay.nl",
    "ebay.pl",
  ],
  aliexpress: ["aliexpress.com", "aliexpress.us"],
};

export type ParsedLink = {
  provider: ProviderId;
  /** Registrable provider domain that matched, e.g. "amazon.de". */
  domain: string;
  /** ASIN, eBay item number or AliExpress item id. */
  productId: string;
  /** Rebuilt from provider + id only. */
  canonicalUrl: string;
};

export type LinkError = "url" | "host" | "unsupported";

const HOST_CHARS = /^[a-z0-9.-]+$/;
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

function matchDomain(host: string): { provider: ProviderId; domain: string } | null {
  for (const provider of Object.keys(DOMAINS) as ProviderId[]) {
    for (const domain of DOMAINS[provider]) {
      if (host === domain || host.endsWith(`.${domain}`)) return { provider, domain };
    }
  }
  return null;
}

export function parseProductLink(
  raw: unknown,
): { ok: true; link: ParsedLink } | { ok: false; error: LinkError } {
  if (typeof raw !== "string") return { ok: false, error: "url" };
  const text = raw.trim();
  if (!text || text.length > LINK_MAX) return { ok: false, error: "url" };
  let parsed: URL;
  try {
    parsed = new URL(text);
  } catch {
    return { ok: false, error: "url" };
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port) {
    return { ok: false, error: "url" };
  }
  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (!HOST_CHARS.test(host) || IPV4.test(host) || host === "localhost")
    return { ok: false, error: "host" };
  const hit = matchDomain(host);
  if (!hit) return { ok: false, error: "host" };

  const path = parsed.pathname;
  let productId: string | undefined;
  let canonicalUrl = "";
  if (hit.provider === "amazon") {
    productId = path.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i)?.[1]?.toUpperCase();
    canonicalUrl = `https://www.${hit.domain}/dp/${productId}`;
  } else if (hit.provider === "ebay") {
    productId = path.match(/\/itm\/(?:[^/]+\/)?(\d{9,15})(?:[/?]|$)/)?.[1];
    canonicalUrl = `https://www.${hit.domain}/itm/${productId}`;
  } else {
    productId = path.match(/\/item\/(\d{8,20})\.html$/)?.[1];
    canonicalUrl = `https://www.aliexpress.com/item/${productId}.html`;
  }
  if (!productId) return { ok: false, error: "unsupported" };
  return {
    ok: true,
    link: { provider: hit.provider, domain: hit.domain, productId, canonicalUrl },
  };
}
