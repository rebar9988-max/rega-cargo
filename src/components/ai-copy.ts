import type { Lang } from "@/lib/langs";

export type AiCopy = {
  kicker: string;
  title: string;
  lede: string;
  consent: string;
  privacyLine: string;
  take: string;
  choose: string;
  retake: string;
  analyzing: string;
  result: string;
  category: string;
  brand: string;
  model: string;
  visibleText: string;
  attributes: string;
  confidence: string;
  signals: string;
  levels: { low: string; medium: string; high: string };
  signalsNote: string;
  aiNote: string;
  errors: Record<
    | "disabled"
    | "consent_required"
    | "too_large"
    | "unsupported"
    | "bad_dimensions"
    | "rate_limited"
    | "daily_cap"
    | "timeout"
    | "generic",
    string
  >;
  estimateTitle: string;
  estimateLede: string;
  price: string;
  weight: string;
  from: string;
  to: string;
  contents: string;
  personal: string;
  commercial: string;
  item: string;
  shipping: string;
  duty: string;
  total: string;
  estimateNote: string;
};

const en: AiCopy = {
  kicker: "R&L AI",
  title: "Photograph a product. See what it is.",
  lede: "Upload or take a photo: R&L AI suggests the product category, brand and printed text. It never shows prices or shops.",
  consent:
    "I agree that this photo is sent once to Cloudflare Workers AI to identify the product. R&L does not store the photo. Please photograph only the product, not people.",
  privacyLine: "The photo is made smaller on your device and location data (EXIF) is removed.",
  take: "Take photo",
  choose: "Choose photo",
  retake: "Another photo",
  analyzing: "Analysing…",
  result: "Result",
  category: "Category",
  brand: "Brand",
  model: "Model",
  visibleText: "Visible text",
  attributes: "Attributes",
  confidence: "Confidence",
  signals: "Possible counterfeit signs",
  levels: { low: "Low", medium: "Medium", high: "High" },
  signalsNote: "Possible signs only, not proof. Only an inspection can confirm authenticity.",
  aiNote: "AI output (in English). It can be wrong — check before you buy.",
  errors: {
    disabled: "R&L AI is not available yet.",
    consent_required: "Please give your consent first.",
    too_large: "The photo is too large.",
    unsupported: "Please use a JPEG, PNG or WebP photo.",
    bad_dimensions: "The photo size is not suitable.",
    rate_limited: "Too many photos — please try again in an hour.",
    daily_cap: "Today's AI limit is reached — please try again tomorrow.",
    timeout: "The AI took too long — please try again.",
    generic: "Something went wrong — please try again.",
  },
  estimateTitle: "Landed-cost estimate (optional)",
  estimateLede:
    "Enter the price you found and the weight. We add R&L shipping and the duty estimate.",
  price: "Item price (EUR)",
  weight: "Weight (kg)",
  from: "From",
  to: "To",
  contents: "Purpose",
  personal: "Personal use",
  commercial: "For resale",
  item: "Item",
  shipping: "Shipping",
  duty: "Customs duty (estimated)",
  total: "Estimated total",
  estimateNote:
    "Estimate only, not an offer. The final price depends on the real weight, size and customs.",
};

