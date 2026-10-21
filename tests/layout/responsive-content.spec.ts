import { test, expect } from "@playwright/test";
import { CONTACT_EMAIL } from "../../src/lib/contact";
import { LANGS } from "../../src/lib/langs";

test("320px contact card keeps its complete email inside the content column", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const { id } of LANGS) {
    await page.goto(`/contact?lang=${id}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const card = page.locator(`main a[href="mailto:${CONTACT_EMAIL}"]`).first();
    await expect(card).toBeVisible();
    await expect(card.locator("bdi")).toHaveText(CONTACT_EMAIL);
    const geometry = await card.evaluate((el) => {
      const cardRect = el.getBoundingClientRect();
      const address = el.querySelector("bdi")!;
      const addressRect = address.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(address);
      return {
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        left: cardRect.left,
        right: cardRect.right,
        addressLeft: addressRect.left,
        addressRight: addressRect.right,
        // Text can wrap, but every line must remain visible, without ellipsis or clipping.
        textInside: [...range.getClientRects()].every(
          (rect) => rect.left >= addressRect.left - 1 && rect.right <= addressRect.right + 1,
        ),
        overflow: getComputedStyle(address).textOverflow,
      };
    });
    expect(geometry.document, id).toBe(geometry.viewport);
    expect(geometry.left, id).toBeGreaterThanOrEqual(0);
    expect(geometry.right, id).toBeLessThanOrEqual(geometry.viewport);
    expect(geometry.addressLeft, id).toBeGreaterThanOrEqual(geometry.left);
    expect(geometry.addressRight, id).toBeLessThanOrEqual(geometry.right);
    expect(geometry.textInside, id).toBe(true);
    expect(geometry.overflow, id).not.toBe("ellipsis");
  }
});

test("prohibited category labels remain readable inside narrow cards in every locale", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const { id } of LANGS) {
    await page.goto(`/prohibited-items?lang=${id}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const geometry = await page.locator("#prohibited + p + ul").evaluate((list) => ({
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
      cards: [...list.children].map((card) => {
        const rect = card.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(card);
        return {
          text: card.textContent?.trim(),
          fits: [...range.getClientRects()].every(
            (line) => line.left >= rect.left - 1 && line.right <= rect.right + 1,
          ),
        };
      }),
    }));
    expect(geometry.document, id).toBe(geometry.viewport);
    expect(geometry.cards.length).toBeGreaterThan(0);
    for (const card of geometry.cards) {
      expect(card.text, id).toBeTruthy();
      expect(card.fits, `${id}: ${card.text}`).toBe(true);
    }
  }
});
