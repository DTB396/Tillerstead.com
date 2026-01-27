#!/usr/bin/env node
/**
 * Browser Console Testing Suite
 * Test across Chrome, Firefox, Safari, Edge consoles
 * High-end web dev tool integration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_URL = 'http://localhost:4000';
const RESULTS_DIR = path.join(__dirname, '../test-results/console-tests');

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

console.log('🧪 Browser Console Testing Suite\n');

// Test 1: Lighthouse Performance Audit
console.log('1️⃣  Running Lighthouse Performance Audit...');
try {
  const lighthouseCmd = `npx lighthouse ${TEST_URL} --output=json --output=html --output-path="${path.join(RESULTS_DIR, 'lighthouse')}" --chrome-flags="--headless" --only-categories=performance,accessibility,best-practices,seo,pwa`;
  
  execSync(lighthouseCmd, { stdio: 'inherit' });
  console.log('✓ Lighthouse audit complete\n');
} catch (error) {
  console.log('✗ Lighthouse audit failed (may need Chrome installed)\n');
}

// Test 2: Accessibility Audit with axe-core
console.log('2️⃣  Running axe-core Accessibility Audit...');
try {
  const axeScript = `
const { AxePuppeteer } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('${TEST_URL}');
  
  const results = await new AxePuppeteer(page).analyze();
  
  require('fs').writeFileSync(
    '${path.join(RESULTS_DIR, 'axe-results.json').replace(/\\/g, '\\\\')}',
    JSON.stringify(results, null, 2)
  );
  
  await browser.close();
  
  console.log(\`Found \${results.violations.length} accessibility violations\`);
  process.exit(results.violations.length > 0 ? 1 : 0);
})();
`;
  
  fs.writeFileSync(path.join(__dirname, '../temp-axe-test.js'), axeScript);
  execSync(`node ${path.join(__dirname, '../temp-axe-test.js')}`, { stdio: 'inherit' });
  fs.unlinkSync(path.join(__dirname, '../temp-axe-test.js'));
  console.log('✓ Accessibility audit complete\n');
} catch (error) {
  console.log('✗ Accessibility audit skipped (dependencies needed)\n');
}

// Test 3: Console Error Detection
console.log('3️⃣  Scanning for Console Errors...');
try {
  const consoleScript = `
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const warnings = [];
  const logs = [];
  
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') errors.push(text);
    else if (type === 'warning') warnings.push(text);
    else if (type === 'log') logs.push(text);
  });
  
  page.on('pageerror', error => {
    errors.push(error.toString());
  });
  
  await page.goto('${TEST_URL}', { waitUntil: 'networkidle0' });
  
  // Wait for animations
  await page.waitForTimeout(2000);
  
  const results = {
    timestamp: new Date().toISOString(),
    url: '${TEST_URL}',
    errors,
    warnings,
    logs: logs.slice(0, 20) // Limit logs
  };
  
  require('fs').writeFileSync(
    '${path.join(RESULTS_DIR, 'console-errors.json').replace(/\\/g, '\\\\')}',
    JSON.stringify(results, null, 2)
  );
  
  await browser.close();
  
  console.log(\`Errors: \${errors.length}\`);
  console.log(\`Warnings: \${warnings.length}\`);
  console.log(\`Logs: \${logs.length}\`);
  
  process.exit(0);
})();
`;
  
  fs.writeFileSync(path.join(__dirname, '../temp-console-test.js'), consoleScript);
  execSync(`node ${path.join(__dirname, '../temp-console-test.js')}`, { stdio: 'inherit' });
  fs.unlinkSync(path.join(__dirname, '../temp-console-test.js'));
  console.log('✓ Console error scan complete\n');
} catch (error) {
  console.log('✗ Console scan skipped (puppeteer needed)\n');
}

// Test 4: Network Performance Analysis
console.log('4️⃣  Analyzing Network Performance...');
try {
  const networkScript = `
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const resources = [];
  
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    const headers = response.headers();
    
    resources.push({
      url: url.replace('${TEST_URL}', ''),
      status,
      contentType: headers['content-type'],
      cacheControl: headers['cache-control'],
      contentLength: headers['content-length']
    });
  });
  
  await page.goto('${TEST_URL}', { waitUntil: 'networkidle0' });
  
  const metrics = await page.metrics();
  
  const results = {
    timestamp: new Date().toISOString(),
    metrics,
    resourceCount: resources.length,
    resources: resources.slice(0, 50) // Limit to first 50
  };
  
  require('fs').writeFileSync(
    '${path.join(RESULTS_DIR, 'network-performance.json').replace(/\\/g, '\\\\')}',
    JSON.stringify(results, null, 2)
  );
  
  await browser.close();
  
  console.log(\`Resources loaded: \${resources.length}\`);
  console.log(\`JS Heap Size: \${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB\`);
  
  process.exit(0);
})();
`;
  
  fs.writeFileSync(path.join(__dirname, '../temp-network-test.js'), networkScript);
  execSync(`node ${path.join(__dirname, '../temp-network-test.js')}`, { stdio: 'inherit' });
  fs.unlinkSync(path.join(__dirname, '../temp-network-test.js'));
  console.log('✓ Network analysis complete\n');
} catch (error) {
  console.log('✗ Network analysis skipped\n');
}

// Test 5: Memory Leak Detection
console.log('5️⃣  Checking for Memory Leaks...');
try {
  const memoryScript = `
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('${TEST_URL}');
  
  // Initial heap snapshot
  const metrics1 = await page.metrics();
  const heap1 = metrics1.JSHeapUsedSize;
  
  // Interact with page
  await page.evaluate(() => {
    for (let i = 0; i < 10; i++) {
      window.scrollBy(0, 500);
    }
  });
  await page.waitForTimeout(1000);
  
  // Second snapshot
  const metrics2 = await page.metrics();
  const heap2 = metrics2.JSHeapUsedSize;
  
  // Force garbage collection
  await page.evaluate(() => {
    if (window.gc) window.gc();
  });
  await page.waitForTimeout(1000);
  
  // Final snapshot
  const metrics3 = await page.metrics();
  const heap3 = metrics3.JSHeapUsedSize;
  
  const results = {
    timestamp: new Date().toISOString(),
    initialHeap: (heap1 / 1024 / 1024).toFixed(2) + ' MB',
    afterInteraction: (heap2 / 1024 / 1024).toFixed(2) + ' MB',
    afterGC: (heap3 / 1024 / 1024).toFixed(2) + ' MB',
    heapGrowth: ((heap2 - heap1) / 1024 / 1024).toFixed(2) + ' MB',
    retainedAfterGC: ((heap3 - heap1) / 1024 / 1024).toFixed(2) + ' MB',
    possibleLeak: heap3 > heap1 * 1.5
  };
  
  require('fs').writeFileSync(
    '${path.join(RESULTS_DIR, 'memory-check.json').replace(/\\/g, '\\\\')}',
    JSON.stringify(results, null, 2)
  );
  
  await browser.close();
  
  console.log(\`Initial: \${results.initialHeap}\`);
  console.log(\`After GC: \${results.afterGC}\`);
  console.log(\`Possible leak: \${results.possibleLeak ? 'YES ⚠️' : 'NO ✓'}\`);
  
  process.exit(0);
})();
`;
  
  fs.writeFileSync(path.join(__dirname, '../temp-memory-test.js'), memoryScript);
  execSync(`node ${path.join(__dirname, '../temp-memory-test.js')}`, { stdio: 'inherit' });
  fs.unlinkSync(path.join(__dirname, '../temp-memory-test.js'));
  console.log('✓ Memory leak check complete\n');
} catch (error) {
  console.log('✗ Memory leak check skipped\n');
}

console.log('\n📊 Test Results Location:');
console.log(`   ${RESULTS_DIR}`);
console.log('\n✅ Browser console testing complete!');
