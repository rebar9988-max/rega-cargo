import type { Lang } from "./langs.ts";

/**
 * Copy for the reference homepage (header, hero, categories, featured examples, two banners and
 * four benefit cards). Every line describes something the platform really does: no discounts,
 * prices, ratings, stock, insurance or partnership claims. The Sorani strings follow the owner's
 * reference; where the reference promised something the platform does not offer, the honest
 * equivalent is used instead (documented in docs/implementation/RL_DESIGN_PROGRESS.md).
 */
export type RefHomeCopy = {
  searchPlaceholder: string;
  search: string;
  ai: string;
  aiLabel: string;
  menu: string;
  language: string;
  eyebrow: string;
  /** Two lines; the first is black, the second brand red. */
  titleLines: readonly [string, string];
  lede: string;
  shop: string;
  compare: string;
  categoriesTitle: string;
  categoriesAll: string;
  cats: {
    phone: string;
    laptop: string;
    audio: string;
    wearables: string;
    gaming: string;
    home: string;
    fashion: string;
    more: string;
  };
  featuredTitle: string;
  featuredAll: string;
  featuredNote: string;
  priceAwaiting: string;
  example: string;
  addRequest: string;
  bringTitle: string;
  bringBody: string;
  bringCta: string;
  careTitle: string;
  careBody: string;
  careSoon: string;
  careCta: string;
  benefits: readonly { title: string; body: string }[];
};

const en: RefHomeCopy = {
  searchPlaceholder: "Search for products, brands or services…",
  search: "Search",
  ai: "R&L AI assistant",
  aiLabel: "R&L AI",
  menu: "Menu",
  language: "Language",
  eyebrow: "Technology for a better life",
  titleLines: ["Renew your", "world"],
  lede: "Discover innovative tech that powers your lifestyle.",
  shop: "Browse and order",
  compare: "Compare prices",
  categoriesTitle: "Marketplace categories",
  categoriesAll: "All categories",
  cats: {
    phone: "Mobile & tech",
    laptop: "Laptops & computers",
    audio: "Headphones & audio",
    wearables: "Wearables",
    gaming: "Gaming",
    home: "Home & living",
    fashion: "Fashion",
    more: "More",
  },
  featuredTitle: "Featured examples",
  featuredAll: "All stores",
  featuredNote: "Photos are examples only, not available stock.",
  priceAwaiting: "Price awaiting confirmation",
  example: "Example",
  addRequest: "Request this item",
  bringTitle: "Bring it for me",
  bringBody: "From European stores to Kurdistan and Iraq.",
  bringCta: "Learn more",
  careTitle: "More protection for your goods",
  careBody: "R&L CARE+ is not available yet.",
  careSoon: "Coming soon",
  careCta: "Contact us",
  benefits: [
    { title: "Clear prices", body: "Euro and dinar, by chargeable weight" },
    { title: "Track your parcel", body: "Follow it with your tracking code" },
    { title: "Store requests", body: "Order from European stores" },
    { title: "Saved stores", body: "Keep your favorite stores" },
  ],
};

