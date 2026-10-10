import type { GoodId, StoreCategory } from "./stores";
/** Existing catalogue membership only. No invented subcategories or inventory. */
export const NAV_CATEGORIES: {
  id: "women" | "men" | "kids" | "beauty" | "electronics" | "home" | "sports";
  cat: StoreCategory;
  who?: string;
  image: GoodId;
  children: StoreCategory[];
}[] = [
  { id: "women", cat: "fashion", who: "women", image: "dress", children: ["fashion", "beauty"] },
  { id: "men", cat: "fashion", who: "men", image: "sneakers", children: ["fashion", "sports"] },
  { id: "kids", cat: "baby", who: "kids", image: "baby", children: ["baby", "sports"] },
  { id: "beauty", cat: "beauty", image: "cream", children: ["beauty"] },
  { id: "electronics", cat: "electronics", image: "earbuds", children: ["electronics"] },
  { id: "home", cat: "home", image: "kettle", children: ["home"] },
  { id: "sports", cat: "sports", image: "ball", children: ["sports"] },
];
export const ANNOUNCEMENT_ENABLED = true;
