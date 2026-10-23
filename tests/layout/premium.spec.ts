import { mkdirSync } from "node:fs";
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
    await page.locator('[data-layout="lang-button"]').click();
    await page.locator(`[role="option"][data-lang="${lang}"]`).click();
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
  await page.keyboard.press("Escape");
  await expect(filters).toBeFocused();
  // Country and retailer are chosen in the discovery rows above the results.
  await page.locator('.rl-country-chips [data-country="DE"]').click();
  if (await page.locator(".rl-retailer-picker:not([open]) summary").count())
    await page.locator(".rl-retailer-picker summary").click();
  await page.locator('.rl-retailer[data-retailer="zalando"]').click();
  await expect(page).toHaveURL(/store=zalando/);
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("[data-good]")).toHaveCount(0);
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

test("catalogue: category pills, direct URLs, history, subcategories and honest empty states", async ({
  page,
}) => {
  await page.goto("/stores?lang=en", { waitUntil: "networkidle" });
  await expect(page.locator(".rl-category-row, [data-good]")).toHaveCount(0);
  await expect(page.locator('.rl-discovery-categories [data-category="food"]')).toHaveCount(0);
  for (const cat of PRIMARY) {
    await page.goto("/stores?lang=en", { waitUntil: "networkidle" });
    await page.locator(`.rl-discovery-categories [data-category="${cat}"]`).click();
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
  await page.locator('.rl-discovery-categories [data-category="pets"]').click();
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
    // The five-tab bottom navigation is present on the homepage too: fixed to the viewport
    // bottom on phones and tablets, hidden from 1024px up (desktop is unchanged).
    const bar = page.locator('[data-layout="bottom-bar"]');
    await expect(bar, lang).toHaveCount(1);
    await expect(bar.locator("a"), lang).toHaveCount(5);
    if (page.viewportSize()!.width < 1024) {
      await expect(bar, lang).toBeVisible();
      const box = (await bar.boundingBox())!;
      expect(Math.abs(box.y + box.height - page.viewportSize()!.height), lang).toBeLessThanOrEqual(
        1,
      );
    } else {
      await expect(bar, lang).toBeHidden();
    }
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
  await card.locator(".rl-store-primary").click();
  await expect(page.locator("dialog[open] a.rl-store-site")).toHaveAttribute("href", /zalando/);
  await expect(page.locator("dialog[open] a.rl-store-site")).toHaveAttribute("target", "_blank");
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

test("store discovery: one swipeable category row with preserved filters in every language", async ({
  page,
}) => {
  for (const lang of ["ckb", "ku", "de", "en", "ar", "fa", "tr"]) {
    await page.goto(`/stores?lang=${lang}&country=DE`, { waitUntil: "networkidle" });
    await expect(page.locator('[data-layout="category-strip"], .rl-category-row')).toHaveCount(0);
    const categories = page.locator(".rl-discovery-categories");
    await expect(categories).toBeVisible();
    await expect(categories.locator('[data-category="food"]')).toHaveCount(0);
    await categories.locator('[data-category="pets"]').click();
    await expect(page).toHaveURL(/cat=pets/);
    await expect(page).toHaveURL(/country=DE/);
    await expect(categories.locator('[data-category="pets"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    const actions = ["menu-button", "search-button", "lang-button", "account-button"].map((id) =>
      page.locator(`.rl-header-row [data-layout="${id}"]`),
    );
    const boxes = await Promise.all(actions.map((a) => a.boundingBox()));
    for (const box of boxes) {
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(Math.abs(box!.y - boxes[0]!.y)).toBeLessThanOrEqual(1);
    }
    await page.locator('[data-layout="menu-button"]').click();
    await expect(page.locator('[data-layout="sheet"] a[href="/privacy"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await page.locator('[data-layout="search-button"]').click();
    await expect(page.locator('input[type="search"][aria-expanded="true"]')).toBeFocused();
  }
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
  // The bottom bar is on the homepage too, so the footer reserves its space on phones:
  // bar height (4rem) + safe area (0 here) + one spacing step (1rem).
  expect(
    await page.locator(".rl-site-footer").evaluate((el) => getComputedStyle(el).paddingBlockEnd),
  ).toBe("80px");
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

test("european stores: five countries, official handoff, preserved filters and no China/US store", async ({
  page,
  context,
}) => {
  await page.goto("/stores?lang=en", { waitUntil: "networkidle" });
  const countries = page.locator(".rl-country-chips [data-country]");
  await expect(countries).toHaveCount(5);
  expect(
    await countries.evaluateAll((els) => els.map((el) => el.getAttribute("data-country"))),
  ).toEqual(["DE", "CH", "IT", "FR", "GB"]);
  // SHEIN (outside Europe) stays in the shared data but is not in this directory.
  await expect(page.locator("[data-store=shein]")).toHaveCount(0);
  await expect(page.locator('[data-retailer="shein"]')).toHaveCount(0);
  for (const country of ["CN", "US", "INT"])
    await expect(page.locator(`[data-store][data-country="${country}"]`)).toHaveCount(0);

  // Country selection filters in place: same page, real URL, every card from that country.
  await page.locator('.rl-country-chips [data-country="IT"]').click();
  await expect(page).toHaveURL(/country=IT/);
  const cards = page.locator("[data-store]");
  expect(await cards.count()).toBeGreaterThan(0);
  expect(
    new Set(await cards.evaluateAll((els) => els.map((el) => el.getAttribute("data-country")))),
  ).toEqual(new Set(["IT"]));
  // The rail lists one entry per retailer with a storefront there; OTTO has none in Italy.
  await expect(page.locator('.rl-retailer[data-retailer="otto"]')).toHaveCount(0);
  // A country storefront offers Bring For Me for its own store id.
  const regional = page.locator("[data-store=zalando-it]");
  await expect(regional.locator(".rl-store-primary")).toHaveCount(1);
  await regional.locator(".rl-store-primary").click();
  await expect(page.locator('dialog[open] a[data-variant="primary"]')).toHaveAttribute(
    "href",
    /store=zalando-it/,
  );
  await expect(page.locator("dialog[open] .rl-store-site")).toHaveAttribute(
    "href",
    "https://www.zalando.it/",
  );
  await expect(page.locator("dialog[open] .rl-store-site")).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
  await page.keyboard.press("Escape");

  // Active filters are visible chips; removing one keeps the others, reset clears all.
  if (await page.locator(".rl-retailer-picker:not([open]) summary").count())
    await page.locator(".rl-retailer-picker summary").click();
  await page.locator('.rl-retailer[data-retailer="zalando"]').click();
  await expect(page).toHaveURL(/store=zalando/);
  const active = page.locator(".rl-active-filter");
  await expect(active).toHaveCount(2);
  await active.filter({ hasText: "Zalando" }).click();
  await expect(page).not.toHaveURL(/store=/);
  await expect(page).toHaveURL(/country=IT/);
  await page.locator(".rl-active-filters .rl-text-action").click();
  await expect(page).not.toHaveURL(/country=/);
  await expect(page.locator(".rl-active-filter")).toHaveCount(0);

  // Keyboard: the retailer rail is reachable and operable without a pointer.
  if (await page.locator(".rl-retailer-picker:not([open]) summary").count())
    await page.locator(".rl-retailer-picker summary").click();
  const otto = page.locator('.rl-retailer[data-retailer="otto"]');
  await otto.focus();
  await page.keyboard.press("Enter");
  await expect(otto).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/store=otto/);

  // Handoff: the official site opens in a new tab; coming back offers Bring For Me for it.
  await page.goto("/stores?lang=en&country=DE&cat=fashion", { waitUntil: "networkidle" });
  await context.route(/zalando\.de/, (route) => route.fulfill({ body: "<title>stub</title>" }));
  await page.locator("[data-store=zalando] .rl-store-primary").click();
  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    page.locator("dialog[open] a.rl-store-site").click(),
  ]);
  await popup.close();
  await page.bringToFront();
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  const back = page.locator(".rl-handoff-back");
  await expect(back).toBeVisible();
  await expect(back).toContainText("Zalando");
  await expect(back.locator("a.rl-button")).toHaveAttribute("href", /store=zalando/);
  await expect(page).toHaveURL(/country=DE/);
  await expect(page).toHaveURL(/cat=fashion/);

  // Bring For Me and back: the browser restores the same filtered directory.
  await back.locator("a.rl-button").click();
  await expect(page).toHaveURL(/\/stores\/request/);
  await page.goBack();
  await expect(page).toHaveURL(/country=DE/);
  await expect(page).toHaveURL(/cat=fashion/);
  await expect(page.locator("[data-store=zalando]")).toBeVisible();
  await expect(page.locator(".rl-handoff-back")).toHaveCount(0);
});

test("european stores: compact logos, no overflow at 320–430px in every direction", async ({
  page,
}) => {
  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 800 });
    for (const lang of ["ckb", "ar", "en"]) {
      await page.goto(`/stores?lang=${lang}&country=GB`, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, `${width} ${lang}`).toBe(0);
      const logos = page.locator(".rl-store-logo img");
      expect(await logos.count()).toBeGreaterThan(0);
      for (const box of await logos.evaluateAll((els) =>
        els.map((el) => {
          const img = el as HTMLImageElement;
          const r = img.getBoundingClientRect();
          return { h: r.height, fit: getComputedStyle(img).objectFit };
        }),
      )) {
        expect(box.h, `${width} ${lang} logo height`).toBeLessThanOrEqual(28);
        expect(box.fit).toBe("contain");
      }
      // Two columns on phones; every control keeps a 44px target.
      const cols = await page
        .locator(".rl-store-grid")
        .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
      expect(cols).toBe(2);
      for (const target of await page
        .locator(
          ".rl-country-chips .rl-chip, .rl-retailer-picker[open] .rl-retailer, [data-store] button.rl-button",
        )
        .all())
        expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test("european stores: Bring For Me opens for a country storefront with its own host", async ({
  page,
}) => {
  for (const [id, host] of [
    ["zalando-ch", "zalando.ch"],
    ["amazon-it", "amazon.it"],
    ["sephora-fr", "sephora.fr"],
    ["ebay-gb", "ebay.co.uk"],
  ]) {
    await page.goto(`/stores?lang=en&store=${id}`, { waitUntil: "networkidle" });
    await page.locator(`[data-store=${id}] .rl-store-primary`).click();
    await page.locator('dialog[open] a[data-variant="primary"]').click();
    await expect(page).toHaveURL(new RegExp(`/stores/request\\?.*store=${id}`));
    await expect(page.locator("main")).toContainText(host);
  }
});

test("marketplace refinement: one tile size and equal visual weight for every retailer logo", async ({
  page,
}) => {
  for (const width of [360, 390, 820, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const lang of ["ckb", "ar", "en"]) {
      await page.goto(`/stores?lang=${lang}`, { waitUntil: "networkidle" });
      if (await page.locator(".rl-retailer-picker:not([open]) summary").count())
        await page.locator(".rl-retailer-picker summary").click();
      const tiles = await page.locator(".rl-retailer").evaluateAll((els) =>
        els.map((el) => {
          const tile = el.getBoundingClientRect();
          const img = el.querySelector("img")!;
          const logo = img.getBoundingClientRect();
          return {
            id: el.getAttribute("data-retailer"),
            w: tile.width,
            h: tile.height,
            lw: logo.width,
            lh: logo.height,
            fit: getComputedStyle(img).objectFit,
            inside:
              logo.left >= tile.left && logo.right <= tile.right && logo.top >= tile.top - 0.5,
          };
        }),
      );
      expect(tiles.length, `${width} ${lang}`).toBeGreaterThan(5);
      const widths = tiles.map((tile) => tile.w);
      expect(
        Math.max(...widths) - Math.min(...widths),
        `${width} ${lang} tile widths`,
      ).toBeLessThan(1);
      for (const tile of tiles) {
        expect(tile.h, `${tile.id} target`).toBeGreaterThanOrEqual(44);
        expect(tile.lh, `${tile.id} logo height`).toBeLessThanOrEqual(24.5);
        expect(tile.fit).toBe("contain");
        expect(tile.inside, `${tile.id} logo inside its tile`).toBe(true);
        // Unclamped logos share one area (900 px², rounding and clamping aside).
        if (tile.lh < 24 && tile.lw < 76)
          expect(Math.abs(tile.lw * tile.lh - 900), `${tile.id} area`).toBeLessThan(90);
      }
    }
  }
});

test("marketplace refinement: store cards in a row line up (meta, categories, actions)", async ({
  page,
}) => {
  for (const width of [360, 820, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const lang of ["ckb", "ar", "en"]) {
      await page.goto(`/stores?lang=${lang}`, { waitUntil: "networkidle" });
      const cards = await page.locator(".rl-store-card").evaluateAll((els) =>
        els.map((el) => {
          const top = (selector: string) =>
            Math.round(el.querySelector(selector)!.getBoundingClientRect().top);
          const meta = el.querySelector(".rl-store-meta")!;
          const lines = [...meta.children].map((line) => line.getBoundingClientRect().height);
          const host = meta.children[1] as HTMLElement;
          // Both lines start at the same edge (the card's own direction decides which).
          const rtl = getComputedStyle(meta).direction === "rtl";
          const edges = [...meta.children].map((line) => {
            const r = line.getBoundingClientRect();
            return rtl ? r.right : r.left;
          });
          return {
            id: el.getAttribute("data-store"),
            row: Math.round(el.getBoundingClientRect().top),
            name: top("h3"),
            meta: top(".rl-store-meta"),
            metaHeight: meta.getBoundingClientRect().height,
            lines,
            hostCut: host.scrollWidth > host.clientWidth + 1,
            edgeGap: Math.abs(edges[0] - edges[1]),
            primary: top(".rl-store-primary"),
          };
        }),
      );
      expect(cards.length, `${width} ${lang}`).toBe(10);
      const lineHeight = Math.min(...cards.flatMap((card) => card.lines));
      const rows = new Map<number, typeof cards>();
      for (const card of cards) rows.set(card.row, [...(rows.get(card.row) ?? []), card]);
      for (const [row, cells] of rows) {
        for (const key of ["name", "meta", "metaHeight", "primary"] as const) {
          const values = cells.map((cell) => cell[key]);
          expect(
            Math.max(...values) - Math.min(...values),
            `${width} ${lang} row ${row} ${key}`,
          ).toBeLessThanOrEqual(1);
        }
        // Country and host: exactly two lines, each a single line, in every card.
        for (const cell of cells) {
          expect(cell.lines.length, `${cell.id} meta lines`).toBe(2);
          for (const line of cell.lines)
            expect(line, `${cell.id} meta line`).toBeLessThan(lineHeight * 1.5);
          // The official host is never cut off.
          expect(cell.hostCut, `${width} ${lang} ${cell.id} host`).toBe(false);
          expect(cell.edgeGap, `${width} ${lang} ${cell.id} meta edge`).toBeLessThanOrEqual(1);
        }
      }
    }
  }
});

test("marketplace refinement: request page shows the store logo and an even buy/ship switch", async ({
  page,
}) => {
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const lang of ["ckb", "ar", "en"]) {
      for (const [store, host, logo] of [
        ["zalando", "zalando.de", "zalando"],
        ["sephora-fr", "sephora.fr", "sephora"],
      ]) {
        await page.goto(`/stores/request?store=${store}&intent=buy&lang=${lang}`, {
          waitUntil: "networkidle",
        });
        const row = page.locator(".rl-request-store");
        await expect(row).toContainText(host);
        const img = row.locator("img");
        await expect(img).toHaveAttribute("src", `/store-logos/${logo}.svg`);
        const box = (await img.boundingBox())!;
        expect(box.height, `${width} ${lang} ${store}`).toBeLessThanOrEqual(28.5);
        expect(box.width).toBeGreaterThan(0);
        const edges = await row.locator("p > bdi").evaluateAll((els) =>
          els.map((el) => {
            const r = el.getBoundingClientRect();
            return getComputedStyle(el.parentElement!).direction === "rtl" ? r.right : r.left;
          }),
        );
        expect(
          Math.abs(edges[0] - edges[1]),
          `${width} ${lang} store row edge`,
        ).toBeLessThanOrEqual(1);
        const halves = page.locator(".rl-intent-switch .rl-chip");
        await expect(halves).toHaveCount(2);
        const [a, b] = [(await halves.nth(0).boundingBox())!, (await halves.nth(1).boundingBox())!];
        expect(Math.abs(a.width - b.width), `${width} ${lang} equal halves`).toBeLessThan(1);
        expect(Math.abs(a.y - b.y), `${width} ${lang} one row`).toBeLessThan(1);
        expect(Math.abs(a.height - b.height), `${width} ${lang} equal heights`).toBeLessThan(1);
        expect(Math.min(a.height, b.height)).toBeGreaterThanOrEqual(44);
        await expect(halves.nth(0)).toHaveAttribute("aria-current", "page");
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        );
        expect(overflow, `${width} ${lang} overflow`).toBe(0);
      }
    }
  }
});

test("marketplace refinement: store-card logos keep their full size on narrow phones", async ({
  page,
}) => {
  for (const width of [320, 375, 390, 430, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const lang of ["ckb", "ar", "en"]) {
      await page.goto(`/stores?lang=${lang}`, { waitUntil: "networkidle" });
      const cards = await page.locator(".rl-store-card").evaluateAll((els) =>
        els.map((el) => {
          const img = el.querySelector(".rl-store-logo img") as HTMLImageElement;
          const r = img.getBoundingClientRect();
          const tile = el.querySelector(".rl-store-logo")!.getBoundingClientRect();
          const heart = el.querySelector(".rl-store-fav")!;
          const h = heart.getBoundingClientRect();
          const icon = heart.querySelector("svg")!.getBoundingClientRect();
          const overlap =
            Math.max(0, Math.min(icon.right, r.right) - Math.max(icon.left, r.left)) *
            Math.max(0, Math.min(icon.bottom, r.bottom) - Math.max(icon.top, r.top));
          return {
            id: el.getAttribute("data-store"),
            w: r.width,
            h: r.height,
            attr: Number(img.getAttribute("width")),
            inside: r.left >= tile.left && r.right <= tile.right,
            heart: Math.min(h.width, h.height),
            overlap,
          };
        }),
      );
      expect(cards.length).toBe(10);
      for (const card of cards) {
        // Rendered at the normalised size (never squeezed by the card), inside its tile.
        expect(Math.abs(card.w - card.attr), `${width} ${lang} ${card.id} width`).toBeLessThan(1);
        expect(card.h, `${width} ${lang} ${card.id} height`).toBeGreaterThanOrEqual(10);
        expect(card.h).toBeLessThanOrEqual(28);
        expect(card.inside, `${card.id} inside`).toBe(true);
        expect(card.heart, `${card.id} favourite target`).toBeGreaterThanOrEqual(44);
        // The favourite badge never covers the logo.
        expect(card.overlap, `${width} ${lang} ${card.id} badge over logo`).toBe(0);
      }
    }
  }
});

test("empty states are centred in every language, text and actions alike", async ({ page }) => {
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const lang of ["ckb", "ar", "en"]) {
      await page.goto(`/stores?lang=${lang}&q=vodka`, { waitUntil: "networkidle" });
      const state = page.locator(".rl-empty-state");
      await expect(state).toBeVisible();
      const card = (await state.boundingBox())!;
      const centre = card.x + card.width / 2;
      for (const part of await state.locator("h2, p, .rl-button").all()) {
        const text = await part.evaluate((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          const r = range.getBoundingClientRect();
          return r.x + r.width / 2;
        });
        expect(Math.abs(text - centre), `${width} ${lang}`).toBeLessThan(4);
      }
    }
  }
});

test("marketplace error state: one titled card, centred actions, full touch targets", async ({
  page,
}) => {
  // The layout worker has no database, so /market renders its error state.
  for (const width of [320, 360, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const lang of ["ckb", "ar", "en"]) {
      await page.goto(`/market?lang=${lang}`, { waitUntil: "networkidle" });
      const state = page.locator(".rl-market-unavailable .rl-empty-state");
      await expect(state).toBeVisible();
      await expect(state.locator("h2")).toHaveCount(1);
      const actions = state.locator(".rl-empty-actions > *");
      await expect(actions).toHaveCount(3);
      const card = (await state.boundingBox())!;
      for (const action of await actions.all()) {
        const box = (await action.boundingBox())!;
        expect(box.height, `${width} ${lang}`).toBeGreaterThanOrEqual(44);
        expect(
          Math.abs(box.x + box.width / 2 - (card.x + card.width / 2)),
          `${width} ${lang}`,
        ).toBeLessThan(card.width / 2);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, `${width} ${lang}`).toBe(0);
    }
  }
});

test("clamped Latin-script store categories cut at the end of the line, right-aligned", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/stores?lang=en", { waitUntil: "networkidle" });
  const cats = page.locator("[data-store] .rl-store-categories").first();
  await expect(cats).toBeVisible();
  const style = await cats.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { direction: cs.direction, align: cs.textAlign };
  });
  // LTR block → the line-clamp ellipsis is at the line end in every engine (Firefox included).
  expect(style).toEqual({ direction: "ltr", align: "right" });
  // Sorani keeps the card's own direction.
  await page.goto("/stores?lang=ckb", { waitUntil: "networkidle" });
  expect(
    await page
      .locator("[data-store] .rl-store-categories")
      .first()
      .evaluate((el) => getComputedStyle(el).direction),
  ).toBe("rtl");
});

