import { isLang, type Lang } from "./langs.ts";
export type LocaleSearch = { lang?: Lang };
/** Additive URL locale state. Existing ku remains Kurmanji; ckb is Sorani. */
export function validateLocaleSearch(search: Record<string, unknown>): LocaleSearch {
  return { lang: typeof search.lang === "string" && isLang(search.lang) ? search.lang : undefined };
}
