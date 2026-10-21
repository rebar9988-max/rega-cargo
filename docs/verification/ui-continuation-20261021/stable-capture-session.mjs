import { chromium } from "playwright";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(
  resolve(process.env.RL_QA_TOOLS ?? "/tmp/rl-qa-tools", "package.json"),
);
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch").default;
import fs from "node:fs/promises";
const root = dirname(fileURLToPath(import.meta.url));
const matrix = JSON.parse(await fs.readFile(`${root}/matrix.json`, "utf8"));
await fs.mkdir(`${root}/initial-capture-noise`, { recursive: true });
for (const row of matrix.differences.filter((x) => x.changed > 0)) {
  const slug =
    (row.route === "/" ? "home" : row.route.slice(1).replaceAll("/", "-")) +
    (row.lang === "ckb" ? "" : `-${row.lang}`);
  for (const side of ["before", "after"])
    await fs.copyFile(
      `${root}/screenshots/${slug}-${row.width}-${side}.png`,
      `${root}/initial-capture-noise/${slug}-${row.width}-${side}.png`,
    );
}
const browser = await chromium.launch();
const jobs = [...matrix.differences];
const results = [];
async function shot(page, url, file) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (const i of document.images) i.loading = "eager";
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
    await document.fonts.ready;
    window.scrollTo(0, 0);
  });
  const main = await page.locator("main").boundingBox();
  const height = await page.evaluate(() =>
    Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
  );
  await page.setViewportSize({ width: page.viewportSize().width, height });
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  const expanded = await page.locator("main").boundingBox();
  for (const key of ["x", "y", "width", "height"])
    if (Math.abs(main[key] - expanded[key]) > 1)
      throw Error(`Capture changed main ${key}: ${main[key]} -> ${expanded[key]}`);
  const header = await page
    .locator('[data-layout="lang-button"]')
    .evaluate((e) => ({
      text: e.textContent,
      font: getComputedStyle(e.querySelector("span")).fontFamily,
      visibility: getComputedStyle(e.querySelector("span")).visibility,
    }));
  const bytes = await page.screenshot({ animations: "disabled", caret: "hide" });
  await fs.writeFile(file, bytes);
  return { bytes, header, height };
}
await Promise.all(
  Array.from({ length: 3 }, async () => {
    let job;
    while ((job = jobs.shift())) {
      const { route, width, lang } = job;
      const slug =
        (route === "/" ? "home" : route.slice(1).replaceAll("/", "-")) +
        (lang === "ckb" ? "" : `-${lang}`);
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
        colorScheme: "light",
        serviceWorkers: "block",
      });
      await context.addInitScript(() => localStorage.setItem("rl-announcement-v1", "closed"));
      try {
        const beforePage = await context.newPage(),
          afterPage = await context.newPage();
        await beforePage.clock.setFixedTime(new Date("2026-10-09T10:00:00Z"));
        await afterPage.clock.setFixedTime(new Date("2026-10-09T10:00:00Z"));
        const a = await shot(
          beforePage,
          `http://localhost:8789${route}?lang=${lang}`,
          `${root}/screenshots/${slug}-${width}-before.png`,
        );
        const b = await shot(
          afterPage,
          `http://localhost:8788${route}?lang=${lang}`,
          `${root}/screenshots/${slug}-${width}-after.png`,
        );
        const aa = PNG.sync.read(a.bytes),
          bb = PNG.sync.read(b.bytes);
        const changed =
          aa.width === bb.width && aa.height === bb.height
            ? pixelmatch(aa.data, bb.data, null, aa.width, aa.height, { threshold: 0.15 })
            : null;
        results.push({
          ...job,
          changed,
          beforeHeight: a.height,
          afterHeight: b.height,
          beforeHeader: a.header,
          afterHeader: b.header,
        });
      } catch (e) {
        results.push({ ...job, error: String(e) });
      }
      await context.close();
    }
  }),
);
await browser.close();
await fs.writeFile(`${root}/stable-comparisons.json`, JSON.stringify(results, null, 2));
console.log(
  JSON.stringify({
    pairs: results.length,
    unintended: results.filter(
      (x) =>
        x.error || (x.changed !== 0 && x.route !== "/contact" && x.route !== "/prohibited-items"),
    ),
    changed: results
      .filter((x) => x.changed !== 0)
      .map((x) => ({
        route: x.route,
        width: x.width,
        lang: x.lang,
        changed: x.changed,
        error: x.error,
      })),
  }),
);
