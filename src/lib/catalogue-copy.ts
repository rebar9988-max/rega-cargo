import type { Lang } from "./langs.ts";
import type { PrimaryCategory } from "./catalogue.ts";

/** Subcategory labels, keyed by primary category then subcategory id (src/lib/catalogue.ts). */
type SubLabels = Record<PrimaryCategory, Record<string, string>>;

export type CatalogueCopy = {
  title: string;
  lede: string;
  subTitle: string;
  all: string;
  searchIdealo: string;
  requestOnly: string;
  note: string;
  emptyCategory: string;
  comingSoon: string;
  pendingBody: string;
  subs: SubLabels;
};

const en: CatalogueCopy = {
  title: "All categories",
  lede: "Ten shopping groups. Choose one to see the stores that sell it.",
  subTitle: "Narrow it down",
  all: "All",
  searchIdealo: "Compare prices on idealo",
  requestOnly:
    "Food, pet food and health products are requested through R&L, so we can check them first.",
  note: "Categories show stores, not live stock.",
  emptyCategory: "No listed store covers this category yet. You can still send a purchase request.",
  comingSoon: "Coming soon",
  pendingBody: "This category opens after our product review. Nothing is listed yet.",
  subs: {
    electronics: {
      smartphones: "Smartphones",
      computers: "Computers & laptops",
      tablets: "Tablets",
      audio: "Audio & headphones",
      cameras: "Cameras",
      accessories: "Accessories",
    },
    sports: {
      fitness: "Fitness",
      cycling: "Cycling",
      camping: "Camping",
      "outdoor-clothing": "Outdoor clothing",
      equipment: "Sports equipment",
    },
    baby: {
      "baby-clothing": "Baby clothing",
      "kids-clothing": "Children's clothing",
      strollers: "Strollers",
      essentials: "Baby care essentials",
      accessories: "Childcare accessories",
    },
    home: {
      furniture: "Furniture",
      kitchen: "Kitchen",
      appliances: "Home appliances",
      decor: "Home decoration",
      garden: "Garden supplies",
    },
    food: {
      pantry: "Pantry groceries",
      snacks: "Snacks",
      "coffee-tea": "Coffee & tea",
      drinks: "Water, juice & soft drinks",
      cooking: "Cooking ingredients",
    },
    gaming: {
      consoles: "Gaming consoles",
      "video-games": "Video games",
      accessories: "Gaming accessories",
      educational: "Educational toys",
      "board-games": "Board games",
    },
    beauty: {
      skincare: "Skincare",
      haircare: "Haircare",
      cosmetics: "Cosmetics",
      hygiene: "Personal hygiene",
      health: "Personal health care (non-prescription)",
    },
    auto: {
      accessories: "Vehicle accessories",
      "car-care": "Car care",
      motorcycle: "Motorcycle accessories",
      tools: "Maintenance equipment",
      parts: "Replacement parts",
    },
    fashion: {
      men: "Men's clothing",
      women: "Women's clothing",
      shoes: "Shoes",
      bags: "Bags",
      accessories: "Fashion accessories",
    },
    pets: {
      food: "Pet food",
      accessories: "Pet accessories",
      grooming: "Grooming supplies",
      beds: "Pet beds",
      toys: "Pet toys",
    },
  },
};

