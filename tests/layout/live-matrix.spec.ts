// Read-only live matrix (diagnostic branch only, never merged). GET navigations and typing into inputs only:
// nothing is submitted, no account is created, no code is requested, no rate limit is probed.
import { test, expect, type Browser } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const WIDTHS = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920] as const;
const LANGS = [["ckb", "rtl"], ["ar", "rtl"], ["en", "ltr"]] as const;
const ROUTES = ["/", "/stores", "/stores/request", "/quote", "/track", "/ai", "/account", "/market", "/contact"];
const OUT = "matrix-results";
mkdirSync(OUT, { recursive: true });

async function context(browser: Browser, browserName: string, width: number) {
  const mobile = width <= 1024 && browserName !== "firefox";
  return browser.newContext({
    viewport: { width, height: width >= 1024 ? 900 : 800 },
    isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1,
    locale: "en-GB", timezoneId: "UTC", serviceWorkers: "block", reducedMotion: "reduce",
  });
}

for (const width of WIDTHS) {
  for (const [lang, dir] of LANGS) {
    test(`matrix ${width}px ${lang}`, async ({ browser, browserName }) => {
      test.setTimeout(240_000);
      const ctx = await context(browser, browserName, width);
      const results: unknown[] = [];
      try {
        for (const route of ROUTES) {
          const page = await ctx.newPage();
          const errors: string[] = [];
          page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
          page.on("pageerror", (e) => errors.push(`pageerror: ${String(e.message).slice(0, 200)}`));
          const url = `${route}${route.includes("?") ? "&" : "?"}lang=${lang}`;
          const resp = await page.goto(url, { waitUntil: "load", timeout: 45_000 }).catch((e) => { errors.push(`goto: ${String(e).slice(0, 160)}`); return null; });
          await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
          await page.waitForTimeout(400);
          const m = await page.evaluate((w) => {
            const d = document.documentElement;
            const out: string[] = [];
            if (d.scrollWidth > w || innerWidth !== w) {
              for (const el of document.querySelectorAll("body *")) {
                const r = el.getBoundingClientRect();
                if (!r.width || !r.height || getComputedStyle(el).position === "fixed") continue;
                if (r.right > w + 1 || r.left < -1) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(/\s+/).slice(0, 3).join(".")} L${Math.round(r.left)} R${Math.round(r.right)}`);
              }
            }
            return { sw: d.scrollWidth, cw: d.clientWidth, iw: innerWidth, dir: d.dir, lang: d.lang, h1: document.querySelectorAll("h1").length, sticking: out.slice(0, 6) };
          }, width).catch(() => null);
          const row = { route, status: resp?.status() ?? 0, ...m, overflowPx: m ? Math.max(m.sw - width, Math.abs(m.iw - width)) : -1, errors: errors.slice(0, 5) };
          results.push(row);
          expect.soft(row.status, `${route} status`).toBe(200);
          expect.soft(m?.dir, `${route} dir`).toBe(dir);
          expect.soft(m?.h1 ?? 0, `${route} has an h1`).toBeGreaterThan(0);
          expect.soft(row.overflowPx, `${route} strict horizontal overflow (scrollWidth/innerWidth vs ${width}) ${JSON.stringify(m?.sticking)}`).toBeLessThanOrEqual(0);
          expect.soft(errors, `${route} console/page errors`).toEqual([]);
          await page.close();
        }
      } finally {
        writeFileSync(`${OUT}/${browserName}-${width}-${lang}.json`, JSON.stringify(results, null, 1));
        await ctx.close();
      }
    });
  }
}

for (const width of [390, 1280]) {
  test(`numeric input ${width}px (no submit)`, async ({ browser, browserName }) => {
    const ctx = await context(browser, browserName, width);
    const page = await ctx.newPage();
    const rec: Record<string, unknown> = {};
    try {
      await page.goto("/quote?lang=ckb&l=60&w=30&h=20&kg=3.2", { waitUntil: "load" });
      await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
      const kg = page.locator('.rl-quote-card input[inputmode="decimal"]').first();
      const price = () => page.locator(".rl-quote-option .rl-price").first().innerText();
      await expect(kg).toBeVisible();
      rec.western = { value: await kg.inputValue(), price: await price() };
      for (const [name, typed] of [["arabicIndic", "٣٫٢"], ["persian", "۳.۲"], ["comma", "3,2"]] as const) {
        await kg.fill(typed);
        await page.waitForTimeout(300);
        rec[name] = { typed, value: await kg.inputValue(), price: await price().catch(() => "n/a"), invalid: await kg.getAttribute("aria-invalid") };
        expect.soft(await price().catch(() => "n/a"), `${name} price equals the Western-digit price`).toBe((rec.western as { price: string }).price);
      }
      await kg.fill("abc");
      await page.waitForTimeout(300);
      rec.letters = { invalid: await kg.getAttribute("aria-invalid"), options: await page.locator(".rl-quote-option").count() };
      expect.soft(rec.letters, "letters are rejected, never guessed").toMatchObject({ invalid: "true" });
    } finally {
      writeFileSync(`${OUT}/${browserName}-numeric-${width}.json`, JSON.stringify(rec, null, 1));
      await ctx.close();
    }
  });
}

test("auth surfaces and navigation, read-only", async ({ browser, browserName }) => {
  const rec: Record<string, unknown> = {};
  const ctx = await context(browser, browserName, 390);
  try {
    for (const path of ["/api/auth/rl-email/status", "/api/ai/status"]) {
      const r = await ctx.request.get(path);
      rec[path] = { status: r.status(), body: (await r.text()).slice(0, 160) };
    }
    const page = await ctx.newPage();
    await page.goto("/account?lang=en", { waitUntil: "load" });
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
    rec.accountGate = { emailInputs: await page.locator('input[type="email"], input[autocomplete="email"]').count(), url: page.url() };
    await page.goto("/owner?lang=en", { waitUntil: "load" });
    rec.ownerPage = { status: 200, passwordInputs: await page.locator('input[type="password"]').count(), url: page.url() };
    // Language switching through the real picker.
    await page.goto("/?lang=en", { waitUntil: "load" });
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
    const button = page.locator('button[data-layout="lang-button"]').first();
    rec.langButtonVisible = await button.isVisible().catch(() => false);
    if (rec.langButtonVisible) {
      await button.click();
      const pop = page.locator('[data-layout="lang-popover"]').first();
      rec.langPopoverVisible = await pop.isVisible().catch(() => false);
      const arabic = pop.getByText("العربية").first();
      if (await arabic.isVisible().catch(() => false)) {
        await arabic.click();
        await page.waitForTimeout(800);
        rec.afterSwitch = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir, path: location.pathname }));
      }
    }
    // Bottom tabs on a phone.
    await page.goto("/?lang=en", { waitUntil: "load" });
    const tabs = page.locator(".rl-bottom-nav a");
    const n = await tabs.count();
    const seen: unknown[] = [];
    for (let i = 0; i < n; i++) {
      await page.goto("/?lang=en", { waitUntil: "load" });
      const t = page.locator(".rl-bottom-nav a").nth(i);
      const href = await t.getAttribute("href");
      await t.click();
      await page.waitForLoadState("load");
      await page.waitForTimeout(300);
      seen.push({ href, now: new URL(page.url()).pathname, h1: await page.locator("h1").count() });
    }
    rec.bottomTabs = seen;
  } finally {
    writeFileSync(`${OUT}/${browserName}-auth-nav.json`, JSON.stringify(rec, null, 1));
    await ctx.close();
  }
  expect.soft((rec["/api/ai/status"] as { status: number }).status).toBe(200);
});
