import type { Lang } from "@/lib/langs";
import type { GoodId, StoreCategory, StoreCaution, StoreNote } from "@/lib/stores";

export type StoreCopy = {
  kicker: string;
  title: string;
  lede: string;
  search: string;
  allCategories: string;
  allCountries: string;
  germany: string;
  international: string;
  favorites: string;
  empty: string;
  external: string;
  notPartner: string;
  open: string;
  assist: string;
  shipOwn: string;
  proposed: string;
  order: string;
  sample: string;
  storesHeading: string;
  goods: Record<GoodId, string>;
  categories: Record<StoreCategory, string>;
  notes: Record<StoreNote, string>;
  cautions: Record<StoreCaution, string>;
  requestKicker: string;
  requestTitle: string;
  requestLede: string;
  buyTitle: string;
  shipTitle: string;
  url: string;
  urlHint: string;
  size: string;
  color: string;
  qty: string;
  dest: string;
  notesLabel: string;
  costs: string;
  rows: string[];
  awaiting: string;
  whoTitle: string;
  whoBody: string;
  shipBody: string;
  cautionTitle: string;
  submit: string;
  invalidUrl: string;
  wrongHost: string;
  sentTitle: string;
  sentBody: string;
  serviceLater: string;
  back: string;
};

const goodsEn: Record<GoodId, string> = {
  perfume: "Perfume",
  cream: "Face cream",
  sneakers: "Sneakers",
  dress: "Everyday dress",
  earbuds: "Wireless earbuds",
  kettle: "Electric kettle",
  baby: "Baby clothes",
  ball: "Football",
};

const en: StoreCopy = {
  kicker: "Look, then order",
  title: "Bazaar",
  lede: "See the pictures and order what you like. These are examples, not live shop stock. Nothing is bought until you approve a confirmed price.",
  search: "Search stores",
  allCategories: "All categories",
  allCountries: "All countries",
  germany: "Germany",
  international: "Outside Germany",
  favorites: "Favorites",
  empty: "No store matches.",
  external: "External store",
  notPartner: "Not an R&L partner",
  open: "Open official site",
  assist: "Ask R&L to buy",
  shipOwn: "I already bought it",
  proposed: "Proposed. Demand in Kurdistan is not verified.",
  order: "Order",
  sample: "Example, not live stock",
  storesHeading: "Stores",
  goods: goodsEn,
  categories: {
    beauty: "Cosmetics and care",
    fashion: "Fashion",
    electronics: "Electronics",
    home: "Home",
    baby: "Baby and family",
    sports: "Sports",
    general: "General",
  },
  notes: {
    amazon:
      "Amazon Creators API can search the catalog and build affiliate links after an Associates account and qualifying sales. It does not check out. We are not enrolled.",
    ebay: "eBay Browse and checkout APIs need partner approval. We are not approved. The official site stays the fallback.",
    otto: "OTTO's seller API is for merchants. Its affiliate program, via Awin, is for tracked links, not for placing orders. We have not joined.",
    zalando:
      "Zalando's zDirect API is for brands that sell on Zalando. It is not a catalog we can shop. No consumer feed is connected.",
    shein:
      "SHEIN Open Platform is for sellers and logistics partners, not for browsing as a customer. The affiliate page we found is not an approval we hold.",
    sephora:
      "Sephora DE has an Awin affiliate program for promotion links. It does not let us purchase. We are not members.",
    link: "No approved product API was found. We will not scrape the site. Only the official link and a manual request are offered.",
  },
  cautions: {
    perfume: "Perfume may be refused in air cargo.",
    aerosol: "Aerosols are often forbidden on aircraft.",
    battery: "Loose lithium batteries need a separate check.",
    cosmetics: "Liquids and cosmetics can be restricted.",
  },
  requestKicker: "Nothing is purchased yet",
  requestTitle: "Product link",
  requestLede:
    "Send the request. We confirm availability and the full cost before you approve anything.",
  buyTitle: "Purchasing assistance",
  shipTitle: "Ship a purchase I made",
  url: "Product link",
  urlHint: "Optional if you ordered from the bazaar. Paste a store link if you have one.",
  size: "Size",
  color: "Color",
  qty: "Quantity",
  dest: "Destination",
  notesLabel: "Notes",
  costs: "Cost, when it is known",
  rows: [
    "Product",
    "Delivery inside the store's country",
    "R&L service fee",
    "International shipping",
    "Currency conversion",
    "Customs",
  ],
  awaiting: "Awaiting confirmation",
  whoTitle: "Who does what",
  whoBody:
    "If you ask us to buy, R&L pays the store only after you approve a confirmed quote. You pay R&L. Cancellation, returns, and warranty follow that store's rules. Damage is a claim with photos, not an automatic refund.",
  shipBody:
    "If you already paid the store, R&L does not buy anything. We only collect and ship what you name. The store still owns its return rules.",
  cautionTitle: "May not fly",
  submit: "Send order",
  invalidUrl: "Enter a full https link, or leave it empty for a bazaar order.",
  wrongHost: "This link is not on that store's official site. Paste a link from the store's own website.",
  sentTitle: "Order saved on this device",
  sentBody: "No purchase was made and no price was confirmed.",
  serviceLater: "This service is not available yet. Email 2233rega@gmail.com.",
  back: "Back to the bazaar",
};

