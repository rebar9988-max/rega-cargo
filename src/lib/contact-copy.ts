import type { Lang } from "@/lib/langs";

/** Contact buttons and verified business details (7 languages). */
export type ContactCopy = {
  title: string;
  email: string;
  whatsapp: string;
  call: string;
  hours: string;
  timezone: string;
  address: string;
  map: string;
  emailOnly: string;
  adminTitle: string;
  adminBody: string;
  adminNone: string;
};

export const CONTACT_COPY: Record<Lang, ContactCopy> = {
  en: { title: "Contact us", email: "Email", whatsapp: "WhatsApp", call: "Call", hours: "Opening hours", timezone: "Time zone", address: "Warehouse address", map: "Open in maps", emailOnly: "For now we answer by email.", adminTitle: "Business details", adminBody: "Not shown on the site until set as Worker vars (unset or invalid):", adminNone: "All business details are configured." },
  ckb: { title: "پەیوەندیمان پێوە بکە", email: "ئیمەیڵ", whatsapp: "واتساپ", call: "پەیوەندی", hours: "کاتی کارکردن", timezone: "ناوچەی کات", address: "ناونیشانی کۆگا", map: "کردنەوە لە نەخشە", emailOnly: "ئێستا بە ئیمەیڵ وەڵام دەدەینەوە.", adminTitle: "زانیاریی کار", adminBody: "تا وەک گۆڕاوی Worker دانەنرێن لە ماڵپەڕ نیشان نادرێن (دانەنراو یان نادروست):", adminNone: "هەموو زانیارییەکانی کار دانراون." },
  ar: { title: "تواصل معنا", email: "البريد الإلكتروني", whatsapp: "واتساب", call: "اتصال", hours: "ساعات العمل", timezone: "المنطقة الزمنية", address: "عنوان المستودع", map: "فتح في الخرائط", emailOnly: "حالياً نرد عبر البريد الإلكتروني.", adminTitle: "بيانات النشاط", adminBody: "لا تظهر في الموقع حتى تُضبط كمتغيرات Worker (غير مضبوطة أو غير صالحة):", adminNone: "جميع بيانات النشاط مضبوطة." },
  ku: { title: "Bi me re têkilî daynin", email: "E-name", whatsapp: "WhatsApp", call: "Telefon bike", hours: "Demên xebatê", timezone: "Herêma demê", address: "Navnîşana depoyê", map: "Di nexşeyê de veke", emailOnly: "Niha em bi e-nameyê bersiv didin.", adminTitle: "Agahiyên karsaziyê", adminBody: "Heta ku wek guhêrbarên Worker neyên danîn li malperê nayên nîşandan (nehatine danîn an nederbasdar):", adminNone: "Hemû agahiyên karsaziyê hatine danîn." },
  fa: { title: "تماس با ما", email: "ایمیل", whatsapp: "واتساپ", call: "تماس", hours: "ساعات کاری", timezone: "منطقه زمانی", address: "نشانی انبار", map: "باز کردن در نقشه", emailOnly: "فعلاً از طریق ایمیل پاسخ می‌دهیم.", adminTitle: "اطلاعات کسب‌وکار", adminBody: "تا زمانی که به‌عنوان متغیر Worker تنظیم نشوند در سایت نمایش داده نمی‌شوند (تنظیم‌نشده یا نامعتبر):", adminNone: "همه اطلاعات کسب‌وکار تنظیم شده‌اند." },
  de: { title: "Kontakt", email: "E-Mail", whatsapp: "WhatsApp", call: "Anrufen", hours: "Öffnungszeiten", timezone: "Zeitzone", address: "Lageradresse", map: "In Karten öffnen", emailOnly: "Derzeit antworten wir per E-Mail.", adminTitle: "Geschäftsdaten", adminBody: "Werden erst angezeigt, wenn sie als Worker-Variablen gesetzt sind (nicht gesetzt oder ungültig):", adminNone: "Alle Geschäftsdaten sind gesetzt." },
  tr: { title: "Bize ulaşın", email: "E-posta", whatsapp: "WhatsApp", call: "Ara", hours: "Çalışma saatleri", timezone: "Saat dilimi", address: "Depo adresi", map: "Haritada aç", emailOnly: "Şimdilik e-posta ile yanıt veriyoruz.", adminTitle: "İşletme bilgileri", adminBody: "Worker değişkeni olarak ayarlanana kadar sitede gösterilmez (ayarlanmamış veya geçersiz):", adminNone: "Tüm işletme bilgileri ayarlı." },
};
