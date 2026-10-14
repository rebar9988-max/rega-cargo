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
  bringTitle: "Bring For Me",
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
  bringTitle: "أحضر لي",
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

// TODO(translate-review): Persian copy.
const fa: RefHomeCopy = {
  searchPlaceholder: "جستجوی کالا، برند یا خدمات…",
  search: "جستجو",
  ai: "دستیار R&L AI",
  aiLabel: "R&L AI",
  menu: "منو",
  language: "زبان",
  eyebrow: "فناوری برای زندگی بهتر",
  titleLines: ["دنیای خودت را", "نو کن"],
  lede: "فناوری‌های نوآورانه‌ای را کشف کنید که سبک زندگی شما را همراهی می‌کنند.",
  shop: "ببین و سفارش بده",
  compare: "مقایسهٔ قیمت‌ها",
  categoriesTitle: "دسته‌های بازار",
  categoriesAll: "همهٔ دسته‌ها",
  cats: {
    phone: "موبایل و فناوری",
    laptop: "لپ‌تاپ و رایانه",
    audio: "هدفون و صوتی",
    wearables: "پوشیدنی‌ها",
    gaming: "بازی و گیمینگ",
    home: "خانه و زندگی",
    fashion: "پوشاک",
    more: "بیشتر",
  },
  featuredTitle: "نمونه‌های منتخب",
  featuredAll: "همهٔ فروشگاه‌ها",
  featuredNote: "عکس‌ها فقط نمونه‌اند و موجودی واقعی نیستند.",
  priceAwaiting: "قیمت در انتظار تأیید",
  example: "نمونه",
  addRequest: "درخواست این کالا",
  bringTitle: "برای من بیاور",
  bringBody: "از فروشگاه‌های اروپایی به کردستان و عراق.",
  bringCta: "بیشتر بدانید",
  careTitle: "حفاظت بیشتر برای کالاهای شما",
  careBody: "سرویس R&L CARE+ هنوز در دسترس نیست.",
  careSoon: "به‌زودی",
  careCta: "تماس با ما",
  benefits: [
    { title: "قیمت‌های روشن", body: "به یورو و دینار، بر اساس وزن محاسبه‌شده" },
    { title: "رهگیری مرسوله", body: "با کد رهگیری خودتان" },
    { title: "درخواست از فروشگاه", body: "از فروشگاه‌های اروپایی سفارش دهید" },
    { title: "فروشگاه‌های ذخیره‌شده", body: "فروشگاه‌های مورد علاقه‌تان را نگه دارید" },
  ],
};

// TODO(translate-review): German copy.
const de: RefHomeCopy = {
  searchPlaceholder: "Nach Produkten, Marken oder Diensten suchen…",
  search: "Suche",
  ai: "R&L KI-Assistent",
  aiLabel: "R&L AI",
  menu: "Menü",
  language: "Sprache",
  eyebrow: "Technologie für ein besseres Leben",
  titleLines: ["Erneuere", "deine Welt"],
  lede: "Entdecke innovative Technik, die deinen Lebensstil antreibt.",
  shop: "Stöbern und bestellen",
  compare: "Preise vergleichen",
  categoriesTitle: "Marktplatz-Kategorien",
  categoriesAll: "Alle Kategorien",
  cats: {
    phone: "Handy & Technik",
    laptop: "Laptops & Computer",
    audio: "Kopfhörer & Audio",
    wearables: "Wearables",
    gaming: "Gaming",
    home: "Haus & Leben",
    fashion: "Mode",
    more: "Mehr",
  },
  featuredTitle: "Ausgewählte Beispiele",
  featuredAll: "Alle Shops",
  featuredNote: "Fotos sind nur Beispiele, kein verfügbarer Bestand.",
  priceAwaiting: "Preis wartet auf Bestätigung",
  example: "Beispiel",
  addRequest: "Diesen Artikel anfragen",
  bringTitle: "Für mich besorgen",
  bringBody: "Aus europäischen Shops nach Kurdistan und in den Irak.",
  bringCta: "Mehr erfahren",
  careTitle: "Mehr Schutz für deine Waren",
  careBody: "R&L CARE+ ist noch nicht verfügbar.",
  careSoon: "Demnächst",
  careCta: "Kontakt aufnehmen",
  benefits: [
    { title: "Klare Preise", body: "In Euro und Dinar, nach berechnetem Gewicht" },
    { title: "Sendung verfolgen", body: "Mit deinem Tracking-Code" },
    { title: "Shop-Anfragen", body: "Bestelle bei europäischen Shops" },
    { title: "Gespeicherte Shops", body: "Behalte deine Lieblings-Shops" },
  ],
};

