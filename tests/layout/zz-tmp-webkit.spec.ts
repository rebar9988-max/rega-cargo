// TEMPORARY diagnostic (removed before merge): which recovery re-requests a failed route module.
import { test } from "@playwright/test";
for (const strategy of ["page.reload", "goto-same", "fetch-reload-then-reload", "new-page", "goto-cachebust-query"] as const)
  test(`tmp: recover by ${strategy}`, async ({ page, context }) => {
    let requests = 0;
    let fail = 1;
    await context.route(/\/assets\/track-[\w-]+\.js$/, (route) => {
      requests++;
      if (fail-- > 0) return route.abort("connectionreset");
      return route.continue();
    });
    await page.goto("/track?lang=en", { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    const stuck = await page.locator('[data-layout="bottom-bar"]').count();
    let target = page;
    if (strategy === "page.reload") await page.reload({ waitUntil: "networkidle" });
    if (strategy === "goto-same") await page.goto("/track?lang=en", { waitUntil: "networkidle" });
    if (strategy === "goto-cachebust-query") await page.goto("/track?lang=en&r=1", { waitUntil: "networkidle" });
    if (strategy === "fetch-reload-then-reload") {
      const hrefs = await page.evaluate(async () => {
        const urls = [...document.querySelectorAll<HTMLLinkElement>('link[rel="modulepreload"]')].map((l) => l.href);
        await Promise.all(urls.map((u) => fetch(u, { cache: "reload" }).catch(() => null)));
        return urls.filter((u) => u.includes("track-"));
      });
      console.log("modulepreload track hrefs", hrefs);
      await page.reload({ waitUntil: "networkidle" });
    }
    if (strategy === "new-page") {
      target = await context.newPage();
      await target.goto("/track?lang=en", { waitUntil: "networkidle" });
    }
    await target.waitForTimeout(2500);
    console.log("RESULT", strategy, "stuckBar", stuck, "afterBar", await target.locator('[data-layout="bottom-bar"]').count(), "requests", requests);
  });
