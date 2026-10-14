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

test("reference homepage: five header controls in the reference's physical order", async ({
  page,
}) => {
  for (const lang of ["ckb", "ar", "en"]) {
    await page.goto(`/?lang=${lang}`, { waitUntil: "networkidle" });
    const row = page.locator('[data-layout="ref-header"]');
    await expect(row).toBeVisible();
    // The page is rtl, but the reference fixes the physical order: logo, language, search,
    // R&L AI, menu, left to right.
    const xs = await Promise.all(
      [
        row.locator(".rl-ref-brand"),
        row.locator('[data-layout="lang-button"]'),
        row.locator('input[type="search"]'),
        row.locator(".rl-ref-ai"),
        row.locator('[data-layout="menu-button"]'),
      ].map(async (el) => {
        await expect(el, lang).toBeVisible();
        return (await el.boundingBox())!.x;
      }),
    );
    expect(xs, lang).toEqual([...xs].sort((a, b) => a - b));
    // No overlap and nothing wider than the viewport.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow, lang).toBe(0);
    await expect(row.locator(".rl-ref-ai")).toContainText("R&L AI");
    await expect(row.locator(".rl-ref-ai")).toHaveAttribute("href", /^\/ai/);
    // The logo is the owner's artwork, only keyed onto the red header.
    await expect(row.locator(".rl-ref-brand img")).toHaveAttribute(
      "src",
      "/rl-mark-white-336.webp",
    );
    // No bottom navigation on the reference homepage.
    await expect(page.locator('[data-layout="bottom-bar"]')).toHaveCount(0);
  }
});

test("reference homepage: sections, honest content and working links", async ({ page }) => {
  await page.goto("/?lang=ckb", { waitUntil: "networkidle" });
  const sections = await page
    .locator(".rl-ref > section")
    .evaluateAll((els) => els.map((el) => el.className.split(" ")[0]));
  expect(sections).toEqual([
    "rl-ref-hero",
    "rl-ref-section",
    "rl-ref-section",
    "rl-ref-banners",
    "rl-ref-section",
  ]);
  // The example/partner note closes the page body.
  await expect(page.locator(".rl-ref-note")).toHaveCount(1);
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator(".rl-ref-actions a")).toHaveCount(2);
  await expect(page.locator(".rl-ref-actions a").first()).toHaveAttribute("href", /^\/stores/);
  await expect(page.locator(".rl-ref-cats li")).toHaveCount(8);
  await expect(page.locator(".rl-ref-product")).toHaveCount(4);
  await expect(page.locator(".rl-ref-banner")).toHaveCount(2);
  await expect(page.locator(".rl-ref-benefits li")).toHaveCount(4);
  // No invented commerce: no currency amounts, discounts or ratings on the homepage body.
  const body = (await page.locator(".rl-ref").innerText()).replace(/\s+/g, " ");
  expect(body).not.toMatch(/[€$]\s?\d|\d\s?(€|IQD|%)|★/);
  // Every example product is labelled as an example and carries no price.
  await expect(page.locator(".rl-ref-badge")).toHaveCount(4);
  // Category tiles open real catalogue views.
  await page.locator(".rl-ref-cats li").first().locator("a").click();
  await expect(page).toHaveURL(/\/stores\?.*cat=electronics/);
  await expect(page).toHaveURL(/sub=smartphones/);
  // Banned searches from the header search still return nothing.
  await page.goto("/stores?lang=en&q=vodka", { waitUntil: "networkidle" });
  await expect(page.locator("[data-good],[data-store]")).toHaveCount(0);
});

test("reference homepage: header search opens the marketplace search", async ({ page }) => {
  await page.goto("/?lang=en", { waitUntil: "networkidle" });
  const input = page.locator('[data-layout="ref-header"] input[type="search"]');
  await input.fill("sneakers");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/stores\?.*q=sneakers/);
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

test("R&L AI capsule opens the existing assistant in the chosen language", async ({ page }) => {
  for (const lang of ["ckb", "ar", "en"]) {
    await page.goto(`/?lang=${lang}`, { waitUntil: "networkidle" });
    const cta = page.locator(".rl-ref-ai");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", new RegExp(`^/ai(\\?lang=${lang})?$`));
    const box = await cta.boundingBox();
    expect(box!.height, lang).toBeGreaterThanOrEqual(44);
    await cta.click();
    await expect(page).toHaveURL(/\/ai/);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("main h1")).toBeVisible();
  }
  // Keyboard: the capsule is reachable and activates with Enter.
  await page.goto("/?lang=en", { waitUntil: "networkidle" });
  await page.locator(".rl-ref-ai").focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/ai/);
});

test("marketplace toolbar: filter button and audience chips share one row", async ({ page }) => {
  for (const lang of ["ckb", "ar", "en"]) {
    await page.goto(`/stores?lang=${lang}`, { waitUntil: "networkidle" });
    const filters = await page.locator(".rl-market-toolbar .rl-mobile-filters").boundingBox();
    const chips = page.locator(".rl-market-toolbar .rl-chip");
    await expect(chips).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const chip = await chips.nth(i).boundingBox();
      expect(
        Math.abs(chip!.y + chip!.height / 2 - (filters!.y + filters!.height / 2)),
        lang,
      ).toBeLessThan(2);
      expect(chip!.height, lang).toBeGreaterThanOrEqual(44);
    }
    // The layout is rtl in every language: the filter button sits at the start (right) edge.
    const width = page.viewportSize()!.width;
    expect(Math.round(filters!.x + filters!.width), lang).toBeGreaterThan(width - 32);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow, lang).toBe(0);
  }
});

test("compact forms and store cards at 360px", async ({ page }) => {
  // Quote: length, width and height share one row.
  await page.goto("/quote?lang=ckb", { waitUntil: "networkidle" });
  const dims = page.locator(".rl-quote-card .col-span-2 input");
  await expect(dims).toHaveCount(3);
  const ys = await dims.evaluateAll((els) =>
    els.map((e) => Math.round(e.getBoundingClientRect().top)),
  );
  expect(new Set(ys).size).toBe(1);
  // Order request: size, colour and quantity share one row.
  await page.goto("/stores/request?store=zalando&intent=buy&lang=ckb", {
    waitUntil: "networkidle",
  });
  const row = page.locator("form .grid-cols-3 input");
  await expect(row).toHaveCount(3);
  const ry = await row.evaluateAll((els) =>
    els.map((e) => Math.round(e.getBoundingClientRect().top)),
  );
  expect(new Set(ry).size).toBe(1);
  // Store cards: one primary action, the domain links to the store's own site.
  await page.goto("/stores?lang=ckb", { waitUntil: "networkidle" });
  const card = page.locator("[data-store=zalando]");
  await expect(card.locator(".rl-button[data-variant=primary]")).toHaveCount(1);
  await expect(card.locator("a.rl-store-site")).toHaveAttribute("href", /zalando/);
  await expect(card.locator("a.rl-store-site")).toHaveAttribute("target", "_blank");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBe(0);
});
