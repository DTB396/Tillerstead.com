// Document Export Playwright Tests
// Tests the branded Word document export functionality
import { test, expect } from '@playwright/test';

test.describe.skip('TillerPro Document Export - DISABLED (page not built)', () => {

  const EXPORT_URL = '/tools/legacy/';

  const ensureRoomSurfaceChecked = async (roomCard, surface) => {
    const surfaceLabelById = {
      floor: 'Floor',
      'full-walls': 'Full Walls',
      'shower-walls': 'Shower Walls',
      'tub-surround': 'Tub Surround',
      backsplash: 'Backsplash',
    };

    const labelText = surfaceLabelById[surface] ?? surface;

    // Best practice: click the same visible element a user would.
    // The <input> is visually clipped; the <span.surface-toggle__label> is the clickable surface.
    const toggle = roomCard.locator('label.surface-toggle').filter({ hasText: labelText }).first();
    const input = toggle.locator(`input.surface-checkbox[data-surface="${surface}"]`);
    const clickTarget = toggle.locator('.surface-toggle__label');

    await expect(clickTarget).toBeVisible();
    await clickTarget.scrollIntoViewIfNeeded();

    if (!(await input.isChecked())) {
      await clickTarget.click();
    }

    await expect(input).toBeChecked();
  };

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to start fresh
    await page.goto(EXPORT_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Wait for the legacy tools app to initialize and render a default room.
    await expect(page.locator('.room-card').first()).toBeVisible();
  });

  test('export requires project name', async ({ page }) => {
    await page.goto(EXPORT_URL);

    // Try to generate output without filling anything
    await page.click('#generate-output-btn');

    // Should show error toast
    const toast = page.locator('.toast.toast--error');
    await expect(toast).toBeVisible({ timeout: 3000 });
    await expect(toast).toContainText('Cannot generate');
    await expect(toast).toContainText('Project');

    // Preview should NOT be visible
    const preview = page.locator('#output-preview');
    await expect(preview).toBeHidden();
  });

  test('export requires room with surface selected', async ({ page }) => {
    await page.goto(EXPORT_URL);

    // Fill project name
    await page.fill('#project-name', 'Test Bathroom Project');
    await page.locator('#project-name').blur();

    // Fill room name
    const roomCard = page.locator('.room-card').first();
    await roomCard.locator('.room-name-input').fill('Main Bathroom');
    await roomCard.locator('.room-name-input').blur();

    // Try to generate without selecting a surface
    await page.click('#generate-output-btn');

    // Should show error about surfaces
    const toast = page.locator('.toast.toast--error');
    await expect(toast).toBeVisible({ timeout: 3000 });
    await expect(toast).toContainText('Cannot generate');
    await expect(toast).toContainText('surface');
  });

  test('export generates preview with valid data', async ({ page }) => {
    await page.goto(EXPORT_URL);

    // Fill project information
    await page.fill('#project-name', 'Master Bathroom Renovation');
    await page.locator('#project-name').blur();
    await page.fill('#client-name', 'John Smith');
    await page.locator('#client-name').blur();

    // Fill room details
    const roomCard = page.locator('.room-card').first();
    await roomCard.locator('.room-name-input').fill('Master Bath');
    await roomCard.locator('.room-name-input').blur();
    await roomCard.locator('.room-length-ft').fill('12');
    await roomCard.locator('.room-width-ft').fill('10');

    // Select floor surface (click the visible toggle, not the hidden input)
    await ensureRoomSurfaceChecked(roomCard, 'floor');

    // Wait for state/area calculation (input handler is debounced)
    await expect(page.locator('#total-area')).toContainText('120', { timeout: 8000 });

    // Generate output
    await page.click('#generate-output-btn');

    // Preview should be visible
    const preview = page.locator('#output-preview');
    await expect(preview).toBeVisible({ timeout: 5000 });

    // Should show project name in preview
    await expect(preview).toContainText('Master Bathroom Renovation');

    // Should show room measurements
    await expect(preview).toContainText('Master Bath');

    // Should show calculated area (12 × 10 = 120 sf)
    await expect(preview).toContainText('120');
  });

  test('Word document download works', async ({ page }) => {
    await page.goto(EXPORT_URL);

    // Set up valid project data
    await page.fill('#project-name', 'Kitchen Backsplash');
    await page.locator('#project-name').blur();

    const roomCard = page.locator('.room-card').first();
    await roomCard.locator('.room-name-input').fill('Kitchen');
    await roomCard.locator('.room-name-input').blur();
    await roomCard.locator('.room-length-ft').fill('8');
    await roomCard.locator('.room-width-ft').fill('6');
    await ensureRoomSurfaceChecked(roomCard, 'floor');

    await expect(page.locator('#total-area')).not.toHaveText('0', { timeout: 8000 });

    // Generate preview first
    await page.click('#generate-output-btn');
    await expect(page.locator('#output-preview')).toBeVisible({ timeout: 5000 });

    // Set up download listener BEFORE clicking
    const downloadPromise = page.waitForEvent('download');

    // Click download button
    await page.click('#download-doc-btn');

    // Wait for download
    const download = await downloadPromise;

    // Verify filename
    expect(download.suggestedFilename()).toContain('.doc');
    expect(download.suggestedFilename()).toContain('Kitchen-Backsplash');
  });

  test('total area calculation is correct for multiple surfaces', async ({ page }) => {
    await page.goto(EXPORT_URL);

    // Set up project
    await page.fill('#project-name', 'Multi-Surface Test');
    await page.locator('#project-name').blur();

    const roomCard = page.locator('.room-card').first();
    await roomCard.locator('.room-name-input').fill('Bathroom');
    await roomCard.locator('.room-name-input').blur();
    await roomCard.locator('.room-length-ft').fill('10');
    await roomCard.locator('.room-width-ft').fill('8');
    await roomCard.locator('.room-height-ft').fill('8');

    // Select floor (10 × 8 = 80 sf)
    await ensureRoomSurfaceChecked(roomCard, 'floor');

    // Check total area display
    const totalArea = page.locator('#total-area');
    await expect(totalArea).toContainText('80', { timeout: 8000 });

    // Generate output
    await page.click('#generate-output-btn');
    const preview = page.locator('#output-preview');
    await expect(preview).toBeVisible({ timeout: 5000 });

    // Verify area appears in preview
    await expect(preview).toContainText('80');
  });

  test('print functionality opens print dialog', async ({ page }) => {
    await page.goto(EXPORT_URL);

    // Set up minimal valid data
    await page.fill('#project-name', 'Print Test');
    await page.locator('#project-name').blur();

    const roomCard = page.locator('.room-card').first();
    await roomCard.locator('.room-name-input').fill('Room 1');
    await roomCard.locator('.room-name-input').blur();
    await roomCard.locator('.room-length-ft').fill('10');
    await roomCard.locator('.room-width-ft').fill('10');
    await ensureRoomSurfaceChecked(roomCard, 'floor');

    await expect(page.locator('#total-area')).not.toHaveText('0', { timeout: 8000 });

    // Generate preview
    await page.click('#generate-output-btn');
    await expect(page.locator('#output-preview')).toBeVisible({ timeout: 5000 });

    // Listen for popup (print window)
    const popupPromise = page.waitForEvent('popup');

    // Click print
    await page.click('#print-output-btn');

    // Popup should open
    const popup = await popupPromise;

    // Popup should contain the document content
    await expect(popup.locator('body')).toContainText('Tillerstead');
    await expect(popup.locator('body')).toContainText('Print Test');
  });

  test('copy output to clipboard works', async ({ page, context }) => {
    // Avoid browser-specific permission names; this test only asserts UI feedback.
    await context.grantPermissions(['clipboard-read']);

    await page.goto(EXPORT_URL);

    // Set up valid data
    await page.fill('#project-name', 'Clipboard Test');
    await page.locator('#project-name').blur();

    const roomCard = page.locator('.room-card').first();
    await roomCard.locator('.room-name-input').fill('Test Room');
    await roomCard.locator('.room-name-input').blur();
    await roomCard.locator('.room-length-ft').fill('10');
    await roomCard.locator('.room-width-ft').fill('10');
    await ensureRoomSurfaceChecked(roomCard, 'floor');

    await expect(page.locator('#total-area')).not.toHaveText('0', { timeout: 8000 });

    // Generate preview
    await page.click('#generate-output-btn');
    await expect(page.locator('#output-preview')).toBeVisible({ timeout: 5000 });

    // Click copy
    await page.click('#copy-output-btn');

    // Should show success toast
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible({ timeout: 3000 });
    await expect(toast).toContainText('Copied');
  });

  test('branded document contains Tillerstead branding', async ({ page }) => {
    await page.goto(EXPORT_URL);

    // Set up valid data
    await page.fill('#project-name', 'Branding Test');
    await page.locator('#project-name').blur();

    const roomCard = page.locator('.room-card').first();
    await roomCard.locator('.room-name-input').fill('Room');
    await roomCard.locator('.room-name-input').blur();
    await roomCard.locator('.room-length-ft').fill('10');
    await roomCard.locator('.room-width-ft').fill('10');
    await ensureRoomSurfaceChecked(roomCard, 'floor');

    await expect(page.locator('#total-area')).not.toHaveText('0', { timeout: 8000 });

    // Generate preview
    await page.click('#generate-output-btn');
    const preview = page.locator('#output-preview');
    await expect(preview).toBeVisible({ timeout: 5000 });

    // Check for branding elements
    await expect(preview).toContainText('TillerPro');
    await expect(preview).toContainText('Tillerstead');
    await expect(preview).toContainText('NJ HIC');
  });

  test('text file download works', async ({ page }) => {
    await page.goto(EXPORT_URL);

    // Set up valid data
    await page.fill('#project-name', 'TXT Export Test');
    await page.locator('#project-name').blur();

    const roomCard = page.locator('.room-card').first();
    await roomCard.locator('.room-name-input').fill('Room');
    await roomCard.locator('.room-name-input').blur();
    await roomCard.locator('.room-length-ft').fill('10');
    await roomCard.locator('.room-width-ft').fill('10');
    await ensureRoomSurfaceChecked(roomCard, 'floor');

    await expect(page.locator('#total-area')).not.toHaveText('0', { timeout: 8000 });

    // Generate preview
    await page.click('#generate-output-btn');
    await expect(page.locator('#output-preview')).toBeVisible({ timeout: 5000 });

    // Some headless Chromium runs don't surface text downloads as Playwright "download" events.
    // Accept either a real download event OR the in-app download hook.
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    const hookPromise = page
      .waitForFunction(
        () => (document.documentElement?.dataset?.tillersteadLastDownload || '').includes('.txt'),
        null,
        { timeout: 5000 }
      )
      .catch(() => null);

    await page.click('#download-txt-btn');

    const download = await Promise.race([downloadPromise, hookPromise]);

    if (download && typeof download.suggestedFilename === 'function') {
      expect(download.suggestedFilename()).toContain('.txt');
    } else {
      const last = await page.evaluate(() => document.documentElement?.dataset?.tillersteadLastDownload);
      expect(last || '').toContain('.txt');
    }
  });

});
