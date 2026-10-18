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
  await page.locator('main a[href^="/quote"]').first().click();
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

test("R&L AI capsule opens the existing assistant in the chosen language", async ({ page }) => {
  for (const lang of ["ckb", "ar", "en"]) {
    await page.goto(`/?lang=${lang}`, { waitUntil: "networkidle" });
    const cta = page.locator(".rl-ref-ai");
    await expect(cta).toHaveCount(1);
    await expect(cta).toBeVisible();
    await expect(cta).toContainText("R&L AI");
    await expect(cta).toHaveAttribute("href", new RegExp(`^/ai(\\?lang=${lang})?$`));
    const box = await cta.boundingBox();
    expect(box!.height, lang).toBeGreaterThanOrEqual(44);
    await cta.click();
    await expect(page).toHaveURL(/\/ai/);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("main h1")).toBeVisible();
    // Back returns to the homepage with the hero in place.
    await page.goBack();
    await expect(page.locator(".rl-ref-hero h1")).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/ai/);
  }
  // Keyboard: the capsule is reachable and activates with Enter.
  await page.goto("/?lang=en", { waitUntil: "networkidle" });
  await page.locator(".rl-ref-ai").focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/ai/);
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
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow, lang).toBe(0);
    // The logo is the owner's artwork, only keyed onto the red header.
    await expect(row.locator(".rl-ref-brand img")).toHaveAttribute(
      "src",
      "/rl-mark-white-336.webp",
    );
    // No bottom navigation on the reference homepage.
    await expect(page.locator('[data-layout="bottom-bar"]')).toHaveCount(0);
  }
});

test("reference homepage: sections, honest content and every service reachable", async ({
  page,
}) => {
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
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator(".rl-ref-cats li")).toHaveCount(8);
  await expect(page.locator(".rl-ref-banner")).toHaveCount(2);
  await expect(page.locator(".rl-ref-benefits li")).toHaveCount(4);
  // Marketplace and Bring For Me are the two hero actions; tracking and shipping prices are
  // one tap away from the benefit cards.
  const actions = page.locator(".rl-ref-actions a");
  await expect(actions).toHaveCount(2);
  await expect(actions.nth(0)).toHaveAttribute("href", /\/market/);
  await expect(actions.nth(1)).toHaveAttribute("href", /\/stores\/request/);
  for (const href of ["/track", "/quote", "/stores/request"])
    await expect(page.locator(`.rl-ref-benefits a[href^="${href}"]`)).toHaveCount(1);
  // No invented commerce: no currency amounts, discounts or ratings in the page body.
  const body = (await page.locator(".rl-ref").innerText()).replace(/\s+/g, " ");
  expect(body).not.toMatch(/[€$]\s?\d|\d\s?(€|%)|★/);
  // The CARE+ banner states that the service is not available yet.
  await expect(page.locator(".rl-ref-soon")).toHaveCount(1);
  // Category tiles open real catalogue views.
  await page.locator(".rl-ref-cats li").first().locator("a").click();
  await expect(page).toHaveURL(/\/stores\?.*cat=electronics/);
  await expect(page).toHaveURL(/sub=smartphones/);
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
  // Optional size and colour share a row; quantity remains directly visible.
  await page.goto("/stores/request?store=zalando&intent=buy&lang=ckb", {
    waitUntil: "networkidle",
  });
  await page
    .locator("details")
    .filter({ has: page.locator("[data-product-link]") })
    .locator("summary")
    .click();
  await page.locator("form details summary").click();
  const row = page.locator("form .grid-cols-2 input");
  await expect(row).toHaveCount(2);
  await expect(page.locator('form [name="qty"]')).toBeVisible();
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
    // Server-rendered: the flag is stamped on <html> and the optional panel follows the form,
    // so nothing is inserted above the form after load.
    const html = await (await request.get(`/stores/request?intent=buy&lang=${lang}`)).text();
    expect(html, lang).toContain('data-rl-plink="1"');
    const panel = html.indexOf("data-product-link");
    const form = html.indexOf('class="rl-card rl-request-form"');
    expect(panel, `${lang} panel in HTML`).toBeGreaterThan(-1);
    expect(form, `${lang} form in HTML`).toBeGreaterThan(-1);
    expect(panel, `${lang} optional check follows the form`).toBeGreaterThan(form);

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
    await expect(page.locator("[data-product-link]")).not.toBeVisible();
    await page
      .locator("details")
      .filter({ has: page.locator("[data-product-link]") })
      .locator("summary")
      .click();
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
  // The reference homepage has no announcement bar; wherever one is shown it is a region named
  // by its own text (no text outside landmarks).
  const bar = page.locator("section.rl-announcement");
  if (await bar.count()) {
    await expect(bar).toHaveAttribute("aria-labelledby", "rl-announcement-text");
    await expect(bar.locator("#rl-announcement-text")).toBeVisible();
  }
  await expect(
    page.locator(".rl-ref section[aria-labelledby], .rl-ref section[aria-label]"),
  ).toHaveCount(5);
  const outside = await page.evaluate(() => {
    const landmarks =
      "header, nav, main, footer, aside, section[aria-labelledby], section[aria-label]";
    return [...document.body.querySelectorAll("p, h1, h2, h3, li")].filter(
      (el) => el.closest(landmarks) === null && (el as HTMLElement).offsetParent !== null,
    ).length;
  });
  expect(outside).toBe(0);
});