const de: CatalogueCopy = {
  title: "Alle Kategorien",
  lede: "Zehn Einkaufsbereiche. Wähle einen, um die Shops zu sehen, die ihn führen.",
  subTitle: "Genauer wählen",
  all: "Alle",
  searchIdealo: "Preise bei idealo vergleichen",
  requestOnly:
    "Lebensmittel, Tierfutter und Gesundheitsprodukte laufen über eine Anfrage bei R&L, damit wir sie zuerst prüfen.",
  note: "Kategorien zeigen Shops, keinen Live-Bestand.",
  emptyCategory:
    "Noch kein gelisteter Shop führt diese Kategorie. Du kannst trotzdem eine Kaufanfrage senden.",
  comingSoon: "Demnächst",
  pendingBody: "Diese Kategorie öffnet nach unserer Produktprüfung. Noch ist nichts gelistet.",
  subs: {
    electronics: {
      smartphones: "Smartphones",
      computers: "Computer & Laptops",
      tablets: "Tablets",
      audio: "Audio & Kopfhörer",
      cameras: "Kameras",
      accessories: "Zubehör",
    },
    sports: {
      fitness: "Fitness",
      cycling: "Radsport",
      camping: "Camping",
      "outdoor-clothing": "Outdoorbekleidung",
      equipment: "Sportausrüstung",
    },
    baby: {
      "baby-clothing": "Babykleidung",
      "kids-clothing": "Kinderkleidung",
      strollers: "Kinderwagen",
      essentials: "Babypflege",
      accessories: "Baby- & Kinderzubehör",
    },
    home: {
      furniture: "Möbel",
      kitchen: "Küche",
      appliances: "Haushaltsgeräte",
      decor: "Wohndeko",
      garden: "Gartenbedarf",
    },
    food: {
      pantry: "Vorrat & Grundnahrung",
      snacks: "Snacks",
      "coffee-tea": "Kaffee & Tee",
      drinks: "Wasser, Saft & Softdrinks",
      cooking: "Kochzutaten",
    },
    gaming: {
      consoles: "Spielkonsolen",
      "video-games": "Videospiele",
      accessories: "Gaming-Zubehör",
      educational: "Lernspielzeug",
      "board-games": "Brettspiele",
    },
    beauty: {
      skincare: "Hautpflege",
      haircare: "Haarpflege",
      cosmetics: "Kosmetik",
      hygiene: "Körperhygiene",
      health: "Gesundheitspflege (rezeptfrei)",
    },
    auto: {
      accessories: "Fahrzeugzubehör",
      "car-care": "Autopflege",
      motorcycle: "Motorradzubehör",
      tools: "Werkstattausrüstung",
      parts: "Ersatzteile",
    },
    fashion: {
      men: "Herrenmode",
      women: "Damenmode",
      shoes: "Schuhe",
      bags: "Taschen",
      accessories: "Accessoires",
    },
    pets: {
      food: "Tierfutter",
      accessories: "Tierzubehör",
      grooming: "Pflegeprodukte",
      beds: "Tierbetten",
      toys: "Tierspielzeug",
    },
  },
};

