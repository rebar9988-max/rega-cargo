import { SEARCH_BRANDS, idealoSearchUrl } from "../catalog.ts";
import { findMatches, isProhibitedQuery } from "../compliance/check.ts";
import { LANGS, type Lang } from "../langs.ts";
import { storeCopy } from "../store-copy.ts";
import {
  GOODS,
  STORE_CATEGORIES,
  STORES,
  storeLogo,
  type GoodId,
  type StoreCategory,
} from "../stores.ts";
import { editDistance, fold, foldWithMap, typoBudget } from "./normalize.ts";

/** Extra spellings people type, in every app language and script. */
const STORE_SYNONYMS: Record<string, string[]> = {
  "amazon-de": ["amazon", "ئەمازۆن", "أمازون", "آمازون", "امازون", "amazone"],
  otto: ["ئۆتۆ", "اوتو", "أوتو"],
  "ebay-de": ["ئیبەی", "إيباي", "ای بی", "ایبی"],
  zalando: ["زالاندۆ", "زالاندو"],
  dm: ["دی ئێم", "دي إم", "دی ام", "drogerie"],
  rossmann: ["ڕۆسمان", "روسمان", "rosman"],
  douglas: ["دوگلاس", "دوغلاس", "داگلاس"],
  sephora: ["سیفۆرا", "سيفورا", "سفورا"],
  decathlon: ["دیکاتلۆن", "ديكاتلون", "دکاتلون"],
  shein: ["شی ئین", "شي إن", "شین"],
  idealo: ["ئایدیالۆ", "ايديالو", "ایدیالو", "preisvergleich", "price comparison", "بەراورد"],
};

const BRAND_SYNONYMS: Record<string, string[]> = {
  NIVEA: ["نیڤیا", "نيفيا", "نیویا", "نیوآ"],
  "L'ORÉAL": ["loreal", "لۆریال", "لوريال", "لورآل"],
  GARNIER: ["گارنیێر", "غارنييه", "گارنیه"],
  KÉRASTASE: ["kerastase", "کێراستاز", "كيراستاس", "کراستاز"],
  ZARA: ["زارا"],
  "H&M": ["hm", "h und m", "ئێچ ئەند ئێم", "اتش اند ام", "اچ اند ام"],
};

const CATEGORY_SYNONYMS: Record<StoreCategory, string[]> = {
  beauty: [
    "beauty",
    "cosmetics",
    "makeup",
    "skincare",
    "care",
    "kosmetik",
    "pflege",
    "schminke",
    "جوانی",
    "مکیاج",
    "ماکیاج",
    "چاودێری پێست",
    "مكياج",
    "عناية بالبشرة",
    "آرایش",
    "لوازم آرایشی",
    "kozmetik",
    "makyaj",
    "bakım",
    "kozmetîk",
  ],
  fashion: [
    "clothes",
    "clothing",
    "apparel",
    "kleidung",
    "mode",
    "جل",
    "جلوبەرگ",
    "پۆشاک",
    "ملابس",
    "لباس",
    "پوشاک",
    "giyim",
    "moda",
    "kinc",
    "cil",
  ],
  electronics: [
    "electronic",
    "tech",
    "technik",
    "phone",
    "handy",
    "mobile",
    "ئەلیکترۆنیات",
    "مۆبایل",
    "موبايل",
    "هاتف",
    "گوشی",
    "telefon",
    "elektronîk",
  ],
  home: [
    "house",
    "household",
    "kitchen",
    "haushalt",
    "küche",
    "wohnen",
    "ناوماڵ",
    "چێشتخانە",
    "مطبخ",
    "آشپزخانه",
    "ev",
    "mutfak",
    "mal",
    "malê",
  ],
  baby: [
    "kids",
    "children",
    "child",
    "family",
    "kinder",
    "familie",
    "منداڵ",
    "کۆرپە",
    "أطفال",
    "رضيع",
    "بچه",
    "نوزاد",
    "bebek",
    "çocuk",
    "zarok",
  ],
  sports: [
    "sport",
    "fitness",
    "football",
    "fußball",
    "وەرزش",
    "یاری",
    "رياضة",
    "ورزش",
    "spor",
    "werzîş",
  ],
  general: [],
};