const ckb: AiCopy = {
  kicker: "R&L AI",
  title: "وێنەی کاڵایەک بگرە، بزانە چییە.",
  lede: "وێنەیەک بنێرە یان بیگرە؛ R&L AI جۆری کاڵا، براند و نووسینی سەر کاڵاکە پێشنیار دەکات. هەرگیز نرخ یان فرۆشگا پیشان نادات.",
  consent:
    "ڕازیم ئەم وێنەیە تەنها یەکجار بۆ ناسینەوەی کاڵا بنێردرێت بۆ Cloudflare Workers AI. R&L وێنەکە هەڵناگرێت. تکایە تەنها وێنەی کاڵاکە بگرە، نەک خەڵک.",
  privacyLine: "وێنەکە لەسەر مۆبایلەکەت بچووک دەکرێتەوە و زانیاریی شوێن (EXIF) لادەبرێت.",
  take: "وێنە بگرە",
  choose: "وێنە هەڵبژێرە",
  retake: "وێنەیەکی تر",
  analyzing: "شیکردنەوە…",
  result: "ئەنجام",
  category: "جۆر",
  brand: "براند",
  model: "مۆدێل",
  visibleText: "نووسینی دیار",
  attributes: "تایبەتمەندییەکان",
  confidence: "دڵنیایی",
  signals: "نیشانەی ئەگەریی لاسایی",
  levels: { low: "کەم", medium: "مامناوەند", high: "بەرز" },
  signalsNote: "تەنها نیشانەی ئەگەرین، بەڵگە نین. تەنها پشکنین دەتوانێت ڕەسەنی بسەلمێنێت.",
  aiNote: "دەرئەنجامی AI (بە ئینگلیزی). لەوانەیە هەڵە بێت — پێش کڕین بیپشکنە.",
  errors: {
    disabled: "R&L AI هێشتا بەردەست نییە.",
    consent_required: "تکایە سەرەتا ڕەزامەندی بدە.",
    too_large: "وێنەکە زۆر گەورەیە.",
    unsupported: "وێنەی JPEG، PNG یان WebP بەکاربهێنە.",
    bad_dimensions: "قەبارەی وێنەکە گونجاو نییە.",
    rate_limited: "وێنەی زۆرت ناردووە — دوای کاتژمێرێک هەوڵ بدەرەوە.",
    daily_cap: "سنووری ئەمڕۆی AI تەواو بوو — سبەی هەوڵ بدەرەوە.",
    timeout: "AI زۆری خایاند — دووبارە هەوڵ بدەرەوە.",
    generic: "هەڵەیەک ڕوویدا — دووبارە هەوڵ بدەرەوە.",
  },
  estimateTitle: "خەمڵاندنی تێچووی گەیشتن (ئارەزوومەندانە)",
  estimateLede:
    "ئەو نرخەی دۆزیوتەتەوە و کێشەکەی بنووسە. کرێی گواستنەوەی R&L و خەمڵاندنی باجی گومرگی زیاد دەکەین.",
  price: "نرخی کاڵا (یۆرۆ)",
  weight: "کێش (کگم)",
  from: "لە",
  to: "بۆ",
  contents: "مەبەست",
  personal: "بەکارهێنانی کەسی",
  commercial: "بۆ فرۆشتنەوە",
  item: "کاڵا",
  shipping: "گواستنەوە",
  duty: "باجی گومرگ (خەمڵێنراو)",
  total: "کۆی خەمڵێنراو",
  estimateNote:
    "تەنها خەمڵاندنە، ئۆفەر نییە. نرخی کۆتایی بەپێی کێش، قەبارە و گومرگی ڕاستەقینە دەگۆڕێت.",
};

const ku: AiCopy = {
  kicker: "R&L AI",
  title: "Wêneyê berhemekê bigire. Bizane ew çi ye.",
  lede: "Wêneyekî bişîne an bigire: R&L AI cureyê berhemê, marka û nivîsa li ser wê pêşniyar dike. Ew qet biha an firoşgehan nîşan nade.",
  consent:
    "Ez razî me ku ev wêne tenê carekê ji bo naskirina berhemê ji Cloudflare Workers AI re were şandin. R&L wêneyê hilnagire. Ji kerema xwe tenê wêneyê berhemê bigire, ne yê mirovan.",
  privacyLine: "Wêne li ser telefona te tê biçûkkirin û agahiyên cihî (EXIF) têne rakirin.",
  take: "Wêne bigire",
  choose: "Wêne hilbijêre",
  retake: "Wêneyekî din",
  analyzing: "Tê analîzkirin…",
  result: "Encam",
  category: "Cure",
  brand: "Marka",
  model: "Model",
  visibleText: "Nivîsa xuya",
  attributes: "Taybetmendî",
  confidence: "Piştrastî",
  signals: "Nîşanên muhtemel ên sextekariyê",
  levels: { low: "Kêm", medium: "Navîn", high: "Bilind" },
  signalsNote:
    "Tenê nîşanên muhtemel in, ne delîl in. Tenê kontrolkirin dikare resenbûnê piştrast bike.",
  aiNote: "Encama AI (bi Îngilîzî). Dibe ku şaş be — berî kirînê kontrol bike.",
  errors: {
    disabled: "R&L AI hêj ne amade ye.",
    consent_required: "Ji kerema xwe pêşî razîbûna xwe bide.",
    too_large: "Wêne pir mezin e.",
    unsupported: "Wêneyekî JPEG, PNG an WebP bi kar bîne.",
    bad_dimensions: "Mezinahiya wêneyê ne guncaw e.",
    rate_limited: "Te gelek wêne şandin — piştî saetekê dîsa biceribîne.",
    daily_cap: "Sînorê AI yê îro qediya — sibê dîsa biceribîne.",
    timeout: "AI pir dirêj kişand — dîsa biceribîne.",
    generic: "Çewtiyek çêbû — dîsa biceribîne.",
  },
  estimateTitle: "Texmîna lêçûna gihandinê (bijarte)",
  estimateLede:
    "Bihayê ku te dît û giraniyê binivîse. Em lêçûna barkirina R&L û texmîna gumrikê lê zêde dikin.",
  price: "Bihayê berhemê (EUR)",
  weight: "Giranî (kg)",
  from: "Ji",
  to: "Bo",
  contents: "Armanc",
  personal: "Bikaranîna kesane",
  commercial: "Ji bo firotinê",
  item: "Berhem",
  shipping: "Barkirin",
  duty: "Gumrik (texmînî)",
  total: "Tevahiya texmînî",
  estimateNote:
    "Tenê texmîn e, ne pêşniyar e. Bihayê dawî li gorî giranî, mezinahî û gumrika rastîn diguhere.",
};

