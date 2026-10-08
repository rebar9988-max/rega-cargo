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
  cart: string;
  account: string;
  accountHint: string;
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
    cart: "داواکاری کڕین",
    account: "هەژمار",
    accountHint: "بە ژمارەی تەلەفۆن بچۆ ژوورەوە",
  },
  en: {
    search: "What are you looking for?",
    audience: { women: "Women", men: "Men", kids: "Kids" },
    tagline: "Move smart. Deliver fast.",
    route: "Europe ↔ Kurdistan ↔ Iraq",
    newCollection: "New collection",
    seeAll: "See all",
    wishlist: "Favourites",
    cart: "Purchase request",
    account: "Account",
    accountHint: "Sign in with your phone number",
  },
  ku: {
    search: "Tu li çi digerî?",
    audience: { women: "Jin", men: "Mêr", kids: "Zarok" },
    tagline: "Bi aqilmendî bimeşe. Bi lez bigihîne.",
    route: "Ewropa ↔ Kurdistan ↔ Iraq",
    newCollection: "Koleksiyona nû",
    seeAll: "Hemûyan bibîne",
    wishlist: "Bijare",
    cart: "Daxwaza kirînê",
    account: "Hesab",
    accountHint: "Bi hejmara telefonê têkeve",
  },
  ar: {
    search: "عمّ تبحث؟",
    audience: { women: "نساء", men: "رجال", kids: "أطفال" },
    tagline: "تحرّك بذكاء. وصّل بسرعة.",
    route: "أوروبا ↔ كردستان ↔ العراق",
    newCollection: "تشكيلة جديدة",
    seeAll: "عرض الكل",
    wishlist: "المفضلة",
    cart: "طلب شراء",
    account: "الحساب",
    accountHint: "سجّل الدخول برقم الهاتف",
  },
  fa: {
    search: "دنبال چه می‌گردید؟",
    audience: { women: "زنان", men: "مردان", kids: "کودکان" },
    tagline: "هوشمند حرکت کن. سریع برسان.",
    route: "اروپا ↔ کردستان ↔ عراق",
    newCollection: "کالکشن جدید",
    seeAll: "مشاهده همه",
    wishlist: "علاقه‌مندی‌ها",
    cart: "درخواست خرید",
    account: "حساب",
    accountHint: "با شماره تلفن وارد شوید",
  },
  tr: {
    search: "Ne arıyorsunuz?",
    audience: { women: "Kadın", men: "Erkek", kids: "Çocuk" },
    tagline: "Akıllı hareket et. Hızlı teslim et.",
    route: "Avrupa ↔ Kürdistan ↔ Irak",
    newCollection: "Yeni koleksiyon",
    seeAll: "Tümünü gör",
    wishlist: "Favoriler",
    cart: "Satın alma talebi",
    account: "Hesap",
    accountHint: "Telefon numaranızla giriş yapın",
  },
  de: {
    search: "Wonach suchen Sie?",
    audience: { women: "Damen", men: "Herren", kids: "Kinder" },
    tagline: "Clever bewegen. Schnell liefern.",
    route: "Europa ↔ Kurdistan ↔ Irak",
    newCollection: "Neue Kollektion",
    seeAll: "Alle ansehen",
    wishlist: "Favoriten",
    cart: "Kaufanfrage",
    account: "Konto",
    accountHint: "Mit Telefonnummer anmelden",
  },
};
