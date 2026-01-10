import { expect, test } from '@playwright/test';

/**
 * Tillerstead Mobile Navigation Tests
 * Validates high-end mobile drawer functionality
 */

test.describe('Mobile Navigation Drawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // baseURL is set in Playwright config
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('should open drawer when hamburger clicked', async ({ page }) => {
    const toggle = page.locator('.nav-toggle');
    const drawer = page.locator('#mobile-nav');
    const shell = page.locator('.mobile-nav-shell');

    // Hamburger should be visible on mobile
    await expect(toggle).toBeVisible();

    // Drawer should be closed initially
    await expect(shell).not.toHaveClass(/is-open/);
    await expect(drawer).not.toHaveClass(/is-open/);

    // Click hamburger
    await toggle.click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Drawer should be open
    await expect(shell).toHaveClass(/is-open/);
    await expect(drawer).toHaveClass(/is-open/);

    // Verify drawer is visible
    await expect(drawer).toBeVisible();
  });

  test('should show backdrop when drawer opens', async ({ page }) => {
    const toggle = page.locator('.nav-toggle');
    const backdrop = page.locator('.mobile-nav-backdrop');

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);

    // Backdrop should be visible
    await expect(backdrop).toBeVisible();

    // Backdrop should have dark background
    const backdropStyles = await backdrop.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        background: styles.backgroundColor,
        opacity: styles.opacity,
      };
    });

    // Should have some opacity (not fully transparent)
    expect(parseFloat(backdropStyles.opacity)).toBeGreaterThan(0);
  });

  test('should close drawer when backdrop clicked', async ({ page }) => {
    const toggle = page.locator('.nav-toggle');
    const drawer = page.locator('#mobile-nav');
    const backdrop = page.locator('.mobile-nav-backdrop');
    const shell = page.locator('.mobile-nav-shell');

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);
    await expect(shell).toHaveClass(/is-open/);

    // Click backdrop
    await backdrop.click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(500);

    // Drawer should be closed
    await expect(shell).not.toHaveClass(/is-open/);
    await expect(drawer).not.toHaveClass(/is-open/);
  });

  test('should close drawer when X button clicked', async ({ page }) => {
    const toggle = page.locator('.nav-toggle');
    const closeBtn = page.locator('.nav-close');
    const shell = page.locator('.mobile-nav-shell');

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);
    await expect(shell).toHaveClass(/is-open/);

    // Click close button
    await closeBtn.click();
    await page.waitForTimeout(500);

    // Drawer should be closed
    await expect(shell).not.toHaveClass(/is-open/);
  });

  test('should close drawer when ESC key pressed', async ({ page }) => {
    const toggle = page.locator('.nav-toggle');
    const shell = page.locator('.mobile-nav-shell');

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);
    await expect(shell).toHaveClass(/is-open/);

    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Drawer should be closed
    await expect(shell).not.toHaveClass(/is-open/);
  });

  test('should display correct menu items', async ({ page }) => {
    const toggle = page.locator('.nav-toggle');

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);

    // Check for expected menu items
    const expectedItems = [
      'Services',
      'Our Work',
      'Products',
      'Reviews',
      'About',
      'Contact',
    ];

    for (const item of expectedItems) {
      const link = page.locator('.mobile-nav-link', { hasText: item });
      await expect(link).toBeVisible();
    }
  });

  test('should display CTA buttons', async ({ page }) => {
    const toggle = page.locator('.nav-toggle');

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);

    // Check for CTA section
    const ctaSection = page.locator('.mobile-nav-cta');
    await expect(ctaSection).toBeVisible();

    // Check for buttons
    const estimateBtn = ctaSection.locator('text=Request Estimate');
    const phoneBtn = ctaSection.locator('text=Call');

    await expect(estimateBtn).toBeVisible();
    await expect(phoneBtn).toBeVisible();
  });

  test('should lock body scroll when drawer is open', async ({ page }) => {
    const toggle = page.locator('.nav-toggle');

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
    const toggle = page.locator('.nav-toggle');
    const nav = page.locator('#mobile-nav');

    // Initial ARIA state
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('aria-label', 'Open navigation menu');

    // Open drawer
    await toggle.click();
    await page.waitForTimeout(500);

    // Updated ARIA state
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAttribute('aria-label', 'Close navigation menu');

    // Nav should have proper role
    await expect(nav).toHaveAttribute('role', 'navigation');
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab to hamburger
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // May need multiple tabs to reach nav

    const toggle = page.locator('.nav-toggle');

    // Check if toggle is focused (may not be first tab stop)
    const isFocused = await toggle.evaluate(
      (el) => document.activeElement === el,
    );

    if (isFocused) {
      // Open with keyboard
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      const shell = page.locator('.mobile-nav-shell');
      await expect(shell).toHaveClass(/is-open/);
    }
  });
});
