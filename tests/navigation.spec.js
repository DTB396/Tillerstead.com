// Playwright Navigation Tests - Desktop & Mobile
// Tests all nav links, mobile drawer, dropdowns, and accessibility

import { test, expect } from '@playwright/test';

// URL is managed by Playwright config baseURL
// Tests will use baseURL automatically via page.goto('/')
// Local: http://localhost:4173 (via npm run serve:test)
// CI/Production: set via BASE_URL or PROD_URL environment variables

// Desktop viewport
const DESKTOP_VIEWPORT = { width: 1920, height: 1080 };

// Mobile viewports
const MOBILE_IPHONE_16_PRO_MAX = { width: 430, height: 932 };
const MOBILE_IPHONE_14 = { width: 390, height: 844 };
const MOBILE_ANDROID = { width: 412, height: 915 };

test.describe('Desktop Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/');
  });

  test('should display desktop nav on large screens', async ({ page }) => {
    const desktopNav = page.locator('.desktop-nav');
    await expect(desktopNav).toBeVisible();

    const mobileNav = page.locator('.mobile-nav__toggle');
    await expect(mobileNav).not.toBeVisible();
  });

  test('should have all main nav links visible', async ({ page }) => {
    const mainLinks = [
      { text: 'Services', href: '/services/' },
      { text: 'Our Work', href: '/portfolio/' },
      { text: 'Blog', href: '/blog/' },
      { text: 'Reviews', href: '/reviews/' },
      { text: 'Tools', href: '/tools/' }
    ];

    for (const link of mainLinks) {
      const navLink = page.locator(`.desktop-nav a:has-text("${link.text}")`).first();
      await expect(navLink).toBeVisible();

      // Check href
      const href = await navLink.getAttribute('href');
      expect(href).toContain(link.href);
    }
  });

  test('should open Guides dropdown on hover', async ({ page }) => {
    const guidesButton = page.locator('.desktop-nav button:has-text("Guides")');
    await expect(guidesButton).toBeVisible();

    // Hover to open dropdown
    await guidesButton.hover();

    // Wait for dropdown to appear
    const dropdown = page.locator('.desktop-nav__dropdown').first();
    await expect(dropdown).toBeVisible({ timeout: 2000 });

    // Check dropdown links
    const dropdownLinks = [
      'Build Guide Overview',
      'Codes & Permits',
      'Shower Pans',
      'Waterproofing',
      'Curbless Showers',
      'Benches & Niches',
      'TCNA Standards',
      'Flood Testing'
    ];

    for (const linkText of dropdownLinks) {
      const link = dropdown.locator(`a:has-text("${linkText}")`);
      await expect(link).toBeVisible();
    }
  });

  test('should open About dropdown on hover', async ({ page }) => {
    const aboutButton = page.locator('.desktop-nav button:has-text("About")');
    await expect(aboutButton).toBeVisible();

    await aboutButton.hover();

    const dropdown = page.locator('.desktop-nav__dropdown').nth(1);
    await expect(dropdown).toBeVisible({ timeout: 2000 });

    const dropdownLinks = [
      'Our Story',
      'For Contractors',
      'FAQ',
      'Products We Use'
    ];

    for (const linkText of dropdownLinks) {
      const link = dropdown.locator(`a:has-text("${linkText}")`);
      await expect(link).toBeVisible();
    }
  });

  test('should navigate to Services page', async ({ page }) => {
    await page.click('.desktop-nav a:has-text("Services")');
    await page.waitForURL('**/services/', { timeout: 5000 });
    expect(page.url()).toContain('/services/');
  });

  test('should navigate to Portfolio page', async ({ page }) => {
    await page.click('.desktop-nav a:has-text("Our Work")');
    await page.waitForURL('**/portfolio/', { timeout: 5000 });
    expect(page.url()).toContain('/portfolio/');
  });

  test('should navigate to build guide from dropdown', async ({ page }) => {
    const guidesButton = page.locator('.desktop-nav button:has-text("Guides")');
    await guidesButton.hover();

    await page.waitForTimeout(500); // Wait for dropdown animation

    await page.click('.desktop-nav__dropdown a:has-text("Build Guide Overview")');
    await page.waitForURL('**/build/', { timeout: 5000 });
    expect(page.url()).toContain('/build/');
  });
});

