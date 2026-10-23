// TEMPORARY diagnostic (removed before merge): does an in-page reload re-request a failed module, by delay?
import { test } from "@playwright/test";
for (const delay of [0, 1000])
  for (const how of ["refetch-reload", "refetch-script-reload"] as const)
    test(`tmp: in-page ${how} after ${delay}ms`, async ({ page }) => {
      let requests = 0;
      let fail = 1;
      // Block both automatic reloads so the timing is controlled here.
      await page.addInitScript(() => {
        sessionStorage.setItem("tanstack_router_reload:Importing a module script failed.", "1");
        sessionStorage.setItem("rl_chunk_reload:/track?lang=en", String(Date.now()));
      });
      await page.route(/\/assets\/track-[\w-]+\.js$/, (route) => {
        requests++;
        return fail-- > 0 ? route.abort("connectionreset") : route.continue();
      });
      await page.goto("/track?lang=en");
      await page.getByRole("heading", { level: 1 }).first().waitFor();
      const errorShown = await page.getByText("Something went wrong").count();
      await page.waitForTimeout(delay);
      console.log("refetch", how, await page.evaluate(async (h) => {
        const urls = [...document.querySelectorAll<HTMLLinkElement>('link[rel="modulepreload"]')].map((l) => l.href);
        const statuses = await Promise.all(urls.map((u) =>
          h === "refetch-reload"
            ? fetch(u, { cache: "reload" }).then((r) => r.status, () => 0)
            : import(/* @vite-ignore */ `${u}?retry=${Date.now()}`).then(() => 200, () => 0),
        ));
        location.reload();
        return urls.filter((_, i) => statuses[i] !== 200).length + " failed of " + urls.length;
      }, how));
      await page.waitForTimeout(2500);
      console.log("RESULT", how, delay, "errorShown", errorShown, "bar", await page.locator('[data-layout="bottom-bar"]').count(), "requests", requests);
    });
