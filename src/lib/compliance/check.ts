/**
 * The one compliance check used everywhere (product writes, user text, search, autocomplete,
 * link generation). Pure and isomorphic: the server unions DB rules into it (service.server.ts);
 * the browser uses the bundled list. There is deliberately no option that turns it off.
 *
 * Normalisation: NFKC, then the shared search fold (lower case, Latin accents removed,
 * ي/ی/ى, ك/ک, ة/ە/ه, أ/إ/آ/ا folded, harakat and tatweel removed, punctuation to spaces).
 *
 * Matching is on whole tokens (so ginger, hammer, Hamburg, rummy, Ginkgo never match gin/ham/rum)
 * and on multi-word phrases. Variants accepted for a token:
 *  - Arabic-script prefixes ال, و, وال, بال, لل, فال, كال (remainder of 3+ letters). A bare ب/ل/ف
 *    is NOT stripped: it would turn names like برهان into رهان.
 *  - Arabic/Kurdish/Persian suffixes کان, که, یک, ان, ها, ات, ی (keyword of 4+ letters).
 *  - Latin plural/inflection s, es, lar, ler (keyword of 4+ letters).
 */
import { fold } from "../search/normalize.ts";
import {
  ALCOHOL_FREE_PHRASES,
  ALLOWED_PHRASES,
  BUNDLED_KEYWORDS,
  type KeywordLevel,
} from "./rules.ts";

export type Rule = { category: string; keyword: string; level: KeywordLevel };
export type Match = Rule & { field?: string };
export type Decision = "allow" | "review" | "block";
export type CheckResult = { decision: Decision; matches: Match[] };

type Entry = { rule: Rule; tokens: string[] };
export type CompiledRules = { first: Map<string, Entry[]>; size: number };

export const normalizeText = (text: string) => fold(String(text ?? "").normalize("NFKC"));
const ARABIC = /[\u0600-\u06FF]/;
const PREFIXES = ["وال", "بال", "فال", "کال", "لل", "ال", "و"];
const AR_SUFFIXES = ["کان", "که", "یک", "ان", "ها", "ات", "ی"];
const LATIN_SUFFIXES = ["lar", "ler", "es", "s"];

/** Every base form a text token could be (itself, minus a prefix and/or a suffix). */
function variants(token: string): string[] {
  const out = new Set([token]);
  if (ARABIC.test(token)) {
    const bases = [token];
    for (const p of PREFIXES) {
      if (token.startsWith(p) && token.length - p.length >= 3) bases.push(token.slice(p.length));
    }
    for (const b of bases) {
      out.add(b);
      for (const s of AR_SUFFIXES) {
        if (b.endsWith(s) && b.length - s.length >= 4) out.add(b.slice(0, -s.length));
      }
    }
  } else {
    for (const s of LATIN_SUFFIXES) {
      if (token.endsWith(s) && token.length - s.length >= 4) out.add(token.slice(0, -s.length));
    }
  }
  return [...out];
}

export function compileRules(rules: Iterable<Rule>): CompiledRules {
  const first = new Map<string, Entry[]>();
  const seen = new Set<string>();
  let size = 0;
  for (const rule of rules) {
    const tokens = normalizeText(rule.keyword).split(" ").filter(Boolean);
    if (!tokens.length) continue;
    const key = `${rule.category}|${tokens.join(" ")}`;
    if (seen.has(key)) {
      // keep the strictest level when the same word appears twice
      if (rule.level === "block") {
        for (const e of first.get(tokens[0]!) ?? []) {
          if (e.rule.category === rule.category && e.tokens.join(" ") === tokens.join(" "))
            e.rule = { ...e.rule, level: "block" };
        }
      }
      continue;
    }
    seen.add(key);
    size += 1;
    const list = first.get(tokens[0]!) ?? [];
    list.push({ rule: { ...rule, keyword: rule.keyword }, tokens });
    first.set(tokens[0]!, list);
  }
  return { first, size };
}

export const BUNDLED_RULES: CompiledRules = compileRules(BUNDLED_KEYWORDS);

const ALLOWED = ALLOWED_PHRASES.map((p) => normalizeText(p).split(" "));
const ALCOHOL_FREE = ALCOHOL_FREE_PHRASES.map((p) => normalizeText(p)).filter(
  (p) => !/^0 0$/.test(p),
);
const ZERO_PERCENT = /(^|[^\d])0[.,]0\s*%/;

function tokenMatches(token: string, want: string, last: boolean): boolean {
  if (token === want) return true;
  return variants(token).includes(want) && (last || ARABIC.test(token));
}

const PERCENT = /%[0-9a-f]{2}/i;
const PERCENT_RUN = /(?:%[0-9a-f]{2})+/gi;

/**
 * Links keep product names percent-encoded ("Absolut%20Vodka", Arabic/Kurdish slugs), which would
 * otherwise hide them from the token match. The decoded copy is appended, never substituted, so
 * a match on either form counts. Up to three passes undo double encoding (%2556); malformed
 * sequences stay as they are.
 */
export function withDecodedUrlText(text: string): string {
  let decoded = text;
  for (let pass = 0; pass < 3 && PERCENT.test(decoded); pass += 1) {
    const next = decoded.replace(PERCENT_RUN, (run) => {
      try {
        return decodeURIComponent(run);
      } catch {
        return run;
      }
    });
    if (next === decoded) break;
    decoded = next;
  }
  return decoded === text ? text : `${text} \n ${decoded}`;
}

