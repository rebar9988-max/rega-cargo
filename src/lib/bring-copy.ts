import type { Lang } from "./langs.ts";

/**
 * Bring For Me (/stores/request): three-step request flow and the account request dashboard.
 * Only labels and guidance live here; validation messages keep using the existing copy modules.
 * TODO(translate-review): native review for ku, de, ar, fa and tr.
 */
const en = {
  stepsLabel: "Request steps",
  steps: ["Product", "Delivery", "Review"],
  /** {n} = current step, {total} = number of steps, {name} = step name. */
  stepStatus: "Step {n} of {total}: {name}",
  productTitle: "Which product do you need?",
  deliveryTitle: "Where should it be delivered?",
  reviewHint: "Check the details. You can edit any step before sending.",
  next: "Continue",
  back: "Back",
  edit: "Edit",
  qtyLess: "Decrease quantity",
  qtyMore: "Increase quantity",
  country: "Country",
  countryValue: "Iraq (including the Kurdistan Region)",
  city: "City",
  notProvided: "Not provided",
  specsTitle: "Product details",
  contactTitle: "How can we reach you?",
  // Account dashboard.
  dash: {
    filtersLabel: "Filter requests",
    all: "All",
    action: "Needs you",
    progress: "In progress",
    done: "Finished",
    emptyTitle: "No requests yet",
    emptyBody:
      "Send a product link. R&L reviews it and replies with a quote before anything is bought or shipped.",
    emptyCta: "Start a Bring For Me request",
    filteredEmpty: "No requests in this group.",
    showAll: "Show all requests",
    nextQuoted: "A quote is waiting. Open it to accept or decline.",
    nextReview: "R&L is reviewing this request. Nothing is needed from you.",
    nextProgress: "Accepted. Follow the tracking updates recorded by R&L.",
    nextDelivered: "Delivered.",
    nextCancelled: "This request was cancelled.",
  },
};
export type BringCopy = typeof en;

