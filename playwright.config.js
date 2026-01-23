import process from 'node:process';
import { defineConfig, devices } from '@playwright/test';

// Use a dedicated port for Playwright so local dev on :4000 doesn't conflict.
const PORT = process.env.PORT || 4173;
const PROD_URL = process.env.BASE_URL || process.env.PROD_URL || '';
const baseURL = PROD_URL ? PROD_URL : `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report/html' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'chromium-mobile',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'chromium-tablet',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
      },
    },
  ],

  webServer: PROD_URL
    ? undefined // Don't start local server if testing production
    : {
      command: 'npm run serve:test',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
});
