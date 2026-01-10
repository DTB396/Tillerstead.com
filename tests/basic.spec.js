// Basic Playwright test example
import { test, expect } from '@playwright/test';

test('homepage has correct title', async ({ page }) => {
  await page.goto('/'); // baseURL is set in Playwright config
  await expect(page).toHaveTitle(/Tillerstead|Home/i);
});
