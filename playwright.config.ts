import { existsSync } from "node:fs";
import { prepareLayoutConfig } from "./scripts/layout-config.mjs";
import { defineConfig, devices } from "@playwright/test";

/**
 * Layout lock (see DEPLOY.md "Layout lock"). Geometry assertions + screenshot baselines
 * for the key pages on fixed device viewports. Baselines are rendered in the official
 * Playwright Docker image (mcr.microsoft.com/playwright:v1.63.0-noble) so CI and local
 * updates produce identical pixels.
 */
const PORT = Number(process.env.LAYOUT_PORT ?? 8788);
/** Point the suite at a deployed URL (e.g. staging) instead of the local worker. */
const BASE_URL = process.env.LAYOUT_BASE_URL;

/**
 * The layout lock renders the no-database state its baselines were captured in, so the
 * local worker runs from a copy of the built config without the production Hyperdrive
 * binding (`wrangler dev` refuses one without a local Postgres connection string).
 */
const BUILT_CONFIG = ".output/server/wrangler.json";
const LAYOUT_CONFIG = ".output/server/wrangler.layout.json";
if (!BASE_URL && existsSync(BUILT_CONFIG)) {
  prepareLayoutConfig(BUILT_CONFIG, LAYOUT_CONFIG);
}

export type Breakpoint = "phone" | "tablet" | "laptop";
export type LayoutProjectUse = { breakpoint: Breakpoint };

const chromium = devices["Desktop Chrome"];
const safari = devices["Desktop Safari"];
const firefox = devices["Desktop Firefox"];

const VIEWPORTS = [
  { name: "iphone", width: 390, height: 844, mobile: true, breakpoint: "phone" },
  { name: "iphone-se", width: 375, height: 667, mobile: true, breakpoint: "phone" },
  { name: "ipad-portrait", width: 820, height: 1180, mobile: true, breakpoint: "tablet" },
  { name: "ipad-landscape", width: 1180, height: 820, mobile: true, breakpoint: "laptop" },
  { name: "laptop", width: 1280, height: 800, mobile: false, breakpoint: "laptop" },
  { name: "laptop-1440", width: 1440, height: 900, mobile: false, breakpoint: "laptop" },
] as const;

/** WebKit approximates iOS/iPadOS Safari; Chromium alone misses Safari-only layout bugs. */
const WEBKIT = new Set(["iphone", "ipad-portrait", "ipad-landscape"]);

function project(browser: "chromium" | "webkit", vp: (typeof VIEWPORTS)[number]) {
  return {
    name: `${browser}-${vp.name}`,
    testIgnore: "**/premium.spec.ts",
    use: {
      ...(browser === "chromium" ? chromium : safari),
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      breakpoint: vp.breakpoint,
    },
  };
}

export default defineConfig<LayoutProjectUse>({
  testDir: "tests/layout",
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  // Stop before the 25-minute "layout lock" job limit in quality.yml. A job-level timeout
  // cancels the step and skips the report upload, leaving reviewers with no diffs; a
  // Playwright timeout fails the step, writes the HTML report and the upload still runs.
  globalTimeout: process.env.CI ? 19 * 60_000 : 0,
  // Stale baselines fail almost every screenshot (twice, with the retry); past this many
  // the cause is clear from the report and the fix is the update_baselines dispatch.
  maxFailures: process.env.CI ? 60 : 0,
  // Leave CPU for the local Worker and WebKit's full-page captures on CI runners.
  workers: process.env.CI ? 3 : 6,
  timeout: 45_000,
  reporter: process.env.CI ? [["list"], ["github"], ["html", { open: "never" }]] : [["list"]],
  expect: {
    // Tall full-page WebKit captures need more than the 5s default on CI runners.
    timeout: 20_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      // Small tolerance for anti-aliasing; any real layout move exceeds it.
      threshold: 0.2,
      maxDiffPixelRatio: 0.002,
    },
  },
  use: {
    baseURL: BASE_URL ?? `http://localhost:${PORT}`,
    serviceWorkers: "block",
    locale: "en-GB",
    timezoneId: "UTC",
    colorScheme: "light",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: [
    ...VIEWPORTS.map((vp) => project("chromium", vp)),
    ...VIEWPORTS.filter((vp) => WEBKIT.has(vp.name)).map((vp) => project("webkit", vp)),
    {
      name: "premium-360",
      testMatch: "**/premium.spec.ts",
      use: {
        ...chromium,
        viewport: { width: 360, height: 800 },
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
        breakpoint: "phone",
      },
    },
    {
      // Gecko coverage for the functional/geometry suite. It has no screenshot
      // assertions, so it needs no baselines; Firefox has no isMobile emulation.
      name: "firefox-premium-360",
      testMatch: "**/premium.spec.ts",
      use: {
        ...firefox,
        viewport: { width: 360, height: 800 },
        deviceScaleFactor: 1,
        breakpoint: "phone",
      },
    },
  ],
  webServer: BASE_URL
    ? undefined
    : {
        // Built worker served locally by wrangler (no Cloudflare credentials, no database).
        // Preserve localhost: inferring the production www host over local
        // HTTP would exercise its HTTPS redirect instead of the test app.
        command: `npx wrangler dev --config ${LAYOUT_CONFIG} --port ${PORT} --local --host localhost --show-interactive-dev-session=false`,
        url: `http://localhost:${PORT}/`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: "ignore",
        stderr: "pipe",
      },
});
