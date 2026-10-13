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
  "/impressum",
  "/terms",
  "/stores/request?store=zalando&intent=buy",
] as const;
const LANGS = ["ckb", "ar", "en"] as const;

function slug(path: string) {
  return path === "/" ? "home" : path.slice(1).split("?")[0].replace(/\//g, "-");
}

async function open(page: Page, path: string, lang: string) {
  await page.clock.setFixedTime(new Date("2026-10-09T10:00:00Z"));
  await page.addInitScript((l) => {
    localStorage.setItem("rega-lang", l);
    localStorage.setItem("rega-lang-v3", "1");
  }, lang);
  await page.goto(`${path}${path.includes("?") ? "&" : "?"}lang=${lang}`, {
    waitUntil: "networkidle",
  });
  await expect(page.locator("html")).toHaveAttribute("lang", lang, { timeout: 15_000 });
  await settle(page);
  // A page baseline represents the initial view, not retained focus/scroll after hydration.
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator(".rl-site-header")).toHaveAttribute("data-shrunk", "false");
}

/** Load every image (incl. lazy ones below the fold) and the web fonts before measuring. */
async function settle(page: Page) {
  const deferred = page.locator(".rl-deferred-calculator");
  if (await deferred.count()) {
    // Network idle can precede hydration; the router then resets the initial scroll.
    // Keep the calculator in view until its interactive content has actually mounted.
    await expect
      .poll(
        async () => {
          await deferred.scrollIntoViewIfNeeded();
          return page.locator(".rl-quick-options").isVisible();
        },
        { intervals: [100, 250, 500] },
      )
      .toBe(true);
    await expect(page.locator(".rl-quick-options")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator(".rl-site-header")).toHaveAttribute("data-shrunk", "false");
  }
  await page.evaluate(async () => {
    // Full-page snapshots measure all deferred sections, including those below the viewport.
    for (const section of document.querySelectorAll<HTMLElement>(".rl-defer"))
      section.style.contentVisibility = "visible";
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

/**
 * Chromium's mobile captureBeyondViewport scrolls the live page while capturing
 * tall documents, painting sticky headers halfway down the image. Capture a
 * document-sized viewport instead; prove that content geometry is unchanged,
 * then restore the real device viewport. No element is hidden or restyled.
 */
async function documentShot(page: Page, name: string) {
  const viewport = page.viewportSize()!;
  const main = (await page.locator("main").boundingBox())!;
  const height = await page.evaluate(() =>
    Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
  );
  try {
    await page.setViewportSize({ ...viewport, height });
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator(".rl-site-header")).toHaveAttribute("data-shrunk", "false");
    const expanded = (await page.locator("main").boundingBox())!;
    for (const key of ["x", "y", "width", "height"] as const)
      expect(
        Math.abs(expanded[key] - main[key]),
        `capture preserves main ${key}`,
      ).toBeLessThanOrEqual(1);
    await expect(page).toHaveScreenshot(name, { ...shot(page) });
    expect(await page.evaluate(() => window.scrollY), "capture must not scroll the page").toBe(0);
  } finally {
    await page.setViewportSize(viewport);
    await page.evaluate(() => window.scrollTo(0, 0));
  }
}

async function geometry(page: Page, bp: Bp, sheet = false) {
  // Scroll restoration and WebKit's grid layout may settle a frame after the header state.
  await expect
    .poll(() =>
      page.locator('[data-layout="header"]').evaluate((el) => el.getBoundingClientRect().height),
    )
    .toBe(LAYOUT.headerRow[bp]);
  const issues = await page.evaluate(measureLayout, { bp, layout: LAYOUT, sheet });
  expect(issues, issues.join("\n")).toEqual([]);
}

for (const lang of LANGS) {
  test.describe(`layout ${lang}`, () => {
    for (const path of PAGES) {
      test(`${slug(path)} ${lang}`, async ({ page, breakpoint }) => {
        await open(page, path, lang);
        await geometry(page, breakpoint);
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
        await documentShot(page, `${slug(path)}-${lang}.png`);
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
      expect(box && box.width >= 40 && box.height >= 40, "language button tap target >= 40px").toBe(
        true,
      );
      await button.click();
      const panel = page.locator(
        breakpoint === "phone" ? '[data-layout="lang-sheet"]' : '[data-layout="lang-popover"]',
      );
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
      // Phones and tablets open the field from the header's search button.
      if (breakpoint === "laptop") await page.locator('input[type="search"]').first().click();
      else await page.locator('[data-layout="search-button"]').click();
      await expect(page.locator('input[type="search"][aria-expanded="true"]')).toBeVisible();
      // The suggestion list mounts lazily; capture the sheet only once its content is there.
      await expect(page.locator('[role="group"][aria-labelledby="rl-g-cats"]')).toBeVisible();
      await settle(page);
      await geometry(page, breakpoint, true);
      await expect(page).toHaveScreenshot(`search-${lang}.png`, shot(page, true));
    });
  });
}
