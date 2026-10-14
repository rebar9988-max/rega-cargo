import { isProhibitedQuery } from "./compliance/check.ts";
import { isPublishedCategory, publishedSubcategories } from "./catalogue.ts";
import { GOODS, type Good } from "./stores.ts";
import type { RefHomeCopy } from "./ref-home-copy.ts";

export type CategoryTile = {
  key: keyof RefHomeCopy["cats"];
  image: string;
  cat?: string;
  sub?: string;
};

/**
 * The reference's eight category positions mapped onto the real catalogue
 * (`src/lib/catalogue.ts`). Each links to an existing `/stores?cat=…&sub=…` view; nothing here is
 * a backend category of its own. Wearables has no catalogue subgroup of its own, so it opens the
 * electronics accessories view. The eighth position ("More") is rendered by the component and
 * opens the full directory.
 */
export const CATEGORY_TILES: readonly CategoryTile[] = [
  { key: "phone", image: "/home/cat-phone.webp", cat: "electronics", sub: "smartphones" },
  { key: "laptop", image: "/home/cat-laptop.webp", cat: "electronics", sub: "computers" },
  { key: "audio", image: "/home/cat-audio.webp", cat: "electronics", sub: "audio" },
  { key: "wearables", image: "/home/cat-watch.webp", cat: "electronics", sub: "accessories" },
  { key: "gaming", image: "/home/cat-gaming.webp", cat: "gaming" },
  { key: "home", image: "/home/cat-home.webp", cat: "home" },
  { key: "fashion", image: "/home/cat-fashion.webp", cat: "fashion" },
];

/** Four of the bundled example photographs; they are not stock and carry no price. */
export const FEATURED_IDS = ["earbuds", "sneakers", "kettle", "perfume"] as const;

/** Featured examples, filtered through the permanent compliance checker (no bypass). */
export function featuredGoods(labels: Record<string, string>): Good[] {
  return FEATURED_IDS.map((id) => GOODS.find((good) => good.id === id)).filter(
    (good): good is Good => !!good && !isProhibitedQuery(`${good.id} ${labels[good.id] ?? ""}`),
  );
}

export function tileIsPublished(tile: CategoryTile): boolean {
  if (!tile.cat) return true;
  if (!isPublishedCategory(tile.cat)) return false;
  return !tile.sub || publishedSubcategories(tile.cat as never).some((s) => s.id === tile.sub);
}
