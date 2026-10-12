import type { Lang } from "@/lib/langs";

/** Strings added with the prototype restyle (header icons, search strip, home hero). */
export type DesignCopy = {
  search: string;
  audience: { women: string; men: string; kids: string };
  tagline: string;
  route: string;
  newCollection: string;
  seeAll: string;
  wishlist: string;
  /** Last item of the header category strip; opens the full menu. */
  more: string;
  /** Accessible name / sheet title of the header language picker. */
  language: string;
  cart: string;
  account: string;
  accountHint: string;
  services: string;
  bazaar: string;
  bazaarSub: string;
  delivery: string;
  deliverySub: string;
  deliveryTitle: string;
  trustLabel: string;
  trust: { fast: string; safe: string; reach: string; onTime: string };
  quoteCard: string;
  quoteGo: string;
  trackCard: string;
  moveSend: string;
  moveSub: string;
};

export const DESIGN_COPY: Record<Lang, DesignCopy> = {
  ckb: {
    search: "بۆ چی دەگەڕێیت؟",
    audience: { women: "ئافرەتان", men: "پیاوان", kids: "منداڵان" },
    tagline: "بە زیرەکی بجوڵێ. بە خێرایی بگەیەنە.",
    route: "ئەوروپا ↔ کوردستان ↔ عێراق",
    newCollection: "کۆڵێکشنی نوێ",
    seeAll: "هەمووی ببینە",
    wishlist: "دڵخوازەکان",
    more: "زیاتر",
    language: "زمان",
    cart: "داواکاری کڕین",
    account: "هەژمار",
    accountHint: "بە ژمارەی تەلەفۆن بچۆ ژوورەوە",
    services: "خزمەتگوزارییەکان",
    bazaar: "بازاڕ",
    bazaarSub: "لە ئەوروپاوە بکڕە",
    delivery: "گەیاندن",
    deliverySub: "ناردن و شوێنپێکردنی بار",
    deliveryTitle: "بنێرە. شوێنی بکەوە.",
    trustLabel: "بۆچی R&L",
    trust: { fast: "خێرا و متمانەپێکراو", safe: "سەلامەت و پارێزراو", reach: "گەیشتنی فراوان", onTime: "لە کاتی خۆیدا" },
    quoteCard: "نرخی ناردن",
    quoteGo: "نرخ ببینە",
    trackCard: "شوێنپێکردن بە کۆد",
    moveSend: "گواستنەوە و ناردن",
    moveSub: "شۆفێر پێشنیار دەکات، تۆ هەڵدەبژێریت",
  },
  en: {
    search: "What are you looking for?",
    audience: { women: "Women", men: "Men", kids: "Kids" },
    tagline: "Move smart. Deliver fast.",
    route: "Europe ↔ Kurdistan ↔ Iraq",
    newCollection: "New collection",
    seeAll: "See all",
    wishlist: "Favourites",
    more: "More",
    language: "Language",
    cart: "Purchase request",
    account: "Account",
    accountHint: "Sign in with your phone number",
    services: "Services",
    bazaar: "Bazaar",
    bazaarSub: "Shop from Europe",
    delivery: "Delivery",
    deliverySub: "Send & track parcels",
    deliveryTitle: "Send it. Track it.",
    trustLabel: "Why R&L",
    trust: { fast: "Fast & reliable", safe: "Safe & secure", reach: "Wide reach", onTime: "On time" },
    quoteCard: "Shipping price",
    quoteGo: "See price",
    trackCard: "Track by code",
    moveSend: "Move & send",
    moveSub: "Drivers offer, you choose",
  },
  ku: {
    search: "Tu li çi digerî?",
    audience: { women: "Jin", men: "Mêr", kids: "Zarok" },
    tagline: "Bi aqilmendî bimeşe. Bi lez bigihîne.",
    route: "Ewropa ↔ Kurdistan ↔ Iraq",
    newCollection: "Koleksiyona nû",
    seeAll: "Hemûyan bibîne",
    wishlist: "Bijare",
    more: "Zêdetir", // TODO(translate-review)
    language: "Ziman",
    cart: "Daxwaza kirînê",
    account: "Hesab",
    accountHint: "Bi hejmara telefonê têkeve",
    services: "Xizmet",
    bazaar: "Bazar",
    bazaarSub: "Ji Ewropayê bikire",
    delivery: "Gihandin",
    deliverySub: "Pakêtan bişîne û bişopîne",
    deliveryTitle: "Bişîne. Bişopîne.",
    trustLabel: "Çima R&L",
    trust: { fast: "Bilez û pêbawer", safe: "Ewle û parastî", reach: "Gihîştina fireh", onTime: "Di wextê xwe de" },
    quoteCard: "Bihayê şandinê",
    quoteGo: "Bihayê bibîne",
    trackCard: "Bi kodê bişopîne",
    moveSend: "Barkirin û şandin",
    moveSub: "Ajokar pêşniyar dikin, tu hildibijêrî",
  },
  ar: {
    search: "عمّ تبحث؟",
    audience: { women: "نساء", men: "رجال", kids: "أطفال" },
    tagline: "تحرّك بذكاء. وصّل بسرعة.",
    route: "أوروبا ↔ كردستان ↔ العراق",
    newCollection: "تشكيلة جديدة",
    seeAll: "عرض الكل",
    wishlist: "المفضلة",
    more: "المزيد",
    language: "اللغة",
    cart: "طلب شراء",
    account: "الحساب",
    accountHint: "سجّل الدخول برقم الهاتف",
    services: "الخدمات",
    bazaar: "البازار",
    bazaarSub: "تسوّق من أوروبا",
    delivery: "التوصيل",
    deliverySub: "أرسل الطرود وتتبّعها",
    deliveryTitle: "أرسل. وتتبّع.",
    trustLabel: "لماذا R&L",
    trust: { fast: "سريع وموثوق", safe: "آمن ومحمي", reach: "وصول واسع", onTime: "في الوقت المحدد" },
    quoteCard: "سعر الشحن",
    quoteGo: "اعرض السعر",
    trackCard: "التتبّع بالرمز",
    moveSend: "النقل والإرسال",
    moveSub: "السائقون يعرضون وأنت تختار",
  },
  fa: {
    search: "دنبال چه می‌گردید؟",
    audience: { women: "زنان", men: "مردان", kids: "کودکان" },
    tagline: "هوشمند حرکت کن. سریع برسان.",
    route: "اروپا ↔ کردستان ↔ عراق",
    newCollection: "کالکشن جدید",
    seeAll: "مشاهده همه",
    wishlist: "علاقه‌مندی‌ها",
    more: "بیشتر", // TODO(translate-review)
    language: "زبان",
    cart: "درخواست خرید",
    account: "حساب",
    accountHint: "با شماره تلفن وارد شوید",
    services: "خدمات",
    bazaar: "بازار",
    bazaarSub: "از اروپا خرید کنید",
    delivery: "ارسال",
    deliverySub: "ارسال و پیگیری بسته",
    deliveryTitle: "بفرست. پیگیری کن.",
    trustLabel: "چرا R&L",
    trust: { fast: "سریع و مطمئن", safe: "امن و محافظت‌شده", reach: "پوشش گسترده", onTime: "به‌موقع" },
    quoteCard: "هزینهٔ ارسال",
    quoteGo: "دیدن قیمت",
    trackCard: "پیگیری با کد",
    moveSend: "جابه‌جایی و ارسال",
    moveSub: "رانندگان پیشنهاد می‌دهند، شما انتخاب می‌کنید",
  },
  tr: {
    search: "Ne arıyorsunuz?",
    audience: { women: "Kadın", men: "Erkek", kids: "Çocuk" },
    tagline: "Akıllı hareket et. Hızlı teslim et.",
    route: "Avrupa ↔ Kürdistan ↔ Irak",
    newCollection: "Yeni koleksiyon",
    seeAll: "Tümünü gör",
    wishlist: "Favoriler",
    more: "Daha fazla", // TODO(translate-review)
    language: "Dil",
    cart: "Satın alma talebi",
    account: "Hesap",
    accountHint: "Telefon numaranızla giriş yapın",
    services: "Hizmetler",
    bazaar: "Pazar",
    bazaarSub: "Avrupa'dan alışveriş",
    delivery: "Teslimat",
    deliverySub: "Paket gönder ve takip et",
    deliveryTitle: "Gönder. Takip et.",
    trustLabel: "Neden R&L",
    trust: { fast: "Hızlı ve güvenilir", safe: "Güvenli ve korumalı", reach: "Geniş erişim", onTime: "Zamanında" },
    quoteCard: "Gönderim fiyatı",
    quoteGo: "Fiyatı gör",
    trackCard: "Kodla takip",
    moveSend: "Taşıma ve gönderim",
    moveSub: "Sürücüler teklif verir, sen seçersin",
  },
  de: {
    search: "Wonach suchen Sie?",
    audience: { women: "Damen", men: "Herren", kids: "Kinder" },
    tagline: "Clever bewegen. Schnell liefern.",
    route: "Europa ↔ Kurdistan ↔ Irak",
    newCollection: "Neue Kollektion",
    seeAll: "Alle ansehen",
    wishlist: "Favoriten",
    more: "Mehr",
    language: "Sprache",
    cart: "Kaufanfrage",
    account: "Konto",
    accountHint: "Mit Telefonnummer anmelden",
    services: "Dienste",
    bazaar: "Basar",
    bazaarSub: "Aus Europa einkaufen",
    delivery: "Versand",
    deliverySub: "Pakete senden & verfolgen",
    deliveryTitle: "Senden. Verfolgen.",
    trustLabel: "Warum R&L",
    trust: { fast: "Schnell & zuverlässig", safe: "Sicher & geschützt", reach: "Große Reichweite", onTime: "Pünktlich" },
    quoteCard: "Versandpreis",
    quoteGo: "Preis ansehen",
    trackCard: "Mit Code verfolgen",
    moveSend: "Umzug & Versand",
    moveSub: "Fahrer bieten an, du wählst",
  },
};
