import AxeBuilder from "@axe-core/playwright";
import { test as base, expect } from "@playwright/test";
import { LAYOUT, measureLayout, type Bp } from "./geometry.ts";

const test = base.extend<{ breakpoint: Bp }>({
  breakpoint: ["phone", { option: true }],
});
test.use({ screenshot: "only-on-failure" });
// axe and evidence capture are additional work beyond the existing geometry suite.
test.setTimeout(90_000);

// Read-only journeys: safe for an explicitly authorized deployed target too.
// No OTP, inference, submissions, seeded records or authenticated customer data.
const routes = ["/", "/market", "/stores", "/stores/request?intent=buy", "/track"];

for (const lang of ["ckb", "ar", "en"] as const) {
  for (const theme of ["light", "dark"] as const) {
    for (const path of routes) {
      test(`${path} ${lang} ${theme}: layout, accessibility and console`, async ({
        page,
        breakpoint,
      }, testInfo) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
        page.on("console", (message) => {
          if (message.type() === "error") errors.push(`console: ${message.text()}`);
        });
        await page.emulateMedia({ colorScheme: theme });
        await page.addInitScript(
          ({ lang, theme }) => {
            localStorage.setItem("rega-lang", lang);
            localStorage.setItem("rega-lang-v3", "1");
            localStorage.setItem("rl-theme-v1", theme);
          },
          { lang, theme },
        );
        const response = await page.goto(`${path}${path.includes("?") ? "&" : "?"}lang=${lang}`, {
          waitUntil: "networkidle",
        });
        expect(response?.status(), "document response").toBe(200);
        await expect(page.locator("footer button.rl-button").first()).toBeEnabled();
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
        await expect(page.locator("html")).toHaveAttribute(
          "data-textdir",
          lang === "en" ? "ltr" : "rtl",
        );
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await page.evaluate(async () => {
          await document.fonts.ready;
          window.scrollTo(0, 0);
        });
        await expect(page.locator(".rl-site-header, .rl-ref-header")).toHaveAttribute(
          "data-shrunk",
          "false",
        );
        await expect
          .poll(() =>
            page.evaluate(measureLayout, { bp: breakpoint, layout: LAYOUT, sheet: false }),
          )
          .toEqual([]);
        // Each service remains discoverable on every viewport and language.
        for (const href of ["/market", "/stores/request", "/quote", "/track"]) {
          await expect(page.locator(`footer a[href^="${href}"]`).first()).toBeVisible();
        }
        await expect(page.locator("main")).toBeVisible();
        if (path === "/stores/request?intent=buy")
          await expect(page.locator('form.rl-request-form button[type="submit"]')).toBeEnabled();
        if (path === "/stores")
          await expect(page.locator(".rl-audience-chips button").first()).toBeEnabled();

        // WCAG 2.2 AA automation supplements keyboard checks in the existing suite;
        // it is not a claim of complete manual or assistive-technology conformance.
        const accessibility = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        await testInfo.attach("accessibility", {
          body: JSON.stringify(accessibility, null, 2),
          contentType: "application/json",
        });
        expect.soft(accessibility.violations, "WCAG A/AA violations").toEqual([]);
        await page.evaluate(() => window.scrollTo(0, 0));
        await testInfo.attach("viewport", {
          body: await page.screenshot({ animations: "disabled" }),
          contentType: "image/png",
        });
        await testInfo.attach("console-errors", {
          body: JSON.stringify(errors, null, 2),
          contentType: "application/json",
        });
        expect.soft(errors, "console errors and uncaught exceptions").toEqual([]);
      });
    }
  }
}
