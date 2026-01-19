// Tools page Playwright tests
import { test, expect } from '@playwright/test';

test('Tools page loads and calculators work', async ({ page }) => {
  await page.goto('/tools/');
  
  // Check page loads
  await expect(page.locator('h1')).toContainText('Tile Project Tools');
  
  // Check Tile Calculator works
  await page.fill('#calc-area', '100');
  await page.selectOption('#calc-tile-size', '12x12');
  await page.selectOption('#calc-layout', 'straight');
  await page.click('#calc-tile-btn');
  
  // Results should be visible
  const results = page.locator('#tile-calc-results');
  await expect(results).toBeVisible();
  
  // Check Mortar Calculator
  await page.fill('#mortar-area', '100');
  await page.selectOption('#mortar-tile-size', '12x12');
  await page.click('#calc-mortar-btn');
  const mortarResults = page.locator('#mortar-calc-results');
  await expect(mortarResults).toBeVisible();
  
  // Check Grout Calculator
  await page.fill('#grout-area', '100');
  await page.fill('#grout-tile-length', '12');
  await page.fill('#grout-tile-width', '12');
  await page.click('#calc-grout-btn');
  const groutResults = page.locator('#grout-calc-results');
  await expect(groutResults).toBeVisible();
});