const ar: AiCopy = {
  kicker: "R&L AI",
  title: "صوّر منتجًا. اعرف ما هو.",
  lede: "ارفع صورة أو التقطها؛ يقترح R&L AI فئة المنتج والعلامة التجارية والنص المطبوع عليه. لا يعرض أسعارًا أو متاجر أبدًا.",
  consent:
    "أوافق على إرسال هذه الصورة مرة واحدة إلى Cloudflare Workers AI للتعرّف على المنتج. لا تحتفظ R&L بالصورة. يُرجى تصوير المنتج فقط، لا الأشخاص.",
  privacyLine: "تُصغَّر الصورة على جهازك وتُزال بيانات الموقع (EXIF).",
  take: "التقط صورة",
  choose: "اختر صورة",
  retake: "صورة أخرى",
  analyzing: "جارٍ التحليل…",
  result: "النتيجة",
  category: "الفئة",
  brand: "العلامة التجارية",
  model: "الطراز",
  visibleText: "النص الظاهر",
  attributes: "الخصائص",
  confidence: "درجة الثقة",
  signals: "علامات محتملة للتقليد",
  levels: { low: "منخفضة", medium: "متوسطة", high: "عالية" },
  signalsNote: "علامات محتملة فقط، وليست دليلًا. الفحص وحده يثبت الأصالة.",
  aiNote: "نتيجة الذكاء الاصطناعي (بالإنجليزية). قد تكون خاطئة — تحقّق قبل الشراء.",
  errors: {
    disabled: "R&L AI غير متاح بعد.",
    consent_required: "يُرجى الموافقة أولًا.",
    too_large: "الصورة كبيرة جدًا.",
    unsupported: "استخدم صورة JPEG أو PNG أو WebP.",
    bad_dimensions: "أبعاد الصورة غير مناسبة.",
    rate_limited: "أرسلت صورًا كثيرة — حاول بعد ساعة.",
    daily_cap: "بلغ حدّ الذكاء الاصطناعي لهذا اليوم — حاول غدًا.",
    timeout: "استغرق الذكاء الاصطناعي وقتًا طويلًا — حاول مجددًا.",
    generic: "حدث خطأ — حاول مجددًا.",
  },
  estimateTitle: "تقدير التكلفة حتى الوصول (اختياري)",
  estimateLede: "أدخل السعر الذي وجدته والوزن. نضيف أجرة شحن R&L وتقدير الرسوم الجمركية.",
  price: "سعر المنتج (يورو)",
  weight: "الوزن (كغ)",
  from: "من",
  to: "إلى",
  contents: "الغرض",
  personal: "استخدام شخصي",
  commercial: "لإعادة البيع",
  item: "المنتج",
  shipping: "الشحن",
  duty: "الجمارك (تقديرية)",
  total: "الإجمالي التقديري",
  estimateNote: "تقدير فقط وليس عرضًا. يعتمد السعر النهائي على الوزن والحجم والجمارك الفعلية.",
};

