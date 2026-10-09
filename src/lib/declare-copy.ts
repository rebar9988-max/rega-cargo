import type { Lang } from "@/lib/langs";

/** Restricted-items declaration, customs line and quote-booking states (7 languages). */
export type DeclareCopy = {
  declare: string;
  mustDeclare: string;
  customs: string;
  expired: string;
  rate: string;
  range: string;
  iqdRate: string;
};

export const DECLARE_COPY: Record<Lang, DeclareCopy> = {
  ckb: {
    declare:
      "پشتڕاستی دەکەمەوە کە بارەکە هیچ کاڵایەکی قەدەغە یان سنووردار تێدا نییە (وەک چەک، ماددەی هۆشبەر، ماددەی گڕگرتوو یان مەترسیدار، پارەی نەختینە، کاڵای ساختە) و ناوەڕۆکەکەم بە ڕاستی نووسیوە.",
    mustDeclare: "تکایە سەرەتا ڕاگەیاندنەکە پشتڕاست بکەوە.",
    customs: "گومرگ: لەناو نرخەکەدا نییە، پێش وەرگرتنی بارەکە پشتڕاست دەکرێتەوە",
    expired: "نرخەکە بەسەرچوو. تکایە دووبارە هەوڵ بدەوە.",
    rate: "داواکاری زۆرە. تکایە کەمێکی تر هەوڵ بدەوە.",
    range: "کێش لە ٠٫١ تا ٧٠ کیلۆ، هەر لایەکی سندووق لە ١ تا ٢٠٠ سم.",
    iqdRate: "دینار بە نرخی ١ € = {rate} IQD، دوایین نوێکردنەوە {date}.",
  },
  en: {
    declare:
      "I confirm the shipment contains no prohibited or restricted items (such as weapons, drugs, flammable or hazardous goods, cash or counterfeit goods) and that I have described the contents truthfully.",
    mustDeclare: "Please confirm the declaration first.",
    customs: "Customs: not included, confirmed before collection",
    expired: "This quote has expired. Please try again.",
    rate: "Too many requests. Please try again in a moment.",
    range: "Weight 0.1–70 kg, each side of the box 1–200 cm.",
    iqdRate: "IQD at 1 € = {rate} IQD, last updated {date}.",
  },
  ku: {
    declare:
      "Ez piştrast dikim ku di barê de tu tiştên qedexe an sînordar tune ne (wek çek, madeyên hişbir, tiştên şewatbar an xeternak, pereyê nexd an tiştên sexte) û min naveroka wê bi rastî nivîsiye.",
    mustDeclare: "Ji kerema xwe pêşî daxuyaniyê piştrast bike.",
    customs: "Gumrik: ne tê de ye, berî hilgirtinê tê piştrastkirin",
    expired: "Ev biha qediya. Ji kerema xwe dîsa biceribîne.",
    rate: "Gelek daxwaz. Ji kerema xwe piştî kêliyekê dîsa biceribîne.",
    range: "Giranî 0,1–70 kg, her aliyê qutiyê 1–200 cm.",
    iqdRate: "IQD bi 1 € = {rate} IQD, nûkirina dawî {date}.",
  },
  ar: {
    declare:
      "أؤكد أن الشحنة لا تحتوي على أي مواد محظورة أو مقيدة (مثل الأسلحة أو المخدرات أو المواد القابلة للاشتعال أو الخطرة أو النقود أو البضائع المقلدة) وأنني وصفت المحتويات بصدق.",
    mustDeclare: "يرجى تأكيد الإقرار أولاً.",
    customs: "الجمارك: غير مشمولة، وتُؤكَّد قبل الاستلام",
    expired: "انتهت صلاحية هذا السعر. يرجى المحاولة مرة أخرى.",
    rate: "طلبات كثيرة. يرجى المحاولة بعد قليل.",
    range: "الوزن من 0.1 إلى 70 كغ، وكل ضلع للصندوق من 1 إلى 200 سم.",
    iqdRate: "الدينار بسعر 1 € = {rate} IQD، آخر تحديث {date}.",
  },
  fa: {
    declare:
      "تأیید می‌کنم که محموله هیچ کالای ممنوع یا محدودی (مانند سلاح، مواد مخدر، مواد قابل اشتعال یا خطرناک، پول نقد یا کالای تقلبی) ندارد و محتویات را صادقانه شرح داده‌ام.",
    mustDeclare: "لطفاً ابتدا اظهارنامه را تأیید کنید.",
    customs: "گمرک: شامل نیست، پیش از تحویل گرفتن بار تأیید می‌شود",
    expired: "اعتبار این قیمت تمام شده است. لطفاً دوباره تلاش کنید.",
    rate: "درخواست‌ها زیاد است. لطفاً کمی بعد دوباره تلاش کنید.",
    range: "وزن ۰٫۱ تا ۷۰ کیلوگرم، هر ضلع جعبه ۱ تا ۲۰۰ سانتی‌متر.",
    iqdRate: "دینار با نرخ ۱ € = {rate} IQD، آخرین به‌روزرسانی {date}.",
  },
  tr: {
    declare:
      "Gönderinin yasak veya kısıtlı hiçbir ürün (silah, uyuşturucu, yanıcı veya tehlikeli madde, nakit para ya da sahte ürün gibi) içermediğini ve içeriği doğru şekilde beyan ettiğimi onaylıyorum.",
    mustDeclare: "Lütfen önce beyanı onaylayın.",
    customs: "Gümrük: dahil değil, teslim almadan önce onaylanır",
    expired: "Bu teklifin süresi doldu. Lütfen tekrar deneyin.",
    rate: "Çok fazla istek. Lütfen biraz sonra tekrar deneyin.",
    range: "Ağırlık 0,1–70 kg, kutunun her kenarı 1–200 cm.",
    iqdRate: "IQD kuru 1 € = {rate} IQD, son güncelleme {date}.",
  },
  de: {
    declare:
      "Ich bestätige, dass die Sendung keine verbotenen oder eingeschränkten Waren enthält (z. B. Waffen, Drogen, entzündliche oder gefährliche Stoffe, Bargeld oder gefälschte Waren) und dass ich den Inhalt wahrheitsgemäß angegeben habe.",
    mustDeclare: "Bitte bestätigen Sie zuerst die Erklärung.",
    customs: "Zoll: nicht enthalten, wird vor der Abholung bestätigt",
    expired: "Dieses Angebot ist abgelaufen. Bitte versuchen Sie es erneut.",
    rate: "Zu viele Anfragen. Bitte versuchen Sie es gleich noch einmal.",
    range: "Gewicht 0,1–70 kg, jede Kartonseite 1–200 cm.",
    iqdRate: "IQD zum Kurs 1 € = {rate} IQD, zuletzt aktualisiert {date}.",
  },
};
