import type { Lang } from "./langs.ts";
import type { EuropeanCountry } from "./stores.ts";

/**
 * European stores directory: country chips, retailer rail, active filters and the official-site
 * handoff. TODO(translate-review): new non-English copy needs native review.
 */
const en = {
  countries: "Country",
  allCountries: "All",
  country: {
    DE: "Germany",
    CH: "Switzerland",
    IT: "Italy",
    FR: "France",
    GB: "United Kingdom",
  } satisfies Record<EuropeanCountry, string>,
  retailers: "Retailers",
  allRetailers: "All retailers",
  handoff: "Official sites open in a new tab. Your filters stay here.",
  active: "Active filters",
  remove: "Remove",
  reset: "Reset",
  official: "Official site",
  bringPending: "Bring For Me is not available for this storefront yet.",
  backTitle: "Back from {store}?",
  backBody: "Found a product? Copy its link from the store and send it with Bring For Me.",
  dismiss: "Close",
};
export type DirectoryCopy = typeof en;

const ckb: DirectoryCopy = {
  countries: "وڵات",
  allCountries: "هەموو",
  country: {
    DE: "ئەڵمانیا",
    CH: "سویسرا",
    IT: "ئیتاڵیا",
    FR: "فەڕەنسا",
    GB: "بەریتانیا",
  },
  retailers: "فرۆشگاکان",
  allRetailers: "هەموو فرۆشگاکان",
  handoff: "ماڵپەڕە فەرمییەکان لە تابێکی نوێدا دەکرێنەوە. فلتەرەکانت لێرە دەمێننەوە.",
  active: "فلتەرە چالاکەکان",
  remove: "لابردن",
  reset: "ڕێکخستنەوە",
  official: "ماڵپەڕی فەرمی",
  bringPending: "کاڵام بۆ بهێنەوە هێشتا بۆ ئەم فرۆشگایە بەردەست نییە.",
  backTitle: "لە {store} گەڕایتەوە؟",
  backBody: "کاڵایەکت دۆزییەوە؟ بەستەرەکەی لە فرۆشگاکە کۆپی بکە و بە «کاڵام بۆ بهێنەوە» بینێرە.",
  dismiss: "داخستن",
};

const ku: DirectoryCopy = {
  countries: "Welat",
  allCountries: "Hemû",
  country: {
    DE: "Almanya",
    CH: "Swîsre",
    IT: "Îtalya",
    FR: "Fransa",
    GB: "Keyaniya Yekbûyî",
  },
  retailers: "Firotgeh",
  allRetailers: "Hemû firotgeh",
  handoff: "Malperên fermî di tabeke nû de vedibin. Fîlterên te li vir dimînin.",
  active: "Fîlterên çalak",
  remove: "Rake",
  reset: "Ji nû ve",
  official: "Malpera fermî",
  bringPending: "Ji min re bîne hêj ji bo vê firotgehê ne amade ye.",
  backTitle: "Tu ji {store} vegeriyayî?",
  backBody: "Te berhemek dît? Lînka wê ji firotgehê kopî bike û bi «Ji min re bîne» bişîne.",
  dismiss: "Bigire",
};

const de: DirectoryCopy = {
  countries: "Land",
  allCountries: "Alle",
  country: {
    DE: "Deutschland",
    CH: "Schweiz",
    IT: "Italien",
    FR: "Frankreich",
    GB: "Vereinigtes Königreich",
  },
  retailers: "Händler",
  allRetailers: "Alle Händler",
  handoff: "Offizielle Seiten öffnen in einem neuen Tab. Ihre Filter bleiben hier erhalten.",
  active: "Aktive Filter",
  remove: "Entfernen",
  reset: "Zurücksetzen",
  official: "Offizielle Seite",
  bringPending: "„Für mich besorgen“ ist für diesen Shop noch nicht verfügbar.",
  backTitle: "Zurück von {store}?",
  backBody:
    "Etwas gefunden? Kopieren Sie den Produktlink im Shop und senden Sie ihn mit „Für mich besorgen“.",
  dismiss: "Schließen",
};

const ar: DirectoryCopy = {
  countries: "البلد",
  allCountries: "الكل",
  country: {
    DE: "ألمانيا",
    CH: "سويسرا",
    IT: "إيطاليا",
    FR: "فرنسا",
    GB: "المملكة المتحدة",
  },
  retailers: "المتاجر",
  allRetailers: "كل المتاجر",
  handoff: "تُفتح المواقع الرسمية في علامة تبويب جديدة. تبقى عوامل التصفية هنا.",
  active: "عوامل التصفية النشطة",
  remove: "إزالة",
  reset: "إعادة الضبط",
  official: "الموقع الرسمي",
  bringPending: "خدمة «أحضر لي» غير متاحة لهذا المتجر بعد.",
  backTitle: "هل عدت من {store}؟",
  backBody: "وجدت منتجًا؟ انسخ رابطه من المتجر وأرسله عبر «أحضر لي».",
  dismiss: "إغلاق",
};

const fa: DirectoryCopy = {
  countries: "کشور",
  allCountries: "همه",
  country: {
    DE: "آلمان",
    CH: "سوئیس",
    IT: "ایتالیا",
    FR: "فرانسه",
    GB: "بریتانیا",
  },
  retailers: "فروشگاه‌ها",
  allRetailers: "همهٔ فروشگاه‌ها",
  handoff: "سایت‌های رسمی در برگهٔ تازه باز می‌شوند. فیلترهای شما همین‌جا می‌مانند.",
  active: "فیلترهای فعال",
  remove: "حذف",
  reset: "بازنشانی",
  official: "سایت رسمی",
  bringPending: "«برای من بیاور» هنوز برای این فروشگاه در دسترس نیست.",
  backTitle: "از {store} برگشتید؟",
  backBody: "کالایی پیدا کردید؟ پیوندش را از فروشگاه کپی کنید و با «برای من بیاور» بفرستید.",
  dismiss: "بستن",
};

const tr: DirectoryCopy = {
  countries: "Ülke",
  allCountries: "Tümü",
  country: {
    DE: "Almanya",
    CH: "İsviçre",
    IT: "İtalya",
    FR: "Fransa",
    GB: "Birleşik Krallık",
  },
  retailers: "Mağazalar",
  allRetailers: "Tüm mağazalar",
  handoff: "Resmî siteler yeni sekmede açılır. Filtreleriniz burada kalır.",
  active: "Etkin filtreler",
  remove: "Kaldır",
  reset: "Sıfırla",
  official: "Resmî site",
  bringPending: "“Benim için getir” bu mağaza için henüz kullanılamıyor.",
  backTitle: "{store} sitesinden mi döndünüz?",
  backBody:
    "Bir ürün mü buldunuz? Bağlantısını mağazadan kopyalayıp “Benim için getir” ile gönderin.",
  dismiss: "Kapat",
};

export const DIRECTORY_COPY: Record<Lang, DirectoryCopy> = { en, ckb, ku, de, ar, fa, tr };