const fa: AiCopy = {
  kicker: "R&L AI",
  title: "از کالا عکس بگیرید. ببینید چیست.",
  lede: "عکسی بارگذاری کنید یا بگیرید؛ R&L AI دسته‌بندی کالا، برند و متن چاپ‌شده روی آن را پیشنهاد می‌دهد. هرگز قیمت یا فروشگاه نشان نمی‌دهد.",
  consent:
    "موافقم این عکس فقط یک‌بار برای شناسایی کالا به Cloudflare Workers AI فرستاده شود. R&L عکس را نگه نمی‌دارد. لطفاً فقط از کالا عکس بگیرید، نه از افراد.",
  privacyLine: "عکس روی دستگاه شما کوچک می‌شود و داده‌های مکان (EXIF) حذف می‌شود.",
  take: "عکس بگیرید",
  choose: "انتخاب عکس",
  retake: "عکس دیگر",
  analyzing: "در حال تحلیل…",
  result: "نتیجه",
  category: "دسته",
  brand: "برند",
  model: "مدل",
  visibleText: "متن قابل مشاهده",
  attributes: "ویژگی‌ها",
  confidence: "اطمینان",
  signals: "نشانه‌های احتمالی تقلب",
  levels: { low: "کم", medium: "متوسط", high: "زیاد" },
  signalsNote: "فقط نشانه‌های احتمالی‌اند، نه مدرک. تنها بازرسی می‌تواند اصالت را تأیید کند.",
  aiNote: "خروجی هوش مصنوعی (به انگلیسی). ممکن است اشتباه باشد — پیش از خرید بررسی کنید.",
  errors: {
    disabled: "R&L AI هنوز در دسترس نیست.",
    consent_required: "لطفاً ابتدا رضایت دهید.",
    too_large: "عکس خیلی بزرگ است.",
    unsupported: "از عکس JPEG، PNG یا WebP استفاده کنید.",
    bad_dimensions: "ابعاد عکس مناسب نیست.",
    rate_limited: "عکس‌های زیادی فرستادید — یک ساعت دیگر دوباره امتحان کنید.",
    daily_cap: "سقف امروز هوش مصنوعی پر شد — فردا دوباره امتحان کنید.",
    timeout: "پاسخ هوش مصنوعی طول کشید — دوباره امتحان کنید.",
    generic: "خطایی رخ داد — دوباره امتحان کنید.",
  },
  estimateTitle: "برآورد هزینه تا مقصد (اختیاری)",
  estimateLede:
    "قیمتی که یافته‌اید و وزن را وارد کنید. هزینه حمل R&L و برآورد گمرک را اضافه می‌کنیم.",
  price: "قیمت کالا (یورو)",
  weight: "وزن (کیلوگرم)",
  from: "از",
  to: "به",
  contents: "هدف",
  personal: "استفاده شخصی",
  commercial: "برای فروش مجدد",
  item: "کالا",
  shipping: "حمل",
  duty: "گمرک (برآوردی)",
  total: "جمع برآوردی",
  estimateNote:
    "فقط برآورد است، نه پیشنهاد قیمت. قیمت نهایی به وزن، ابعاد و گمرک واقعی بستگی دارد.",
};

const tr: AiCopy = {
  kicker: "R&L AI",
  title: "Ürünün fotoğrafını çekin. Ne olduğunu görün.",
  lede: "Bir fotoğraf yükleyin veya çekin: R&L AI ürün kategorisini, markayı ve üzerindeki yazıyı önerir. Asla fiyat veya mağaza göstermez.",
  consent:
    "Bu fotoğrafın ürün tanıma amacıyla yalnızca bir kez Cloudflare Workers AI'a gönderilmesini kabul ediyorum. R&L fotoğrafı saklamaz. Lütfen yalnızca ürünü çekin, insanları değil.",
  privacyLine: "Fotoğraf cihazınızda küçültülür ve konum verileri (EXIF) silinir.",
  take: "Fotoğraf çek",
  choose: "Fotoğraf seç",
  retake: "Başka fotoğraf",
  analyzing: "Analiz ediliyor…",
  result: "Sonuç",
  category: "Kategori",
  brand: "Marka",
  model: "Model",
  visibleText: "Görünen yazı",
  attributes: "Özellikler",
  confidence: "Güven",
  signals: "Olası taklit işaretleri",
  levels: { low: "Düşük", medium: "Orta", high: "Yüksek" },
  signalsNote:
    "Yalnızca olası işaretlerdir, kanıt değildir. Orijinalliği yalnızca inceleme doğrulayabilir.",
  aiNote: "Yapay zekâ çıktısı (İngilizce). Hatalı olabilir — satın almadan önce kontrol edin.",
  errors: {
    disabled: "R&L AI henüz kullanılamıyor.",
    consent_required: "Lütfen önce onay verin.",
    too_large: "Fotoğraf çok büyük.",
    unsupported: "Lütfen JPEG, PNG veya WebP fotoğraf kullanın.",
    bad_dimensions: "Fotoğraf boyutu uygun değil.",
    rate_limited: "Çok fazla fotoğraf gönderdiniz — bir saat sonra tekrar deneyin.",
    daily_cap: "Bugünkü yapay zekâ sınırına ulaşıldı — yarın tekrar deneyin.",
    timeout: "Yapay zekâ çok uzun sürdü — tekrar deneyin.",
    generic: "Bir hata oluştu — tekrar deneyin.",
  },
  estimateTitle: "Varış maliyeti tahmini (isteğe bağlı)",
  estimateLede:
    "Bulduğunuz fiyatı ve ağırlığı girin. R&L kargo ücretini ve gümrük tahminini ekleriz.",
  price: "Ürün fiyatı (EUR)",
  weight: "Ağırlık (kg)",
  from: "Nereden",
  to: "Nereye",
  contents: "Amaç",
  personal: "Kişisel kullanım",
  commercial: "Yeniden satış",
  item: "Ürün",
  shipping: "Kargo",
  duty: "Gümrük (tahmini)",
  total: "Tahmini toplam",
  estimateNote:
    "Yalnızca tahmindir, teklif değildir. Nihai fiyat gerçek ağırlık, boyut ve gümrüğe bağlıdır.",
};

