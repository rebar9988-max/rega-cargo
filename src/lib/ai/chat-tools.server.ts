import type { ChatTools } from "./chat.server";
import type { ChatCard } from "./chat";
import { suggest } from "../search/index";
import { checkText } from "../compliance/check";

/** Only existing, approved read paths. No arbitrary fetch, SQL or mutation from the model. */
export const chatTools: ChatTools = {
  async blocked(text) {
    if (!text.trim()) return false;
    try {
      const { getSql } = await import("../db");
      const { checkTextServer } = await import("../compliance/service.server");
      return (await checkTextServer(await getSql(), text)).decision === "block";
    } catch {
      return checkText(text).decision === "block";
    }
  },
  async search(query, lang) {
    const hits = suggest(query, lang);
    const cards: ChatCard[] = [...hits.items, ...hits.brands, ...hits.stores, ...hits.categories]
      .slice(0, 4)
      .map((hit) => ({
        title: hit.label,
        kind: "catalogue",
        href: `/stores?q=${encodeURIComponent(hit.label)}`,
      }));
    let unavailable = false;
    try {
      const { listProducts } = await import("../market/handlers.server");
      const result = await listProducts({ q: query, userId: null });
      cards.unshift(
        ...result.items.slice(0, 4).map((item): ChatCard => ({
          title: lang === "ckb" ? item.nameKu : item.nameEn,
          href: `/market/${encodeURIComponent(item.slug)}`,
          kind: "product",
          priceIqd: Number.isFinite(item.lowest) && item.lowest! >= 0 ? item.lowest : null,
        })),
      );
    } catch {
      unavailable = true;
    }
    return { cards, unavailable };
  },
  async link(url) {
    const { productLinkEnabled } = await import("../product-link/flag.server");
    if (!productLinkEnabled()) return null;
    const { parseProductLink } = await import("../product-link/url");
    const parsed = parseProductLink(url);
    if (!parsed.ok || (await chatTools.blocked(parsed.link.canonicalUrl))) return null;
    // Reuse the existing official-provider adapter. The user's URL is never fetched.
    const { fetchProviderInfo } = await import("../product-link/providers.server");
    const provider = await fetchProviderInfo(parsed.link);
    return {
      title: provider.info?.title ?? parsed.link.domain,
      href: parsed.link.canonicalUrl,
      kind: "catalogue",
    };
  },
};
