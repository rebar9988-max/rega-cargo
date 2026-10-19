import { test, expect } from "@playwright/test";
import { ownerCopy } from "../../src/lib/owner/copy";

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
  const statuses = await page.evaluate(async () => {
    const statuses: number[] = [];
    for (const path of ["sign-up/email", "verify-email", "change-email", "admin/set-role"]) {
      const response = await fetch(`/api/auth/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      statuses.push(response.status);
    }
    return statuses;
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