test.describe.skip('Mobile Navigation Tests - iPhone 16 Pro Max - DISABLED', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_IPHONE_16_PRO_MAX);
    await page.goto('/');
  });

  test('should display hamburger menu on mobile', async ({ page }) => {
    const hamburger = page.locator('.mobile-nav__toggle');
    await expect(hamburger).toBeVisible();

    const desktopNav = page.locator('.desktop-nav');
    await expect(desktopNav).not.toBeVisible();
  });

  test('should have proper hamburger icon structure', async ({ page }) => {
    const hamburger = page.locator('.mobile-nav__toggle');
    const lines = hamburger.locator('.hamburger');

    await expect(lines).toHaveCount(3);

    // Check all 3 lines are visible
    for (let i = 0; i < 3; i++) {
      await expect(lines.nth(i)).toBeVisible();
    }
  });

  test('should open mobile nav drawer when hamburger clicked', async ({ page }) => {
    const hamburger = page.locator('.mobile-nav__toggle');
    const drawer = page.locator('.mobile-nav');

    // Initially hidden
    await expect(drawer).toHaveAttribute('aria-hidden', 'true');

    // Click hamburger
    await hamburger.click();

    // Drawer should open
    await expect(drawer).toHaveAttribute('aria-hidden', 'false', { timeout: 2000 });
    await expect(drawer).toBeVisible();
  });

  test('should display all mobile nav links in drawer', async ({ page }) => {
    // Open drawer
    await page.click('.mobile-nav__toggle');
    await page.waitForTimeout(500); // Wait for animation

    const mobileLinks = [
      'SERVICES',
      'OUR WORK',
      'GUIDES',
      'BLOG',
      'REVIEWS',
      'TOOLS',
      'ABOUT',
      'GET ESTIMATE'
    ];

    for (const linkText of mobileLinks) {
      const link = page.locator(`.mobile-nav a:has-text("${linkText}"), .mobile-nav button:has-text("${linkText}")`);
      await expect(link).toBeVisible();
    }
  });

  test('should close mobile nav when X button clicked', async ({ page }) => {
    const hamburger = page.locator('.mobile-nav__toggle');
    const drawer = page.locator('.mobile-nav');
    const closeButton = page.locator('.mobile-nav__close');

    // Open drawer
    await hamburger.click();
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');

    // Click close button
    await closeButton.click();

    // Drawer should close
    await expect(drawer).toHaveAttribute('aria-hidden', 'true', { timeout: 2000 });
  });

  test('should close mobile nav when clicking outside', async ({ page }) => {
    const hamburger = page.locator('.mobile-nav__toggle');
    const drawer = page.locator('.mobile-nav');

    // Open drawer
    await hamburger.click();
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');

    // Click outside (on overlay)
    await page.click('body', { position: { x: 10, y: 100 } });

    // Drawer should close
    await expect(drawer).toHaveAttribute('aria-hidden', 'true', { timeout: 2000 });
  });

  test('should expand GUIDES accordion', async ({ page }) => {
    // Open drawer
    await page.click('.mobile-nav__toggle');
    await page.waitForTimeout(500);

    const guidesButton = page.locator('.mobile-nav button:has-text("GUIDES")');
    await expect(guidesButton).toBeVisible();

    // Initially collapsed
    await expect(guidesButton).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    await guidesButton.click();

    // Should expand
    await expect(guidesButton).toHaveAttribute('aria-expanded', 'true');

    // Submenu should be visible
    const submenu = page.locator('.mobile-nav__submenu').first();
    await expect(submenu).toBeVisible();

    // Check submenu links
    const submenuLinks = [
      'Build Guide Overview',
      'Codes & Permits',
      'Shower Pans',
      'Waterproofing'
    ];

    for (const linkText of submenuLinks) {
      const link = submenu.locator(`a:has-text("${linkText}")`);
      await expect(link).toBeVisible();
    }
  });

  test('should expand ABOUT accordion', async ({ page }) => {
    // Open drawer
    await page.click('.mobile-nav__toggle');
    await page.waitForTimeout(500);

    const aboutButton = page.locator('.mobile-nav button:has-text("ABOUT")');
    await aboutButton.click();

    await expect(aboutButton).toHaveAttribute('aria-expanded', 'true');

    const submenu = page.locator('.mobile-nav__submenu').nth(1);
    await expect(submenu).toBeVisible();

    // Check submenu links
    await expect(submenu.locator('a:has-text("Our Story")')).toBeVisible();
    await expect(submenu.locator('a:has-text("For Contractors")')).toBeVisible();
    await expect(submenu.locator('a:has-text("FAQ")')).toBeVisible();
  });

  test('should navigate to Services from mobile nav', async ({ page }) => {
    // Open drawer
    await page.click('.mobile-nav__toggle');
    await page.waitForTimeout(500);

    // Click Services
    await page.click('.mobile-nav a:has-text("SERVICES")');

    // Should navigate
    await page.waitForURL('**/services/', { timeout: 5000 });
    expect(page.url()).toContain('/services/');
  });

  test('should navigate to Contact from GET ESTIMATE button', async ({ page }) => {
    // Open drawer
    await page.click('.mobile-nav__toggle');
    await page.waitForTimeout(500);

    // Click GET ESTIMATE
    await page.click('.mobile-nav a:has-text("GET ESTIMATE")');

    // Should navigate
    await page.waitForURL('**/contact/', { timeout: 5000 });
    expect(page.url()).toContain('/contact/');
  });

  test('hamburger should animate to X when opened', async ({ page }) => {
    const hamburger = page.locator('.mobile-nav__toggle');

    // Click to open
    await hamburger.click();

    // Check aria-expanded
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');

    // Visual check (hamburger lines should transform)
    const firstLine = hamburger.locator('.hamburger').first();
    const transform = await firstLine.evaluate(el =>
      window.getComputedStyle(el).transform
    );

    // Should have some transform applied
    expect(transform).not.toBe('none');
  });
});

