import { NUM_LOCALE } from "./numbers.ts";
import type { Lang } from "@/lib/langs";

/** The one EUR → IQD rate used everywhere (UI, PDF rate sheet). Applied last, to the final euro-cent total. */
export const IQD_PER_EUR = 1520;
/** When IQD_PER_EUR was last set (shown next to dinar amounts). */
export const IQD_RATE_UPDATED = "2026-10-08";

export const SAMPLE_BOX = { kg: 3.2, l: 40, w: 30, h: 20 };

export type ModeId = "express" | "economy" | "road";
export type Contents = "documents" | "personal" | "commercial";

export type Mode = {
  id: ModeId;
  perKg: number;
  min: number;
  days: [number, number];
  divisor: number;
};

export type Origin = {
  id: string;
  city: string;
  cityKu: string;
  country: string;
  countryKu: string;
  code: string;
  factor: number;
};

export type Dest = {
  id: string;
  city: string;
  cityKu: string;
  surcharge: number;
};

export type Price = {
  volumetric: number;
  chargeable: number;
  volumetricWins: boolean;
  minApplied: boolean;
  bulky: boolean;
  /** Final price in integer euro cents (the value all money maths uses). */
  totalCents: number;
  /** totalCents / 100, for display. */
  total: number;
};

export type BookingDraft = {
  fromId: string;
  toId: string;
  mode: ModeId;
  total: number;
  kg: number;
  chargeable: number;
  contents: Contents;
};

export type HeldQuote = BookingDraft & { at: string };

export const MODES: Mode[] = [
  { id: "express", perKg: 7.8, min: 32, days: [3, 5], divisor: 5000 },
  { id: "economy", perKg: 4.6, min: 22, days: [6, 9], divisor: 5000 },
  { id: "road", perKg: 2.35, min: 18, days: [12, 18], divisor: 4000 },
];

export const ORIGINS: Origin[] = [
  { id: "ber", city: "Berlin", cityKu: "بەرلین", country: "Germany", countryKu: "ئەڵمانیا", code: "BER", factor: 1 },
  { id: "dus", city: "Düsseldorf", cityKu: "دوسلدۆرف", country: "Germany", countryKu: "ئەڵمانیا", code: "DUS", factor: 0.96 },
  { id: "ams", city: "Amsterdam", cityKu: "ئەمستردام", country: "Netherlands", countryKu: "هۆڵەندا", code: "AMS", factor: 0.98 },
  { id: "bru", city: "Brussels", cityKu: "برۆکسل", country: "Belgium", countryKu: "بەلجیکا", code: "BRU", factor: 1 },
  { id: "par", city: "Paris", cityKu: "پاریس", country: "France", countryKu: "فەڕەنسا", code: "PAR", factor: 1.04 },
  { id: "vie", city: "Vienna", cityKu: "ڤیەننا", country: "Austria", countryKu: "نەمسا", code: "VIE", factor: 1.05 },
  { id: "waw", city: "Warsaw", cityKu: "وارسۆ", country: "Poland", countryKu: "پۆڵەندا", code: "WAW", factor: 1.02 },
  { id: "mil", city: "Milan", cityKu: "میلان", country: "Italy", countryKu: "ئیتالیا", code: "MIL", factor: 1.12 },
  { id: "mad", city: "Madrid", cityKu: "مەدرید", country: "Spain", countryKu: "ئیسپانیا", code: "MAD", factor: 1.16 },
  { id: "sto", city: "Stockholm", cityKu: "ستۆکهۆڵم", country: "Sweden", countryKu: "سوید", code: "STO", factor: 1.14 },
  { id: "lon", city: "London", cityKu: "لەندەن", country: "United Kingdom", countryKu: "بەریتانیا", code: "LON", factor: 1.1 },
];