// TODO(translate-review): Turkish copy.
const tr: RefHomeCopy = {
  searchPlaceholder: "Ürün, marka veya hizmet ara…",
  search: "Ara",
  ai: "R&L AI asistanı",
  aiLabel: "R&L AI",
  menu: "Menü",
  language: "Dil",
  eyebrow: "Daha iyi bir yaşam için teknoloji",
  titleLines: ["Dünyanı", "yenile"],
  lede: "Yaşam tarzına güç veren yenilikçi teknolojileri keşfet.",
  shop: "Göz at ve sipariş ver",
  compare: "Fiyatları karşılaştır",
  categoriesTitle: "Pazar kategorileri",
  categoriesAll: "Tüm kategoriler",
  cats: {
    phone: "Telefon ve teknoloji",
    laptop: "Dizüstü ve bilgisayar",
    audio: "Kulaklık ve ses",
    wearables: "Giyilebilir",
    gaming: "Oyun",
    home: "Ev ve yaşam",
    fashion: "Giyim",
    more: "Daha fazla",
  },
  featuredTitle: "Öne çıkan örnekler",
  featuredAll: "Tüm mağazalar",
  featuredNote: "Fotoğraflar yalnızca örnektir, mevcut stok değildir.",
  priceAwaiting: "Fiyat onay bekliyor",
  example: "Örnek",
  addRequest: "Bu ürünü talep et",
  bringTitle: "Benim için getir",
  bringBody: "Avrupa mağazalarından Kürdistan ve Irak'a.",
  bringCta: "Daha fazla bilgi",
  careTitle: "Eşyaların için daha fazla koruma",
  careBody: "R&L CARE+ henüz kullanılamıyor.",
  careSoon: "Yakında",
  careCta: "Bize ulaş",
  benefits: [
    { title: "Net fiyatlar", body: "Euro ve dinar, ücretlendirilen ağırlığa göre" },
    { title: "Kargonu takip et", body: "Takip kodunla izle" },
    { title: "Mağaza talepleri", body: "Avrupa mağazalarından sipariş ver" },
    { title: "Kayıtlı mağazalar", body: "Sevdiğin mağazaları sakla" },
  ],
};

// TODO(translate-review): Kurmanji copy (Badini).
const ku: RefHomeCopy = {
  searchPlaceholder: "Li tişt, marqe an xizmetê bigere…",
  search: "Lêgerîn",
  ai: "Alîkarê R&L AI",
  aiLabel: "R&L AI",
  menu: "Menû",
  language: "Ziman",
  eyebrow: "Teknolojî ji bo jiyanek çêtir",
  titleLines: ["Cîhana xwe", "nû bike"],
  lede: "Teknolojiyên nûjen ên ku şêwaza jiyana te piştgirî dikin keşf bike.",
  shop: "Bibîne û bixwaze",
  compare: "Bihayan bidin ber hev",
  categoriesTitle: "Beşên bazarê",
  categoriesAll: "Hemû beş",
  cats: {
    phone: "Mobîl û teknolojî",
    laptop: "Laptop û komputer",
    audio: "Guhdarkirin û dengî",
    wearables: "Tiştên li xwekirinê",
    gaming: "Lîstik û gaming",
    home: "Mal û jiyan",
    fashion: "Cil û berg",
    more: "Zêdetir",
  },
  featuredTitle: "Mînakên hilbijartî",
  featuredAll: "Hemû firotgeh",
  featuredNote: "Wêne tenê mînak in, ne stoka berdest.",
  priceAwaiting: "Biha li benda pejirandinê ye",
  example: "Mînak",
  addRequest: "Ji bo vî tiştî daxwaz bike",
  bringTitle: "Ji min re bîne",
  bringBody: "Ji firotgehên Ewropayê ber bi Kurdistan û Iraqê ve.",
  bringCta: "Zêdetir bizane",
  careTitle: "Parastineke zêdetir ji bo tiştên te",
  careBody: "R&L CARE+ hê ne berdest e.",
  careSoon: "Zû",
  careCta: "Têkilî bigire",
  benefits: [
    { title: "Bihayên zelal", body: "Bi euro û dînar, li gorî giraniya hesabkirî" },
    { title: "Barê xwe bişopîne", body: "Bi koda şopandinê" },
    { title: "Daxwazên firotgehê", body: "Ji firotgehên Ewropayê daxwaz bike" },
    { title: "Firotgehên tomarkirî", body: "Firotgehên xwe yên hezkirî biparêze" },
  ],
};

const ALL: Record<Lang, RefHomeCopy> = { en, ckb, ar, fa, de, tr, ku };

export function refHomeCopy(lang: Lang): RefHomeCopy {
  return ALL[lang];
}
