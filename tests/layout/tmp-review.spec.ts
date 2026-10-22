// TEMPORARY — marketplace refinement review shots (removed before merge). Runs only with
// TMP_REVIEW=1: unmasked screenshots (real store logos) for visual review of the change.
import { test } from "@playwright/test";

test.skip(!process.env.TMP_REVIEW, "review shots only in the temporary workflow");

const SHOTS = [
  ["/stores?lang=ckb", "stores-ckb"],
  ["/stores?lang=en&country=DE", "stores-de-en"],
  ["/stores?lang=ar&country=IT", "stores-it-ar"],
  ["/stores/request?store=zalando&intent=buy&lang=ckb", "request-ckb"],
  ["/stores/request?store=sephora-fr&intent=buy&lang=en", "request-en"],
] as const;

for (const [path, name] of SHOTS)
  test(`review ${name}`, async ({ page }, info) => {
    await page.goto(path, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (const img of document.querySelectorAll("img")) img.loading = "eager";
      await document.fonts.ready;
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `tmp-review/${info.project.name}/${name}.png`,
      fullPage: true,
    });
  });
