import { test, expect } from "@playwright/test";

for (const lang of ["ckb", "ar", "en"]) {
  test(`production store discovery ${lang}: regional sheet and request handoff`, async ({ page }, info) => {
    const response = await page.goto(`/stores?lang=${lang}`, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator(".rl-store-discovery .rl-store-card")).toHaveCount(10);
    await expect(page.locator("[data-good], .rl-category-row")).toHaveCount(0);
    await expect(page.locator("#rl-directory-search")).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    await page.screenshot({ path: info.outputPath(`live-${lang}.png`), fullPage: false });
    await page.locator("[data-store=zalando] .rl-store-primary").click();
    const dialog = page.locator("dialog[open]");
    await dialog.locator("select").selectOption("zalando-it");
    await expect(dialog.locator(".rl-store-site")).toHaveAttribute("href", "https://www.zalando.it/");
    await expect(dialog.locator('a[href*="intent=ship"]')).toHaveAttribute("href", /store=zalando-it/);
    await dialog.locator('a[data-variant="primary"]').click();
    await expect(page).toHaveURL(/\/stores\/request\?.*store=zalando-it/);
    await expect(page.locator(".rl-request-store")).toContainText("zalando.it");
    await expect(page.locator('main input[name="url"]')).toBeEnabled();
  });
}