test.describe.skip('Mobile Navigation Tests - Other Devices - DISABLED', () => {
  test('should work on iPhone 14', async ({ page }) => {
    await page.setViewportSize(MOBILE_IPHONE_14);
    await page.goto('/');

    const hamburger = page.locator('.mobile-nav__toggle');
    await expect(hamburger).toBeVisible();

    await hamburger.click();

    const drawer = page.locator('.mobile-nav');
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');
  });

  test('should work on Android device', async ({ page }) => {
    await page.setViewportSize(MOBILE_ANDROID);
    await page.goto('/');

    const hamburger = page.locator('.mobile-nav__toggle');
    await expect(hamburger).toBeVisible();

    await hamburger.click();

    const drawer = page.locator('.mobile-nav');
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');
  });
});

test.describe('Accessibility Tests', () => {
  test('desktop nav should have proper ARIA labels', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/');

    const nav = page.locator('.desktop-nav');
    await expect(nav).toHaveAttribute('aria-label', 'Primary Navigation');
  });

  test('mobile nav toggle should have ARIA label', async ({ page }) => {
    await page.setViewportSize(MOBILE_IPHONE_16_PRO_MAX);
    await page.goto('/');

    const toggle = page.locator('.mobile-nav__toggle');
    await expect(toggle).toHaveAttribute('aria-label', 'Toggle menu');
  });

  test.skip('mobile nav close button should have ARIA label', async ({ page }) => {
    await page.setViewportSize(MOBILE_IPHONE_16_PRO_MAX);
    await page.goto('/');

    await page.click('.mobile-nav__toggle');

    const closeBtn = page.locator('.mobile-nav__close');
    await expect(closeBtn).toHaveAttribute('aria-label', 'Close');
  });

  test('dropdown buttons should have aria-expanded', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/');

    const guidesButton = page.locator('.desktop-nav button:has-text("Guides")');
    await expect(guidesButton).toHaveAttribute('aria-expanded', 'false');

    await expect(guidesButton).toHaveAttribute('aria-haspopup', 'true');
  });

  test('all links should be keyboard accessible', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/');

    // Tab through nav links
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should focus on a nav link
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});

test.describe('Responsive Breakpoint Tests', () => {
  test.skip('should switch from desktop to mobile nav at 768px', async ({ page }) => {
    // Start at desktop
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    let desktopNav = page.locator('.desktop-nav');
    let mobileToggle = page.locator('.mobile-nav__toggle');

    await expect(desktopNav).toBeVisible();
    await expect(mobileToggle).not.toBeVisible();

    // Resize to mobile
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    await expect(desktopNav).not.toBeVisible();
    await expect(mobileToggle).toBeVisible();
  });
});

test.describe('Header Tests', () => {
  test('header should be sticky on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_IPHONE_16_PRO_MAX);
    await page.goto('/');

    const header = page.locator('.ts-header');

    const position = await header.evaluate(el =>
      window.getComputedStyle(el).position
    );

    expect(position).toBe('sticky');
  });

  test('header should display logo and company name', async ({ page }) => {
    await page.setViewportSize(MOBILE_IPHONE_16_PRO_MAX);
    await page.goto('/');

    const logo = page.locator('.ts-header__logo');
    await expect(logo).toBeVisible();

    const company = page.locator('.ts-header__company');
    await expect(company).toBeVisible();
    await expect(company).toHaveText('Tillerstead LLC');
  });
});
