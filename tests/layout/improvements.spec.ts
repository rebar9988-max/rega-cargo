import { expect, test } from "@playwright/test";
import { DRAFT_COPY } from "../../src/lib/orders/draft-copy";
import { orderDraftKey, DRAFT_TTL_MS } from "../../src/lib/orders/draft";

for (const lang of ["ckb", "ar", "en"] as const) {
  test(`order drafts restore only safe fields and require a fresh declaration (${lang})`, async ({
    page,
  }) => {
    const t = DRAFT_COPY[lang];
    await page.goto(`/stores/request?store=zalando&intent=buy&lang=${lang}`, {
      waitUntil: "networkidle",
    });
    const next = page.locator("[data-step-next]");
    await page.locator('main input[name="url"]').fill("https://www.zalando.de/shoes?size=42");
    await page.locator('main input[name="qty"]').fill("2");
    await page.getByRole("checkbox", { name: t.keep }).check();
    const key = orderDraftKey("zalando", "buy");
    await expect
      .poll(() => page.evaluate((k) => sessionStorage.getItem(k), key))
      .toContain('"qty":"2"');
    // The phone number lives on the delivery step and must never reach the draft.
    await next.click();
    await page.locator('main input[name="phone"]').fill("+9647501234567");
    const stored = await page.evaluate((k) => sessionStorage.getItem(k), key);
    expect(stored).not.toContain("7501234567");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator('main input[name="url"]')).toHaveValue(
      "https://www.zalando.de/shoes?size=42",
    );
    await expect(page.locator('main input[name="qty"]')).toHaveValue("2");
    await expect(page.getByText(t.restored)).toBeVisible();
    await next.click();
    await expect(page.locator('main input[name="phone"]')).toHaveValue("");
    await next.click();
    await expect(page.locator('main input[name="declared"]')).not.toBeChecked();
    await page.locator("[data-step-back]").click();
    await page.locator("[data-step-back]").click();
    await page.getByRole("button", { name: t.clear, exact: true }).click();
    await expect.poll(() => page.evaluate((k) => sessionStorage.getItem(k), key)).toBeNull();
    expect(await page.locator("html").getAttribute("dir")).toBe("rtl");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

test("expired drafts are never restored and fallback is not a confirmed order", async ({
  page,
}) => {
  const key = orderDraftKey("zalando", "buy");
  await page.addInitScript(
    ({ key, ttl }) => {
      sessionStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          expiresAt: Date.now() - ttl,
          url: "https://www.zalando.de/old",
          qty: "2",
          dest: "sul",
        }),
      );
    },
    { key, ttl: DRAFT_TTL_MS },
  );
  await page.goto("/stores/request?store=zalando&lang=en", { waitUntil: "networkidle" });
  await expect(page.locator('main input[name="url"]')).toHaveValue("");
  // The email fallback is part of the review step.
  await page.locator('main input[name="url"]').fill("https://www.zalando.de/shoes");
  await page.locator("[data-step-next]").click();
  await page.locator("[data-step-next]").click();
  const fallback = page.locator("[data-order-fallback]");
  await fallback.locator("summary").click();
  await expect(fallback.getByText(DRAFT_COPY.en.note)).toBeVisible();
  await expect(fallback.locator('a[href^="mailto:"]')).toHaveCount(0);
  await page.locator('main input[name="declared"]').check();
  await expect(fallback.locator('a[href^="mailto:"]')).toHaveAttribute(
    "href",
    /^mailto:2233rega@gmail\.com\?subject=/,
  );
});

test("unavailable browser storage leaves the order form usable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new DOMException("Storage unavailable", "SecurityError");
      },
    });
  });
  await page.goto("/stores/request?lang=en", { waitUntil: "networkidle" });
  await page.getByRole("checkbox", { name: DRAFT_COPY.en.keep }).check();
  await expect(page.getByText(DRAFT_COPY.en.unsafe)).toBeVisible();
  await page.locator('main input[name="url"]').fill("https://www.amazon.de/item");
  await expect(page.locator('main input[name="url"]')).toHaveValue("https://www.amazon.de/item");
});

for (const lang of ["ckb", "ar", "en"] as const) {
  test(`complaints remain reviewable and never promise an automatic refund (${lang})`, async ({
    page,
  }) => {
    const { TRUST_COPY } = await import("../../src/lib/trust-copy");
    const t = TRUST_COPY[lang];
    await page.goto(`/contact?lang=${lang}`, { waitUntil: "networkidle" });
    const complaint = page.locator("[data-complaint-panel]");
    await expect(complaint.getByText(t.note)).toBeVisible();
    await complaint.getByLabel(t.reference).fill("RG-ABCD-1234-5678");
    await complaint.getByLabel(t.details).fill("Package arrived damaged on 2026-10-13.");
    await expect(complaint.getByRole("link", { name: t.send })).toHaveAttribute(
      "href",
      /mailto:.*RG-ABCD-1234-5678/,
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

test("cost estimate distinguishes unknown costs and includes volumetric weight", async ({
  page,
}) => {
  const { COST_COPY } = await import("../../src/lib/cost-copy");
  const t = COST_COPY.en;
  const { AI_COPY } = await import("../../src/components/ai-copy");
  const ai = AI_COPY.en;
  await page.goto("/ai?lang=en", { waitUntil: "networkidle" });
  await page.getByLabel(ai.price).fill("100");
  await page.getByLabel(ai.weight).fill("1");
  await expect(page.getByText(t.unknown, { exact: true })).toHaveCount(2);
  await page.getByText(t.optional, { exact: true }).click();
  await page.getByLabel(t.length).fill("40");
  await page.getByLabel(t.width).fill("30");
  await page.getByLabel(t.height).fill("20");
  await page.getByLabel(t.shopShipping).fill("5");
  await page.getByLabel(t.serviceFee).fill("2");
  await expect(page.getByText(t.unknown, { exact: true })).toHaveCount(0);
  await expect(page.getByText(t.note)).toBeVisible();
  await expect(page.locator("dl").filter({ has: page.getByText(t.chargeable) })).toContainText(
    "4.8",
  );
});
