import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { NUM_LOCALE, formatNumber, hasEasternDigits, parseDecimal, westernDigits } from "./numbers.ts";
import { formatEur, formatIqdFromEur } from "./corridor.ts";
import { QUOTE_LIMITS } from "./quote-search.ts";

const EASTERN = /[\u0660-\u0669\u06F0-\u06F9\u066B\u066C]/u;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    // Tests may feed Eastern digits as user input on purpose (normalisation, search folding).
    return /\.(ts|tsx)$/.test(name) && !name.includes(".test.") ? [path] : [];
  });
}

test("no Eastern Arabic or Persian digits in any copy, message file or component", () => {
  const offenders = sourceFiles("src").flatMap((path) =>
    readFileSync(path, "utf8")
      .split("\n")
      .flatMap((line, i) => (EASTERN.test(line) ? [`${path}:${i + 1}`] : [])),
  );
  assert.deepEqual(offenders, []);
});

test("formatters output Western digits for every app locale", () => {
  const value = 1234567.89;
  const date = new Date(Date.UTC(2026, 9, 9, 14, 5));
  for (const lang of ["ckb", "ku", "ar", "fa", "de", "tr", "en"]) {
    // The pinned locale never yields Eastern digits…
    assert.equal(hasEasternDigits(formatNumber(value)), false, lang);
    // …and the -u-nu-latn extension forces Latin digits even on locales that default to Eastern.
    const latn = `${lang}-u-nu-latn`;
    assert.equal(hasEasternDigits(new Intl.NumberFormat(latn).format(value)), false, latn);
    assert.equal(
      hasEasternDigits(
        new Intl.DateTimeFormat(latn, { dateStyle: "medium", timeStyle: "short" }).format(date),
      ),
      false,
      latn,
    );
  }
  assert.equal(formatNumber(1520), "1,520");
  for (const s of [formatEur(1234.5), formatIqdFromEur(1234.5)])
    assert.match(s, /^[\x20-\x7e\u00a0€]+$/, s);
  assert.equal((1520).toLocaleString(NUM_LOCALE), "1,520");
  assert.match(
    new Intl.DateTimeFormat(NUM_LOCALE, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(date),
    /^9 Oct 2026, 14:05$/,
  );
  assert.equal(new Intl.NumberFormat(NUM_LOCALE).resolvedOptions().numberingSystem, "latn");
});

test("weight and dimension errors state the server limits in all 7 languages", async () => {
  const lines = ["ckb", "en", "ar", "de", "ku", "fa", "tr"]
    .map((l) => readFileSync(`src/lib/messages/${l}.ts`, "utf8"))
    .join("\n")
    .split("\n");
  const weight = lines.filter((l) => /^\s+weightError:/.test(l));
  const dims = lines.filter((l) => /^\s+dimError:/.test(l));
  assert.equal(weight.length, 7);
  assert.equal(dims.length, 7);
  const kgMin = String(QUOTE_LIMITS.kg.min);
  for (const line of weight) {
    assert.ok(line.includes(kgMin) || line.includes(kgMin.replace(".", ",")), line);
    assert.ok(line.includes(String(QUOTE_LIMITS.kg.max)), line);
    assert.ok(!/300|0[.,]2/.test(line), line);
  }
  for (const line of dims) {
    assert.ok(
      line.includes(String(QUOTE_LIMITS.dim.min)) && line.includes(String(QUOTE_LIMITS.dim.max)),
      line,
    );
    assert.ok(!/300/.test(line), line);
  }
});

test("parseDecimal reads what ckb, ar and fa keyboards produce, and nothing it would have to guess", () => {
  const e = (text: string) => text; // keep the literals below as escapes: sources must not hold Eastern digits
  const arabicIndic = e("٣٫٢"); // 3.2 with the Arabic decimal separator
  const arabicDot = e("٣.٢");
  const persian = e("۳٫۲");
  assert.equal(parseDecimal("3.2"), 3.2);
  assert.equal(parseDecimal("3,2"), 3.2);
  assert.equal(parseDecimal(arabicIndic), 3.2);
  assert.equal(parseDecimal(arabicDot), 3.2);
  assert.equal(parseDecimal(persian), 3.2);
  assert.equal(parseDecimal(" 0,1 "), 0.1);
  assert.equal(parseDecimal(".5"), 0.5);
  assert.equal(parseDecimal(70), 70);
  for (const bad of ["", " ", "abc", "1e2", "-3", "+3", "3.2.1", "3,2,1", "1 000", "0x10", "3 kg", null, undefined, {}, "9".repeat(21)])
    assert.ok(Number.isNaN(parseDecimal(bad)), JSON.stringify(bad));
  // Money-like fields may group thousands; a bare comma stays a decimal mark elsewhere.
  assert.equal(parseDecimal("1,500", { groupedThousands: true }), 1500);
  assert.equal(parseDecimal("1,500.5", { groupedThousands: true }), 1500.5);
  assert.equal(parseDecimal("1٬500", { groupedThousands: true }), 1500);
  assert.equal(parseDecimal("1,5", { groupedThousands: true }), 1.5);
  assert.equal(parseDecimal("1,500"), 1.5, "without the option a comma is a decimal mark");
  assert.equal(westernDigits("١۲x"), "12x");
});
