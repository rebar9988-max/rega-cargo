import type { ParsedLink } from "./url.ts";

/**
 * Official-API product lookup. No provider is wired yet: Amazon (Creators/PA-API), eBay
 * (Browse API) and AliExpress (Open Platform) all need partner credentials and terms
 * approval that this repository does not have. Until an adapter returns real provider data,
 * every lookup honestly reports "not_configured" and the UI shows no title, image or price.
 */
export type ProviderInfo = {
  title: string;
  imageUrl: string | null;
  priceEur: number | null;
  live: true;
};
export type ProviderResult = {
  info: ProviderInfo | null;
  reason: "not_configured" | "unavailable" | null;
};

export async function fetchProviderInfo(_link: ParsedLink): Promise<ProviderResult> {
  void _link;
  return { info: null, reason: "not_configured" };
}
