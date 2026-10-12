import type { Lang } from "@/lib/langs";

/**
 * Simplified /stores/request form (owner request 2026-10-12): short sentences, one idea per line,
 * readable for customers who read little. Title, size/colour/notes labels and the submit label stay
 * in store-copy.ts. Nothing here promises a price, a delivery time or a reply time.
 */
export type EasyRequestCopy = {
  lede: string;
  linkLabel: string;
  linkHint: string;
  linkHintSample: string;
  linkOk: string;
  paste: string;
  pasteFailed: string;
  clear: string;
  qtyLabel: string;
  less: string;
  more: string;
  cityLabel: string;
  phoneLabel: string;
  phoneHint: string;
  badPhone: string;
  needPhone: string;
  badLink: string;
  details: string;
  detailsHint: string;
  declare: string;
  howTitle: string;
  howBuy: [string, string, string];
  howShip: [string, string, string];
  quoteLink: string;
  sentTitle: string;
  sentBody: string;
  sentRef: string;
};

const ckb: EasyRequestCopy = {
  lede: "لینکی کاڵاکە بنێرە. پێش ئەوەی هیچ بکڕین، نرخی تەواوت پێ دەڵێین.",
  linkLabel: "لینکی کاڵاکە",
  linkHint: "لە ماڵپەڕی فرۆشگاکە لینکەکە کۆپی بکە و لێرە بیلکێنە.",
  linkHintSample: "ئەگەر لینکت نییە، بەتاڵی بهێڵەرەوە.",
  linkOk: "لینکەکە دروستە",
  paste: "لکاندن",
  pasteFailed: "دەستت لەسەر خانەکە ڕابگرە و «Paste» هەڵبژێرە.",
  clear: "سڕینەوەی لینک",
  qtyLabel: "چەند دانە؟",
  less: "یەکێک کەمتر",
  more: "یەکێک زیاتر",
  cityLabel: "بۆ کام شار؟",
  phoneLabel: "ژمارەی مۆبایل یان واتسئاپ",
  phoneHint: "بۆ ئەوەی پەیوەندیت پێوە بکەین.",
  badPhone: "ژمارەکە تەواو نییە. وەک 0750 123 4567 بینووسە.",
  needPhone: "ژمارەی مۆبایلەکەت بنووسە.",
  badLink: "ئەم لینکە کار ناکات. لە ماڵپەڕی فرۆشگاکە کۆپی بکە و لێرە بیلکێنە.",
  details: "قەبارە، ڕەنگ یان تێبینی",
  detailsHint: "ئارەزوومەندانە",
  declare: "بە ناردن، پشتڕاست دەکەیتەوە کە هیچ کاڵایەکی قەدەغە نانێریت.",
  howTitle: "چۆن کار دەکات؟",
  howBuy: [
    "لینکەکە دەنێریت.",
    "پەیوەندیت پێوە دەکەین و نرخی تەواوت پێ دەڵێین.",
    "ئەگەر ڕازی بوویت، دەیکڕین و بۆت دەهێنین.",
  ],
  howShip: [
    "لینکی ئەو کاڵایە دەنێریت کە خۆت کڕیوتە.",
    "پەیوەندیت پێوە دەکەین و نرخی ناردنت پێ دەڵێین.",
    "ئەگەر ڕازی بوویت، بۆت دەهێنین.",
  ],
  quoteLink: "تەنها نرخی ناردن دەزانیت؟",
  sentTitle: "داواکارییەکەت نێردرا",
  sentBody: "پەیوەندیت پێوە دەکەین. هیچ شتێک ناکڕدرێت تا تۆ ڕازی نەبیت.",
  sentRef: "ژمارەی داواکاری",
};

