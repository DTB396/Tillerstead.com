/* EMERGENCY SCROLL ENABLER */
(function() {
  'use strict';
  
  // Force enable scrolling on load
  document.addEventListener('DOMContentLoaded', function() {
    // Remove any overflow:hidden from body/html
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.overflowY = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.overflowY = 'auto';
    document.body.style.height = 'auto';
    document.body.style.touchAction = 'pan-y';
    
    // // // console.log('[SCROLL FIX] Scrolling enabled'); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
  });
  
  // Prevent scripts from disabling scroll
  var originalPreventDefault = Event.prototype.preventDefault;
  Event.prototype.preventDefault = function() {
    // Don't prevent scroll events
    if (this.type === 'wheel' || this.type === 'touchmove' || this.type === 'scroll') {
      // // // console.warn('[SCROLL FIX] Blocked preventDefault on scroll event'); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
      return;
    }
    return originalPreventDefault.apply(this, arguments);
  };
  
  // Fix for modal/drawer closing
  window.addEventListener('click', function(e) {
    var mobileNav = document.getElementById('mobile-nav-drawer');
    if (mobileNav && mobileNav.getAttribute('aria-hidden') === 'false') {
      var overlay = mobileNav.querySelector('.mobile-nav__overlay');
      if (overlay && e.target === overlay) {
        mobileNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
      }
    }
  });
  
  // // // console.log('[SCROLL FIX] Scroll enabler loaded'); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
})();
