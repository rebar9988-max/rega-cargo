import { chromium, webkit, firefox } from "playwright";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(
  resolve(process.env.RL_QA_TOOLS ?? "/tmp/rl-qa-tools", "package.json"),
);
import { mkdir, writeFile, readFile } from "node:fs/promises";
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch").default;
const root = dirname(fileURLToPath(import.meta.url));
await mkdir(`${root}/screenshots`, { recursive: true });
const widths = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440];
const langs = ["ckb", "ku", "de", "en", "ar", "tr", "fa"];
const routes = [
  "/",
  "/stores",
  "/stores/request",
  "/quote",
  "/track",
  "/market",
  "/ai",
  "/account",
  "/contact",
  "/privacy",
  "/impressum",
  "/terms",
  "/customs",
  "/prohibited-items",
  "/market/sell",
  "/request",
  "/move",
  "/owner",
  "/admin",
];
const axe = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");
const results = [];
const differences = [];
const switches = [];
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
  ["firefox", firefox],
]) {
  const browser = await engine.launch({ headless: true });
  const jobs = widths.flatMap((width) =>
    langs.flatMap((lang) =>
      (name === "chromium" ? routes : ["/contact"]).map((route) => ({ width, lang, route })),
    ),
  );
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      let job;
      while ((job = jobs.shift())) {
        const { width, lang, route } = job;
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          deviceScaleFactor: 1,
          reducedMotion: "reduce",
          serviceWorkers: "block",
          colorScheme: "light",
        });
        await context.addInitScript(() => {
          localStorage.setItem("rl-announcement-v1", "closed");
        });
        const page = await context.newPage();
        const errors = [];
        const fontWarnings = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("console", (m) => {
          if (/STAT|Table discarded/.test(m.text())) fontWarnings.push(m.text());
        });
        try {
          const response = await page.goto(`http://localhost:8788${route}?lang=${lang}`, {
            waitUntil: "networkidle",
          });
          await page.evaluate(() => document.fonts.ready);
          const geometry = await page.evaluate(() => {
            const e = document.querySelector('main a[href^="mailto:"]');
            const r = e?.getBoundingClientRect();
            const a = e?.querySelector("bdi");
            const ar = a?.getBoundingClientRect();
            const range = document.createRange();
            if (a) range.selectNodeContents(a);
            return {
              viewport: document.documentElement.clientWidth,
              scroll: document.documentElement.scrollWidth,
              h1: document.querySelectorAll("main h1").length,
              lang: document.documentElement.lang,
              dir: document.documentElement.dir,
              textdir: document.documentElement.dataset.textdir,
              card: r ? { left: r.left, right: r.right, width: r.width } : null,
              address: a
                ? {
                    text: a.textContent,
                    inside: [...range.getClientRects()].every(
                      (x) => x.left >= ar.left - 1 && x.right <= ar.right + 1,
                    ),
                    overflow: getComputedStyle(a).textOverflow,
                  }
                : null,
            };
          });
          let violations;
          if (name === "chromium" && [320, 1440].includes(width)) {
            await page.evaluate(axe);
            violations = await page.evaluate(async () =>
              (
                await axe.run(document, {
                  runOnly: {
                    type: "tag",
                    values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
                  },
                })
              ).violations.map((x) => ({
                id: x.id,
                impact: x.impact,
                nodes: x.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
              })),
            );
          }
          const row = {
            engine: name,
            ...job,
            status: response.status(),
            ...geometry,
            errors,
            fontWarnings,
            violations,
          };
          results.push(row);
          if (
            name === "chromium" &&
            ((lang === "ckb" &&
              (["/", "/contact"].includes(route) || [320, 1440].includes(width))) ||
              (route === "/prohibited-items" && ["ku", "de"].includes(lang)))
          ) {
            const slug =
              (route === "/" ? "home" : route.slice(1).replaceAll("/", "-")) +
              (lang === "ckb" ? "" : `-${lang}`);
            await page.clock.setFixedTime(new Date("2026-10-09T10:00:00Z"));
            await page.evaluate(async () => {
              for (const i of document.images) i.loading = "eager";
              await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
            });
            const after = await page.screenshot({ fullPage: true });
            const beforePage = await context.newPage();
            await beforePage.clock.setFixedTime(new Date("2026-10-09T10:00:00Z"));
            await beforePage.goto(`http://localhost:8789${route}?lang=${lang}`, {
              waitUntil: "networkidle",
            });
            await beforePage.evaluate(async () => {
              await document.fonts.ready;
              for (const i of document.images) i.loading = "eager";
              await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
            });
            const before = await beforePage.screenshot({ fullPage: true });
            const a = PNG.sync.read(before),
              b = PNG.sync.read(after);
            const changed =
              a.width === b.width && a.height === b.height
                ? pixelmatch(a.data, b.data, null, a.width, a.height, { threshold: 0.15 })
                : null;
            differences.push({
              ...job,
              before: { width: a.width, height: a.height },
              after: { width: b.width, height: b.height },
              changed,
            });
            // Keep every requested-width home/contact pair; other routes only when pixels differ.
            if (["/", "/contact"].includes(route) || changed !== 0) {
              await writeFile(`${root}/screenshots/${slug}-${width}-before.png`, before);
              await writeFile(`${root}/screenshots/${slug}-${width}-after.png`, after);
            }
          }
          if (geometry.scroll > geometry.viewport || errors.length || violations?.length)
            console.log(JSON.stringify(row));
          if (results.length % 50 === 0) {
            await writeFile(
              `${root}/matrix.json`,
              JSON.stringify({ results, differences, switches }, null, 2),
            );
            console.log(
              JSON.stringify({ progress: results.length, engine: name, width, lang, route }),
            );
          }
        } catch (e) {
          results.push({ engine: name, ...job, error: String(e) });
          console.log(JSON.stringify(results.at(-1)));
        }
        await context.close();
      }
    }),
  );
  // Real picker interactions: all seven locales, preserve selected route and return focus on Escape.
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
      serviceWorkers: "block",
    });
    const page = await context.newPage();
    for (const lang of langs) {
      try {
        await page.goto("/stores?cat=fashion&lang=en".replace(/^/, "http://localhost:8788"), {
          waitUntil: "networkidle",
        });
        const button = page.locator('[data-layout="lang-button"]');
        await button.click();
        const option = page.locator(`[role="option"][data-lang="${lang}"]`);
        await option.waitFor();
        await option.click();
        await page.waitForURL(new RegExp(`lang=${lang}`));
        await page.waitForFunction((l) => document.documentElement.lang === l, lang);
        await button.click();
        await page.locator(`[role="option"][data-lang="${lang}"]`).waitFor();
        await page.keyboard.press("Escape");
        switches.push({
          engine: name,
          width,
          lang,
          url: page.url(),
          dir: await page.locator("html").getAttribute("dir"),
          returnedFocus: await button.evaluate((e) => e === document.activeElement),
        });
      } catch (e) {
        switches.push({ engine: name, width, lang, error: String(e) });
        console.log(JSON.stringify(switches.at(-1)));
      }
    }
    await context.close();
  }
  await browser.close();
  await writeFile(
    `${root}/matrix.json`,
    JSON.stringify({ results, differences, switches }, null, 2),
  );
  console.log(
    JSON.stringify({
      finished: name,
      pages: results.length,
      differences: differences.filter((x) => x.changed !== 0),
      switches: switches.length,
    }),
  );
}
