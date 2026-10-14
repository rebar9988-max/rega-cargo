import type { ChatCard } from "../domain/assistant-types";
import type { Lang } from "@/lib/langs";

/** The public, read-only Marketplace contract; never import handlers or SQL. */
export async function searchMarketplace(query: string, lang: Lang) {
  try {
    const { assistantProductSearch } = await import("@/lib/market/assistant-contract.server");
    const result = await assistantProductSearch(query);
    const cards: ChatCard[] = result.map((item) => ({
      title: lang === "ckb" ? item.nameKu : item.nameEn,
      href: `/market/${encodeURIComponent(item.slug)}`,
      kind: "product",
      priceIqd: Number.isFinite(item.lowest) && item.lowest! >= 0 ? item.lowest : null,
    }));
    return { cards, unavailable: false };
  } catch {
    return { cards: [], unavailable: true };
  }
}
