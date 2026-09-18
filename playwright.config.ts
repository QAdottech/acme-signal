import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Keep first-run failures visible when comparing with other testing tools.
  retries: 0,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  outputDir: "test-results/artifacts",
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/e2e.json" }],
  ],
  use: {
    baseURL,
    viewport: { width: 1440, height: 1000 },
    locale: "en-US",
    timezoneId: "UTC",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
  ],
  webServer: {
    command: "pnpm build && pnpm start --hostname localhost --port 3100",
    url: `${baseURL}/login`,
    timeout: 180_000,
    // Never silently run against a developer's server or real email credentials.
    reuseExistingServer: false,
    env: {
      RESEND_API_KEY: "",
      NEXT_PUBLIC_APP_URL: baseURL,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
      TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
