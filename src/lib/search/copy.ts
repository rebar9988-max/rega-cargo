import type { Lang } from "../langs.ts";

export type SuggestCopy = {
  recent: string;
  clear: string;
  categories: string;
  stores: string;
  trending: string;
  idealoNote: string;
  brands: string;
  items: string;
  /** `{q}` is replaced with the term sent to idealo. */
  onIdealo: string;
  aiPhoto: string;
  none: string;
  /** Neutral, for a query with a prohibited word: no suggestion, no idealo hint. */
  noResults: string;
  external: string;
};

export const SUGGEST_COPY: Record<Lang, SuggestCopy> = {
  ckb: {
    recent: "گەڕانەکانی پێشوو",
    clear: "سڕینەوە",
    categories: "پۆلە بەناوبانگەکان",
    stores: "فرۆشگاکان",
    trending: "کاڵاکان",
    idealoNote: "نرخ لێرە دانانرێت. لە idealo دەیبینیت، پاشان لێرە داوا دەکەیت.",
    brands: "براندەکان",
    items: "کاڵاکان",
    onIdealo: "گەڕان بۆ «{q}» لە idealo",
    aiPhoto: "ناسینەوە بە وێنە لەگەڵ R&L AI",
    none: "هیچ ئەنجامێک نییە. دەتوانیت لە idealo بگەڕێیت.",
    noResults: "هیچ ئەنجامێک نییە.",
    external: "idealo.de دەکاتەوە",
  },
  ku: {
    recent: "Lêgerînên dawî",
    clear: "Paqij bike",
    categories: "Kategoriyên populer",
    stores: "Firoşgeh",
    trending: "Kelûpel",
    idealoNote: "Biha li vir nayê danîn. Li idealo dibînî, paşê li vir siparîş dikî.",
    brands: "Marke",
    items: "Kelûpel",
    onIdealo: "Li idealo li «{q}» bigere",
    aiPhoto: "Bi wêneyê nas bike bi R&L AI",
    none: "Encam tune. Tu dikarî li idealo bigerî.",
    noResults: "Encam tune.",
    external: "idealo.de vedike",
  },
  ar: {
    recent: "عمليات البحث الأخيرة",
    clear: "مسح",
    categories: "فئات شائعة",
    stores: "المتاجر",
    trending: "منتجات رائجة",
    idealoNote: "لا تُحدَّد الأسعار هنا. تراها على idealo ثم تطلب هنا.",
    brands: "العلامات التجارية",
    items: "المنتجات",
    onIdealo: "ابحث عن «{q}» في idealo",
    aiPhoto: "تعرّف بالصورة مع R&L AI",
    none: "لا نتائج. يمكنك البحث في idealo.",
    noResults: "لا نتائج.",
    external: "يفتح idealo.de",
  },
  fa: {
    recent: "جستجوهای اخیر",
    clear: "پاک کردن",
    categories: "دسته‌های پرطرفدار",
    stores: "فروشگاه‌ها",
    trending: "کالاهای پرطرفدار",
    idealoNote: "قیمت اینجا تعیین نمی‌شود. آن را در idealo می‌بینید و سپس اینجا سفارش می‌دهید.",
    brands: "برندها",
    items: "کالاها",
    onIdealo: "جستجوی «{q}» در idealo",
    aiPhoto: "شناسایی با عکس با R&L AI",
    none: "نتیجه‌ای نیست. می‌توانید در idealo جستجو کنید.",
    noResults: "نتیجه‌ای نیست.",
    external: "idealo.de را باز می‌کند",
  },
  de: {
    recent: "Letzte Suchen",
    clear: "Löschen",
    categories: "Beliebte Kategorien",
    stores: "Läden",
    trending: "Im Trend",
    idealoNote:
      "Preise werden hier nicht festgelegt. Du siehst sie auf idealo und bestellst dann hier.",
    brands: "Marken",
    items: "Artikel",
    onIdealo: "„{q}“ auf idealo suchen",
    aiPhoto: "Per Foto erkennen mit R&L AI",
    none: "Keine Treffer. Du kannst auf idealo suchen.",
    noResults: "Keine Treffer.",
    external: "Öffnet idealo.de",
  },
  tr: {
    recent: "Son aramalar",
    clear: "Temizle",
    categories: "Popüler kategoriler",
    stores: "Mağazalar",
    trending: "Trend ürünler",
    idealoNote: "Fiyatlar burada belirlenmez. idealo'da görür, sonra burada sipariş verirsin.",
    brands: "Markalar",
    items: "Ürünler",
    onIdealo: "“{q}” için idealo'da ara",
    aiPhoto: "R&L AI ile fotoğraftan tanı",
    none: "Sonuç yok. idealo'da arayabilirsin.",
    noResults: "Sonuç yok.",
    external: "idealo.de'yi açar",
  },
  en: {
    recent: "Recent searches",
    clear: "Clear",
    categories: "Popular categories",
    stores: "Stores",
    trending: "Trending",
    idealoNote: "Prices aren't set here. You check them on idealo, then order here.",
    brands: "Brands",
    items: "Items",
    onIdealo: "Search “{q}” on idealo",
    aiPhoto: "Identify by photo with R&L AI",
    none: "No matches. You can search idealo.",
    noResults: "No results.",
    external: "Opens idealo.de",
  },
};
