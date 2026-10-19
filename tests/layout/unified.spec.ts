import { test, expect } from "@playwright/test";

test("unified navigation preserves deep links and marks the current customer journey", async ({
  page,
  isMobile,
}) => {
  for (const [path, current] of [
    ["/market?q=&category=&brand=&min=&max=&stock=&sort=price&page=1&saved=&lang=en", "/market"],
    ["/stores/request?intent=ship&lang=ckb", "/stores/request"],
    ["/track?lang=en", "/track"],
    ["/account?lang=en", "/account"],
  ]) {
    await page.goto(path, { waitUntil: "networkidle" });
    const nav = page.locator(
      isMobile && page.viewportSize()!.width < 1024
        ? '[data-layout="bottom-bar"]'
        : ".rl-primary-nav",
    );
    if (current !== "/account" || (isMobile && page.viewportSize()!.width < 1024))
      await expect(nav.locator('[aria-current="page"]')).toHaveAttribute(
        "href",
        new RegExp(`^${current}`),
      );
    await expect(page.locator('[data-layout="category-strip"]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
});

test("Bring For Me preserves input across three steps, discloses details and focuses field errors", async ({
  page,
}) => {
  await page.goto("/stores/request?lang=en&intent=buy", { waitUntil: "networkidle" });
  const form = page.locator("form.rl-request-form");
  const next = form.locator("[data-step-next]");
  const steps = form.locator(".rl-steps li");
  await expect(steps).toHaveCount(3);
  await expect(steps.nth(0)).toHaveAttribute("aria-current", "step");
  await expect(form.locator('input[type="url"]')).toHaveCount(1);
  const optional = form.locator("details");
  await expect(optional.locator("input")).toHaveCount(2);
  for (const input of await optional.locator("input").all()) await expect(input).not.toBeVisible();
  // Step 1 refuses an empty link and a bad quantity, and focuses the field to fix.
  await next.click();
  await expect(form.locator('[name="url"]')).toBeFocused();
  await expect(form.locator('[name="url"]')).toHaveAttribute("aria-invalid", "true");
  await form.locator('[name="url"]').fill("https://www.zalando.de/shoes");
  await form.locator('[name="qty"]').fill("21");
  await next.click();
  await expect(form.locator('[name="qty"]')).toBeFocused();
  await expect(form.locator('[name="url"]')).toHaveValue("https://www.zalando.de/shoes");
  // Plus and minus keep the quantity inside the allowed range.
  await form.locator('[name="qty"]').fill("20");
  await expect(form.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  await form.getByRole("button", { name: "Decrease quantity" }).click();
  await expect(form.locator('[name="qty"]')).toHaveValue("19");
  await form.locator('[name="qty"]').fill("2");
  // Step 2: delivery and contact.
  await next.click();
  await expect(steps.nth(1)).toHaveAttribute("aria-current", "step");
  await form.locator('[name="phone"]').fill("invalid");
  await next.click();
  await expect(form.locator('[name="phone"]')).toBeFocused();
  // Going back keeps everything that was typed, including the optional details.
  await form.locator("[data-step-back]").click();
  await expect(form.locator('[name="url"]')).toHaveValue("https://www.zalando.de/shoes");
  await expect(form.locator('[name="qty"]')).toHaveValue("2");
  await optional.locator("summary").click();
  await optional.locator("input").first().fill("42");
  await optional.locator("summary").click();
  await optional.locator("summary").click();
  await expect(optional.locator("input").first()).toHaveValue("42");
  await next.click();
  await expect(form.locator('[name="phone"]')).toHaveValue("invalid");
  await form.locator('[name="phone"]').fill("+9647501234567");
  // Step 3 summarises the request and can send people back to edit a step.
  await next.click();
  await expect(steps.nth(2)).toHaveAttribute("aria-current", "step");
  await expect(form.locator('[data-step-panel="3"]')).toContainText("https://www.zalando.de/shoes");
  await expect(form.locator('[data-step-panel="3"]')).toContainText("42");
  await form.getByRole("button", { name: "Edit" }).first().click();
  await expect(form.locator('[name="url"]')).toHaveValue("https://www.zalando.de/shoes");
  await form.locator('a[href*="intent=ship"]').click();
  await expect(page).toHaveURL(/intent=ship/);
  await expect(form.locator('[name="url"]')).toHaveValue("https://www.zalando.de/shoes");
  // No API call or production record is needed to verify safe client-side recovery.
});

test("homepage search uses internal marketplace and displays honest data states", async ({
  page,
}) => {
  await page.goto("/?lang=en", { waitUntil: "networkidle" });
  // Network idle can precede hydration, and a value typed before it is reset (WebKit iPad
  // projects lost "kettle" this way in CI): the footer theme button stays disabled until
  // its click handler is hydrated.
  await expect(page.locator("footer button.rl-button").first()).toBeEnabled();
  // The reference homepage keeps search in its header; it opens the existing store search.
  const search = page.locator('[data-layout="ref-header"] input[type="search"]');
  await search.fill("kettle");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/stores\?.*q=kettle/);
  await expect(page.locator("main")).not.toContainText(/Guaranteed delivery|Official partner/);
});

test("Bring For Me cannot lose a first submission while its client module loads", async ({
  page,
}) => {
  let release!: () => void;
  const delayed = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/assets/stores.request-*.js", async (route) => {
    await delayed;
    await route.continue();
  });
  await page.goto("/stores/request?lang=en", { waitUntil: "domcontentloaded" });
  const form = page.locator("form.rl-request-form");
  await expect(form.locator('[name="url"]')).toBeDisabled();
  await expect(form.locator('button[type="submit"]')).toBeDisabled();
  release();
  await expect(form.locator('[name="url"]')).toBeEnabled();
  await expect(form.locator('button[type="submit"]')).toBeEnabled();
});

test("Bring For Me retries a failed submission and confirms only a backend-issued reference", async ({
  page,
}) => {
  // Mock only transport responses in this local test; no records, payment or retailer calls.
  await page.route("**/api/ai/challenge", (route) =>
    route.fulfill({ json: { mode: "token", token: "local-test-token" } }),
  );
  let attempts = 0;
  let sent = "";
  await page.route("**/_serverFn/*", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    attempts++;
    sent = route.request().postData() ?? "";
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        result:
          attempts === 1 ? { error: "unavailable" } : { id: "RG-TEST-TEST-TEST", estimate: true },
        context: {},
      }),
    });
  });
  await page.goto("/stores/request?lang=en&intent=ship", { waitUntil: "networkidle" });
  const form = page.locator("form.rl-request-form");
  await form.locator('[name="url"]').fill("https://www.zalando.de/shoes");
  await form.locator("[data-step-next]").click();
  await form.locator('[name="phone"]').fill("+9647501234567");
  await form.locator("[data-step-next]").click();
  await form.locator('[name="declared"]').check();
  await form.locator('button[type="submit"]').click();
  await expect(form.getByRole("link", { name: /2233rega/ })).toBeVisible();
  // The review stays on screen with everything typed, so the retry loses nothing.
  await expect(form.locator('[data-step-panel="3"]')).toContainText("https://www.zalando.de/shoes");
  await form.locator('button[type="submit"]').click();
  await expect(page.getByRole("status")).toHaveText("RG-TEST-TEST-TEST");
  await expect(page.locator("main")).toContainText("R&L received your request and will review it");
  await expect(page.locator('main a[href*="id=RG-TEST-TEST-TEST"]')).toHaveAttribute(
    "href",
    /\/track/,
  );
  expect(attempts).toBe(2);
  expect(sent).toContain("https://www.zalando.de/shoes");
  expect(sent).toContain("ship");
});

test("catalogue opens filters on the first click after a delayed client module", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile || page.viewportSize()!.width >= 1024, "Mobile filter sheet only");
  let release!: () => void;
  const delayed = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/assets/bazaar-page-*.js", async (route) => {
    await delayed;
    await route.continue();
  });
  await page.goto("/stores?lang=en", { waitUntil: "domcontentloaded" });
  const filters = page.locator(".rl-mobile-filters");
  await expect(filters).toBeDisabled();
  await expect(page.locator(".rl-audience-chips button").first()).toBeDisabled();
  release();
  await expect(filters).toBeEnabled();
  await filters.click();
  await expect(page.locator("dialog[open]")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(filters).toBeFocused();
});