const ckb: StoreCopy = {
  ...en,
  kicker: "ببینە، حەزت لێی بێت، داوا بکە",
  title: "بازاڕ",
  lede: "وێنەکان ببینە و ئەوەی پێت خۆشە داوای بکە. ئەمە کۆگای ڕاستەوخۆی فرۆشگا نییە. هیچ شتێک ناکڕدرێت تا نرخەکە پشتڕاست بکەیتەوە.",
  search: "گەڕان لە فرۆشگاکان",
  allCategories: "هەموو جۆرەکان",
  allCountries: "هەموو وڵاتەکان",
  germany: "ئەڵمانیا",
  international: "دەرەوەی ئەڵمانیا",
  favorites: "دڵخوازەکان",
  empty: "هیچ فرۆشگایەک ناگونجێت.",
  external: "فرۆشگای دەرەکی",
  notPartner: "هاوبەشی R&L نییە",
  open: "کردنەوەی ماڵپەڕی فەرمی",
  assist: "R&L بیکڕێت",
  shipOwn: "خۆم کریوە",
  proposed: "پێشنیارە. خواستی کوردستان نەسەلمێنراوە.",
  order: "داواکردن",
  sample: "نموونەیە، کۆگای ڕاستەوخۆ نییە",
  storesHeading: "فرۆشگاکان",
  goods: {
    perfume: "عەتر",
    cream: "کرێمی دەموچاو",
    sneakers: "پێڵاوی وەرزشی",
    dress: "جلی ڕۆژانە",
    earbuds: "بیستۆکی بێوایەر",
    kettle: "کەتڵی کارەبایی",
    baby: "جلی منداڵ",
    ball: "تۆپی پێ",
  },
  categories: {
    beauty: "جوانکاری و چاودێری",
    fashion: "جلوبەرگ",
    electronics: "ئەلیکترۆنی",
    home: "ماڵ",
    baby: "منداڵ و خێزان",
    sports: "وەرزش",
    general: "گشتی",
  },
  notes: {
    amazon:
      "Creators API ی ئەمازۆن دوای هەژماری Associates و فرۆشتنی پێویست دەتوانێت کاتالۆگ بگەڕێت. نرخی کڕین ناکات. ئێمە تۆمار نەکراوین.",
    ebay: "API ی گەڕان و کڕینی eBay پەسەندی هاوبەش دەوێت. ئێمە پەسەند نەکراوین.",
    otto: "API ی فرۆشیاری OTTO بۆ بازرگانە. بەرنامەی ئەفیلیەیتەکەی بۆ لینکە، نەک بۆ کڕین. بەشدار نەبووین.",
    zalando:
      "zDirect ی Zalando بۆ ئەو براندانەیە کە لە Zalando دەفرۆشن. کاتالۆگێک نییە ئێمە لێی بکڕین.",
    shein: "Open Platform ی SHEIN بۆ فرۆشیارە، نەک بۆ گەڕانی کڕیار. پەسەندی ئێمە نییە.",
    sephora: "Sephora DE لە Awin لینکی بانگەشەی هەیە. ڕێگە نادات بکڕین. ئەندام نین.",
    link: "API ی پەسەندکراوی کاڵا نەدۆزرایەوە. ماڵپەڕەکە ناخورێنین.",
  },
  cautions: {
    perfume: "بۆن ڕەنگە لە باری ئاسمانی ڕەت بکرێتەوە.",
    aerosol: "سپرەی پەستان زۆرجار لە فڕۆکە قەدەغەیە.",
    battery: "پاتری لیتیۆمی بەتاڵ پشکنینی جیاواز دەوێت.",
    cosmetics: "شلە و جوانکاری دەکرێت سنووردار بێت.",
  },
  requestKicker: "هێشتا هیچ نەکڕدراوە",
  requestTitle: "داواکاری",
  requestLede: "داواکارییەکە بنێرە. بوون و تێچووی تەواو پێش پەسەندکردنی تۆ پشتڕاست دەکرێتەوە.",
  buyTitle: "داواکردنی کڕین",
  shipTitle: "گواستنەوەی کڕینێک کە خۆم کردوومە",
  url: "لینکی کاڵا",
  urlHint: "ئەگەر لە بازاڕەکە داوات کردووە، بەتاڵی بهێڵەرەوە. ئەگەر لینکت هەیە، بیلکێنە.",
  size: "قەبارە",
  color: "ڕەنگ",
  qty: "ژمارە",
  dest: "مەبەست",
  notesLabel: "تێبینی",
  costs: "تێچوو، کاتێک بزانرێت",
  rows: [
    "نرخی کاڵا",
    "گەیاندنی ناو وڵاتی فرۆشگا",
    "کرێی خزمەتگوزاریی R&L",
    "گواستنەوەی نێودەوڵەتی",
    "گۆڕینی دراو",
    "گومرگ",
  ],
  awaiting: "چاوەڕوانی پشتڕاستکردنەوە",
  whoTitle: "کێ چی دەکات",
  whoBody:
    "ئەگەر داوا بکەیت بکڕین، R&L تەنها دوای پەسەندکردنی نرخی دڵنیاکراو پارە بە فرۆشگا دەدات. تۆ پارە بە R&L دەدەیت. کاڵای شکاو سکاڵایە بە وێنە.",
  shipBody: "ئەگەر خۆت پارەت بە فرۆشگا داوە، R&L هیچ ناکڕێت. تەنها ئەوە دەنێرین کە ناوت بردووە.",
  cautionTitle: "ڕەنگە نەفڕێت",
  submit: "ناردنی داواکاری",
  invalidUrl: "لینکێکی تەواوی https بنووسە، یان بۆ داواکاریی بازاڕ بەتاڵی بهێڵەرەوە.",
  wrongHost: "ئەم لینکە لە ماڵپەڕی فەرمیی ئەو فرۆشگایە نییە.",
  sentTitle: "داواکارییەکە لەم ئامێرەدا پاشەکەوت کرا",
  sentBody: "هیچ کڕینێک نەکرا و هیچ نرخێک پشتڕاست نەکرایەوە.",
  serviceLater: "ئەم خزمەتگوزارییە هێشتا ئامادە نییە. ئیمەیڵ 2233rega@gmail.com.",
  back: "گەڕانەوە بۆ بازاڕ",
};

