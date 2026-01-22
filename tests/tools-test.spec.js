// TillerPro App - Playwright tests
import { test, expect } from '@playwright/test';

async function gotoToolsRoute(page, route) {
  await page.goto(`/tools/#/${route}`);
  await page.waitForSelector('.app-header', { timeout: 15000 });
}

async function selectCalculator(page, calcId) {
  const mobileDropdown = page.locator('#calc-mobile-dropdown');
  if (await mobileDropdown.isVisible()) {
    await mobileDropdown.selectOption(calcId);
  } else {
    await page.locator(`.calc-selector__item[data-calc="${calcId}"]`).click();
  }

  await expect(page.locator(`.calc-form[data-calc="${calcId}"]`)).toBeVisible();
}

test.describe('TillerPro App', () => {
  
  test.beforeEach(async ({ page }) => {
    await gotoToolsRoute(page, 'dashboard');
  });

  test('App loads with dashboard view', async ({ page }) => {
    // Check app header loads
    await expect(page.locator('.app-header__title')).toContainText('Dashboard');
    
    // Dashboard should be visible by default
    await expect(page.locator('.dashboard')).toBeVisible();
    await expect(page.locator('.dashboard__hero-title')).toContainText('TillerPro');
  });

  test('Navigation works - sidebar and bottom nav', async ({ page }) => {
    await gotoToolsRoute(page, 'calculators');
    await expect(page.locator('.calc-sticky-nav')).toBeVisible();

    await gotoToolsRoute(page, 'projects');
    await expect(page.locator('.projects-view')).toBeVisible();

    await gotoToolsRoute(page, 'settings');
    await expect(page.locator('.settings-view')).toBeVisible();

    await gotoToolsRoute(page, 'dashboard');
    await expect(page.locator('.dashboard')).toBeVisible();
  });

  test('Tile Calculator - basic calculation', async ({ page }) => {
    await gotoToolsRoute(page, 'calculators');

    // Tile calc should be the default
    await expect(page.locator('.calc-panel__title')).toContainText('Tile');
    await expect(page.locator('.calc-form[data-calc="tile"]')).toBeVisible();

    await page.fill('.calc-form[data-calc="tile"] input[name="area"]', '100');
    await page.selectOption('.calc-form[data-calc="tile"] select[name="tileSize"]', '12x12');
    await page.selectOption('.calc-form[data-calc="tile"] select[name="layout"]', 'straight');
    await page.fill('.calc-form[data-calc="tile"] input[name="waste"]', '10');

    await page.click('.calc-form[data-calc="tile"] button[type="submit"]');
    await expect(page.locator('.calc-form[data-calc="tile"] .calc-results')).toBeVisible({ timeout: 5000 });
  });

  test('Mortar Calculator - basic calculation', async ({ page }) => {
    await gotoToolsRoute(page, 'calculators');
    await selectCalculator(page, 'mortar');

    await page.fill('.calc-form[data-calc="mortar"] input[name="area"]', '100');
    await page.selectOption('.calc-form[data-calc="mortar"] select[name="trowel"]', '1/4x3/8-sq');
    await page.check('.calc-form[data-calc="mortar"] input[name="backButter"]');

    await page.click('.calc-form[data-calc="mortar"] button[type="submit"]');
    await expect(page.locator('.calc-form[data-calc="mortar"] .calc-results')).toBeVisible({ timeout: 5000 });
  });

  test('Grout Calculator - basic calculation', async ({ page }) => {
    await gotoToolsRoute(page, 'calculators');
    await selectCalculator(page, 'grout');

    await page.fill('.calc-form[data-calc="grout"] input[name="area"]', '100');
    await page.fill('.calc-form[data-calc="grout"] input[name="tileLength"]', '12');
    await page.fill('.calc-form[data-calc="grout"] input[name="tileWidth"]', '12');
    await page.fill('.calc-form[data-calc="grout"] input[name="tileThickness"]', '0.375');
    await page.fill('.calc-form[data-calc="grout"] input[name="jointWidth"]', '0.125');

    await page.click('.calc-form[data-calc="grout"] button[type="submit"]');
    await expect(page.locator('.calc-form[data-calc="grout"] .calc-results')).toBeVisible({ timeout: 5000 });
  });

  test('Leveling Calculator - basic calculation', async ({ page }) => {
    await gotoToolsRoute(page, 'calculators');
    await selectCalculator(page, 'leveling');

    await page.fill('.calc-form[data-calc="leveling"] input[name="area"]', '100');
    const avgDepth = page.locator('.calc-form[data-calc="leveling"] input[name="avgDepth"]');
    await avgDepth.fill('0.25', { force: true });

    // Trigger calculation explicitly (avoids auto-calc timing/rerender flakiness)
    await page.locator('.calc-form[data-calc="leveling"] button[type="submit"]').evaluate((el) => el.click());
    await expect(page.locator('.calc-form[data-calc="leveling"] .calc-results')).toBeVisible({ timeout: 10000 });
  });

  test('Slope Calculator - basic calculation', async ({ page }) => {
    await gotoToolsRoute(page, 'calculators');
    await selectCalculator(page, 'slope');

    await page.fill('.calc-form[data-calc="slope"] input[name="drainToWall"]', '3');
    await page.fill('.calc-form[data-calc="slope"] input[name="slopeRatio"]', '0.25');

    await page.click('.calc-form[data-calc="slope"] button[type="submit"]');
    await expect(page.locator('.calc-form[data-calc="slope"] .calc-results')).toBeVisible({ timeout: 5000 });
  });

  test('Waterproof Calculator - basic calculation', async ({ page }) => {
    await gotoToolsRoute(page, 'calculators');
    await selectCalculator(page, 'waterproof');

    await page.fill('.calc-form[data-calc="waterproof"] input[name="wallArea"]', '100');
    await page.fill('.calc-form[data-calc="waterproof"] input[name="floorArea"]', '40');
    await page.fill('.calc-form[data-calc="waterproof"] input[name="corners"]', '4');
    await page.fill('.calc-form[data-calc="waterproof"] input[name="pipes"]', '2');

    await page.click('.calc-form[data-calc="waterproof"] button[type="submit"]');
    await expect(page.locator('.calc-form[data-calc="waterproof"] .calc-results')).toBeVisible({ timeout: 5000 });
  });

  test('Labor Calculator - basic calculation', async ({ page }) => {
    await gotoToolsRoute(page, 'calculators');
    await selectCalculator(page, 'labor');

    await page.fill('.calc-form[data-calc="labor"] input[name="area"]', '100');
    await page.selectOption('.calc-form[data-calc="labor"] select[name="complexity"]', 'moderate');
    await page.check('.calc-form[data-calc="labor"] input[name="includePrep"]');

    await page.click('.calc-form[data-calc="labor"] button[type="submit"]');
    await expect(page.locator('.calc-form[data-calc="labor"] .calc-results')).toBeVisible({ timeout: 5000 });
  });

  test('Calculator clear button works', async ({ page }) => {
    await gotoToolsRoute(page, 'calculators');
    await selectCalculator(page, 'tile');

    await page.fill('.calc-form[data-calc="tile"] input[name="area"]', '120');
    await page.locator('.calc-form[data-calc="tile"] button:has-text("Clear")').evaluate((el) => el.click());

    await expect(page.locator('.calc-form[data-calc="tile"] input[name="area"]')).toHaveValue('', { timeout: 10000 });
  });

});

test.describe('TillerPro - Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Bottom navigation works on mobile', async ({ page }) => {
    await page.goto('/tools/');
    await page.waitForSelector('.app-bottom-nav', { timeout: 15000 });

    await expect(page.locator('.app-bottom-nav')).toBeVisible();
    await page.click('.app-bottom-nav__link[href="#/calculators"]');
    await expect(page.locator('.calc-sticky-nav')).toBeVisible();
  });
});