const en: EasyRequestCopy = {
  lede: "Send the product link. We tell you the full price before we buy anything.",
  linkLabel: "Product link",
  linkHint: "Copy the link from the store's website and paste it here.",
  linkHintSample: "No link? Leave it empty.",
  linkOk: "Link looks good",
  paste: "Paste",
  pasteFailed: "Press and hold the box, then choose “Paste”.",
  clear: "Clear link",
  qtyLabel: "How many?",
  less: "One less",
  more: "One more",
  cityLabel: "Which city?",
  phoneLabel: "Mobile or WhatsApp number",
  phoneHint: "So we can contact you.",
  badPhone: "This number is incomplete. Write it like 0750 123 4567.",
  needPhone: "Please write your mobile number.",
  badLink: "This link does not work. Copy it from the store's website and paste it here.",
  details: "Size, colour or a note",
  detailsHint: "Optional",
  declare: "By sending, you confirm you are not sending any prohibited items.",
  howTitle: "How it works",
  howBuy: [
    "You send the link.",
    "We contact you with the full price.",
    "If you agree, we buy it and bring it to you.",
  ],
  howShip: [
    "You send the link of the item you bought yourself.",
    "We contact you with the shipping price.",
    "If you agree, we bring it to you.",
  ],
  quoteLink: "Only need the shipping price?",
  sentTitle: "Your request was sent",
  sentBody: "We will contact you. Nothing is bought until you agree.",
  sentRef: "Request number",
};

const ar: EasyRequestCopy = {
  lede: "أرسل رابط المنتج. نخبرك بالسعر الكامل قبل أن نشتري أي شيء.",
  linkLabel: "رابط المنتج",
  linkHint: "انسخ الرابط من موقع المتجر والصقه هنا.",
  linkHintSample: "إذا لم يكن لديك رابط، اتركه فارغًا.",
  linkOk: "الرابط صحيح",
  paste: "لصق",
  pasteFailed: "اضغط مطولًا على الخانة واختر «لصق».",
  clear: "مسح الرابط",
  qtyLabel: "كم قطعة؟",
  less: "قطعة أقل",
  more: "قطعة أكثر",
  cityLabel: "إلى أي مدينة؟",
  phoneLabel: "رقم الموبايل أو واتساب",
  phoneHint: "لكي نتواصل معك.",
  badPhone: "الرقم غير كامل. اكتبه مثل 0750 123 4567.",
  needPhone: "اكتب رقم موبايلك من فضلك.",
  badLink: "هذا الرابط لا يعمل. انسخه من موقع المتجر والصقه هنا.",
  details: "المقاس أو اللون أو ملاحظة",
  detailsHint: "اختياري",
  declare: "بالإرسال تؤكد أنك لا ترسل أي مواد ممنوعة.",
  howTitle: "كيف يعمل؟",
  howBuy: ["ترسل الرابط.", "نتواصل معك ونخبرك بالسعر الكامل.", "إذا وافقت، نشتريه ونوصله إليك."],
  howShip: [
    "ترسل رابط المنتج الذي اشتريته بنفسك.",
    "نتواصل معك ونخبرك بسعر الشحن.",
    "إذا وافقت، نوصله إليك.",
  ],
  quoteLink: "تريد سعر الشحن فقط؟",
  sentTitle: "تم إرسال طلبك",
  sentBody: "سنتواصل معك. لا نشتري أي شيء قبل موافقتك.",
  sentRef: "رقم الطلب",
};

