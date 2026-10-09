import type { Lang } from "@/lib/langs";

/**
 * Prohibited and restricted items page (7 languages). The prohibited list is the compliance
 * categories (src/lib/compliance/rules.ts) plus the goods already named in the contents
 * declaration. Nothing here is a legal ruling: restricted items are "not approved until staff
 * review", and route-dependent rules are described, not invented.
 */
export type ItemsCopy = {
  kicker: string;
  title: string;
  lede: string;
  link: string;
  prohibitedTitle: string;
  prohibitedBody: string;
  categories: Record<string, string>;
  alsoTitle: string;
  also: string[];
  restrictedTitle: string;
  restrictedBody: string;
  notApproved: string;
  restricted: { title: string; body: string }[];
  routeTitle: string;
  routeBody: string;
  route: { title: string; body: string }[];
  unsure: string;
  declareTitle: string;
  declareBody: string;
  autoCheck: string;
  ask: string;
  askBody: string;
  subject: string;
};

const en: ItemsCopy = {
  kicker: "Before you order",
  title: "Prohibited and restricted items",
  lede: "Check this before you order or send anything. If you are not sure, ask us first. This page is a guide, not a legal ruling: our team confirms every shipment.",
  link: "Prohibited and restricted items",
  prohibitedTitle: "Prohibited: we never buy or ship these",
  prohibitedBody: "Requests, store orders and marketplace listings with these items are refused automatically.",
  categories: {
    alcohol: "Alcohol",
    tobacco_smoking: "Tobacco and smoking products",
    vape: "Vapes and e-cigarettes",
    pork: "Pork",
    non_halal_food: "Non-halal food",
    drugs: "Drugs",
    gambling: "Gambling",
    adult: "Adult content",
  },
  alsoTitle: "Also not accepted (as stated in the contents declaration)",
  also: ["Weapons and ammunition", "Flammable or hazardous goods", "Cash", "Counterfeit goods"],
  restrictedTitle: "Restricted: only after staff review",
  restrictedBody: "These may be possible, but only after our team reviews the item. We may ask for documents such as an invoice or product information.",
  notApproved: "Not approved until staff review",
  restricted: [
    { title: "Lithium batteries", body: "Power banks, spare batteries and devices with batteries. Air carriers limit them; they may need another mode or may be refused." },
    { title: "Perfume and aerosols", body: "Perfume, sprays and other pressurised or flammable products are often not accepted by air." },
    { title: "Medicines and supplements", body: "Medicines, supplements and medical devices may need a prescription or other papers." },
    { title: "Cosmetics and liquids", body: "Checked for ingredients, quantity and leak-proof packaging." },
    { title: "Food, seeds and plants", body: "May need certificates. Must also be halal where it applies." },
    { title: "Phones, laptops and high-value items", body: "An invoice is needed for customs. Value affects duties." },
    { title: "Magnets, chemicals, blades and tools", body: "Reviewed case by case." },
  ],
  routeTitle: "Rules that depend on route, carrier or mode",
  routeBody: "The same item can be fine on one route and refused on another. We check this for each request.",
  route: [
    { title: "Origin", body: "Export rules differ by country." },
    { title: "Destination", body: "Import rules for Iraq and the Kurdistan Region can differ and can change." },
    { title: "Carrier", body: "Each carrier has its own list and can refuse items." },
    { title: "Mode", body: "Air is stricter than road for batteries, liquids and flammable goods." },
    { title: "Quantity and value", body: "Personal and commercial quantities can be treated differently at customs." },
  ],
  unsure: "We do not publish a complete legal list. If something is not listed or you are unsure, staff review is required and the item is not approved until we confirm it in your request.",
  declareTitle: "Your contents declaration is mandatory",
  declareBody: "Every request and booking asks you to confirm this:",
  autoCheck: "Our system also checks item names, descriptions and links against the prohibited list.",
  ask: "Contact us before ordering",
  askBody: "Send us the link or a description and we will tell you if we can take it.",
  subject: "Item check before ordering",
};

