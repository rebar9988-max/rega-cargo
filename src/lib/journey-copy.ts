import type { Lang } from "./langs.ts";

/** Unified product language. TODO(translate-review): new non-English copy needs native review. */
const en = {
  title: "Shop. Request.\nDelivered by R&L.",
  body: "Shop R&L or send a product link.\nReviewed before we buy or ship.\nEurope → Kurdistan & Iraq.",
  market: "Market",
  shop: "Shop the Marketplace",
  bring: "Bring For Me",
  help: "Help",
  stores: "European stores",
  marketBody: "Products listed in R&L. Search and compare the available offers.",
  marketEmpty: "No products are listed here yet. You can send a product link for review.",
  marketError:
    "Marketplace products could not be loaded. Try the marketplace again or send a product link.",
  bringBody:
    "Have a product link? Tell us what you need and where it should go. R&L reviews availability and costs before a purchase or delivery is confirmed.",
  optional: "Size, colour and notes (optional)",
  linkCheck: "Check a supported product link (optional)",
  deliveryBody:
    "Plan delivery to Erbil, Sulaymaniyah, Duhok, Kirkuk or Baghdad. Shipping costs are estimates until reviewed for your parcel.",
  received:
    "R&L received your request and will review it. This is not a confirmed purchase or delivery.",
  trackHint: "Use the tracking code provided by R&L for your order or parcel.",
  review: "Review before sending",
  details: "Product details",
};
export type JourneyCopy = typeof en;
const ckb: JourneyCopy = {
  title: "بازاڕ و داواکاری.\nگەیاندن بە R&L.",
  body: "بازاڕ بکە یان لینکی کاڵا بنێرە.\nپێش کڕین و ناردن دەیپشکنین.\nلە ئەوروپاوە بۆ کوردستان و عێراق.",
  market: "بازاڕ",
  shop: "بازاڕ بکە",
  bring: "کاڵام بۆ بهێنەوە",
  help: "یارمەتی",
  stores: "فرۆشگا ئەوروپییەکان",
  marketBody: "کاڵاکانی ناو بازاڕی R&L. بگەڕێ و پێشنیارە بەردەستەکان بەراورد بکە.",
  marketEmpty: "هێشتا کاڵایەک لێرە تۆمار نەکراوە. دەتوانیت لینکی کاڵایەک بۆ پشکنین بنێریت.",
  marketError: "کاڵاکانی بازاڕ بار نەکران. دووبارە بازاڕەکە بکەرەوە یان لینکی کاڵایەک بنێرە.",
  bringBody:
    "لینکی کاڵایەکت هەیە؟ پێمان بڵێ چی دەوێت و بۆ کوێ بنێردرێت. R&L بوون و تێچوو دەپشکنێت پێش پشتڕاستکردنەوەی کڕین یان گەیاندن.",
  optional: "قەبارە، ڕەنگ و تێبینی (ئارەزوومەندانە)",
  linkCheck: "پشکنینی لینکی کاڵا (ئارەزوومەندانە)",
  deliveryBody:
    "پلانی گەیاندن بۆ هەولێر، سلێمانی، دهۆک، کەرکووک یان بەغدا دابنێ. تێچووی ناردن خەمڵاندنە تا بۆ پاکەتەکەت پشکنین دەکرێت.",
  received: "R&L داواکارییەکەتی وەرگرت و دەیپشکنێت. ئەمە پشتڕاستکردنەوەی کڕین یان گەیاندن نییە.",
  trackHint: "کۆدی شوێنپێکردنی R&L بۆ داواکاری یان پاکەتەکەت بەکاربهێنە.",
  review: "پێش ناردن پێداچوونەوە بکە",
  details: "وردەکاریی کاڵا",
};
const ar: JourneyCopy = {
  title: "تسوق واطلب.\nالتوصيل مع R&L.",
  body: "تسوق من R&L أو أرسل رابط منتج.\nنراجع طلبك قبل الشراء أو الشحن.\nمن أوروبا إلى كردستان والعراق.",
  market: "السوق",
  shop: "تسوق في السوق",
  bring: "أحضر لي",
  help: "المساعدة",
  stores: "المتاجر الأوروبية",
  marketBody: "منتجات مدرجة في R&L. ابحث وقارن العروض المتاحة.",
  marketEmpty: "لا توجد منتجات مدرجة هنا بعد. يمكنك إرسال رابط منتج للمراجعة.",
  marketError: "تعذر تحميل منتجات السوق. حاول فتح السوق مجددًا أو أرسل رابط منتج.",
  bringBody:
    "لديك رابط منتج؟ أخبرنا بما تحتاجه وإلى أين نرسله. تراجع R&L التوفر والتكاليف قبل تأكيد الشراء أو التوصيل.",
  optional: "المقاس واللون والملاحظات (اختياري)",
  linkCheck: "فحص رابط منتج مدعوم (اختياري)",
  deliveryBody:
    "خطط للتوصيل إلى أربيل أو السليمانية أو دهوك أو كركوك أو بغداد. تكاليف الشحن تقديرية حتى مراجعة طردك.",
  received: "استلمت R&L طلبك وستراجعه. هذا ليس تأكيدًا للشراء أو التوصيل.",
  trackHint: "استخدم رمز التتبع الذي قدمته R&L لطلبك أو طردك.",
  review: "راجع قبل الإرسال",
  details: "تفاصيل المنتج",
};
const fa: JourneyCopy = {
  title: "خرید و درخواست.\nتحویل با R&L.",
  body: "از R&L خرید کنید یا لینک کالا بفرستید.\nپیش از خرید و ارسال بررسی می‌کنیم.\nاز اروپا به کردستان و عراق.",
  market: "بازار",
  shop: "خرید از بازار",
  bring: "برای من بیاور",
  help: "راهنما",
  stores: "فروشگاه‌های اروپایی",
  marketBody: "کالاهای ثبت‌شده در R&L. پیشنهادهای موجود را جستجو و مقایسه کنید.",
  marketEmpty: "هنوز کالایی اینجا ثبت نشده است. می‌توانید لینک کالا را برای بررسی بفرستید.",
  marketError: "کالاهای بازار بارگیری نشدند. بازار را دوباره باز کنید یا لینک کالا بفرستید.",
  bringBody:
    "لینک کالا دارید؟ بگویید چه می‌خواهید و به کجا ارسال شود. R&L موجودی و هزینه‌ها را پیش از تأیید خرید یا تحویل بررسی می‌کند.",
  optional: "اندازه، رنگ و یادداشت (اختیاری)",
  linkCheck: "بررسی لینک کالای پشتیبانی‌شده (اختیاری)",
  deliveryBody:
    "تحویل به اربیل، سلیمانیه، دهوک، کرکوک یا بغداد را برنامه‌ریزی کنید. هزینه‌های ارسال تا بررسی بسته تخمینی هستند.",
  received: "R&L درخواست شما را دریافت کرد و بررسی خواهد کرد. این تأیید خرید یا تحویل نیست.",
  trackHint: "از کد پیگیری R&L برای سفارش یا بسته خود استفاده کنید.",
  review: "پیش از ارسال بررسی کنید",
  details: "جزئیات کالا",
};
const de: JourneyCopy = {
  title: "Einkaufen. Anfragen.\nLieferung mit R&L.",
  body: "R&L entdecken. Produktlink senden.\nPrüfung vor Kauf oder Versand.\nEuropa → Kurdistan und Irak.",
  market: "Markt",
  shop: "Auf dem Marktplatz einkaufen",
  bring: "Für mich besorgen",
  help: "Hilfe",
  stores: "Europäische Shops",
  marketBody: "Bei R&L gelistete Produkte. Suchen und vergleichen Sie verfügbare Angebote.",
  marketEmpty:
    "Hier sind noch keine Produkte gelistet. Sie können einen Produktlink zur Prüfung senden.",
  marketError:
    "Die Marktplatzprodukte konnten nicht geladen werden. Öffnen Sie den Marktplatz erneut oder senden Sie einen Produktlink.",
  bringBody:
    "Haben Sie einen Produktlink? Sagen Sie uns, was Sie benötigen und wohin es gehen soll. R&L prüft Verfügbarkeit und Kosten vor der Bestätigung von Kauf oder Lieferung.",
  optional: "Größe, Farbe und Hinweise (optional)",
  linkCheck: "Unterstützten Produktlink prüfen (optional)",
  deliveryBody:
    "Planen Sie eine Lieferung nach Erbil, Sulaimaniyya, Duhok, Kirkuk oder Bagdad. Versandkosten bleiben Schätzungen bis zur Prüfung Ihres Pakets.",
  received:
    "R&L hat Ihre Anfrage erhalten und wird sie prüfen. Dies bestätigt noch keinen Kauf und keine Lieferung.",
  trackHint: "Verwenden Sie den R&L-Trackingcode für Ihre Bestellung oder Ihr Paket.",
  review: "Vor dem Senden prüfen",
  details: "Produktdetails",
};
const tr: JourneyCopy = {
  title: "Alışveriş ve talep.\nR&L ile teslimat.",
  body: "R&L’de keşfedin. Ürün linki gönderin.\nSatın alma ve gönderim öncesi inceleme.\nAvrupa → Kürdistan ve Irak.",
  market: "Pazar",
  shop: "Pazardan alışveriş yapın",
  bring: "Benim için getir",
  help: "Yardım",
  stores: "Avrupa mağazaları",
  marketBody: "R&L'de listelenen ürünler. Mevcut teklifleri arayın ve karşılaştırın.",
  marketEmpty: "Henüz burada listelenen ürün yok. İnceleme için ürün bağlantısı gönderebilirsiniz.",
  marketError: "Pazar ürünleri yüklenemedi. Pazarı tekrar açın veya ürün bağlantısı gönderin.",
  bringBody:
    "Ürün bağlantınız var mı? Ne istediğinizi ve nereye gönderileceğini söyleyin. R&L, satın alma veya teslimat onaylanmadan önce stok ve masrafları inceler.",
  optional: "Beden, renk ve notlar (isteğe bağlı)",
  linkCheck: "Desteklenen ürün bağlantısını kontrol edin (isteğe bağlı)",
  deliveryBody:
    "Erbil, Süleymaniye, Duhok, Kerkük veya Bağdat'a teslimatı planlayın. Kargo masrafları paketiniz incelenene kadar tahminidir.",
  received: "R&L talebinizi aldı ve inceleyecek. Bu, satın alma veya teslimat onayı değildir.",
  trackHint: "Siparişiniz veya paketiniz için R&L takip kodunu kullanın.",
  review: "Göndermeden önce inceleyin",
  details: "Ürün ayrıntıları",
};
const ku: JourneyCopy = {
  title: "Bikire. Daxwaz bike.\nGihandin bi R&L.",
  body: "R&L bibîne an lînka berhemê bişîne.\nBerî kirîn an şandinê kontrol dikin.\nEwropa → Kurdistan û Iraq.",
  market: "Bazar",
  shop: "Ji bazarê bikire",
  bring: "Ji min re bîne",
  help: "Alîkarî",
  stores: "Firotgehên Ewropayê",
  marketBody: "Berhemên li R&L hatine tomarkirin. Pêşniyarên berdest bigere û bide ber hev.",
  marketEmpty:
    "Hêj li vir berhem nehatine tomarkirin. Tu dikarî lînka berhemekê ji bo kontrolê bişînî.",
  marketError: "Berhemên bazarê nehatin barkirin. Bazarê dîsa veke an lînka berhemekê bişîne.",
  bringBody:
    "Lînka berhemekê heye? Bêje çi dixwazî û ji bo ku derê bê şandin. R&L hebûn û mesrefan berî piştrastkirina kirîn an gihandinê kontrol dike.",
  optional: "Mezinahî, reng û not (vebijarkî)",
  linkCheck: "Lînka berhemê ya piştgirîkirî kontrol bike (vebijarkî)",
  deliveryBody:
    "Gihandinê ji bo Hewlêr, Silêmanî, Dihok, Kerkûk an Bexda plan bike. Mesrefên şandinê heta kontrola pakêta te texmîn in.",
  received: "R&L daxwaza te wergirt û dê kontrol bike. Ev piştrastkirina kirîn an gihandinê nîne.",
  trackHint: "Koda şopandinê ya R&L ji bo fermana xwe an pakêta xwe bi kar bîne.",
  review: "Berî şandinê kontrol bike",
  details: "Hûrgiliyên berhemê",
};
export const JOURNEY_COPY: Record<Lang, JourneyCopy> = { en, ckb, ar, fa, de, tr, ku };
