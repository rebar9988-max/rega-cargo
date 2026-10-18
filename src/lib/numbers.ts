/**
 * Owner decision (Oct 9 2026): every number uses Western digits (0-9) in every language,
 * including ckb, ar and fa. All Intl formatting goes through this locale, whose `-u-nu-latn`
 * extension pins the Latin numbering system regardless of the language.
 */
export const NUM_LOCALE = "en-GB-u-nu-latn";

const EASTERN = /[\u0660-\u0669\u06F0-\u06F9]/;

export function hasEasternDigits(text: string) {
  return EASTERN.test(text);
}

/** 1520 -> "1,520" with Western digits. */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(NUM_LOCALE, options).format(value);
}

const EASTERN_ARABIC_INDIC = /[\u0660-\u0669]/g;
const EASTERN_PERSIAN = /[\u06F0-\u06F9]/g;

/** Arabic-Indic (U+0660..0669) and Persian (U+06F0..06F9) digits become Western digits; other text is unchanged. */
export function westernDigits(text: string) {
  return text
    .replace(EASTERN_ARABIC_INDIC, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(EASTERN_PERSIAN, (digit) => String(digit.charCodeAt(0) - 0x06f0));
}

/**
 * Reads a typed number. Digits may be Western, Arabic-Indic or Persian (the keyboards in ckb, ar
 * and fa produce them); the decimal mark may be ".", "," or the Arabic decimal separator U+066B.
 * Anything else (letters, signs, exponents, several marks, over 20 characters) is NaN, never a
 * guess. `groupedThousands` lets "1,500" or "1\u066C500" mean 1500 for money-like fields.
 */
export function parseDecimal(value: unknown, options: { groupedThousands?: boolean } = {}): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return Number.NaN;
  let text = westernDigits(value.trim());
  if (!text || text.length > 20) return Number.NaN;
  if (options.groupedThousands)
    text = text.replace(
      /^(\d{1,3})((?:[,\u066C]\d{3})+)(?=$|[.\u066B])/,
      (_all, head: string, tail: string) => head + tail.replace(/[,\u066C]/g, ""),
    );
  text = text.replace(/[,\u066B]/, ".");
  return /^(?:\d+\.?\d*|\.\d+)$/.test(text) ? Number(text) : Number.NaN;
}