const ITEM_SYNONYMS: Record<GoodId, string[]> = {
  perfume: [
    "perfume",
    "parfum",
    "parfüm",
    "fragrance",
    "duft",
    "عەتر",
    "بۆن",
    "عطر",
    "ادکلن",
    "bêhn",
  ],
  cream: ["cream", "creme", "crème", "face cream", "krem", "krema", "کرێم", "كريم", "کرم"],
  sneakers: [
    "sneaker",
    "sneakers",
    "shoes",
    "schuhe",
    "turnschuhe",
    "پێڵاو",
    "پیلاو",
    "حذاء",
    "کفش",
    "ayakkabı",
    "pêlav",
  ],
  dress: ["dress", "kleid", "کراس", "فستان", "پیراهن", "elbise", "kiras"],
  earbuds: [
    "earbuds",
    "earphones",
    "headphones",
    "kopfhörer",
    "ohrhörer",
    "airpods",
    "هێدفۆن",
    "بیستۆک",
    "سماعات",
    "هدفون",
    "kulaklık",
    "guhdan",
  ],
  kettle: ["kettle", "wasserkocher", "کەتڵ", "کتری", "غلاية", "çaydanlık", "su ısıtıcı", "çaydank"],
  baby: [
    "baby clothes",
    "babykleidung",
    "baby",
    "جلی منداڵ",
    "ملابس أطفال",
    "لباس بچه",
    "bebek",
    "kincên zarokan",
  ],
  ball: ["ball", "football", "fußball", "soccer", "تۆپ", "كرة", "توپ", "top", "gog"],
};

/** What we send to idealo.de (a German site) for each catalogue item. */
export const ITEM_IDEALO: Record<GoodId, string> = {
  perfume: "Parfüm",
  cream: "Gesichtscreme",
  sneakers: "Sneaker",
  dress: "Kleid",
  earbuds: "Kabellose Kopfhörer",
  kettle: "Wasserkocher",
  baby: "Babykleidung",
  ball: "Fußball",
};

export type Kind = "store" | "brand" | "category" | "item";

export type Destination =
  | { type: "route"; to: "/stores"; search: { q?: string; cat?: string } }
  | { type: "external"; href: string };

type Entry = {
  kind: Kind;
  id: string;
  terms: string[];
  label: (lang: Lang) => string;
  dest: Destination;
  logo?: string;
  image?: string;
  idealo?: string;
  /** A brand's category, suggested alongside a strong brand match. */
  related?: string;
};

export type Hit = {
  kind: Kind;
  id: string;
  label: string;
  /** Range to highlight in `label`, in original character offsets. */
  mark: [number, number] | null;
  score: number;
  dest: Destination;
  logo?: string;
  image?: string;
  idealo?: string;
};

function uniqueFolded(values: string[]): string[] {
  return [...new Set(values.map(fold).filter(Boolean))];
}

function buildEntries(): Entry[] {
  const all = LANGS.map((item) => storeCopy(item.id));
  const storeNames = new Set(STORES.map((store) => fold(store.name)));
  const entries: Entry[] = [];
  for (const store of STORES) {
    entries.push({
      kind: "store",
      id: store.id,
      terms: uniqueFolded([
        store.name,
        store.host,
        store.host.split(".")[0],
        ...(STORE_SYNONYMS[store.id] ?? []),
      ]),
      label: () => store.name,
      dest: { type: "route", to: "/stores", search: { q: store.name } },
      logo: storeLogo(store.id),
    });
  }
  for (const brand of SEARCH_BRANDS) {
    if (storeNames.has(fold(brand.name))) continue;
    entries.push({
      kind: "brand",
      id: brand.name,
      terms: uniqueFolded([brand.name, ...(BRAND_SYNONYMS[brand.name] ?? [])]),
      label: () => brand.name,
      dest: { type: "external", href: idealoSearchUrl(brand.name) ?? "" },
      idealo: brand.name,
      related: brand.category,
    });
  }
  for (const cat of STORE_CATEGORIES) {
    if (cat === "general") continue;
    entries.push({
      kind: "category",
      id: cat,
      terms: uniqueFolded([...all.map((copy) => copy.categories[cat]), ...CATEGORY_SYNONYMS[cat]]),
      label: (lang) => storeCopy(lang).categories[cat],
      dest: { type: "route", to: "/stores", search: { cat } },
    });
  }
  for (const good of GOODS) {
    entries.push({
      kind: "item",
      id: good.id,
      terms: uniqueFolded([...all.map((copy) => copy.goods[good.id]), ...ITEM_SYNONYMS[good.id]]),
      label: (lang) => storeCopy(lang).goods[good.id],
      dest: { type: "external", href: idealoSearchUrl(ITEM_IDEALO[good.id]) ?? "" },
      image: good.image,
      idealo: ITEM_IDEALO[good.id],
    });
  }
  return screen(entries);
}

/**
 * Compliance: a prohibited synonym is dropped, and an entry whose name, link or idealo term is
 * prohibited (or has no allowed link) is left out of the index entirely.
 */
export function screen(list: Entry[]): Entry[] {
  return list
    .filter((entry) => {
      if (entry.dest.type === "external" && !entry.dest.href) return false;
      const names = [entry.id, entry.idealo ?? "", ...LANGS.map((l) => entry.label(l.id))];
      return names.every((name) => findMatches(name).length === 0);
    })
    .map((entry) => ({
      ...entry,
      terms: entry.terms.filter((term) => findMatches(term).length === 0),
    }));
}

