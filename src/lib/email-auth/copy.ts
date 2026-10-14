import type { Lang } from "@/lib/langs";

/** Email sign-in / registration copy. `{email}` and `{s}` are filled in by the dialog. */
export type EmailAuthCopy = {
  tabEmail: string;
  tabPhone: string;
  title: string;
  lede: string;
  email: string;
  send: string;
  sent: string;
  spam: string;
  code: string;
  verify: string;
  needName: string;
  name: string;
  register: string;
  resend: string;
  resendIn: string;
  change: string;
  errors: {
    email: string;
    wrong: string;
    rate: string;
    cooldown: string;
    invalid: string;
    name: string;
    forbidden: string;
    gate: string;
    unavailable: string;
    network: string;
  };
};

const en: EmailAuthCopy = {
  tabEmail: "Email",
  tabPhone: "Phone",
  title: "Sign in or register with email",
  lede: "Enter your email. We send you a six-digit code.",
  email: "Email address",
  send: "Send code",
  sent: "A six-digit code was sent to {email}. It works for 5 minutes.",
  spam: "Not there? Check your spam folder.",
  code: "Six-digit code",
  verify: "Verify and sign in",
  needName: "This email has no account yet. Enter your name to register.",
  name: "Full name",
  register: "Register",
  resend: "Resend code",
  resendIn: "Resend in {s} s",
  change: "Change email",
  errors: {
    email: "That email address is not valid.",
    wrong: "The code is wrong or has expired.",
    rate: "Too many tries. Please wait and try again later.",
    cooldown: "A code was just sent. Please wait before asking for another.",
    invalid: "Enter the six-digit code.",
    name: "The name must be 2 to 40 characters.",
    forbidden: "This account is suspended. Please contact us.",
    gate: "The security check failed. Reload the page and try again.",
    unavailable: "Email sign-in is not available right now. Please try again later.",
    network: "The connection failed. Please try again.",
  },
};

