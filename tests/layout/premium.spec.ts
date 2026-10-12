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

test("shipping stays on its own route even with a remembered delivery preference", async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: "rl-service", value: "delivery", url: "http://localhost:8788" },
  ]);
  await page.addInitScript(() => localStorage.setItem("rl-service-v1", "delivery"));
  for (const route of ["/?lang=en", "/stores?lang=en", "/?cat=fashion&lang=en"]) {
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator('main input[inputmode="decimal"]')).toHaveCount(0);
    await expect(page.locator(".rl-quote-option, .rl-quick-calc")).toHaveCount(0);
  }
  await page.goto("/?lang=en", { waitUntil: "networkidle" });
  await page.locator(".rl-hero-secondary").click();
  await expect(page).toHaveURL(/\/quote/);
  await expect(page.locator(".rl-shipping-page h1")).toBeVisible();
  await expect(page.locator(".rl-quote-option")).toHaveCount(3);
});

test("shipping preserves quote parameters, recalculates rates and saves the chosen quote", async ({
  page,
}) => {
  await page.goto("/quote?lang=en&l=60&w=30&h=20&kg=3.2", { waitUntil: "networkidle" });
  const length = page.locator(".rl-quote-card .col-span-2 input").first();
  await expect(length).toHaveValue("60");
  await expect(page.locator(".rl-quote-option .rl-price").first()).toContainText("56.16");
  await length.fill("40");
  await expect(page.locator(".rl-quote-option .rl-price").first()).toContainText("37.44");
  await page
    .locator(".rl-quote-option")
    .first()
    .getByRole("button", { name: "Keep on this device", exact: true })
    .click();
  await expect(page.getByRole("status")).toBeVisible();
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator(".rl-quote-stack > section li")).toHaveCount(1);
  await page.locator(".rl-quote-stack > section").getByRole("button").click();
  await expect(page.locator(".rl-quote-stack > section")).toHaveCount(0);
  await length.fill("0");
  await expect(length).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator(".rl-quote-option")).toHaveCount(0);
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
    const cta = page.locator(".rl-ai-hero .rl-ai-hero-cta");
    await expect(cta).toHaveCount(1);
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("data-variant", "primary");
    await expect(cta).toHaveAttribute("href", new RegExp(`^/ai(\\?lang=${lang})?$`));
    // Visible without scrolling on a phone, and a comfortable touch target.
    const box = await cta.boundingBox();
    expect(box!.y + box!.height, lang).toBeLessThanOrEqual(800);
    expect(box!.height, lang).toBeGreaterThanOrEqual(44);
    await cta.click();
    await expect(page).toHaveURL(/\/ai/);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("main h1")).toBeVisible();
    // Back returns to the homepage with the hero in place.
    await page.goBack();
    await expect(page.locator(".rl-ai-hero h1")).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/ai/);
  }
  // Keyboard: the CTA is reachable and activates with Enter.
  await page.goto("/?lang=en", { waitUntil: "networkidle" });
  await page.locator(".rl-ai-hero-cta").focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/ai/);
});

