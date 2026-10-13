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
    if (path.startsWith("/stores/request"))
      await expect(page.locator('form.rl-request-form button[type="submit"]')).toBeEnabled();
  }
  expect(errors).toEqual([]);
  expect(failedAssets).toEqual([]);
});
