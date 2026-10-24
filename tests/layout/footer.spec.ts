import { test, expect } from "@playwright/test";

test("shared footer stays compact and preserves keyboard-accessible resources", async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const lang of ["ckb", "ku", "de", "en", "ar", "fa", "tr"]) {
    await page.goto(`/?lang=${lang}`, { waitUntil: "networkidle" });
    const footer = page.locator("footer.rl-site-footer");
    const groups = footer.locator("details");
    await expect(groups).toHaveCount(3);
    await expect(footer.locator("details[open]")).toHaveCount(0);
    const box = await footer.boundingBox();
    expect(box!.height, `${lang} closed footer`).toBeLessThan(600);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
    await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(1);
    await expect(footer.locator("select option")).toHaveCount(7);
    for (const group of await groups.all()) {
      const summary = group.locator("summary");
      await summary.focus();
      await summary.press("Enter");
      await expect(group).toHaveAttribute("open", "");
      for (const link of await group.locator("a").all()) {
        await expect(link).toBeVisible();
        const target = await link.boundingBox();
        expect(target!.height).toBeGreaterThanOrEqual(44);
      }
      await summary.press("Space");
      await expect(group).not.toHaveAttribute("open", "");
    }
    await expect(footer.locator(".rl-footer-preferences button")).toBeEnabled();
    await footer.locator(".rl-footer-preferences button").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await footer.locator(".rl-footer-preferences button").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  }
});

test("footer preferences and expanded resources fit narrow phones", async ({ page }) => {
  for (const width of [320, 360, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/?lang=ckb", { waitUntil: "networkidle" });
    const footer = page.locator("footer.rl-site-footer");
    await expect(footer.locator(".rl-footer-preferences button")).toBeEnabled();
    expect((await footer.boundingBox())!.height).toBeLessThan(600);
    for (const summary of await footer.locator("summary").all()) await summary.click();
    const overflow = await footer.locator("a, select, button, summary").evaluateAll((elements) =>
      elements
        .filter((element) => {
          const box = element.getBoundingClientRect();
          return (
            box.width > 0 && (box.left < -1 || box.right > document.documentElement.clientWidth + 1)
          );
        })
        .map((element) => element.tagName),
    );
    expect(overflow, `footer controls at ${width}px`).toEqual([]);
  }
});