const ar: StoreCopy = {
  ...en,
  kicker: "شاهد، ثم اطلب",
  title: "البازار",
  lede: "شاهد الصور واطلب ما يعجبك. هذه أمثلة وليست مخزون المتجر المباشر. لا يُشترى شيء حتى توافق على سعر مؤكد.",
  search: "ابحث في المتاجر",
  allCategories: "كل الفئات",
  allCountries: "كل البلدان",
  germany: "ألمانيا",
  international: "خارج ألمانيا",
  favorites: "المفضلة",
  empty: "لا يوجد متجر مطابق.",
  external: "متجر خارجي",
  notPartner: "ليس شريكًا لـ R&L",
  open: "فتح الموقع الرسمي",
  assist: "اطلب من R&L الشراء",
  shipOwn: "اشتريته بنفسي",
  proposed: "مقترح. الطلب في كوردستان غير مثبت.",
  order: "اطلب",
  sample: "مثال، ليس مخزونًا مباشرًا",
  storesHeading: "المتاجر",
  goods: {
    perfume: "عطر",
    cream: "كريم وجه",
    sneakers: "حذاء رياضي",
    dress: "فستان يومي",
    earbuds: "سماعات لاسلكية",
    kettle: "غلاية كهربائية",
    baby: "ملابس أطفال",
    ball: "كرة قدم",
  },
  categories: {
    beauty: "تجميل وعناية",
    fashion: "أزياء",
    electronics: "إلكترونيات",
    home: "منزل",
    baby: "طفل وعائلة",
    sports: "رياضة",
    general: "عام",
  },
  notes: {
    amazon:
      "تتيح Amazon Creators API البحث في الكتالوج وإنشاء روابط تسويق بالعمولة بعد حساب Associates ومبيعات مؤهلة. لا تُتمّ الشراء. نحن غير مسجلين.",
    ebay: "تحتاج واجهات eBay للتصفح والدفع إلى موافقة شراكة. لم نحصل على موافقة. يبقى الموقع الرسمي هو البديل.",
    otto: "واجهة البائعين في OTTO مخصصة للتجار. برنامج التسويق بالعمولة عبر Awin للروابط المتتبَّعة، لا لتقديم الطلبات. لم ننضم.",
    zalando:
      "واجهة zDirect من Zalando مخصصة للعلامات التي تبيع على Zalando. ليست كتالوجًا نستطيع الشراء منه. لا توجد تغذية للمستهلك متصلة.",
    shein:
      "منصة SHEIN Open Platform مخصصة للبائعين وشركاء الخدمات اللوجستية، لا لتصفح العملاء. صفحة التسويق بالعمولة التي وجدناها ليست موافقة نملكها.",
    sephora:
      "لدى Sephora DE برنامج تسويق بالعمولة عبر Awin لروابط الترويج. لا يسمح لنا بالشراء. لسنا أعضاء.",
    link: "لم نجد واجهة منتجات معتمدة. لن نجمع بيانات الموقع آليًا. نقدم الرابط الرسمي وطلبًا يدويًا فقط.",
  },
  cautions: {
    perfume: "قد يُرفض العطر في الشحن الجوي.",
    aerosol: "البخاخات المضغوطة ممنوعة غالبًا على الطائرة.",
    battery: "بطاريات الليثيوم المنفصلة تحتاج فحصًا خاصًا.",
    cosmetics: "السوائل ومستحضرات التجميل قد تكون مقيدة.",
  },
  requestKicker: "لم يُشترَ شيء بعد",
  requestTitle: "طلب",
  requestLede: "أرسل الطلب. نؤكد التوفر والتكلفة قبل موافقتك.",
  buyTitle: "طلب شراء",
  shipTitle: "شحن شراء دفعته أنا",
  url: "رابط المنتج",
  urlHint: "اتركه فارغًا إن طلبت من البازار. الصق رابطًا إن وجد.",
  size: "المقاس",
  color: "اللون",
  qty: "الكمية",
  dest: "الوجهة",
  notesLabel: "ملاحظات",
  costs: "التكلفة حين تُعرف",
  rows: [
    "سعر المنتج",
    "توصيل داخل بلد المتجر",
    "أجر خدمة R&L",
    "شحن دولي",
    "تحويل العملة",
    "الجمارك",
  ],
  awaiting: "بانتظار التأكيد",
  whoTitle: "من يفعل ماذا",
  whoBody: "إذا طلبت الشراء، تدفع R&L للمتجر فقط بعد موافقتك على سعر مؤكد. أنت تدفع لـ R&L.",
  shipBody: "إذا دفعت للمتجر بنفسك، فإن R&L لا تشتري.",
  cautionTitle: "قد لا يُشحن جوًا",
  submit: "إرسال الطلب",
  invalidUrl: "أدخل رابط https أو اتركه فارغًا لطلب البازار.",
  wrongHost: "هذا الرابط ليس على الموقع الرسمي لذلك المتجر.",
  sentTitle: "حُفظ الطلب على هذا الجهاز",
  sentBody: "لم يتم شراء ولم يُؤكد أي سعر.",
  serviceLater: "هذه الخدمة غير متاحة بعد. راسل 2233rega@gmail.com.",
  back: "العودة إلى البازار",
};

