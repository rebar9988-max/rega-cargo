import type { Lang } from "../langs.ts";

export type ProductLinkCopy = {
  title: string;
  lede: string;
  link: string;
  kg: string;
  check: string;
  checking: string;
  estimateLabel: string;
  shipping: string;
  chargeable: string;
  days: string;
  noInfo: string;
  disclaimer: string;
  use: string;
  errors: Record<string, string>;
};

const en: ProductLinkCopy = {
  title: "Check a product link",
  lede: "Paste a link from Amazon, eBay or AliExpress to check it and estimate shipping. We do not open the link.",
  link: "Product link",
  kg: "Weight (kg)",
  check: "Check link",
  checking: "Checking…",
  estimateLabel: "Estimate",
  shipping: "Shipping to the selected destination",
  chargeable: "Chargeable weight",
  days: "Typical transit days",
  noInfo:
    "Product details are not available yet, so no title, photo or price is shown. Enter what you know in the form.",
  disclaimer:
    "This is an estimate, not a price offer. It excludes the goods and customs duty. R&L is not an official partner of these shops.",
  use: "Use this link in the request",
  errors: {
    url: "Enter a valid https product link.",
    host: "Only Amazon, eBay and AliExpress links are supported.",
    unsupported:
      "This looks like a shop page, search or short link. Open the product page and copy its address.",
    prohibited: "This product cannot be requested through R&L.",
    invalid: "Enter a weight from 0.1 to 70 kg.",
    rate: "Too many requests. Please wait a minute.",
    disabled: "This feature is not available.",
    unavailable: "The check is not available right now.",
  },
};

// TODO(translate-review): Sorani and Arabic strings below need native review.
const ckb: ProductLinkCopy = {
  title: "پشکنینی لینکی کاڵا",
  lede: "لینکێکی ئەمازۆن، ئیبەی یان ئەلی ئێکسپرێس دابنێ بۆ پشکنین و خەمڵاندنی گەیاندن. ئێمە لینکەکە ناکەینەوە.",
  link: "لینکی کاڵا",
  kg: "کێش (کگم)",
  check: "پشکنینی لینک",
  checking: "خەریکی پشکنینە…",
  estimateLabel: "خەمڵاندن",
  shipping: "گەیاندن بۆ شوێنی هەڵبژێردراو",
  chargeable: "کێشی حیسابکراو",
  days: "ڕۆژانی ئاسایی گەیاندن",
  noInfo:
    "وردەکاریی کاڵا هێشتا بەردەست نییە، بۆیە ناونیشان، وێنە و نرخ پیشان نادرێت. ئەوەی دەیزانیت لە فۆڕمەکەدا بینووسە.",
  disclaimer:
    "ئەمە خەمڵاندنە، پێشنیاری نرخ نییە. نرخی کاڵا و باجی گومرگ تێیدا نییە. R&L هاوبەشی فەرمیی ئەم فرۆشگایانە نییە.",
  use: "ئەم لینکە لە داواکارییەکەدا بەکاربهێنە",
  errors: {
    url: "لینکێکی https ی دروستی کاڵا بنووسە.",
    host: "تەنها لینکی ئەمازۆن، ئیبەی و ئەلی ئێکسپرێس پشتگیری دەکرێن.",
    unsupported:
      "ئەمە لاپەڕەی فرۆشگا، گەڕان یان لینکی کورتە. لاپەڕەی خودی کاڵاکە بکەرەوە و ناونیشانەکەی لەبەر بگرەوە.",
    prohibited: "ئەم کاڵایە لە ڕێگەی R&L وە داوا ناکرێت.",
    invalid: "کێشێک لە 0.1 تا 70 کگم بنووسە.",
    rate: "داواکاری زۆرە. خولەکێک چاوەڕێ بکە.",
    disabled: "ئەم تایبەتمەندییە بەردەست نییە.",
    unavailable: "پشکنین ئێستا بەردەست نییە.",
  },
};

