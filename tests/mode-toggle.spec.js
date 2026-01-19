import { test, expect } from "@playwright/test";

test("Mode toggle hides/shows pro-only sections", async ({ page }) => {
  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`ERROR: ${err.message}`));
  
  await page.goto("http://127.0.0.1:4000/tools/");
  
  // Wait for the tools JS to load and initialize
  await page.waitForTimeout(3000);
  
  // Print console logs
  console.log("=== Console logs ===");
  consoleLogs.forEach(log => console.log(log));
  console.log("=== End console logs ===");
  
  // Check if TillersteadTools is defined
  const toolsLoaded = await page.evaluate(() => typeof window.TillersteadTools !== 'undefined');
  console.log("TillersteadTools loaded:", toolsLoaded);
  
  // Check the body data-tools-mode attribute
  const bodyMode = await page.evaluate(() => document.body.getAttribute("data-tools-mode"));
  console.log("Body mode:", bodyMode);
  
  // Check if mode buttons exist and their state
  const proBtn = page.locator('[data-mode="pro"]');
  await expect(proBtn).toBeVisible();
  
  // If mode is not set, let's try clicking the button
  if (!bodyMode) {
    console.log("Mode not set, clicking pro button...");
    await proBtn.click();
    await page.waitForTimeout(1000);
    const newMode = await page.evaluate(() => document.body.getAttribute("data-tools-mode"));
    console.log("Mode after click:", newMode);
  }
  
  // Final check
  await expect(page.locator("body")).toHaveAttribute("data-tools-mode", "pro");
});
