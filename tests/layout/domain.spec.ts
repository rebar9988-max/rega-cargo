import { test, expect } from "@playwright/test";

test("complete pages hydrate after repeat visits and delayed asset responses", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const failedAssets: string[] = [];
  page.on("response", (response) => {
    if (response.url().includes("/assets/") && response.status() >= 400)
      failedAssets.push(`${response.status()} ${response.url()}`);
  });
  await page.route("**/assets/*.js", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.continue();
  });
  for (const path of ["/?lang=en", "/stores?lang=en", "/stores/request?lang=en", "/?lang=en"]) {
    await page.goto(path, { waitUntil: "networkidle" });
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    expect((await page.locator("main").innerText()).trim().length).toBeGreaterThan(100);
    // SSR visibility/network idle can precede lazy route hydration. Wait for
    // each journey's usable controls before a new document navigation can
    // cancel its imports and trigger TanStack's missing-module reload.
    // The reference homepage has no form in main; the footer theme button stays disabled
    // until its click handler is hydrated (Button + useHydrated).
    if (path.startsWith("/?"))
      await expect(page.locator("footer button.rl-button").first()).toBeEnabled();
    if (path.startsWith("/stores?"))
      await expect(page.locator(".rl-audience-chips button").first()).toBeEnabled();
    if (path.startsWith("/stores/request"))
      await expect(page.locator('form.rl-request-form button[type="submit"]')).toBeEnabled();
    await page.waitForLoadState("networkidle");
  }
  expect(errors).toEqual([]);
  expect(failedAssets).toEqual([]);
});

test("homepage sections paint in the viewport during repeated mobile scrolling", async ({
  page,
}) => {
  await page.goto("/?lang=en", { waitUntil: "networkidle" });
  for (let repeat = 0; repeat < 3; repeat++) {
    for (const section of await page.locator("main section").all()) {
      await section.evaluate(async (element) => {
        element.scrollIntoView({ block: "center" });
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
      });
      const state = await section.evaluate((element) => ({
        text: (element as HTMLElement).innerText.trim(),
        top: element.getBoundingClientRect().top,
        bottom: element.getBoundingClientRect().bottom,
        height: innerHeight,
      }));
      expect(state.top).toBeLessThan(state.height);
      expect(state.bottom).toBeGreaterThan(0);
      expect(state.text.length, "visible section must paint its actual text").toBeGreaterThan(20);
    }
  }
  await page.locator("footer").evaluate((element) => element.scrollIntoView());
  await expect(page.locator("footer")).toContainText("R&L");
});
