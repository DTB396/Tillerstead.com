/* NUCLEAR SCROLL ENFORCER */
(function() {
  'use strict';
  
  // console.log('[SCROLL FIX] Initializing nuclear scroll fix...'); // AUTO-DISABLED
  
  // FORCE enable scrolling immediately
  function forceEnableScroll() {
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.overflowY = 'scroll';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflow = 'auto';
    document.body.style.overflowY = 'auto';
    document.body.style.height = 'auto';
    document.body.style.position = 'relative';
    document.body.style.touchAction = 'pan-y pan-x';
    
    // Remove inline styles that block scroll
    document.querySelectorAll('[style*="overflow"]').forEach(el => {
      if (!el.classList.contains('mobile-nav') && !el.classList.contains('modal')) {
        el.style.overflow = '';
        el.style.overflowY = '';
      }
    });
    
    // console.log('[SCROLL FIX] Scroll enabled on body and html'); // AUTO-DISABLED
  }
  
  // Force enable on load
  forceEnableScroll();
  
  // Force enable after DOM loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceEnableScroll);
  }
  
  // Force enable after everything loads
  window.addEventListener('load', forceEnableScroll);
  
  // Prevent ANY script from disabling scroll
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    // Block preventDefault on scroll events
    if (type === 'wheel' || type === 'touchmove' || type === 'scroll') {
      const wrappedListener = function(e) {
        // Don't let other scripts prevent default
        const originalPreventDefault = e.preventDefault;
        e.preventDefault = function() {
          // console.warn('[SCROLL FIX] Blocked preventDefault on', type); // AUTO-DISABLED
          // Don't actually prevent default for scroll events
        };
        
        return listener.apply(this, arguments);
      };
      
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  // Monitor for changes and fix immediately
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const target = mutation.target;
        if (target === document.body || target === document.documentElement) {
          if (target.style.overflow === 'hidden') {
            // console.warn('[SCROLL FIX] Detected overflow:hidden, fixing...'); // AUTO-DISABLED
            forceEnableScroll();
          }
        }
      }
    });
  });
  
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
  observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
  
  // Fix mobile nav closing
  window.addEventListener('click', function(e) {
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav && mobileNav.getAttribute('aria-hidden') === 'false') {
      if (e.target.classList.contains('mobile-nav__close') || 
          e.target.closest('.mobile-nav__close')) {
        mobileNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
        // console.log('[SCROLL FIX] Mobile nav closed, scroll restored'); // AUTO-DISABLED
      }
    }
  });
  
  // Passive scroll listener for performance
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        // Your scroll animations here
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  
  // console.log('[SCROLL FIX] Nuclear scroll fix active'); // AUTO-DISABLED
  
  // Debug info
  // console.log('[SCROLL FIX] html overflow:', getComputedStyle(document.documentElement) // AUTO-DISABLED.overflow);
  // console.log('[SCROLL FIX] body overflow:', getComputedStyle(document.body) // AUTO-DISABLED.overflow);
  // console.log('[SCROLL FIX] body height:', getComputedStyle(document.body) // AUTO-DISABLED.height);
  
})();
