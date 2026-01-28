import { test, expect } from '@playwright/test';

test.skip('Surface checkboxes work independently - DISABLED (page not built)', async ({ page }) => {
  await page.goto('/tools/legacy/');
  await page.waitForSelector('#add-room-btn', { timeout: 15000 });

  // Add a room to reveal surface toggles
  await page.click('#add-room-btn');
  const roomCard = page.locator('.room-card').first();
  await expect(roomCard).toBeVisible();

  // Click the Floor label (not the hidden checkbox)
  const floorLabel = roomCard.locator('.surface-toggle').filter({ hasText: 'Floor' });
  const backsplashLabel = roomCard.locator('.surface-toggle').filter({ hasText: 'Backsplash' });

  // Get the actual checkbox inputs
  const floorCheckbox = floorLabel.locator('input[type="checkbox"]');
  const backsplashCheckbox = backsplashLabel.locator('input[type="checkbox"]');

  // Verify both are unchecked initially
  await expect(floorCheckbox).not.toBeChecked();
  await expect(backsplashCheckbox).not.toBeChecked();

  // Click floor label
  await floorLabel.click();

  // Floor should be checked, backsplash should NOT be checked
  await expect(floorCheckbox).toBeChecked();
  await expect(backsplashCheckbox).not.toBeChecked();
});