const ckb: ItemsCopy = {
  kicker: "پێش داواکردن",
  title: "کاڵا قەدەغە و سنووردارەکان",
  lede: "پێش داواکردن یان ناردنی هەر شتێک ئەمە بپشکنە. ئەگەر دڵنیا نیت، سەرەتا لێمان بپرسە. ئەم پەڕەیە ڕێنماییە، بڕیاری یاسایی نییە: تیمەکەمان هەموو بارێک پشتڕاست دەکاتەوە.",
  link: "کاڵا قەدەغە و سنووردارەکان",
  prohibitedTitle: "قەدەغە: هەرگیز ئەمانە ناکڕین و نانێرین",
  prohibitedBody: "داواکاری، داواکاری فرۆشگا و ڕیکلامی بازاڕ کە ئەم کاڵایانەی تێدابێت خۆکار ڕەت دەکرێتەوە.",
  categories: {
    alcohol: "ئەلکهول",
    tobacco_smoking: "تووتن و بەرهەمی جگەرەکێشان",
    vape: "ڤەیپ و جگەرەی ئەلیکترۆنی",
    pork: "گۆشتی بەراز",
    non_halal_food: "خواردنی ناحەڵاڵ",
    drugs: "ماددەی هۆشبەر",
    gambling: "قومار",
    adult: "ناوەڕۆکی گەورەساڵان",
  },
  alsoTitle: "هەروەها وەرناگیرێن (وەک لە ڕاگەیاندنی ناوەڕۆکدا هاتووە)",
  also: ["چەک و فیشەک", "کاڵای گڕگرتوو یان مەترسیدار", "پارەی نەختینە", "کاڵای ساختە"],
  restrictedTitle: "سنووردار: تەنها دوای پشکنینی تیم",
  restrictedBody: "ئەمانە لەوانەیە ببن، بەڵام تەنها دوای ئەوەی تیمەکەمان کاڵاکە دەپشکنێت. لەوانەیە بەڵگەنامە داوا بکەین وەک پسوڵە یان زانیاریی بەرهەم.",
  notApproved: "تا پشکنینی تیم پەسەند نەکراوە",
  restricted: [
    { title: "پاتریی لیسیۆم", body: "پاوەر بانک، پاتریی زیادە و ئامێری پاتریدار. هێڵە ئاسمانییەکان سنووریان بۆ داناون؛ لەوانەیە ڕێگایەکی تر پێویست بێت یان ڕەت بکرێتەوە." },
    { title: "عەتر و ئێرۆسۆڵ", body: "عەتر، سپرێ و بەرهەمی پەستاوکراو یان گڕگرتوو زۆرجار بە ئاسمانی وەرناگیرێن." },
    { title: "دەرمان و تەواوکەری خۆراک", body: "دەرمان، تەواوکەر و ئامێری پزیشکی لەوانەیە ڕەچەتە یان بەڵگەنامەی تریان پێویست بێت." },
    { title: "کۆزمێتیک و شلەمەنی", body: "بۆ پێکهاتە، بڕ و پاکێجی نەڕژاو دەپشکنرێن." },
    { title: "خواردن، تۆو و ڕووەک", body: "لەوانەیە بڕوانامەیان پێویست بێت. دەبێت حەڵاڵیش بن لە شوێنی پێویست." },
    { title: "مۆبایل، لاپتۆپ و کاڵای بەنرخ", body: "بۆ گومرگ پسوڵە پێویستە. نرخ کاریگەری لەسەر باج هەیە." },
    { title: "موگناتیس، کیمیایی، تیغ و ئامێر", body: "هەر یەکە بە جیا دەپشکنرێت." },
  ],
  routeTitle: "یاساکان بەپێی ڕێگا، کۆمپانیای گواستنەوە یان شێواز دەگۆڕێن",
  routeBody: "هەمان کاڵا لەوانەیە لە ڕێگایەک ڕێگەپێدراو بێت و لە ڕێگایەکی تر ڕەت بکرێتەوە. ئەمە بۆ هەر داواکارییەک دەپشکنین.",
  route: [
    { title: "سەرچاوە", body: "یاسای هەناردە لە وڵاتێکەوە بۆ وڵاتێکی تر جیاوازە." },
    { title: "مەبەست", body: "یاسای هاوردە بۆ عێراق و هەرێمی کوردستان دەکرێت جیاواز بێت و بگۆڕێت." },
    { title: "کۆمپانیای گواستنەوە", body: "هەر کۆمپانیایەک لیستی خۆی هەیە و دەتوانێت کاڵا ڕەت بکاتەوە." },
    { title: "شێواز", body: "ئاسمانی بۆ پاتری، شلەمەنی و کاڵای گڕگرتوو توندترە لە زەمینی." },
    { title: "بڕ و نرخ", body: "بڕی کەسی و بازرگانی لە گومرگ دەکرێت جیاواز مامەڵەیان لەگەڵ بکرێت." },
  ],
  unsure: "لیستێکی یاسایی تەواو بڵاو ناکەینەوە. ئەگەر شتێک لێرە نییە یان دڵنیا نیت، پشکنینی تیم پێویستە و کاڵاکە پەسەند نەکراوە تا لە داواکارییەکەتدا پشتڕاستی نەکەینەوە.",
  declareTitle: "ڕاگەیاندنی ناوەڕۆک پێویستە",
  declareBody: "هەموو داواکاری و حجزێک داوات لێدەکات ئەمە پشتڕاست بکەیتەوە:",
  autoCheck: "سیستەمەکەمان هەروەها ناو، وەسف و بەستەری کاڵا لەگەڵ لیستی قەدەغەکان بەراورد دەکات.",
  ask: "پێش داواکردن پەیوەندیمان پێوە بکە",
  askBody: "بەستەر یان وەسفمان بۆ بنێرە و پێت دەڵێین دەتوانین وەریبگرین یان نا.",
  subject: "Item check before ordering",
};

