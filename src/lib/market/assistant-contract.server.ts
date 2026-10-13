import { listProducts } from "./handlers.server";

/** Explicit public read contract. Keeps Marketplace filtering and SQL ownership here. */
export async function assistantProductSearch(query: string) {
  const result = await listProducts({ q: query, userId: null });
  return result.items.slice(0, 4).map((item) => ({
    slug: item.slug,
    nameKu: item.nameKu,
    nameEn: item.nameEn,
    lowest: item.lowest,
  }));
}
