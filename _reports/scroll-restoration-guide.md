# Native Scroll Restoration Guide

## Overview
This document explains the scroll management system and how native scroll functionality has been restored while maintaining necessary scroll-locking features for modals and navigation.

---

## Problem Statement

### Before (Issues)
Multiple JavaScript files were independently managing body scroll:
- `nav.js` - Set `overflow: hidden` when mobile nav opened
- `scroll-fix.js` - Applied position: fixed when nav opened
- `lead-magnet-system.js` - Blocked scroll when popup shown
- `tools-app.js` - Blocked scroll for modals
- `professional-features.js` - Blocked scroll for image lightbox
- `scroll-enabler.js` - Override preventDefault on all scroll events

**Problems:**
- ❌ Conflicting scroll locks (one unlocks, another still locked)
- ❌ Lost scroll position when locking/unlocking
- ❌ No coordination between components
- ❌ Scroll remained blocked even after closing modals
- ❌ Native scroll behavior was broken

---

## Solution: Centralized Scroll Lock Manager

### New Architecture

```
┌─────────────────────────────────────┐
│   ScrollLockManager (Master)        │
│   - Reference counting              │
│   - Position saving/restoring       │
│   - Single source of truth          │
└─────────────────────────────────────┘
         ▲         ▲         ▲
         │         │         │
    ┌────┘    ┌────┘    └────┐
    │         │              │
┌───┴──┐  ┌───┴──────┐  ┌────┴──────┐
│ Nav  │  │  Modals  │  │  Popups   │
│.lock │  │  .lock   │  │  .lock    │
└──────┘  └──────────┘  └───────────┘
```

### How It Works

**Reference Counting:**
- Each component can request a scroll lock
- Lock counter increments on lock request
- Counter decrements on unlock request
- Scroll only restores when counter reaches 0

**Example:**
```javascript
// Mobile nav opens
ScrollLockManager.lock('mobile-nav')  // count: 1 → LOCKED

// Lead magnet shows while nav open
ScrollLockManager.lock('lead-magnet') // count: 2 → STILL LOCKED

// Nav closes
ScrollLockManager.unlock('mobile-nav') // count: 1 → STILL LOCKED

// Lead magnet closes
ScrollLockManager.unlock('lead-magnet') // count: 0 → UNLOCKED ✅
```

---

## Files Modified

### 1. **scroll-lock-manager.js** (NEW)
**Location:** `assets/js/scroll-lock-manager.js`

**Purpose:** Master controller for all scroll locking

**API:**
```javascript
// Lock scroll
window.ScrollLockManager.lock('component-name');

// Unlock scroll
window.ScrollLockManager.unlock('component-name');

// Force unlock (emergency)
window.ScrollLockManager.forceUnlock();

// Check if locked
window.ScrollLockManager.isLocked(); // true/false

// Get lock count
window.ScrollLockManager.getCount(); // 0, 1, 2, etc.
```

**Features:**
- ✅ Reference counting
- ✅ Scroll position preservation
- ✅ Automatic restoration on page load
- ✅ Monitors for rogue scripts
- ✅ Emergency unlock (Ctrl+Shift+U)
- ✅ Console logging for debugging

---

### 2. **scroll-fix.js** (UPDATED)
**Location:** `assets/js/scroll-fix.js`

**Before:**
```javascript
// Directly manipulated DOM
document.body.style.position = 'fixed';
document.body.style.overflow = 'hidden';
```

**After:**
```javascript
// Uses manager
window.ScrollLockManager.lock('scroll-fix');
```

**Changes:**
- ✅ Removed manual position/overflow manipulation
- ✅ Removed scroll position saving (manager handles it)
- ✅ Uses centralized API

---

### 3. **nav.js** (UPDATED)
**Location:** `assets/js/nav.js`

**Before:**
```javascript
// openNav
document.body.style.overflow = 'hidden';

// closeNav
document.body.style.overflow = '';
```

