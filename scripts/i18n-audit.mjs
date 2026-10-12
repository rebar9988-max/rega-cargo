// Translation coverage audit. Usage: node --experimental-strip-types scripts/i18n-audit.mjs [--json]
// For every copy module it flattens each language's strings and reports, per language:
//   missing  - key present in English but absent in that language
//   empty    - empty string
//   same     - identical to English for a non-Latin-script language (probably an English fallback)
// Latin-script languages (de, tr, ku) legitimately share some words with English (brand names,
// numbers, "OK"), so "same" is only counted there for strings of 4+ words.
const LANGS = ["ckb", "ku", "de", "en", "ar", "fa", "tr"];
const NON_LATIN = new Set(["ckb", "ar", "fa"]);
const MODS = [
  ["messages", async () => Object.fromEntries(await Promise.all(LANGS.map(async (l) => [l, (await import(`../src/lib/messages/${l}.ts`))[l]])))],
  ["declare", async () => (await import("../src/lib/declare-copy.ts")).DECLARE_COPY],
  ["design", async () => (await import("../src/lib/design-copy.ts")).DESIGN_COPY],
  ["items", async () => (await import("../src/lib/items-copy.ts")).ITEMS_COPY],
  ["legal", async () => (await import("../src/lib/legal-copy.ts")).LEGAL_COPY],
  ["pages", async () => (await import("../src/lib/pages-copy.ts")).PAGES_COPY],
  ["request", async () => (await import("../src/lib/request-copy.ts")).REQUEST_COPY],
  ["site", async () => (await import("../src/lib/site-copy.ts")).SITE_COPY],
  ["ux", async () => (await import("../src/lib/ux-copy.ts")).UX_COPY],
  ["seo", async () => (await import("../src/lib/seo-messages.ts")).SEO_MESSAGES],
  ["catalogue", async () => Object.fromEntries(LANGS.map((l) => [l, null]))],
];
const fns = {
  catalogue: ["../src/lib/catalogue-copy.ts", "catalogueCopy"],
  hero: ["../src/lib/hero-copy.ts", "heroCopy"],
  market: ["../src/lib/market-copy.ts", "marketCopy"],
  redesign: ["../src/lib/redesign-copy.ts", "redesignCopy"],
  store: ["../src/lib/store-copy.ts", "storeCopy"],
  productLink: ["../src/lib/product-link/copy.ts", "productLinkCopy"],
};
for (const [name, [path, fn]] of Object.entries(fns)) {
  const i = MODS.findIndex((m) => m[0] === name);
  const loader = async () => { const m = await import(path); return Object.fromEntries(LANGS.map((l) => [l, m[fn](l)])); };
  if (i >= 0) MODS[i] = [name, loader]; else MODS.push([name, loader]);
}
function flat(v, p = "", out = {}) {
  if (typeof v === "string") out[p] = v;
  else if (Array.isArray(v)) v.forEach((x, i) => flat(x, `${p}[${i}]`, out));
  else if (v && typeof v === "object") for (const k of Object.keys(v)) flat(v[k], p ? `${p}.${k}` : k, out);
  return out;
}
const report = {};
for (const [name, load] of MODS) {
  let data;
  try { data = await load(); } catch (e) { report[name] = { error: String(e.message).slice(0, 120) }; continue; }
  const en = flat(data.en);
  report[name] = { keys: Object.keys(en).length };
  for (const l of LANGS) {
    if (l === "en") continue;
    const f = flat(data[l] ?? {});
    const missing = Object.keys(en).filter((k) => !(k in f));
    const empty = Object.keys(f).filter((k) => f[k].trim() === "");
    const same = Object.keys(f).filter((k) => k in en && f[k] === en[k] && /[A-Za-z]{3}/.test(en[k]) && (NON_LATIN.has(l) || process.argv.includes("--raw") || en[k].split(/\s+/).length >= 4));
    report[name][l] = { missing, empty, same };
  }
}
if (process.argv.includes("--json")) { console.log(JSON.stringify(report, null, 1)); process.exit(0); }
const rows = [];
for (const [name, r] of Object.entries(report)) {
  if (r.error) { rows.push({ module: name, error: r.error }); continue; }
  const row = { module: name, keys: r.keys };
  for (const l of LANGS) if (l !== "en") row[l] = `${r[l].missing.length}/${r[l].empty.length}/${r[l].same.length}`;
  rows.push(row);
}
console.log("cells = missing/empty/sameAsEnglish");
console.table(rows);
