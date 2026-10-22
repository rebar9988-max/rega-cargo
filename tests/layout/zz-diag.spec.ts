import { test, expect } from "@playwright/test";

// THROWAWAY diagnostic: surface what the worker actually returns for a denied
// privileged auth POST, including the body of any non-403, via the assertion
// message (job logs are unreachable from the agent session).
test("diag: denied privileged auth POSTs", async ({ page }) => {
  await page.goto("/owner?lang=en", { waitUntil: "networkidle" });
  const odd = await page.evaluate(async () => {
    const out: unknown[] = [];
    for (let round = 0; round < 40; round += 1) {
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
            body = (await r.text()).slice(0, 600);
            headers = JSON.stringify(Object.fromEntries(r.headers.entries())).slice(0, 600);
          }
        } catch (e) {
          body = `THREW ${String(e)}`;
        }
        if (status !== 403) out.push({ round, path, status, headers, body });
      }
    }
    return out;
  });
  expect(JSON.stringify({ found: odd.length, odd }, null, 1)).toBe("NO-FAILURE-EXPECTED");
});
