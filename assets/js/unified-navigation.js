/**
 * Unified Navigation System
 * Modern, accessible, and performant navigation
 * 
 * Features:
 *  - Mobile drawer with smooth animations
 *  - Desktop dropdowns with hover/keyboard support
 *  - Scroll-aware header behavior
 *  - Full accessibility (ARIA, keyboard nav, focus management)
 * 
 * @version 2.0.0
 */

(function() {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================

  const CONFIG = {
    MOBILE_BREAKPOINT: 1080,
    DROPDOWN_DELAY: 150,
    ANIMATION_DURATION: 300,
    SCROLL_THRESHOLD: 100,
    DEBUG: location.hostname === 'localhost'
  };

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================

  const state = {
    navOpen: false,
    scrolled: false,
    activeDropdown: null,
    lastScrollY: 0
  };

  // ============================================================
  // DOM REFERENCES
  // ============================================================

  const el = {
    header: document.querySelector('.ts-header'),
    mobileToggle: document.querySelector('.mobile-nav__toggle'),
    mobileNav: document.querySelector('.mobile-nav'),
    mobileClose: document.querySelector('.mobile-nav__close')
  };

  // ============================================================
  // UTILITIES
  // ============================================================

  function log(message, ...args) {
    if (!CONFIG.DEBUG) return;
    console.log(`🧭 [Nav] ${message}`, ...args);
  }

  function isMobile() {
    return window.innerWidth < CONFIG.MOBILE_BREAKPOINT;
  }

  // ============================================================
  // MOBILE NAVIGATION
  // ============================================================

  function setupMobileNav() {
    if (!el.mobileToggle || !el.mobileNav) {
      log('Mobile nav elements not found');
      return;
    }

    // Toggle button
    el.mobileToggle.addEventListener('click', toggleMobileNav);

    // Close button
    el.mobileClose?.addEventListener('click', closeMobileNav);

    // Click overlay to close
    el.mobileNav.addEventListener('click', (e) => {
      if (e.target === el.mobileNav) closeMobileNav();
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.navOpen) {
        closeMobileNav();
      }
    });

    // Close when navigating
    const links = el.mobileNav.querySelectorAll('a:not([href^="#"])');
    links.forEach(link => {
      link.addEventListener('click', () => setTimeout(closeMobileNav, 100));
    });

    log('Mobile navigation initialized');
  }

  function toggleMobileNav() {
    state.navOpen ? closeMobileNav() : openMobileNav();
  }

  function openMobileNav() {
    state.navOpen = true;
    
    el.mobileNav.setAttribute('aria-hidden', 'false');
    el.mobileToggle.setAttribute('aria-expanded', 'true');
    el.mobileToggle.classList.add('is-active');
    
    // Smooth entrance animation
    el.mobileNav.style.display = 'block';
    requestAnimationFrame(() => {
      el.mobileNav.classList.add('is-open');
    });

    // Lock scroll using manager
    // Scroll lock disabled - using natural scrolling

    // Focus management
    setTimeout(() => {
      const firstLink = el.mobileNav.querySelector('a, button');
      firstLink?.focus();
    }, CONFIG.ANIMATION_DURATION);
  }

  function closeMobileNav() {
    state.navOpen = false;
    
    el.mobileNav.setAttribute('aria-hidden', 'true');
    el.mobileToggle.setAttribute('aria-expanded', 'false');
    el.mobileToggle.classList.remove('is-active');
    
    // Smooth exit animation
    el.mobileNav.classList.remove('is-open');
    setTimeout(() => {
      el.mobileNav.style.display = '';
    }, CONFIG.ANIMATION_DURATION);

    // Unlock scroll
    // Scroll lock disabled - using natural scrolling

    // Return focus
    el.mobileToggle.focus();
  }

  // ===== DESKTOP DROPDOWNS =====
  function setupDesktopDropdowns() {
    const dropdowns = document.querySelectorAll('.desktop-nav__item--dropdown');
    
    dropdowns.forEach(item => {
      const trigger = item.querySelector('.desktop-nav__trigger');
      const menu = item.querySelector('.desktop-nav__dropdown');
      if (!trigger || !menu) return;

      let hoverTimeout;

      // Hover to open
      item.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        openDropdown(trigger, menu);
      });

      // Delay close on mouse leave
      item.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
          closeDropdown(trigger, menu);
        }, CONFIG.DROPDOWN_DELAY);
      });

      // Click toggle (for touch devices)
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        
        // Close all others
        closeAllDropdowns();
        
        if (!isOpen) {
          openDropdown(trigger, menu);
        }
      });

      // Keyboard navigation
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          openDropdown(trigger, menu);
          menu.querySelector('a')?.focus();
        } else if (e.key === 'Escape') {
          closeDropdown(trigger, menu);
          trigger.focus();
        }
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.desktop-nav__item--dropdown')) {
        closeAllDropdowns();
      }
    });
  }

  function openDropdown(trigger, menu) {
    trigger.setAttribute('aria-expanded', 'true');
    menu.style.display = 'block';
    requestAnimationFrame(() => {
      menu.style.opacity = '1';
      menu.style.transform = 'translateY(0)';
    });
    state.activeDropdown = { trigger, menu };
  }

  function closeDropdown(trigger, menu) {
    trigger.setAttribute('aria-expanded', 'false');
    menu.style.opacity = '0';
    menu.style.transform = 'translateY(-10px)';
    setTimeout(() => menu.style.display = 'none', 200);
    state.activeDropdown = null;
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.desktop-nav__trigger').forEach(trigger => {
      const menu = trigger.closest('.desktop-nav__item--dropdown')?.querySelector('.desktop-nav__dropdown');
      if (menu) closeDropdown(trigger, menu);
    });
  }

  // ===== MOBILE ACCORDIONS =====
  function setupMobileAccordions() {
    const triggers = document.querySelectorAll('.mobile-nav__accordion-trigger');
    
    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        const submenu = trigger.nextElementSibling;
        if (!submenu) return;

        // Close others
        triggers.forEach(other => {
          if (other !== trigger) {
            other.setAttribute('aria-expanded', 'false');
            other.classList.remove('is-active');
            const otherMenu = other.nextElementSibling;
            if (otherMenu) {
              otherMenu.hidden = true;
              otherMenu.style.maxHeight = '0';
            }
          }
        });

        // Toggle current
        trigger.setAttribute('aria-expanded', !isExpanded);
        trigger.classList.toggle('is-active');
        submenu.hidden = isExpanded;
        submenu.style.maxHeight = isExpanded ? '0' : submenu.scrollHeight + 'px';
      });
    });
  }

  // ===== SCROLL BEHAVIOR =====
  function setupScrollBehavior() {
    let scrollTimeout;
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        const currentScroll = window.scrollY;
        const scrolled = currentScroll > 50;

        // Add/remove scrolled class
        if (scrolled !== state.scrolled) {
          state.scrolled = scrolled;
          el.header?.classList.toggle('is-scrolled', scrolled);
        }

        // Hide header on scroll down, show on scroll up
        if (currentScroll > lastScroll && currentScroll > 200) {
          el.header?.classList.add('header-hidden');
        } else if (currentScroll < lastScroll) {
          el.header?.classList.remove('header-hidden');
        }

        lastScroll = currentScroll;
      }, 50);
    }, { passive: true });
  }

  // ===== RESPONSIVE BEHAVIOR =====
  function setupResponsive() {
    let resizeTimeout;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      
      resizeTimeout = setTimeout(() => {
        const isMobile = window.innerWidth < CONFIG.MOBILE_BREAKPOINT;
        
        // Close everything when switching viewports
        if (!isMobile) {
          closeMobileNav();
        }
        closeAllDropdowns();
      }, 150);
    }, { passive: true });
  }

  // ===== INITIALIZATION =====
  function init() {
    if (!el.header) {

      return;
    }

    setupMobileNav();
    setupDesktopDropdowns();
    setupMobileAccordions();
    setupScrollBehavior();
    setupResponsive();

    console.log('[Nav] Enhanced navigation initialized ✓');
  }

  // ===== PUBLIC API =====
  window.TillersteadNav = {
    openMobile: openMobileNav,
    closeMobile: closeMobileNav,
    closeDropdowns: closeAllDropdowns,
    state: () => ({ ...state })
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
