import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";

// Derive the page inventory from real routes, including denied/missing-record states.
const routes = [
  ...new Set(
    readdirSync("src/routes")
      .filter((f) => f.endsWith(".tsx") && f !== "__root.tsx")
      .flatMap((file) => {
        const match = readFileSync(`src/routes/${file}`, "utf8").match(
          /createFileRoute\("([^"]+)"\)/,
        );
        return match
          ? [match[1].replace(/\$[^/]+/g, "footer-regression-missing").replace(/\/$/, "") || "/"]
          : [];
      }),
  ),
];
for (const lang of ["ckb", "en"]) {
  test(`footer ownership and legal menu across routes (${lang})`, async ({ page }) => {
    test.setTimeout(180_000);
    for (const path of routes) {
      await page.goto(`${path}?lang=${lang}`, { waitUntil: "networkidle" });
      await expect(page.locator(".rl-site-footer")).toHaveCount(path === "/" ? 1 : 0);
      if (path === "/") {
        expect(
          await page.locator("main").evaluate((main) => main.nextElementSibling?.tagName),
        ).toBe("FOOTER");
      }
      await expect(page.locator('[data-layout="bottom-bar"]')).toHaveCount(1);
      await page.locator('[data-layout="menu-button"]').click();
      for (const doc of ["impressum", "privacy", "terms"]) {
        await expect(page.locator(`.rl-mobile-menu-link[href^="/${doc}"]`)).toBeVisible();
      }
    }
  });
}