test("header category strip: directly under the header, swipeable, active state, every language", async ({
  page,
}) => {
  for (const lang of ["ckb", "ku", "de", "en", "ar", "fa", "tr"]) {
    await page.goto(`/stores?lang=${lang}`, { waitUntil: "networkidle" });
    const header = page.locator(".rl-site-header");
    const strip = page.locator('[data-layout="category-strip"]');
    await expect(strip, lang).toBeVisible();
    // Directly below the red header row, with nothing in between.
    const h = (await header.boundingBox())!;
    const s = (await strip.boundingBox())!;
    expect(Math.abs(s.y - (h.y + h.height)), lang).toBeLessThanOrEqual(1);
    // Ten primary categories plus "More"; food awaits approval and is not a link.
    await expect(strip.locator("li"), lang).toHaveCount(11);
    await expect(strip.locator('a[data-category="food"]'), lang).toHaveCount(0);
    await expect(strip.locator('[data-category="food"]'), lang).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    // The list scrolls sideways; the page itself never does.
    const overflow = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      list: (() => {
        const list = document.querySelector<HTMLElement>(".rl-category-strip-list")!;
        return list.scrollWidth - list.clientWidth;
      })(),
    }));
    expect(overflow.page, lang).toBeLessThanOrEqual(0);
    expect(overflow.list, lang).toBeGreaterThan(0);
    // Header actions in one row, comfortable touch targets.
    const actions = ["menu-button", "search-button", "lang-button", "account-button"].map((id) =>
      page.locator(`.rl-header-row [data-layout="${id}"]`),
    );
    const boxes = await Promise.all(actions.map((a) => a.boundingBox()));
    for (const box of boxes) {
      expect(box!.height, lang).toBeGreaterThanOrEqual(44);
      expect(Math.abs(box!.y - boxes[0]!.y), lang).toBeLessThanOrEqual(1);
    }
  }
  // Choosing a category marks it (aria-current) and keeps it in view after scrolling there.
  await page.goto("/stores?lang=en", { waitUntil: "networkidle" });
  const pets = page.locator('[data-layout="category-strip"] a[data-category="pets"]');
  await pets.click();
  await expect(page).toHaveURL(/cat=pets/);
  await expect(pets).toHaveAttribute("aria-current", "page");
  await expect(page.locator('[data-layout="category-strip"] [aria-current="page"]')).toHaveCount(1);
  await expect(pets).toBeInViewport();
  // A direct link to a category far down the strip also opens with it in view, and no name
  // is cut off in any language (fixed-width items, up to three lines).
  await page.goto("/stores?lang=en&cat=beauty", { waitUntil: "networkidle" });
  await expect(
    page.locator('[data-layout="category-strip"] a[data-category="beauty"]'),
  ).toBeInViewport();
  for (const lang of ["ckb", "ku", "de", "en", "ar", "fa", "tr"]) {
    await page.goto(`/stores?lang=${lang}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const cut = await page.$$eval(".rl-category-strip-label", (els) =>
      els.filter((el) => el.scrollHeight > el.clientHeight + 1).map((el) => el.textContent),
    );
    expect(cut, lang).toEqual([]);
  }
  await page.goto("/stores?lang=en&cat=pets", { waitUntil: "networkidle" });
  // "More" opens the full menu; the header search button opens the search field.
  await page.locator('[data-layout="category-strip"] button').click();
  await expect(page.locator('[data-layout="sheet"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator('[data-layout="search-button"]').click();
  await expect(page.locator('input[type="search"][aria-expanded="true"]')).toBeFocused();
});

test("refinement: header, hero and sections share one content edge; touch targets stay 44px", async ({
  page,
}) => {
  const edges = () =>
    page.evaluate(() => {
      const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      return {
        brand: Math.round(box(".rl-ref-brand").left),
        menu: Math.round(box(".rl-ref-menu").right),
        head: Math.round(box(".rl-ref-section .rl-ref-head").left),
        headEnd: Math.round(box(".rl-ref-section .rl-ref-head").right),
        lineOne: Math.round(box(".rl-ref-title-1").left),
        lineTwo: Math.round(box(".rl-ref-title-2").left),
        eyebrow: Math.round(box(".rl-ref-eyebrow").left),
      };
    });
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const lang of ["ckb", "ar", "en"]) {
      await page.goto(`/?lang=${lang}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const e = await edges();
      const at = `${lang} ${width}`;
      expect(e.brand, at).toBe(e.head);
      expect(e.menu, at).toBe(e.headEnd);
      // Both headline lines start where the eyebrow starts, in every script.
      expect(e.lineOne, at).toBe(e.eyebrow);
      expect(e.lineTwo, at).toBe(e.eyebrow);
      // From laptop widths beyond the 1200px column the hero copy starts on that column.
      if (width >= 1440) expect(e.eyebrow, at).toBe(e.head);
    }
  }
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/?lang=ckb", { waitUntil: "networkidle" });
  const small = await page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLElement>(
        '[data-layout="ref-header"] a, [data-layout="ref-header"] button, .rl-ref-link, .rl-site-footer nav a, .rl-site-footer .rl-button',
      ),
    ]
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && (r.width < 44 || r.height < 44))
      .map(
        ({ el, r }) =>
          `${el.textContent?.trim() || el.getAttribute("aria-label")} ${r.width}x${r.height}`,
      ),
  );
  expect(small).toEqual([]);
  // No bottom bar on the reference homepage, so the footer reserves no space for one.
  expect(
    await page.locator(".rl-site-footer").evaluate((el) => getComputedStyle(el).paddingBlockEnd),
  ).toBe("0px");
});

