/**
 * Impressum, privacy and terms in all 7 languages.
 * Privacy describes what the app really does. Impressum and terms are legal
 * structure templates: everything in [brackets] is a placeholder until the
 * owner supplies the company details. Never fill them with invented data.
 */
import type { Lang } from "@/lib/langs";

export type LegalSection = { h: string; p: string[] };
export type LegalDoc = { title: string; lede: string; sections: LegalSection[] };
export type LegalCopy = {
  links: { impressum: string; privacy: string; terms: string };
  pending: string;
  updated: string;
  impressum: LegalDoc;
  privacy: LegalDoc;
  terms: LegalDoc;
};

const MAIL = "2233rega@gmail.com";

export const LEGAL_COPY: Record<Lang, LegalCopy> = {
  en: {
    links: { impressum: "Legal notice", privacy: "Privacy", terms: "Terms" },
    pending: "Some legal details are still pending and will be added before launch. Items in [brackets] are placeholders.",
    updated: "Last updated: 9 October 2026",
    impressum: {
      title: "Legal notice (Impressum)",
      lede: "Provider information.",
      sections: [
        { h: "Provider", p: ["[Company name — pending]", "[Legal form — pending]", "[Street and number — pending]", "[Postcode, city, country — pending]"] },
        { h: "Represented by", p: ["[Name of the authorised representative — pending]"] },
        { h: "Contact", p: [`Email: ${MAIL}`] },
        { h: "Register", p: ["[Register court and registration number — pending]", "[VAT ID, if any — pending]"] },
        { h: "Responsible for content", p: ["[Name and address — pending]"] },
      ],
    },
    privacy: {
      title: "Privacy",
      lede: "What this app actually does with your data.",
      sections: [
        { h: "Who is responsible", p: [`R&L, [company name and address — pending]. Contact: ${MAIL}.`] },
        { h: "Hosting", p: ["The app runs on Cloudflare Workers. Cloudflare processes every request, including your IP address and browser details, to deliver the page and protect it from abuse. Our Worker keeps technical request logs for troubleshooting."] },
        { h: "No tracking", p: ["We use no analytics, advertising or social-media trackers. Fonts and images are served from our own site."] },
        { h: "Stored on your device", p: ["Language: rega-lang, rega-lang-v3. Bazaar/Delivery choice: rl-service (also a cookie, so the page opens the same way). Favourite stores: rl-store-favs. Saved quotes: rega-held. Recent searches: rl-recent-searches. A booking draft while you move to the contact page: rega-booking (this session only). An offline copy of the app (service worker). These stay in your browser; clearing the site data deletes them."] },
        { h: "R&L AI photo identification", p: ["When you use /ai, your photo is sent to Cloudflare Workers AI to identify the item and is processed only for that request; we do not store it. To enforce usage limits we keep short-lived counters keyed to your IP address."] },
        { h: "Prices, tracking and request limits", p: ["Prices are calculated on our server and signed for 30 minutes. Quote and tracking requests are rate-limited per IP address by Cloudflare; we do not store these IP addresses."] },
        { h: "Phone sign-in (once enabled)", p: ["Phone sign-in is not active yet. Once enabled, we store your phone number, the name you give, your requests (addresses, items, the restricted-items declaration) and a session cookie (rl_phone, up to 30 days) in our database to process your orders. One-time codes are short-lived."] },
        { h: "Email", p: [`If you write to ${MAIL}, your message is handled in Gmail (Google).`] },
        { h: "Links to shops", p: ["Links to stores and idealo open their sites; their privacy policies apply there."] },
        { h: "Your rights", p: [`You can ask for access to, correction or deletion of your data at ${MAIL}.`] },
      ],
    },
    terms: {
      title: "Terms of use",
      lede: "Template — final terms pending.",
      sections: [
        { h: "Scope", p: ["These terms apply to using the R&L app. [Contracting company — pending]."] },
        { h: "Service", p: ["R&L helps you send parcels between Europe, Kurdistan and Iraq and request purchases from European online shops. Shops linked in the Bazaar are not R&L partners."] },
        { h: "Prices and quotes", p: ["Prices shown are estimates calculated from chargeable weight. A quote is valid for 30 minutes. The final price is confirmed with you before collection. Customs duties are not included."] },
        { h: "Prohibited items", p: ["You must not send prohibited or restricted items and must describe the contents truthfully. You confirm this with the declaration before each request."] },
        { h: "Liability", p: ["[Liability terms — pending]"] },
        { h: "Governing law", p: ["[Governing law and place of jurisdiction — pending]"] },
        { h: "Contact", p: [MAIL] },
      ],
    },
  },
  ckb: {
    links: { impressum: "زانیاریی یاسایی", privacy: "تایبەتمەندی", terms: "مەرجەکان" },
    pending: "هەندێک وردەکاریی یاسایی هێشتا چاوەڕوانن و پێش دەستپێکردن زیاد دەکرێن. ئەو بەشانەی لەناو [کەوانە]دان شوێنگرن.",
    updated: "دوایین نوێکردنەوە: ٩ی تشرینی یەکەمی ٢٠٢٦",
    impressum: {
      title: "زانیاریی یاسایی (Impressum)",
      lede: "زانیاریی دابینکەر.",
      sections: [
        { h: "دابینکەر", p: ["[ناوی کۆمپانیا — چاوەڕوانە]", "[شێوەی یاسایی — چاوەڕوانە]", "[شەقام و ژمارە — چاوەڕوانە]", "[کۆدی پۆستە، شار، وڵات — چاوەڕوانە]"] },
        { h: "نوێنەر", p: ["[ناوی نوێنەری ڕێگەپێدراو — چاوەڕوانە]"] },
        { h: "پەیوەندی", p: [`ئیمەیڵ: ${MAIL}`] },
        { h: "تۆمار", p: ["[دادگای تۆمار و ژمارەی تۆمار — چاوەڕوانە]", "[ژمارەی باج (VAT)، ئەگەر هەبێت — چاوەڕوانە]"] },
        { h: "بەرپرسی ناوەڕۆک", p: ["[ناو و ناونیشان — چاوەڕوانە]"] },
      ],
    },
    privacy: {
      title: "تایبەتمەندی",
      lede: "ئەم ئەپە بە ڕاستی چی لە زانیارییەکانت دەکات.",
      sections: [
        { h: "بەرپرسیار", p: [`R&L، [ناو و ناونیشانی کۆمپانیا — چاوەڕوانە]. پەیوەندی: ${MAIL}.`] },
        { h: "میوانداری", p: ["ئەپەکە لەسەر Cloudflare Workers کار دەکات. Cloudflare هەموو داواکارییەک پرۆسێس دەکات، لەوانە ناونیشانی IP و زانیاریی وێبگەڕەکەت، بۆ گەیاندنی پەڕەکە و پاراستنی لە خراپبەکارهێنان. Workerەکەمان تۆماری تەکنیکیی داواکارییەکان بۆ چارەسەرکردنی کێشە هەڵدەگرێت."] },
        { h: "بێ شوێنکەوتن", p: ["هیچ ئامرازێکی شیکاری، ڕیکلام یان تۆڕی کۆمەڵایەتی بەکارناهێنین. فۆنت و وێنەکان لە ماڵپەڕی خۆمانەوە دێن."] },
        { h: "لەسەر ئامێرەکەت هەڵدەگیرێت", p: ["زمان: rega-lang، rega-lang-v3. هەڵبژاردنی بازاڕ/گەیاندن: rl-service (هەروەها وەک کووکی، بۆ ئەوەی پەڕەکە بە هەمان شێوە بکرێتەوە). فرۆشگا دڵخوازەکان: rl-store-favs. نرخە هەڵگیراوەکان: rega-held. گەڕانە دوایینەکان: rl-recent-searches. ڕەشنووسی حیجز کاتێک دەچیتە پەڕەی پەیوەندی: rega-booking (تەنها بۆ ئەم دانیشتنە). کۆپییەکی ئۆفلاینی ئەپەکە (service worker). ئەمانە لە وێبگەڕەکەتدا دەمێننەوە؛ بە سڕینەوەی داتای ماڵپەڕەکە دەیانسڕیتەوە."] },
        { h: "R&L AI — ناسینەوە بە وێنە", p: ["کاتێک /ai بەکاردەهێنیت، وێنەکەت بۆ Cloudflare Workers AI دەنێردرێت بۆ ناسینەوەی کاڵاکە و تەنها بۆ ئەو داواکارییە پرۆسێس دەکرێت؛ هەڵیناگرین. بۆ سنووری بەکارهێنان، ژمێرەری کورتخایەن بە پێی ناونیشانی IP هەڵدەگرین."] },
        { h: "نرخ، شوێنپێکردن و سنووری داواکاری", p: ["نرخەکان لەسەر سێرڤەرەکەمان حیساب دەکرێن و بۆ ٣٠ خولەک واژۆ دەکرێن. داواکاریی نرخ و شوێنپێکردن بە پێی ناونیشانی IP لەلایەن Cloudflare سنووردار دەکرێن؛ ئەم ناونیشانانە هەڵناگرین."] },
        { h: "چوونەژوورەوە بە ژمارەی مۆبایل (کاتێک چالاک دەبێت)", p: ["چوونەژوورەوە بە مۆبایل هێشتا چالاک نییە. دوای چالاکبوون، ژمارەی مۆبایل، ئەو ناوەی دەینووسیت، داواکارییەکانت (ناونیشان، کاڵا، ڕاگەیاندنی کاڵای قەدەغە) و کووکیی دانیشتن (rl_phone، تا ٣٠ ڕۆژ) لە بنکەدراوەکەماندا هەڵدەگرین بۆ جێبەجێکردنی داواکارییەکانت. کۆدە یەکجارییەکان کورتخایەنن."] },
        { h: "ئیمەیڵ", p: [`ئەگەر بۆ ${MAIL} بنووسیت، نامەکەت لە Gmail (Google) مامەڵەی لەگەڵ دەکرێت.`] },
        { h: "لینکی فرۆشگاکان", p: ["لینکی فرۆشگاکان و idealo ماڵپەڕی خۆیان دەکەنەوە؛ لەوێ سیاسەتی تایبەتمەندیی ئەوان جێبەجێ دەبێت."] },
        { h: "مافەکانت", p: [`دەتوانیت لە ڕێگەی ${MAIL} داوای بینین، ڕاستکردنەوە یان سڕینەوەی زانیارییەکانت بکەیت.`] },
      ],
    },
    terms: {
      title: "مەرجەکانی بەکارهێنان",
      lede: "نموونە — مەرجە کۆتاییەکان چاوەڕوانن.",
      sections: [
        { h: "بوار", p: ["ئەم مەرجانە بۆ بەکارهێنانی ئەپی R&L جێبەجێ دەبن. [کۆمپانیای گرێبەست — چاوەڕوانە]."] },
        { h: "خزمەتگوزاری", p: ["R&L یارمەتیت دەدات بار لە نێوان ئەوروپا، کوردستان و عێراق بنێریت و داوای کڕین لە فرۆشگا ئۆنلاینە ئەوروپییەکان بکەیت. ئەو فرۆشگایانەی لە بازاڕدا لینکیان هەیە هاوبەشی R&L نین."] },
        { h: "نرخ و پێشنیاری نرخ", p: ["نرخە پیشاندراوەکان خەمڵاندنن و لە کێشی حیسابکراو دەردەهێنرێن. هەر نرخێک ٣٠ خولەک بەکارە. نرخی کۆتایی پێش وەرگرتنی بارەکە لەگەڵت پشتڕاست دەکرێتەوە. باجی گومرگ لەناو نرخەکەدا نییە."] },
        { h: "کاڵای قەدەغە", p: ["نابێت کاڵای قەدەغە یان سنووردار بنێریت و دەبێت ناوەڕۆکەکە بە ڕاستی بنووسیت. پێش هەر داواکارییەک بە ڕاگەیاندنەکە ئەمە پشتڕاست دەکەیتەوە."] },
        { h: "بەرپرسیارێتی", p: ["[مەرجەکانی بەرپرسیارێتی — چاوەڕوانە]"] },
        { h: "یاسای جێبەجێکراو", p: ["[یاسای جێبەجێکراو و شوێنی دادگا — چاوەڕوانە]"] },
        { h: "پەیوەندی", p: [MAIL] },
      ],
    },
  },
  ku: {
    links: { impressum: "Agahiyên qanûnî", privacy: "Nepenîtî", terms: "Merc" },
    pending: "Hin hûrguliyên qanûnî hêj li bendê ne û berî destpêkê dê bên zêdekirin. Tiştên di nav [kevanan] de cihgir in.",
    updated: "Nûkirina dawî: 9ê Cotmeha 2026an",
    impressum: {
      title: "Agahiyên qanûnî (Impressum)",
      lede: "Agahiyên pêşkêşkerê.",
      sections: [
        { h: "Pêşkêşker", p: ["[Navê şirketê — li bendê ye]", "[Forma qanûnî — li bendê ye]", "[Kolan û hejmar — li bendê ye]", "[Koda postê, bajar, welat — li bendê ye]"] },
        { h: "Nûner", p: ["[Navê nûnerê destûrdar — li bendê ye]"] },
        { h: "Têkilî", p: [`E-name: ${MAIL}`] },
        { h: "Tomar", p: ["[Dadgeha tomarê û hejmara tomarê — li bendê ye]", "[Hejmara bacê (VAT), heke hebe — li bendê ye]"] },
        { h: "Berpirsiyarê naverokê", p: ["[Nav û navnîşan — li bendê ye]"] },
      ],
    },
    privacy: {
      title: "Nepenîtî",
      lede: "Ev sepan bi rastî bi daneyên te çi dike.",
      sections: [
        { h: "Berpirsiyar", p: [`R&L, [nav û navnîşana şirketê — li bendê ye]. Têkilî: ${MAIL}.`] },
        { h: "Mazûvanî", p: ["Sepan li ser Cloudflare Workers dixebite. Cloudflare her daxwazê pêvajo dike, di nav de navnîşana IP û agahiyên gerokê, da ku rûpelê bigihîne û ji destdirêjiyê biparêze. Worker-ê me tomarên teknîkî yên daxwazan ji bo çareserkirina pirsgirêkan diparêze."] },
        { h: "Bê şopandin", p: ["Em tu amûrên analîzê, reklamê an torên civakî bi kar naynin. Font û wêne ji malpera me bi xwe tên."] },
        { h: "Li ser cîhaza te tê tomarkirin", p: ["Ziman: rega-lang, rega-lang-v3. Hilbijartina Bazar/Gihandin: rl-service (herwiha wekî cookie, da ku rûpel bi heman awayî vebe). Firoşgehên bijare: rl-store-favs. Bihayên tomarkirî: rega-held. Lêgerînên dawî: rl-recent-searches. Pêşnivîsa rezervasyonê dema ku tu diçî rûpela têkiliyê: rega-booking (tenê ji bo vê danişînê). Kopiyek offline ya sepanê (service worker). Ev di geroka te de dimînin; bi paqijkirina daneyên malperê tu dikarî wan jê bibî."] },
        { h: "R&L AI — naskirin bi wêneyê", p: ["Dema ku tu /ai bi kar tînî, wêneyê te ji bo naskirina tiştê ji Cloudflare Workers AI re tê şandin û tenê ji bo wê daxwazê tê pêvajokirin; em wê tomar nakin. Ji bo sînorên bikaranînê em hejmarkerên kurt-dem li gorî navnîşana IP diparêzin."] },
        { h: "Biha, şopandin û sînorên daxwazan", p: ["Biha li ser servera me tên hesabkirin û ji bo 30 deqeyan tên îmzekirin. Daxwazên biha û şopandinê ji aliyê Cloudflare ve li gorî navnîşana IP tên sînordarkirin; em van navnîşanan tomar nakin."] },
        { h: "Têketin bi telefonê (dema çalak bibe)", p: ["Têketin bi telefonê hêj ne çalak e. Piştî çalakbûnê, em hejmara telefonê, navê ku tu didî, daxwazên te (navnîşan, tişt, daxuyaniya tiştên qedexe) û cookie-ya danişînê (rl_phone, heta 30 rojan) di databasa xwe de tomar dikin da ku fermanên te pêk bînin. Kodên yekcarî kurt-dem in."] },
        { h: "E-name", p: [`Heke tu ji ${MAIL} re binivîsî, peyama te di Gmail (Google) de tê birêvebirin.`] },
        { h: "Girêdanên firoşgehan", p: ["Girêdanên firoşgehan û idealo malperên wan vedikin; li wir polîtîkaya nepenîtiyê ya wan derbas dibe."] },
        { h: "Mafên te", p: [`Tu dikarî bi rêya ${MAIL} daxwaza dîtin, rastkirin an jêbirina daneyên xwe bikî.`] },
      ],
    },
    terms: {
      title: "Mercên bikaranînê",
      lede: "Şablon — mercên dawî li bendê ne.",
      sections: [
        { h: "Qada derbasdariyê", p: ["Ev merc ji bo bikaranîna sepana R&L derbas dibin. [Şirketa peymanê — li bendê ye]."] },
        { h: "Xizmet", p: ["R&L alîkariya te dike ku tu pakêtan di navbera Ewropa, Kurdistan û Iraqê de bişînî û ji firoşgehên online yên Ewropî daxwaza kirînê bikî. Firoşgehên ku di Bazarê de girêdayî ne ne hevkarên R&L ne."] },
        { h: "Biha û pêşniyar", p: ["Bihayên ku têne nîşandan texmîn in û li gorî giraniya hesabkirî ne. Her pêşniyarek 30 deqeyan derbasdar e. Bihayê dawî berî hilgirtinê bi te re tê piştrastkirin. Baca gumrikê ne tê de ye."] },
        { h: "Tiştên qedexe", p: ["Divê tu tiştên qedexe an sînordar neşînî û naverokê bi rastî binivîsî. Tu vê berî her daxwazê bi daxuyaniyê piştrast dikî."] },
        { h: "Berpirsiyarî", p: ["[Mercên berpirsiyariyê — li bendê ye]"] },
        { h: "Qanûna derbasdar", p: ["[Qanûna derbasdar û cihê dadgehê — li bendê ye]"] },
        { h: "Têkilî", p: [MAIL] },
      ],
    },
  },
  ar: {
    links: { impressum: "البيانات القانونية", privacy: "الخصوصية", terms: "الشروط" },
    pending: "بعض التفاصيل القانونية لا تزال قيد الإعداد وستُضاف قبل الإطلاق. ما بين [قوسين] عناصر مؤقتة.",
    updated: "آخر تحديث: 9 أكتوبر 2026",
    impressum: {
      title: "البيانات القانونية (Impressum)",
      lede: "بيانات مقدّم الخدمة.",
      sections: [
        { h: "مقدّم الخدمة", p: ["[اسم الشركة — قيد الإعداد]", "[الشكل القانوني — قيد الإعداد]", "[الشارع والرقم — قيد الإعداد]", "[الرمز البريدي، المدينة، الدولة — قيد الإعداد]"] },
        { h: "الممثل القانوني", p: ["[اسم الممثل المفوّض — قيد الإعداد]"] },
        { h: "التواصل", p: [`البريد الإلكتروني: ${MAIL}`] },
        { h: "السجل", p: ["[محكمة السجل ورقم التسجيل — قيد الإعداد]", "[الرقم الضريبي (VAT) إن وُجد — قيد الإعداد]"] },
        { h: "المسؤول عن المحتوى", p: ["[الاسم والعنوان — قيد الإعداد]"] },
      ],
    },
    privacy: {
      title: "الخصوصية",
      lede: "ما الذي يفعله هذا التطبيق فعلاً ببياناتك.",
      sections: [
        { h: "الجهة المسؤولة", p: [`R&L، [اسم الشركة وعنوانها — قيد الإعداد]. التواصل: ${MAIL}.`] },
        { h: "الاستضافة", p: ["يعمل التطبيق على Cloudflare Workers. تعالج Cloudflare كل طلب، بما في ذلك عنوان IP وبيانات المتصفح، لتقديم الصفحة وحمايتها من إساءة الاستخدام. يحتفظ الـ Worker الخاص بنا بسجلات تقنية للطلبات لمعالجة الأعطال."] },
        { h: "لا تتبع", p: ["لا نستخدم أي أدوات تحليل أو إعلانات أو أدوات تتبع لشبكات التواصل. الخطوط والصور تُقدَّم من موقعنا نفسه."] },
        { h: "ما يُحفظ على جهازك", p: ["اللغة: rega-lang، rega-lang-v3. اختيار البازار/التوصيل: rl-service (وأيضاً كملف تعريف ارتباط ليفتح الموقع بالطريقة نفسها). المتاجر المفضلة: rl-store-favs. الأسعار المحفوظة: rega-held. عمليات البحث الأخيرة: rl-recent-searches. مسودة الحجز أثناء الانتقال إلى صفحة التواصل: rega-booking (لهذه الجلسة فقط). نسخة تعمل دون اتصال من التطبيق (service worker). تبقى هذه في متصفحك ويمكنك حذفها بمسح بيانات الموقع."] },
        { h: "R&L AI — التعرّف بالصورة", p: ["عند استخدام /ai تُرسَل صورتك إلى Cloudflare Workers AI للتعرّف على المنتج وتُعالَج لهذا الطلب فقط؛ ولا نخزّنها. ولتطبيق حدود الاستخدام نحتفظ بعدّادات قصيرة الأجل مرتبطة بعنوان IP."] },
        { h: "الأسعار والتتبع وحدود الطلبات", p: ["تُحسب الأسعار على خادمنا وتُوقَّع لمدة 30 دقيقة. تُقيَّد طلبات الأسعار والتتبع لكل عنوان IP بواسطة Cloudflare؛ ولا نخزّن هذه العناوين."] },
        { h: "تسجيل الدخول بالهاتف (عند تفعيله)", p: ["تسجيل الدخول بالهاتف غير مفعّل بعد. بعد تفعيله نخزّن رقم هاتفك والاسم الذي تقدّمه وطلباتك (العناوين، المواد، إقرار المواد المحظورة) وملف تعريف ارتباط للجلسة (rl_phone، حتى 30 يوماً) في قاعدة بياناتنا لتنفيذ طلباتك. رموز الدخول لمرة واحدة قصيرة الأجل."] },
        { h: "البريد الإلكتروني", p: [`إذا راسلتنا على ${MAIL} فتُعالَج رسالتك في Gmail (Google).`] },
        { h: "روابط المتاجر", p: ["روابط المتاجر وidealo تفتح مواقعها؛ وتنطبق هناك سياسات الخصوصية الخاصة بها."] },
        { h: "حقوقك", p: [`يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها عبر ${MAIL}.`] },
      ],
    },
    terms: {
      title: "شروط الاستخدام",
      lede: "نموذج — الشروط النهائية قيد الإعداد.",
      sections: [
        { h: "النطاق", p: ["تنطبق هذه الشروط على استخدام تطبيق R&L. [الشركة المتعاقدة — قيد الإعداد]."] },
        { h: "الخدمة", p: ["يساعدك R&L على إرسال الطرود بين أوروبا وكردستان والعراق وطلب الشراء من المتاجر الإلكترونية الأوروبية. المتاجر المرتبطة في البازار ليست شركاء لـ R&L."] },
        { h: "الأسعار وعروض الأسعار", p: ["الأسعار المعروضة تقديرية وتُحسب على أساس الوزن المحتسب. كل عرض سعر صالح لمدة 30 دقيقة. يُؤكَّد السعر النهائي معك قبل الاستلام. الرسوم الجمركية غير مشمولة."] },
        { h: "المواد المحظورة", p: ["يجب ألا ترسل مواد محظورة أو مقيدة وأن تصف المحتويات بصدق. تؤكد ذلك بالإقرار قبل كل طلب."] },
        { h: "المسؤولية", p: ["[شروط المسؤولية — قيد الإعداد]"] },
        { h: "القانون الواجب التطبيق", p: ["[القانون الواجب التطبيق ومكان الاختصاص القضائي — قيد الإعداد]"] },
        { h: "التواصل", p: [MAIL] },
      ],
    },
  },
  fa: {
    links: { impressum: "اطلاعات حقوقی", privacy: "حریم خصوصی", terms: "شرایط" },
    pending: "برخی جزئیات حقوقی هنوز در انتظار تکمیل است و پیش از راه‌اندازی افزوده می‌شود. موارد داخل [کروشه] جای‌نگهدار هستند.",
    updated: "آخرین به‌روزرسانی: ۹ اکتبر ۲۰۲۶",
    impressum: {
      title: "اطلاعات حقوقی (Impressum)",
      lede: "اطلاعات ارائه‌دهنده.",
      sections: [
        { h: "ارائه‌دهنده", p: ["[نام شرکت — در انتظار تکمیل]", "[شکل حقوقی — در انتظار تکمیل]", "[خیابان و پلاک — در انتظار تکمیل]", "[کد پستی، شهر، کشور — در انتظار تکمیل]"] },
        { h: "نماینده", p: ["[نام نمایندهٔ مجاز — در انتظار تکمیل]"] },
        { h: "تماس", p: [`ایمیل: ${MAIL}`] },
        { h: "ثبت", p: ["[مرجع ثبت و شمارهٔ ثبت — در انتظار تکمیل]", "[شناسهٔ مالیاتی (VAT) در صورت وجود — در انتظار تکمیل]"] },
        { h: "مسئول محتوا", p: ["[نام و نشانی — در انتظار تکمیل]"] },
      ],
    },
    privacy: {
      title: "حریم خصوصی",
      lede: "این برنامه واقعاً با داده‌های شما چه می‌کند.",
      sections: [
        { h: "مسئول", p: [`R&L، [نام و نشانی شرکت — در انتظار تکمیل]. تماس: ${MAIL}.`] },
        { h: "میزبانی", p: ["این برنامه روی Cloudflare Workers اجرا می‌شود. Cloudflare هر درخواست را، از جمله نشانی IP و اطلاعات مرورگر، برای ارائهٔ صفحه و محافظت در برابر سوءاستفاده پردازش می‌کند. Worker ما گزارش‌های فنی درخواست‌ها را برای رفع اشکال نگه می‌دارد."] },
        { h: "بدون ردیابی", p: ["ما از هیچ ابزار تحلیلی، تبلیغاتی یا ردیاب شبکه‌های اجتماعی استفاده نمی‌کنیم. فونت‌ها و تصاویر از سایت خود ما ارائه می‌شوند."] },
        { h: "آنچه روی دستگاه شما ذخیره می‌شود", p: ["زبان: rega-lang، rega-lang-v3. انتخاب بازار/ارسال: rl-service (همچنین به‌صورت کوکی تا صفحه به همان شکل باز شود). فروشگاه‌های محبوب: rl-store-favs. قیمت‌های ذخیره‌شده: rega-held. جست‌وجوهای اخیر: rl-recent-searches. پیش‌نویس رزرو هنگام رفتن به صفحهٔ تماس: rega-booking (فقط برای همین نشست). نسخهٔ آفلاین برنامه (service worker). این‌ها در مرورگر شما می‌مانند و با پاک کردن داده‌های سایت حذف می‌شوند."] },
        { h: "R&L AI — شناسایی با عکس", p: ["وقتی از /ai استفاده می‌کنید، عکس شما برای شناسایی کالا به Cloudflare Workers AI فرستاده می‌شود و فقط برای همان درخواست پردازش می‌شود؛ ما آن را ذخیره نمی‌کنیم. برای اعمال محدودیت استفاده، شمارنده‌های کوتاه‌مدت بر اساس نشانی IP نگه می‌داریم."] },
        { h: "قیمت، رهگیری و محدودیت درخواست", p: ["قیمت‌ها روی سرور ما محاسبه و برای ۳۰ دقیقه امضا می‌شوند. درخواست‌های قیمت و رهگیری بر اساس نشانی IP توسط Cloudflare محدود می‌شوند؛ ما این نشانی‌ها را ذخیره نمی‌کنیم."] },
        { h: "ورود با شماره تلفن (پس از فعال‌سازی)", p: ["ورود با تلفن هنوز فعال نیست. پس از فعال‌سازی، شماره تلفن، نامی که وارد می‌کنید، درخواست‌هایتان (نشانی‌ها، کالاها، اظهارنامهٔ کالاهای ممنوع) و کوکی نشست (rl_phone، حداکثر ۳۰ روز) را برای انجام سفارش‌ها در پایگاه دادهٔ خود ذخیره می‌کنیم. کدهای یک‌بارمصرف کوتاه‌مدت هستند."] },
        { h: "ایمیل", p: [`اگر به ${MAIL} بنویسید، پیام شما در Gmail (Google) پردازش می‌شود.`] },
        { h: "پیوند فروشگاه‌ها", p: ["پیوندهای فروشگاه‌ها و idealo سایت خودشان را باز می‌کنند؛ در آنجا سیاست حریم خصوصی آن‌ها اعمال می‌شود."] },
        { h: "حقوق شما", p: [`می‌توانید از طریق ${MAIL} درخواست دسترسی، اصلاح یا حذف داده‌هایتان را بدهید.`] },
      ],
    },
    terms: {
      title: "شرایط استفاده",
      lede: "الگو — شرایط نهایی در انتظار تکمیل است.",
      sections: [
        { h: "دامنه", p: ["این شرایط برای استفاده از برنامهٔ R&L اعمال می‌شود. [شرکت طرف قرارداد — در انتظار تکمیل]."] },
        { h: "خدمت", p: ["R&L به شما کمک می‌کند بسته‌ها را میان اروپا، کردستان و عراق بفرستید و از فروشگاه‌های آنلاین اروپایی درخواست خرید کنید. فروشگاه‌هایی که در بازار پیوند داده شده‌اند شریک R&L نیستند."] },
        { h: "قیمت و پیشنهاد قیمت", p: ["قیمت‌های نمایش‌داده‌شده تخمینی‌اند و بر اساس وزن قابل‌محاسبه به دست می‌آیند. هر پیشنهاد قیمت ۳۰ دقیقه اعتبار دارد. قیمت نهایی پیش از تحویل گرفتن بار با شما تأیید می‌شود. عوارض گمرکی شامل نیست."] },
        { h: "کالاهای ممنوع", p: ["نباید کالای ممنوع یا محدود بفرستید و باید محتویات را صادقانه شرح دهید. این را پیش از هر درخواست با اظهارنامه تأیید می‌کنید."] },
        { h: "مسئولیت", p: ["[شرایط مسئولیت — در انتظار تکمیل]"] },
        { h: "قانون حاکم", p: ["[قانون حاکم و مرجع رسیدگی — در انتظار تکمیل]"] },
        { h: "تماس", p: [MAIL] },
      ],
    },
  },
  tr: {
    links: { impressum: "Künye", privacy: "Gizlilik", terms: "Koşullar" },
    pending: "Bazı yasal bilgiler henüz eksiktir ve lansmandan önce eklenecektir. [Köşeli parantez] içindeki öğeler yer tutucudur.",
    updated: "Son güncelleme: 9 Ekim 2026",
    impressum: {
      title: "Künye (Impressum)",
      lede: "Hizmet sağlayıcı bilgileri.",
      sections: [
        { h: "Hizmet sağlayıcı", p: ["[Şirket adı — beklemede]", "[Hukuki yapı — beklemede]", "[Sokak ve numara — beklemede]", "[Posta kodu, şehir, ülke — beklemede]"] },
        { h: "Temsilci", p: ["[Yetkili temsilcinin adı — beklemede]"] },
        { h: "İletişim", p: [`E-posta: ${MAIL}`] },
        { h: "Sicil", p: ["[Sicil mahkemesi ve sicil numarası — beklemede]", "[Varsa KDV numarası — beklemede]"] },
        { h: "İçerikten sorumlu", p: ["[Ad ve adres — beklemede]"] },
      ],
    },
    privacy: {
      title: "Gizlilik",
      lede: "Bu uygulamanın verilerinizle gerçekte ne yaptığı.",
      sections: [
        { h: "Sorumlu", p: [`R&L, [şirket adı ve adresi — beklemede]. İletişim: ${MAIL}.`] },
        { h: "Barındırma", p: ["Uygulama Cloudflare Workers üzerinde çalışır. Cloudflare, sayfayı sunmak ve kötüye kullanıma karşı korumak için IP adresiniz ve tarayıcı bilgileriniz dahil her isteği işler. Worker'ımız sorun giderme için teknik istek kayıtları tutar."] },
        { h: "İzleme yok", p: ["Hiçbir analiz, reklam veya sosyal medya izleyicisi kullanmıyoruz. Yazı tipleri ve görseller kendi sitemizden sunulur."] },
        { h: "Cihazınızda saklananlar", p: ["Dil: rega-lang, rega-lang-v3. Pazar/Teslimat seçimi: rl-service (sayfanın aynı şekilde açılması için çerez olarak da). Favori mağazalar: rl-store-favs. Kaydedilen fiyatlar: rega-held. Son aramalar: rl-recent-searches. İletişim sayfasına geçerken rezervasyon taslağı: rega-booking (yalnızca bu oturum). Uygulamanın çevrimdışı kopyası (service worker). Bunlar tarayıcınızda kalır; site verilerini temizleyerek silebilirsiniz."] },
        { h: "R&L AI — fotoğrafla tanıma", p: ["/ai kullandığınızda fotoğrafınız ürünü tanımak için Cloudflare Workers AI'ya gönderilir ve yalnızca bu istek için işlenir; saklamayız. Kullanım sınırlarını uygulamak için IP adresine bağlı kısa ömürlü sayaçlar tutarız."] },
        { h: "Fiyatlar, takip ve istek sınırları", p: ["Fiyatlar sunucumuzda hesaplanır ve 30 dakika için imzalanır. Fiyat ve takip istekleri Cloudflare tarafından IP adresi başına sınırlandırılır; bu IP adreslerini saklamayız."] },
        { h: "Telefonla giriş (etkinleştirildiğinde)", p: ["Telefonla giriş henüz etkin değil. Etkinleştirildiğinde, siparişlerinizi işlemek için telefon numaranızı, verdiğiniz adı, taleplerinizi (adresler, ürünler, yasak ürün beyanı) ve bir oturum çerezini (rl_phone, en fazla 30 gün) veritabanımızda saklarız. Tek kullanımlık kodlar kısa ömürlüdür."] },
        { h: "E-posta", p: [`${MAIL} adresine yazarsanız mesajınız Gmail'de (Google) işlenir.`] },
        { h: "Mağaza bağlantıları", p: ["Mağaza ve idealo bağlantıları kendi sitelerini açar; orada onların gizlilik politikaları geçerlidir."] },
        { h: "Haklarınız", p: [`Verilerinize erişim, düzeltme veya silme talebinizi ${MAIL} adresine iletebilirsiniz.`] },
      ],
    },
    terms: {
      title: "Kullanım koşulları",
      lede: "Şablon — nihai koşullar beklemede.",
      sections: [
        { h: "Kapsam", p: ["Bu koşullar R&L uygulamasının kullanımı için geçerlidir. [Sözleşme tarafı şirket — beklemede]."] },
        { h: "Hizmet", p: ["R&L, Avrupa, Kürdistan ve Irak arasında paket göndermenize ve Avrupa çevrimiçi mağazalarından satın alma talep etmenize yardımcı olur. Pazar'da bağlantısı verilen mağazalar R&L'nin ortakları değildir."] },
        { h: "Fiyatlar ve teklifler", p: ["Gösterilen fiyatlar ücrete esas ağırlıktan hesaplanan tahminlerdir. Her teklif 30 dakika geçerlidir. Nihai fiyat teslim almadan önce sizinle onaylanır. Gümrük vergileri dahil değildir."] },
        { h: "Yasak ürünler", p: ["Yasak veya kısıtlı ürün göndermemeli ve içeriği doğru şekilde beyan etmelisiniz. Bunu her talepten önce beyanla onaylarsınız."] },
        { h: "Sorumluluk", p: ["[Sorumluluk koşulları — beklemede]"] },
        { h: "Uygulanacak hukuk", p: ["[Uygulanacak hukuk ve yetkili mahkeme — beklemede]"] },
        { h: "İletişim", p: [MAIL] },
      ],
    },
  },
  de: {
    links: { impressum: "Impressum", privacy: "Datenschutz", terms: "Nutzungsbedingungen" },
    pending: "Einige rechtliche Angaben stehen noch aus und werden vor dem Start ergänzt. Angaben in [eckigen Klammern] sind Platzhalter.",
    updated: "Stand: 9. Oktober 2026",
    impressum: {
      title: "Impressum",
      lede: "Angaben gemäß § 5 DDG.",
      sections: [
        { h: "Anbieter", p: ["[Firmenname — ausstehend]", "[Rechtsform — ausstehend]", "[Straße und Hausnummer — ausstehend]", "[PLZ, Ort, Land — ausstehend]"] },
        { h: "Vertreten durch", p: ["[Name der vertretungsberechtigten Person — ausstehend]"] },
        { h: "Kontakt", p: [`E-Mail: ${MAIL}`] },
        { h: "Registereintrag", p: ["[Registergericht und Registernummer — ausstehend]", "[USt-IdNr., falls vorhanden — ausstehend]"] },
        { h: "Verantwortlich für den Inhalt", p: ["[Name und Anschrift — ausstehend]"] },
      ],
    },
    privacy: {
      title: "Datenschutz",
      lede: "Was diese App tatsächlich mit Ihren Daten macht.",
      sections: [
        { h: "Verantwortlicher", p: [`R&L, [Firmenname und Anschrift — ausstehend]. Kontakt: ${MAIL}.`] },
        { h: "Hosting", p: ["Die App läuft auf Cloudflare Workers. Cloudflare verarbeitet jede Anfrage einschließlich Ihrer IP-Adresse und Browserangaben, um die Seite auszuliefern und vor Missbrauch zu schützen. Unser Worker speichert technische Anfrageprotokolle zur Fehlerbehebung."] },
        { h: "Kein Tracking", p: ["Wir verwenden keine Analyse-, Werbe- oder Social-Media-Tracker. Schriften und Bilder werden von unserer eigenen Website ausgeliefert."] },
        { h: "Auf Ihrem Gerät gespeichert", p: ["Sprache: rega-lang, rega-lang-v3. Auswahl Bazar/Versand: rl-service (auch als Cookie, damit die Seite gleich öffnet). Lieblingsshops: rl-store-favs. Gespeicherte Preise: rega-held. Letzte Suchen: rl-recent-searches. Buchungsentwurf beim Wechsel zur Kontaktseite: rega-booking (nur für diese Sitzung). Eine Offline-Kopie der App (Service Worker). Diese Daten bleiben in Ihrem Browser; Sie löschen sie, indem Sie die Websitedaten löschen."] },
        { h: "R&L AI — Erkennung per Foto", p: ["Wenn Sie /ai nutzen, wird Ihr Foto zur Erkennung des Artikels an Cloudflare Workers AI gesendet und nur für diese Anfrage verarbeitet; wir speichern es nicht. Zur Durchsetzung von Nutzungsgrenzen führen wir kurzlebige Zähler, die an die IP-Adresse gebunden sind."] },
        { h: "Preise, Sendungsverfolgung und Anfragelimits", p: ["Preise werden auf unserem Server berechnet und für 30 Minuten signiert. Preis- und Tracking-Anfragen werden von Cloudflare pro IP-Adresse begrenzt; wir speichern diese IP-Adressen nicht."] },
        { h: "Anmeldung per Telefon (sobald aktiviert)", p: ["Die Anmeldung per Telefon ist noch nicht aktiv. Danach speichern wir Ihre Telefonnummer, den angegebenen Namen, Ihre Anfragen (Adressen, Artikel, Erklärung zu verbotenen Waren) und ein Sitzungs-Cookie (rl_phone, bis zu 30 Tage) in unserer Datenbank, um Ihre Aufträge zu bearbeiten. Einmal-Codes sind kurzlebig."] },
        { h: "E-Mail", p: [`Wenn Sie an ${MAIL} schreiben, wird Ihre Nachricht in Gmail (Google) verarbeitet.`] },
        { h: "Links zu Shops", p: ["Links zu Shops und idealo öffnen deren Websites; dort gelten deren Datenschutzbestimmungen."] },
        { h: "Ihre Rechte", p: [`Auskunft, Berichtigung oder Löschung Ihrer Daten können Sie unter ${MAIL} verlangen.`] },
      ],
    },
    terms: {
      title: "Nutzungsbedingungen",
      lede: "Vorlage — endgültige Bedingungen ausstehend.",
      sections: [
        { h: "Geltungsbereich", p: ["Diese Bedingungen gelten für die Nutzung der R&L-App. [Vertragspartner — ausstehend]."] },
        { h: "Leistung", p: ["R&L hilft Ihnen, Pakete zwischen Europa, Kurdistan und dem Irak zu versenden und Käufe bei europäischen Onlineshops anzufragen. Im Bazar verlinkte Shops sind keine Partner von R&L."] },
        { h: "Preise und Angebote", p: ["Angezeigte Preise sind Schätzungen auf Basis des abrechenbaren Gewichts. Ein Angebot gilt 30 Minuten. Der Endpreis wird vor der Abholung mit Ihnen bestätigt. Zölle sind nicht enthalten."] },
        { h: "Verbotene Waren", p: ["Sie dürfen keine verbotenen oder eingeschränkten Waren versenden und müssen den Inhalt wahrheitsgemäß angeben. Das bestätigen Sie vor jeder Anfrage mit der Erklärung."] },
        { h: "Haftung", p: ["[Haftungsregelung — ausstehend]"] },
        { h: "Anwendbares Recht", p: ["[Anwendbares Recht und Gerichtsstand — ausstehend]"] },
        { h: "Kontakt", p: [MAIL] },
      ],
    },
  },
};
