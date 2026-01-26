/**
 * Scroll Fix - Prevents nav-open from blocking scroll on desktop
 * Now uses ScrollLockManager for centralized control
 */

(function() {
  'use strict';

  const MOBILE_BREAKPOINT = 1080;
  let navIsOpen = false;

  function isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  function disableBodyScroll() {
    // ONLY disable scroll on mobile with nav drawer open
    if (!isMobile()) {
      return; // Never block scroll on desktop
    }

    // Use centralized scroll lock manager
    if (window.ScrollLockManager) {
      window.ScrollLockManager.lock('scroll-fix');
    }
  }

  function enableBodyScroll() {
    // Use centralized scroll lock manager
    if (window.ScrollLockManager) {
      window.ScrollLockManager.unlock('scroll-fix');
    }
  }

  // Monitor nav state changes via body class
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const hasNavOpen = document.body.classList.contains('nav-open');
        
        if (hasNavOpen !== navIsOpen) {
          navIsOpen = hasNavOpen;
          
          if (navIsOpen) {
            disableBodyScroll();
          } else {
            enableBodyScroll();
          }
        }
      }
    });
  });

  // Start observing
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });

  // Handle window resize - close mobile nav if resized to desktop
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // If we're on desktop and nav is open, close it
      if (!isMobile() && navIsOpen) {
        document.body.classList.remove('nav-open');
        enableBodyScroll();
        
        // Close mobile nav drawer
        const mobileNav = document.getElementById('mobile-nav-drawer');
        if (mobileNav) {
          mobileNav.setAttribute('aria-hidden', 'true');
        }
      }
    }, 150);
  }, { passive: true });

  // Expose global API
  window.tsScrollFix = {
    enable: enableBodyScroll,
    disable: disableBodyScroll,
    isEnabled: () => !navIsOpen || !isMobile()
  };

})();
