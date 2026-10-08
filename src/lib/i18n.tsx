import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ar } from "@/lib/messages/ar";
import { de } from "@/lib/messages/de";
import { fa } from "@/lib/messages/fa";
import { ku } from "@/lib/messages/ku";
import { tr } from "@/lib/messages/tr";
import { isLang, langMeta, type Lang } from "@/lib/langs";

export type { Lang };

const en = {
  skip: "Skip to content",
  menuOpen: "Open menu",
  menuClose: "Close menu",
  brandSub: "MOVE SMART. DELIVER FAST.",
  nav: { home: "Home", quote: "Price", track: "Track", customs: "Customs", stores: "Bazaar", market: "Compare", move: "Move", contact: "Contact" },
  footerBlurb: "One corridor. Europe, Kurdistan, and Iraq.",
  footerNote: "© 2026 R&L. Rates on this page are planning figures, confirmed before collection.",
  hubsTitle: "Desks",
  hubs: [
    { name: "Erbil gateway", detail: "Kurdistan Region" },
    { name: "Düsseldorf hub", detail: "Germany" },
    { name: "London desk", detail: "United Kingdom" },
  ],
  hoursTitle: "Hours",
  hours: [
    "Erbil · Sat–Thu · 09:00–18:00",
    "Düsseldorf · Mon–Fri · 09:00–17:00",
    "London · Mon–Fri · 09:00–17:00",
  ],
  hero: {
    kicker: "EUROPE ↔ KURDISTAN ↔ IRAQ",
    title: "From a European door to a Kurdish one.",
    lede: "R&L moves parcels and commercial cargo on a single corridor. You see the chargeable weight, the euro and the dinar, and every scan — before anything leaves.",
    fullQuote: "Price the real box",
    track: "Track a sample",
  },
  stats: [
    { v: "11", k: "European collection cities" },
    { v: "3", k: "Speeds, one invoice" },
    { v: "EBL", k: "Clearance at the Erbil gateway" },
    { v: "IQD", k: "Dinar beside the euro, not instead of it" },
  ],
  stepsKicker: "How it moves",
  stepsTitle: "Four steps. No marketplace in the middle.",
  steps: [
    { title: "Collect", body: "Drop it at a city hub, or we collect from the address." },
    { title: "See it", body: "We weigh, measure, and photograph. The hub record exists before it flies or rolls." },
    { title: "Choose", body: "Air express, air economy, or road through Turkey — priced side by side." },
    { title: "Arrive", body: "Clearance at Erbil, then the door in the city you named." },
  ],
  gapKicker: "The missing piece",
  gapTitle: "The corridor was either a shop, or a brochure.",
  gapLede: "Shopping apps sell the product. Brochure forwarders sell a phone call. R&L sells the movement, with the number on the page.",
  columns: [
    {
      title: "Shopping apps",
      items: ["Built to sell goods, not to move freight", "One vague delivery window", "The price lives in a chat"],
    },
    {
      title: "Brochure forwarders",
      items: ["“Request a quote”, then a wait", "Tracking means calling the office", "Kurdish is a flag, not the product"],
    },
    {
      title: "R&L",
      items: [
        "Euro and dinar on the same screen",
        "Chargeable weight explained, not buried",
        "Every scan is a milestone you can open",
        "Seven languages, each one actually finished",
      ],
    },
  ],
  modesKicker: "Speeds",
  modesTitle: "Three ways. No surprise fourth invoice.",
  modesLede: "A 3.2 kg parcel, Berlin to Erbil, in a 40 × 30 × 20 cm box. The box is heavier than the scale — so the box sets the air price.",
  usual: "Most parcels",
  modes: {
    express: {
      name: "Air express",
      blurb: "When a week is too long. Documents, parts, and anything a shop cannot wait on.",
    },
    economy: {
      name: "Air economy",
      blurb: "The one most parcels should use. Same air corridor, a calmer price.",
    },
    road: {
      name: "Road via Turkey",
      blurb: "When the calendar allows. The honest cheaper seat — not a hidden delay.",
    },
  },
  dayRange: "{a}–{b} days",
  saveVs: "less than express",
  boardKicker: "Network",
  boardTitle: "Where we actually run",
  boardLede: "Eleven collection cities. Two European desks. One gateway in Erbil, then the door.",
  europeTitle: "Collect in Europe",
  kurdistanTitle: "Deliver in Kurdistan and Iraq",
  gateway: "Gateway — included",
  cityDrop: "city delivery",
  boardNote:
    "Continental parcels consolidate in Düsseldorf. The UK uses the London desk. Road freight crosses at Ibrahim Khalil; air arrives at Erbil.",
  faqKicker: "Before you send it",
  faqTitle: "Straight answers",
  faq: [
    {
      q: "Do you buy the goods for me?",
      a: "No. Shopping apps already do that, mixed in with the freight. R&L collects what you bought, or your company’s cargo, and moves it.",
    },
    {
      q: "Why is the price higher than the kilos on my scale?",
      a: "Carriers bill the greater of actual weight and volumetric weight: length × width × height, divided by 5,000 for air and 4,000 for road. The quote shows both. If the box is the reason, we say so.",
    },
    {
      q: "Which speed should I pick?",
      a: "Express when a week is too long. Economy for most parcels. Road when the saving matters more than the days, and the goods can wait.",
    },
    {
      q: "Who pays customs?",
      a: "The receiver. We file at the Erbil gateway, or via Ibrahim Khalil for road, and we keep duty separate from freight so the freight price does not hide a tax.",
    },
    {
      q: "Is this a confirmed booking?",
      a: "The number is a planning rate from today’s table. A coordinator confirms it before pickup. Peak weeks and a remote collection can nudge it.",
    },
  ],
  closeTitle: "Price it with the real box, not a guess.",
  closeLede: "Change the city, the kilos, and the carton. The three speeds stay on one screen.",
  waybill: "Waybill",
  quoteKicker: "Price",
  quoteTitle: "A rate you can read.",
  quoteLede: "Chargeable weight, lane factor, city delivery, and duty — split apart. Nothing here is a hidden fourth line.",
  from: "From",
  to: "To",
  weight: "Weight",
  length: "Length",
  width: "Width",
  height: "Height",
  pieces: "Pieces",
  inside: "What is inside",
  value: "Declared value",
  contentsOpt: {
    documents: "Documents",
    personal: "Personal effects",
    commercial: "Commercial cargo",
  },
  scale: "Scale",
  volumeWord: "Volume",
  chargeable: "Chargeable",
  boxSets: "The box sets this price, not the scale.",
  minApplied: "Raised to the mode minimum",
  bulky: "A side over 120 cm adds 12%",
  changeBox: "Change the box",
  book: "Book this rate",
  save: "Keep on this device",
  saved: "Kept on this device.",
  heldTitle: "Kept rates",
  remove: "Remove",
  freight: "Freight",
  duty: "Duty, separate",
  dutyDocs: "Documents are usually not dutiable.",
  dutyLow: "Under €200 — often inside a personal allowance. Confirm before you ship.",
  dutyPlan: "A planning percentage, not a customs ruling.",
  footnote:
    "Planning rates for today. A coordinator confirms before collection. Fuel and peak weeks can move them slightly. 1 euro ≈ 1,520 dinars, so the figure is readable at home — not a bank rate.",
  weightError: "Enter a weight between 0.2 and 300 kg.",
  dimError: "Dimensions must be between 0 and 300 cm. Use 0 if you do not know the box yet.",
  perPiece: "The price covers the total weight, not each piece.",
  cm: "cm",
  kg: "kg",
  trackKicker: "Track",
  trackTitle: "Follow the corridor, scan by scan.",
  trackLede: "Four demonstration shipments, so you can see the milestone record before you have one of your own.",
  trackLabel: "Shipment number",
  trackButton: "Track",
  samples: "Open a sample",
  notFound: "That number is not in the sample book.",
  photoOnFile: "Photograph on file",
  hubRecord: "Hub record",
  nowLabel: "Current",
  expected: "Expected",
  customsKicker: "Customs desk",
  customsTitle: "Duty stays visible. It is not folded into the freight.",
  customsLede:
    "A planning guide for this corridor — not a customs ruling and not legal advice. The officer on the day decides. We would rather show the shape of the cost than pretend it is zero.",
  lanesTitle: "Three kinds of goods",
  lanes: [
    {
      title: "Documents",
      body: "Contracts, copies, company papers. Usually no duty. Declare them anyway so the gateway does not guess.",
    },
    {
      title: "Personal effects",
      body: "Clothes, gifts, a phone you already own. Keep the receipt. Under about €200 the duty is often nothing; above that, plan a small percentage.",
    },
    {
      title: "Commercial cargo",
      body: "Stock for a shop. It needs a real invoice, matching names, and a packing list. Duty is a separate number from our freight.",
    },
  ],
  flowTitle: "How release actually happens",
  flow: [
    "Papers are checked at the European hub, before export.",
    "Air arrives at Erbil. Road arrives through Ibrahim Khalil, then the gateway.",
    "The declaration is filed in the receiver’s name.",
    "If there is duty, you see it before release.",
    "The city desk takes it to the door.",
  ],
  bannedTitle: "Do not send",
  banned: [
    "Weapons and ammunition",
    "Alcohol",
    "Loose lithium batteries",
    "Counterfeit goods",
    "Medicines in bulk, or narcotics",
    "Drones without a permit",
    "Undeclared cash or precious metal",
    "Perishable food",
  ],
  docsTitle: "What we need from you",
  docs: [
    "A purchase receipt or a commercial invoice",
    "The receiver’s full name and a phone that answers",
    "A city and a landmark, not only a district",
    "A packing list when there is more than one piece",
    "A company tax identity for commercial cargo",
  ],
  contactKicker: "Contact",
  contactTitle: "Tell us what is moving.",
  contactLede: "Name, a phone, and the city. If you priced a rate, it stays attached. On this demo the request remains in your browser.",
  name: "Name",
  phone: "Phone",
  city: "Receiver’s city",
  note: "What are you sending?",
  send: "Save the request",
  formError: "Name and phone are both required.",
  successTitle: "Saved on this device.",
  successBody: "In the live service this reaches the Erbil desk. Here it stays in the browser so you can see the flow.",
  attached: "Attached rate",
  clearRate: "Remove rate",
  yourRequests: "Requests on this device",
  another: "Write another",
};

