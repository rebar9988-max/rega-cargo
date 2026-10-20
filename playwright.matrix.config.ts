import { defineConfig, devices } from "@playwright/test";

// Diagnostic only: read-only matrix against the live site. Not part of the layout lock.
export default defineConfig({
  testDir: "tests/layout",
  testMatch: "**/live-matrix.spec.ts",
  fullyParallel: true,
  workers: 3,
  retries: 1,
  timeout: 240_000,
  globalTimeout: 38 * 60_000,
  reporter: [["list"], ["github"]],
  use: { baseURL: process.env.LIVE_BASE_URL ?? "https://www.rlgo.net", serviceWorkers: "block" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
