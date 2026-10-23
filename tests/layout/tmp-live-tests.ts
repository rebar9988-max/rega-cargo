// TEMPORARY — read-only production verification of the Marketplace refinement (#152/#154).
// Shared by tmp-live.spec.ts (Chromium/WebKit projects) and tmp-live/premium.spec.ts (Chromium
// and Firefox premium projects). Runs only with TMP_LIVE=1 against LAYOUT_BASE_URL. Never merged.
import { test, expect, type Page } from "@playwright/test";

const WIDTHS = [320, 375, 390, 430, 820, 1280, 1440];
const SHOTS = new Set([320, 390, 1280]);

async function shot(page: Page, selector: string, name: string, project: string) {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -120));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tmp-live/${project}/${name}.png` });
}

export function defineLiveTests() {
  for (const lang of ["ckb", "ar", "en"]) {
    test(`live stores ${lang}`, async ({ page }, info) => {
      test.setTimeout(240_000);
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/stores?lang=${lang}`, { waitUntil: "networkidle" });
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        // Owner rule: <html dir> is always rtl; data-textdir carries the language direction.
        await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
        await expect(page.locator("html")).toHaveAttribute(
          "data-textdir",
          lang === "en" ? "ltr" : "rtl",
        );
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        );
        expect(overflow, `${width} ${lang} overflow`).toBe(0);
        const tiles = await page.locator(".rl-retailer").evaluateAll((els) =>
          els.map((el) => {
            const t = el.getBoundingClientRect();
            const l = el.querySelector("img")!.getBoundingClientRect();
            return {
              w: t.width,
              h: t.height,
              lh: l.height,
              inside: l.left >= t.left && l.right <= t.right,
            };
          }),
        );
        expect(tiles.length).toBeGreaterThan(5);
        const ws = tiles.map((t) => t.w);
        expect(Math.max(...ws) - Math.min(...ws), `${width} ${lang} tiles`).toBeLessThan(1);
        for (const t of tiles) {
          expect(t.h).toBeGreaterThanOrEqual(44);
          expect(t.lh).toBeLessThanOrEqual(24.5);
          expect(t.inside).toBe(true);
        }
        const cards = await page.locator(".rl-store-card").evaluateAll((els) =>
          els.map((el) => {
            const top = (s: string) => Math.round(el.querySelector(s)!.getBoundingClientRect().top);
            const meta = el.querySelector(".rl-store-meta")!;
            const rtl = getComputedStyle(meta).direction === "rtl";
            const lines = [...meta.children].map((c) => c.getBoundingClientRect());
            const host = meta.children[1] as HTMLElement;
            return {
              row: Math.round(el.getBoundingClientRect().top),
              name: top("h3"),
              meta: top(".rl-store-meta"),
              site: top(".rl-store-site"),
              primary: top(".rl-store-primary"),
              lines: lines.length,
              edge: Math.abs(rtl ? lines[0].right - lines[1].right : lines[0].left - lines[1].left),
              cut: host.scrollWidth > host.clientWidth + 1,
              logoW: (() => {
                const img = el.querySelector(".rl-store-logo img") as HTMLImageElement;
                return img.getBoundingClientRect().width - Number(img.getAttribute("width"));
              })(),
              logoH: el.querySelector(".rl-store-logo img")!.getBoundingClientRect().height,
              fav: (() => {
                const b = el.querySelector(".rl-store-fav");
                if (!b) return -1;
                const r = b.getBoundingClientRect();
                const i = b.querySelector("svg")!.getBoundingClientRect();
                const l = el.querySelector(".rl-store-logo img")!.getBoundingClientRect();
                const overlap =
                  Math.max(0, Math.min(i.right, l.right) - Math.max(i.left, l.left)) *
                  Math.max(0, Math.min(i.bottom, l.bottom) - Math.max(i.top, l.top));
                return overlap > 0 ? -2 : Math.min(r.width, r.height);
              })(),
              favW: (() => {
                const r = el.querySelector(".rl-store-fav")!.getBoundingClientRect();
                return [r.width, r.height];
              })(),
            };
          }),
        );
        expect(cards.length).toBeGreaterThan(10);
        const rows = new Map<number, typeof cards>();
        for (const c of cards) rows.set(c.row, [...(rows.get(c.row) ?? []), c]);
        for (const [row, cells] of rows)
          for (const key of ["name", "meta", "site", "primary"] as const) {
            const v = cells.map((c) => c[key]);
            expect(
              Math.max(...v) - Math.min(...v),
              `${width} ${lang} row ${row} ${key}`,
            ).toBeLessThanOrEqual(1);
          }
        for (const c of cards) {
          expect(c.lines).toBe(2);
          expect(c.edge, `${width} ${lang} meta edge`).toBeLessThanOrEqual(1);
          expect(c.cut, `${width} ${lang} host cut`).toBe(false);
          expect(Math.abs(c.logoW), `${width} ${lang} card logo full size`).toBeLessThan(1);
          expect(c.logoH, `${width} ${lang} card logo height`).toBeGreaterThanOrEqual(10);
          expect(c.fav, `${width} ${lang} favourite badge`).toBeGreaterThanOrEqual(44);
          expect(c.favW[0], `${width} ${lang} heart width`).toBeGreaterThanOrEqual(44);
          expect(c.favW[1], `${width} ${lang} heart height`).toBeGreaterThanOrEqual(44);
        }
        if (SHOTS.has(width)) {
          await shot(page, ".rl-retailer-rail", `stores-${lang}-${width}-rail`, info.project.name);
          await shot(page, ".rl-store-grid", `stores-${lang}-${width}-cards`, info.project.name);
        }
      }
    });

    test(`live request ${lang}`, async ({ page }, info) => {
      test.setTimeout(240_000);
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/stores/request?store=zalando-it&intent=buy&lang=${lang}`, {
          waitUntil: "networkidle",
        });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        );
        expect(overflow, `${width} ${lang} overflow`).toBe(0);
        const row = page.locator(".rl-request-store");
        await expect(row).toContainText("zalando.it");
        await expect(row.locator("img")).toHaveAttribute("src", /\/store-logos\/zalando\.svg$/);
        const halves = page.locator(".rl-intent-switch .rl-chip");
        await expect(halves).toHaveCount(2);
        const [a, b] = [(await halves.nth(0).boundingBox())!, (await halves.nth(1).boundingBox())!];
        expect(Math.abs(a.width - b.width), `${width} ${lang} widths`).toBeLessThan(1);
        expect(Math.abs(a.height - b.height), `${width} ${lang} heights`).toBeLessThan(1);
        expect(Math.abs(a.y - b.y), `${width} ${lang} row`).toBeLessThan(1);
        expect(Math.min(a.height, b.height)).toBeGreaterThanOrEqual(44);
        if (SHOTS.has(width))
          await shot(page, ".rl-request-store", `request-${lang}-${width}`, info.project.name);
      }
    });

    // Existing journey, read-only (nothing is submitted): stores -> country -> retailer ->
    // official-site link -> Bring For Me -> request page -> switch -> back keeps the filters.
    test(`live journey ${lang}`, async ({ page, context }) => {
      test.setTimeout(240_000);
      for (const width of [320, 390, 820, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/?lang=${lang}`, { waitUntil: "networkidle" });
        const overflowHome = await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        );
        expect(overflowHome, `${width} ${lang} home overflow`).toBe(0);
        await page.goto(`/stores?lang=${lang}`, { waitUntil: "networkidle" });
        await page.locator('.rl-country-chips [data-country="DE"]').click();
        await expect(page).toHaveURL(/country=DE/);
        await page.locator('.rl-retailer[data-retailer="zalando"]').click();
        await expect(page).toHaveURL(/store=zalando/);
        const card = page.locator("[data-store=zalando]");
        await expect(card).toBeVisible();
        const site = card.locator("a.rl-store-site");
        await expect(site).toHaveAttribute("href", "https://www.zalando.de/");
        await expect(site).toHaveAttribute("target", "_blank");
        await expect(site).toHaveAttribute("rel", "noopener noreferrer");
        // Favourite toggles locally (browser storage only).
        const fav = card.locator(".rl-store-fav");
        await fav.click();
        await expect(fav).toHaveAttribute("aria-pressed", "true");
        await fav.click();
        await expect(fav).toHaveAttribute("aria-pressed", "false");
        await card.locator(".rl-store-primary").click();
        await expect(page).toHaveURL(/\/stores\/request\?.*store=zalando/);
        await expect(page.locator(".rl-request-store")).toContainText("zalando.de");
        const halves = page.locator(".rl-intent-switch .rl-chip");
        await halves.nth(1).click();
        await expect(page).toHaveURL(/intent=ship/);
        await expect(halves.nth(1)).toHaveAttribute("aria-current", "page");
        await expect(page.locator("form.rl-request-form button[type=submit]")).toBeVisible();
        await page.goBack();
        await page.goBack();
        await expect(page).toHaveURL(/\/stores\?.*country=DE/);
        await expect(page).toHaveURL(/store=zalando/);
        await expect(page.locator("[data-store=zalando]")).toBeVisible();
      }
      void context;
    });
  }
}
