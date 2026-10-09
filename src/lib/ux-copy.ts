import type { Lang } from "@/lib/langs";

/** UX-audit copy: tracking states, form send states, dialog close, CTAs. No invented data. */
export type UxCopy = {
  trackLede: string;
  trackHint: string;
  trackLoading: string;
  trackNotFound: string;
  /** Sentence around the contact email: pre + email + post. */
  trackUnavailablePre: string;
  trackUnavailablePost: string;
  status: string;
  lastUpdate: string;
  nextStep: string;
  estimate: string;
  noEvents: string;
  sending: string;
  failPre: string;
  failPost: string;
  bookFailPre: string;
  bookFailPost: string;
  close: string;
  sendEmail: string;
  consentFirst: string;
};

export const UX_COPY: Record<Lang, UxCopy> = {
  ckb: {
    trackLede: "ژمارەی شوێنپێکردن بنووسە، کە لە پشتڕاستکردنەوەی داواکارییەکەتدا هاتووە، بۆ ئەوەی بزانیت بارەکەت گەیشتۆتە کوێ.",
    trackHint: "شێوەی ژمارە: RG-XXXX-XXXX-XXXX",
    trackLoading: "بەدوای بارەکەتدا دەگەڕێین…",
    trackNotFound: "ئەم ژمارەیە نەدۆزرایەوە. ژمارەکە بپشکنە و دووبارە هەوڵ بدەرەوە، یان پەیوەندیمان پێوە بکە.",
    trackUnavailablePre: "شوێنپێکردنی ئۆنلاین خەریکە دەبەسترێتەوە. ژمارەی شوێنپێکردنەکەت بۆ ",
    trackUnavailablePost: " بنێرە و دۆخی بارەکەتت پێ دەڵێین.",
    status: "دۆخ",
    lastUpdate: "دوایین نوێکردنەوە",
    nextStep: "هەنگاوی داهاتوو",
    estimate: "خەمڵاندنە، لەوانەیە بگۆڕێت",
    noEvents: "هێشتا هیچ قۆناغێک تۆمار نەکراوە.",
    sending: "دەنێردرێت…",
    failPre: "ئێستا ناتوانین ئەمە بنێرین. زانیارییەکانت لەم پەڕەیەدا دەمێننەوە. دووبارە هەوڵ بدەرەوە یان ئیمەیڵ بنێرە بۆ ",
    failPost: ".",
    bookFailPre: "حیجزی ئۆنلاین هێشتا بەردەست نییە. نرخەکەت لەم پەڕەیەدا دەمێنێتەوە. ئیمەیڵ بنێرە بۆ ",
    bookFailPost: " و ئێمە پشتڕاستی دەکەینەوە.",
    close: "داخستن",
    sendEmail: "ئیمەیڵ بنێرە",
    consentFirst: "سەرەتا خانەی سەرەوە نیشان بکە، پاشان وێنە بگرە یان هەڵیبژێرە.",
  },
  ku: {
    trackLede: "Hejmara şopandinê ya di pejirandina rezervasyona xwe de binivîse da ku bibînî barê te li ku ye.",
    trackHint: "Teşe: RG-XXXX-XXXX-XXXX",
    trackLoading: "Li barê te digerin…",
    trackNotFound: "Ev hejmar nehat dîtin. Wê kontrol bike û dîsa biceribîne, an bi me re têkilî dayne.",
    trackUnavailablePre: "Şopandina serhêl tê girêdan. Hejmara şopandinê bişîne ",
    trackUnavailablePost: " û em ê rewşa barê te ji te re bibêjin.",
    status: "Rewş",
    lastUpdate: "Nûkirina dawî",
    nextStep: "Gava din",
    estimate: "Texmîn e, dibe ku biguhere",
    noEvents: "Hîn ti qonax nehatine tomarkirin.",
    sending: "Tê şandin…",
    failPre: "Niha em nikarin vê bişînin. Agahiyên te li ser vê rûpelê dimînin. Dîsa biceribîne an e-nameyê bişîne ",
    failPost: ".",
    bookFailPre: "Rezervasyona serhêl hîn ne amade ye. Bihayê te li ser vê rûpelê dimîne. E-nameyê bişîne ",
    bookFailPost: " û em ê wê piştrast bikin.",
    close: "Bigire",
    sendEmail: "E-nameyê bişîne",
    consentFirst: "Pêşî qutiya jorîn nîşan bike, paşê wêneyekî bikişîne an hilbijêre.",
  },
  de: {
    trackLede: "Geben Sie die Sendungsnummer aus Ihrer Buchungsbestätigung ein, um zu sehen, wo Ihre Sendung ist.",
    trackHint: "Format: RG-XXXX-XXXX-XXXX",
    trackLoading: "Sendung wird gesucht …",
    trackNotFound: "Diese Nummer wurde nicht gefunden. Bitte prüfen Sie sie und versuchen Sie es erneut oder schreiben Sie uns.",
    trackUnavailablePre: "Die Online-Sendungsverfolgung wird gerade angebunden. Senden Sie Ihre Sendungsnummer an ",
    trackUnavailablePost: ", wir antworten mit dem aktuellen Status.",
    status: "Status",
    lastUpdate: "Letzte Aktualisierung",
    nextStep: "Nächster Schritt",
    estimate: "Schätzung, kann sich ändern",
    noEvents: "Noch keine Stationen erfasst.",
    sending: "Wird gesendet …",
    failPre: "Das konnte gerade nicht gesendet werden. Ihre Angaben bleiben auf dieser Seite. Versuchen Sie es erneut oder schreiben Sie an ",
    failPost: ".",
    bookFailPre: "Online-Buchung ist noch nicht verfügbar. Ihr Angebot bleibt auf dieser Seite. Schreiben Sie an ",
    bookFailPost: ", wir bestätigen es.",
    close: "Schließen",
    sendEmail: "E-Mail schreiben",
    consentFirst: "Bitte zuerst das Kästchen oben ankreuzen, dann ein Foto aufnehmen oder auswählen.",
  },
  en: {
    trackLede: "Enter the tracking number from your booking confirmation to see where your shipment is.",
    trackHint: "Format: RG-XXXX-XXXX-XXXX",
    trackLoading: "Looking up your shipment…",
    trackNotFound: "We couldn't find that number. Check it and try again, or contact us.",
    trackUnavailablePre: "Online tracking is being connected. Email your tracking number to ",
    trackUnavailablePost: " and we'll reply with the status.",
    status: "Status",
    lastUpdate: "Last update",
    nextStep: "Next step",
    estimate: "Estimate, may change",
    noEvents: "No milestones recorded yet.",
    sending: "Sending…",
    failPre: "We couldn't send this right now. Your details are still on this page. Try again or email ",
    failPost: ".",
    bookFailPre: "Online booking isn't available yet. Your quote stays on this page. Email ",
    bookFailPost: " and we'll confirm it.",
    close: "Close",
    sendEmail: "Send an email",
    consentFirst: "Tick the box above first, then take or choose a photo.",
  },
  ar: {
    trackLede: "أدخل رقم التتبع الموجود في تأكيد حجزك لمعرفة مكان شحنتك.",
    trackHint: "الصيغة: RG-XXXX-XXXX-XXXX",
    trackLoading: "جارٍ البحث عن شحنتك…",
    trackNotFound: "لم نعثر على هذا الرقم. تحقّق منه وحاول مرة أخرى، أو تواصل معنا.",
    trackUnavailablePre: "يجري حالياً ربط خدمة التتبع عبر الإنترنت. أرسل رقم التتبع إلى ",
    trackUnavailablePost: " وسنردّ عليك بحالة الشحنة.",
    status: "الحالة",
    lastUpdate: "آخر تحديث",
    nextStep: "الخطوة التالية",
    estimate: "تقديري، وقد يتغيّر",
    noEvents: "لم تُسجَّل أي مراحل بعد.",
    sending: "جارٍ الإرسال…",
    failPre: "تعذّر الإرسال الآن. تبقى بياناتك في هذه الصفحة. حاول مرة أخرى أو راسلنا على ",
    failPost: ".",
    bookFailPre: "الحجز عبر الإنترنت غير متاح بعد. يبقى عرض السعر في هذه الصفحة. راسلنا على ",
    bookFailPost: " وسنؤكّده لك.",
    close: "إغلاق",
    sendEmail: "أرسل بريداً إلكترونياً",
    consentFirst: "ضع علامة في المربع أعلاه أولاً، ثم التقط صورة أو اخترها.",
  },
  fa: {
    trackLede: "شماره رهگیری را که در تأیید رزروت آمده وارد کن تا ببینی مرسوله‌ات کجاست.",
    trackHint: "قالب: RG-XXXX-XXXX-XXXX",
    trackLoading: "در حال جست‌وجوی مرسوله…",
    trackNotFound: "این شماره پیدا نشد. آن را بررسی کن و دوباره امتحان کن، یا با ما تماس بگیر.",
    trackUnavailablePre: "رهگیری آنلاین در حال راه‌اندازی است. شماره رهگیری‌ات را به ",
    trackUnavailablePost: " بفرست تا وضعیت مرسوله را برایت بنویسیم.",
    status: "وضعیت",
    lastUpdate: "آخرین به‌روزرسانی",
    nextStep: "مرحله بعد",
    estimate: "تخمینی است و ممکن است تغییر کند",
    noEvents: "هنوز مرحله‌ای ثبت نشده است.",
    sending: "در حال ارسال…",
    failPre: "الان نمی‌توانیم این را بفرستیم. اطلاعاتت در همین صفحه می‌ماند. دوباره امتحان کن یا به ",
    failPost: " ایمیل بزن.",
    bookFailPre: "رزرو آنلاین هنوز در دسترس نیست. قیمتت در همین صفحه می‌ماند. به ",
    bookFailPost: " ایمیل بزن تا تأییدش کنیم.",
    close: "بستن",
    sendEmail: "ارسال ایمیل",
    consentFirst: "اول کادر بالا را علامت بزن، بعد عکس بگیر یا انتخاب کن.",
  },
  tr: {
    trackLede: "Gönderinizin nerede olduğunu görmek için rezervasyon onayınızdaki takip numarasını girin.",
    trackHint: "Biçim: RG-XXXX-XXXX-XXXX",
    trackLoading: "Gönderiniz aranıyor…",
    trackNotFound: "Bu numara bulunamadı. Kontrol edip tekrar deneyin veya bize yazın.",
    trackUnavailablePre: "Çevrimiçi takip bağlanıyor. Takip numaranızı ",
    trackUnavailablePost: " adresine gönderin, size durumu bildirelim.",
    status: "Durum",
    lastUpdate: "Son güncelleme",
    nextStep: "Sonraki adım",
    estimate: "Tahmini, değişebilir",
    noEvents: "Henüz kayıtlı aşama yok.",
    sending: "Gönderiliyor…",
    failPre: "Şu anda gönderilemedi. Bilgileriniz bu sayfada duruyor. Tekrar deneyin veya şu adrese yazın: ",
    failPost: ".",
    bookFailPre: "Çevrimiçi rezervasyon henüz kullanılamıyor. Teklifiniz bu sayfada duruyor. Şu adrese yazın: ",
    bookFailPost: ", onaylayalım.",
    close: "Kapat",
    sendEmail: "E-posta gönder",
    consentFirst: "Önce yukarıdaki kutuyu işaretleyin, sonra fotoğraf çekin veya seçin.",
  },
};