**After:**
```javascript
// openNav
window.ScrollLockManager.lock('mobile-nav');

// closeNav
window.ScrollLockManager.unlock('mobile-nav');
```

**Changes:**
- ✅ Uses manager for scroll lock
- ✅ Fallback if manager not loaded
- ✅ No more manual overflow manipulation

---

### 4. **lead-magnet-system.js** (UPDATED)
**Location:** `assets/js/lead-magnet-system.js`

**Before:**
```javascript
// show
document.body.style.overflow = 'hidden';

// hide
document.body.style.overflow = '';
```

**After:**
```javascript
// show
window.ScrollLockManager.lock('lead-magnet');

// hide
window.ScrollLockManager.unlock('lead-magnet');
```

---

### 5. **scripts.html** (UPDATED)
**Location:** `_includes/layout/scripts.html`

**Change:** Load order is critical

```html
<!-- MUST load FIRST -->
<script src="/assets/js/scroll-lock-manager.js"></script>

<!-- Then components that use it -->
<script src="/assets/js/scroll-fix.js"></script>
<!-- ... other scripts ... -->
```

**Why:** Manager must exist before other scripts try to use it

---

## Native Scroll Behavior

### What's Native Now

✅ **Desktop scrolling** - Always enabled, never blocked
✅ **Mobile scrolling** - Enabled unless nav/modal open
✅ **Smooth scrolling** - CSS `scroll-behavior: smooth`
✅ **Touch scrolling** - iOS momentum scrolling preserved
✅ **Scroll position** - Automatically saved/restored
✅ **Anchor links** - Jump to sections works
✅ **Keyboard scrolling** - Arrow keys, Page Up/Down, Home/End

### What's Still Locked

The following scenarios STILL lock scroll (intentionally):

1. **Mobile Navigation Open** (< 1080px width)
   - Prevents scrolling behind nav drawer
   - Unlocks when nav closes
   
2. **Modal/Popup Open**
   - Lead magnet popup
   - Tool modals
   - Image lightbox
   - Unlocks when closed

3. **Multiple Overlays**
   - Can have nav + modal simultaneously
   - Scroll unlocks only when BOTH close

---

## CSS Reinforcement

### scroll-fix.css
```css
html, body {
  overflow-y: auto !important;
  overflow-x: hidden !important;
  scroll-behavior: smooth !important;
}
```

**Purpose:** Ensures native scroll is default state

**!important:** Prevents rogue inline styles from blocking scroll

---

## Debugging

### Console Logs

When scroll lock changes, you'll see:
```
[Scroll Lock] Locked by mobile-nav (count: 1)
[Scroll Lock] Already locked, count increased: 2 (by lead-magnet)
[Scroll Lock] Still locked, count decreased: 1 (by mobile-nav)
[Scroll Lock] Unlocked by lead-magnet (count: 0)
```

### Check Lock State

Open DevTools console:
```javascript
// Is scroll locked?
ScrollLockManager.isLocked()  // true or false

// How many locks?
ScrollLockManager.getCount()  // 0, 1, 2, etc.

// Emergency unlock
ScrollLockManager.forceUnlock()
```

### Keyboard Shortcut

**Ctrl+Shift+U** - Emergency unlock (if scroll gets stuck)

---

## Testing Scenarios

### Test 1: Desktop Nav (Should Never Lock)
1. On desktop (>1080px width)
2. Open navigation
3. **Expected:** Can still scroll page
4. **Result:** ✅ Scroll works

### Test 2: Mobile Nav (Should Lock)
1. On mobile (<1080px width)
2. Open navigation
3. **Expected:** Cannot scroll page behind nav
4. Close navigation
5. **Expected:** Scroll restored
6. **Result:** ✅ Works as intended

### Test 3: Modal While Nav Open
1. Open mobile navigation (scroll locked)
2. Open lead magnet popup (2 locks)
3. Close navigation (1 lock remains)
4. **Expected:** Still locked (popup open)
5. Close popup
6. **Expected:** Scroll fully restored
7. **Result:** ✅ Proper reference counting

