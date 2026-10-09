import { test as base, expect, type Page } from "@playwright/test";
import { LAYOUT, measureLayout, type Bp } from "./geometry.ts";

const test = base.extend<{ breakpoint: Bp }>({
  breakpoint: ["phone", { option: true }],
});

const PAGES = [
  "/",
  "/stores",
  "/quote",
  "/track",
  "/market",
  "/ai",
  "/contact",
  "/privacy",
] as const;
const LANGS = ["ckb", "en"] as const;

function slug(path: string) {
  return path === "/" ? "home" : path.slice(1).replace(/\//g, "-");
}

async function open(page: Page, path: string, lang: string) {
  await page.clock.setFixedTime(new Date("2026-10-09T10:00:00Z"));
  await page.addInitScript((l) => {
    localStorage.setItem("rega-lang", l);
    localStorage.setItem("rega-lang-v3", "1");
  }, lang);
  await page.goto(path, { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("lang", lang, { timeout: 15_000 });
  await settle(page);
}

/** Load every image (incl. lazy ones below the fold) and the web fonts before measuring. */
async function settle(page: Page) {
  await page.evaluate(async () => {
    for (const img of document.querySelectorAll("img")) img.loading = "eager";
    await Promise.all(
      [...document.querySelectorAll("img")].map((img) =>
        img.complete
          ? null
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
      ),
    );
    await document.fonts.ready;
  });
  await page.waitForLoadState("networkidle");
}

/**
 * Content photos are masked with a silver box: their boxes (size, ratio, position) stay in the
 * baseline, while photo decoding noise and megabytes of pixels stay out of the repo.
 */
function shot(page: Page, sheet = false) {
  // Masks are painted above everything, so sheet views mask only the sheet's own photos.
  const photos = sheet ? "[data-layout=sheet] img" : "main img";
  return { mask: [page.locator(photos)], maskColor: "#c9ced6" };
}

async function geometry(page: Page, bp: Bp, sheet = false) {
  const issues = await page.evaluate(measureLayout, { bp, layout: LAYOUT, sheet });
  expect(issues, issues.join("\n")).toEqual([]);
}

for (const lang of LANGS) {
  test.describe(`layout ${lang}`, () => {
    for (const path of PAGES) {
      test(`${slug(path)} ${lang}`, async ({ page, breakpoint }) => {
        await open(page, path, lang);
        await geometry(page, breakpoint);
        await expect(page).toHaveScreenshot(`${slug(path)}-${lang}.png`, {
          fullPage: true,
          ...shot(page),
        });
      });
    }

    test(`menu sheet ${lang}`, async ({ page, breakpoint }) => {
      test.skip(breakpoint === "laptop", "The menu sheet exists on phone and tablet only.");
      await open(page, "/", lang);
      await page.locator('[data-layout="menu-button"]').click();
      await expect(page.locator('[data-layout="sheet"]')).toBeVisible();
      await settle(page);
      await geometry(page, breakpoint, true);
      await expect(page).toHaveScreenshot(`menu-${lang}.png`, shot(page, true));
    });

    test(`language picker ${lang}`, async ({ page, breakpoint }) => {
      await open(page, "/", lang);
      const button = page.locator('[data-layout="lang-button"]');
      const box = await button.boundingBox();
      expect(box && box.width >= 40 && box.height >= 40, "language button tap target >= 40px").toBe(true);
      await button.click();
      const panel = page.locator(breakpoint === "phone" ? '[data-layout="lang-sheet"]' : '[data-layout="lang-popover"]');
      await expect(panel).toBeVisible();
      await expect(panel.locator('[role="option"]')).toHaveCount(7);
      await expect(panel.locator(`[role="option"][data-lang="${lang}"]`)).toBeFocused();
      await expect(page).toHaveScreenshot(`lang-${lang}.png`, shot(page, true));
      await page.keyboard.press("Escape");
      await expect(panel).toHaveCount(0);
      await expect(button).toBeFocused();
    });

    test(`search sheet ${lang}`, async ({ page, breakpoint }) => {
      await open(page, "/", lang);
      await page.locator('input[type="search"]').first().click();
      await expect(page.locator('input[type="search"][aria-expanded="true"]')).toBeVisible();
      await settle(page);
      await geometry(page, breakpoint, true);
      await expect(page).toHaveScreenshot(`search-${lang}.png`, shot(page, true));
    });
  });
}
