import { test, expect } from "@playwright/test";
import { ownerCopy } from "../../src/lib/owner/copy";
import { denialVerdict } from "./dev-proxy";

test("owner portal preserves Sorani RTL and works at mobile and desktop widths", async ({
  page,
}) => {
  const t = ownerCopy("ckb");
  await page.goto("/owner?lang=ckb", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: t.title })).toBeVisible();
  await expect(page.getByLabel(t.email)).toHaveAttribute("autocomplete", "username");
  await expect(page.getByLabel(t.password)).toHaveAttribute("autocomplete", "current-password");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator('header img[alt="R&L"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("public privileged signup is denied before auth initialization", async ({ page }) => {
  await page.goto("/owner?lang=en", { waitUntil: "networkidle" });
  const PATHS = ["sign-up/email", "verify-email", "change-email", "admin/set-role"] as const;
  // The dev server's ProxyWorker drops the occasional request under the suite's parallel
  // load (see dev-proxy.ts). A dropped request never reaches the Worker, so it proves
  // nothing and is re-sent; every real answer is judged, and an acceptance fails at once.
  const attempts = await page.evaluate(async (paths) => {
    const collected: Record<string, { status: number; body: string }[]> = {};
    for (const path of paths) {
      collected[path] = [];
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const response = await fetch(`/api/auth/${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        const record = { status: response.status, body: (await response.text()).slice(0, 300) };
        collected[path].push(record);
        // Stop at the first answer the application actually gave.
        if (!(record.status === 500 && /Network connection lost/i.test(record.body))) break;
      }
    }
    return collected;
  }, PATHS);
  const statuses = PATHS.map((path) => {
    const verdict = denialVerdict(attempts[path] ?? []);
    expect(verdict, `${path}: ${JSON.stringify(attempts[path])}`).toMatchObject({ ok: true });
    return verdict.ok ? verdict.status : -1;
  });
  expect(statuses).toEqual([403, 403, 403, 403]);
});

test("invalid owner link grants nothing and is removed from browser history", async ({ page }) => {
  const t = ownerCopy("en");
  await page.goto(`/owner?lang=en#invite=${"0".repeat(64)}`, { waitUntil: "networkidle" });
  await expect(page.getByRole("alert")).toHaveText(t.invalid);
  expect(new URL(page.url()).hash).toBe("");
  await expect(page.getByRole("button", { name: t.activate })).toHaveCount(0);
});

test("owner credentials stay disabled until hydration and retain typed values", async ({
  page,
}) => {
  const t = ownerCopy("en");
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/assets/*.js", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto("/owner?lang=en", { waitUntil: "commit" });
    await expect(page.getByLabel(t.email)).toBeDisabled();
    await expect(page.getByLabel(t.password)).toBeDisabled();
  } finally {
    release();
  }
  const email = page.getByLabel(t.email);
  await expect(email).toBeEnabled();
  await email.fill("owner@example.test");
  await page.getByLabel(t.password).fill("Isolated browser input test");
  await expect(email).toHaveValue("owner@example.test");
  await expect(page.getByRole("button", { name: t.signIn, exact: true })).toBeEnabled();
});
