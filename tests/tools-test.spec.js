// TillerCalc Pro App - Playwright tests
import { test, expect } from '@playwright/test';

test.describe('TillerCalc Pro App', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/');
    // Wait for app to initialize
    await page.waitForSelector('.app-header', { timeout: 15000 });
  });

  test('App loads with dashboard view', async ({ page }) => {
    // Check app header loads
    await expect(page.locator('.app-header__title')).toContainText('Dashboard');
    
    // Dashboard should be visible by default
    await expect(page.locator('.dashboard')).toBeVisible();
    await expect(page.locator('.dashboard__welcome-title')).toContainText('Welcome');
  });

  test('Navigation works - sidebar and bottom nav', async ({ page }) => {
    // Click calculators in sidebar
    await page.click('.app-nav__link[href="#/calculators"]');
    await expect(page.locator('.calc-tabs')).toBeVisible();
    
    // Click projects
    await page.click('.app-nav__link[href="#/projects"]');
    await expect(page.locator('.projects-view')).toBeVisible();
    
    // Click settings
    await page.click('.app-nav__link[href="#/settings"]');
    await expect(page.locator('.settings-view')).toBeVisible();
    
    // Back to dashboard
    await page.click('.app-nav__link[href="#/dashboard"]');
    await expect(page.locator('.dashboard')).toBeVisible();
  });

  test('Tile Calculator - basic calculation', async ({ page }) => {
    // Navigate to calculators
    await page.click('.app-nav__link[href="#/calculators"]');
    
    // Tile calc should be active by default
    await expect(page.locator('.calc-tab.is-active')).toContainText('Tile');
    
    // Fill in the form
    await page.fill('input[name="length"]', '10');
    await page.fill('input[name="width"]', '10');
    await page.selectOption('select[name="tileSize"]', '12x12');
    await page.selectOption('select[name="layout"]', 'straight');
    await page.fill('input[name="waste"]', '10');
    
    // Submit
    await page.click('.calc-form button[type="submit"]');
    
    // Check results appear
    await expect(page.locator('.calc-results')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.calc-result__value').first()).toBeVisible();
  });

  test('Mortar Calculator - basic calculation', async ({ page }) => {
    await page.click('.app-nav__link[href="#/calculators"]');
    
    // Click mortar tab
    await page.click('.calc-tab:has-text("Mortar")');
    await page.waitForSelector('.calc-panel[data-calc="mortar"].is-active');
    
    // Fill form
    await page.fill('.calc-panel[data-calc="mortar"] input[name="area"]', '100');
    await page.selectOption('.calc-panel[data-calc="mortar"] select[name="tileSize"]', '12x12');
    await page.selectOption('.calc-panel[data-calc="mortar"] select[name="mortarType"]', 'large-format');
    
    // Submit
    await page.click('.calc-form[data-calc="mortar"] button[type="submit"]');
    
    // Check results
    await expect(page.locator('.calc-panel[data-calc="mortar"] .calc-results')).toBeVisible({ timeout: 5000 });
  });

  test('Grout Calculator - basic calculation', async ({ page }) => {
    await page.click('.app-nav__link[href="#/calculators"]');
    
    // Click grout tab
    await page.click('.calc-tab:has-text("Grout")');
    await page.waitForSelector('.calc-panel[data-calc="grout"].is-active');
    
    // Fill form
    await page.fill('.calc-panel[data-calc="grout"] input[name="area"]', '100');
    await page.fill('.calc-panel[data-calc="grout"] input[name="tileLength"]', '12');
    await page.fill('.calc-panel[data-calc="grout"] input[name="tileWidth"]', '12');
    await page.fill('.calc-panel[data-calc="grout"] input[name="jointWidth"]', '0.125');
    await page.fill('.calc-panel[data-calc="grout"] input[name="jointDepth"]', '0.375');
    
    // Submit
    await page.click('.calc-form[data-calc="grout"] button[type="submit"]');
    
    // Check results
    await expect(page.locator('.calc-panel[data-calc="grout"] .calc-results')).toBeVisible({ timeout: 5000 });
  });

  test('Leveling Calculator - basic calculation', async ({ page }) => {
    await page.click('.app-nav__link[href="#/calculators"]');
    
    // Click leveling tab
    await page.click('.calc-tab:has-text("Leveling")');
    await page.waitForSelector('.calc-panel[data-calc="leveling"].is-active');
    
    // Fill form
    await page.fill('.calc-panel[data-calc="leveling"] input[name="area"]', '100');
    await page.fill('.calc-panel[data-calc="leveling"] input[name="avgDepth"]', '0.25');
    await page.selectOption('.calc-panel[data-calc="leveling"] select[name="productType"]', 'self-leveling');
    
    // Submit
    await page.click('.calc-form[data-calc="leveling"] button[type="submit"]');
    
    // Check results
    await expect(page.locator('.calc-panel[data-calc="leveling"] .calc-results')).toBeVisible({ timeout: 5000 });
  });

  test('Slope Calculator - basic calculation', async ({ page }) => {
    await page.click('.app-nav__link[href="#/calculators"]');
    
    // Click slope tab
    await page.click('.calc-tab:has-text("Slope")');
    await page.waitForSelector('.calc-panel[data-calc="slope"].is-active');
    
    // Fill form
    await page.fill('.calc-panel[data-calc="slope"] input[name="length"]', '48');
    await page.fill('.calc-panel[data-calc="slope"] input[name="width"]', '36');
    await page.selectOption('.calc-panel[data-calc="slope"] select[name="drainPosition"]', 'center');
    await page.fill('.calc-panel[data-calc="slope"] input[name="slopeRatio"]', '0.25');
    
    // Submit
    await page.click('.calc-form[data-calc="slope"] button[type="submit"]');
    
    // Check results
    await expect(page.locator('.calc-panel[data-calc="slope"] .calc-results')).toBeVisible({ timeout: 5000 });
  });

  test('Waterproof Calculator - basic calculation', async ({ page }) => {
    await page.click('.app-nav__link[href="#/calculators"]');
    
    // Click waterproof tab
    await page.click('.calc-tab:has-text("Waterproof")');
    await page.waitForSelector('.calc-panel[data-calc="waterproof"].is-active');
    
    // Fill form
    await page.fill('.calc-panel[data-calc="waterproof"] input[name="wallArea"]', '100');
    await page.fill('.calc-panel[data-calc="waterproof"] input[name="floorArea"]', '40');
    await page.fill('.calc-panel[data-calc="waterproof"] input[name="corners"]', '4');
    await page.fill('.calc-panel[data-calc="waterproof"] input[name="penetrations"]', '2');
    
    // Submit
    await page.click('.calc-form[data-calc="waterproof"] button[type="submit"]');
    
    // Check results
    await expect(page.locator('.calc-panel[data-calc="waterproof"] .calc-results')).toBeVisible({ timeout: 5000 });
  });

  test('Labor Calculator - basic calculation', async ({ page }) => {
    await page.click('.app-nav__link[href="#/calculators"]');
    
    // Click labor tab
    await page.click('.calc-tab:has-text("Labor")');
    await page.waitForSelector('.calc-panel[data-calc="labor"].is-active');
    
    // Fill form
    await page.fill('.calc-panel[data-calc="labor"] input[name="area"]', '100');
    await page.selectOption('.calc-panel[data-calc="labor"] select[name="tileSize"]', '12x12');
    await page.selectOption('.calc-panel[data-calc="labor"] select[name="complexity"]', 'standard');
    await page.fill('.calc-panel[data-calc="labor"] input[name="hourlyRate"]', '75');
    
    // Submit
    await page.click('.calc-form[data-calc="labor"] button[type="submit"]');
    
    // Check results
    await expect(page.locator('.calc-panel[data-calc="labor"] .calc-results')).toBeVisible({ timeout: 5000 });
  });

  test('Calculator clear button works', async ({ page }) => {
    await page.click('.app-nav__link[href="#/calculators"]');
    
    // Fill form
    await page.fill('input[name="length"]', '20');
    await page.fill('input[name="width"]', '15');
    
    // Click clear
    await page.click('button:has-text("Clear")');
    
    // Fields should be cleared
    const lengthValue = await page.inputValue('input[name="length"]');
    expect(lengthValue).toBe('');
  });

});

test.describe('TillerCalc Pro - Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Bottom navigation works on mobile', async ({ page }) => {
    await page.goto('/tools/');
    await page.waitForSelector('.bottom-nav', { timeout: 15000 });
    
    // Bottom nav should be visible
    await expect(page.locator('.bottom-nav')).toBeVisible();
    
    // Click calculators via bottom nav
    await page.click('.bottom-nav__link[href="#/calculators"]');
    await expect(page.locator('.calc-tabs')).toBeVisible();
  });
});
