import { defineConfig } from "@playwright/test";
import layout, { type LayoutProjectUse } from "./playwright.config";

// Reuse the existing Worker, devices, geometry, timeouts and artifact settings.
// Representative phone/desktop coverage for each engine, plus Firefox tablet.
const projects = new Set([
  "chromium-iphone",
  "chromium-laptop",
  "webkit-iphone",
  "webkit-ipad-landscape",
  "firefox-iphone",
  "firefox-ipad-portrait",
  "firefox-laptop",
]);

export default defineConfig<LayoutProjectUse>({
  ...layout,
  // The full instrumented matrix took 36 minutes on a shared two-core environment.
  // Leave report-upload time inside the separate 45-minute browser job; the
  // existing pixel job retains its own 19/25-minute guards.
  globalTimeout: process.env.CI ? 40 * 60_000 : 0,
  projects: layout
    .projects!.filter((project) => projects.has(project.name!))
    .map((project) => ({
      ...project,
      testMatch: "**/browser-regression.spec.ts",
      testIgnore: [],
    })),
});