// TODO(translate-review): new Sorani catalogue copy, needs native review.
const ckb: CatalogueCopy = {
  title: "هەموو پۆلەکان",
  lede: "دە گرووپی بازاڕکردن. یەکێک هەڵبژێرە بۆ بینینی ئەو فرۆشگایانەی دەیفرۆشن.",
  subTitle: "وردتر هەڵبژێرە",
  all: "هەموو",
  searchIdealo: "بەراوردی نرخ لە idealo",
  requestOnly:
    "خۆراک، خۆراکی ئاژەڵ و بەرهەمی تەندروستی لە ڕێگەی R&L داوا دەکرێن، بۆ ئەوەی سەرەتا بیانپشکنین.",
  note: "پۆلەکان فرۆشگاکان نیشان دەدەن، نەک کاڵای بەردەست.",
  emptyCategory:
    "هێشتا هیچ فرۆشگایەکی لیستکراو ئەم پۆلە ناگرێتەوە. دەتوانیت هەر داوای کڕین بنێریت.",
  comingSoon: "بەم زووانە",
  pendingBody: "ئەم پۆلە دوای پشکنینی بەرهەمەکان دەکرێتەوە. هێشتا هیچ شتێک لیست نەکراوە.",
  subs: {
    electronics: {
      smartphones: "مۆبایلی زیرەک",
      computers: "کۆمپیوتەر و لاپتۆپ",
      tablets: "تابلێت",
      audio: "دەنگ و هێدفۆن",
      cameras: "کامێرا",
      accessories: "پاشکۆکان",
    },
    sports: {
      fitness: "فیتنەس",
      cycling: "پاسکیلسواری",
      camping: "کەمپینگ",
      "outdoor-clothing": "جلی دەرەوە",
      equipment: "کەلوپەلی وەرزشی",
    },
    baby: {
      "baby-clothing": "جلی کۆرپە",
      "kids-clothing": "جلی منداڵ",
      strollers: "عەرەبانەی منداڵ",
      essentials: "پێداویستی چاودێریی کۆرپە",
      accessories: "پاشکۆکانی چاودێریی منداڵ",
    },
    home: {
      furniture: "مۆبیلیات",
      kitchen: "چێشتخانە",
      appliances: "ئامێرەکانی ماڵ",
      decor: "ڕازاندنەوەی ماڵ",
      garden: "پێداویستی باخچە",
    },
    food: {
      pantry: "خۆراکی ڕۆژانە",
      snacks: "سووکەخواردن",
      "coffee-tea": "قاوە و چا",
      drinks: "ئاو، شەربەت و خواردنەوەی سووک",
      cooking: "کەرەستەی چێشتلێنان",
    },
    gaming: {
      consoles: "کۆنسۆڵی یاری",
      "video-games": "یاریی ڤیدیۆیی",
      accessories: "پاشکۆکانی گەیمینگ",
      educational: "یاریی فێرکاری",
      "board-games": "یاریی سەر مێز",
    },
    beauty: {
      skincare: "چاودێریی پێست",
      haircare: "چاودێریی قژ",
      cosmetics: "مکیاج",
      hygiene: "پاکوخاوێنیی کەسی",
      health: "چاودێریی تەندروستی (بێ ڕەچەتە)",
    },
    auto: {
      accessories: "پاشکۆکانی ئۆتۆمبێل",
      "car-care": "پاککردنەوەی ئۆتۆمبێل",
      motorcycle: "پاشکۆکانی ماتۆڕ",
      tools: "ئامێری چاککردنەوە",
      parts: "پارچەی یەدەگ",
    },
    fashion: {
      men: "جلی پیاوان",
      women: "جلی ئافرەتان",
      shoes: "پێڵاو",
      bags: "جانتا",
      accessories: "ئێکسسواری مۆدە",
    },
    pets: {
      food: "خۆراکی ئاژەڵ",
      accessories: "پاشکۆکانی ئاژەڵ",
      grooming: "پاکوخاوێنیی ئاژەڵ",
      beds: "جێگەی ئاژەڵ",
      toys: "یاریی ئاژەڵ",
    },
  },
};

// TODO(translate-review): new Arabic catalogue copy, needs native review.
const ar: CatalogueCopy = {
  title: "جميع الفئات",
  lede: "عشر مجموعات تسوق. اختر واحدة لرؤية المتاجر التي تبيعها.",
  subTitle: "حدّد أكثر",
  all: "الكل",
  searchIdealo: "قارن الأسعار على idealo",
  requestOnly: "تُطلب الأغذية وطعام الحيوانات والمنتجات الصحية عبر R&L لنتحقق منها أولاً.",
  note: "تعرض الفئات المتاجر، لا المخزون المتوفر.",
  emptyCategory: "لا يغطي أي متجر مدرج هذه الفئة بعد. يمكنك مع ذلك إرسال طلب شراء.",
  comingSoon: "قريباً",
  pendingBody: "تُفتح هذه الفئة بعد مراجعة المنتجات. لا شيء مدرج بعد.",
  subs: {
    electronics: {
      smartphones: "هواتف ذكية",
      computers: "حواسيب ولابتوبات",
      tablets: "أجهزة لوحية",
      audio: "صوتيات وسماعات",
      cameras: "كاميرات",
      accessories: "ملحقات",
    },
    sports: {
      fitness: "لياقة بدنية",
      cycling: "دراجات",
      camping: "تخييم",
      "outdoor-clothing": "ملابس خارجية",
      equipment: "معدات رياضية",
    },
    baby: {
      "baby-clothing": "ملابس الرضع",
      "kids-clothing": "ملابس الأطفال",
      strollers: "عربات الأطفال",
      essentials: "مستلزمات العناية بالرضع",
      accessories: "إكسسوارات رعاية الأطفال",
    },
    home: {
      furniture: "أثاث",
      kitchen: "مطبخ",
      appliances: "أجهزة منزلية",
      decor: "ديكور المنزل",
      garden: "مستلزمات الحديقة",
    },
    food: {
      pantry: "مواد غذائية أساسية",
      snacks: "وجبات خفيفة",
      "coffee-tea": "قهوة وشاي",
      drinks: "مياه وعصائر ومشروبات غازية",
      cooking: "مكونات الطبخ",
    },
    gaming: {
      consoles: "أجهزة ألعاب",
      "video-games": "ألعاب فيديو",
      accessories: "ملحقات الألعاب",
      educational: "ألعاب تعليمية",
      "board-games": "ألعاب لوحية",
    },
    beauty: {
      skincare: "العناية بالبشرة",
      haircare: "العناية بالشعر",
      cosmetics: "مستحضرات تجميل",
      hygiene: "النظافة الشخصية",
      health: "رعاية صحية (بدون وصفة)",
    },
    auto: {
      accessories: "إكسسوارات السيارات",
      "car-care": "العناية بالسيارة",
      motorcycle: "إكسسوارات الدراجات النارية",
      tools: "معدات الصيانة",
      parts: "قطع غيار",
    },
    fashion: {
      men: "ملابس رجالية",
      women: "ملابس نسائية",
      shoes: "أحذية",
      bags: "حقائب",
      accessories: "إكسسوارات أزياء",
    },
    pets: {
      food: "طعام الحيوانات",
      accessories: "مستلزمات الحيوانات",
      grooming: "أدوات العناية",
      beds: "أسرّة الحيوانات",
      toys: "ألعاب الحيوانات",
    },
  },
};

