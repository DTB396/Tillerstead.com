// Basic Playwright test example
import { test, expect } from '@playwright/test';

test('homepage has correct title', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Tillerstead|Home/i);
});
