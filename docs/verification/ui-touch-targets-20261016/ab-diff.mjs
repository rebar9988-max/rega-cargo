// Differential visual check without Docker: render the same routes from two origins (A and B)
// with the SAME local Chromium, then compare full-page pixels. Both sides share one renderer, so
// font/anti-aliasing drift cancels out (unlike comparing with baselines made in the official image).
//
//   npm i --no-save --prefix "$TOOLS" pngjs@7 pixelmatch@5      # outside the repo; no dependency change
//   TOOLS=$TOOLS CHROMIUM=/opt/pw-browsers/chromium \
//     node docs/verification/ui-touch-targets-20261016/ab-diff.mjs <originA> <originB> <outDir>
//
// Origin B is normally a Worker built from the branch: `wrangler dev --config
// .output/server/wrangler.layout.json --port 8788 --local --host localhost`.
// ratio 0 = identical pixels; any different page keeps A/B/diff PNGs in <outDir>.
import fs from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "@playwright/test";

const tools = process.env.TOOLS;
if (!tools) throw new Error("Set TOOLS to the directory that holds pngjs and pixelmatch");
const require = createRequire(`${tools}/`);
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch");

const [originA, originB, outDir] = process.argv.slice(2);
if (!originA || !originB || !outDir) throw new Error("Usage: ab-diff.mjs <originA> <originB> <outDir>");
fs.mkdirSync(outDir, { recursive: true });

const routes = [
  "/",
  "/track",
  "/impressum",
  "/terms",
  "/quote",
  "/contact",
  "/stores",
  "/stores/request?store=zalando&intent=buy",
  "/stores/request?store=zalando&intent=ship",
];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM });

async function shot(origin, path, width, lang, theme, file) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    isMobile: width <= 768,
    hasTouch: width <= 768,
    reducedMotion: "reduce",
    serviceWorkers: "block",
    colorScheme: theme,
  });
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem("rl-theme-v1", t);
      localStorage.setItem("rl-announcement-v1", "closed");
    } catch {
      /* storage unavailable */
    }
  }, theme);
  const page = await ctx.newPage();
  const sep = path.includes("?") ? "&" : "?";
  await page.goto(`${origin}${path}${sep}lang=${lang}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.screenshot({ path: file, fullPage: true });
  await ctx.close();
  return height;
}

const rows = [];
for (const theme of ["light", "dark"])
  for (const lang of ["ckb", "ar", "en"])
    for (const width of [360, 1440])
      for (const path of routes) {
        const base = `${outDir}/${path.replace(/\W+/g, "_") || "home"}-${lang}-${width}-${theme}`;
        const heightA = await shot(originA, path, width, lang, theme, `${base}-A.png`);
        const heightB = await shot(originB, path, width, lang, theme, `${base}-B.png`);
        const a = PNG.sync.read(fs.readFileSync(`${base}-A.png`));
        const b = PNG.sync.read(fs.readFileSync(`${base}-B.png`));
        let ratio = null;
        if (a.width === b.width && a.height === b.height) {
          const diff = new PNG({ width: a.width, height: a.height });
          const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.15 });
          ratio = n / (a.width * a.height);
          if (n) fs.writeFileSync(`${base}-diff.png`, PNG.sync.write(diff));
        }
        if (ratio === 0) {
          fs.unlinkSync(`${base}-A.png`);
          fs.unlinkSync(`${base}-B.png`);
        }
        rows.push({ path, lang, width, theme, heightA, heightB, ratio });
      }
await browser.close();
fs.writeFileSync(`${outDir}/rows.json`, JSON.stringify(rows, null, 1));
const identical = rows.filter((r) => r.ratio === 0).length;
const heightDiffs = rows.filter((r) => r.heightA !== r.heightB).length;
console.log(`compared ${rows.length}, identical ${identical}, height differs ${heightDiffs}`);