const ar: ProductLinkCopy = {
  title: "التحقق من رابط منتج",
  lede: "الصق رابطاً من أمازون أو eBay أو AliExpress للتحقق منه وتقدير الشحن. لا نقوم بفتح الرابط.",
  link: "رابط المنتج",
  kg: "الوزن (كغ)",
  check: "تحقق من الرابط",
  checking: "جارٍ التحقق…",
  estimateLabel: "تقدير",
  shipping: "الشحن إلى الوجهة المحددة",
  chargeable: "الوزن المحتسب",
  days: "أيام العبور المعتادة",
  noInfo:
    "تفاصيل المنتج غير متاحة بعد، لذلك لا يظهر عنوان أو صورة أو سعر. أدخل ما تعرفه في النموذج.",
  disclaimer:
    "هذا تقدير وليس عرض سعر. لا يشمل ثمن البضاعة ولا الرسوم الجمركية. R&L ليست شريكاً رسمياً لهذه المتاجر.",
  use: "استخدم هذا الرابط في الطلب",
  errors: {
    url: "أدخل رابط منتج https صحيحاً.",
    host: "الروابط المدعومة: أمازون وeBay وAliExpress فقط.",
    unsupported: "يبدو هذا صفحة متجر أو بحثاً أو رابطاً مختصراً. افتح صفحة المنتج وانسخ عنوانها.",
    prohibited: "لا يمكن طلب هذا المنتج عبر R&L.",
    invalid: "أدخل وزناً من 0.1 إلى 70 كغ.",
    rate: "طلبات كثيرة. انتظر دقيقة.",
    disabled: "هذه الميزة غير متاحة.",
    unavailable: "التحقق غير متاح حالياً.",
  },
};

// TODO(translate-review): Kurmanji, German, Persian and Turkish below were added 2026-10-11 and need a
// native review. German and Turkish use the formal register, like the rest of the site.
const ku: ProductLinkCopy = {
  title: "Lînka berhemê kontrol bike",
  lede: "Lînkeke Amazon, eBay an AliExpress têxe da ku were kontrol kirin û mesrefa şandinê were texmîn kirin. Em lînkê venakin.",
  link: "Lînka berhemê",
  kg: "Giranî (kg)",
  check: "Lînkê kontrol bike",
  checking: "Tê kontrol kirin…",
  estimateLabel: "Texmîn",
  shipping: "Şandin ber bi cihê hilbijartî ve",
  chargeable: "Giraniya hesabkirî",
  days: "Rojên gelemperî yên veguhastinê",
  noInfo:
    "Hûrgiliyên berhemê hê ne amade ne, ji ber vê yekê sernav, wêne û biha nayên nîşandan. Ya ku tu dizanî di formê de binivîse.",
  disclaimer:
    "Ev texmîn e, ne pêşniyara bihayê ye. Bihayê tiştan û bacê gumrikê tê de nîn e. R&L ne hevparê fermî yê van firotgehan e.",
  use: "Vê lînkê di daxwazê de bi kar bîne",
  errors: {
    url: "Lînkeke https a rast a berhemê binivîse.",
    host: "Tenê lînkên Amazon, eBay û AliExpress têne piştgirî kirin.",
    unsupported:
      "Ev dişibe rûpelek firotgehê, lêgerînek an lînkeke kurt. Rûpela berhemê veke û navnîşana wê kopî bike.",
    prohibited: "Ev berhem bi rêya R&L nayê xwestin.",
    invalid: "Giraniyek ji 0.1 heta 70 kg binivîse.",
    rate: "Gelek daxwaz. Deqeyekê bisekine.",
    disabled: "Ev taybetmendî ne berdest e.",
    unavailable: "Kontrol niha ne berdest e.",
  },
};

const de: ProductLinkCopy = {
  title: "Produktlink prüfen",
  lede: "Fügen Sie einen Link von Amazon, eBay oder AliExpress ein, um ihn zu prüfen und den Versand zu schätzen. Wir öffnen den Link nicht.",
  link: "Produktlink",
  kg: "Gewicht (kg)",
  check: "Link prüfen",
  checking: "Wird geprüft …",
  estimateLabel: "Schätzung",
  shipping: "Versand zum gewählten Ziel",
  chargeable: "Berechnetes Gewicht",
  days: "Übliche Transporttage",
  noInfo:
    "Produktdetails sind noch nicht verfügbar, daher werden weder Titel, Foto noch Preis angezeigt. Tragen Sie im Formular ein, was Sie wissen.",
  disclaimer:
    "Dies ist eine Schätzung, kein Preisangebot. Warenwert und Zoll sind nicht enthalten. R&L ist kein offizieller Partner dieser Shops.",
  use: "Diesen Link in der Anfrage verwenden",
  errors: {
    url: "Geben Sie einen gültigen https-Produktlink ein.",
    host: "Unterstützt werden nur Links von Amazon, eBay und AliExpress.",
    unsupported:
      "Das sieht nach einer Shopseite, Suche oder einem Kurzlink aus. Öffnen Sie die Produktseite und kopieren Sie deren Adresse.",
    prohibited: "Dieses Produkt kann nicht über R&L bestellt werden.",
    invalid: "Geben Sie ein Gewicht von 0,1 bis 70 kg ein.",
    rate: "Zu viele Anfragen. Bitte warten Sie eine Minute.",
    disabled: "Diese Funktion ist nicht verfügbar.",
    unavailable: "Die Prüfung ist gerade nicht verfügbar.",
  },
};