export const DESTS: Dest[] = [
  { id: "ebl", city: "Erbil", cityKu: "هەولێر", surcharge: 0 },
  { id: "sul", city: "Sulaymaniyah", cityKu: "سلێمانی", surcharge: 4 },
  { id: "dhk", city: "Duhok", cityKu: "دهۆک", surcharge: 6 },
  { id: "krk", city: "Kirkuk", cityKu: "کەرکووک", surcharge: 9 },
  { id: "bgw", city: "Baghdad", cityKu: "بەغدا", surcharge: 14 },
];

type Other = Exclude<Lang, "ckb" | "en">;

const CITY: Record<string, Partial<Record<Other, string>>> = {
  Berlin: { ku: "Berlîn", ar: "برلين", fa: "برلین", tr: "Berlin", de: "Berlin" },
  Düsseldorf: { ku: "Düsseldorf", ar: "دوسلدورف", fa: "دوسلدورف", tr: "Düsseldorf", de: "Düsseldorf" },
  Amsterdam: { ku: "Amsterdam", ar: "أمستردام", fa: "آمستردام", tr: "Amsterdam", de: "Amsterdam" },
  Brussels: { ku: "Bruksel", ar: "بروكسل", fa: "بروکسل", tr: "Brüksel", de: "Brüssel" },
  Paris: { ku: "Parîs", ar: "باريس", fa: "پاریس", tr: "Paris", de: "Paris" },
  Vienna: { ku: "Viyana", ar: "فيينا", fa: "وین", tr: "Viyana", de: "Wien" },
  Warsaw: { ku: "Warşova", ar: "وارسو", fa: "ورشو", tr: "Varşova", de: "Warschau" },
  Milan: { ku: "Mîlano", ar: "ميلانو", fa: "میلان", tr: "Milano", de: "Mailand" },
  Madrid: { ku: "Madrîd", ar: "مدريد", fa: "مادرید", tr: "Madrid", de: "Madrid" },
  Stockholm: { ku: "Stockholm", ar: "ستوكهولم", fa: "استکهلم", tr: "Stokholm", de: "Stockholm" },
  London: { ku: "London", ar: "لندن", fa: "لندن", tr: "Londra", de: "London" },
  Erbil: { ku: "Hewlêr", ar: "أربيل", fa: "اربیل", tr: "Erbil", de: "Erbil" },
  Sulaymaniyah: { ku: "Silêmanî", ar: "السليمانية", fa: "سلیمانیه", tr: "Süleymaniye", de: "Sulaimaniyya" },
  Duhok: { ku: "Dihok", ar: "دهوك", fa: "دهوک", tr: "Duhok", de: "Duhok" },
  Kirkuk: { ku: "Kerkûk", ar: "كركوك", fa: "کرکوک", tr: "Kerkük", de: "Kirkuk" },
  Baghdad: { ku: "Bexda", ar: "بغداد", fa: "بغداد", tr: "Bağdat", de: "Bagdad" },
};

const COUNTRY: Record<string, Partial<Record<Other, string>>> = {
  Germany: { ku: "Almanya", ar: "ألمانيا", fa: "آلمان", tr: "Almanya", de: "Deutschland" },
  Netherlands: { ku: "Holenda", ar: "هولندا", fa: "هلند", tr: "Hollanda", de: "Niederlande" },
  Belgium: { ku: "Belçîka", ar: "بلجيكا", fa: "بلژیک", tr: "Belçika", de: "Belgien" },
  France: { ku: "Fransa", ar: "فرنسا", fa: "فرانسه", tr: "Fransa", de: "Frankreich" },
  Austria: { ku: "Awistirya", ar: "النمسا", fa: "اتریش", tr: "Avusturya", de: "Österreich" },
  Poland: { ku: "Polonya", ar: "بولندا", fa: "لهستان", tr: "Polonya", de: "Polen" },
  Italy: { ku: "Îtalya", ar: "إيطاليا", fa: "ایتالیا", tr: "İtalya", de: "Italien" },
  Spain: { ku: "Spanya", ar: "إسبانيا", fa: "اسپانیا", tr: "İspanya", de: "Spanien" },
  Sweden: { ku: "Swêd", ar: "السويد", fa: "سوئد", tr: "İsveç", de: "Schweden" },
  "United Kingdom": { ku: "Brîtanya", ar: "المملكة المتحدة", fa: "بریتانیا", tr: "Birleşik Krallık", de: "Vereinigtes Königreich" },
};

