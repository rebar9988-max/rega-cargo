import type { Lang } from "./langs.ts";

/** Extra strings for the /stores/request form (contact field and server errors). */
export type RequestCopy = {
  phone: string;
  phoneHint: string;
  badPhone: string;
  badQty: string;
  badDest: string;
  rate: string;
  signin: string;
};

export const REQUEST_COPY: Record<Lang, RequestCopy> = {
  en: {
    phone: "Phone / WhatsApp",
    phoneHint: "International format, e.g. +49 151 2345678. Not needed if you signed in with your phone.",
    badPhone: "Enter a phone or WhatsApp number in international format (+…), so we can reach you.",
    badQty: "Quantity must be a whole number from 1 to 20.",
    badDest: "Choose a destination from the list.",
    rate: "Too many requests. Please wait a minute and try again.",
    signin: "Please sign in to send a request.",
  },
  ckb: {
    phone: "تەلەفۆن / واتسئاپ",
    phoneHint: "بە شێوازی نێودەوڵەتی، بۆ نموونە +964 750 123 4567. ئەگەر بە تەلەفۆن چوویتە ژوورەوە پێویست نییە.",
    badPhone: "ژمارەی تەلەفۆن یان واتسئاپ بە شێوازی نێودەوڵەتی (+…) بنووسە، بۆ ئەوەی پەیوەندیت پێوە بکەین.",
    badQty: "ژمارەکە دەبێت ژمارەیەکی تەواو بێت لە 1 تا 20.",
    badDest: "شوێنی گەیاندن لە لیستەکە هەڵبژێرە.",
    rate: "داواکاری زۆرە. خولەکێک چاوەڕێ بکە و دووبارە هەوڵ بدەرەوە.",
    signin: "بۆ ناردنی داواکاری، تکایە بچۆ ژوورەوە.",
  },
  ku: {
    phone: "Telefon / WhatsApp",
    phoneHint: "Bi forma navneteweyî, mînak +49 151 2345678. Heke bi telefonê ketî hundir, ne pêwîst e.",
    badPhone: "Hejmara telefonê an WhatsApp bi forma navneteweyî (+…) binivîse, da ku em bigihîjin te.",
    badQty: "Hejmar divê hejmareke tam be ji 1 heta 20.",
    badDest: "Ji lîsteyê cihê gihandinê hilbijêre.",
    rate: "Gelek daxwaz. Ji kerema xwe deqeyekê bisekine û dîsa biceribîne.",
    signin: "Ji bo şandina daxwazê, ji kerema xwe têkeve.",
  },
  ar: {
    phone: "الهاتف / واتساب",
    phoneHint: "بالصيغة الدولية، مثل +964 750 123 4567. غير مطلوب إذا سجّلت الدخول برقم هاتفك.",
    badPhone: "أدخل رقم هاتف أو واتساب بالصيغة الدولية (+…) حتى نتمكن من التواصل معك.",
    badQty: "يجب أن تكون الكمية عددًا صحيحًا من 1 إلى 20.",
    badDest: "اختر وجهة من القائمة.",
    rate: "طلبات كثيرة. انتظر دقيقة ثم حاول مرة أخرى.",
    signin: "يرجى تسجيل الدخول لإرسال الطلب.",
  },
  fa: {
    phone: "تلفن / واتس‌اپ",
    phoneHint: "با قالب بین‌المللی، مثلاً +49 151 2345678. اگر با تلفن وارد شده‌اید لازم نیست.",
    badPhone: "شمارهٔ تلفن یا واتس‌اپ را با قالب بین‌المللی (+…) وارد کنید تا بتوانیم با شما تماس بگیریم.",
    badQty: "تعداد باید عددی صحیح از 1 تا 20 باشد.",
    badDest: "مقصد را از فهرست انتخاب کنید.",
    rate: "درخواست‌ها زیاد است. یک دقیقه صبر کنید و دوباره امتحان کنید.",
    signin: "برای ارسال درخواست لطفاً وارد شوید.",
  },
  de: {
    phone: "Telefon / WhatsApp",
    phoneHint: "Internationales Format, z. B. +49 151 2345678. Nicht nötig, wenn Sie mit Ihrer Telefonnummer angemeldet sind.",
    badPhone: "Bitte eine Telefon- oder WhatsApp-Nummer im internationalen Format (+…) angeben, damit wir Sie erreichen.",
    badQty: "Die Menge muss eine ganze Zahl von 1 bis 20 sein.",
    badDest: "Bitte ein Ziel aus der Liste wählen.",
    rate: "Zu viele Anfragen. Bitte eine Minute warten und erneut versuchen.",
    signin: "Bitte melden Sie sich an, um eine Anfrage zu senden.",
  },
  tr: {
    phone: "Telefon / WhatsApp",
    phoneHint: "Uluslararası biçimde, ör. +49 151 2345678. Telefonunuzla giriş yaptıysanız gerekmez.",
    badPhone: "Size ulaşabilmemiz için uluslararası biçimde (+…) bir telefon veya WhatsApp numarası girin.",
    badQty: "Adet 1 ile 20 arasında tam sayı olmalıdır.",
    badDest: "Listeden bir varış yeri seçin.",
    rate: "Çok fazla istek. Lütfen bir dakika bekleyip tekrar deneyin.",
    signin: "İstek göndermek için lütfen giriş yapın.",
  },
};