const fa: ProductLinkCopy = {
  title: "بررسی لینک محصول",
  lede: "لینکی از آمازون، eBay یا AliExpress را بچسبان تا بررسی شود و هزینهٔ ارسال تخمین زده شود. ما لینک را باز نمی‌کنیم.",
  link: "لینک محصول",
  kg: "وزن (کیلوگرم)",
  check: "بررسی لینک",
  checking: "در حال بررسی…",
  estimateLabel: "تخمین",
  shipping: "ارسال به مقصد انتخاب‌شده",
  chargeable: "وزن قابل‌محاسبه",
  days: "روزهای معمول حمل",
  noInfo:
    "جزئیات محصول هنوز در دسترس نیست، بنابراین عنوان، عکس و قیمت نمایش داده نمی‌شود. آنچه می‌دانی را در فرم بنویس.",
  disclaimer:
    "این یک تخمین است، نه پیشنهاد قیمت. قیمت کالا و عوارض گمرکی در آن نیست. R&L شریک رسمی این فروشگاه‌ها نیست.",
  use: "استفاده از این لینک در درخواست",
  errors: {
    url: "یک لینک معتبر https از محصول وارد کن.",
    host: "فقط لینک‌های آمازون، eBay و AliExpress پشتیبانی می‌شوند.",
    unsupported:
      "این شبیه صفحهٔ فروشگاه، جستجو یا لینک کوتاه است. صفحهٔ خود محصول را باز کن و نشانی آن را کپی کن.",
    prohibited: "این محصول از طریق R&L قابل درخواست نیست.",
    invalid: "وزنی از 0.1 تا 70 کیلوگرم وارد کن.",
    rate: "درخواست‌ها زیاد است. یک دقیقه صبر کن.",
    disabled: "این قابلیت در دسترس نیست.",
    unavailable: "بررسی در حال حاضر در دسترس نیست.",
  },
};

const tr: ProductLinkCopy = {
  title: "Ürün bağlantısını kontrol edin",
  lede: "Kontrol etmek ve gönderim ücretini tahmin etmek için Amazon, eBay veya AliExpress bağlantısı yapıştırın. Bağlantıyı açmayız.",
  link: "Ürün bağlantısı",
  kg: "Ağırlık (kg)",
  check: "Bağlantıyı kontrol et",
  checking: "Kontrol ediliyor…",
  estimateLabel: "Tahmin",
  shipping: "Seçilen varış noktasına gönderim",
  chargeable: "Ücretlendirilecek ağırlık",
  days: "Olağan taşıma süresi (gün)",
  noInfo:
    "Ürün ayrıntıları henüz mevcut değil; bu yüzden başlık, fotoğraf ve fiyat gösterilmez. Bildiklerinizi forma yazın.",
  disclaimer:
    "Bu bir tahmindir, fiyat teklifi değildir. Ürün bedeli ve gümrük vergisi dahil değildir. R&L bu mağazaların resmî ortağı değildir.",
  use: "Bu bağlantıyı talepte kullan",
  errors: {
    url: "Geçerli bir https ürün bağlantısı girin.",
    host: "Yalnızca Amazon, eBay ve AliExpress bağlantıları desteklenir.",
    unsupported:
      "Bu bir mağaza sayfası, arama veya kısa bağlantı gibi görünüyor. Ürün sayfasını açın ve adresini kopyalayın.",
    prohibited: "Bu ürün R&L üzerinden talep edilemez.",
    invalid: "0,1 ile 70 kg arasında bir ağırlık girin.",
    rate: "Çok fazla istek. Lütfen bir dakika bekleyin.",
    disabled: "Bu özellik kullanılamıyor.",
    unavailable: "Kontrol şu anda kullanılamıyor.",
  },
};

export function productLinkCopy(lang: Lang): ProductLinkCopy {
  switch (lang) {
    case "ckb":
      return ckb;
    case "ar":
      return ar;
    case "ku":
      return ku;
    case "de":
      return de;
    case "fa":
      return fa;
    case "tr":
      return tr;
    default:
      return en;
  }
}