// TODO(translate-review): all Sorani lines were written from the owner's reference; spelling of
// "پێشنیار" follows official orthography (the reference printed "پێشنیهاد").
const ckb: RefHomeCopy = {
  searchPlaceholder: "گەڕان بەدوای کاڵا، مارکە، یان خزمەتگوزاری…",
  search: "گەڕان",
  ai: "یاریدەدەری R&L AI",
  aiLabel: "R&L AI",
  menu: "مەنیو",
  language: "زمان",
  eyebrow: "تەکنەلۆژیا بۆ ژیانێکی باشتر",
  titleLines: ["جیهانەکەت", "نوێ بکەرەوە"],
  // The reference keeps this line in English inside the Sorani composition.
  lede: "Discover innovative tech that powers your lifestyle.",
  shop: "پشکنە و بیکڕە",
  compare: "نرخەکان بەراورد بکە",
  categoriesTitle: "کاتیگۆرییەکانی بازاڕ",
  categoriesAll: "هەموو کاتیگۆرییەکان",
  cats: {
    phone: "مۆبایل و تەکنەلۆژی",
    laptop: "لاپتۆپ و کۆمپیوتەر",
    audio: "گوێگرە و هێدفۆن",
    wearables: "وێرابڵ",
    gaming: "یاری و گەیمینگ",
    home: "ماڵ و ژیان",
    fashion: "جل و پۆشاک",
    more: "زیاتر",
  },
  featuredTitle: "پێشنیارە تایبەتییەکان",
  featuredAll: "هەموو فرۆشگاکان",
  featuredNote: "وێنەکان تەنها نموونەن، نەک کاڵای بەردەست.",
  priceAwaiting: "نرخ چاوەڕوانی پشتڕاستکردنەوەیە",
  example: "نموونە",
  addRequest: "داواکاری بۆ ئەم کاڵایە",
  bringTitle: "کاڵام بۆ بهێنەوە",
  bringBody: "لە فرۆشگا ئەوروپییەکانەوە بۆ کوردستان و عێراق.",
  bringCta: "زیاتر بزانە",
  careTitle: "پاراستنی زیاتر بۆ کاڵاکانت",
  careBody: "R&L CARE+ هێشتا بەردەست نییە.",
  careSoon: "بەمزووانە",
  careCta: "پەیوەندیمان پێوە بکە",
  benefits: [
    { title: "نرخی ڕوون", body: "بە یۆرۆ و دینار، بەپێی کێشی حیسابکراو" },
    { title: "بارەکەت بەدواداچوون بکە", body: "بە کۆدی بەدواداچوون" },
    { title: "داواکاری فرۆشگا", body: "لە فرۆشگا ئەوروپییەکان داوا بکە" },
    { title: "فرۆشگا دڵخوازەکان", body: "فرۆشگاکانی خۆت هەڵبگرە" },
  ],
};

// TODO(translate-review): Arabic copy.
const ar: RefHomeCopy = {
  searchPlaceholder: "ابحث عن منتج أو علامة أو خدمة…",
  search: "بحث",
  ai: "مساعد R&L AI",
  aiLabel: "R&L AI",
  menu: "القائمة",
  language: "اللغة",
  eyebrow: "تقنية لحياة أفضل",
  titleLines: ["جدّد", "عالمك"],
  lede: "اكتشف تقنيات مبتكرة تدعم أسلوب حياتك.",
  shop: "تصفّح واطلب",
  compare: "قارن الأسعار",
  categoriesTitle: "فئات السوق",
  categoriesAll: "كل الفئات",
  cats: {
    phone: "الجوال والتقنية",
    laptop: "اللابتوب والكمبيوتر",
    audio: "السماعات",
    wearables: "الأجهزة القابلة للارتداء",
    gaming: "الألعاب",
    home: "المنزل والحياة",
    fashion: "الملابس والأزياء",
    more: "المزيد",
  },
  featuredTitle: "أمثلة مختارة",
  featuredAll: "كل المتاجر",
  featuredNote: "الصور للتوضيح فقط وليست مخزوناً متاحاً.",
  priceAwaiting: "السعر بانتظار التأكيد",
  example: "مثال",
  addRequest: "اطلب هذا المنتج",
  bringTitle: "أحضره لي",
  bringBody: "من المتاجر الأوروبية إلى كردستان والعراق.",
  bringCta: "اعرف المزيد",
  careTitle: "حماية أكبر لبضاعتك",
  careBody: "خدمة R&L CARE+ غير متاحة بعد.",
  careSoon: "قريباً",
  careCta: "تواصل معنا",
  benefits: [
    { title: "أسعار واضحة", body: "باليورو والدينار حسب الوزن المحتسب" },
    { title: "تتبّع شحنتك", body: "برمز التتبع الخاص بك" },
    { title: "طلبات المتاجر", body: "اطلب من المتاجر الأوروبية" },
    { title: "المتاجر المفضلة", body: "احفظ متاجرك المفضلة" },
  ],
};

// TODO(translate-review): German, Persian, Turkish and Kurmanji reuse the English copy until
// reviewed (same convention as the catalogue copy).
const ALL: Record<Lang, RefHomeCopy> = { en, ckb, ar, fa: en, de: en, tr: en, ku: en };

export function refHomeCopy(lang: Lang): RefHomeCopy {
  return ALL[lang];
}