const ckb = {
  skip: "بازدان بۆ ناوەڕۆک",
  menuOpen: "کردنەوەی مێنیو",
  menuClose: "داخستنی مێنیو",
  brandSub: "MOVE SMART. DELIVER FAST.",
  nav: { home: "سەرەتا", quote: "نرخ", track: "شوێنپێکردن", customs: "گومرگ", stores: "بازاڕ", market: "بەراورد", move: "گەیاندن", contact: "پەیوەندی" },
  footerBlurb: "یەک ڕێڕەو. ئەوروپا، کوردستان و عێراق.",
  footerNote: "© 2026 R&L. نرخەکانی ئەم پەڕەیە بۆ پلاندانانن و پێش کۆکردنەوە پشتڕاست دەکرێنەوە.",
  hubsTitle: "مێزەکان",
  hubs: [
    { name: "دەروازەی هەولێر", detail: "هەرێمی کوردستان" },
    { name: "کۆگای دوسلدۆرف", detail: "ئەڵمانیا" },
    { name: "مێزی لەندەن", detail: "بەریتانیا" },
  ],
  hoursTitle: "کاتەکان",
  hours: [
    "هەولێر · شەممە–پێنجشەممە · 09:00–18:00",
    "دوسلدۆرف · دووشەممە–هەینی · 09:00–17:00",
    "لەندەن · دووشەممە–هەینی · 09:00–17:00",
  ],
  hero: {
    kicker: "EUROPE ↔ KURDISTAN ↔ IRAQ",
    title: "لە دەرگایەکی ئەوروپییەوە بۆ دەرگایەکی کوردی.",
    lede: "R&L پاکەت و باری بازرگانی لەسەر یەک ڕێڕەو دەگوازێتەوە. کێشی حیسابکراو، یۆرۆ و دینار، و هەر سکانێک دەبینیت — پێش ئەوەی هیچ شتێک بڕوات.",
    fullQuote: "نرخی سندووقە ڕاستەقینەکە",
    track: "نموونەیەک شوێن بکە",
  },
  stats: [
    { v: "11", k: "شاری کۆکردنەوە لە ئەوروپا" },
    { v: "3", k: "خێرایی، یەک پسوولە" },
    { v: "EBL", k: "گومرگ لە دەروازەی هەولێر" },
    { v: "IQD", k: "دینار لە تەنیشت یۆرۆ، نەک لە جیاتی" },
  ],
  stepsKicker: "چۆن دەڕوات",
  stepsTitle: "چوار هەنگاو. بێ بازاڕ لە ناوەڕاستدا.",
  steps: [
    { title: "کۆکردنەوە", body: "لە کۆگای شارەکە بیدە، یان لە ناونیشانەکەوە کۆی دەکەینەوە." },
    { title: "بینینی", body: "کێشی دەکەین، پێوانەی دەکەین، وێنەی دەگرین. تۆماری کۆگا هەیە پێش ئەوەی بفڕێت یان بڕوات." },
    { title: "هەڵبژاردن", body: "ئێکسپرێسی ئاسمانی، ئابووری ئاسمانی، یان وشکانی لە ڕێگەی تورکیا — نرخەکانیان تەنیشت یەک." },
    { title: "گەیشتن", body: "گومرگ لە هەولێر، پاشان دەرگا لەو شارەی دیاریت کردووە." },
  ],
  gapKicker: "ئەوەی کەمە",
  gapTitle: "ڕێڕەوەکە یان فرۆشگا بوو، یان بروشور.",
  gapLede: "ئەپەکانی کڕین کاڵا دەفرۆشن. کۆمپانیای بروشور پەیوەندییەک دەفرۆشێت. R&L خودی جووڵەکە دەفرۆشێت، بە ژمارەکەوە لەسەر پەڕەکە.",
  columns: [
    {
      title: "ئەپەکانی کڕین",
      items: ["دروستکراون بۆ فرۆشتنی کاڵا، نەک گواستنەوەی بار", "یەک کاتی گەیشتنی نادیار", "نرخەکە لە ناو چاتێکدایە"],
    },
    {
      title: "کۆمپانیای بروشور",
      items: ["«داوای نرخ»، پاشان چاوەڕوانی", "شوێنپێکردن واتە پەیوەندی بە ئۆفیس", "کوردی ئاڵایەکە، نەک خودی بەرهەمەکە"],
    },
    {
      title: "R&L",
      items: [
        "یۆرۆ و دینار لە یەک شاشە",
        "کێشی حیسابکراو ڕوون دەکرێتەوە، ناشاردرێتەوە",
        "هەر سکانێک قۆناغێکە دەتوانیت بیکەیتەوە",
        "حەوت زمان، هەریەکەیان تەواو",
      ],
    },
  ],
  modesKicker: "خێراییەکان",
  modesTitle: "سێ ڕێگا. بێ پسوولەی چوارەمی شاراوە.",
  modesLede: "پاکەتێکی ٣٫٢ کیلۆ، لە بەرلینەوە بۆ هەولێر، لە سندووقێکی ٤٠ × ٣٠ × ٢٠ سم. سندووقەکە لە تەرازوو قورسترە — بۆیە سندووقەکە نرخی ئاسمانی دادەنێت.",
  usual: "زۆربەی پاکەتەکان",
  modes: {
    express: {
      name: "ئێکسپرێسی ئاسمانی",
      blurb: "کاتێک هەفتەیەک زۆر درەنگە. بەڵگەنامە، پارچە، و هەر شتێک فرۆشگا ناتوانێت چاوەڕوانی بکات.",
    },
    economy: {
      name: "ئابووری ئاسمانی",
      blurb: "ئەوەی زۆربەی پاکەتەکان دەبێت بەکاری بهێنن. هەمان ڕێڕەوی ئاسمانی، نرخی ئارامتر.",
    },
    road: {
      name: "وشکانی لە ڕێگەی تورکیا",
      blurb: "کاتێک ڕۆژژمێرەکە ڕێگە دەدات. کورسییە هەرزانە ڕاستگۆیەکە — نەک دواکەوتنێکی شاراوە.",
    },
  },
  dayRange: "{a}–{b} ڕۆژ",
  saveVs: "کەمتر لە ئێکسپرێس",
  boardKicker: "تۆڕ",
  boardTitle: "لەکوێ بەڕاستی کار دەکەین",
  boardLede: "یازدە شاری کۆکردنەوە. دوو مێز لە ئەوروپا. یەک دەروازە لە هەولێر، پاشان دەرگا.",
  europeTitle: "کۆکردنەوە لە ئەوروپا",
  kurdistanTitle: "گەیاندن لە کوردستان و عێراق",
  gateway: "دەروازە — لە ناو نرخەکەدایە",
  cityDrop: "گەیاندنی شار",
  boardNote:
    "پاکەتی کیشوەرەکە لە دوسلدۆرف کۆدەبێتەوە. بەریتانیا مێزی لەندەن بەکاردەهێنێت. باری وشکانی لە ئیبراهیم خەلیل دەپەڕێتەوە؛ ئاسمانی دەگاتە هەولێر.",
  faqKicker: "پێش ناردن",
  faqTitle: "وەڵامی ڕاستەوخۆ",
  faq: [
    {
      q: "ئایا کاڵاکەم بۆ دەکڕن؟",
      a: "نەخێر. ئەپەکانی کڕین ئەو کارە دەکەن، بەڵام لەگەڵ گواستنەوە تێکەڵی دەکەن. R&L ئەوە دەگوازێتەوە کە خۆت کڕیوتە، یان باری کۆمپانیاکەت.",
    },
    {
      q: "بۆچی نرخەکە لە کیلۆکانی تەرازوو بەرزترە؟",
      a: "کۆمپانیاکان گەورەتری کێشی ڕاستەقینە و کێشی قەبارەیی حیساب دەکەن: درێژی × پانی × بەرزی، بۆ ئاسمانی دابەش دەکرێت بەسەر ٥٠٠٠ و بۆ وشکانی بەسەر ٤٠٠٠. نرخەکە هەردووکیان پیشان دەدات. ئەگەر سندووقەکە هۆکار بێت، دەیڵێین.",
    },
    {
      q: "کام خێرایی هەڵبژێرم؟",
      a: "ئێکسپرێس کاتێک هەفتەیەک زۆر درەنگ بێت. ئابووری بۆ زۆربەی پاکەتەکان. وشکانی کاتێک پاشەکەوت گرنگتر بێت لە ڕۆژەکان و کاڵاکە بتوانێت چاوەڕوان بکات.",
    },
    {
      q: "کێ گومرگ دەدات؟",
      a: "وەرگر. لە دەروازەی هەولێر تۆماری دەکەین، یان لە ڕێگەی ئیبراهیم خەلیل بۆ وشکانی، و باج لە کرێی گواستنەوە جیا دەکەینەوە بۆ ئەوەی نرخەکە باجێک نشارێتەوە.",
    },
    {
      q: "ئایا ئەمە حیجزکردنی پشتڕاستکراوەیە؟",
      a: "ئەم ژمارەیە نرخی پلاندانانە لە خشتەی ئەمڕۆ. پێش کۆکردنەوە هاوکارێک پشتڕاستی دەکاتەوە. هەفتەی قەرەباڵغ و کۆکردنەوەی دوور دەتوانن کەمێکی بگۆڕن.",
    },
  ],
  closeTitle: "بە سندووقە ڕاستەقینەکە نرخی دابنێ، نەک بە مەزەندە.",
  closeLede: "شار و کیلۆ و کارتۆنەکە بگۆڕە. هەر سێ خێراییەکە لە یەک شاشەدا دەمێننەوە.",
  waybill: "بارنامە",
  quoteKicker: "نرخ",
  quoteTitle: "نرخێک کە دەتوانیت بیخوێنیتەوە.",
  quoteLede: "کێشی حیسابکراو، هاوکۆلکەی ڕێڕەو، گەیاندنی شار، و باجی گومرگ — لێک جیا. هیچ شتێک لێرە هێڵی چوارەمی شاراوە نییە.",
  from: "لە",
  to: "بۆ",
  weight: "کێش",
  length: "درێژی",
  width: "پانی",
  height: "بەرزی",
  pieces: "پارچە",
  inside: "چی لە ناویدایە",
  value: "نرخی ڕاگەیەندراو",
  contentsOpt: {
    documents: "بەڵگەنامە",
    personal: "کەلوپەلی کەسی",
    commercial: "باری بازرگانی",
  },
  scale: "تەرازوو",
  volumeWord: "قەبارە",
  chargeable: "حیسابکراو",
  boxSets: "سندووقەکە ئەم نرخە دادەنێت، نەک تەرازوو.",
  minApplied: "بەرزکرایەوە بۆ کەمترین کرێی ئەم شێوازە",
  bulky: "لایەک لە ١٢٠ سم گەورەتر بێت ١٢٪ زیاد دەکات",
  changeBox: "سندووقەکە بگۆڕە",
  book: "ئەم نرخە حیجز بکە",
  save: "لەسەر ئەم ئامێرە بیپارێزە",
  saved: "لەسەر ئەم ئامێرە پارێزرا.",
  heldTitle: "نرخە پارێزراوەکان",
  remove: "سڕینەوە",
  freight: "کرێی گواستنەوە",
  duty: "باج، جیا",
  dutyDocs: "بەڵگەنامە زۆرجار باجی گومرگی لەسەر نییە.",
  dutyLow: "ژێر ٢٠٠ یۆرۆ — زۆرجار لە ناو سنووری کەسیدایە. پێش ناردن پشتڕاستی بکەرەوە.",
  dutyPlan: "ڕێژەیەکی پلاندانانە، بڕیاری گومرگ نییە.",
  footnote:
    "نرخی پلاندانانی ئەمڕۆ. هاوکارێک پێش کۆکردنەوە پشتڕاستی دەکاتەوە. سووتەمەنی و هەفتەی قەرەباڵغ دەتوانن کەمێکی بگۆڕن. ١ یۆرۆ ≈ ١٬٥٢٠ دینار، بۆ ئەوەی لە ماڵەوە بخوێندرێتەوە — نرخی بانک نییە.",
  weightError: "کێشێک لە نێوان ٠٫٢ و ٣٠٠ کیلۆ بنووسە.",
  dimError: "پێوانە دەبێت لە نێوان ٠ و ٣٠٠ سم بێت. ئەگەر سندووقەکەت نازانیت، ٠ بنووسە.",
  perPiece: "نرخەکە کۆی کێشەکە دەگرێتەوە، نەک هەر پارچەیەک بە جیا.",
  cm: "سم",
  kg: "کگم",
  trackKicker: "شوێنپێکردن",
  trackTitle: "ڕێڕەوەکە شوێن بکە، سکان بە سکان.",
  trackLede: "چوار باری نموونە، بۆ ئەوەی تۆماری قۆناغەکان ببینیت پێش ئەوەی هی خۆت هەبێت.",
  trackLabel: "ژمارەی بار",
  trackButton: "شوێن بکە",
  samples: "نموونەیەک بکەرەوە",
  notFound: "ئەم ژمارەیە لە دەفتەری نموونەدا نییە.",
  photoOnFile: "وێنە لە فایلدایە",
  hubRecord: "تۆماری کۆگا",
  nowLabel: "ئێستا",
  expected: "چاوەڕوان دەکرێت",
  customsKicker: "مێزی گومرگ",
  customsTitle: "باجەکە دیار دەمێنێت. ناخزێنرێتە ناو کرێی گواستنەوە.",
  customsLede:
    "ڕێنماییەکی پلاندانان بۆ ئەم ڕێڕەوە — نە بڕیاری گومرگە و نە ڕاوێژی یاسایی. ئەفسەری ئەو ڕۆژە بڕیار دەدات. باشترە شێوەی تێچوونەکە پیشان بدەین وەک لەوەی وا پیشان بدەین کە سفرە.",
  lanesTitle: "سێ جۆری کاڵا",
  lanes: [
    {
      title: "بەڵگەنامە",
      body: "گرێبەست، کۆپی، کاغەزی کۆمپانیا. زۆرجار بێ باج. هێشتا ڕایبگەیەنە بۆ ئەوەی دەروازەکە مەزەندە نەکات.",
    },
    {
      title: "کەلوپەلی کەسی",
      body: "جلوبەرگ، دیاری، مۆبایلێک کە خۆت هەتە. پسوولەکە بپارێزە. ژێر نزیکەی ٢٠٠ یۆرۆ زۆرجار باج نییە؛ لە سەروویەوە، ڕێژەیەکی بچووک بخە پلانەوە.",
    },
    {
      title: "باری بازرگانی",
      body: "کۆگای فرۆشگا. پێویستی بە پسوولەیەکی ڕاستەقینە، ناوی یەکگرتوو، و لیستی پاکەت هەیە. باج ژمارەیەکی جیاوازە لە کرێی ئێمە.",
    },
  ],
  flowTitle: "ئازادکردن بەڕاستی چۆن دەبێت",
  flow: [
    "کاغەزەکان لە کۆگای ئەوروپا دەپشکنرێن، پێش هەناردە.",
    "ئاسمانی دەگاتە هەولێر. وشکانی لە ئیبراهیم خەلیل دێت، پاشان دەروازە.",
    "تۆمارەکە بە ناوی وەرگر دەنووسرێت.",
    "ئەگەر باج هەبێت، پێش ئازادکردن دەیبینیت.",
    "مێزی شار دەیباتە دەرگا.",
  ],
  bannedTitle: "مەینێرە",
  banned: [
    "چەک و تەقەمەنی",
    "مەی",
    "پاتری لیسیۆمی بەتاڵ لە ئامێر",
    "کاڵای ساختە",
    "دەرمان بە بڕی زۆر، یان ماددەی هۆشبەر",
    "درۆن بێ مۆڵەت",
    "پارەی نەڕاگەیەندراو یان کانزای بەنرخ",
    "خۆراکی خێرا تێکدەچێت",
  ],
  docsTitle: "چیمان لێت پێویستە",
  docs: [
    "پسوولەی کڕین یان پسوولەی بازرگانی",
    "ناوی تەواوی وەرگر و ژمارەیەک وەڵام دەداتەوە",
    "شار و نیشانەیەک، نەک تەنها ناوی گەڕەک",
    "لیستی پاکەت کاتێک لە یەک پارچە زیاترە",
    "ناسنامەی باجی کۆمپانیا بۆ باری بازرگانی",
  ],
  contactKicker: "پەیوەندی",
  contactTitle: "پێمان بڵێ چی دەجوڵێت.",
  contactLede: "ناو، ژمارەیەک، و شارەکە. ئەگەر نرخێکت دانابێت، پێوەی دەمێنێتەوە. لەم نموونەیەدا داواکارییەکە لە وێبگەڕەکەتدا دەمێنێتەوە.",
  name: "ناو",
  phone: "ژمارە",
  city: "شاری وەرگر",
  note: "چی دەنێریت؟",
  send: "داواکارییەکە پاشەکەوت بکە",
  formError: "ناو و ژمارە هەردووکیان پێویستن.",
  successTitle: "لەسەر ئەم ئامێرە تۆمار کرا.",
  successBody: "لە خزمەتگوزاریی ڕاستەقینەدا ئەمە دەگاتە مێزی هەولێر. لێرە لە وێبگەڕەکەدا دەمێنێتەوە بۆ ئەوەی ڕێڕەوەکە ببینیت.",
  attached: "نرخی هاوپێچ",
  clearRate: "لابردنی نرخ",
  yourRequests: "داواکارییەکانی ئەم ئامێرە",
  another: "یەکێکی تر بنووسە",
} satisfies typeof en;

export type Copy = typeof en;

const catalog: Record<Lang, Copy> = { ckb, ku, de, en, ar, fa, tr };

type Ctx = { lang: Lang; t: Copy; setLang: (lang: Lang) => void };

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ckb");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("rega-lang");
    const settled = window.localStorage.getItem("rega-lang-v3") === "1";
    let next: Lang = "ckb";
    if (settled && isLang(saved)) next = saved;
    else if (saved === "en") next = "en";
    else if (isLang(saved) && saved !== "ku") next = saved;
    window.localStorage.setItem("rega-lang", next);
    window.localStorage.setItem("rega-lang-v3", "1");
    setLang(next);
    setReady(true);
  }, []);

  useEffect(() => {
    const meta = langMeta(lang);
    document.documentElement.lang = meta.html;
    document.documentElement.dir = "ltr";
    document.documentElement.dataset.textdir = meta.dir;
    if (ready) window.localStorage.setItem("rega-lang", lang);
  }, [lang, ready]);

  const value = useMemo<Ctx>(() => ({ lang, t: catalog[lang], setLang }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function dayRange(template: string, a: number, b: number) {
  return template.replace("{a}", String(a)).replace("{b}", String(b));
}
