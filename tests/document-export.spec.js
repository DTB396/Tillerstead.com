// Document Export Playwright Tests
// Tests the branded Word document export functionality
import { test, expect } from '@playwright/test';

test.describe('TillerPro Document Export', () => {
  
  const EXPORT_URL = '/tools/legacy/';

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to start fresh
    await page.goto(EXPORT_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
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
    await page.locator('#project-name').dispatchEvent('change');
    
    // Add a room
    await page.click('#add-room-btn');
    
    // Fill room name
    await page.fill('.room-name-input', 'Main Bathroom');
    await page.locator('.room-name-input').dispatchEvent('change');
    
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
    await page.locator('#project-name').dispatchEvent('change');
    await page.fill('#client-name', 'John Smith');
    await page.locator('#client-name').dispatchEvent('change');
    
    // Add a room
    await page.click('#add-room-btn');
    
    // Fill room details
    const roomCard = page.locator('.room-card').first();
    await roomCard.locator('.room-name-input').fill('Master Bath');
    await roomCard.locator('.room-name-input').dispatchEvent('change');
    await roomCard.locator('.room-length-ft').fill('12');
    await roomCard.locator('.room-length-ft').dispatchEvent('input');
    await roomCard.locator('.room-width-ft').fill('10');
    await roomCard.locator('.room-width-ft').dispatchEvent('input');
    
    // Select floor surface
    await roomCard.locator('[data-surface="floor"]').check();
    await roomCard.locator('[data-surface="floor"]').dispatchEvent('change');
    
    // Wait for state/area calculation
    await page.waitForTimeout(500);
    
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
    await page.locator('#project-name').dispatchEvent('change');
    await page.click('#add-room-btn');
    
    const roomCard = page.locator('.room-card').first();
    await roomCard.locator('.room-name-input').fill('Kitchen');
    await roomCard.locator('.room-name-input').dispatchEvent('change');
    await roomCard.locator('.room-length-ft').fill('8');
    await roomCard.locator('.room-length-ft').dispatchEvent('input');
    await roomCard.locator('.room-width-ft').fill('6');
    await roomCard.locator('.room-width-ft').dispatchEvent('input');
    await roomCard.locator('[data-surface="floor"]').check();
    await roomCard.locator('[data-surface="floor"]').dispatchEvent('change');
    
    await page.waitForTimeout(500);
    
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
    await page.locator('#project-name').dispatchEvent('change');
    await page.click('#add-room-btn');
    
    const roomCard = page.locator('.room-card').first();
    await roomCard.locator('.room-name-input').fill('Bathroom');
    await roomCard.locator('.room-name-input').dispatchEvent('change');
    await roomCard.locator('.room-length-ft').fill('10');
    await roomCard.locator('.room-length-ft').dispatchEvent('input');
    await roomCard.locator('.room-width-ft').fill('8');
    await roomCard.locator('.room-width-ft').dispatchEvent('input');
    await roomCard.locator('.room-height-ft').fill('8');
    await roomCard.locator('.room-height-ft').dispatchEvent('input');
    
    // Select floor (10 × 8 = 80 sf)
    await roomCard.locator('[data-surface="floor"]').check();
    await roomCard.locator('[data-surface="floor"]').dispatchEvent('change');
    await page.waitForTimeout(300);
    
    // Check total area display
    const totalArea = page.locator('#total-area');
    await expect(totalArea).toContainText('80');
    
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
    await page.locator('#project-name').dispatchEvent('change');
    await page.click('#add-room-btn');
    
    const roomCard = page.locator('.room-card').first();
    await roomCard.locator('.room-name-input').fill('Room 1');
    await roomCard.locator('.room-name-input').dispatchEvent('change');
    await roomCard.locator('.room-length-ft').fill('10');
    await roomCard.locator('.room-length-ft').dispatchEvent('input');
    await roomCard.locator('.room-width-ft').fill('10');
    await roomCard.locator('.room-width-ft').dispatchEvent('input');
    await roomCard.locator('[data-surface="floor"]').check();
    await roomCard.locator('[data-surface="floor"]').dispatchEvent('change');
    
    await page.waitForTimeout(500);
    
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
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.goto(EXPORT_URL);
    
    // Set up valid data
    await page.fill('#project-name', 'Clipboard Test');
    await page.locator('#project-name').dispatchEvent('change');
    await page.click('#add-room-btn');
    
    const roomCard = page.locator('.room-card').first();
    await roomCard.locator('.room-name-input').fill('Test Room');
    await roomCard.locator('.room-name-input').dispatchEvent('change');
    await roomCard.locator('.room-length-ft').fill('10');
    await roomCard.locator('.room-length-ft').dispatchEvent('input');
    await roomCard.locator('.room-width-ft').fill('10');
    await roomCard.locator('.room-width-ft').dispatchEvent('input');
    await roomCard.locator('[data-surface="floor"]').check();
    await roomCard.locator('[data-surface="floor"]').dispatchEvent('change');
    
    await page.waitForTimeout(500);
    
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
    await page.locator('#project-name').dispatchEvent('change');
    await page.click('#add-room-btn');
    
    const roomCard = page.locator('.room-card').first();
    await roomCard.locator('.room-name-input').fill('Room');
    await roomCard.locator('.room-name-input').dispatchEvent('change');
    await roomCard.locator('.room-length-ft').fill('10');
    await roomCard.locator('.room-length-ft').dispatchEvent('input');
    await roomCard.locator('.room-width-ft').fill('10');
    await roomCard.locator('.room-width-ft').dispatchEvent('input');
    await roomCard.locator('[data-surface="floor"]').check();
    await roomCard.locator('[data-surface="floor"]').dispatchEvent('change');
    
    await page.waitForTimeout(500);
    
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
    await page.locator('#project-name').dispatchEvent('change');
    await page.click('#add-room-btn');
    
    const roomCard = page.locator('.room-card').first();
    await roomCard.locator('.room-name-input').fill('Room');
    await roomCard.locator('.room-name-input').dispatchEvent('change');
    await roomCard.locator('.room-length-ft').fill('10');
    await roomCard.locator('.room-length-ft').dispatchEvent('input');
    await roomCard.locator('.room-width-ft').fill('10');
    await roomCard.locator('.room-width-ft').dispatchEvent('input');
    await roomCard.locator('[data-surface="floor"]').check();
    await roomCard.locator('[data-surface="floor"]').dispatchEvent('change');
    
    await page.waitForTimeout(500);
    
    // Generate preview
    await page.click('#generate-output-btn');
    await expect(page.locator('#output-preview')).toBeVisible({ timeout: 5000 });
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click txt download
    await page.click('#download-txt-btn');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.txt');
  });

});
