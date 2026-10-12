import type { Lang } from "./langs";

const en = {
  route: "Shipping route",
  parcel: "Package details",
  contents: "Package contents",
  options: "Shipping options",
  routeStep: "Route",
  parcelStep: "Package",
  optionsStep: "Options",
};

// TODO(translate-review): native review of the new shipping section labels.
const copy: Record<Lang, typeof en> = {
  en,
  ckb: {
    route: "ڕێڕەوی ناردن",
    parcel: "زانیارییەکانی پاکەت",
    contents: "ناوەڕۆکی پاکەت",
    options: "هەڵبژاردەکانی ناردن",
    routeStep: "ڕێڕەو",
    parcelStep: "پاکەت",
    optionsStep: "هەڵبژاردەکان",
  },
  ar: {
    route: "مسار الشحن",
    parcel: "تفاصيل الطرد",
    contents: "محتويات الطرد",
    options: "خيارات الشحن",
    routeStep: "المسار",
    parcelStep: "الطرد",
    optionsStep: "الخيارات",
  },
  ku: {
    route: "Rêya şandinê",
    parcel: "Agahiyên pakêtê",
    contents: "Naveroka pakêtê",
    options: "Vebijarkên şandinê",
    routeStep: "Rê",
    parcelStep: "Pakêt",
    optionsStep: "Vebijark",
  },
  de: {
    route: "Versandroute",
    parcel: "Paketdetails",
    contents: "Paketinhalt",
    options: "Versandoptionen",
    routeStep: "Route",
    parcelStep: "Paket",
    optionsStep: "Optionen",
  },
  fa: {
    route: "مسیر ارسال",
    parcel: "مشخصات بسته",
    contents: "محتویات بسته",
    options: "گزینه‌های ارسال",
    routeStep: "مسیر",
    parcelStep: "بسته",
    optionsStep: "گزینه‌ها",
  },
  tr: {
    route: "Gönderim rotası",
    parcel: "Paket bilgileri",
    contents: "Paket içeriği",
    options: "Gönderim seçenekleri",
    routeStep: "Rota",
    parcelStep: "Paket",
    optionsStep: "Seçenekler",
  },
};

export const shippingCopy = (lang: Lang) => copy[lang];