### Test 4: Scroll Position Memory
1. Scroll to middle of page
2. Open modal (position saved)
3. Try to scroll (blocked)
4. Close modal
5. **Expected:** Returns to same position
6. **Result:** ✅ Position restored

---

## Migration Guide

### If You're Adding New Modals/Popups

**Before (OLD WAY - Don't do this):**
```javascript
// Opening
document.body.style.overflow = 'hidden';

// Closing
document.body.style.overflow = '';
```

**After (NEW WAY - Use this):**
```javascript
// Opening
if (window.ScrollLockManager) {
  window.ScrollLockManager.lock('my-component-name');
} else {
  // Fallback for old browsers
  document.body.style.overflow = 'hidden';
}

// Closing
if (window.ScrollLockManager) {
  window.ScrollLockManager.unlock('my-component-name');
} else {
  document.body.style.overflow = '';
}
```

**Component Names:** Use descriptive names like:
- `'mobile-nav'`
- `'lead-magnet'`
- `'image-lightbox'`
- `'quote-wizard'`

---

## Files to Update Later

These files still use old methods (low priority):

1. **tools-app.js** (line 1155)
   ```javascript
   // TODO: Update to use ScrollLockManager
   document.body.style.overflow = 'hidden';
   ```

2. **professional-features.js** (line 992)
   ```javascript
   // TODO: Update to use ScrollLockManager
   document.body.style.overflow = 'hidden';
   ```

---

## Performance Benefits

### Before
- 🐌 Multiple scroll position saves (conflicts)
- 🐌 Competing overflow styles
- 🐌 Janky unlock transitions
- 🐌 Lost scroll position

### After
- ⚡ Single source of truth
- ⚡ Coordinated locking
- ⚡ Smooth transitions
- ⚡ Perfect position memory

---

## Browser Support

✅ **Modern Browsers** (Chrome, Firefox, Safari, Edge)
- Full support for MutationObserver
- Smooth scroll behavior
- Touch action support

✅ **Mobile Browsers** (iOS Safari, Chrome Mobile)
- iOS momentum scrolling preserved
- Touch gestures work naturally

✅ **Legacy Browsers**
- Graceful fallback to old method
- Still functional, just less coordinated

---

## Troubleshooting

### Problem: Scroll is stuck/blocked

**Solution 1:** Press **Ctrl+Shift+U** (emergency unlock)

**Solution 2:** Open console
```javascript
ScrollLockManager.forceUnlock()
```

**Solution 3:** Refresh page (manager resets on load)

---

### Problem: Scroll position not restoring

**Check:** Is manager loaded?
```javascript
console.log(window.ScrollLockManager)
// Should show object, not undefined
```

**Fix:** Ensure scroll-lock-manager.js loads before other scripts

---

### Problem: Desktop scroll is blocked

**Check:** Breakpoint detection
```javascript
window.innerWidth  // Should be > 1080 for desktop
```

**Check:** Mobile-only locks should not trigger on desktop
- scroll-fix.js checks `isMobile()` before locking
- Only mobile nav triggers locks

---

## Summary

### What We Fixed
✅ Centralized scroll lock management  
✅ Reference counting prevents conflicts  
✅ Native scroll is default state  
✅ Scroll position memory works  
✅ Desktop never blocks scroll  
✅ Emergency unlock available  
✅ Console logging for debugging  

### What's Native
✅ Page scrolling (desktop always, mobile when unlocked)  
✅ Smooth scroll behavior  
✅ Touch momentum (iOS)  
✅ Anchor link navigation  
✅ Keyboard scrolling  

### What's Still Controlled
🔒 Mobile nav drawer  
🔒 Modal popups  
🔒 Image lightbox  
🔒 Multi-component overlays  

**Result:** Best of both worlds - native scroll when appropriate, controlled locks when necessary!

---

*Last Updated: 2026-01-26*  
*Run `npm run site:repair` to verify scroll health*
