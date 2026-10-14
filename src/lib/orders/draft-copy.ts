import type { Lang } from "../langs";

const en = {
  keep: "Keep a draft in this tab for up to 2 hours",
  privacy:
    "Only the link, quantity and destination are saved. Phone, notes and declarations are not saved. Clear the draft on shared devices.",
  restored:
    "Draft restored. Review all fields and confirm the declaration again. It has not been sent.",
  clear: "Clear draft",
  unsafe:
    "This draft could not be saved. Storage may be unavailable or the link may contain private information.",
  unavailable: "Phone sign-in is unavailable. You can prepare an email for the R&L team to review.",
  fallback: "Prepare an email request",
  note: "You send the email yourself. No purchase, booking or request is confirmed until R&L replies.",
  copied: "Summary copied. It has not been sent.",
  copy: "Copy request summary",
  copyFailed: "Copy is unavailable. Use the email option or select the summary below.",
  summary: "Request summary",
};
export const DRAFT_COPY: Record<Lang, typeof en> = {
  en,
  ckb: {
    keep: "ڕەشنووس لەم تابەدا تا 2 کاتژمێر بپارێزە",
    privacy:
      "تەنها لینک، ژمارە و شاری مەبەست هەڵدەگیرێن. تەلەفۆن، تێبینی و ڕاگەیاندن هەڵناگیرێن. لە ئامێری هاوبەشدا ڕەشنووسەکە بسڕەوە.",
    restored:
      "ڕەشنووس گەڕایەوە. خانەکان بپشکنە و ڕاگەیاندنەکە دووبارە پشتڕاست بکەرەوە. هێشتا نەنێردراوە.",
    clear: "سڕینەوەی ڕەشنووس",
    unsafe: "ڕەشنووس هەڵنەگیرا. ڕەنگە هەڵگرتن بەردەست نەبێت یان لینکەکە زانیاریی تایبەتی تێدا بێت.",
    unavailable:
      "چوونەژوورەوە بە تەلەفۆن بەردەست نییە. دەتوانیت ئیمەیڵێک بۆ پشکنینی تیمی R&L ئامادە بکەیت.",
    fallback: "ئامادەکردنی داواکاری بە ئیمەیڵ",
    note: "خۆت ئیمەیڵەکە دەنێریت. هیچ کڕین، حیجز یان داواکارییەک پشتڕاست ناکرێتەوە تا R&L وەڵام دەداتەوە.",
    copied: "پوختە کۆپی کرا. هێشتا نەنێردراوە.",
    copy: "کۆپیکردنی پوختەی داواکاری",
    copyFailed: "کۆپیکردن بەردەست نییە. ئیمەیڵ بەکار بهێنە یان پوختەی خوارەوە هەڵبژێرە.",
    summary: "پوختەی داواکاری",
  },
  ar: {
    keep: "احفظ مسودة في هذا التبويب لمدة ساعتين",
    privacy:
      "يُحفظ الرابط والكمية والوجهة فقط. لا يُحفظ الهاتف أو الملاحظات أو الإقرار. امسح المسودة على الأجهزة المشتركة.",
    restored: "استُعيدت المسودة. راجع الحقول وأكد الإقرار مجددًا. لم تُرسل بعد.",
    clear: "مسح المسودة",
    unsafe: "تعذر حفظ المسودة. قد يكون التخزين غير متاح أو يحتوي الرابط على معلومات خاصة.",
    unavailable: "تسجيل الدخول بالهاتف غير متاح. يمكنك إعداد بريد لفريق R&L للمراجعة.",
    fallback: "إعداد طلب بالبريد",
    note: "ترسل البريد بنفسك. لا يتأكد الشراء أو الحجز أو الطلب حتى يرد R&L.",
    copied: "نُسخ الملخص ولم يُرسل.",
    copy: "نسخ ملخص الطلب",
    copyFailed: "النسخ غير متاح. استخدم البريد أو حدد الملخص أدناه.",
    summary: "ملخص الطلب",
  },
  ku: {
    keep: "Reşnivîsê di vê tabê de heta 2 saetan biparêze",
    privacy:
      "Tenê girêdan, hejmar û bajar têne tomarkirin. Telefon, not û daxuyanî nayên tomarkirin. Li amûrên hevpar reşnivîsê jê bibe.",
    restored:
      "Reşnivîs hat vegerandin. Qadan kontrol bike û daxuyaniyê dîsa piştrast bike. Hê nehatiye şandin.",
    clear: "Reşnivîsê jê bibe",
    unsafe:
      "Reşnivîs nehat tomarkirin. Dibe ku hilanîn ne berdest be an girêdan agahiyên taybet hebe.",
    unavailable:
      "Têketina bi telefonê ne berdest e. E-nameyekê ji bo lêkolîna tîma R&L amade bike.",
    fallback: "Daxwaza e-nameyê amade bike",
    note: "Tu e-nameyê bi xwe dişînî. Heta R&L bersivê nede kirîn, rezervasyon an daxwaz nayê piştrastkirin.",
    copied: "Kurte hat kopîkirin. Hê nehatiye şandin.",
    copy: "Kurteya daxwazê kopî bike",
    copyFailed: "Kopîkirin ne berdest e. E-nameyê bikar bîne an kurteya jêr hilbijêre.",
    summary: "Kurteya daxwazê",
  },
  de: {
    keep: "Entwurf bis zu 2 Stunden in diesem Tab speichern",
    privacy:
      "Nur Link, Menge und Ziel werden gespeichert. Telefon, Notizen und Erklärung bleiben ungespeichert. Auf geteilten Geräten den Entwurf löschen.",
    restored:
      "Entwurf wiederhergestellt. Felder prüfen und Erklärung erneut bestätigen. Noch nicht gesendet.",
    clear: "Entwurf löschen",
    unsafe:
      "Entwurf nicht gespeichert. Speicher ist eventuell nicht verfügbar oder der Link enthält private Informationen.",
    unavailable:
      "Telefonanmeldung ist nicht verfügbar. Sie können eine E-Mail zur Prüfung durch R&L vorbereiten.",
    fallback: "E-Mail-Anfrage vorbereiten",
    note: "Sie senden die E-Mail selbst. Kauf, Buchung oder Anfrage sind erst nach der Antwort von R&L bestätigt.",
    copied: "Zusammenfassung kopiert. Noch nicht gesendet.",
    copy: "Anfrage kopieren",
    copyFailed: "Kopieren nicht verfügbar. E-Mail nutzen oder die Zusammenfassung unten auswählen.",
    summary: "Anfrageübersicht",
  },
  fa: {
    keep: "پیش‌نویس را تا 2 ساعت در این برگه نگه دار",
    privacy:
      "فقط پیوند، تعداد و مقصد ذخیره می‌شوند. تلفن، یادداشت و اظهارنامه ذخیره نمی‌شوند. در دستگاه مشترک پیش‌نویس را پاک کن.",
    restored:
      "پیش‌نویس بازیابی شد. موارد را بررسی و اظهارنامه را دوباره تأیید کن. هنوز ارسال نشده است.",
    clear: "پاک کردن پیش‌نویس",
    unsafe: "پیش‌نویس ذخیره نشد. شاید ذخیره‌سازی در دسترس نیست یا پیوند اطلاعات خصوصی دارد.",
    unavailable: "ورود با تلفن در دسترس نیست. می‌توانی ایمیلی برای بررسی تیم R&L آماده کنی.",
    fallback: "آماده کردن درخواست ایمیلی",
    note: "ایمیل را خودت ارسال می‌کنی. تا پاسخ R&L خرید، رزرو یا درخواست تأیید نمی‌شود.",
    copied: "خلاصه کپی شد. هنوز ارسال نشده است.",
    copy: "کپی خلاصه درخواست",
    copyFailed: "کپی در دسترس نیست. از ایمیل استفاده کن یا خلاصه زیر را انتخاب کن.",
    summary: "خلاصه درخواست",
  },
  tr: {
    keep: "Taslağı bu sekmede en fazla 2 saat sakla",
    privacy:
      "Yalnızca bağlantı, miktar ve varış yeri saklanır. Telefon, notlar ve beyan saklanmaz. Ortak cihazlarda taslağı silin.",
    restored:
      "Taslak geri yüklendi. Alanları kontrol edin ve beyanı tekrar onaylayın. Henüz gönderilmedi.",
    clear: "Taslağı sil",
    unsafe:
      "Taslak kaydedilemedi. Depolama kullanılamıyor veya bağlantı özel bilgi içeriyor olabilir.",
    unavailable:
      "Telefonla giriş kullanılamıyor. R&L ekibinin incelemesi için bir e-posta hazırlayabilirsiniz.",
    fallback: "E-posta talebi hazırla",
    note: "E-postayı kendiniz gönderirsiniz. R&L yanıtlayana kadar satın alma, rezervasyon veya talep onaylanmaz.",
    copied: "Özet kopyalandı. Henüz gönderilmedi.",
    copy: "Talep özetini kopyala",
    copyFailed: "Kopyalama kullanılamıyor. E-posta kullanın veya aşağıdaki özeti seçin.",
    summary: "Talep özeti",
  },
};
