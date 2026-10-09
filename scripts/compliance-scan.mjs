#!/usr/bin/env node
/**
 * One-time compliance scan.  npm run compliance:scan
 *
 * 1. Bundled data: stores, brands, goods, idealo terms, search synonyms, store/market copy
 *    in all 7 languages, and every string literal in the SQL seeds (migrations + dev seeds).
 * 2. Database: with DATABASE_URL set, scans the real Postgres and APPLIES the result
 *    (unpublish clear matches, send unclear ones to review; see src/lib/compliance/scan.ts).
 *    Without it, scans a throw-away PGLite built from the migrations and dev seeds.
 * Exit code 1 when bundled data contains a clear match.
 */
import { readdirSync, readFileSync } from "node:fs";
import { checkText, BUNDLED_RULES, compileRules } from "../src/lib/compliance/check.ts";
import { BUNDLED_KEYWORDS } from "../src/lib/compliance/rules.ts";
import { scanDatabase } from "../src/lib/compliance/scan.ts";
import { STORES, GOODS } from "../src/lib/stores.ts";
import { BRANDS } from "../src/lib/catalog.ts";
import { ITEM_IDEALO } from "../src/lib/search/index.ts";
import { storeCopy } from "../src/lib/store-copy.ts";
import { marketCopy } from "../src/lib/market-copy.ts";
import { LANGS } from "../src/lib/langs.ts";

const root = new URL("../", import.meta.url);
const findings = [];
const look = (where, text) => {
  const r = checkText(String(text ?? ""));
  if (r.decision !== "allow") findings.push({ where, text: String(text).slice(0, 80), ...r });
};
const walk = (where, value) => {
  if (typeof value === "string") look(where, value);
  else if (Array.isArray(value)) value.forEach((v, i) => walk(`${where}[${i}]`, v));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) walk(`${where}.${k}`, v);
};

for (const s of STORES) walk(`store:${s.id}`, s);
for (const b of BRANDS) walk(`brand:${b.name}`, b);
for (const g of GOODS) walk(`good:${g.id}`, g);
walk("idealo", ITEM_IDEALO);
walk(
  "search/index.ts",
  [...readFileSync(new URL("src/lib/search/index.ts", root), "utf8").matchAll(/"([^"\n]+)"/g)].map(
    (m) => m[1],
  ),
);
for (const { id } of LANGS) {
  walk(`storeCopy.${id}`, storeCopy(id));
  // the market copy's own compliance messages name no prohibited word
  walk(`marketCopy.${id}`, marketCopy(id));
}
const seedFiles = [
  ...readdirSync(new URL("migrations/", root))
    .filter((f) => f.endsWith(".sql") && !f.includes("compliance"))
    .map((f) => `migrations/${f}`),
  ...readdirSync(new URL("migrations/dev/", root))
    .filter((f) => f.endsWith(".sql"))
    .map((f) => `migrations/dev/${f}`),
];
for (const f of seedFiles) {
  const literals = [...readFileSync(new URL(f, root), "utf8").matchAll(/'((?:[^']|'')+)'/g)].map(
    (m) => m[1].replace(/''/g, "'"),
  );
  walk(f, literals);
}

const clear = findings.filter((f) => f.decision === "block");
console.log(`# Bundled data: ${clear.length} clear, ${findings.length - clear.length} unclear`);
for (const f of findings)
  console.log(
    `- [${f.decision}] ${f.where}: "${f.text}" → ${f.matches.map((m) => `${m.category}:${m.keyword}`).join(", ")}`,
  );

let query;
let close = async () => {};
const url = process.env.DATABASE_URL?.trim();
if (url) {
  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  query = async (text, params) => (await client.query(text, params)).rows;
  close = () => client.end();
  console.log("\n# Database: DATABASE_URL (changes are applied)");
} else {
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite();
  for (const f of [
    ...seedFiles.filter((f) => !f.includes("/dev/")),
    ...readdirSync(new URL("migrations/", root))
      .filter((f) => f.includes("compliance"))
      .map((f) => `migrations/${f}`),
  ].sort((a, b) => a.localeCompare(b)))
    await db.exec(readFileSync(new URL(f, root), "utf8"));
  for (const f of seedFiles.filter((f) => f.includes("/dev/")))
    await db.exec(readFileSync(new URL(f, root), "utf8"));
  query = async (text, params) => (await db.query(text, params)).rows;
  console.log(
    "\n# Database: none configured; scanned a throw-away PGLite (migrations + dev seeds)",
  );
}
const dbRules = url
  ? compileRules([
      ...BUNDLED_KEYWORDS,
      ...(await query(
        "select c.slug as category, k.keyword, k.level from prohibited_keywords k join prohibited_categories c on c.id = k.category_id",
      )),
    ])
  : BUNDLED_RULES;
const report = await scanDatabase(query, dbRules, "script");
await close();
console.log(
  `scanned ${JSON.stringify(report.scanned)}; unpublished ${report.blocked.length}, sent to review ${report.review.length}`,
);
for (const i of [...report.blocked, ...report.review])
  console.log(
    `- [${i.decision}] ${i.table} ${i.label} → ${i.matches.map((m) => `${m.category}:${m.keyword}`).join(", ")}`,
  );
process.exit(clear.length ? 1 : 0);
