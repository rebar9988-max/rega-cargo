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