export const BRING_COPY: Record<Lang, BringCopy> = {
  en,
  ckb: {
    stepsLabel: "هەنگاوەکانی داواکاری",
    steps: ["کاڵا", "گەیاندن", "پێداچوونەوە"],
    stepStatus: "هەنگاوی {n} لە {total}: {name}",
    productTitle: "کام کاڵات دەوێت؟",
    deliveryTitle: "بۆ کوێ بگەیەندرێت؟",
    reviewHint: "وردەکارییەکان بپشکنە. پێش ناردن دەتوانیت هەر هەنگاوێک دەستکاری بکەیت.",
    next: "بەردەوام بە",
    back: "گەڕانەوە",
    edit: "دەستکاری",
    qtyLess: "کەمکردنەوەی ژمارە",
    qtyMore: "زیادکردنی ژمارە",
    country: "وڵات",
    countryValue: "عێراق (لەگەڵ هەرێمی کوردستان)",
    city: "شار",
    notProvided: "نەنووسراوە",
    specsTitle: "وردەکاریی کاڵا",
    contactTitle: "چۆن پەیوەندیت پێوە بکەین؟",
    dash: {
      filtersLabel: "پاڵاوتنی داواکارییەکان",
      all: "هەمووی",
      action: "پێویستی بە تۆ هەیە",
      progress: "لە بەڕێوەچوون",
      done: "تەواوبوو",
      emptyTitle: "هێشتا هیچ داواکارییەک نییە",
      emptyBody:
        "لینکی کاڵایەک بنێرە. R&L دەیپشکنێت و پێش ئەوەی هیچ شتێک بکڕدرێت یان بنێردرێت بە نرخێک وەڵامت دەداتەوە.",
      emptyCta: "دەستپێکردنی داواکاریی «کاڵام بۆ بهێنەوە»",
      filteredEmpty: "هیچ داواکارییەک لەم گروپەدا نییە.",
      showAll: "پیشاندانی هەموو داواکارییەکان",
      nextQuoted: "نرخێک چاوەڕێتە. بیکەرەوە بۆ پەسەندکردن یان ڕەتکردنەوە.",
      nextReview: "R&L ئەم داواکارییە دەپشکنێت. هیچت لێ ناوێت.",
      nextProgress: "پەسەندکرا. نوێکارییەکانی بەدواداچوونی تۆمارکراوی R&L بەدوا بکەوە.",
      nextDelivered: "گەیەندرا.",
      nextCancelled: "ئەم داواکارییە هەڵوەشێنرایەوە.",
    },
  },
  ku: {
    stepsLabel: "Gavên daxwazê",
    steps: ["Berhem", "Gihandin", "Kontrol"],
    stepStatus: "Gava {n} ji {total}: {name}",
    productTitle: "Tu kîjan berhemê dixwazî?",
    deliveryTitle: "Divê li ku bê gihandin?",
    reviewHint: "Zanyariyan kontrol bike. Berî şandinê tu dikarî her gavekê biguherînî.",
    next: "Berdewam bike",
    back: "Vegere",
    edit: "Biguherîne",
    qtyLess: "Hejmarê kêm bike",
    qtyMore: "Hejmarê zêde bike",
    country: "Welat",
    countryValue: "Iraq (bi Herêma Kurdistanê re)",
    city: "Bajar",
    notProvided: "Nehatiye nivîsandin",
    specsTitle: "Hûrgiliyên berhemê",
    contactTitle: "Em çawa bigihîjin te?",
    dash: {
      filtersLabel: "Daxwazan fîltre bike",
      all: "Hemû",
      action: "Pêdivî bi te heye",
      progress: "Berdewam e",
      done: "Qediyayî",
      emptyTitle: "Hêj daxwaz tune ne",
      emptyBody:
        "Lînka berhemekê bişîne. R&L wê kontrol dike û berî ku tiştek were kirîn an şandin bi bihayekê bersiv dide.",
      emptyCta: "Daxwaza «Ji min re bîne» dest pê bike",
      filteredEmpty: "Di vê komê de daxwaz tune ne.",
      showAll: "Hemû daxwazan nîşan bide",
      nextQuoted: "Bihayek li benda te ye. Veke da ku qebûl bikî an red bikî.",
      nextReview: "R&L vê daxwazê kontrol dike. Tiştek ji te nayê xwestin.",
      nextProgress: "Hate qebûlkirin. Nûvekirinên şopandinê yên ku R&L tomar kirine bişopîne.",
      nextDelivered: "Hate gihandin.",
      nextCancelled: "Ev daxwaz hate betalkirin.",
    },
  },
  de: {
    stepsLabel: "Schritte der Anfrage",
    steps: ["Produkt", "Lieferung", "Prüfen"],
    stepStatus: "Schritt {n} von {total}: {name}",
    productTitle: "Welches Produkt brauchen Sie?",
    deliveryTitle: "Wohin soll geliefert werden?",
    reviewHint: "Prüfen Sie die Angaben. Vor dem Absenden können Sie jeden Schritt ändern.",
    next: "Weiter",
    back: "Zurück",
    edit: "Ändern",
    qtyLess: "Menge verringern",
    qtyMore: "Menge erhöhen",
    country: "Land",
    countryValue: "Irak (einschließlich der Autonomen Region Kurdistan)",
    city: "Stadt",
    notProvided: "Nicht angegeben",
    specsTitle: "Produktdetails",
    contactTitle: "Wie erreichen wir Sie?",
    dash: {
      filtersLabel: "Anfragen filtern",
      all: "Alle",
      action: "Ihre Aktion",
      progress: "In Bearbeitung",
      done: "Abgeschlossen",
      emptyTitle: "Noch keine Anfragen",
      emptyBody:
        "Senden Sie einen Produktlink. R&L prüft ihn und antwortet mit einem Angebot, bevor etwas gekauft oder versendet wird.",
      emptyCta: "Anfrage „Für mich besorgen“ starten",
      filteredEmpty: "Keine Anfragen in dieser Gruppe.",
      showAll: "Alle Anfragen anzeigen",
      nextQuoted: "Ein Angebot wartet. Öffnen Sie es, um es anzunehmen oder abzulehnen.",
      nextReview: "R&L prüft diese Anfrage. Von Ihnen ist nichts nötig.",
      nextProgress: "Angenommen. Verfolgen Sie die von R&L erfassten Sendungsstatus.",
      nextDelivered: "Geliefert.",
      nextCancelled: "Diese Anfrage wurde storniert.",
    },
  },
  ar: {
    stepsLabel: "خطوات الطلب",
    steps: ["المنتج", "التوصيل", "المراجعة"],
    stepStatus: "الخطوة {n} من {total}: {name}",
    productTitle: "ما المنتج الذي تحتاجه؟",
    deliveryTitle: "إلى أين يجب أن يُوصَّل؟",
    reviewHint: "راجع التفاصيل. يمكنك تعديل أي خطوة قبل الإرسال.",
    next: "متابعة",
    back: "رجوع",
    edit: "تعديل",
    qtyLess: "إنقاص الكمية",
    qtyMore: "زيادة الكمية",
    country: "الدولة",
    countryValue: "العراق (بما في ذلك إقليم كردستان)",
    city: "المدينة",
    notProvided: "غير مذكور",
    specsTitle: "تفاصيل المنتج",
    contactTitle: "كيف نتواصل معك؟",
    dash: {
      filtersLabel: "تصفية الطلبات",
      all: "الكل",
      action: "يحتاج إجراءً منك",
      progress: "قيد التنفيذ",
      done: "منتهية",
      emptyTitle: "لا توجد طلبات بعد",
      emptyBody: "أرسل رابط منتج. تراجعه R&L وترد عليك بعرض سعر قبل شراء أي شيء أو شحنه.",
      emptyCta: "ابدأ طلب «أحضر لي»",
      filteredEmpty: "لا توجد طلبات في هذه المجموعة.",
      showAll: "عرض كل الطلبات",
      nextQuoted: "هناك عرض سعر بانتظارك. افتحه لقبوله أو رفضه.",
      nextReview: "تراجع R&L هذا الطلب. لا يلزمك أي إجراء.",
      nextProgress: "تم القبول. تابع تحديثات التتبع التي تسجلها R&L.",
      nextDelivered: "تم التسليم.",
      nextCancelled: "تم إلغاء هذا الطلب.",
    },
  },
  fa: {
    stepsLabel: "مراحل درخواست",
    steps: ["کالا", "تحویل", "بررسی"],
    stepStatus: "مرحله {n} از {total}: {name}",
    productTitle: "چه کالایی نیاز دارید؟",
    deliveryTitle: "کالا کجا تحویل داده شود؟",
    reviewHint: "جزئیات را بررسی کنید. پیش از ارسال می‌توانید هر مرحله را ویرایش کنید.",
    next: "ادامه",
    back: "بازگشت",
    edit: "ویرایش",
    qtyLess: "کاهش تعداد",
    qtyMore: "افزایش تعداد",
    country: "کشور",
    countryValue: "عراق (از جمله اقلیم کردستان)",
    city: "شهر",
    notProvided: "وارد نشده",
    specsTitle: "جزئیات کالا",
    contactTitle: "چگونه با شما تماس بگیریم؟",
    dash: {
      filtersLabel: "فیلتر درخواست‌ها",
      all: "همه",
      action: "نیاز به اقدام شما",
      progress: "در حال انجام",
      done: "پایان‌یافته",
      emptyTitle: "هنوز درخواستی ندارید",
      emptyBody:
        "پیوند یک کالا را بفرستید. R&L آن را بررسی می‌کند و پیش از خرید یا ارسال هر چیزی با یک پیشنهاد قیمت پاسخ می‌دهد.",
      emptyCta: "شروع درخواست «برای من بیاور»",
      filteredEmpty: "در این گروه درخواستی نیست.",
      showAll: "نمایش همه درخواست‌ها",
      nextQuoted: "یک پیشنهاد قیمت منتظر شماست. آن را باز کنید تا بپذیرید یا رد کنید.",
      nextReview: "R&L این درخواست را بررسی می‌کند. از شما کاری لازم نیست.",
      nextProgress: "پذیرفته شد. به‌روزرسانی‌های پیگیری ثبت‌شده توسط R&L را دنبال کنید.",
      nextDelivered: "تحویل داده شد.",
      nextCancelled: "این درخواست لغو شد.",
    },
  },
  tr: {
    stepsLabel: "Talep adımları",
    steps: ["Ürün", "Teslimat", "Gözden geçir"],
    stepStatus: "Adım {n} / {total}: {name}",
    productTitle: "Hangi ürüne ihtiyacınız var?",
    deliveryTitle: "Nereye teslim edilsin?",
    reviewHint: "Bilgileri kontrol edin. Göndermeden önce her adımı düzenleyebilirsiniz.",
    next: "Devam",
    back: "Geri",
    edit: "Düzenle",
    qtyLess: "Adedi azalt",
    qtyMore: "Adedi artır",
    country: "Ülke",
    countryValue: "Irak (Kürdistan Bölgesi dahil)",
    city: "Şehir",
    notProvided: "Belirtilmedi",
    specsTitle: "Ürün ayrıntıları",
    contactTitle: "Size nasıl ulaşalım?",
    dash: {
      filtersLabel: "Talepleri filtrele",
      all: "Tümü",
      action: "Sizden bekleniyor",
      progress: "Devam ediyor",
      done: "Tamamlandı",
      emptyTitle: "Henüz talep yok",
      emptyBody:
        "Bir ürün bağlantısı gönderin. R&L inceler ve herhangi bir şey satın alınmadan veya gönderilmeden önce teklifle yanıt verir.",
      emptyCta: "“Benim için getir” talebi başlat",
      filteredEmpty: "Bu grupta talep yok.",
      showAll: "Tüm talepleri göster",
      nextQuoted: "Bir teklif sizi bekliyor. Kabul etmek veya reddetmek için açın.",
      nextReview: "R&L bu talebi inceliyor. Sizden bir şey gerekmiyor.",
      nextProgress: "Kabul edildi. R&L’nin kaydettiği takip güncellemelerini izleyin.",
      nextDelivered: "Teslim edildi.",
      nextCancelled: "Bu talep iptal edildi.",
    },
  },
};

/** "Step 2 of 3: Delivery". */
export function stepStatus(copy: BringCopy, step: number, total: number) {
  return copy.stepStatus
    .replace("{n}", String(step))
    .replace("{total}", String(total))
    .replace("{name}", copy.steps[step - 1] ?? "");
}

/** Dashboard groups. Statuses come from requests/validate.ts and are never invented here. */
export type DashGroup = "all" | "action" | "progress" | "done";

export function dashGroup(status: string): Exclude<DashGroup, "all"> {
  if (status === "quoted") return "action";
  if (status === "delivered" || status === "cancelled") return "done";
  return "progress";
}

export function nextAction(copy: BringCopy, status: string): string {
  switch (status) {
    case "quoted":
      return copy.dash.nextQuoted;
    case "received":
    case "reviewing":
      return copy.dash.nextReview;
    case "delivered":
      return copy.dash.nextDelivered;
    case "cancelled":
      return copy.dash.nextCancelled;
    default:
      return copy.dash.nextProgress;
  }
}
