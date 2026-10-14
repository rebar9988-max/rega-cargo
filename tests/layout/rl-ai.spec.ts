import { test, expect } from "@playwright/test";

test.describe("R&L AI owned customer experience", () => {
  test("first interactions wait for handlers and work after held JavaScript arrives", async ({
    page,
  }) => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/assets/*.js", async (route) => {
      await held;
      await route.continue();
    });
    await page.goto("/ai?lang=en", { waitUntil: "commit" });
    const start = page.getByRole("button", { name: "Chat with R&L AI", exact: true });
    const bring = page.getByRole("button", { name: "Bring For Me", exact: true });
    const consent = page.locator("#rl-ai-image").getByRole("checkbox");
    await expect(start).toBeDisabled();
    await expect(bring).toBeDisabled();
    await expect(consent).toBeDisabled();
    release();
    await page.waitForLoadState("networkidle");
    await expect(bring).toBeEnabled();
    await bring.click();
    await expect(page.locator("#rl-ai-input")).toHaveValue("Bring For Me");
    await expect(consent).toBeEnabled();
    await consent.check();
    await expect(consent).toBeChecked();
  });
  test("welcome, five real shortcuts, Sorani typography and mobile geometry", async ({ page }) => {
    await page.goto("/ai?lang=ckb", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "R&L AI", exact: true })).toBeVisible();
    const root = page.locator('section[aria-labelledby="rl-ai-heading"]');
    await expect(root).toHaveAttribute("dir", "rtl");
    await expect
      .poll(() => root.evaluate((e) => getComputedStyle(e).fontFamily))
      .toContain("Vazirmatn");
    for (const label of [
      "کاڵایەکم بۆ بدۆزەوە",
      "بەراوردی دوو کاڵام بۆ بکە",
      "کاڵام بۆ بهێنەوە",
      "داواکارییەکەم لە کوێیە؟",
      "چۆن کاڵا داوا بکەم؟",
    ]) {
      const button = root.getByRole("button", { name: label, exact: true });
      const rect = await button.boundingBox();
      expect(rect!.height).toBeGreaterThanOrEqual(44);
      await button.click();
      await expect(page.locator("#rl-ai-input")).toHaveValue(label);
      await expect(page.locator("#rl-ai-input")).toBeFocused();
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
  test("keyboard sends real refusal, safe mixed direction and confirmed reset", async ({
    page,
  }) => {
    await page.goto("/ai?lang=en", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Chat with R&L AI" }).click();
    const input = page.locator("#rl-ai-input");
    await input.fill("Write Python code");
    await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeDisabled();
    await page
      .getByLabel("I agree to send my messages to Cloudflare Workers AI.", { exact: true })
      .check();
    await input.press("Enter");
    await expect(page.getByRole("log")).toContainText("Sorry, I only help with R&L services.");
    await expect(page.getByRole("log").locator('article[dir="auto"]')).toHaveCount(2);
    await page.getByRole("button", { name: "New conversation" }).click();
    await expect(page.getByRole("log")).toContainText("Write Python code");
    await page.getByRole("button", { name: "Start fresh" }).click();
    await expect(page.getByRole("log")).not.toContainText("Write Python code");
  });
  test("verified workflow shortcuts use real R&L links", async ({ page }) => {
    await page.goto("/ai?lang=ckb", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "کاڵام بۆ بهێنەوە", exact: true }).click();
    await page
      .getByLabel("ڕازیم پەیامەکانم بۆ Cloudflare Workers AI بنێردرێن.", { exact: true })
      .check();
    await page.locator("#rl-ai-input").press("Enter");
    await expect(
      page.getByRole("log").getByRole("link", { name: "کاڵام بۆ بهێنەوە" }),
    ).toHaveAttribute("href", "/stores/request?intent=buy");
    await page.getByRole("button", { name: "داواکارییەکەم لە کوێیە؟", exact: true }).click();
    await page.locator("#rl-ai-input").press("Enter");
    await expect(page.getByRole("log").getByRole("link", { name: "ئەکاونتەکەم" })).toHaveAttribute(
      "href",
      "/account",
    );
  });
  test("image selection, removal and explicit processing preserve the existing camera workflow", async ({
    page,
  }) => {
    let identifications = 0;
    await page.route("**/api/ai/status", (route) => route.fulfill({ json: { enabled: true } }));
    await page.route("**/api/ai/identify", (route) => {
      identifications++;
      return route.fulfill({ status: 504, json: { ok: false, error: "timeout" } });
    });
    await page.goto("/ai?lang=en", { waitUntil: "networkidle" });
    const image = page.locator("#rl-ai-image");
    await image.getByRole("checkbox").check();
    await expect(image.locator('input[capture="environment"]')).toHaveAttribute(
      "accept",
      "image/jpeg,image/png,image/webp",
    );
    const upload = image.getByLabel("Choose photo", { exact: true });
    await upload.setInputFiles("public/rl-logo.png");
    await expect(image.getByRole("button", { name: "Identify this photo" })).toBeVisible();
    expect(identifications).toBe(0);
    await image.getByRole("button", { name: "Remove photo" }).click();
    await expect(image.getByRole("button", { name: "Identify this photo" })).toHaveCount(0);
    await upload.setInputFiles({
      name: "bad.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from("<svg/>"),
    });
    await expect(image.getByRole("alert")).toContainText("JPEG, PNG or WebP");
    await upload.setInputFiles("public/rl-logo.png");
    await image.getByRole("button", { name: "Identify this photo" }).click();
    await expect(image.getByRole("alert")).toContainText("took too long");
    expect(identifications).toBe(1);
  });
});
