import type { ProductLinkCopy } from "./copy.ts";

// TODO(translate-review): Kurmanji, German, Persian and Turkish product-link copy drafted without
// a native reviewer. Same meaning as the English source: no price, title or photo is promised and
// the estimate excludes goods and customs duty.

export const ku: ProductLinkCopy = {
  title: "Lînkeke berhemê kontrol bike",
  lede: "Lînkeke ji Amazon, eBay an AliExpressê bixe da ku wê kontrol bikî û biha ya şandinê texmîn bikî. Em lînkê venakin.",
  link: "Lînka berhemê",
  kg: "Giranî (kg)",
  check: "Lînkê kontrol bike",
  checking: "Tê kontrolkirin…",
  estimateLabel: "Texmîn",
  shipping: "Şandin ber bi cihê hilbijartî ve",
  chargeable: "Giraniya hesabkirî",
  days: "Rojên gihandinê yên asayî",
  noInfo:
    "Agahiyên berhemê hê tune ne, ji ber vê yekê nav, wêne an biha nayê nîşandan. Ya ku tu dizanî di formê de binivîse.",
  disclaimer:
    "Ev texmîn e, ne pêşniyara bihayê ye. Biha ya tiştan û bacê gumrikê tê de nîne. R&L ne hevkarê fermî yê van firoşgehan e.",
  use: "Vê lînkê di daxwazê de bi kar bîne",
  errors: {
    url: "Lînkeke berhemê ya derbasdar a https binivîse.",
    host: "Tenê lînkên Amazon, eBay û AliExpressê têne piştgirîkirin.",
    unsupported:
      "Ev dişibe rûpeleke firoşgehê, lêgerînê an lînkeke kurt. Rûpela berhemê veke û navnîşana wê kopî bike.",
    prohibited: "Ev berhem bi riya R&L nayê daxwazkirin.",
    invalid: "Giraniyeke ji 0.1 heta 70 kg binivîse.",
    rate: "Gelek daxwaz. Ji kerema xwe hûrdemekê bisekine.",
    disabled: "Ev taybetmendî ne berdest e.",
    unavailable: "Kontrol niha ne berdest e.",
  },
};

export const de: ProductLinkCopy = {
  title: "Produktlink prüfen",
  lede: "Füge einen Link von Amazon, eBay oder AliExpress ein, um ihn zu prüfen und den Versand zu schätzen. Wir öffnen den Link nicht.",
  link: "Produktlink",
  kg: "Gewicht (kg)",
  check: "Link prüfen",
  checking: "Wird geprüft…",
  estimateLabel: "Schätzung",
  shipping: "Versand zum gewählten Ziel",
  chargeable: "Abrechnungsgewicht",
  days: "Übliche Transittage",
  noInfo:
    "Produktdetails sind noch nicht verfügbar, daher werden weder Titel, Foto noch Preis angezeigt. Gib im Formular an, was du weißt.",
  disclaimer:
    "Dies ist eine Schätzung, kein Preisangebot. Waren und Zoll sind nicht enthalten. R&L ist kein offizieller Partner dieser Shops.",
  use: "Diesen Link in der Anfrage verwenden",
  errors: {
    url: "Gib einen gültigen https-Produktlink ein.",
    host: "Es werden nur Links von Amazon, eBay und AliExpress unterstützt.",
    unsupported:
      "Das sieht nach einer Shopseite, einer Suche oder einem Kurzlink aus. Öffne die Produktseite und kopiere ihre Adresse.",
    prohibited: "Dieses Produkt kann nicht über R&L angefragt werden.",
    invalid: "Gib ein Gewicht von 0,1 bis 70 kg ein.",
    rate: "Zu viele Anfragen. Bitte warte eine Minute.",
    disabled: "Diese Funktion ist nicht verfügbar.",
    unavailable: "Die Prüfung ist derzeit nicht verfügbar.",
  },
};

export const fa: ProductLinkCopy = {
  title: "بررسی پیوند کالا",
  lede: "پیوندی از Amazon، eBay یا AliExpress را بچسبانید تا بررسی شود و هزینه ارسال برآورد گردد. ما پیوند را باز نمی‌کنیم.",
  link: "پیوند کالا",
  kg: "وزن (کیلوگرم)",
  check: "بررسی پیوند",
  checking: "در حال بررسی…",
  estimateLabel: "برآورد",
  shipping: "ارسال به مقصد انتخابی",
  chargeable: "وزن قابل محاسبه",
  days: "روزهای معمول ترانزیت",
  noInfo:
    "مشخصات کالا هنوز در دسترس نیست، بنابراین عنوان، عکس یا قیمتی نمایش داده نمی‌شود. آنچه می‌دانید را در فرم وارد کنید.",
  disclaimer:
    "این یک برآورد است، نه پیشنهاد قیمت. هزینه کالا و عوارض گمرکی را شامل نمی‌شود. R&L شریک رسمی این فروشگاه‌ها نیست.",
  use: "استفاده از این پیوند در درخواست",
  errors: {
    url: "یک پیوند معتبر https برای کالا وارد کنید.",
    host: "فقط پیوندهای Amazon، eBay و AliExpress پشتیبانی می‌شوند.",
    unsupported:
      "این شبیه صفحه فروشگاه، جستجو یا پیوند کوتاه است. صفحه کالا را باز کنید و نشانی آن را کپی کنید.",
    prohibited: "این کالا از طریق R&L قابل درخواست نیست.",
    invalid: "وزنی از 0.1 تا 70 کیلوگرم وارد کنید.",
    rate: "درخواست‌های زیاد. لطفاً یک دقیقه صبر کنید.",
    disabled: "این قابلیت در دسترس نیست.",
    unavailable: "بررسی در حال حاضر در دسترس نیست.",
  },
};

export const tr: ProductLinkCopy = {
  title: "Ürün bağlantısını kontrol et",
  lede: "Kontrol etmek ve gönderi ücretini tahmin etmek için Amazon, eBay veya AliExpress bağlantısını yapıştır. Bağlantıyı açmayız.",
  link: "Ürün bağlantısı",
  kg: "Ağırlık (kg)",
  check: "Bağlantıyı kontrol et",
  checking: "Kontrol ediliyor…",
  estimateLabel: "Tahmin",
  shipping: "Seçilen varış noktasına gönderi",
  chargeable: "Ücrete esas ağırlık",
  days: "Tipik transit gün sayısı",
  noInfo:
    "Ürün ayrıntıları henüz mevcut değil; bu yüzden başlık, fotoğraf veya fiyat gösterilmez. Bildiklerini forma yaz.",
  disclaimer:
    "Bu bir tahmindir, fiyat teklifi değildir. Ürün bedeli ve gümrük vergisi dahil değildir. R&L, bu mağazaların resmi ortağı değildir.",
  use: "Bu bağlantıyı talepte kullan",
  errors: {
    url: "Geçerli bir https ürün bağlantısı gir.",
    host: "Yalnızca Amazon, eBay ve AliExpress bağlantıları desteklenir.",
    unsupported:
      "Bu bir mağaza sayfası, arama veya kısa bağlantı gibi görünüyor. Ürün sayfasını açıp adresini kopyala.",
    prohibited: "Bu ürün R&L üzerinden talep edilemez.",
    invalid: "0,1 ile 70 kg arasında bir ağırlık gir.",
    rate: "Çok fazla istek. Lütfen bir dakika bekle.",
    disabled: "Bu özellik kullanılamıyor.",
    unavailable: "Kontrol şu anda kullanılamıyor.",
  },
};
