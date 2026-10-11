import type { Lang } from "../langs.ts";
import * as extra from "./translations.ts";

export type ProductLinkCopy = {
  title: string;
  lede: string;
  link: string;
  kg: string;
  check: string;
  checking: string;
  estimateLabel: string;
  shipping: string;
  chargeable: string;
  days: string;
  noInfo: string;
  disclaimer: string;
  use: string;
  errors: Record<string, string>;
};

const en: ProductLinkCopy = {
  title: "Check a product link",
  lede: "Paste a link from Amazon, eBay or AliExpress to check it and estimate shipping. We do not open the link.",
  link: "Product link",
  kg: "Weight (kg)",
  check: "Check link",
  checking: "Checking…",
  estimateLabel: "Estimate",
  shipping: "Shipping to the selected destination",
  chargeable: "Chargeable weight",
  days: "Typical transit days",
  noInfo:
    "Product details are not available yet, so no title, photo or price is shown. Enter what you know in the form.",
  disclaimer:
    "This is an estimate, not a price offer. It excludes the goods and customs duty. R&L is not an official partner of these shops.",
  use: "Use this link in the request",
  errors: {
    url: "Enter a valid https product link.",
    host: "Only Amazon, eBay and AliExpress links are supported.",
    unsupported:
      "This looks like a shop page, search or short link. Open the product page and copy its address.",
    prohibited: "This product cannot be requested through R&L.",
    invalid: "Enter a weight from 0.1 to 70 kg.",
    rate: "Too many requests. Please wait a minute.",
    disabled: "This feature is not available.",
    unavailable: "The check is not available right now.",
  },
};

// TODO(translate-review): Sorani and Arabic strings below need native review.
const ckb: ProductLinkCopy = {
  title: "پشکنینی لینکی کاڵا",
  lede: "لینکێکی ئەمازۆن، ئیبەی یان ئەلی ئێکسپرێس دابنێ بۆ پشکنین و خەمڵاندنی گەیاندن. ئێمە لینکەکە ناکەینەوە.",
  link: "لینکی کاڵا",
  kg: "کێش (کگم)",
  check: "پشکنینی لینک",
  checking: "خەریکی پشکنینە…",
  estimateLabel: "خەمڵاندن",
  shipping: "گەیاندن بۆ شوێنی هەڵبژێردراو",
  chargeable: "کێشی حیسابکراو",
  days: "ڕۆژانی ئاسایی گەیاندن",
  noInfo:
    "وردەکاریی کاڵا هێشتا بەردەست نییە، بۆیە ناونیشان، وێنە و نرخ پیشان نادرێت. ئەوەی دەیزانیت لە فۆڕمەکەدا بینووسە.",
  disclaimer:
    "ئەمە خەمڵاندنە، پێشنیاری نرخ نییە. نرخی کاڵا و باجی گومرگ تێیدا نییە. R&L هاوبەشی فەرمیی ئەم فرۆشگایانە نییە.",
  use: "ئەم لینکە لە داواکارییەکەدا بەکاربهێنە",
  errors: {
    url: "لینکێکی https ی دروستی کاڵا بنووسە.",
    host: "تەنها لینکی ئەمازۆن، ئیبەی و ئەلی ئێکسپرێس پشتگیری دەکرێن.",
    unsupported:
      "ئەمە لاپەڕەی فرۆشگا، گەڕان یان لینکی کورتە. لاپەڕەی خودی کاڵاکە بکەرەوە و ناونیشانەکەی لەبەر بگرەوە.",
    prohibited: "ئەم کاڵایە لە ڕێگەی R&L وە داوا ناکرێت.",
    invalid: "کێشێک لە 0.1 تا 70 کگم بنووسە.",
    rate: "داواکاری زۆرە. خولەکێک چاوەڕێ بکە.",
    disabled: "ئەم تایبەتمەندییە بەردەست نییە.",
    unavailable: "پشکنین ئێستا بەردەست نییە.",
  },
};

const ar: ProductLinkCopy = {
  title: "التحقق من رابط منتج",
  lede: "الصق رابطاً من أمازون أو eBay أو AliExpress للتحقق منه وتقدير الشحن. لا نقوم بفتح الرابط.",
  link: "رابط المنتج",
  kg: "الوزن (كغ)",
  check: "تحقق من الرابط",
  checking: "جارٍ التحقق…",
  estimateLabel: "تقدير",
  shipping: "الشحن إلى الوجهة المحددة",
  chargeable: "الوزن المحتسب",
  days: "أيام العبور المعتادة",
  noInfo:
    "تفاصيل المنتج غير متاحة بعد، لذلك لا يظهر عنوان أو صورة أو سعر. أدخل ما تعرفه في النموذج.",
  disclaimer:
    "هذا تقدير وليس عرض سعر. لا يشمل ثمن البضاعة ولا الرسوم الجمركية. R&L ليست شريكاً رسمياً لهذه المتاجر.",
  use: "استخدم هذا الرابط في الطلب",
  errors: {
    url: "أدخل رابط منتج https صحيحاً.",
    host: "الروابط المدعومة: أمازون وeBay وAliExpress فقط.",
    unsupported: "يبدو هذا صفحة متجر أو بحثاً أو رابطاً مختصراً. افتح صفحة المنتج وانسخ عنوانها.",
    prohibited: "لا يمكن طلب هذا المنتج عبر R&L.",
    invalid: "أدخل وزناً من 0.1 إلى 70 كغ.",
    rate: "طلبات كثيرة. انتظر دقيقة.",
    disabled: "هذه الميزة غير متاحة.",
    unavailable: "التحقق غير متاح حالياً.",
  },
};

export function productLinkCopy(lang: Lang): ProductLinkCopy {
  switch (lang) {
    case "ckb":
      return ckb;
    case "ar":
      return ar;
    case "ku":
      return extra.ku;
    case "de":
      return extra.de;
    case "fa":
      return extra.fa;
    case "tr":
      return extra.tr;
    default:
      return en;
  }
}
