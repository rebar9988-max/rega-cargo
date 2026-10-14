export const LANGS = [
  { id: "ckb", code: "CKB", name: "کوردیی ناوەندی", short: "کوردی", dir: "rtl", html: "ckb" },
  { id: "ku", code: "KU", name: "Kurmancî (Badînî)", short: "Kurdî", dir: "ltr", html: "ku" },
  { id: "de", code: "DE", name: "Deutsch", short: "Deutsch", dir: "ltr", html: "de" },
  { id: "en", code: "EN", name: "English", short: "English", dir: "ltr", html: "en" },
  { id: "ar", code: "AR", name: "العربية", short: "العربية", dir: "rtl", html: "ar" },
  { id: "fa", code: "FA", name: "فارسی", short: "فارسی", dir: "rtl", html: "fa" },
  { id: "tr", code: "TR", name: "Türkçe", short: "Türkçe", dir: "ltr", html: "tr" },
] as const;

/**
 * Page layout direction. Sorani is the app's primary language, so the layout stays
 * right-to-left for every locale (owner decision 2026-10-10): switching language never moves
 * the header, menu or grids. Each language's own text direction (`dir` above) still drives
 * fonts and the bidi direction of its text.
 */
export const LAYOUT_DIR = "rtl";

export type Lang = (typeof LANGS)[number]["id"];

export function isLang(value: string | null | undefined): value is Lang {
  return LANGS.some((item) => item.id === value);
}

export function langMeta(id: Lang) {
  return LANGS.find((item) => item.id === id) ?? LANGS[0];
}

export function isRtl(id: Lang) {
  return langMeta(id).dir === "rtl";
}