const de: StoreCopy = {
  ...en,
  kicker: "Ansehen, dann bestellen",
  title: "Basar",
  lede: "Sehen Sie die Bilder und bestellen Sie, was Ihnen gefällt. Das sind Beispiele, kein Live-Lager. Gekauft wird erst nach einem bestätigten Preis.",
  search: "Läden suchen",
  allCategories: "Alle Kategorien",
  allCountries: "Alle Länder",
  germany: "Deutschland",
  international: "Außerhalb Deutschlands",
  favorites: "Favoriten",
  empty: "Kein Laden passt.",
  external: "Externer Laden",
  notPartner: "Kein Partner von R&L",
  open: "Offizielle Seite öffnen",
  assist: "R&L soll kaufen",
  shipOwn: "Ich habe schon gekauft",
  proposed: "Vorschlag. Nachfrage in Kurdistan ist nicht belegt.",
  order: "Bestellen",
  sample: "Beispiel, kein Live-Lager",
  storesHeading: "Läden",
  goods: {
    perfume: "Parfüm",
    cream: "Gesichtscreme",
    sneakers: "Sneaker",
    dress: "Alltagskleid",
    earbuds: "Kabellose Ohrhörer",
    kettle: "Wasserkocher",
    baby: "Babykleidung",
    ball: "Fußball",
  },
  categories: {
    beauty: "Kosmetik und Pflege",
    fashion: "Mode",
    electronics: "Elektronik",
    home: "Haushalt",
    baby: "Baby und Familie",
    sports: "Sport",
    general: "Allgemein",
  },
  notes: {
    amazon:
      "Die Amazon Creators API kann nach einem Associates-Konto und qualifizierten Verkäufen den Katalog durchsuchen und Affiliate-Links erstellen. Sie kauft nicht ein. Wir sind nicht angemeldet.",
    ebay: "Die Browse- und Checkout-APIs von eBay brauchen eine Partnerfreigabe. Wir sind nicht freigegeben. Die offizielle Website bleibt der Ausweg.",
    otto: "Die Händler-API von OTTO ist für Händler. Das Affiliate-Programm über Awin ist für getrackte Links, nicht für Bestellungen. Wir sind nicht beigetreten.",
    zalando:
      "Die zDirect-API von Zalando ist für Marken, die auf Zalando verkaufen. Sie ist kein Katalog, in dem wir einkaufen können. Kein Kunden-Feed ist verbunden.",
    shein:
      "Die SHEIN Open Platform ist für Verkäufer und Logistikpartner, nicht zum Stöbern als Kunde. Die gefundene Affiliate-Seite ist keine Freigabe, die wir haben.",
    sephora:
      "Sephora DE hat ein Awin-Affiliate-Programm für Werbelinks. Es erlaubt uns keine Käufe. Wir sind keine Mitglieder.",
    link: "Keine freigegebene Produkt-API gefunden. Wir lesen die Website nicht automatisiert aus. Angeboten werden nur der offizielle Link und eine manuelle Anfrage.",
  },
  cautions: {
    perfume: "Parfüm kann in Luftfracht abgelehnt werden.",
    aerosol: "Druckgas ist im Flugzeug oft verboten.",
    battery: "Lose Lithium-Batterien brauchen eine eigene Prüfung.",
    cosmetics: "Flüssigkeiten und Kosmetik können beschränkt sein.",
  },
  requestKicker: "Noch nichts gekauft",
  requestTitle: "Bestellung",
  requestLede:
    "Senden Sie die Bestellung. Wir bestätigen Verfügbarkeit und den vollen Preis, bevor Sie zustimmen.",
  buyTitle: "Kauf bestellen",
  shipTitle: "Einen eigenen Kauf senden",
  url: "Produktlink",
  urlHint: "Leer lassen, wenn Sie aus dem Basar bestellen. Sonst einen Link einfügen.",
  size: "Größe",
  color: "Farbe",
  qty: "Menge",
  dest: "Ziel",
  notesLabel: "Notiz",
  costs: "Kosten, sobald sie feststehen",
  rows: [
    "Produkt",
    "Zustellung im Land des Ladens",
    "Servicegebühr R&L",
    "Internationaler Versand",
    "Währung",
    "Zoll",
  ],
  awaiting: "Wartet auf Bestätigung",
  whoTitle: "Wer was tut",
  whoBody:
    "Wenn wir kaufen sollen, zahlt R&L den Laden erst nach Ihrer Freigabe eines bestätigten Preises. Sie zahlen R&L.",
  shipBody: "Wenn Sie den Laden schon bezahlt haben, kauft R&L nichts.",
  cautionTitle: "Kann möglicherweise nicht fliegen",
  submit: "Bestellung senden",
  invalidUrl: "Einen https-Link eingeben oder für eine Basar-Bestellung leer lassen.",
  wrongHost: "Dieser Link liegt nicht auf der offiziellen Seite dieses Ladens.",
  sentTitle: "Bestellung auf diesem Gerät gespeichert",
  sentBody: "Es wurde nichts gekauft und kein Preis bestätigt.",
  serviceLater: "Dieser Dienst ist noch nicht verfügbar. E-Mail 2233rega@gmail.com.",
  back: "Zurück zum Basar",
};