const ar: ItemsCopy = {
  kicker: "قبل الطلب",
  title: "المواد المحظورة والمقيّدة",
  lede: "راجع هذه الصفحة قبل أن تطلب أو ترسل أي شيء. إذا لم تكن متأكداً، اسألنا أولاً. هذه الصفحة إرشادية وليست حكماً قانونياً: فريقنا يؤكد كل شحنة.",
  link: "المواد المحظورة والمقيّدة",
  prohibitedTitle: "محظور: لا نشتري هذه ولا نشحنها أبداً",
  prohibitedBody: "تُرفض تلقائياً الطلبات وطلبات المتاجر وإعلانات السوق التي تحتوي على هذه المواد.",
  categories: {
    alcohol: "الكحول",
    tobacco_smoking: "التبغ ومنتجات التدخين",
    vape: "السجائر الإلكترونية",
    pork: "لحم الخنزير",
    non_halal_food: "طعام غير حلال",
    drugs: "المخدرات",
    gambling: "القمار",
    adult: "محتوى للبالغين",
  },
  alsoTitle: "وأيضاً غير مقبول (كما ورد في إقرار المحتويات)",
  also: ["الأسلحة والذخيرة", "المواد القابلة للاشتعال أو الخطرة", "النقود", "البضائع المقلدة"],
  restrictedTitle: "مقيّد: فقط بعد مراجعة الفريق",
  restrictedBody: "قد تكون ممكنة، لكن فقط بعد أن يراجع فريقنا السلعة. قد نطلب مستندات مثل الفاتورة أو معلومات المنتج.",
  notApproved: "غير موافق عليه حتى مراجعة الفريق",
  restricted: [
    { title: "بطاريات الليثيوم", body: "باور بانك والبطاريات الاحتياطية والأجهزة التي تحتوي على بطاريات. شركات الطيران تقيّدها؛ قد تحتاج إلى وسيلة أخرى أو قد تُرفض." },
    { title: "العطور والبخاخات", body: "العطور والبخاخات والمنتجات المضغوطة أو القابلة للاشتعال غالباً لا تُقبل جواً." },
    { title: "الأدوية والمكملات", body: "الأدوية والمكملات والأجهزة الطبية قد تحتاج إلى وصفة أو مستندات أخرى." },
    { title: "مستحضرات التجميل والسوائل", body: "تُفحص المكونات والكمية والتغليف المانع للتسرب." },
    { title: "الأغذية والبذور والنباتات", body: "قد تحتاج إلى شهادات. ويجب أن تكون حلالاً حيث ينطبق ذلك." },
    { title: "الهواتف والحواسيب والسلع الثمينة", body: "الفاتورة مطلوبة للجمارك. القيمة تؤثر على الرسوم." },
    { title: "المغناطيس والمواد الكيميائية والشفرات والأدوات", body: "تُراجع كل حالة على حدة." },
  ],
  routeTitle: "قواعد تعتمد على المسار أو الناقل أو وسيلة الشحن",
  routeBody: "قد تكون السلعة نفسها مقبولة في مسار ومرفوضة في آخر. نتحقق من ذلك لكل طلب.",
  route: [
    { title: "بلد المنشأ", body: "قواعد التصدير تختلف من بلد لآخر." },
    { title: "الوجهة", body: "قواعد الاستيراد إلى العراق وإقليم كوردستان قد تختلف وقد تتغير." },
    { title: "الناقل", body: "لكل ناقل قائمته الخاصة ويمكنه رفض المواد." },
    { title: "وسيلة الشحن", body: "الشحن الجوي أشد من البري بالنسبة للبطاريات والسوائل والمواد القابلة للاشتعال." },
    { title: "الكمية والقيمة", body: "قد تُعامل الكميات الشخصية والتجارية بشكل مختلف في الجمارك." },
  ],
  unsure: "لا ننشر قائمة قانونية كاملة. إذا لم يكن الشيء مذكوراً أو لم تكن متأكداً، فالمراجعة من الفريق مطلوبة والسلعة غير موافق عليها حتى نؤكدها في طلبك.",
  declareTitle: "إقرار المحتويات إلزامي",
  declareBody: "كل طلب وحجز يطلب منك تأكيد ما يلي:",
  autoCheck: "يتحقق نظامنا أيضاً من أسماء السلع وأوصافها وروابطها مقابل قائمة المحظورات.",
  ask: "تواصل معنا قبل الطلب",
  askBody: "أرسل لنا الرابط أو وصفاً وسنخبرك إن كان بإمكاننا قبولها.",
  subject: "Item check before ordering",
};

