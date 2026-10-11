import { idealoSearchUrl } from "./catalog.ts";
import { STORE_CATEGORIES, type StoreCategory } from "./stores.ts";

/**
 * The ten primary shopping groups, in display order. Six reuse the original slugs (and their
 * URLs, ?cat=beauty …); food, gaming, auto and pets were added for the full catalogue.
 * This is navigation only: no products, counts, prices or stock are attached to it.
 */
export type PrimaryCategory = Exclude<StoreCategory, "general">;
export const PRIMARY_CATEGORIES: readonly PrimaryCategory[] = [
  "electronics",
  "sports",
  "baby",
  "home",
  "food",
  "gaming",
  "beauty",
  "auto",
  "fashion",
  "pets",
];

/**
 * A subcategory is a search refinement, not a stock list. `idealo` is the German search term for
 * the public idealo.de search (prices only ever shown there). `idealo: null` means request-only:
 * food, pet food and health products are reviewed by staff (halal and shipping rules) instead
 * of linking to an open external search.
 */
export type Subcategory = { id: string; idealo: string | null };

export const SUBCATEGORIES: Record<PrimaryCategory, readonly Subcategory[]> = {
  electronics: [
    { id: "smartphones", idealo: "Smartphone" },
    { id: "computers", idealo: "Notebook" },
    { id: "tablets", idealo: "Tablet" },
    { id: "audio", idealo: "Kopfhörer" },
    { id: "cameras", idealo: "Digitalkamera" },
    { id: "accessories", idealo: "Handyzubehör" },
  ],
  sports: [
    { id: "fitness", idealo: "Fitnessgeräte" },
    { id: "cycling", idealo: "Fahrradzubehör" },
    { id: "camping", idealo: "Campingausrüstung" },
    { id: "outdoor-clothing", idealo: "Outdoorjacke" },
    { id: "equipment", idealo: "Sportartikel" },
  ],
  baby: [
    { id: "baby-clothing", idealo: "Babykleidung" },
    { id: "kids-clothing", idealo: "Kinderkleidung" },
    { id: "strollers", idealo: "Kinderwagen" },
    { id: "essentials", idealo: "Babypflege" },
    { id: "accessories", idealo: "Babyzubehör" },
  ],
  home: [
    { id: "furniture", idealo: "Möbel" },
    { id: "kitchen", idealo: "Küchenzubehör" },
    { id: "appliances", idealo: "Haushaltsgeräte" },
    { id: "decor", idealo: "Wohnaccessoires" },
    { id: "garden", idealo: "Gartenbedarf" },
  ],
  food: [
    { id: "pantry", idealo: null },
    { id: "snacks", idealo: null },
    { id: "coffee-tea", idealo: null },
    { id: "drinks", idealo: null },
    { id: "cooking", idealo: null },
  ],
  gaming: [
    { id: "consoles", idealo: "Spielkonsole" },
    { id: "video-games", idealo: "Videospiele" },
    { id: "accessories", idealo: "Gaming Zubehör" },
    { id: "educational", idealo: "Lernspielzeug" },
    { id: "board-games", idealo: "Brettspiele" },
  ],
  beauty: [
    { id: "skincare", idealo: "Hautpflege" },
    { id: "haircare", idealo: "Haarpflege" },
    { id: "cosmetics", idealo: "Make-up" },
    { id: "hygiene", idealo: "Körperpflege" },
    { id: "health", idealo: null },
  ],
  auto: [
    { id: "accessories", idealo: "Autozubehör" },
    { id: "car-care", idealo: "Autopflege" },
    { id: "motorcycle", idealo: "Motorradzubehör" },
    { id: "tools", idealo: "Werkstattausrüstung" },
    { id: "parts", idealo: "Autoersatzteile" },
  ],
  fashion: [
    { id: "men", idealo: "Herrenbekleidung" },
    { id: "women", idealo: "Damenbekleidung" },
    { id: "shoes", idealo: "Schuhe" },
    { id: "bags", idealo: "Taschen" },
    { id: "accessories", idealo: "Modeaccessoires" },
  ],
  pets: [
    { id: "food", idealo: null },
    { id: "accessories", idealo: "Haustierzubehör" },
    { id: "grooming", idealo: "Tierpflege" },
    { id: "beds", idealo: "Hundebett" },
    { id: "toys", idealo: "Hundespielzeug" },
  ],
};

/**
 * Regulated groups stay unpublished ("Coming soon", not linked, not searchable, no stores
 * listed) until the owner explicitly approves them: food safety and health products.
 * To publish, remove the id here after approval; nothing else changes.
 */
export const PENDING_APPROVAL_CATEGORIES: ReadonlySet<StoreCategory> = new Set(["food"]);
export const PENDING_APPROVAL_SUBCATEGORIES: Partial<Record<PrimaryCategory, readonly string[]>> = {
  beauty: ["health"],
  pets: ["food"],
};

export function isPublishedCategory(cat: unknown): boolean {
  return (
    typeof cat === "string" &&
    (STORE_CATEGORIES as readonly string[]).includes(cat) &&
    !PENDING_APPROVAL_CATEGORIES.has(cat as StoreCategory)
  );
}

/** Categories that may appear in filters, search and store cards. */
export const PUBLISHED_STORE_CATEGORIES: readonly StoreCategory[] =
  STORE_CATEGORIES.filter(isPublishedCategory);

/** Subcategories that may be shown for a primary category. */
export function publishedSubcategories(cat: PrimaryCategory): readonly Subcategory[] {
  if (!isPublishedCategory(cat)) return [];
  const pending = PENDING_APPROVAL_SUBCATEGORIES[cat] ?? [];
  return SUBCATEGORIES[cat].filter((item) => !pending.includes(item.id));
}

export function isPrimaryCategory(value: unknown): value is PrimaryCategory {
  return typeof value === "string" && (PRIMARY_CATEGORIES as readonly string[]).includes(value);
}

/** The subcategory, only when it belongs to the given primary category and is published. */
export function findSubcategory(cat: unknown, sub: unknown): Subcategory | undefined {
  if (!isPrimaryCategory(cat) || typeof sub !== "string") return undefined;
  return publishedSubcategories(cat).find((item) => item.id === sub);
}

/** idealo search for a subcategory, or null when it is request-only or the term is prohibited. */
export function subcategorySearchUrl(item: Subcategory): string | null {
  return item.idealo ? idealoSearchUrl(item.idealo) : null;
}
