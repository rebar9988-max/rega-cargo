import type { Lang } from "./langs.ts";

/**
 * Homepage hero (first slide): the AI shopping entry point. The CTA opens the existing /ai
 * assistant, so nothing here promises more than it does (it identifies a product from a photo
 * and shows a landed-cost estimate). No testimonials, discounts, guarantees or partner claims.
 */
export type HeroCopy = {
  eyebrow: string;
  /** Two lines; the break is kept (white-space: pre-line). */
  title: string;
  body: string;
  cta: string;
  /** Short label for the AI button in the shared hero action row. */
  ctaShort: string;
  trust: readonly [string, string, string];
  ctaOpening: string;
};

const en: HeroCopy = {
  eyebrow: "Your smarter way to shop worldwide",
  title: "Shop Smarter.\nDelivered to Your Door.",
  body: "Discover the world of shopping with AI. Find what you love, shop with confidence, and get it delivered to your door.",
  cta: "Shop Smarter with AI",
  ctaShort: "AI assistant",
  trust: ["Global Shopping", "AI Assistance", "Doorstep Delivery"],
  ctaOpening: "Opening the assistant",
};

const ckb: HeroCopy = {
  eyebrow: "ڕێگایەکی زیرەکانەتر بۆ کڕین لە جیهان",
  title: "زیرەکانەتر بکڕە،\nلە دەرگاکەت وەریبگرە!",
  body: "بە یارمەتی AI کاڵای دڵخوازت بدۆزەوە، بە متمانە هەڵبژێرە و تا دەرگای ماڵت وەریبگرە.",
  cta: "بە یارمەتی AI زیرەکانە بکڕە",
  ctaShort: "یاریدەدەری AI",
  trust: ["کڕینی جیهانی", "یارمەتیی AI", "گەیاندن تا دەرگا"],
  ctaOpening: "یاریدەدەر دەکرێتەوە",
};

// TODO(translate-review): Arabic, Persian, Turkish, German and Kurmanji hero copy.
const ar: HeroCopy = {
  eyebrow: "طريقتك الأذكى للتسوق حول العالم",
  title: "تسوّق بذكاء.\nيصلك إلى باب بيتك.",
  body: "اكتشف عالم التسوق مع الذكاء الاصطناعي. اعثر على ما تحب، وتسوّق بثقة، واستلمه عند باب بيتك.",
  cta: "تسوّق بذكاء مع الذكاء الاصطناعي",
  ctaShort: "المساعد الذكي",
  trust: ["تسوّق عالمي", "مساعدة الذكاء الاصطناعي", "توصيل إلى الباب"],
  ctaOpening: "يتم فتح المساعد",
};

const fa: HeroCopy = {
  eyebrow: "راه هوشمندانه‌تر برای خرید از سراسر جهان",
  title: "هوشمندانه‌تر خرید کنید.\nتا درِ خانه‌تان.",
  body: "دنیای خرید را با هوش مصنوعی کشف کنید. آنچه را دوست دارید پیدا کنید، با اطمینان خرید کنید و تا درِ خانه تحویل بگیرید.",
  cta: "با هوش مصنوعی هوشمندانه خرید کنید",
  ctaShort: "دستیار هوشمند",
  trust: ["خرید جهانی", "کمک هوش مصنوعی", "تحویل تا درِ خانه"],
  ctaOpening: "دستیار در حال باز شدن است",
};

const de: HeroCopy = {
  eyebrow: "Dein smarterer Weg, weltweit einzukaufen",
  title: "Schlauer shoppen.\nBis an deine Haustür.",
  body: "Entdecke die Welt des Shoppings mit KI. Finde, was du liebst, kaufe mit Vertrauen und lass es dir bis an die Haustür liefern.",
  cta: "Schlauer shoppen mit KI",
  ctaShort: "KI-Assistent",
  trust: ["Weltweit shoppen", "KI-Unterstützung", "Lieferung bis zur Haustür"],
  ctaOpening: "Assistent wird geöffnet",
};

const tr: HeroCopy = {
  eyebrow: "Dünya çapında alışverişin daha akıllı yolu",
  title: "Daha akıllı alışveriş.\nKapınıza kadar.",
  body: "Yapay zekâ ile alışveriş dünyasını keşfedin. Sevdiğinizi bulun, güvenle alışveriş yapın ve kapınıza kadar getirtin.",
  cta: "Yapay zekâ ile akıllıca alışveriş yap",
  ctaShort: "Yapay zekâ asistanı",
  trust: ["Küresel alışveriş", "Yapay zekâ desteği", "Kapıya teslimat"],
  ctaOpening: "Asistan açılıyor",
};

const ku: HeroCopy = {
  eyebrow: "Rêya te ya zîrektir bo kirîna ji seranserê cîhanê",
  title: "Zîrektir bikire.\nHeta ber deriyê te.",
  body: "Cîhana kirînê bi alîkariya AI re keşf bike. Tiştê ku hez dikî bibîne, bi pêbawerî bikire û heta ber deriyê xwe wergire.",
  cta: "Bi AI zîrektir bikire",
  ctaShort: "Alîkarê AI",
  trust: ["Kirîna cîhanî", "Alîkariya AI", "Gihandin heta ber derî"],
  ctaOpening: "Alîkar tê vekirin",
};

const ALL: Record<Lang, HeroCopy> = { en, ckb, ar, fa, de, tr, ku };

export function heroCopy(lang: Lang): HeroCopy {
  return ALL[lang];
}