const ku: ItemsCopy = {
  kicker: "Berî fermanê",
  title: "Tiştên qedexe û sînorkirî",
  lede: "Berî ku tu tiştekî ferman bikî an bişînî vê kontrol bike. Heke ne bawer î, pêşî ji me bipirse. Ev rûpel rêber e, ne biryareke qanûnî ye: tîma me her barekê piştrast dike.",
  link: "Tiştên qedexe û sînorkirî",
  prohibitedTitle: "Qedexe: em van qet nakirin û naşînin",
  prohibitedBody: "Daxwaz, fermanên firoşgehê û îlanên bazarê yên bi van tiştan bixweber têne redkirin.",
  categories: {
    alcohol: "Alkol",
    tobacco_smoking: "Tûtin û berhemên cixarekişandinê",
    vape: "Vape û cixareyên elektronîk",
    pork: "Goştê beraz",
    non_halal_food: "Xwarina ne helal",
    drugs: "Madeyên hişbir",
    gambling: "Qumar",
    adult: "Naveroka mezinan",
  },
  alsoTitle: "Her wiha nayên qebûlkirin (wek di daxuyaniya naverokê de)",
  also: ["Çek û fîşek", "Tiştên şewatbar an xeternak", "Pereyê nexd", "Tiştên sexte"],
  restrictedTitle: "Sînorkirî: tenê piştî kontrola tîmê",
  restrictedBody: "Dibe ku ev gengaz bin, lê tenê piştî ku tîma me tiştê kontrol bike. Dibe ku em belgeyan wek fatûre an agahiya berhemê bixwazin.",
  notApproved: "Heta kontrola tîmê nehatiye pejirandin",
  restricted: [
    { title: "Bataryayên lîtyûmê", body: "Power bank, bataryayên zêde û amûrên bi batarya. Firokevan wan sînor dikin; dibe ku rêyeke din pêwîst be an werin redkirin." },
    { title: "Bîhn û aerosol", body: "Bîhn, spray û berhemên bi pest an şewatbar gelek caran bi hewayî nayên qebûlkirin." },
    { title: "Derman û temamker", body: "Derman, temamker û amûrên bijîşkî dibe ku reçete an belgeyên din bixwazin." },
    { title: "Kozmetîk û şilav", body: "Ji bo pêkhate, mîqdar û pakêta ku nerijê têne kontrolkirin." },
    { title: "Xwarin, tov û nebat", body: "Dibe ku sertîfîka pêwîst be. Divê li cihê pêwîst helal jî bin." },
    { title: "Telefon, laptop û tiştên bi nirx", body: "Ji bo gumrikê fatûre pêwîst e. Nirx bandorê li bacê dike." },
    { title: "Magnet, kîmyewî, tîx û amûr", body: "Her yek bi serê xwe tê kontrolkirin." },
  ],
  routeTitle: "Qaîdeyên li gorî rê, barhilgir an awayê şandinê",
  routeBody: "Heman tişt dikare li rêyekê baş be û li rêyeke din were redkirin. Em vê ji bo her daxwazê kontrol dikin.",
  route: [
    { title: "Jêder", body: "Qaîdeyên hinardekirinê ji welatekî bo welatekî cuda ne." },
    { title: "Armanc", body: "Qaîdeyên hawirdekirinê bo Iraq û Herêma Kurdistanê dikarin cuda bin û biguherin." },
    { title: "Barhilgir", body: "Her barhilgirek lîsteya xwe heye û dikare tiştan red bike." },
    { title: "Awa", body: "Hewayî ji bo batarya, şilav û tiştên şewatbar ji bejahî hişktir e." },
    { title: "Mîqdar û nirx", body: "Mîqdarên kesane û bazirganî dikarin li gumrikê cuda werin dîtin." },
  ],
  unsure: "Em lîsteyeke qanûnî ya temam belav nakin. Heke tiştek li vir tune be an tu ne bawer bî, kontrola tîmê pêwîst e û tişt nehatiye pejirandin heta ku em di daxwaza te de piştrast bikin.",
  declareTitle: "Daxuyaniya naverokê mecbûrî ye",
  declareBody: "Her daxwaz û rezervasyonek ji te dixwaze vê piştrast bikî:",
  autoCheck: "Sîstema me her wiha nav, danasîn û girêdanên tiştan li hember lîsteya qedexeyan kontrol dike.",
  ask: "Berî fermanê bi me re têkilî daynin",
  askBody: "Girêdanê an danasînekê ji me re bişîne û em ê bibêjin ka em dikarin wê qebûl bikin.",
  subject: "Item check before ordering",
};

