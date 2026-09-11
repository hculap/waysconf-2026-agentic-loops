import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright is used here as a verifier, not as a test-authoring tool.
 * Every spec under checks/specs/ answers one question with a hard pass or fail,
 * and writes machine-readable output that the agentic loop reads back.
 */
export default defineConfig({
  testDir: './checks/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  // Traces, screenshots and the JSON report all go into the run's own directory when
  // checks/run.mjs supplies one. Sharing a fixed path lets a concurrent browser
  // session write into a run it has nothing to do with — see evidence/INCIDENTS.md.
  reporter: [
    ['list'],
    [
      'json',
      {
        outputFile: process.env.CHECK_RUN_DIR
          ? `${process.env.CHECK_RUN_DIR}/playwright.json`
          : 'checks/.results/playwright.json',
      },
    ],
  ],
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || 'checks/.results/artifacts',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: process.env.CHECK_BASE_URL || 'http://localhost:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Deterministic rendering: without this the pixel diff is noise.
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.CHECK_BASE_URL
    ? undefined
    : {
        command: 'npm run preview -- --port 4321',
        url: 'http://localhost:4321',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
