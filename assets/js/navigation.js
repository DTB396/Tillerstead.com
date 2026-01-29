/**
 * Tillerstead Navigation System
 * Beautiful desktop menu + mobile drawer interactions
 */

(function() {
  'use strict';
  
  // ============================================
  // DESKTOP DROPDOWN FUNCTIONALITY
  // ============================================
  
  const desktopTriggers = document.querySelectorAll('.ts-nav__trigger');
  
  if (desktopTriggers.length > 0) {
    desktopTriggers.forEach(trigger => {
      // Toggle dropdown on click
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        // Close all other dropdowns
        desktopTriggers.forEach(t => {
          if (t !== trigger) {
            t.setAttribute('aria-expanded', 'false');
          }
        });
        
        // Toggle this dropdown
        this.setAttribute('aria-expanded', !isExpanded);
      });
      
      // Keyboard support
      trigger.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          this.setAttribute('aria-expanded', 'false');
          this.focus();
        }
      });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.ts-nav__item--dropdown')) {
        desktopTriggers.forEach(trigger => {
          trigger.setAttribute('aria-expanded', 'false');
        });
      }
    });
    
    // Close dropdowns on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        desktopTriggers.forEach(trigger => {
          trigger.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }
  
  // ============================================
  // MOBILE DRAWER FUNCTIONALITY
  // ============================================
  
  const drawer = document.getElementById('ts-mobile-nav');
  const toggleBtn = document.querySelector('.ts-nav-toggle');
  const closeBtn = drawer?.querySelector('.ts-drawer__close');
  const overlay = drawer?.querySelector('.ts-drawer__overlay');
  
  if (drawer && toggleBtn) {
    
    // Open drawer
    function openDrawer() {
      drawer.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('nav-open');
      
      // Focus the close button for accessibility
      setTimeout(() => {
        closeBtn?.focus();
      }, 100);
      
      // Trap focus within drawer
      trapFocus(drawer);
    }
    
    // Close drawer
    function closeDrawer() {
      drawer.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
      
      // Return focus to toggle button
      toggleBtn.focus();
      
      // Remove focus trap
      removeFocusTrap();
    }
    
    // Toggle button click
    toggleBtn.addEventListener('click', function() {
      const isOpen = drawer.getAttribute('aria-hidden') === 'false';
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
    
    // Close button click
    if (closeBtn) {
      closeBtn.addEventListener('click', closeDrawer);
    }
    
    // Overlay click
    if (overlay) {
      overlay.addEventListener('click', closeDrawer);
    }
    
    // Escape key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && drawer.getAttribute('aria-hidden') === 'false') {
        closeDrawer();
      }
    });
    
    // Close on navigation link click (except accordion triggers)
    const drawerLinks = drawer.querySelectorAll('.ts-drawer__link:not(.ts-drawer__accordion-trigger)');
    drawerLinks.forEach(link => {
      link.addEventListener('click', function() {
        // Small delay to allow navigation
        setTimeout(closeDrawer, 100);
      });
    });
  }
  
  // ============================================
  // MOBILE ACCORDION FUNCTIONALITY
  // ============================================
  
  const accordionTriggers = document.querySelectorAll('.ts-drawer__accordion-trigger');
  
  if (accordionTriggers.length > 0) {
    accordionTriggers.forEach(trigger => {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        const panel = document.getElementById(this.getAttribute('aria-controls'));
        
        // Toggle this accordion
        this.setAttribute('aria-expanded', !isExpanded);
        
        if (panel) {
          if (isExpanded) {
            panel.hidden = true;
          } else {
            panel.hidden = false;
          }
        }
      });
    });
  }
  
  // ============================================
  // FOCUS TRAP FOR ACCESSIBILITY
  // ============================================
  
  let focusableElements;
  let firstFocusable;
  let lastFocusable;
  
  function trapFocus(element) {
    focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    firstFocusable = focusableElements[0];
    lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', handleFocusTrap);
  }
  
  function handleFocusTrap(e) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }
  
  function removeFocusTrap() {
    if (drawer) {
      drawer.removeEventListener('keydown', handleFocusTrap);
    }
  }
  
  // ============================================
  // SCROLL BEHAVIOR
  // ============================================
  
  let lastScrollTop = 0;
  const header = document.getElementById('site-header');
  
  if (header) {
    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Add scrolled class for styling
      if (scrollTop > 100) {
        header.classList.add('ts-header--scrolled');
      } else {
        header.classList.remove('ts-header--scrolled');
      }
      
      lastScrollTop = scrollTop;
    }, { passive: true });
  }
  
  // ============================================
  // ACTIVE PAGE INDICATION
  // ============================================
  
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.ts-nav__link[href], .ts-drawer__link[href]');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.startsWith(href) && href !== '/') {
      link.setAttribute('aria-current', 'page');
      link.classList.add('is-active');
    } else if (href === '/' && currentPath === '/') {
      link.setAttribute('aria-current', 'page');
      link.classList.add('is-active');
    }
  });
  
  // ============================================
  // SMOOTH SCROLL TO TOP (if needed)
  // ============================================
  
  const logoLink = document.querySelector('.ts-header__logo-link');
  if (logoLink && logoLink.getAttribute('href') === '/') {
    logoLink.addEventListener('click', function(e) {
      if (window.location.pathname === '/') {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }
  
  // ============================================
  // PERFORMANCE: Debounce resize events
  // ============================================
  
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      // Close mobile drawer if window is resized to desktop
      if (window.innerWidth >= 769 && drawer) {
        if (drawer.getAttribute('aria-hidden') === 'false') {
          drawer.setAttribute('aria-hidden', 'true');
          toggleBtn?.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('nav-open');
        }
      }
      
      // Close desktop dropdowns if window is resized to mobile
      if (window.innerWidth < 769) {
        desktopTriggers.forEach(trigger => {
          trigger.setAttribute('aria-expanded', 'false');
        });
      }
    }, 250);
  });
  
  // ============================================
  // INITIALIZATION COMPLETE
  // ============================================
  
  console.log('✅ Tillerstead Navigation initialized');
  
})();