export function placeName(place: { city: string; cityKu: string }, lang: Lang) {
  if (lang === "ckb") return place.cityKu;
  if (lang === "en") return place.city;
  return CITY[place.city]?.[lang] ?? place.city;
}

export function countryName(origin: { country: string; countryKu: string }, lang: Lang) {
  if (lang === "ckb") return origin.countryKu;
  if (lang === "en") return origin.country;
  return COUNTRY[origin.country]?.[lang] ?? origin.country;
}

function tenth(n: number) {
  return Math.round(n * 10) / 10;
}

/** Euro amount → integer cents. */
export function toCents(eur: number) {
  return Math.round(eur * 100);
}

/**
 * Prices are computed in integer euro cents. The rate step rounds once
 * (Math.round) to whole cents; minimum and destination surcharge are added as
 * integer cents; conversion to IQD happens only at the very end (iqdFromCents).
 * Formulas and numbers are unchanged: e.g. 4.8 kg × 7.80 = 37.44, 4.8 × 4.60 = 22.08,
 * road minimum 18.00 (locked by corridor.test.ts).
 */
export function priceShipment(input: {
  mode: Mode;
  origin: Origin;
  dest: Dest;
  weightKg: number;
  l: number;
  w: number;
  h: number;
}): Price {
  const volumetric = tenth((input.l * input.w * input.h) / input.mode.divisor);
  const chargeable = tenth(Math.max(input.weightKg, volumetric));
  const bulky = input.l > 120 || input.w > 120 || input.h > 120;
  let rated = chargeable * input.mode.perKg * input.origin.factor;
  if (bulky) rated *= 1.12;
  const ratedCents = toCents(rated);
  const minCents = toCents(input.mode.min);
  const minApplied = ratedCents < minCents;
  const totalCents = Math.max(ratedCents, minCents) + toCents(input.dest.surcharge);
  return {
    volumetric,
    chargeable,
    volumetricWins: volumetric > input.weightKg,
    minApplied,
    bulky,
    totalCents,
    total: totalCents / 100,
  };
}

/** Planning rates for the customs estimate (not a customs decision). Same numbers as before. */
export const DUTY_RULES = { personalFreeEur: 200, personalRate: 0.05, commercialRate: 0.08 } as const;

export function dutyEstimate(contents: Contents, declaredEur: number) {
  if (contents === "documents") return 0;
  if (contents === "personal" && declaredEur <= DUTY_RULES.personalFreeEur) return 0;
  const rate = contents === "personal" ? DUTY_RULES.personalRate : DUTY_RULES.commercialRate;
  return toCents(declaredEur * rate) / 100;
}

/** IQD from integer euro cents, rounded to whole dinars: the last step of every calculation. */
export function iqdFromCents(totalCents: number) {
  return Math.round((totalCents * IQD_PER_EUR) / 100);
}

export function formatEur(value: number) {
  return new Intl.NumberFormat(NUM_LOCALE, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatIqdFromEur(eur: number) {
  const iqd = iqdFromCents(toCents(eur));
  return `${new Intl.NumberFormat(NUM_LOCALE, { maximumFractionDigits: 0 }).format(iqd)} IQD`;
}

export function getOrigin(id?: string) {
  return ORIGINS.find((item) => item.id === id) ?? ORIGINS[0];
}

export function getDest(id?: string) {
  return DESTS.find((item) => item.id === id) ?? DESTS[0];
}

export function getMode(id?: string) {
  return MODES.find((item) => item.id === id) ?? MODES[1];
}
