// TEMPORARY diagnostic (removed before merge): how a failed route module recovers per browser.
import { test } from "@playwright/test";
for (const mode of ["abort", "503"] as const)
  for (const plan of [{ track: 1 }, { "market.index": 1, track: 1 }, { track: 2 }] as Record<string, number>[])
    test(`tmp: ${mode} ${JSON.stringify(plan)}`, async ({ page }) => {
      const left = { ...plan };
      const seen: Record<string, number> = {};
      const navs: string[] = [];
      page.on("framenavigated", (f) => f === page.mainFrame() && navs.push(new URL(f.url()).pathname));
      await page.route(/\/assets\/(market\.index|track)-[\w-]+\.js$/, (route) => {
        const chunk = /\/assets\/(market\.index|track)-/.exec(route.request().url())![1];
        seen[chunk] = (seen[chunk] ?? 0) + 1;
        if (!left[chunk]) return route.continue();
        left[chunk]--;
        return mode === "abort"
          ? route.abort("connectionreset")
          : route.fulfill({ status: 503, body: "unavailable" });
      });
      const out: string[] = [];
      for (const path of Object.keys(plan).includes("market.index") ? ["/market?lang=en", "/track?lang=en"] : ["/track?lang=en"]) {
        await page.goto(path, { waitUntil: "networkidle" });
        await page.waitForTimeout(3000);
        out.push(`${path} bar=${await page.locator('[data-layout="bottom-bar"]').count()}`);
      }
      console.log("RESULT", mode, JSON.stringify(plan), out.join(" "), "requests", JSON.stringify(seen), "navs", navs.join(","),
        "storage", await page.evaluate(() => Object.keys(sessionStorage).join(";")));
    });
