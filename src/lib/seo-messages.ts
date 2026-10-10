// Existing localized metadata, separated from full page copy for the initial bundle.
import type { Lang } from "./langs";
export const SEO_MESSAGES: Record<Lang, Record<string, { title: string; description: string }>> = {
  // TODO(translate-review): review new Sorani marketing metadata alongside redesign-copy.ts.
  ckb: {
    "/": {
      title: "R&L · هەڵبژاردنەکەت لە ئەوروپا. گەیاندنەکەت بۆ ماڵ.",
      description:
        "فرۆشگا ئەوروپییەکان ببینە. داواکارییەکەت لە کۆلن دەکڕین یان وەردەگرین، پاشان بۆ کوردستان و عێراق دەنێرین.",
    },
    "/stores": {
      title: "بازاڕ · R&L",
      description:
        "وێنەکان ببینە و ئەوەی پێت خۆشە داوای بکە. ئەمە کۆگای ڕاستەوخۆی فرۆشگا نییە. هیچ شتێک ناکڕدرێت تا نرخەکە پشتڕاست بکەیتەوە.",
    },
    "/stores/request": {
      title: "داواکاری · R&L",
      description: "داواکارییەکە بنێرە. بوون و تێچووی تەواو پێش پەسەندکردنی تۆ پشتڕاست دەکرێتەوە.",
    },
    "/quote": {
      title: "پلانی ناردنەکەت دابنێ · R&L",
      description:
        "کێشی حیسابکراو گەورەتری کێشی ڕاستەقینە و قەبارەییە. ژمارەی دابەشکردن بە پێی شێوازی ناردن دەگۆڕێت.",
    },
    "/market": {
      title: "بازاڕ · R&L",
      description:
        "یەک کاڵا، چەند فرۆشیار. هەرزانترین کۆی نرخ لە سەرەوەیە. بێ پارەدان، بێ ڕیکلام، بێ شوێنی پارەدراو.",
    },
    "/ai": {
      title: "وێنەی کاڵایەک بگرە، بزانە چییە. · R&L",
      description:
        "وێنەیەک بنێرە یان بیگرە؛ R&L AI جۆری کاڵا، براند و نووسینی سەر کاڵاکە پێشنیار دەکات. هەرگیز نرخ یان فرۆشگا پیشان نادات.",
    },
    "/impressum": {
      title: "زانیاریی یاسایی (Impressum) · R&L",
      description: "زانیاریی دابینکەر.",
    },
    "/privacy": {
      title: "تایبەتمەندی · R&L",
      description: "ئەم ئەپە بە ڕاستی چی لە زانیارییەکانت دەکات.",
    },
    "/terms": {
      title: "مەرجەکانی بەکارهێنان · R&L",
      description: "نموونە — مەرجە کۆتاییەکان چاوەڕوانن.",
    },
  },
  ku: {
    "/": {
      title: "R&L · Your European find. Your next delivery.",
      description:
        "Discover European stores. We buy or receive your order in Cologne, then arrange shipping to Kurdistan and Iraq.",
    },
    "/stores": {
      title: "Marketplace · R&L",
      description:
        "Wêneyan bibîne û ya ku ji te re xweş e siparîş bike. Ev mînak in, ne stoka zindî. Tiştek nayê kirîn heta ku hûn bihayekî piştrast erê bikin.",
    },
    "/stores/request": {
      title: "Product link · R&L",
      description:
        "Send the request. We confirm availability and the full cost before you approve anything.",
    },
    "/quote": {
      title: "Plan your shipment · R&L",
      description:
        "Chargeable weight is the greater of actual and volumetric weight. The divisor depends on the shipping mode.",
    },
    "/market": {
      title: "Bazar · R&L",
      description:
        "One product, several sellers. The cheapest total is first. No payment, no ads, no paid place.",
    },
    "/ai": {
      title: "Wêneyê berhemekê bigire. Bizane ew çi ye. · R&L",
      description:
        "Wêneyekî bişîne an bigire: R&L AI cureyê berhemê, marka û nivîsa li ser wê pêşniyar dike. Ew qet biha an firoşgehan nîşan nade.",
    },
    "/impressum": {
      title: "Agahiyên qanûnî (Impressum) · R&L",
      description: "Agahiyên pêşkêşkerê.",
    },
    "/privacy": {
      title: "Nepenîtî · R&L",
      description: "Ev sepan bi rastî bi daneyên te çi dike.",
    },
    "/terms": {
      title: "Mercên bikaranînê · R&L",
      description: "Şablon — mercên dawî li bendê ne.",
    },
  },
  de: {
    "/": {
      title: "R&L · Your European find. Your next delivery.",
      description:
        "Discover European stores. We buy or receive your order in Cologne, then arrange shipping to Kurdistan and Iraq.",
    },
    "/stores": {
      title: "Marketplace · R&L",
      description:
        "Sehen Sie die Bilder und bestellen Sie, was Ihnen gefällt. Das sind Beispiele, kein Live-Lager. Gekauft wird erst nach einem bestätigten Preis.",
    },
    "/stores/request": {
      title: "Bestellung · R&L",
      description:
        "Senden Sie die Bestellung. Wir bestätigen Verfügbarkeit und den vollen Preis, bevor Sie zustimmen.",
    },
    "/quote": {
      title: "Plan your shipment · R&L",
      description:
        "Chargeable weight is the greater of actual and volumetric weight. The divisor depends on the shipping mode.",
    },
    "/market": {
      title: "Marktplatz · R&L",
      description:
        "One product, several sellers. The cheapest total is first. No payment, no ads, no paid place.",
    },
    "/ai": {
      title: "Produkt fotografieren. Erfahren, was es ist. · R&L",
      description:
        "Foto hochladen oder aufnehmen – R&L AI schlägt Produktkategorie, Marke und aufgedruckten Text vor. Preise oder Shops zeigt es nie.",
    },
    "/impressum": {
      title: "Impressum · R&L",
      description: "Angaben gemäß § 5 DDG.",
    },
    "/privacy": {
      title: "Datenschutz · R&L",
      description: "Was diese App tatsächlich mit Ihren Daten macht.",
    },
    "/terms": {
      title: "Nutzungsbedingungen · R&L",
      description: "Vorlage — endgültige Bedingungen ausstehend.",
    },
  },
  en: {
    "/": {
      title: "R&L · Your European find. Your next delivery.",
      description:
        "Discover European stores. We buy or receive your order in Cologne, then arrange shipping to Kurdistan and Iraq.",
    },
    "/stores": {
      title: "Marketplace · R&L",
      description:
        "See the pictures and order what you like. These are examples, not live shop stock. Nothing is bought until you approve a confirmed price.",
    },
    "/stores/request": {
      title: "Product link · R&L",
      description:
        "Send the request. We confirm availability and the full cost before you approve anything.",
    },
    "/quote": {
      title: "Plan your shipment · R&L",
      description:
        "Chargeable weight is the greater of actual and volumetric weight. The divisor depends on the shipping mode.",
    },
    "/market": {
      title: "Marketplace · R&L",
      description:
        "One product, several sellers. The cheapest total is first. No payment, no ads, no paid place.",
    },
    "/ai": {
      title: "Photograph a product. See what it is. · R&L",
      description:
        "Upload or take a photo: R&L AI suggests the product category, brand and printed text. It never shows prices or shops.",
    },
    "/impressum": {
      title: "Legal notice (Impressum) · R&L",
      description: "Provider information.",
    },
    "/privacy": {
      title: "Privacy · R&L",
      description: "What this app actually does with your data.",
    },
    "/terms": {
      title: "Terms of use · R&L",
      description: "Template — final terms pending.",
    },
  },
  // TODO(translate-review): review new Arabic marketing metadata alongside redesign-copy.ts.
  ar: {
    "/": {
      title: "R&L · اختيارك من أوروبا. توصيلك القادم.",
      description:
        "اكتشف المتاجر الأوروبية. نشتري طلبك أو نستلمه في كولونيا، ثم نرتب شحنه إلى كردستان والعراق.",
    },
    "/stores": {
      title: "السوق · R&L",
      description:
        "شاهد الصور واطلب ما يعجبك. هذه أمثلة وليست مخزون المتجر المباشر. لا يُشترى شيء حتى توافق على سعر مؤكد.",
    },
    "/stores/request": {
      title: "طلب · R&L",
      description: "أرسل الطلب. نؤكد التوفر والتكلفة قبل موافقتك.",
    },
    "/quote": {
      title: "خطط لشحنتك · R&L",
      description:
        "الوزن المحتسب هو الأكبر بين الوزن الفعلي والحجمي. يعتمد المقسوم عليه على طريقة الشحن.",
    },
    "/market": {
      title: "السوق · R&L",
      description:
        "One product, several sellers. The cheapest total is first. No payment, no ads, no paid place.",
    },
    "/ai": {
      title: "صوّر منتجًا. اعرف ما هو. · R&L",
      description:
        "ارفع صورة أو التقطها؛ يقترح R&L AI فئة المنتج والعلامة التجارية والنص المطبوع عليه. لا يعرض أسعارًا أو متاجر أبدًا.",
    },
    "/impressum": {
      title: "البيانات القانونية (Impressum) · R&L",
      description: "بيانات مقدّم الخدمة.",
    },
    "/privacy": {
      title: "الخصوصية · R&L",
      description: "ما الذي يفعله هذا التطبيق فعلاً ببياناتك.",
    },
    "/terms": {
      title: "شروط الاستخدام · R&L",
      description: "نموذج — الشروط النهائية قيد الإعداد.",
    },
  },
  fa: {
    "/": {
      title: "R&L · Your European find. Your next delivery.",
      description:
        "Discover European stores. We buy or receive your order in Cologne, then arrange shipping to Kurdistan and Iraq.",
    },
    "/stores": {
      title: "Marketplace · R&L",
      description:
        "عکس‌ها را ببین و هر چه دوست داری سفارش بده. اینها نمونه است، موجودی زندهٔ فروشگاه نیست. تا قیمت قطعی را تأیید نکنی چیزی خریده نمی‌شود.",
    },
    "/stores/request": {
      title: "لینک محصول · R&L",
      description:
        "درخواست را بفرست. پیش از آنکه چیزی را تأیید کنی، موجود بودن و هزینهٔ کامل را تأیید می‌کنیم.",
    },
    "/quote": {
      title: "Plan your shipment · R&L",
      description:
        "Chargeable weight is the greater of actual and volumetric weight. The divisor depends on the shipping mode.",
    },
    "/market": {
      title: "بازار · R&L",
      description:
        "یک کالا، چند فروشنده. ارزان‌ترین قیمت کل اول می‌آید. بدون پرداخت، بدون تبلیغ، بدون جایگاه پولی.",
    },
    "/ai": {
      title: "از کالا عکس بگیرید. ببینید چیست. · R&L",
      description:
        "عکسی بارگذاری کنید یا بگیرید؛ R&L AI دسته‌بندی کالا، برند و متن چاپ‌شده روی آن را پیشنهاد می‌دهد. هرگز قیمت یا فروشگاه نشان نمی‌دهد.",
    },
    "/impressum": {
      title: "اطلاعات حقوقی (Impressum) · R&L",
      description: "اطلاعات ارائه‌دهنده.",
    },
    "/privacy": {
      title: "حریم خصوصی · R&L",
      description: "این برنامه واقعاً با داده‌های شما چه می‌کند.",
    },
    "/terms": {
      title: "شرایط استفاده · R&L",
      description: "الگو — شرایط نهایی در انتظار تکمیل است.",
    },
  },
  tr: {
    "/": {
      title: "R&L · Your European find. Your next delivery.",
      description:
        "Discover European stores. We buy or receive your order in Cologne, then arrange shipping to Kurdistan and Iraq.",
    },
    "/stores": {
      title: "Marketplace · R&L",
      description:
        "Resimlere bak ve beğendiğini sipariş et. Bunlar örnektir, canlı stok değildir. Onaylı fiyat olmadan hiçbir şey satın alınmaz.",
    },
    "/stores/request": {
      title: "Product link · R&L",
      description:
        "Send the request. We confirm availability and the full cost before you approve anything.",
    },
    "/quote": {
      title: "Plan your shipment · R&L",
      description:
        "Chargeable weight is the greater of actual and volumetric weight. The divisor depends on the shipping mode.",
    },
    "/market": {
      title: "Pazar · R&L",
      description:
        "One product, several sellers. The cheapest total is first. No payment, no ads, no paid place.",
    },
    "/ai": {
      title: "Ürünün fotoğrafını çekin. Ne olduğunu görün. · R&L",
      description:
        "Bir fotoğraf yükleyin veya çekin: R&L AI ürün kategorisini, markayı ve üzerindeki yazıyı önerir. Asla fiyat veya mağaza göstermez.",
    },
    "/impressum": {
      title: "Künye (Impressum) · R&L",
      description: "Hizmet sağlayıcı bilgileri.",
    },
    "/privacy": {
      title: "Gizlilik · R&L",
      description: "Bu uygulamanın verilerinizle gerçekte ne yaptığı.",
    },
    "/terms": {
      title: "Kullanım koşulları · R&L",
      description: "Şablon — nihai koşullar beklemede.",
    },
  },
};