// TODO(translate-review): new Persian catalogue copy, needs native review.
const fa: CatalogueCopy = {
  title: "همه دسته‌ها",
  lede: "ده گروه خرید. یکی را انتخاب کنید تا فروشگاه‌هایی که آن را می‌فروشند ببینید.",
  subTitle: "دقیق‌تر انتخاب کنید",
  all: "همه",
  searchIdealo: "مقایسه قیمت در idealo",
  requestOnly:
    "مواد غذایی، غذای حیوانات و محصولات سلامت از طریق R&L درخواست می‌شوند تا ابتدا بررسی شوند.",
  note: "دسته‌ها فروشگاه‌ها را نشان می‌دهند، نه موجودی واقعی.",
  emptyCategory:
    "هنوز هیچ فروشگاه فهرست‌شده‌ای این دسته را پوشش نمی‌دهد. همچنان می‌توانید درخواست خرید بفرستید.",
  comingSoon: "به‌زودی",
  pendingBody: "این دسته پس از بررسی محصولات باز می‌شود. هنوز چیزی فهرست نشده است.",
  subs: {
    electronics: {
      smartphones: "گوشی هوشمند",
      computers: "کامپیوتر و لپ‌تاپ",
      tablets: "تبلت",
      audio: "صوتی و هدفون",
      cameras: "دوربین",
      accessories: "لوازم جانبی",
    },
    sports: {
      fitness: "تناسب اندام",
      cycling: "دوچرخه‌سواری",
      camping: "کمپینگ",
      "outdoor-clothing": "لباس فضای باز",
      equipment: "تجهیزات ورزشی",
    },
    baby: {
      "baby-clothing": "لباس نوزاد",
      "kids-clothing": "لباس کودک",
      strollers: "کالسکه",
      essentials: "لوازم مراقبت نوزاد",
      accessories: "لوازم جانبی کودک",
    },
    home: {
      furniture: "مبلمان",
      kitchen: "آشپزخانه",
      appliances: "لوازم خانگی",
      decor: "دکوراسیون",
      garden: "لوازم باغ",
    },
    food: {
      pantry: "مواد غذایی پایه",
      snacks: "تنقلات",
      "coffee-tea": "قهوه و چای",
      drinks: "آب، آبمیوه و نوشابه",
      cooking: "مواد پخت‌وپز",
    },
    gaming: {
      consoles: "کنسول بازی",
      "video-games": "بازی ویدیویی",
      accessories: "لوازم گیمینگ",
      educational: "اسباب‌بازی آموزشی",
      "board-games": "بازی رومیزی",
    },
    beauty: {
      skincare: "مراقبت پوست",
      haircare: "مراقبت مو",
      cosmetics: "لوازم آرایش",
      hygiene: "بهداشت شخصی",
      health: "مراقبت سلامت (بدون نسخه)",
    },
    auto: {
      accessories: "لوازم جانبی خودرو",
      "car-care": "مراقبت خودرو",
      motorcycle: "لوازم موتورسیکلت",
      tools: "تجهیزات تعمیر",
      parts: "قطعات یدکی",
    },
    fashion: {
      men: "لباس مردانه",
      women: "لباس زنانه",
      shoes: "کفش",
      bags: "کیف",
      accessories: "اکسسوری مد",
    },
    pets: {
      food: "غذای حیوانات",
      accessories: "لوازم حیوانات",
      grooming: "لوازم نظافت",
      beds: "تخت حیوانات",
      toys: "اسباب‌بازی حیوانات",
    },
  },
};

