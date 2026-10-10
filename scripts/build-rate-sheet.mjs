#!/usr/bin/env node
// Generates public/rl-cargo.pdf from src/lib/rate-sheet.ts (corridor.ts data) with headless Chrome,
// and records the data fingerprint in src/lib/rate-sheet.lock.json.
// Usage: npm run rate-sheet   (needs google-chrome or CHROME=/path/to/chrome)
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { rateSheetData, rateSheetHash, rateSheetHtml } from "../src/lib/rate-sheet.ts";
import { BRAND_ASSETS } from "../src/lib/brand-assets.ts";

const root = resolve(import.meta.dirname, "..");
const data = rateSheetData();
const embed = (path, type) =>
  `data:${type};base64,${readFileSync(join(root, "public", path)).toString("base64")}`;
// Embed the same local bytes: no network, file:// permission, or stale browser cache.
const html = rateSheetHtml(data, "")
  .replace(
    "/fonts/vazirmatn-nl-v33.003.woff2",
    embed("fonts/vazirmatn-nl-v33.003.woff2", "font/woff2"),
  )
  .replace(BRAND_ASSETS.print, embed(BRAND_ASSETS.print, "image/png"));
const out = join(root, "public", "rl-cargo.pdf");
// Isolated browser profile: a running desktop Chrome must not swallow the print command.
// Playwright is already installed for the project's browser tests.
const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? "google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--allow-file-access-from-files"],
});
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
} finally {
  await browser.close();
}
writeFileSync(
  join(root, "src", "lib", "rate-sheet.lock.json"),
  `${JSON.stringify({ hash: rateSheetHash(data) }, null, 2)}\n`,
);
console.log(`rate sheet ${rateSheetHash(data)} → public/rl-cargo.pdf`);