test("store discovery: one brand card, regional sheet, safe product-link handoff and compact footer", async ({
  page,
}) => {
  for (const lang of ["ckb", "ar", "en"]) {
    for (const width of [320, 390, 820, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/stores?lang=${lang}`, { waitUntil: "networkidle" });
      await expect(page.locator(".rl-store-card")).toHaveCount(10);
      await expect(page.locator("[data-good], .rl-category-row")).toHaveCount(0);
      await expect(page.locator(".rl-store-search input")).toBeVisible();
      await expect(page.locator(".rl-store-compact-footer")).toBeVisible();
      await expect(page.locator('footer a[href^="mailto:"]')).toHaveCount(0);
      if (
        process.env.RL_REVIEW_SHOTS &&
        ((lang === "ckb" && width === 390) || (lang === "en" && width === 1440))
      ) {
        mkdirSync("docs/review", { recursive: true });
        await page.screenshot({ path: `docs/review/stores-${lang}-${width}.png`, fullPage: true });
      }
      const names = await page.locator(".rl-store-card h3").allTextContents();
      expect(new Set(names).size).toBe(names.length);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
      await page.locator("[data-store=zalando] .rl-store-primary").click();
      const dialog = page.locator("dialog[open]");
      await expect(dialog).toBeVisible();
      await dialog.locator("select").selectOption("zalando-it");
      await expect(dialog.locator(".rl-store-site")).toHaveAttribute(
        "href",
        "https://www.zalando.it/",
      );
      await expect(dialog.locator('a[data-variant="primary"]')).toHaveAttribute(
        "href",
        /store=zalando-it/,
      );
      await expect(dialog.locator('a[href*="intent=ship"]')).toHaveAttribute(
        "href",
        /store=zalando-it/,
      );
      await page.keyboard.press("Escape");
      await expect(page.locator("[data-store=zalando] .rl-store-primary")).toBeFocused();
    }
  }
  await page.goto("/stores?lang=en", { waitUntil: "networkidle" });
  const search = page.locator("#rl-directory-search");
  await search.fill("https://www.zalando.it/shoe");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/stores\/request\?.*store=zalando-it/);
  await expect(page.locator('input[name="url"]')).toHaveValue("https://www.zalando.it/shoe");
  await page.goBack();
  await search.fill("https://www.amazon.de/vodka");
  await search.press("Enter");
  await expect(page.locator("#rl-link-error")).toBeVisible();
  await expect(page).toHaveURL(/\/stores\?/);
  await search.fill("Decathlon");
  await search.press("Enter");
  await expect(page.locator(".rl-store-card")).toHaveCount(1);
});