export const EMAIL_AUTH_COPY: Record<Lang, EmailAuthCopy> = {
  // TODO(translate-review): Sorani email sign-in copy, owner review.
  ckb: {
    tabEmail: "ئیمەیڵ",
    tabPhone: "ژمارەی تەلەفۆن",
    title: "چوونەژوورەوە یان خۆتۆمارکردن بە ئیمەیڵ",
    lede: "ئیمەیڵەکەت بنووسە. کۆدێکی شەش ژمارەییت بۆ دەنێرین.",
    email: "ئیمەیڵ",
    send: "ناردنی کۆد",
    sent: "کۆدێکی شەش ژمارەیی نێردرا بۆ {email}. بۆ 5 خولەک کار دەکات.",
    spam: "نەگەیشت؟ بوخچەی Spam بپشکنە.",
    code: "کۆدی شەش ژمارەیی",
    verify: "پشتڕاستکردنەوە و چوونەژوورەوە",
    needName: "ئەم ئیمەیڵە هێشتا هەژماری نییە. بۆ خۆتۆمارکردن ناوت بنووسە.",
    name: "ناوی تەواو",
    register: "خۆتۆمارکردن",
    resend: "دووبارە ناردنەوەی کۆد",
    resendIn: "دووبارە ناردنەوە دوای {s} چرکە",
    change: "گۆڕینی ئیمەیڵ",
    errors: {
      email: "ئەم ئیمەیڵە دروست نییە.",
      wrong: "کۆدەکە هەڵەیە یان کاتی بەسەرچووە.",
      rate: "هەوڵی زۆر درا. تکایە کەمێک بوەستە و دواتر هەوڵ بدەرەوە.",
      cooldown: "کۆدێک تازە نێردرا. تکایە کەمێک بوەستە پێش داواکردنی کۆدێکی تر.",
      invalid: "کۆدی شەش ژمارەیی بنووسە.",
      name: "ناو دەبێت لە 2 تا 40 پیت بێت.",
      forbidden: "ئەم هەژمارە ڕاگیراوە. تکایە پەیوەندیمان پێوە بکە.",
      gate: "پشکنینی پاراستن سەرنەکەوت. پەڕەکە نوێ بکەرەوە و دووبارە هەوڵ بدەرەوە.",
      unavailable: "چوونەژوورەوە بە ئیمەیڵ ئێستا بەردەست نییە. تکایە دواتر هەوڵ بدەرەوە.",
      network: "پەیوەندی سەرنەکەوت. تکایە دووبارە هەوڵ بدەرەوە.",
    },
  },
  // TODO(translate-review): Arabic email sign-in copy.
  ar: {
    tabEmail: "البريد الإلكتروني",
    tabPhone: "الهاتف",
    title: "الدخول أو التسجيل بالبريد الإلكتروني",
    lede: "أدخل بريدك الإلكتروني. سنرسل لك رمزًا من ستة أرقام.",
    email: "البريد الإلكتروني",
    send: "إرسال الرمز",
    sent: "أُرسل رمز من ستة أرقام إلى {email}. صالح لمدة 5 دقائق.",
    spam: "لم يصل؟ تحقق من مجلد الرسائل غير المرغوب فيها.",
    code: "رمز من ستة أرقام",
    verify: "تحقق وادخل",
    needName: "لا يوجد حساب لهذا البريد بعد. أدخل اسمك للتسجيل.",
    name: "الاسم الكامل",
    register: "تسجيل",
    resend: "إعادة إرسال الرمز",
    resendIn: "إعادة الإرسال بعد {s} ث",
    change: "تغيير البريد",
    errors: {
      email: "هذا البريد الإلكتروني غير صالح.",
      wrong: "الرمز غير صحيح أو انتهت صلاحيته.",
      rate: "محاولات كثيرة. يرجى الانتظار والمحاولة لاحقًا.",
      cooldown: "أُرسل رمز للتو. يرجى الانتظار قبل طلب رمز آخر.",
      invalid: "أدخل الرمز المكون من ستة أرقام.",
      name: "يجب أن يكون الاسم من 2 إلى 40 حرفًا.",
      forbidden: "هذا الحساب موقوف. يرجى التواصل معنا.",
      gate: "فشل فحص الأمان. أعد تحميل الصفحة وحاول مجددًا.",
      unavailable: "الدخول بالبريد الإلكتروني غير متاح حاليًا. يرجى المحاولة لاحقًا.",
      network: "فشل الاتصال. يرجى المحاولة مجددًا.",
    },
  },
  // TODO(translate-review): Persian email sign-in copy.
  fa: {
    tabEmail: "ایمیل",
    tabPhone: "تلفن",
    title: "ورود یا ثبت‌نام با ایمیل",
    lede: "ایمیلت را وارد کن. یک کد شش رقمی برایت می‌فرستیم.",
    email: "ایمیل",
    send: "ارسال کد",
    sent: "یک کد شش رقمی به {email} فرستاده شد. 5 دقیقه اعتبار دارد.",
    spam: "نرسید؟ پوشهٔ اسپم را ببین.",
    code: "کد شش رقمی",
    verify: "تأیید و ورود",
    needName: "این ایمیل هنوز حساب ندارد. برای ثبت‌نام نامت را وارد کن.",
    name: "نام کامل",
    register: "ثبت‌نام",
    resend: "ارسال دوبارهٔ کد",
    resendIn: "ارسال دوباره پس از {s} ثانیه",
    change: "تغییر ایمیل",
    errors: {
      email: "این ایمیل معتبر نیست.",
      wrong: "کد اشتباه است یا منقضی شده.",
      rate: "تلاش‌ها زیاد بود. کمی صبر کن و بعداً دوباره امتحان کن.",
      cooldown: "همین الان کدی فرستاده شد. پیش از درخواست کد دیگر کمی صبر کن.",
      invalid: "کد شش رقمی را وارد کن.",
      name: "نام باید 2 تا 40 حرف باشد.",
      forbidden: "این حساب معلق است. با ما تماس بگیر.",
      gate: "بررسی امنیتی ناموفق بود. صفحه را تازه کن و دوباره امتحان کن.",
      unavailable: "ورود با ایمیل اکنون در دسترس نیست. لطفاً بعداً امتحان کن.",
      network: "اتصال ناموفق بود. دوباره امتحان کن.",
    },
  },
  // TODO(translate-review): Kurmancî (Badînî) email sign-in copy.
  ku: {
    tabEmail: "E-name",
    tabPhone: "Telefon",
    title: "Bi e-nameyê têkeve an tomar bibe",
    lede: "E-nameya xwe binivîse. Em kodeke şeş reqemî ji te re dişînin.",
    email: "E-name",
    send: "Kodê bişîne",
    sent: "Kodeke şeş reqemî ji {email} re hate şandin. 5 deqîqe derbasdar e.",
    spam: "Negihîşt? Peldanka spamê kontrol bike.",
    code: "Koda şeş reqemî",
    verify: "Piştrast bike û têkeve",
    needName: "Ji bo vê e-nameyê hê hesab tune. Ji bo tomarkirinê navê xwe binivîse.",
    name: "Navê tevahî",
    register: "Tomar bibe",
    resend: "Kodê dîsa bişîne",
    resendIn: "Piştî {s} çirkeyan dîsa bişîne",
    change: "E-nameyê biguherîne",
    errors: {
      email: "Ev e-name ne rast e.",
      wrong: "Kod şaş e an dema wê derbas bûye.",
      rate: "Gelek hewl hatin dan. Ji kerema xwe hinekî bisekine.",
      cooldown: "Kodek nû hate şandin. Berî kodeke din hinekî bisekine.",
      invalid: "Koda şeş reqemî binivîse.",
      name: "Nav divê 2 heta 40 tîp be.",
      forbidden: "Ev hesab hatiye rawestandin. Bi me re têkilî daynin.",
      gate: "Kontrola ewlehiyê bi ser neket. Rûpelê nû bike û dîsa biceribîne.",
      unavailable: "Têketina bi e-nameyê niha ne berdest e. Paşê dîsa biceribîne.",
      network: "Girêdan bi ser neket. Dîsa biceribîne.",
    },
  },
  // TODO(translate-review): German email sign-in copy.
  de: {
    tabEmail: "E-Mail",
    tabPhone: "Telefon",
    title: "Mit E-Mail anmelden oder registrieren",
    lede: "Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen sechsstelligen Code.",
    email: "E-Mail-Adresse",
    send: "Code senden",
    sent: "Ein sechsstelliger Code wurde an {email} gesendet. Er gilt 5 Minuten.",
    spam: "Nicht angekommen? Prüfen Sie den Spam-Ordner.",
    code: "Sechsstelliger Code",
    verify: "Bestätigen und anmelden",
    needName: "Für diese E-Mail gibt es noch kein Konto. Geben Sie zur Registrierung Ihren Namen ein.",
    name: "Vollständiger Name",
    register: "Registrieren",
    resend: "Code erneut senden",
    resendIn: "Erneut senden in {s} s",
    change: "E-Mail ändern",
    errors: {
      email: "Diese E-Mail-Adresse ist ungültig.",
      wrong: "Der Code ist falsch oder abgelaufen.",
      rate: "Zu viele Versuche. Bitte warten Sie und versuchen Sie es später erneut.",
      cooldown: "Gerade wurde ein Code gesendet. Bitte kurz warten.",
      invalid: "Geben Sie den sechsstelligen Code ein.",
      name: "Der Name muss 2 bis 40 Zeichen lang sein.",
      forbidden: "Dieses Konto ist gesperrt. Bitte kontaktieren Sie uns.",
      gate: "Die Sicherheitsprüfung ist fehlgeschlagen. Laden Sie die Seite neu.",
      unavailable: "Die Anmeldung per E-Mail ist derzeit nicht verfügbar. Bitte später erneut versuchen.",
      network: "Die Verbindung ist fehlgeschlagen. Bitte erneut versuchen.",
    },
  },
  // TODO(translate-review): Turkish email sign-in copy.
  tr: {
    tabEmail: "E-posta",
    tabPhone: "Telefon",
    title: "E-postayla giriş yap veya kayıt ol",
    lede: "E-postanı yaz. Sana altı haneli bir kod göndereceğiz.",
    email: "E-posta adresi",
    send: "Kod gönder",
    sent: "{email} adresine altı haneli bir kod gönderildi. 5 dakika geçerli.",
    spam: "Gelmedi mi? Spam klasörüne bak.",
    code: "Altı haneli kod",
    verify: "Doğrula ve giriş yap",
    needName: "Bu e-postanın henüz hesabı yok. Kayıt için adını yaz.",
    name: "Ad soyad",
    register: "Kayıt ol",
    resend: "Kodu yeniden gönder",
    resendIn: "{s} sn sonra yeniden gönder",
    change: "E-postayı değiştir",
    errors: {
      email: "Bu e-posta adresi geçerli değil.",
      wrong: "Kod yanlış veya süresi dolmuş.",
      rate: "Çok fazla deneme. Lütfen bekleyip daha sonra tekrar dene.",
      cooldown: "Az önce bir kod gönderildi. Yenisini istemeden önce biraz bekle.",
      invalid: "Altı haneli kodu yaz.",
      name: "Ad 2 ile 40 karakter arasında olmalı.",
      forbidden: "Bu hesap askıya alındı. Lütfen bize ulaş.",
      gate: "Güvenlik kontrolü başarısız oldu. Sayfayı yenileyip tekrar dene.",
      unavailable: "E-postayla giriş şu anda kullanılamıyor. Lütfen daha sonra tekrar dene.",
      network: "Bağlantı başarısız oldu. Lütfen tekrar dene.",
    },
  },
  en,
};
