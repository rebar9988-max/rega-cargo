import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

// THROWAWAY diagnostic: hammer the denied privileged auth POSTs while the rest of the
// suite loads the same single `wrangler dev` server, then report any non-403 together
// with the server's own stderr lines (job logs are unreachable from this session).
test("diag: denied privileged auth POSTs under full-suite load", async ({ page }) => {
  test.setTimeout(300_000);
  await page.goto("/owner?lang=en", { waitUntil: "networkidle" });
  const odd = await page.evaluate(async () => {
    const out: unknown[] = [];
    const stop = Date.now() + 200_000;
    let round = 0;
    while (Date.now() < stop && out.length < 6) {
      round += 1;
      for (const path of ["sign-up/email", "verify-email", "change-email", "admin/set-role"]) {
        let status = -1;
        let body = "";
        let headers = "";
        try {
          const r = await fetch(`/api/auth/${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          });
          status = r.status;
          if (status !== 403) {
            body = (await r.text()).slice(0, 400);
            headers = JSON.stringify(Object.fromEntries(r.headers.entries())).slice(0, 400);
          }
        } catch (e) {
          body = `THREW ${String(e)}`;
        }
        if (status !== 403) out.push({ at: new Date().toISOString(), round, path, status, headers, body });
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    return out;
  });
  let server = "unavailable";
  try {
    server = readFileSync("/tmp/wrangler-diag.log", "utf8")
      .split("\n")
      .filter((l) => /error|exception|reload|restart|changes|lost|crash|exceeded|workerd/i.test(l))
      .slice(-25)
      .join("\n")
      .slice(-2500);
  } catch (e) {
    server = `log unreadable ${String(e)}`;
  }
  expect(JSON.stringify({ found: odd.length, odd, server }, null, 1)).toBe("NO-FAILURE-EXPECTED");
});
