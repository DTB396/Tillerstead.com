import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('\n═══════════════════════════════════════════════');
console.log('  TILLERSTEAD NAVIGATION DIAGNOSTIC');
console.log('  FaithFrontier-Style Complete Analysis');
console.log('═══════════════════════════════════════════════\n');

let passCount = 0;
let failCount = 0;
let warnCount = 0;

function pass(msg) {
  console.log(`✓ ${msg}`);
  passCount++;
}

function fail(msg) {
  console.log(`✗ ${msg}`);
  failCount++;
}

function warn(msg) {
  console.log(`⚠ ${msg}`);
  warnCount++;
}

function section(title) {
  console.log(`\n━━━ ${title} ━━━`);
}

// Check 1: HTML Structure
section('Phase 1: HTML Structure');
const headerPath = path.join(rootDir, '_includes', 'header.html');
if (fs.existsSync(headerPath)) {
  const header = fs.readFileSync(headerPath, 'utf8');

  header.includes('mobile-nav-shell') && header.includes('data-nav-container')
    ? pass('mobile-nav-shell with data-nav-container exists')
    : fail('mobile-nav-shell missing or malformed');

  header.includes('mobile-nav-backdrop') && header.includes('data-nav-overlay')
    ? pass('mobile-nav-backdrop with data-nav-overlay exists')
    : fail('mobile-nav-backdrop missing or malformed');

  header.includes('id="mobile-nav"')
    ? pass('#mobile-nav element exists')
    : fail('#mobile-nav missing');

  header.includes('class="nav-toggle"') && header.includes('data-nav-toggle')
    ? pass('nav-toggle button exists')
    : fail('nav-toggle button missing');

  header.includes('data-nav-close')
    ? pass('Close button exists')
    : fail('Close button missing');

  const menuItems = (header.match(/class="mobile-nav-link"/g) || []).length;
  menuItems === 6
    ? pass('All 6 navigation menu items present')
    : warn(`Found ${menuItems} menu items, expected 6`);
} else {
  fail('_includes/header.html not found');
}

// Check 2: CSS Compilation
section('Phase 2: CSS Styles');
const cssPath = path.join(rootDir, '_site', 'assets', 'css', 'main.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');

  css.includes('.mobile-nav-shell')
    ? pass('.mobile-nav-shell styles exist')
    : fail('.mobile-nav-shell styles missing');

  css.includes('.mobile-nav-backdrop')
    ? pass('.mobile-nav-backdrop styles exist')
    : fail('.mobile-nav-backdrop styles missing');

  css.includes('.mobile-nav{')
    ? pass('.mobile-nav styles exist')
    : fail('.mobile-nav styles missing');

  // Check for z-index values (minified CSS)
  css.includes('z-index:9998') || css.includes('z-index: 9998')
    ? pass('Z-index 9998 found (shell)')
    : warn('Z-index 9998 not found - may be relative');

  css.includes('position:fixed') || css.includes('position: fixed')
    ? pass('Fixed positioning found')
    : fail('Fixed positioning missing');
} else {
  fail('_site/assets/css/main.css not found - run build first');
}

// Check 3: JavaScript
section('Phase 3: JavaScript Functionality');
const navJsPath = path.join(rootDir, 'assets', 'js', 'nav.js');
if (fs.existsSync(navJsPath)) {
  const navJs = fs.readFileSync(navJsPath, 'utf8');

  navJs.includes('openNav') || navJs.includes('function openNav')
    ? pass('openNav function exists')
    : fail('openNav function missing');

  navJs.includes('closeNav') || navJs.includes('function closeNav')
    ? pass('closeNav function exists')
    : fail('closeNav function missing');

  navJs.includes('is-open')
    ? pass('Class toggle logic exists')
    : fail('is-open class toggle missing');

  navJs.includes('Escape') || navJs.includes('Esc')
    ? pass('ESC key handler exists')
    : fail('ESC key handler missing');

  navJs.includes('data-nav-overlay') || navJs.includes('navOverlay')
    ? pass('Backdrop click handler exists')
    : fail('Backdrop click handler missing');
} else {
  fail('assets/js/nav.js not found');
}

// Check 4: Build Output
section('Phase 4: Build Verification');
const indexPath = path.join(rootDir, '_site', 'index.html');
if (fs.existsSync(indexPath)) {
  pass('_site/index.html exists');

  const index = fs.readFileSync(indexPath, 'utf8');
  index.includes('mobile-nav-shell')
    ? pass('Built HTML includes mobile-nav-shell')
    : fail('Built HTML missing mobile-nav-shell');

  index.includes('/assets/js/nav.js')
    ? pass('nav.js script tag present')
    : fail('nav.js script tag missing');
} else {
  fail('_site/index.html not found - run Jekyll build');
}

// Summary
section('Summary');
console.log(`\n✓ Passed: ${passCount}`);
console.log(`✗ Failed: ${failCount}`);
console.log(`⚠ Warnings: ${warnCount}`);

if (failCount === 0 && warnCount === 0) {
  console.log('\n🎉 ALL CHECKS PASSED!');
  console.log('Ready for user testing at http://localhost:4000/\n');
} else if (failCount === 0) {
  console.log('\n⚠ CHECKS PASSED WITH WARNINGS');
  console.log('Review warnings above, then test at http://localhost:4000/\n');
} else {
  console.log('\n❌ CHECKS FAILED');
  console.log('Fix issues above before testing\n');
  process.exit(1);
}

// Next steps
console.log('━━━ Next Steps ━━━');
console.log('1. Open http://localhost:4000/ in browser');
console.log('2. Press Ctrl+Shift+R (hard refresh)');
console.log('3. Resize to mobile (<1080px) or use device mode (F12)');
console.log('4. Click hamburger menu icon');
console.log('5. Verify drawer slides in from RIGHT and appears ABOVE content');
console.log('6. Test close methods: ESC, backdrop click, X button');
console.log('');
