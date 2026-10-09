#!/usr/bin/env node
// Generates public/rl-cargo.pdf from src/lib/rate-sheet.ts (corridor.ts data) with headless Chrome,
// and records the data fingerprint in src/lib/rate-sheet.lock.json.
// Usage: npm run rate-sheet   (needs google-chrome or CHROME=/path/to/chrome)
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { rateSheetData, rateSheetHash, rateSheetHtml } from "../src/lib/rate-sheet.ts";

const root = resolve(import.meta.dirname, "..");
const data = rateSheetData();
const dir = mkdtempSync(join(tmpdir(), "rate-sheet-"));
const html = join(dir, "sheet.html");
writeFileSync(html, rateSheetHtml(data, pathToFileURL(join(root, "public")).href));
const out = join(root, "public", "rl-cargo.pdf");
execFileSync(process.env.CHROME ?? "google-chrome", [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--allow-file-access-from-files",
  "--no-pdf-header-footer",
  `--print-to-pdf=${out}`,
  pathToFileURL(html).href,
], { stdio: "ignore" });
rmSync(dir, { recursive: true, force: true });
writeFileSync(join(root, "src", "lib", "rate-sheet.lock.json"), `${JSON.stringify({ hash: rateSheetHash(data) }, null, 2)}\n`);
console.log(`rate sheet ${rateSheetHash(data)} → public/rl-cargo.pdf`);
