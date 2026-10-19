import type { Lang } from "../langs.ts";

/** Email sign-in UI and email text. Same keys in every language (i18n-coverage test). */
export type EmailOtpCopy = {
  title: string;
  lede: string;
  email: string;
  send: string;
  sending: string;
  sentTo: string;
  code: string;
  name: string;
  verify: string;
  verifying: string;
  resend: string;
  resendIn: string;
  change: string;
  expiry: string;
  usePhone: string;
  useEmail: string;
  errors: { email: string; rate: string; code: string; expired: string; unavailable: string };
  mail: { subject: string; intro: string; expiry: string; ignore: string };
};

export const EMAIL_OTP_COPY: Record<Lang, EmailOtpCopy> = {
  // TODO(translate-review): Sorani strings added with the email sign-in flow.
  ckb: {
    title: "بە ئیمەیڵ",
    lede: "ئیمەیڵەکەت بنووسە. کۆدێکی شەش ژمارەیی بۆت دەنێرین.",
    email: "ئیمەیڵ",
    send: "ناردنی کۆدی پشتڕاستکردنەوە",
    sending: "دەنێردرێت…",
    sentTo: "ئەگەر ئەم ئیمەیڵە دەتوانێت نامە وەربگرێت، کۆدێکمان نارد بۆ:",
    code: "کۆدی شەش ژمارە",
    name: "ناو (ئارەزوومەندانە، بۆ هەژماری نوێ)",
    verify: "پشتڕاستکردنەوە و چوونەژوورەوە",
    verifying: "پشتڕاست دەکرێتەوە…",
    resend: "دووبارە ناردنەوەی کۆد",
    resendIn: "دووبارە ناردنەوە دوای {s} چرکە",
    change: "گۆڕینی ئیمەیڵ",
    expiry: "کۆدەکە بۆ 5 خولەک کار دەکات و تەنها یەک جار بەکاردێت.",
    usePhone: "بە ژمارەی تەلەفۆن بچۆ ژوورەوە",
    useEmail: "بە ئیمەیڵ بچۆ ژوورەوە",
    errors: {
      email: "ئەم ئیمەیڵە دروست نییە.",
      rate: "زۆر هەوڵدرا. کەمێک بوەستە و دواتر هەوڵ بدەرەوە.",
      code: "کۆدەکە هەڵەیە یان بەکارهاتووە.",
      expired: "کاتی کۆدەکە تەواو بوو. کۆدێکی نوێ داوا بکە.",
      unavailable: "ناردنی ئیمەیڵ ئێستا بەردەست نییە. تکایە دواتر هەوڵ بدەرەوە.",
    },
    mail: {
      subject: "کۆدی چوونەژوورەوەی R&L",
      intro: "کۆدی چوونەژوورەوەی R&L ـەکەت:",
      expiry: "ئەم کۆدە بۆ 5 خولەک کار دەکات و تەنها یەک جار بەکاردێت.",
      ignore: "ئەگەر تۆ داوات نەکردووە، ئەم ئیمەیڵە پشتگوێ بخە. کۆدەکە بە کەس مەدە.",
    },
  },
  // TODO(translate-review): Kurmancî (Badînî) strings added with the email sign-in flow.
  ku: {
    title: "Bi e-nameyê",
    lede: "E-nameya xwe binivîse. Em ê kodeke şeş reqemî ji te re bişînin.",
    email: "E-name",
    send: "Koda piştrastkirinê bişîne",
    sending: "Tê şandin…",
    sentTo: "Heke ev navnîşan dikare e-nameyan bistîne, me kodek şand bo:",
    code: "Koda şeş reqemî",
    name: "Nav (bijarte, ji bo hesabê nû)",
    verify: "Piştrast bike û têkeve",
    verifying: "Tê piştrastkirin…",
    resend: "Kodê dîsa bişîne",
    resendIn: "Dîsa şandin piştî {s} çirkeyan",
    change: "E-nameyê biguherîne",
    expiry: "Kod 5 deqeyan derbasdar e û tenê carekê dixebite.",
    usePhone: "Bi hejmara telefonê têkeve",
    useEmail: "Bi e-nameyê têkeve",
    errors: {
      email: "Ev e-name ne rast e.",
      rate: "Gelek hewl hatin dan. Hinekî bisekine û paşê biceribîne.",
      code: "Kod şaş e an berê hatiye bikaranîn.",
      expired: "Dema kodê qediya. Kodeke nû bixwaze.",
      unavailable: "Şandina e-nameyê niha ne berdest e. Ji kerema xwe paşê biceribîne.",
    },
    mail: {
      subject: "Koda têketinê ya R&L",
      intro: "Koda te ya têketinê ya R&L:",
      expiry: "Ev kod 5 deqeyan derbasdar e û tenê carekê dixebite.",
      ignore: "Heke te ev nexwestibe, vê e-nameyê paşguh bike. Kodê bi kesî re parve neke.",
    },
  },
  de: {
    title: "Mit Ihrer E-Mail",
    lede: "Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen sechsstelligen Code.",
    email: "E-Mail",
    send: "Bestätigungscode senden",
    sending: "Wird gesendet…",
    sentTo: "Falls diese Adresse E-Mails empfangen kann, haben wir einen Code gesendet an:",
    code: "Sechsstelliger Code",
    name: "Name (optional, für neue Konten)",
    verify: "Bestätigen und anmelden",
    verifying: "Wird geprüft…",
    resend: "Code erneut senden",
    resendIn: "Erneut senden in {s} s",
    change: "E-Mail ändern",
    expiry: "Der Code gilt 5 Minuten und funktioniert nur einmal.",
    usePhone: "Mit Telefonnummer anmelden",
    useEmail: "Mit E-Mail anmelden",
    errors: {
      email: "Diese E-Mail-Adresse ist ungültig.",
      rate: "Zu viele Versuche. Bitte warten Sie kurz und versuchen Sie es erneut.",
      code: "Der Code ist falsch oder wurde bereits verwendet.",
      expired: "Der Code ist abgelaufen. Fordern Sie einen neuen an.",
      unavailable: "E-Mail-Versand ist gerade nicht verfügbar. Bitte versuchen Sie es später erneut.",
    },
    mail: {
      subject: "Ihr R&L-Anmeldecode",
      intro: "Ihr R&L-Anmeldecode lautet:",
      expiry: "Der Code gilt 5 Minuten und funktioniert nur einmal.",
      ignore:
        "Falls Sie das nicht angefordert haben, ignorieren Sie diese E-Mail. Geben Sie den Code an niemanden weiter.",
    },
  },
  en: {
    title: "With your email",
    lede: "Enter your email address. We will send you a six-digit code.",
    email: "Email",
    send: "Send verification code",
    sending: "Sending…",
    sentTo: "If this address can receive email, we sent a code to:",
    code: "Six-digit code",
    name: "Name (optional, for new accounts)",
    verify: "Verify and sign in",
    verifying: "Verifying…",
    resend: "Resend code",
    resendIn: "Resend in {s} s",
    change: "Change email",
    expiry: "The code works for 5 minutes and only once.",
    usePhone: "Sign in with phone number",
    useEmail: "Sign in with email",
    errors: {
      email: "That email address is not valid.",
      rate: "Too many tries. Please wait a little and try again.",
      code: "That code is wrong or was already used.",
      expired: "That code has expired. Request a new one.",
      unavailable: "Email sign-in is temporarily unavailable. Please try again later.",
    },
    mail: {
      subject: "Your R&L sign-in code",
      intro: "Your R&L sign-in code is:",
      expiry: "This code works for 5 minutes and only once.",
      ignore: "If you did not request it, ignore this email. Never share the code with anyone.",
    },
  },
  ar: {
    title: "بالبريد الإلكتروني",
    lede: "أدخل بريدك الإلكتروني. سنرسل لك رمزًا من ستة أرقام.",
    email: "البريد الإلكتروني",
    send: "إرسال رمز التحقق",
    sending: "جارٍ الإرسال…",
    sentTo: "إذا كان هذا العنوان يستقبل البريد، فقد أرسلنا رمزًا إلى:",
    code: "رمز من ستة أرقام",
    name: "الاسم (اختياري، للحسابات الجديدة)",
    verify: "تحقق وسجّل الدخول",
    verifying: "جارٍ التحقق…",
    resend: "إعادة إرسال الرمز",
    resendIn: "إعادة الإرسال بعد {s} ثانية",
    change: "تغيير البريد",
    expiry: "الرمز صالح لمدة 5 دقائق ولمرة واحدة فقط.",
    usePhone: "الدخول برقم الهاتف",
    useEmail: "الدخول بالبريد الإلكتروني",
    errors: {
      email: "عنوان البريد هذا غير صالح.",
      rate: "محاولات كثيرة. انتظر قليلًا ثم حاول مجددًا.",
      code: "الرمز غير صحيح أو استُخدم من قبل.",
      expired: "انتهت صلاحية الرمز. اطلب رمزًا جديدًا.",
      unavailable: "تسجيل الدخول بالبريد غير متاح مؤقتًا. يرجى المحاولة لاحقًا.",
    },
    mail: {
      subject: "رمز تسجيل الدخول إلى R&L",
      intro: "رمز تسجيل الدخول إلى R&L هو:",
      expiry: "هذا الرمز صالح لمدة 5 دقائق ولمرة واحدة فقط.",
      ignore: "إذا لم تطلبه، تجاهل هذه الرسالة. لا تشارك الرمز مع أي شخص.",
    },
  },
  tr: {
    title: "E-postanla",
    lede: "E-posta adresini gir. Sana altı haneli bir kod göndereceğiz.",
    email: "E-posta",
    send: "Doğrulama kodu gönder",
    sending: "Gönderiliyor…",
    sentTo: "Bu adres e-posta alabiliyorsa şu adrese bir kod gönderdik:",
    code: "Altı haneli kod",
    name: "Ad (isteğe bağlı, yeni hesaplar için)",
    verify: "Doğrula ve giriş yap",
    verifying: "Doğrulanıyor…",
    resend: "Kodu yeniden gönder",
    resendIn: "{s} sn sonra yeniden gönder",
    change: "E-postayı değiştir",
    expiry: "Kod 5 dakika geçerlidir ve yalnızca bir kez kullanılabilir.",
    usePhone: "Telefon numarasıyla giriş yap",
    useEmail: "E-postayla giriş yap",
    errors: {
      email: "Bu e-posta adresi geçerli değil.",
      rate: "Çok fazla deneme. Biraz bekleyip tekrar dene.",
      code: "Kod yanlış veya daha önce kullanılmış.",
      expired: "Kodun süresi doldu. Yeni bir kod iste.",
      unavailable: "E-postayla giriş geçici olarak kullanılamıyor. Lütfen daha sonra tekrar dene.",
    },
    mail: {
      subject: "R&L giriş kodun",
      intro: "R&L giriş kodun:",
      expiry: "Bu kod 5 dakika geçerlidir ve yalnızca bir kez kullanılabilir.",
      ignore: "Bunu sen istemediysen bu e-postayı yok say. Kodu kimseyle paylaşma.",
    },
  },
  fa: {
    title: "با ایمیل",
    lede: "ایمیل خود را وارد کن. یک کد شش رقمی برایت می‌فرستیم.",
    email: "ایمیل",
    send: "ارسال کد تأیید",
    sending: "در حال ارسال…",
    sentTo: "اگر این نشانی ایمیل دریافت می‌کند، کدی فرستادیم به:",
    code: "کد شش رقمی",
    name: "نام (اختیاری، برای حساب جدید)",
    verify: "تأیید و ورود",
    verifying: "در حال تأیید…",
    resend: "ارسال دوبارهٔ کد",
    resendIn: "ارسال دوباره پس از {s} ثانیه",
    change: "تغییر ایمیل",
    expiry: "کد 5 دقیقه اعتبار دارد و فقط یک بار کار می‌کند.",
    usePhone: "ورود با شمارهٔ تلفن",
    useEmail: "ورود با ایمیل",
    errors: {
      email: "این نشانی ایمیل معتبر نیست.",
      rate: "تلاش‌ها زیاد بود. کمی صبر کن و دوباره امتحان کن.",
      code: "کد اشتباه است یا قبلاً استفاده شده.",
      expired: "کد منقضی شده. کد تازه‌ای درخواست کن.",
      unavailable: "ورود با ایمیل موقتاً در دسترس نیست. لطفاً بعداً دوباره امتحان کن.",
    },
    mail: {
      subject: "کد ورود R&L",
      intro: "کد ورود R&L شما:",
      expiry: "این کد 5 دقیقه اعتبار دارد و فقط یک بار کار می‌کند.",
      ignore: "اگر درخواست نکرده‌ای، این ایمیل را نادیده بگیر. کد را به هیچ‌کس نده.",
    },
  },
};

export function emailOtpCopy(lang: string | null | undefined): EmailOtpCopy {
  return EMAIL_OTP_COPY[lang as Lang] ?? EMAIL_OTP_COPY.en;
}