const de: EasyRequestCopy = {
  lede: "Schick uns den Produktlink. Wir nennen dir den Gesamtpreis, bevor wir etwas kaufen.",
  linkLabel: "Produktlink",
  linkHint: "Kopiere den Link von der Website des Shops und füge ihn hier ein.",
  linkHintSample: "Kein Link? Lass das Feld leer.",
  linkOk: "Link ist in Ordnung",
  paste: "Einfügen",
  pasteFailed: "Halte das Feld gedrückt und wähle „Einfügen“.",
  clear: "Link löschen",
  qtyLabel: "Wie viele?",
  less: "Eins weniger",
  more: "Eins mehr",
  cityLabel: "Welche Stadt?",
  phoneLabel: "Handy- oder WhatsApp-Nummer",
  phoneHint: "Damit wir dich erreichen können.",
  badPhone: "Die Nummer ist unvollständig. Schreib sie z. B. so: 0750 123 4567.",
  needPhone: "Bitte schreib deine Handynummer.",
  badLink: "Dieser Link funktioniert nicht. Kopiere ihn von der Website des Shops und füge ihn hier ein.",
  details: "Größe, Farbe oder eine Notiz",
  detailsHint: "Optional",
  declare: "Mit dem Senden bestätigst du, dass du keine verbotenen Waren versendest.",
  howTitle: "So funktioniert es",
  howBuy: [
    "Du schickst den Link.",
    "Wir melden uns mit dem Gesamtpreis.",
    "Wenn du zustimmst, kaufen wir es und bringen es zu dir.",
  ],
  howShip: [
    "Du schickst den Link der Ware, die du selbst gekauft hast.",
    "Wir melden uns mit dem Versandpreis.",
    "Wenn du zustimmst, bringen wir es zu dir.",
  ],
  quoteLink: "Nur den Versandpreis wissen?",
  sentTitle: "Deine Anfrage wurde gesendet",
  sentBody: "Wir melden uns bei dir. Gekauft wird erst, wenn du zustimmst.",
  sentRef: "Anfragenummer",
};

// TODO(translate-review): ku, fa and tr below were written without a native reviewer.
const ku: EasyRequestCopy = {
  lede: "Lînka kelûpelê bişîne. Berî ku em tiştekî bikirin, em bihayê tevahî ji te re dibêjin.",
  linkLabel: "Lînka kelûpelê",
  linkHint: "Lînkê ji malpera firoşgehê kopî bike û li vir bizeliqîne.",
  linkHintSample: "Lînk tune? Vala bihêle.",
  linkOk: "Lînk rast e",
  paste: "Zeliqandin",
  pasteFailed: "Tiliya xwe li ser qutîkê bihêle û «Paste» hilbijêre.",
  clear: "Lînkê jê bibe",
  qtyLabel: "Çend dane?",
  less: "Yek kêmtir",
  more: "Yek zêdetir",
  cityLabel: "Bo kîjan bajarî?",
  phoneLabel: "Hejmara mobîl an WhatsApp",
  phoneHint: "Da ku em bi te re têkilî daynin.",
  badPhone: "Hejmar ne temam e. Wek 0750 123 4567 binivîse.",
  needPhone: "Ji kerema xwe hejmara mobîla xwe binivîse.",
  badLink: "Ev lînk naxebite. Ji malpera firoşgehê kopî bike û li vir bizeliqîne.",
  details: "Mezinahî, reng an têbînî",
  detailsHint: "Bijarte",
  declare: "Bi şandinê, tu piştrast dikî ku tu tiştên qedexe naşînî.",
  howTitle: "Çawa dixebite?",
  howBuy: [
    "Tu lînkê dişînî.",
    "Em bi te re têkilî datînin û bihayê tevahî dibêjin.",
    "Heke tu razî bî, em dikirin û ji te re tînin.",
  ],
  howShip: [
    "Tu lînka wê kelûpelê dişînî ku te bi xwe kirîye.",
    "Em bi te re têkilî datînin û bihayê şandinê dibêjin.",
    "Heke tu razî bî, em ji te re tînin.",
  ],
  quoteLink: "Tenê bihayê şandinê dixwazî?",
  sentTitle: "Daxwaza te hate şandin",
  sentBody: "Em ê bi te re têkilî daynin. Heta tu razî nebî tiştek nayê kirîn.",
  sentRef: "Hejmara daxwazê",
};

