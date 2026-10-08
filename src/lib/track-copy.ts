import type { Lang } from "@/lib/langs";

type Other = Exclude<Lang, "ckb" | "en">;
type Bag = Record<Other, string>;

const LINE: Record<string, Bag> = {
  Collected: { ku: "Hat berhevkirin", de: "Abgeholt", ar: "تم الاستلام", fa: "جمع شد", tr: "Teslim alındı" },
  "Hub scan": { ku: "Skana komê", de: "Hub-Scan", ar: "مسح المستودع", fa: "اسکن انبار", tr: "Depo taraması" },
  "Departed by air": { ku: "Bi esmanî derket", de: "Per Luft abgegangen", ar: "غادر جواً", fa: "هوایی حرکت کرد", tr: "Hava yoluyla çıktı" },
  "Arrived at the gateway": { ku: "Gihîşt deriyê", de: "Am Gateway angekommen", ar: "وصل إلى البوابة", fa: "به دروازه رسید", tr: "Kapıya vardı" },
  "Clearance released": { ku: "Gumrik hat berdan", de: "Verzollung freigegeben", ar: "أُفرج عنه جمركياً", fa: "ترخیص شد", tr: "Gümrük bırakıldı" },
  "Out for delivery": { ku: "Ji bo gihandinê derket", de: "In Zustellung", ar: "خرج للتسليم", fa: "برای تحویل خارج شد", tr: "Dağıtıma çıktı" },
  Delivered: { ku: "Gihîşt", de: "Zugestellt", ar: "تم التسليم", fa: "تحویل شد", tr: "Teslim edildi" },
  "Clearance paused — invoice name does not match": {
    ku: "Gumrik sekinî — navê fatûreyê li gel wergir nagire",
    de: "Verzollung pausiert — Rechnungsname stimmt nicht",
    ar: "الجمارك متوقفة — اسم الفاتورة لا يطابق المستلم",
    fa: "ترخیص متوقف شد — نام فاکتور با گیرنده یکی نیست",
    tr: "Gümrük durdu — fatura adı alıcıyla uyuşmuyor",
  },
  "Transfer to Sulaymaniyah": { ku: "Veguhestin bo Silêmaniyê", de: "Weiter nach Sulaimaniyya", ar: "نقل إلى السليمانية", fa: "انتقال به سلیمانیه", tr: "Süleymaniye aktarması" },
  "Door delivery": { ku: "Gihandina ber derî", de: "Zustellung an die Tür", ar: "تسليم إلى الباب", fa: "تحویل درب", tr: "Kapıya teslim" },
  "Departed by road": { ku: "Bi rê derket", de: "Auf der Straße abgegangen", ar: "غادر براً", fa: "زمینی حرکت کرد", tr: "Karayoluyla çıktı" },
  "At the border": { ku: "Li ser sînor", de: "An der Grenze", ar: "عند الحدود", fa: "در مرز", tr: "Sınırda" },
  "Erbil gateway": { ku: "Deriyê Hewlêrê", de: "Gateway Erbil", ar: "بوابة أربيل", fa: "دروازه اربیل", tr: "Erbil kapısı" },
  Transferred: { ku: "Hat veguhestin", de: "Weitergeleitet", ar: "تم التحويل", fa: "منتقل شد", tr: "Aktarıldı" },
  Berlin: { ku: "Berlîn", de: "Berlin", ar: "برلين", fa: "برلین", tr: "Berlin" },
  Düsseldorf: { ku: "Düsseldorf", de: "Düsseldorf", ar: "دوسلدورف", fa: "دوسلدورف", tr: "Düsseldorf" },
  Frankfurt: { ku: "Frankfurt", de: "Frankfurt", ar: "فرانكفورت", fa: "فرانکفورت", tr: "Frankfurt" },
  Erbil: { ku: "Hewlêr", de: "Erbil", ar: "أربيل", fa: "اربیل", tr: "Erbil" },
  "Erbil door": { ku: "Deriyê mala Hewlêrê", de: "Tür in Erbil", ar: "باب أربيل", fa: "درب اربیل", tr: "Erbil kapısı" },
  Stockholm: { ku: "Stockholm", de: "Stockholm", ar: "ستوكهولم", fa: "استکهلم", tr: "Stokholm" },
  Sulaymaniyah: { ku: "Silêmanî", de: "Sulaimaniyya", ar: "السليمانية", fa: "سلیمانیه", tr: "Süleymaniye" },
  "Erbil desk": { ku: "Masa Hewlêrê", de: "Schalter Erbil", ar: "مكتب أربيل", fa: "میز اربیل", tr: "Erbil masası" },
  Amsterdam: { ku: "Amsterdam", de: "Amsterdam", ar: "أمستردام", fa: "آمستردام", tr: "Amsterdam" },
  "Ibrahim Khalil": { ku: "Îbrahîm Xelîl", de: "Ibrahim Khalil", ar: "إبراهيم الخليل", fa: "ابراهیم خلیل", tr: "İbrahim Halil" },
  Duhok: { ku: "Dihok", de: "Duhok", ar: "دهوك", fa: "دهوک", tr: "Duhok" },
  London: { ku: "London", de: "London", ar: "لندن", fa: "لندن", tr: "Londra" },
  "London desk": { ku: "Masa Londonê", de: "Schalter London", ar: "مكتب لندن", fa: "میز لندن", tr: "Londra masası" },
  "Baghdad desk": { ku: "Masa Bexdayê", de: "Schalter Bagdad", ar: "مكتب بغداد", fa: "میز بغداد", tr: "Bağdat masası" },
  Baghdad: { ku: "Bexda", de: "Bagdad", ar: "بغداد", fa: "بغداد", tr: "Bağdat" },
  "Düsseldorf hub": { ku: "Koma Düsseldorfê", de: "Hub Düsseldorf", ar: "مستودع دوسلدورف", fa: "انبار دوسلدورف", tr: "Düsseldorf deposu" },
  "After release": { ku: "Piştî berdanê", de: "Nach der Freigabe", ar: "بعد الإفراج", fa: "پس از ترخیص", tr: "Serbest bırakmadan sonra" },
  "Same day as transfer": { ku: "Heman roja veguhestinê", de: "Am Tag der Weiterleitung", ar: "في يوم النقل نفسه", fa: "همان روز انتقال", tr: "Aktarma günü" },
  "After the border": { ku: "Piştî sînor", de: "Nach der Grenze", ar: "بعد الحدود", fa: "پس از مرز", tr: "Sınırdan sonra" },
  "Next morning": { ku: "Sibehê din", de: "Am nächsten Morgen", ar: "صباح اليوم التالي", fa: "صبح روز بعد", tr: "Ertesi sabah" },
};

const MONTH: Record<string, Bag> = {
  Sep: { ku: "Îlon", de: "Sep.", ar: "أيلول", fa: "سپتامبر", tr: "Eyl" },
  Oct: { ku: "Cot", de: "Okt.", ar: "تشرين الأول", fa: "اکتبر", tr: "Eki" },
};

export function localizedTrack(lang: Lang, english: string, sorani: string) {
  if (lang === "ckb") return sorani;
  if (lang === "en") return english;
  const mapped = LINE[english]?.[lang];
  if (mapped) return mapped;
  return english.replace(/\b(Sep|Oct)\b/g, (month) => MONTH[month]?.[lang] ?? month);
}
