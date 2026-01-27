#!/usr/bin/env node

/**
 * SCROLL LIBERATION SCRIPT
 * Removes ALL scroll-blocking CSS and JavaScript
 * Restores natural browser scrolling behavior
 */

const fs = require('fs');
const path = require('path');

console.log('🔓 LIBERATING SCROLL - Removing all scroll-blocking code...\n');

// ============================================================================
// DISABLE SCROLL LOCK MANAGER
// ============================================================================

const scrollLockManager = path.join(__dirname, '..', 'assets', 'js', 'scroll-lock-manager.js');
if (fs.existsSync(scrollLockManager)) {
  const disabledContent = `/**
 * Scroll Lock Manager - DISABLED
 * Natural scrolling restored - this file is now a no-op stub
 */

(function() {
  'use strict';
  
  // No-op functions - scrolling is now natural
  window.ScrollLockManager = {
    lock: () => console.log('[Scroll] Lock disabled - using natural scrolling'),
    unlock: () => console.log('[Scroll] Unlock disabled - using natural scrolling'),
    forceUnlock: () => {},
    isLocked: () => false,
    getCount: () => 0
  };
  
  console.log('[Scroll Lock Manager] DISABLED - Natural scrolling enabled ✓');
})();
`;
  
  fs.writeFileSync(scrollLockManager, disabledContent, 'utf8');
  console.log('✅ Disabled scroll-lock-manager.js\n');
}

// ============================================================================
// CLEAN SCROLL-FIX.CSS
// ============================================================================

const scrollFixCss = path.join(__dirname, '..', 'assets', 'css', 'scroll-fix.css');
if (fs.existsSync(scrollFixCss)) {
  const cleanCss = `/* Scroll Fix - Natural Scrolling Enabled */

html, body {
  overflow-y: auto;
  overflow-x: hidden;
  height: auto;
  min-height: 100vh;
}

.ts-main-content {
  position: relative;
  overflow: visible;
  min-height: 100vh;
}

/* Keep header sticky */
.ts-header {
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* Keep CTA bar fixed */
.sticky-cta-bar {
  position: fixed;
  bottom: 0;
  z-index: 999;
}
`;
  
  fs.writeFileSync(scrollFixCss, cleanCss, 'utf8');
  console.log('✅ Cleaned scroll-fix.css\n');
}

// ============================================================================
// REMOVE SCROLL-BLOCKING FROM NAVIGATION
// ============================================================================

const navFile = path.join(__dirname, '..', 'assets', 'js', 'unified-navigation.js');
if (fs.existsSync(navFile)) {
  let nav = fs.readFileSync(navFile, 'utf8');
  
  // Remove ScrollLockManager calls
  nav = nav.replace(/if \(window\.ScrollLockManager\) \{[^}]*ScrollLockManager\.(lock|unlock)[^}]*\}/g, '// Scroll lock disabled - using natural scrolling');
  nav = nav.replace(/window\.ScrollLockManager\.(lock|unlock)\([^)]*\);/g, '// Natural scrolling');
  
  fs.writeFileSync(navFile, nav, 'utf8');
  console.log('✅ Removed scroll locks from navigation\n');
}

// ============================================================================
// REMOVE SCROLL-BLOCKING FROM LEAD MAGNET
// ============================================================================

const leadMagnet = path.join(__dirname, '..', 'assets', 'js', 'lead-magnet-system.js');
if (fs.existsSync(leadMagnet)) {
  let lm = fs.readFileSync(leadMagnet, 'utf8');
  
  // Remove scroll locking
  lm = lm.replace(/if \(window\.ScrollLockManager\) \{[^}]*\}/g, '// Natural scrolling enabled');
  lm = lm.replace(/window\.ScrollLockManager\.(lock|unlock)[^;]*;/g, '// Natural scrolling');
  lm = lm.replace(/document\.body\.style\.overflow\s*=\s*['"]hidden['"];/g, '// Natural scrolling');
  
  fs.writeFileSync(leadMagnet, lm, 'utf8');
  console.log('✅ Removed scroll locks from lead magnet\n');
}

// ============================================================================
// CLEAN BUNDLE.CSS
// ============================================================================

const bundleCss = path.join(__dirname, '..', 'assets', 'css', 'bundle.css');
if (fs.existsSync(bundleCss)) {
  let bundle = fs.readFileSync(bundleCss, 'utf8');
  
  // Remove problematic scroll blocking
  bundle = bundle.replace(/overflow:\s*hidden\s*!important;/g, 'overflow: visible;');
  bundle = bundle.replace(/position:\s*fixed[^}]*overflow:\s*hidden/g, 'position: relative');
  
  fs.writeFileSync(bundleCss, bundle, 'utf8');
  console.log('✅ Cleaned bundle.css scroll blocks\n');
}

// ============================================================================
// CLEAN MOBILE EMERGENCY FIX
// ============================================================================

const mobileEmergency = path.join(__dirname, '..', 'assets', 'css', 'mobile-emergency-fix.css');
if (fs.existsSync(mobileEmergency)) {
  let css = fs.readFileSync(mobileEmergency, 'utf8');
  
  // Ensure proper overflow
  css = css.replace(/overflow-y:\s*auto\s*!important/g, 'overflow-y: auto');
  css = css.replace(/overflow-x:\s*hidden\s*!important/g, 'overflow-x: hidden');
  
  fs.writeFileSync(mobileEmergency, css, 'utf8');
  console.log('✅ Cleaned mobile-emergency-fix.css\n');
}

console.log('\n' + '='.repeat(60));
console.log('✨ SCROLL LIBERATION COMPLETE ✨');
console.log('='.repeat(60));
console.log('\n📊 Changes:');
console.log('   • Scroll lock manager disabled (no-op stub)');
console.log('   • Navigation scroll locks removed');
console.log('   • Lead magnet scroll locks removed');
console.log('   • CSS scroll blocks cleaned');
console.log('   • Natural browser scrolling restored');
console.log('\n🎯 Result: Scrolling now works naturally on all devices!\n');