let cached: Entry[] | null = null;
function entries(): Entry[] {
  cached ??= buildEntries();
  return cached;
}

function scoreTerm(q: string, tokens: string[], term: string): number {
  if (term === q) return 100;
  if (term.startsWith(q)) return 90 - Math.min(20, term.length - q.length) * 0.5;
  if (q.length >= 3 && term.includes(q)) return 55;
  const words = term.split(" ");
  let total = 0;
  for (const token of tokens) {
    let best = 0;
    for (const word of words) {
      if (word.startsWith(token)) best = Math.max(best, word === token ? 80 : 70);
      else if (token.length >= 3 && word.includes(token)) best = Math.max(best, 45);
      else {
        const budget = typoBudget(token.length);
        if (!budget) continue;
        const distance = Math.min(
          editDistance(token, word, budget),
          word.length > token.length
            ? editDistance(token, word.slice(0, token.length), budget)
            : budget + 1,
        );
        if (distance <= budget) best = Math.max(best, 40 - distance * 8);
      }
    }
    if (!best) return 0;
    total += best;
  }
  return total / tokens.length;
}

/** Highlight the query inside the shown label when it appears there (it may have matched a synonym instead). */
export function markRange(label: string, query: string): [number, number] | null {
  const q = fold(query);
  if (!q) return null;
  const { text, map } = foldWithMap(label);
  let at = text.indexOf(q);
  let length = q.length;
  if (at < 0) {
    const first = q.split(" ")[0];
    const match = new RegExp(`(^| )${first.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).exec(text);
    if (!match) return null;
    at = match.index + match[1].length;
    length = first.length;
  }
  return [map[at], map[at + length - 1] + 1];
}

export type Suggestions = {
  stores: Hit[];
  brands: Hit[];
  categories: Hit[];
  items: Hit[];
  /** The term sent to idealo for the "search on idealo" row ("" = no row). */
  idealoTerm: string;
  /** The query contains a prohibited word: show a neutral "No results" and nothing else. */
  blocked?: boolean;
};

const LIMITS: Record<Kind, number> = { store: 4, brand: 3, category: 3, item: 4 };

let keyed: Map<string, Entry> | null = null;
function byKey(): Map<string, Entry> {
  keyed ??= new Map(entries().map((entry) => [`${entry.kind}:${entry.id}`, entry]));
  return keyed;
}

export function suggest(query: string, lang: Lang): Suggestions {
  const q = fold(query);
  const empty: Suggestions = {
    stores: [],
    brands: [],
    categories: [],
    items: [],
    idealoTerm: query.trim(),
  };
  // A prohibited query gets no hits, no corrections, no idealo row and no AI row.
  if (isProhibitedQuery(query)) return { ...empty, idealoTerm: "", blocked: true };
  if (!q) return empty;
  const tokens = q.split(" ");
  const hits: Hit[] = [];
  for (const entry of entries()) {
    let score = 0;
    for (const term of entry.terms) score = Math.max(score, scoreTerm(q, tokens, term));
    if (score <= 0) continue;
    const label = entry.label(lang);
    const mark = markRange(label, query);
    hits.push({
      kind: entry.kind,
      id: entry.id,
      label,
      mark,
      score: score + (mark ? 5 : 0),
      dest: entry.dest,
      logo: entry.logo,
      image: entry.image,
      idealo: entry.idealo,
    });
  }
  hits.sort((a, b) => b.score - a.score);
  // A strong brand match also offers its category (NIVEA → cosmetics).
  const topBrand = hits.find((hit) => hit.kind === "brand" && hit.score >= 60);
  const relatedId = topBrand && byKey().get(`brand:${topBrand.id}`)?.related;
  if (relatedId && !hits.some((hit) => hit.kind === "category" && hit.id === relatedId)) {
    const cat = byKey().get(`category:${relatedId}`);
    if (cat)
      hits.push({
        kind: "category",
        id: cat.id,
        label: cat.label(lang),
        mark: null,
        score: 1,
        dest: cat.dest,
      });
  }
  const pick = (kind: Kind) => hits.filter((hit) => hit.kind === kind).slice(0, LIMITS[kind]);
  const result: Suggestions = {
    stores: pick("store"),
    brands: pick("brand"),
    categories: pick("category"),
    items: pick("item"),
    idealoTerm: query.trim(),
  };
  // idealo.de is German: Latin-script queries go as typed; Arabic-script ones
  // use the German term of a strong item/brand match when there is one.
  if (/[\u0600-\u06FF]/.test(query)) {
    const strong = hits.find(
      (hit) => (hit.kind === "item" || hit.kind === "brand") && hit.score >= 60,
    );
    if (strong?.idealo) result.idealoTerm = strong.idealo;
  }
  if (!idealoSearchUrl(result.idealoTerm)) result.idealoTerm = "";
  return result;
}