/** Every rule matched in `text` (alcohol rules downgraded to review in alcohol-free wording). */
export function findMatches(text: string, rules: CompiledRules = BUNDLED_RULES): Match[] {
  const raw = withDecodedUrlText(String(text ?? ""))
    .normalize("NFKC")
    .toLowerCase();
  const norm = normalizeText(raw);
  if (!norm) return [];
  const tokens = norm.split(" ");
  const skip = new Array<boolean>(tokens.length).fill(false);
  for (const phrase of ALLOWED) {
    for (let i = 0; i + phrase.length <= tokens.length; i += 1) {
      if (phrase.every((p, j) => tokens[i + j] === p))
        for (let j = 0; j < phrase.length; j += 1) skip[i + j] = true;
    }
  }
  const padded = ` ${norm} `;
  const alcoholFree = ZERO_PERCENT.test(raw) || ALCOHOL_FREE.some((p) => padded.includes(` ${p} `));
  const found = new Map<string, Match>();
  for (let i = 0; i < tokens.length; i += 1) {
    if (skip[i]) continue;
    for (const v of variants(tokens[i]!)) {
      for (const entry of rules.first.get(v) ?? []) {
        const n = entry.tokens.length;
        if (i + n > tokens.length) continue;
        let ok = true;
        for (let j = 1; j < n && ok; j += 1) {
          ok = !skip[i + j] && tokenMatches(tokens[i + j]!, entry.tokens[j]!, j === n - 1);
        }
        if (!ok) continue;
        const level: KeywordLevel =
          alcoholFree && entry.rule.category === "alcohol" ? "review" : entry.rule.level;
        const key = `${entry.rule.category}|${entry.tokens.join(" ")}`;
        const prev = found.get(key);
        if (!prev || (prev.level === "review" && level === "block"))
          found.set(key, { ...entry.rule, level });
      }
    }
  }
  return [...found.values()];
}

export function decide(matches: Match[]): Decision {
  if (matches.some((m) => m.level === "block")) return "block";
  return matches.length ? "review" : "allow";
}

export function checkText(text: string, rules: CompiledRules = BUNDLED_RULES): CheckResult {
  const matches = findMatches(text, rules);
  return { decision: decide(matches), matches };
}

/** True when a search query must return nothing: any prohibited word, block OR review level. */
export function isProhibitedQuery(query: string, rules: CompiledRules = BUNDLED_RULES): boolean {
  return findMatches(query, rules).length > 0;
}

/**
 * Supplier / feed category names mapped onto the prohibited categories. Checked only against
 * a product's category field (on top of the keyword list, which covers e.g. "Beer, Wine & Spirits").
 */
export const SUPPLIER_CATEGORY_MAP: { pattern: string; category: string }[] = [
  { pattern: "spirituosen", category: "alcohol" },
  { pattern: "wine spirits", category: "alcohol" },
  { pattern: "beer wine", category: "alcohol" },
  { pattern: "bar wine", category: "alcohol" },
  { pattern: "alcoholic", category: "alcohol" },
  { pattern: "getranke alkoholisch", category: "alcohol" },
  { pattern: "tabakwaren", category: "tobacco_smoking" },
  { pattern: "raucherbedarf", category: "tobacco_smoking" },
  { pattern: "smoking accessories", category: "tobacco_smoking" },
  { pattern: "e zigaretten", category: "vape" },
  { pattern: "fleisch wurst", category: "non_halal_food" },
  { pattern: "wurstwaren", category: "non_halal_food" },
  { pattern: "sexual wellness", category: "adult" },
  { pattern: "erotik", category: "adult" },
  { pattern: "sexualitat", category: "adult" },
  { pattern: "adult products", category: "adult" },
  { pattern: "lotterie", category: "gambling" },
  { pattern: "wetten", category: "gambling" },
  { pattern: "gambling", category: "gambling" },
];
const SUPPLIER = compileRules(
  SUPPLIER_CATEGORY_MAP.map((m) => ({
    category: m.category,
    keyword: m.pattern,
    // meat/sausage aisles are not haram by themselves: review, not reject
    level: m.category === "non_halal_food" ? "review" : "block",
  })),
);

export type ProductFields = {
  title?: string | null;
  titleKu?: string | null;
  description?: string | null;
  category?: string | null;
  tags?: readonly string[] | null;
  brand?: string | null;
  attributes?: Record<string, unknown> | string | null;
};

export function checkProduct(p: ProductFields, rules: CompiledRules = BUNDLED_RULES): CheckResult {
  const attrs =
    typeof p.attributes === "string"
      ? p.attributes
      : p.attributes
        ? Object.entries(p.attributes)
            .map(([k, v]) => `${k} ${String(v)}`)
            .join(" \n ")
        : "";
  const fields: [string, string][] = [
    ["title", p.title ?? ""],
    ["title_ku", p.titleKu ?? ""],
    ["description", p.description ?? ""],
    ["category", p.category ?? ""],
    ["tags", (p.tags ?? []).join(" \n ")],
    ["brand", p.brand ?? ""],
    ["attributes", attrs],
  ];
  const matches: Match[] = [];
  for (const [field, value] of fields) {
    if (!value) continue;
    for (const m of findMatches(value, rules)) matches.push({ ...m, field });
  }
  if (p.category)
    for (const m of findMatches(p.category, SUPPLIER)) matches.push({ ...m, field: "category" });
  return { decision: decide(matches), matches };
}

/** Rejection message, shown in Kurdish, Arabic and English. */
export const PROHIBITED_MESSAGE = {
  ku: "ئەم کاڵایە ڕێگەپێدراو نییە و ناتوانرێت بڵاو بکرێتەوە.",
  ar: "هذا المنتج غير مسموح به ولا يمكن نشره.",
  en: "This product is not allowed and cannot be listed.",
} as const;
