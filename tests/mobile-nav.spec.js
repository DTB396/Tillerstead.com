import { expect, test } from '@playwright/test';

/**
 * Tillerstead Mobile Navigation Tests
 * DISABLED: Mobile nav drawer intentionally removed for mobile performance
 * Tests skipped until mobile navigation is re-implemented
 */

test.describe.skip('Mobile Navigation Drawer - DISABLED', () => {
  test.beforeEach(async ({ page }) => {
    // Capture browser console output
    page.on('console', (msg) => {
      console.log(`[BROWSER LOG][${msg.type()}]`, msg.text());
    });
    page.on('pageerror', (error) => {
      console.error('[BROWSER ERROR]', error);
    });
    page.on('requestfailed', (request) => {
      console.error('[REQUEST FAILED]', request.url(), request.failure());
    });

    // Set mobile viewport BEFORE navigation to ensure mobile nav is visible
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
  });

  test('should open drawer when hamburger clicked', async ({ page }) => {
    const toggle = page.locator('.mobile-nav__toggle');
    const drawer = page.locator('#mobile-nav-drawer');

    // Hamburger should be visible on mobile
    await expect(toggle).toBeVisible();

    // Drawer should be closed initially (aria-hidden="true")
    await expect(drawer).toHaveAttribute('aria-hidden', 'true');

    // Click hamburger
    await toggle.click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Drawer should be open (aria-hidden="false")
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');

    // Verify drawer is visible
    await expect(drawer).toBeVisible();
  });

  test('should show backdrop when drawer opens', async ({ page }) => {
    const toggle = page.locator('.mobile-nav__toggle');
    const drawer = page.locator('#mobile-nav-drawer');

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);

    // Drawer should be visible and act as its own backdrop
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');

    // Body should have nav-open class for scroll lock
    const hasNavOpen = await page.evaluate(() => document.body.classList.contains('nav-open'));
    expect(hasNavOpen).toBe(true);
  });

  test('should close drawer when backdrop clicked', async ({ page }) => {
    const toggle = page.locator('.mobile-nav__toggle');
    const drawer = page.locator('#mobile-nav-drawer');
    const navBody = page.locator('.mobile-nav__body');

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');

    // Get dimensions to check if backdrop exists
    const viewport = page.viewportSize();
    const navBodyBox = await navBody.boundingBox();

    // On very small phones (≤480px), nav body is 100% width - no backdrop area to click
    // In this case, verify close via escape works instead
    if (viewport && navBodyBox && navBodyBox.width >= viewport.width - 20) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      await expect(drawer).toHaveAttribute('aria-hidden', 'true');
      return;
    }

    // Click on the backdrop area (left of the nav body)
    const drawerBox = await drawer.boundingBox();
    if (drawerBox && navBodyBox) {
      // Click to the left of the nav body (the backdrop/overlay area)
      const clickX = Math.max(10, navBodyBox.x - 30);
      const clickY = drawerBox.y + drawerBox.height / 2;
      await page.mouse.click(clickX, clickY);
    }
    await page.waitForTimeout(700);

    // Drawer should be closed
    await expect(drawer).toHaveAttribute('aria-hidden', 'true');
  });

  test('should close drawer when X button clicked', async ({ page }) => {
    const toggle = page.locator('.mobile-nav__toggle');
    const closeBtn = page.locator('.mobile-nav__close');
    const drawer = page.locator('#mobile-nav-drawer');

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');

    // Click close button using force to bypass overlay issues
    await closeBtn.click({ force: true });
    await page.waitForTimeout(500);

    // Drawer should be closed
    await expect(drawer).toHaveAttribute('aria-hidden', 'true');
  });

  test('should close drawer when ESC key pressed', async ({ page }) => {
    const toggle = page.locator('.mobile-nav__toggle');
    const drawer = page.locator('#mobile-nav-drawer');

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');

    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Drawer should be closed
    await expect(drawer).toHaveAttribute('aria-hidden', 'true');
  });

  test('should display correct menu items', async ({ page }) => {
    const toggle = page.locator('.mobile-nav__toggle');
    const drawer = page.locator('#mobile-nav-drawer');

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);

    // Check for expected menu items (matching navigation.yml)
    // Note: Items are uppercased in the template
    const expectedItems = [
      'SERVICES',
      'OUR WORK',
      'GUIDES',
      'REVIEWS',
      'ABOUT',
      'GET ESTIMATE',
    ];

    for (const item of expectedItems) {
      const link = drawer.locator('.mobile-nav__link, .mobile-nav__accordion-trigger', { hasText: item });
      await expect(link.first()).toBeVisible();
    }
  });

  test('should display CTA buttons', async ({ page }) => {
    const toggle = page.locator('.mobile-nav__toggle');
    const drawer = page.locator('#mobile-nav-drawer');

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);

    // Check for estimate button
    const estimateBtn = drawer.locator('.mobile-nav__estimate-btn');
    await expect(estimateBtn).toBeVisible();
    await expect(estimateBtn).toContainText('Get an Estimate');

    // Check for trust signal (license number)
    const trustSignal = drawer.locator('.mobile-nav__license');
    await expect(trustSignal).toBeVisible();
    await expect(trustSignal).toContainText('NJ HIC');
  });

  test('should display "For Contractors" link after "Get an Estimate"', async ({ page }) => {
    const toggle = page.locator('.mobile-nav__toggle');
    const drawer = page.locator('#mobile-nav-drawer');

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);

    // Check for "For Contractors" link
    const contractorsLink = drawer.locator('.mobile-nav__link', { hasText: 'FOR CONTRACTORS' });
    await expect(contractorsLink).toBeVisible();
    await expect(contractorsLink).toHaveAttribute('href', '/for-general-contractors/');
  });

  test('should lock body scroll when drawer is open', async ({ page }) => {
    const toggle = page.locator('.mobile-nav__toggle');

    // Get initial body overflow
    const initialOverflow = await page.evaluate(() => {
      return document.body.classList.contains('nav-open');
    });
    expect(initialOverflow).toBe(false);

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);

    // Body should have nav-open class
    const openOverflow = await page.evaluate(() => {
      return document.body.classList.contains('nav-open');
    });
    expect(openOverflow).toBe(true);

    // Close drawer
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Body should not have nav-open class
    const closedOverflow = await page.evaluate(() => {
      return document.body.classList.contains('nav-open');
    });
    expect(closedOverflow).toBe(false);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    const toggle = page.locator('.mobile-nav__toggle');
    const drawer = page.locator('#mobile-nav-drawer');

    // Initial ARIA state
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('aria-label', 'Open navigation menu');
    await expect(drawer).toHaveAttribute('aria-hidden', 'true');
    await expect(drawer).toHaveAttribute('role', 'dialog');
    await expect(drawer).toHaveAttribute('aria-modal', 'true');

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);

    // Updated ARIA state
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');
  });

  test('should be keyboard navigable', async ({ page }) => {
    const toggle = page.locator('.mobile-nav__toggle');
    const drawer = page.locator('#mobile-nav-drawer');

    // Focus the toggle button
    await toggle.focus();

    // Verify toggle is focused
    const isFocused = await toggle.evaluate((el) => document.activeElement === el);
    expect(isFocused).toBe(true);

    // Open with keyboard (Enter or Space)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Drawer should be open
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');

    // Press Tab to navigate into the drawer
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Verify focus is now inside the drawer (on any focusable element)
    const focusInDrawer = await page.evaluate(() => {
      const drawer = document.getElementById('mobile-nav-drawer');
      return drawer && drawer.contains(document.activeElement);
    });
    expect(focusInDrawer).toBe(true);

    // Test ESC closes the drawer
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(drawer).toHaveAttribute('aria-hidden', 'true');
  });
});
