import { test, expect } from "@playwright/test";

test("slow font swaps keep the mobile hero within the layout-shift budget", async ({ page }) => {
  test.setTimeout(60_000);
  for (const lang of ["ckb", "ar", "en"]) {
    let release!: () => void;
    const fonts = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/fonts/**", async (route) => {
      await fonts;
      await route.continue();
    });
    await page.addInitScript(() => {
      const state = window as typeof window & { fontShift: number };
      state.fontShift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
          if (!shift.hadRecentInput) state.fontShift += shift.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(`/?lang=${lang}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main h1")).toBeVisible();
    // Hold fonts beyond the browser's initial swap period so the fallback actually paints.
    await page.waitForTimeout(400);
    const initialHeadingHeight = (await page.locator("main h1").boundingBox())?.height;
    release();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    expect((await page.locator("main h1").boundingBox())?.height, lang).toBe(initialHeadingHeight);
    expect(
      await page.evaluate(() => (window as typeof window & { fontShift: number }).fontShift),
      lang,
    ).toBeLessThan(0.05);
    await page.unroute("**/fonts/**");
  }
});

test("homepage calculator keeps dimensions and quote handoff after scrolling", async ({ page }) => {
  // Exercise the server-rendered page before a slow client bootstrap finishes.
  await page.route("**/assets/*.js", async (route) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });
  await page.goto("/?lang=en", { waitUntil: "commit" });
  const calculator = page.locator(".rl-deferred-calculator");
  await expect
    .poll(
      async () => {
        await calculator.scrollIntoViewIfNeeded();
        return page.locator(".rl-quick-options").isVisible();
      },
      { intervals: [100, 250, 500] },
    )
    .toBe(true);
  await expect(page.locator(".rl-quick-options")).toBeVisible();
  await page.unroute("**/assets/*.js");
  const length = page.locator(".rl-quick-fields input").nth(1);
  await length.fill("60");
  await expect(page.locator(".rl-quick-options .rl-price").first()).toContainText("56.16");
  await page.evaluate(() => window.scrollTo(0, 0));
  await calculator.scrollIntoViewIfNeeded();
  await expect(length).toHaveValue("60");
  await page.locator(".rl-calc-note a").click();
  await expect(page).toHaveURL(/\/quote\?.*l=60/);
  await expect(page.locator('input[inputmode="decimal"]').nth(1)).toHaveValue("60");
});

const ROUTES = [
  "/",
  "/stores",
  "/stores?cat=fashion",
  "/stores?fav=1",
  "/stores/request?store=zalando&intent=buy",
  "/stores/request?store=zalando&intent=ship",
  "/quote",
  "/market",
  "/ai",
  "/impressum",
  "/privacy",
  "/terms",
];
test("language switches preserve store query parameters and reload in the selected locale", async ({
  page,
}) => {
  await page.goto("/stores?cat=fashion&fav=1&lang=ckb", { waitUntil: "networkidle" });
  for (const lang of ["ar", "en", "ku"]) {
    await page.locator("footer select").selectOption(lang);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    expect(new URL(page.url()).searchParams.get("cat")).toBe("fashion");
    expect(new URL(page.url()).searchParams.get("fav")).toBe("1");
    expect(new URL(page.url()).searchParams.get("lang")).toBe(lang);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    // The layout stays right-to-left in every language; only the text direction changes.
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute(
      "data-textdir",
      lang === "ar" ? "rtl" : "ltr",
    );
  }
});

for (const lang of ["ckb", "ar", "en"] as const)
  for (const theme of ["light", "dark"] as const) {
    test(`${lang} ${theme}: required routes at 360px`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.addInitScript(
        ({ lang, theme }) => {
          localStorage.setItem("rl-lang-v4", lang);
          localStorage.setItem("rl-theme-v1", theme);
        },
        { lang, theme },
      );
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      for (const route of ROUTES) {
        const response = await page.goto(`${route}${route.includes("?") ? "&" : "?"}lang=${lang}`, {
          waitUntil: "networkidle",
        });
        expect(response?.status(), route).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
        await expect(page.locator("html")).toHaveAttribute(
          "data-textdir",
          lang === "en" ? "ltr" : "rtl",
        );
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(
          page.locator("main h1:not([aria-hidden=true])").filter({ visible: true }),
        ).toHaveCount(1);
        expect(
          await page.evaluate(
            () =>
              Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) <=
              innerWidth + 1,
          ),
          route,
        ).toBe(true);
        expect(await page.locator("img:not([alt])").count(), `${route}: image descriptions`).toBe(
          0,
        );
      }
      expect(errors).toEqual([]);
    });
  }

test("360px filters, favorites, keyboard dialog and banned searches", async ({ page }) => {
  await page.goto("/stores?lang=en");
  const filters = page.locator(".rl-mobile-filters");
  await filters.click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toBeVisible();
  await dialog.locator("select").nth(0).selectOption("fashion");
  await dialog.locator("select").nth(1).selectOption("zalando");
  await page.keyboard.press("Escape");
  await expect(filters).toBeFocused();
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("[data-good]")).toHaveCount(1);
  await expect(page.locator("[data-store=zalando]")).toHaveCount(1);
  await page.locator("[data-store=zalando] button[aria-pressed]").click();
  await page.goto("/stores?fav=1&lang=en");
  await expect(page.locator("[data-store]")).toHaveCount(1);
  for (const q of ["Cigarettes", "Vape", "Vodka", "Pork bacon"]) {
    await page.goto(`/stores?lang=en&q=${encodeURIComponent(q)}`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-good],[data-store]")).toHaveCount(0);
    await expect(page.locator(".rl-empty-state")).toBeVisible();
  }
});

const PRIMARY = [
  "electronics",
  "sports",
  "baby",
  "home",
  "gaming",
  "beauty",
  "auto",
  "fashion",
  "pets",
];

test("catalogue: ten category rows, direct URLs, history, subcategories and honest empty states", async ({
  page,
}) => {
  await page.goto("/stores?lang=en", { waitUntil: "networkidle" });
  const rows = page.locator(".rl-category-row");
  await expect(rows).toHaveCount(10);
  // Food awaits owner approval: visible, not a link, lists nothing.
  await expect(page.locator('.rl-category-row[data-category="food"]')).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(page.locator('a.rl-category-row[data-category="food"]')).toHaveCount(0);
  for (const cat of PRIMARY) {
    await page.goto("/stores?lang=en", { waitUntil: "networkidle" });
    await page.locator(`a.rl-category-row[data-category="${cat}"]`).click();
    await expect(page).toHaveURL(new RegExp(`cat=${cat}(&|$)`));
    await expect(page.locator(".rl-subcategories")).toBeVisible();
    // A published category with no listed store shows the honest empty state, never invented items.
    const cards = await page.locator("[data-good],[data-store]").count();
    if (cards === 0) await expect(page.locator(".rl-empty-state")).toBeVisible();
  }
  // Subcategory refinement is a real URL and survives reload, back and forward.
  await page.goto("/stores?lang=en&cat=electronics", { waitUntil: "networkidle" });
  await page.locator('[data-sub="tablets"]').click();
  await expect(page).toHaveURL(/sub=tablets/);
  await expect(page.locator('[data-sub-detail="tablets"]')).toBeVisible();
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator('[data-sub-detail="tablets"]')).toBeVisible();
  await page.goBack();
  await expect(page.locator('[data-sub-detail="tablets"]')).toHaveCount(0);
  // Language and other filters are kept when choosing a category.
  await page.goto("/stores?lang=ckb&country=DE", { waitUntil: "networkidle" });
  await page.locator('a.rl-category-row[data-category="pets"]').click();
  await expect(page).toHaveURL(/cat=pets/);
  await expect(page).toHaveURL(/country=DE/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ckb");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  // Banned queries stay empty even inside a category, and a pending category lists nothing.
  await page.goto("/stores?lang=en&cat=food", { waitUntil: "networkidle" });
  await expect(page.locator("[data-good],[data-store]")).toHaveCount(0);
  await page.goto("/stores?lang=en&cat=pets&q=vodka", { waitUntil: "networkidle" });
  await expect(page.locator("[data-good],[data-store]")).toHaveCount(0);
});

test("hero: the AI call to action opens the existing assistant in the chosen language", async ({
  page,
}) => {
  for (const lang of ["ckb", "ar", "en"]) {
    await page.goto(`/?lang=${lang}`, { waitUntil: "networkidle" });
    const cta = page.locator(".rl-hero-slide:not([aria-hidden=true]) .rl-hero-cta");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", new RegExp(`^/ai(\\?lang=${lang})?$`));
    // Visible without scrolling on a phone, and a comfortable touch target.
    const box = await cta.boundingBox();
    expect(box!.y + box!.height, lang).toBeLessThanOrEqual(800);
    expect(box!.height, lang).toBeGreaterThanOrEqual(44);
    await cta.click();
    await expect(page).toHaveURL(/\/ai/);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("main h1")).toBeVisible();
  }
  // Keyboard: the CTA is reachable and activates with Enter.
  await page.goto("/?lang=en", { waitUntil: "networkidle" });
  await page.locator(".rl-hero-slide:not([aria-hidden=true]) .rl-hero-cta").focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/ai/);
});

test("hero: the marketplace, AI and shipping buttons stay in place on every slide", async ({
  page,
}) => {
  for (const lang of ["ckb", "ar", "en"]) {
    await page.goto(`/?lang=${lang}`, { waitUntil: "networkidle" });
    const slides = page.locator(".rl-hero-slide");
    const count = await slides.count();
    expect(count).toBeGreaterThan(1);
    const shop = page.locator(".rl-hero-slide:not([aria-hidden=true]) .rl-hero-shop");
    await expect(shop).toHaveAttribute("href", new RegExp(`^/stores(\\?lang=${lang})?$`));
    const first = await shop.boundingBox();
    expect(first!.y + first!.height, lang).toBeLessThanOrEqual(800);
    for (let i = 0; i < count; i++) {
      const slide = slides.nth(i);
      await expect(slide.locator(".rl-hero-shop")).toHaveCount(1);
      await expect(slide.locator(".rl-hero-secondary")).toHaveCount(1);
      const box = await slide.locator(".rl-hero-shop").boundingBox();
      const own = await slide.boundingBox();
      // Same vertical position on every slide (relative to its own slide).
      expect(Math.round(box!.y - own!.y), `${lang} slide ${i + 1}`).toBe(
        Math.round(first!.y - (await slides.first().boundingBox())!.y),
      );
    }
  }
});