const ku: StoreCopy = {
  ...en,
  kicker: "Bibîne, paşê siparîş bike",
  title: "Bazar",
  lede: "Wêneyan bibîne û ya ku ji te re xweş e siparîş bike. Ev mînak in, ne stoka zindî. Tiştek nayê kirîn heta ku hûn bihayekî piştrast erê bikin.",
  order: "Siparîş",
  sample: "Mînak e, ne stoka zindî",
  storesHeading: "Firoşgeh",
  goods: {
    perfume: "Bêhn",
    cream: "Krema rû",
    sneakers: "Pêlavên werzîşê",
    dress: "Kinca rojane",
    earbuds: "Guhdanên bê têl",
    kettle: "Çaydankê elektrîkê",
    baby: "Kincên zarokan",
    ball: "Topa gogê",
  },
  notes: {
    amazon:
      "Amazon Creators API piştî hesabekî Associates û firotinên guncav dikare li katalogê bigere û lînkên affiliate çêke. Kirînê temam nake. Em ne endam in.",
    ebay: "APIyên Browse û checkouta eBayê pejirandina hevkariyê dixwazin. Em nehatine pejirandin. Malpera fermî rêya din dimîne.",
    otto: "APIya firoşkaran a OTTOyê ji bo bazirganan e. Bernameya wê ya affiliate bi rêya Awin ji bo lînkên şopandî ye, ne ji bo siparîşê. Em beşdar nebûne.",
    zalando:
      "APIya zDirect a Zalandoyê ji bo brandên ku li Zalandoyê difiroşin e. Ne katalogek e ku em jê bikirin. Tu feeda xerîdaran girêdayî nîne.",
    shein:
      "SHEIN Open Platform ji bo firoşkar û hevkarên lojîstîkê ye, ne ji bo gerîna xerîdaran. Rûpela affiliate ya ku me dît ne pejirandinek e ku me heye.",
    sephora:
      "Sephora DE bernameyeke affiliate ya Awin ji bo lînkên reklamê heye. Destûrê nade em bikirin. Em ne endam in.",
    link: "Tu APIya berhemê ya pejirandî nehat dîtin. Em malperê bi otomatîkî naxwînin. Tenê lînka fermî û daxwazek bi destan tê pêşkêşkirin.",
  },
  buyTitle: "Siparîşa kirînê",
  submit: "Siparîşê bişîne",
  back: "Vegere bazarê",
  sentTitle: "Siparîş li ser vî amûrî hate tomarkirin",
  sentBody: "Tu kirîn nehat kirin û tu biha nehat piştrastkirin.",
  serviceLater: "Ev xizmet hê ne amade ye. E-name 2233rega@gmail.com.",
  wrongHost: "Ev girêdan ne li ser malpera fermî ya wê firoşgehê ye. Girêdanekê ji malpera firoşgehê bi xwe binivîse.",
};

