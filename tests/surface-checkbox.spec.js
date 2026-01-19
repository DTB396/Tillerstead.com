import { test, expect } from '@playwright/test';

test('Surface checkboxes work independently', async ({ page }) => {
  await page.goto('/tools/');
  
  // Wait for room card to be created
  await page.waitForSelector('.room-card');
  
  // Click the Floor label (not the hidden checkbox)
  const floorLabel = page.locator('.surface-toggle').filter({ hasText: 'Floor' });
  const backsplashLabel = page.locator('.surface-toggle').filter({ hasText: 'Backsplash' });
  
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
