// TEMPORARY diagnostic (removed before merge): what WebKit reports for a failed route module.
import { test } from "@playwright/test";
test("tmp: failed route module message", async ({ page }) => {
  let n = 0;
  await page.addInitScript(() => {
    const original = console.error;
    console.error = (...args: unknown[]) => {
      original(
        "ERR",
        ...args.map((a) => (a instanceof Error ? `${a.name}|${a.message}|${String(a)}` : a)),
      );
    };
    addEventListener("unhandledrejection", (e) =>
      original("UNHANDLED", e.reason instanceof Error ? `${e.reason.name}|${e.reason.message}` : String(e.reason)),
    );
  });
  page.on("console", (m) => console.log("console", m.type(), m.text().slice(0, 300)));
  page.on("pageerror", (e) => console.log("pageerror", e.name, e.message));
  page.on("framenavigated", (f) => f === page.mainFrame() && console.log("nav", f.url()));
  await page.route(/\/assets\/track-[\w-]+\.js$/, (route) =>
    n++ === 0 ? route.abort("connectionreset") : route.continue(),
  );
  await page.goto("/track?lang=en", { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);
  console.log("RESULT aborted", n, "bottom-bar", await page.locator('[data-layout="bottom-bar"]').count(),
    "storage", await page.evaluate(() => JSON.stringify(sessionStorage)));
});