const fa: StoreCopy = {
  ...en,
  kicker: "ببین، بعد سفارش بده",
  title: "بازار",
  lede: "عکس‌ها را ببین و هر چه دوست داری سفارش بده. اینها نمونه است، موجودی زندهٔ فروشگاه نیست. تا قیمت قطعی را تأیید نکنی چیزی خریده نمی‌شود.",
  search: "جستجوی فروشگاه‌ها",
  allCategories: "همهٔ دسته‌ها",
  allCountries: "همهٔ کشورها",
  germany: "آلمان",
  international: "خارج از آلمان",
  favorites: "علاقه‌مندی‌ها",
  empty: "هیچ فروشگاهی پیدا نشد.",
  external: "فروشگاه بیرونی",
  notPartner: "شریک R&L نیست",
  open: "باز کردن سایت رسمی",
  assist: "از R&L بخواه بخرد",
  shipOwn: "خودم خریده‌ام",
  proposed: "پیشنهادی. تقاضا در کوردستان تأیید نشده است.",
  order: "سفارش",
  sample: "نمونه است، موجودی زنده نیست",
  storesHeading: "فروشگاه‌ها",
  goods: {
    perfume: "عطر",
    cream: "کرم صورت",
    sneakers: "کفش ورزشی",
    dress: "لباس روزمره",
    earbuds: "هدفون بی‌سیم",
    kettle: "کتری برقی",
    baby: "لباس بچه",
    ball: "توپ فوتبال",
  },
  categories: {
    beauty: "آرایشی و مراقبتی",
    fashion: "مد و پوشاک",
    electronics: "الکترونیک",
    home: "خانه",
    baby: "کودک و خانواده",
    sports: "ورزش",
    general: "عمومی",
  },
  notes: {
    amazon:
      "Amazon Creators API پس از داشتن حساب Associates و فروش‌های واجد شرایط، می‌تواند در کاتالوگ جستجو کند و لینک همکاری در فروش بسازد. پرداخت و خرید انجام نمی‌دهد. ما عضو نیستیم.",
    ebay: "APIهای Browse و پرداخت eBay به تأیید همکاری نیاز دارند. ما تأیید نشده‌ایم. سایت رسمی همچنان راه جایگزین است.",
    otto: "API فروشندگان OTTO برای بازرگانان است. برنامهٔ همکاری در فروش آن از طریق Awin برای لینک‌های ردیابی‌شده است، نه برای ثبت سفارش. ما عضو نشده‌ایم.",
    zalando:
      "API zDirect زالاندو برای برندهایی است که در Zalando می‌فروشند. کاتالوگی نیست که بتوانیم از آن خرید کنیم. هیچ فید مصرف‌کننده‌ای وصل نیست.",
    shein:
      "SHEIN Open Platform برای فروشندگان و شرکای لجستیک است، نه برای مرور به‌عنوان مشتری. صفحهٔ همکاری در فروشی که پیدا کردیم، تأییدیه‌ای نیست که داشته باشیم.",
    sephora:
      "Sephora DE یک برنامهٔ همکاری در فروش Awin برای لینک‌های تبلیغاتی دارد. اجازهٔ خرید به ما نمی‌دهد. ما عضو نیستیم.",
    link: "هیچ API محصول تأییدشده‌ای پیدا نشد. ما از سایت داده‌برداری خودکار نمی‌کنیم. فقط لینک رسمی و درخواست دستی ارائه می‌شود.",
  },
  cautions: {
    perfume: "ممکن است عطر در بار هوایی پذیرفته نشود.",
    aerosol: "اسپری‌های تحت فشار اغلب در هواپیما ممنوع‌اند.",
    battery: "باتری‌های لیتیومی جدا به بررسی جداگانه نیاز دارند.",
    cosmetics: "مایعات و لوازم آرایشی ممکن است محدودیت داشته باشند.",
  },
  requestKicker: "هنوز چیزی خریده نشده",
  requestTitle: "لینک محصول",
  requestLede:
    "درخواست را بفرست. پیش از آنکه چیزی را تأیید کنی، موجود بودن و هزینهٔ کامل را تأیید می‌کنیم.",
  buyTitle: "سفارش خرید",
  shipTitle: "ارسال خریدی که خودم کرده‌ام",
  url: "لینک محصول",
  urlHint: "اگر از بازار سفارش داده‌ای اختیاری است. اگر لینک فروشگاه داری، آن را اینجا بگذار.",
  size: "اندازه",
  color: "رنگ",
  qty: "تعداد",
  dest: "مقصد",
  notesLabel: "یادداشت",
  costs: "هزینه، وقتی مشخص شود",
  rows: [
    "محصول",
    "ارسال داخل کشور فروشگاه",
    "کارمزد خدمات R&L",
    "حمل بین‌المللی",
    "تبدیل ارز",
    "گمرک",
  ],
  awaiting: "در انتظار تأیید",
  whoTitle: "چه کسی چه می‌کند",
  whoBody:
    "اگر از ما بخواهی بخریم، R&L فقط پس از تأیید قیمت قطعی توسط تو به فروشگاه پول می‌دهد. تو به R&L پرداخت می‌کنی. لغو، مرجوعی و گارانتی طبق قوانین همان فروشگاه است. آسیب‌دیدگی با عکس ادعا می‌شود و بازپرداخت خودکار نیست.",
  shipBody:
    "اگر خودت به فروشگاه پول داده‌ای، R&L چیزی نمی‌خرد. ما فقط آنچه را نام می‌بری جمع‌آوری و ارسال می‌کنیم. قوانین مرجوعی همچنان با فروشگاه است.",
  cautionTitle: "ممکن است با هواپیما نرود",
  submit: "فرستادن سفارش",
  invalidUrl: "یک لینک کامل https وارد کن، یا برای سفارش از بازار خالی بگذار.",
  wrongHost: "این لینک روی سایت رسمی آن فروشگاه نیست. لینکی از سایت خود فروشگاه وارد کنید.",
  sentTitle: "سفارش روی این دستگاه ذخیره شد",
  sentBody: "خریدی انجام نشد و قیمتی تأیید نشد.",
  serviceLater: "این خدمات هنوز آماده نیست. ایمیل 2233rega@gmail.com.",
  back: "بازگشت به بازار",
};