const fa: EasyRequestCopy = {
  lede: "لینک کالا را بفرستید. پیش از خرید، قیمت کامل را به شما می‌گوییم.",
  linkLabel: "لینک کالا",
  linkHint: "لینک را از سایت فروشگاه کپی کنید و اینجا بچسبانید.",
  linkHintSample: "لینک ندارید؟ خالی بگذارید.",
  linkOk: "لینک درست است",
  paste: "چسباندن",
  pasteFailed: "انگشت را روی کادر نگه دارید و «Paste» را انتخاب کنید.",
  clear: "پاک کردن لینک",
  qtyLabel: "چند عدد؟",
  less: "یکی کمتر",
  more: "یکی بیشتر",
  cityLabel: "به کدام شهر؟",
  phoneLabel: "شماره موبایل یا واتساپ",
  phoneHint: "تا با شما تماس بگیریم.",
  badPhone: "شماره کامل نیست. مثل 0750 123 4567 بنویسید.",
  needPhone: "لطفاً شماره موبایل خود را بنویسید.",
  badLink: "این لینک کار نمی‌کند. آن را از سایت فروشگاه کپی کنید و اینجا بچسبانید.",
  details: "سایز، رنگ یا یادداشت",
  detailsHint: "اختیاری",
  declare: "با ارسال، تأیید می‌کنید که هیچ کالای ممنوعه‌ای نمی‌فرستید.",
  howTitle: "چطور کار می‌کند؟",
  howBuy: ["لینک را می‌فرستید.", "با شما تماس می‌گیریم و قیمت کامل را می‌گوییم.", "اگر موافق بودید، می‌خریم و برایتان می‌آوریم."],
  howShip: [
    "لینک کالایی را که خودتان خریده‌اید می‌فرستید.",
    "با شما تماس می‌گیریم و قیمت ارسال را می‌گوییم.",
    "اگر موافق بودید، برایتان می‌آوریم.",
  ],
  quoteLink: "فقط قیمت ارسال را می‌خواهید؟",
  sentTitle: "درخواست شما فرستاده شد",
  sentBody: "با شما تماس می‌گیریم. تا موافقت شما چیزی خریده نمی‌شود.",
  sentRef: "شماره درخواست",
};

const tr: EasyRequestCopy = {
  lede: "Ürün bağlantısını gönder. Bir şey satın almadan önce sana toplam fiyatı söyleriz.",
  linkLabel: "Ürün bağlantısı",
  linkHint: "Bağlantıyı mağazanın sitesinden kopyala ve buraya yapıştır.",
  linkHintSample: "Bağlantın yok mu? Boş bırak.",
  linkOk: "Bağlantı doğru",
  paste: "Yapıştır",
  pasteFailed: "Kutuya basılı tut ve “Yapıştır”ı seç.",
  clear: "Bağlantıyı sil",
  qtyLabel: "Kaç adet?",
  less: "Bir azalt",
  more: "Bir artır",
  cityLabel: "Hangi şehre?",
  phoneLabel: "Cep telefonu veya WhatsApp numarası",
  phoneHint: "Seninle iletişime geçebilmemiz için.",
  badPhone: "Numara eksik. 0750 123 4567 gibi yaz.",
  needPhone: "Lütfen cep telefonu numaranı yaz.",
  badLink: "Bu bağlantı çalışmıyor. Mağazanın sitesinden kopyala ve buraya yapıştır.",
  details: "Beden, renk veya not",
  detailsHint: "İsteğe bağlı",
  declare: "Göndererek yasaklı ürün göndermediğini onaylarsın.",
  howTitle: "Nasıl çalışır?",
  howBuy: [
    "Bağlantıyı gönderirsin.",
    "Seninle iletişime geçip toplam fiyatı söyleriz.",
    "Kabul edersen satın alır ve sana getiririz.",
  ],
  howShip: [
    "Kendin satın aldığın ürünün bağlantısını gönderirsin.",
    "Seninle iletişime geçip kargo fiyatını söyleriz.",
    "Kabul edersen sana getiririz.",
  ],
  quoteLink: "Sadece kargo fiyatı mı lazım?",
  sentTitle: "Talebin gönderildi",
  sentBody: "Seninle iletişime geçeceğiz. Sen onaylamadan hiçbir şey satın alınmaz.",
  sentRef: "Talep numarası",
};

export const EASY_REQUEST_COPY: Record<Lang, EasyRequestCopy> = { ckb, en, ar, de, ku, fa, tr };