test("hero: one static section right under the header, same place in every language", async ({
  page,
}) => {
  await page.goto("/?lang=ckb", { waitUntil: "networkidle" });
  // No carousel, no slides: exactly one hero, and it is the first section in <main>.
  await expect(page.locator(".rl-ai-hero")).toHaveCount(1);
  await expect(page.locator(".rl-hero-slide, .rl-carousel-dot")).toHaveCount(0);
  await expect(page.locator("main section").first()).toHaveClass(/rl-ai-hero/);
  const heroTop = async () => (await page.locator(".rl-ai-hero").boundingBox())!.y;
  const ctaCenter = async () => {
    const b = (await page.locator(".rl-ai-hero-cta").boundingBox())!;
    return b.x + b.width / 2;
  };
  const top = await heroTop();
  const center = await ctaCenter();
  for (const lang of ["ckb", "ar", "fa", "en", "de", "tr", "ku"]) {
    await page.goto(`/?lang=${lang}`, { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    expect(Math.round(await heroTop()), lang).toBe(Math.round(top));
    // The CTA stays centred whatever the text direction.
    expect(Math.abs((await ctaCenter()) - center), lang).toBeLessThanOrEqual(1);
    // The header does not overlap the hero, and nothing scrolls sideways.
    const header = await page.locator("header").first().boundingBox();
    expect(header!.y + header!.height, lang).toBeLessThanOrEqual(Math.ceil(await heroTop()));
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      lang,
    ).toBeLessThanOrEqual(360);
    // A refresh renders the same hero in the same place.
    await page.reload({ waitUntil: "networkidle" });
    expect(Math.round(await heroTop()), `${lang} reload`).toBe(Math.round(top));
  }
});

test("hero: the marketplace and shipping buttons sit under the AI action", async ({ page }) => {
  for (const lang of ["ckb", "ar", "en"]) {
    await page.goto(`/?lang=${lang}`, { waitUntil: "networkidle" });
    const shop = page.locator(".rl-ai-hero .rl-hero-shop");
    await expect(shop).toHaveAttribute("href", new RegExp(`^/stores(\\?lang=${lang})?$`));
    await expect(page.locator(".rl-ai-hero .rl-hero-secondary")).toHaveCount(1);
    const cta = (await page.locator(".rl-ai-hero-cta").boundingBox())!;
    const box = (await shop.boundingBox())!;
    expect(box.y, lang).toBeGreaterThanOrEqual(cta.y + cta.height);
  }
});

test("shipping: the parcel card only links to tracking and invents no shipment", async ({
  page,
}) => {
  for (const lang of ["ckb", "ar", "en"]) {
    await page.goto(`/quote?lang=${lang}`, { waitUntil: "networkidle" });
    const card = page.locator(".rl-shipping-track");
    await expect(card).toHaveCount(1);
    await expect(card.locator("a")).toHaveAttribute(
      "href",
      new RegExp(`^/track(\\?lang=${lang})?$`),
    );
    // No parcel number, status or progress bar unless a real shipment is looked up on /track.
    await expect(card).not.toContainText(/RL-\d/);
    await expect(card.locator("[role=progressbar], progress")).toHaveCount(0);
  }
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

test("product link: the panel is in the server HTML and the request form never shifts", async ({
  page,
  request,
}) => {
  for (const lang of ["ckb", "en"]) {
    // Server-rendered: the flag is stamped on <html> and the panel precedes the form in the HTML,
    // so nothing is inserted above the form after load.
    const html = await (await request.get(`/stores/request?intent=buy&lang=${lang}`)).text();
    expect(html, lang).toContain('data-rl-plink="1"');
    const panel = html.indexOf("data-product-link");
    const form = html.indexOf('class="rl-card rl-request-form"');
    expect(panel, `${lang} panel in HTML`).toBeGreaterThan(-1);
    expect(form, `${lang} form in HTML`).toBeGreaterThan(panel);

    await page.addInitScript(() => {
      const state = window as typeof window & { shift: number };
      state.shift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
          if (!shift.hadRecentInput) state.shift += shift.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(`/stores/request?intent=buy&lang=${lang}`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-product-link]")).toBeVisible();
    await page.waitForTimeout(500);
    expect(
      await page.evaluate(() => (window as typeof window & { shift: number }).shift),
      lang,
    ).toBeLessThan(0.02);
  }
});

test("accessibility: every homepage landmark is named and all page text sits in a landmark", async ({
  page,
}) => {
  await page.goto("/?lang=en", { waitUntil: "networkidle" });
  // The announcement bar is a region named by its own text (no text outside landmarks).
  const bar = page.locator("section.rl-announcement");
  await expect(bar).toHaveAttribute("aria-labelledby", "rl-announcement-text");
  await expect(bar.locator("#rl-announcement-text")).toBeVisible();
  const outside = await page.evaluate(() => {
    const landmarks =
      "header, nav, main, footer, aside, section[aria-labelledby], section[aria-label]";
    return [...document.body.querySelectorAll("p, h1, h2, h3, li")].filter(
      (el) => el.closest(landmarks) === null && (el as HTMLElement).offsetParent !== null,
    ).length;
  });
  expect(outside).toBe(0);
});
