import { fromJSON } from "seroval";
import { test, expect, type Page } from "@playwright/test";

async function fill(page: Page) {
  await page.goto("/stores/request?intent=buy&lang=ckb", { waitUntil: "networkidle" });
  const form = page.locator("form.rl-request-form");
  await form.locator('[name="url"]').fill("https://www.zalando.de/shoes");
  await form.locator('[name="qty"]').fill("2");
  await form.locator("details summary").click();
  await form.locator("details input").nth(0).fill("42");
  await form.locator("details input").nth(1).fill("red");
  await form.locator("textarea").fill("Request reset regression");
  await form.locator('[name="dest"]').selectOption("sul");
  await form.locator('[name="phone"]').fill("+9647501234567");
  await form.locator('[name="declared"]').check();
  return form;
}
async function preserved(page: Page) {
  const form = page.locator("form.rl-request-form");
  await expect(form.locator('[name="url"]')).toHaveValue("https://www.zalando.de/shoes");
  await expect(form.locator('[name="qty"]')).toHaveValue("2");
  await expect(form.locator("details input").nth(0)).toHaveValue("42");
  await expect(form.locator("details input").nth(1)).toHaveValue("red");
  await expect(form.locator("textarea")).toHaveValue("Request reset regression");
  await expect(form.locator('[name="dest"]')).toHaveValue("sul");
  await expect(form.locator('[name="phone"]')).toHaveValue("+9647501234567");
  await expect(form.locator('[name="declared"]')).toBeChecked();
}
async function challenge(page: Page) {
  await page.route("**/api/ai/challenge", (route) =>
    route.fulfill({ json: { mode: "token", token: "test-only" } }),
  );
}

test("exact reported buy chip does not return the completed form to the beginning", async ({
  page,
}) => {
  let posts = 0;
  page.on("request", (request) => {
    if (request.method() === "POST") posts++;
  });
  const form = await fill(page);
  const chip = form.getByRole("link", { name: "داواکردنی کڕین", exact: true });
  await chip.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => ({ scroll: scrollY, time: performance.timeOrigin }));
  expect(before.scroll).toBeGreaterThan(0);
  await chip.click();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => scrollY)).toBe(before.scroll);
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(before.time);
  expect(posts).toBe(0);
  await preserved(page);
  await form.locator('a[href*="intent=ship"]').click();
  await expect(page).toHaveURL(/intent=ship/);
  await preserved(page);
});

test("missing declaration scrolls to the field with a localized error and keeps every value", async ({
  page,
}) => {
  const form = await fill(page);
  await form.locator('[name="declared"]').uncheck();
  await form.locator('button[type="submit"]').click();
  const field = form.locator('[name="declared"]');
  await expect(field).toBeFocused();
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(form.locator("#rl-request-error")).toBeVisible();
  const rect = await field.boundingBox();
  expect(rect!.y).toBeGreaterThanOrEqual(0);
  expect(rect!.y).toBeLessThan(page.viewportSize()!.height);
  await field.check();
  await preserved(page);
});

test("401 sign-in opens on the same form and cancellation preserves all fields", async ({
  page,
}) => {
  await challenge(page);
  await page.route("**/_serverFn/*", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({ status: 401, json: { result: { error: "signin" }, context: {} } });
  });
  const form = await fill(page);
  const time = await page.evaluate(() => performance.timeOrigin);
  await form.locator('button[type="submit"]').click();
  await expect(form.locator("#rl-request-error")).toBeFocused();
  await preserved(page);
  await form.locator("button.rl-text-link").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page).toHaveURL(/\/stores\/request\?/);
  await page.keyboard.press("Escape");
  await preserved(page);
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(time);
});

test("network loss, rapid double tap and retry keep one submission key and confirm the saved ID", async ({
  page,
}) => {
  await challenge(page);
  const sent: Array<Record<string, unknown>> = [];
  await page.route("**/_serverFn/*", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    sent.push(
      (fromJSON(JSON.parse(route.request().postData()!)) as { data: Record<string, unknown> }).data,
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (sent.length === 1) return route.abort("failed");
    await route.fulfill({ json: { result: { id: "RG-ABCD-EFGH-JKMN" }, context: {} } });
  });
  const form = await fill(page);
  await form.evaluate((element) => {
    (element as HTMLFormElement).requestSubmit();
    (element as HTMLFormElement).requestSubmit();
  });
  await expect(form.locator("#rl-request-error")).toBeVisible();
  expect(sent.length).toBe(1);
  await preserved(page);
  await form.locator('button[type="submit"]').click();
  await expect(page.getByRole("status")).toHaveText("RG-ABCD-EFGH-JKMN");
  expect(sent.length).toBe(2);
  expect(sent[0].submissionId).toMatch(/^[0-9a-f-]{36}$/);
  expect(sent[0].submissionId).toBe(sent[1].submissionId);
  expect(sent[1]).toMatchObject({
    size: "42",
    color: "red",
    notes: "Request reset regression",
    declared: true,
  });
});

test("successful inline authentication keeps form state until the user submits again", async ({
  page,
}) => {
  await challenge(page);
  // Only the isolated local browser test simulates the already existing OTP provider.
  await page.route("**/_serverFn/*", async (route) => {
    if (route.request().method() === "GET") {
      const response = await route.fetch();
      if ((await response.text()).includes("available"))
        return route.fulfill({ json: { result: { available: true }, context: {} } });
      return route.fulfill({ response });
    }
    const data = (
      fromJSON(JSON.parse(route.request().postData()!)) as { data: Record<string, unknown> }
    ).data;
    const result = data.intent
      ? { error: "signin" }
      : data.pin
        ? { name: "QA", phone: "+9647501234567" }
        : { sent: true, whatsapp: true, sms: false };
    await route.fulfill({ json: { result, context: {} } });
  });
  const form = await fill(page);
  await form.locator('button[type="submit"]').click();
  await form.locator("button.rl-text-link").click();
  const dialog = page.getByRole("dialog");
  await dialog.locator('input[autocomplete="tel-national"]').fill("7501234567");
  await dialog.getByRole("button", { name: "بەردەوامبە", exact: true }).click();
  await dialog.locator('input[autocomplete="one-time-code"]').fill("123456");
  await dialog.getByRole("textbox", { name: "ناو", exact: true }).fill("QA");
  await dialog.locator('button[type="submit"]').click();
  await expect(dialog).not.toBeVisible();
  await preserved(page);
  await expect(form.locator('button[type="submit"]')).toBeFocused();
  await expect(form.locator("#rl-request-error")).toHaveCount(0);
});