const tr: CatalogueCopy = {
  title: "Tüm kategoriler",
  lede: "On alışveriş grubu. Satan mağazaları görmek için birini seç.",
  subTitle: "Daralt",
  all: "Tümü",
  searchIdealo: "idealo'da fiyatları karşılaştır",
  requestOnly:
    "Gıda, evcil hayvan maması ve sağlık ürünleri, önce kontrol edebilmemiz için R&L üzerinden talep edilir.",
  note: "Kategoriler canlı stok değil, mağazaları gösterir.",
  emptyCategory:
    "Listelenen hiçbir mağaza henüz bu kategoriyi kapsamıyor. Yine de satın alma talebi gönderebilirsin.",
  comingSoon: "Yakında",
  pendingBody: "Bu kategori ürün incelememizden sonra açılır. Henüz listelenen bir şey yok.",
  subs: {
    electronics: {
      smartphones: "Akıllı telefonlar",
      computers: "Bilgisayar ve dizüstü",
      tablets: "Tabletler",
      audio: "Ses ve kulaklık",
      cameras: "Kameralar",
      accessories: "Aksesuarlar",
    },
    sports: {
      fitness: "Fitness",
      cycling: "Bisiklet",
      camping: "Kamp",
      "outdoor-clothing": "Outdoor giyim",
      equipment: "Spor ekipmanı",
    },
    baby: {
      "baby-clothing": "Bebek giyim",
      "kids-clothing": "Çocuk giyim",
      strollers: "Bebek arabaları",
      essentials: "Bebek bakım ürünleri",
      accessories: "Çocuk bakım aksesuarları",
    },
    home: {
      furniture: "Mobilya",
      kitchen: "Mutfak",
      appliances: "Ev aletleri",
      decor: "Ev dekorasyonu",
      garden: "Bahçe malzemeleri",
    },
    food: {
      pantry: "Temel gıda",
      snacks: "Atıştırmalıklar",
      "coffee-tea": "Kahve ve çay",
      drinks: "Su, meyve suyu ve gazlı içecekler",
      cooking: "Yemek malzemeleri",
    },
    gaming: {
      consoles: "Oyun konsolları",
      "video-games": "Video oyunları",
      accessories: "Oyun aksesuarları",
      educational: "Eğitici oyuncaklar",
      "board-games": "Kutu oyunları",
    },
    beauty: {
      skincare: "Cilt bakımı",
      haircare: "Saç bakımı",
      cosmetics: "Kozmetik",
      hygiene: "Kişisel hijyen",
      health: "Sağlık bakımı (reçetesiz)",
    },
    auto: {
      accessories: "Araç aksesuarları",
      "car-care": "Araç bakımı",
      motorcycle: "Motosiklet aksesuarları",
      tools: "Bakım ekipmanı",
      parts: "Yedek parçalar",
    },
    fashion: {
      men: "Erkek giyim",
      women: "Kadın giyim",
      shoes: "Ayakkabı",
      bags: "Çanta",
      accessories: "Moda aksesuarları",
    },
    pets: {
      food: "Evcil hayvan maması",
      accessories: "Evcil hayvan aksesuarları",
      grooming: "Bakım ürünleri",
      beds: "Evcil hayvan yatakları",
      toys: "Evcil hayvan oyuncakları",
    },
  },
};

// Kurmanji (ku) uses English catalogue copy, as its store category labels already do.
const ALL: Record<Lang, CatalogueCopy> = { en, de, ckb, ar, fa, tr, ku: en };

export function catalogueCopy(lang: Lang): CatalogueCopy {
  return ALL[lang];
}
