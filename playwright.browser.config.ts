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
  projects: layout
    .projects!.filter((project) => projects.has(project.name!))
    .map((project) => ({
      ...project,
      testMatch: "**/browser-regression.spec.ts",
      testIgnore: [],
    })),
});
