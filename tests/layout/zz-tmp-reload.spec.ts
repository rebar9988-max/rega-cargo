// TEMPORARY diagnostic (removed before merge): who reloads the previous page during page.goto?
import { test } from "@playwright/test";
test("tmp: trace reloads during navigation", async ({ page }) => {
  await page.addInitScript(() => {
    const t0 = performance.timeOrigin;
    const log = (...a: unknown[]) => console.log("TRACE", Math.round(performance.timeOrigin + performance.now() - t0), location.pathname, ...a);
    const reload = Location.prototype.reload;
    Location.prototype.reload = function () {
      log("reload()", new Error().stack?.split("\n").slice(1, 6).join(" <- "));
      return reload.call(this);
    };
    addEventListener("beforeunload", () => log("beforeunload"));
    addEventListener("pagehide", () => log("pagehide"));
    addEventListener("error", (e) => log("window error", (e as ErrorEvent).message), true);
    addEventListener("unhandledrejection", (e) => log("rejection", String((e as PromiseRejectionEvent).reason)));
    const ce = console.error;
    console.error = (...a: unknown[]) => { log("console.error", ...a.map((x) => (x instanceof Error ? x.message : String(x)))); ce(...a); };
  });
  const lines: string[] = [];
  page.on("console", (m) => m.text().startsWith("TRACE") && lines.push(m.text().slice(0, 400)));
  page.on("framenavigated", (f) => f === page.mainFrame() && lines.push("NAV " + f.url()));
  try {
    for (const path of ["/market?q=&category=&brand=&min=&max=&stock=&sort=price&page=1&saved=&lang=en", "/stores/request?intent=ship&lang=ckb", "/track?lang=en", "/account?lang=en"])
      await page.goto(path, { waitUntil: "networkidle" });
    console.log("OK", lines.filter((l) => l.includes("reload()") || l.includes("console.error")).length);
  } catch (e) {
    console.log("INTERRUPTED", String(e).split("\n")[0], "\n" + lines.join("\n"));
  }
});