const fa: ItemsCopy = {
  kicker: "پیش از سفارش",
  title: "کالاهای ممنوع و محدود",
  lede: "پیش از سفارش یا ارسال هر چیزی این را بررسی کنید. اگر مطمئن نیستید، اول از ما بپرسید. این صفحه راهنماست، نه حکم قانونی: تیم ما هر محموله را تأیید می‌کند.",
  link: "کالاهای ممنوع و محدود",
  prohibitedTitle: "ممنوع: این‌ها را هرگز نمی‌خریم و ارسال نمی‌کنیم",
  prohibitedBody: "درخواست‌ها، سفارش‌های فروشگاه و آگهی‌های بازار حاوی این کالاها خودکار رد می‌شوند.",
  categories: {
    alcohol: "الکل",
    tobacco_smoking: "تنباکو و محصولات دخانی",
    vape: "ویپ و سیگار الکترونیکی",
    pork: "گوشت خوک",
    non_halal_food: "غذای غیرحلال",
    drugs: "مواد مخدر",
    gambling: "قمار",
    adult: "محتوای بزرگسالان",
  },
  alsoTitle: "همچنین پذیرفته نمی‌شود (طبق اظهارنامه محتویات)",
  also: ["سلاح و مهمات", "کالای آتش‌گیر یا خطرناک", "پول نقد", "کالای تقلبی"],
  restrictedTitle: "محدود: فقط پس از بررسی تیم",
  restrictedBody: "این‌ها ممکن است امکان‌پذیر باشند، اما فقط پس از بررسی کالا توسط تیم ما. ممکن است مدارکی مانند فاکتور یا اطلاعات محصول بخواهیم.",
  notApproved: "تا بررسی تیم تأیید نشده",
  restricted: [
    { title: "باتری لیتیومی", body: "پاوربانک، باتری یدکی و دستگاه‌های باتری‌دار. شرکت‌های هوایی آن‌ها را محدود می‌کنند؛ ممکن است روش دیگری لازم باشد یا رد شوند." },
    { title: "عطر و اسپری", body: "عطر، اسپری و محصولات تحت فشار یا آتش‌گیر اغلب از راه هوایی پذیرفته نمی‌شوند." },
    { title: "دارو و مکمل", body: "دارو، مکمل و تجهیزات پزشکی ممکن است نسخه یا مدارک دیگری لازم داشته باشند." },
    { title: "آرایشی و مایعات", body: "از نظر ترکیبات، مقدار و بسته‌بندی ضدنشت بررسی می‌شوند." },
    { title: "غذا، بذر و گیاه", body: "ممکن است گواهی لازم باشد. در موارد لازم باید حلال هم باشند." },
    { title: "گوشی، لپ‌تاپ و کالای گران‌بها", body: "برای گمرک فاکتور لازم است. ارزش کالا بر عوارض اثر دارد." },
    { title: "آهنربا، مواد شیمیایی، تیغه و ابزار", body: "هر مورد جداگانه بررسی می‌شود." },
  ],
  routeTitle: "قوانینی که به مسیر، حمل‌کننده یا روش بستگی دارند",
  routeBody: "یک کالا ممکن است در یک مسیر مجاز و در مسیر دیگر رد شود. این را برای هر درخواست بررسی می‌کنیم.",
  route: [
    { title: "مبدأ", body: "قوانین صادرات در هر کشور متفاوت است." },
    { title: "مقصد", body: "قوانین واردات به عراق و اقلیم کردستان ممکن است متفاوت باشد و تغییر کند." },
    { title: "حمل‌کننده", body: "هر حمل‌کننده فهرست خود را دارد و می‌تواند کالا را رد کند." },
    { title: "روش", body: "حمل هوایی برای باتری، مایعات و کالای آتش‌گیر سخت‌گیرتر از زمینی است." },
    { title: "مقدار و ارزش", body: "مقادیر شخصی و تجاری ممکن است در گمرک متفاوت بررسی شوند." },
  ],
  unsure: "ما فهرست قانونی کاملی منتشر نمی‌کنیم. اگر چیزی اینجا نیست یا مطمئن نیستید، بررسی تیم لازم است و کالا تا تأیید ما در درخواست شما تأیید نشده است.",
  declareTitle: "اظهارنامه محتویات الزامی است",
  declareBody: "هر درخواست و رزرو از شما می‌خواهد این را تأیید کنید:",
  autoCheck: "سیستم ما همچنین نام، توضیح و لینک کالاها را با فهرست ممنوعه مقایسه می‌کند.",
  ask: "پیش از سفارش با ما تماس بگیرید",
  askBody: "لینک یا توضیح را برای ما بفرستید تا بگوییم می‌توانیم آن را بپذیریم یا نه.",
  subject: "Item check before ordering",
};

