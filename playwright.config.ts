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

export type Breakpoint = "phone" | "tablet" | "laptop";
export type LayoutProjectUse = { breakpoint: Breakpoint };

const chromium = devices["Desktop Chrome"];
const safari = devices["Desktop Safari"];

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
  workers: process.env.CI ? 4 : 6,
  timeout: 45_000,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  expect: {
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
  ],
  webServer: BASE_URL
    ? undefined
    : {
        // Built worker served locally by wrangler (no Cloudflare credentials needed).
        command: `npx wrangler dev --config .output/server/wrangler.json --port ${PORT} --local --show-interactive-dev-session=false`,
        url: `http://localhost:${PORT}/`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: "ignore",
        stderr: "pipe",
      },
});
