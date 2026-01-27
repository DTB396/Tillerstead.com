/**
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
