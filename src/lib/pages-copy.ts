import { LANGS, type Lang } from "@/lib/langs";

/** Copy for 404 / error pages and generic load states (7 languages). */
export type PagesCopy = {
  notFoundTitle: string;
  notFoundBody: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  home: string;
  loading: string;
  unavailable: string;
  prev: string;
  next: string;
};

export const PAGES_COPY: Record<Lang, PagesCopy> = {
  ckb: {
    notFoundTitle: "ئەم پەڕەیە نەدۆزرایەوە",
    notFoundBody: "لینکەکە هەڵەیە یان پەڕەکە لابراوە.",
    errorTitle: "هەڵەیەک ڕوویدا",
    errorBody: "تکایە دووبارە هەوڵ بدەوە. ئەگەر بەردەوام بوو، بۆمان بنووسە.",
    retry: "دووبارە هەوڵ بدەوە",
    home: "گەڕانەوە بۆ سەرەتا",
    loading: "بارکردن…",
    unavailable: "ئەم بەشە هێشتا بەردەست نییە.",
    prev: "پەڕەی پێشوو",
    next: "پەڕەی دواتر",
  },
  en: {
    notFoundTitle: "Page not found",
    notFoundBody: "The link is wrong or the page has been removed.",
    errorTitle: "Something went wrong",
    errorBody: "Please try again. If it keeps happening, write to us.",
    retry: "Try again",
    home: "Back to home",
    loading: "Loading…",
    unavailable: "This section is not available yet.",
    prev: "Previous page",
    next: "Next page",
  },
  ku: {
    notFoundTitle: "Rûpel nehat dîtin",
    notFoundBody: "Girêdan çewt e an rûpel hatiye rakirin.",
    errorTitle: "Tiştek çewt çû",
    errorBody: "Ji kerema xwe dîsa biceribîne. Heke berdewam bike, ji me re binivîse.",
    retry: "Dîsa biceribîne",
    home: "Vegere destpêkê",
    loading: "Tê barkirin…",
    unavailable: "Ev beş hêj ne berdest e.",
    prev: "Rûpela berê",
    next: "Rûpela din",
  },
  ar: {
    notFoundTitle: "الصفحة غير موجودة",
    notFoundBody: "الرابط غير صحيح أو أن الصفحة أُزيلت.",
    errorTitle: "حدث خطأ",
    errorBody: "يرجى المحاولة مرة أخرى. إذا استمر ذلك، راسلنا.",
    retry: "حاول مرة أخرى",
    home: "العودة إلى الرئيسية",
    loading: "جارٍ التحميل…",
    unavailable: "هذا القسم غير متاح بعد.",
    prev: "الصفحة السابقة",
    next: "الصفحة التالية",
  },
  fa: {
    notFoundTitle: "صفحه پیدا نشد",
    notFoundBody: "پیوند اشتباه است یا صفحه حذف شده است.",
    errorTitle: "خطایی رخ داد",
    errorBody: "لطفاً دوباره تلاش کنید. اگر ادامه داشت، به ما بنویسید.",
    retry: "تلاش دوباره",
    home: "بازگشت به خانه",
    loading: "در حال بارگذاری…",
    unavailable: "این بخش هنوز در دسترس نیست.",
    prev: "صفحهٔ قبل",
    next: "صفحهٔ بعد",
  },
  tr: {
    notFoundTitle: "Sayfa bulunamadı",
    notFoundBody: "Bağlantı hatalı veya sayfa kaldırılmış.",
    errorTitle: "Bir sorun oluştu",
    errorBody: "Lütfen tekrar deneyin. Devam ederse bize yazın.",
    retry: "Tekrar dene",
    home: "Ana sayfaya dön",
    loading: "Yükleniyor…",
    unavailable: "Bu bölüm henüz kullanılamıyor.",
    prev: "Önceki sayfa",
    next: "Sonraki sayfa",
  },
  de: {
    notFoundTitle: "Seite nicht gefunden",
    notFoundBody: "Der Link ist falsch oder die Seite wurde entfernt.",
    errorTitle: "Etwas ist schiefgelaufen",
    errorBody: "Bitte versuchen Sie es erneut. Wenn es weiter passiert, schreiben Sie uns.",
    retry: "Erneut versuchen",
    home: "Zur Startseite",
    loading: "Wird geladen…",
    unavailable: "Dieser Bereich ist noch nicht verfügbar.",
    prev: "Vorherige Seite",
    next: "Nächste Seite",
  },
};

/** For components that may render outside the i18n provider (root error/404). */
export function pagesCopyFromDocument(): PagesCopy {
  if (typeof document === "undefined") return PAGES_COPY.ckb;
  const html = document.documentElement.lang;
  const match = LANGS.find((item) => item.html === html);
  return PAGES_COPY[match?.id ?? "ckb"];
}