test("quote weight accepts the decimal comma and Arabic-Indic or Persian digits like a plain 3.2", async ({
  page,
}) => {
  // Sorani and Arabic keyboards type these; the result must match 3.2 kg exactly.
  const same = ["3,2", "٣٫٢", "٣.٢", "۳٫۲"];
  const refused = ["abc", "1e1", "0", "70.1", "3 kg"];
  for (const lang of ["ckb", "ar", "en"]) {
    await page.goto(`/quote?lang=${lang}`, { waitUntil: "networkidle" });
    const weight = page.locator("main input[inputmode=decimal]").first();
    await weight.fill("3.2");
    await expect(weight, lang).toHaveAttribute("aria-invalid", "false");
    const reference = await page.locator("main").innerText();
    for (const typed of same) {
      await weight.fill(typed);
      await expect(weight, `${lang} ${typed}`).toHaveAttribute("aria-invalid", "false");
      expect(await page.locator("main").innerText(), `${lang} ${typed}`).toBe(reference);
    }
    for (const typed of refused) {
      await weight.fill(typed);
      await expect(weight, `${lang} ${typed}`).toHaveAttribute("aria-invalid", "true");
    }
    // 0.1 kg is the smallest accepted weight.
    await weight.fill("0,1");
    await expect(weight, lang).toHaveAttribute("aria-invalid", "false");
  }
});