const tr: StoreCopy = {
  ...en,
  kicker: "Gör, sonra sipariş et",
  title: "Pazar",
  lede: "Resimlere bak ve beğendiğini sipariş et. Bunlar örnektir, canlı stok değildir. Onaylı fiyat olmadan hiçbir şey satın alınmaz.",
  order: "Sipariş et",
  sample: "Örnek, canlı stok değil",
  storesHeading: "Mağazalar",
  goods: {
    perfume: "Parfüm",
    cream: "Yüz kremi",
    sneakers: "Spor ayakkabı",
    dress: "Günlük elbise",
    earbuds: "Kablosuz kulaklık",
    kettle: "Elektrikli kettle",
    baby: "Bebek kıyafeti",
    ball: "Futbol topu",
  },
  notes: {
    amazon:
      "Amazon Creators API, Associates hesabı ve uygun satışlardan sonra katalogda arama yapıp ortaklık bağlantısı oluşturabilir. Ödeme yapmaz. Kayıtlı değiliz.",
    ebay: "eBay Browse ve ödeme API'leri iş ortaklığı onayı gerektirir. Onaylı değiliz. Resmi site yedek yol olarak kalır.",
    otto: "OTTO'nun satıcı API'si tüccarlar içindir. Awin üzerinden ortaklık programı sipariş vermek için değil, izlenen bağlantılar içindir. Katılmadık.",
    zalando:
      "Zalando'nun zDirect API'si Zalando'da satış yapan markalar içindir. Alışveriş yapabileceğimiz bir katalog değildir. Bağlı bir tüketici akışı yok.",
    shein:
      "SHEIN Open Platform satıcılar ve lojistik ortakları içindir, müşteri olarak gezinmek için değil. Bulduğumuz ortaklık sayfası sahip olduğumuz bir onay değildir.",
    sephora:
      "Sephora DE'nin tanıtım bağlantıları için bir Awin ortaklık programı var. Satın almamıza izin vermez. Üye değiliz.",
    link: "Onaylı bir ürün API'si bulunamadı. Siteden otomatik veri çekmeyiz. Yalnızca resmi bağlantı ve elle talep sunulur.",
  },
  buyTitle: "Satın alma siparişi",
  submit: "Siparişi gönder",
  back: "Pazara dön",
  sentTitle: "Sipariş bu cihazda saklandı",
  sentBody: "Satın alma yapılmadı ve fiyat onaylanmadı.",
  serviceLater: "Bu hizmet henüz yok. E-posta 2233rega@gmail.com.",
  wrongHost: "Bu bağlantı o mağazanın resmi sitesinde değil. Mağazanın kendi sitesinden bir bağlantı yapıştırın.",
};

const ALL: Record<Lang, StoreCopy> = { en, ckb, ar, de, ku, fa, tr };

export function storeCopy(lang: Lang) {
  return ALL[lang];
}