const de: ItemsCopy = {
  kicker: "Vor der Bestellung",
  title: "Verbotene und eingeschränkte Artikel",
  lede: "Prüfen Sie dies, bevor Sie etwas bestellen oder senden. Wenn Sie unsicher sind, fragen Sie uns zuerst. Diese Seite ist eine Orientierung, keine rechtliche Entscheidung: Unser Team bestätigt jede Sendung.",
  link: "Verbotene und eingeschränkte Artikel",
  prohibitedTitle: "Verboten: Das kaufen und versenden wir nie",
  prohibitedBody: "Anfragen, Shop-Bestellungen und Marktplatz-Angebote mit diesen Artikeln werden automatisch abgelehnt.",
  categories: {
    alcohol: "Alkohol",
    tobacco_smoking: "Tabak und Raucherprodukte",
    vape: "Vapes und E-Zigaretten",
    pork: "Schweinefleisch",
    non_halal_food: "Nicht-halal Lebensmittel",
    drugs: "Drogen",
    gambling: "Glücksspiel",
    adult: "Inhalte für Erwachsene",
  },
  alsoTitle: "Ebenfalls nicht angenommen (wie in der Inhaltserklärung)",
  also: ["Waffen und Munition", "Entzündliche oder gefährliche Güter", "Bargeld", "Gefälschte Waren"],
  restrictedTitle: "Eingeschränkt: nur nach Prüfung durch das Team",
  restrictedBody: "Diese können möglich sein, aber erst nachdem unser Team den Artikel geprüft hat. Wir können Unterlagen wie Rechnung oder Produktinformationen anfordern.",
  notApproved: "Nicht freigegeben bis zur Prüfung",
  restricted: [
    { title: "Lithiumbatterien", body: "Powerbanks, Ersatzakkus und Geräte mit Akku. Luftfrachtführer beschränken sie; ggf. anderer Versandweg nötig oder Ablehnung." },
    { title: "Parfüm und Aerosole", body: "Parfüm, Sprays und andere Druck- oder entzündliche Produkte werden per Luftfracht oft nicht angenommen." },
    { title: "Medikamente und Nahrungsergänzung", body: "Medikamente, Nahrungsergänzung und Medizinprodukte können ein Rezept oder andere Papiere erfordern." },
    { title: "Kosmetik und Flüssigkeiten", body: "Geprüft werden Inhaltsstoffe, Menge und auslaufsichere Verpackung." },
    { title: "Lebensmittel, Samen und Pflanzen", body: "Können Zertifikate erfordern. Wo zutreffend, müssen sie halal sein." },
    { title: "Handys, Laptops und Wertsachen", body: "Für den Zoll ist eine Rechnung nötig. Der Wert beeinflusst die Abgaben." },
    { title: "Magnete, Chemikalien, Klingen und Werkzeug", body: "Einzelfallprüfung." },
  ],
  routeTitle: "Regeln je nach Route, Transporteur oder Versandart",
  routeBody: "Derselbe Artikel kann auf einer Route erlaubt und auf einer anderen abgelehnt sein. Wir prüfen das für jede Anfrage.",
  route: [
    { title: "Herkunft", body: "Ausfuhrregeln sind je nach Land verschieden." },
    { title: "Ziel", body: "Einfuhrregeln für den Irak und die Region Kurdistan können abweichen und sich ändern." },
    { title: "Transporteur", body: "Jeder Transporteur hat eine eigene Liste und kann Artikel ablehnen." },
    { title: "Versandart", body: "Luftfracht ist bei Batterien, Flüssigkeiten und entzündlichen Gütern strenger als Straße." },
    { title: "Menge und Wert", body: "Private und gewerbliche Mengen können beim Zoll unterschiedlich behandelt werden." },
  ],
  unsure: "Wir veröffentlichen keine vollständige Rechtsliste. Wenn etwas nicht aufgeführt ist oder Sie unsicher sind, ist eine Prüfung durch das Team nötig und der Artikel ist nicht freigegeben, bis wir ihn in Ihrer Anfrage bestätigen.",
  declareTitle: "Ihre Inhaltserklärung ist Pflicht",
  declareBody: "Jede Anfrage und Buchung verlangt diese Bestätigung:",
  autoCheck: "Unser System prüft außerdem Artikelnamen, Beschreibungen und Links gegen die Verbotsliste.",
  ask: "Vor der Bestellung kontaktieren",
  askBody: "Senden Sie uns den Link oder eine Beschreibung, und wir sagen Ihnen, ob wir es annehmen können.",
  subject: "Item check before ordering",
};

