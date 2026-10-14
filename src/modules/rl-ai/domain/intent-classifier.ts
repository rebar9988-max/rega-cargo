import type { ChatIntent, ChatInput } from "./assistant-types.ts";
import { instructionAttack, normalizeScopeText, unrelatedTask } from "./scope-policy.ts";

export type ScopeDecision = { intent: ChatIntent; infer: boolean };
// Fixed UI shortcut text is recognized server-side; arbitrary action hints never grant scope.
const shortcutGroups: [ChatIntent, string[]][] = [
  [
    "search",
    [
      "کاڵایەکم بۆ بدۆزەوە",
      "Find a product",
      "ابحث عن منتج",
      "Berhemekê bibîne",
      "Ein Produkt finden",
      "یک محصول پیدا کن",
      "Bir ürün bul",
    ],
  ],
  [
    "compare",
    [
      "بەراوردی دوو کاڵام بۆ بکە",
      "Compare two products",
      "قارن منتجين",
      "Du hilberan berawird bike",
      "Zwei Produkte vergleichen",
      "دو محصول را مقایسه کن",
      "İki ürünü karşılaştır",
    ],
  ],
  [
    "bring",
    [
      "کاڵام بۆ بهێنەوە",
      "Bring For Me",
      "اشتري لي",
      "Ji min re bîne",
      "Für mich bestellen",
      "برای من بخر",
      "Benim için getir",
    ],
  ],
  [
    "tracking",
    [
      "داواکارییەکەم لە کوێیە؟",
      "Track my order",
      "تتبع طلبي",
      "Fermana min bişopîne",
      "Siparişimi takip et",
      "Siparişimi izle",
      "Siparişimi bul",
      "Bestellung verfolgen",
      "Meine Bestellung verfolgen",
      "سفارشم را پیگیری کن",
    ],
  ],
  [
    "how",
    [
      "چۆن کاڵا داوا بکەم؟",
      "How do I order?",
      "كيف أطلب منتجاً؟",
      "Ez çawa sipariş dikim؟",
      "Wie bestelle ich?",
      "چطور سفارش بدهم؟",
      "Nasıl sipariş veririm?",
    ],
  ],
];
const finding =
  /(?:find|search|looking for|buy|available|price|in stock|product|compare|shop|purchase|دۆز|بدۆز|بەراورد|کاڵا|بکڕ|نرخ|بهێن|ابحث|منتج|شراء|قارن|سعر|ürün|satın|vergleichen|produkt|kaufen|suche|محصول|مقایسه|بخر|بگەڕێ|berhem|bikir)/iu;
const products =
  /(?:iphone|samsung|nike|adidas|nivea|laptop|phone|shoes|perfume|headphones|تەلەفۆن|مۆبایل|پێڵاو|عەتر|کۆمپیوتەر|هاتف|حذاء)/iu;
const shipping =
  /(?:shipping|delivery|customs|warehouse|گەیاندن|گواستنەوە|کۆگا|گومرگ|توصيل|شحن|جمرك|versand|lieferung|kargo|ارسال|gehandin)/iu;
const tracking =
  /(?:track|order status|where.{0,12}(?:order|parcel)|داواکاری.{0,18}(?:کوێ|شوێن)|شوێنپێ|بەدواداچوون|تتبع|طلبي|sendung|siparişim|پیگیری|şopandin|\brg-[a-z0-9-]{4,}\b)/iu;

export function classifyIntent(input: Pick<ChatInput, "message" | "history">): ScopeDecision {
  const text = normalizeScopeText(input.message);
  if (instructionAttack(text) || unrelatedTask(text)) return { intent: "refusal", infer: false };
  const shortcut = shortcutGroups.find(([, labels]) =>
    labels.some((label) => normalizeScopeText(label) === text),
  );
  if (shortcut) return { intent: shortcut[0], infer: false };
  if (/^(?:hello|hi|سڵاو|سلام|مرحبا|hallo|merhaba|silav)[!.؟? ]*$/iu.test(text))
    return { intent: "greeting", infer: false };
  if (tracking.test(text)) return { intent: "tracking", infer: false };
  if (
    /(?:how.{0,20}(?:order|request|buy)|چۆن.{0,20}(?:داوا|بکڕ)|كيف.{0,20}(?:أطلب|اشتري)|wie.{0,15}bestell|nasıl.{0,15}sipariş)/iu.test(
      text,
    )
  )
    return { intent: "how", infer: false };
  if (
    /(?:bring for me|کاڵام بۆ بهێنەوە|اشتري لي|für mich|benim için|بۆم بهێنە)/iu.test(text) ||
    (/https?:\/\//iu.test(text) && /(?:r&l|r\s*&\s*l|کاڵا|product|buy|request|order)/iu.test(text))
  )
    return { intent: "bring", infer: false };
  if (shipping.test(text) && !unrelatedTask(text)) return { intent: "shipping", infer: false };
  if (
    /(?:my account|cancel.{0,20}order|payment.{0,20}r&l|ئەکاونت|هەڵوەشاندن.{0,20}داوا|حسابي)/iu.test(
      text,
    )
  )
    return { intent: "account", infer: false };
  if (
    /(?:r&l.{0,25}(?:support|policy|help)|support.{0,20}r&l|پشتگیری|خزمەتگوزاری.{0,10}کڕیار|سياسة.{0,10}r&l)/iu.test(
      text,
    )
  )
    return { intent: "support", infer: false };
  if (
    /(?:photo|image|camera|وێنە|كاميرا|صورة|foto|عکس)/iu.test(text) &&
    /(?:product|identify|upload|کاڵا|ناس|منتج|محصول|foto hochladen)/iu.test(text)
  )
    return { intent: "identify", infer: false };
  if (finding.test(text)) {
    const intent = /compare|بەراورد|قارن|vergleichen|مقایسه/iu.test(text) ? "compare" : "search";
    // Welcome shortcuts ask a focused clarification without paying for inference.
    const generic =
      /^(?:کاڵایەکم بۆ بدۆزەوە|بەراوردی دوو کاڵام بۆ بکە|find a product|compare two products)$/iu.test(
        text,
      );
    return { intent, infer: !generic };
  }
  const previous = input.history.filter((m) => m.role === "user").at(-1)?.content ?? "";
  if (
    text.length <= 80 &&
    products.test(text) &&
    finding.test(previous) &&
    !instructionAttack(previous) &&
    !unrelatedTask(previous)
  )
    return { intent: "search", infer: true };
  return { intent: "refusal", infer: false };
}
