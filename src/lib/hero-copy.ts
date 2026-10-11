import type { Lang } from "./langs.ts";

/**
 * Homepage AI hero: one static section directly under the header. The CTA opens the existing
 * /ai assistant, so nothing here promises more than it does (it identifies a product from a photo
 * and shows a landed-cost estimate). No testimonials, discounts, guarantees or partner claims.
 */
export type HeroCopy = {
  eyebrow: string;
  /** Two lines; the break is kept (white-space: pre-line). */
  title: string;
  subtitle: string;
  cta: string;
  ctaOpening: string;
};

const en: HeroCopy = {
  eyebrow: "Your smarter way to shop worldwide",
  title: "Shop Smarter.\nDelivered to Your Door.",
  subtitle: "AI-Powered Shopping. Worldwide Access. Doorstep Delivery.",
  cta: "Shop Smarter with AI",
  ctaOpening: "Opening the assistant",
};

const ckb: HeroCopy = {
  eyebrow: "ڕێگایەکی زیرەکانەتر بۆ کڕین لە جیهان",
  title: "زیرەکانەتر بکڕە،\nلە دەرگاکەت وەریبگرە!",
  // TODO(translate-review): Sorani subtitle (the headline and CTA are the owner-supplied copy).
  subtitle: "کڕینی زیرەک بە AI. دەستگەیشتن بە جیهان. گەیاندن تا دەرگا.",
  cta: "بە یارمەتی AI زیرەکانە بکڕە",
  ctaOpening: "یاریدەدەر دەکرێتەوە",
};

// TODO(translate-review): Arabic, Persian, Turkish, German and Kurmanji hero copy.
const ar: HeroCopy = {
  eyebrow: "طريقتك الأذكى للتسوق حول العالم",
  title: "تسوّق بذكاء.\nيصلك إلى باب بيتك.",
  subtitle: "تسوّق بالذكاء الاصطناعي. وصول إلى العالم. توصيل حتى الباب.",
  cta: "تسوّق بذكاء مع الذكاء الاصطناعي",
  ctaOpening: "يتم فتح المساعد",
};

const fa: HeroCopy = {
  eyebrow: "راه هوشمندانه‌تر برای خرید از سراسر جهان",
  title: "هوشمندانه‌تر خرید کنید.\nتا درِ خانه‌تان.",
  subtitle: "خرید با هوش مصنوعی. دسترسی به سراسر جهان. تحویل تا درِ خانه.",
  cta: "با هوش مصنوعی هوشمندانه خرید کنید",
  ctaOpening: "دستیار در حال باز شدن است",
};

const de: HeroCopy = {
  eyebrow: "Dein smarterer Weg, weltweit einzukaufen",
  title: "Schlauer shoppen.\nBis an deine Haustür.",
  subtitle: "KI-gestütztes Shopping. Weltweiter Zugang. Lieferung bis an die Haustür.",
  cta: "Schlauer shoppen mit KI",
  ctaOpening: "Assistent wird geöffnet",
};

const tr: HeroCopy = {
  eyebrow: "Dünya çapında alışverişin daha akıllı yolu",
  title: "Daha akıllı alışveriş.\nKapınıza kadar.",
  subtitle: "Yapay zekâ destekli alışveriş. Dünyaya erişim. Kapıya teslimat.",
  cta: "Yapay zekâ ile akıllıca alışveriş yap",
  ctaOpening: "Asistan açılıyor",
};

const ku: HeroCopy = {
  eyebrow: "Rêya te ya zîrektir bo kirîna ji seranserê cîhanê",
  title: "Zîrektir bikire.\nHeta ber deriyê te.",
  subtitle: "Kirîna bi hêza AI. Gihîştina cîhanê. Gihandin heta ber derî.",
  cta: "Bi AI zîrektir bikire",
  ctaOpening: "Alîkar tê vekirin",
};

const ALL: Record<Lang, HeroCopy> = { en, ckb, ar, fa, de, tr, ku };

export function heroCopy(lang: Lang): HeroCopy {
  return ALL[lang];
}