const tr: ItemsCopy = {
  kicker: "Sipariş öncesi",
  title: "Yasak ve kısıtlı ürünler",
  lede: "Bir şey sipariş etmeden veya göndermeden önce bunu kontrol et. Emin değilsen önce bize sor. Bu sayfa bir rehberdir, yasal karar değildir: ekibimiz her gönderiyi onaylar.",
  link: "Yasak ve kısıtlı ürünler",
  prohibitedTitle: "Yasak: bunları asla satın almaz ve göndermeyiz",
  prohibitedBody: "Bu ürünleri içeren talepler, mağaza siparişleri ve pazar ilanları otomatik olarak reddedilir.",
  categories: {
    alcohol: "Alkol",
    tobacco_smoking: "Tütün ve sigara ürünleri",
    vape: "Vape ve elektronik sigara",
    pork: "Domuz eti",
    non_halal_food: "Helal olmayan gıda",
    drugs: "Uyuşturucu",
    gambling: "Kumar",
    adult: "Yetişkin içerik",
  },
  alsoTitle: "Ayrıca kabul edilmez (içerik beyanında belirtildiği gibi)",
  also: ["Silah ve mühimmat", "Yanıcı veya tehlikeli maddeler", "Nakit para", "Sahte ürünler"],
  restrictedTitle: "Kısıtlı: yalnızca ekip incelemesinden sonra",
  restrictedBody: "Bunlar mümkün olabilir, ancak yalnızca ekibimiz ürünü inceledikten sonra. Fatura veya ürün bilgisi gibi belgeler isteyebiliriz.",
  notApproved: "Ekip incelemesine kadar onaylı değil",
  restricted: [
    { title: "Lityum piller", body: "Powerbank, yedek pil ve pilli cihazlar. Hava taşıyıcıları bunları sınırlar; başka bir yol gerekebilir veya reddedilebilir." },
    { title: "Parfüm ve aerosoller", body: "Parfüm, sprey ve diğer basınçlı veya yanıcı ürünler havayolu ile çoğu zaman kabul edilmez." },
    { title: "İlaç ve takviyeler", body: "İlaç, takviye ve tıbbi cihazlar reçete veya başka belgeler gerektirebilir." },
    { title: "Kozmetik ve sıvılar", body: "İçerik, miktar ve sızdırmaz ambalaj açısından kontrol edilir." },
    { title: "Gıda, tohum ve bitkiler", body: "Sertifika gerekebilir. Gerektiği yerde helal olmalıdır." },
    { title: "Telefon, dizüstü ve değerli ürünler", body: "Gümrük için fatura gerekir. Değer vergileri etkiler." },
    { title: "Mıknatıs, kimyasal, bıçak ve aletler", body: "Her durum ayrı incelenir." },
  ],
  routeTitle: "Güzergâh, taşıyıcı veya taşıma şekline bağlı kurallar",
  routeBody: "Aynı ürün bir güzergâhta uygun, diğerinde reddedilebilir. Bunu her talep için kontrol ederiz.",
  route: [
    { title: "Çıkış", body: "İhracat kuralları ülkeden ülkeye değişir." },
    { title: "Varış", body: "Irak ve Kürdistan Bölgesi ithalat kuralları farklı olabilir ve değişebilir." },
    { title: "Taşıyıcı", body: "Her taşıyıcının kendi listesi vardır ve ürünleri reddedebilir." },
    { title: "Taşıma şekli", body: "Hava yolu; pil, sıvı ve yanıcı ürünlerde kara yolundan daha katıdır." },
    { title: "Miktar ve değer", body: "Kişisel ve ticari miktarlar gümrükte farklı değerlendirilebilir." },
  ],
  unsure: "Tam bir yasal liste yayınlamıyoruz. Bir şey listede yoksa veya emin değilsen, ekip incelemesi gerekir ve ürün, talebinde onaylayana kadar onaylı değildir.",
  declareTitle: "İçerik beyanı zorunludur",
  declareBody: "Her talep ve rezervasyon bunu onaylamanı ister:",
  autoCheck: "Sistemimiz ayrıca ürün adlarını, açıklamalarını ve bağlantılarını yasak listesine göre kontrol eder.",
  ask: "Sipariş vermeden önce bize ulaş",
  askBody: "Bağlantıyı veya bir açıklamayı gönder, kabul edip edemeyeceğimizi söyleyelim.",
  subject: "Item check before ordering",
};

export const ITEMS_COPY: Record<Lang, ItemsCopy> = { ckb, ku, ar, fa, de, tr, en };