const de: AiCopy = {
  kicker: "R&L AI",
  title: "Produkt fotografieren. Erfahren, was es ist.",
  lede: "Foto hochladen oder aufnehmen – R&L AI schlägt Produktkategorie, Marke und aufgedruckten Text vor. Preise oder Shops zeigt es nie.",
  consent:
    "Ich bin einverstanden, dass dieses Foto einmalig zur Produkterkennung an Cloudflare Workers AI gesendet wird. R&L speichert das Foto nicht. Bitte nur das Produkt fotografieren, keine Personen.",
  privacyLine: "Das Foto wird auf deinem Gerät verkleinert, Standortdaten (EXIF) werden entfernt.",
  take: "Foto aufnehmen",
  choose: "Foto auswählen",
  retake: "Anderes Foto",
  analyzing: "Wird analysiert …",
  result: "Ergebnis",
  category: "Kategorie",
  brand: "Marke",
  model: "Modell",
  visibleText: "Sichtbarer Text",
  attributes: "Merkmale",
  confidence: "Sicherheit",
  signals: "Mögliche Fälschungshinweise",
  levels: { low: "Niedrig", medium: "Mittel", high: "Hoch" },
  signalsNote:
    "Nur mögliche Hinweise, kein Beweis. Echtheit lässt sich nur durch Prüfung bestätigen.",
  aiNote: "KI-Ausgabe (auf Englisch). Sie kann falsch sein – vor dem Kauf prüfen.",
  errors: {
    disabled: "R&L AI ist noch nicht verfügbar.",
    consent_required: "Bitte zuerst zustimmen.",
    too_large: "Das Foto ist zu groß.",
    unsupported: "Bitte ein JPEG-, PNG- oder WebP-Foto verwenden.",
    bad_dimensions: "Die Bildgröße passt nicht.",
    rate_limited: "Zu viele Fotos – bitte in einer Stunde erneut versuchen.",
    daily_cap: "Das heutige KI-Limit ist erreicht – bitte morgen erneut versuchen.",
    timeout: "Die KI hat zu lange gebraucht – bitte erneut versuchen.",
    generic: "Etwas ist schiefgelaufen – bitte erneut versuchen.",
  },
  estimateTitle: "Geschätzte Gesamtkosten bis zur Ankunft (optional)",
  estimateLede:
    "Gefundenen Preis und Gewicht eingeben. Wir addieren R&L-Versand und die Zollschätzung.",
  price: "Artikelpreis (EUR)",
  weight: "Gewicht (kg)",
  from: "Von",
  to: "Nach",
  contents: "Zweck",
  personal: "Privat",
  commercial: "Zum Weiterverkauf",
  item: "Artikel",
  shipping: "Versand",
  duty: "Zoll (geschätzt)",
  total: "Geschätzte Summe",
  estimateNote:
    "Nur eine Schätzung, kein Angebot. Der Endpreis hängt von tatsächlichem Gewicht, Maßen und Zoll ab.",
};

export const AI_COPY: Record<Lang, AiCopy> = { en, ckb, ku, ar, fa, tr, de };
