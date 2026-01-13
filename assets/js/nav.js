/* nav.js — Tillerstead
  Enhanced navigation: mobile drawer, dropdowns, mega menu, keyboard navigation
  WCAG 2.1 AA compliant, supports reduced motion preferences
*/
(() => {
  // Utility selectors
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) =>
    Array.from(context.querySelectorAll(selector));

  // DOM references
  const header = $('.site-header');
  const navToggle = $('.nav-toggle');
  const navShell = header?.querySelector('[data-nav-container]');
  const nav = header?.querySelector('#mobile-nav');
  const navClose = header?.querySelector('[data-nav-close]');
  const navOverlay = header?.querySelector('[data-nav-overlay]');

  // Breakpoint
  const BP_DESKTOP = 1080;
  let lastFocus = null;

  // State helpers
  const isMobileView = () => {
    const mobile = window.innerWidth < BP_DESKTOP;
    console.log(`[DEBUG] isMobileView: ${mobile}`);
    return mobile;
  };
  const isNavOpen = () => navShell?.classList.contains('is-open');

  // ========== ARIA Sync ==========
  // Add logging to debug aria and mobile view
  console.log('[DEBUG] Adding aria and mobile view logging');

  const syncAria = (open) => {
    const state = open ? 'true' : 'false';
    console.log(`[DEBUG] syncAria called with state: ${state}`);
    console.log('[DEBUG] navToggle:', navToggle);
    console.log('[DEBUG] nav:', nav);
    console.log('[DEBUG] navShell:', navShell);
    console.log('[DEBUG] navOverlay:', navOverlay);

    navToggle?.setAttribute('aria-expanded', state);
    navToggle?.setAttribute(
      'aria-label',
      open ? 'Close navigation menu' : 'Open navigation menu',
    );
    nav?.setAttribute('aria-expanded', state);
    if (nav) nav.dataset.open = state;
    if (navShell) navShell.dataset.open = state;
    if (navOverlay) navOverlay.dataset.open = state;
  };

  // ========== Mobile Navigation ==========
  const handleEsc = (e) => {
    if (!isNavOpen()) return;
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      closeNav();
    }
  };

  const trapFocus = (e) => {
    if (!isNavOpen() || e.key !== 'Tab' || !nav) return;
    const focusables = $$(
      'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"])',
      nav,
    ).filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const openNav = () => {
    console.log('[TEST] openNav called', { navShell, nav, navOverlay });
    if (!navShell || !nav) return;
    lastFocus = document.activeElement;
    navShell.classList.add('is-open');
    nav.classList.add('is-open');
    if (navOverlay) navOverlay.classList.add('is-open');
    document.body.classList.add('nav-open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    // Prevent scroll on iOS
    window.scrollTo(0, 0);
    syncAria(true);
    // Wait for DOM to update for E2E test reliability
    setTimeout(() => {
      const first = $('button, a', nav) || nav;
      if (first && typeof first.focus === 'function') first.focus();
    }, 50);
    document.addEventListener('keydown', trapFocus);
    document.addEventListener('keydown', handleEsc);
  };

  const closeNav = () => {
    if (!navShell || !nav) return;
    navShell.classList.remove('is-open');
    nav.classList.remove('is-open');
    if (navOverlay) navOverlay.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    // Restore scroll
    window.scrollTo(0, 0);
    syncAria(false);
    document.removeEventListener('keydown', trapFocus);
    document.removeEventListener('keydown', handleEsc);
    const focusTarget = lastFocus || navToggle || document.body;
    requestAnimationFrame(() => {
      if (focusTarget && typeof focusTarget.focus === 'function') {
        focusTarget.focus();
      }
    });
  };

  // Add logging to debug event listeners
  console.log('[DEBUG] Attaching event listeners');

  // Mobile nav toggle
  if (navToggle) {
    console.log('[DEBUG] navToggle event listener attached');
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      isNavOpen() ? closeNav() : openNav();
    });
  }

  // Close button
  if (navClose) {
    console.log('[DEBUG] navClose event listener attached');
    navClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeNav();
    });
  }

  // Overlay click
  if (navOverlay) {
    console.log('[DEBUG] navOverlay event listeners attached');
    const closeViaEvent = (e) => {
      e.stopPropagation();
      closeNav();
    };
    navOverlay.addEventListener('click', closeViaEvent);
    navOverlay.addEventListener('touchstart', closeViaEvent, { passive: true });
  }

  // Close on link click (mobile)
  if (nav) {
    console.log('[DEBUG] nav link click listener attached');
    nav.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      if (isMobileView() && isNavOpen()) closeNav();
    });
  }

  // ========== Mobile Submenus ==========
  const mobileSubtoggles = $$('[data-mobile-subtoggle]');
  mobileSubtoggles.forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = toggle.closest('.mobile-nav-item--section');
      const submenu = parent?.querySelector('[data-mobile-submenu]');
      if (!submenu) return;

      const isOpen = toggle.getAttribute('aria-expanded') === 'true';

      // Close other open submenus
      mobileSubtoggles.forEach((other) => {
        if (other !== toggle) {
          other.setAttribute('aria-expanded', 'false');
          const otherMenu = other
            .closest('.mobile-nav-item--section')
            ?.querySelector('[data-mobile-submenu]');
          otherMenu?.classList.remove('is-open');
        }
      });

      // Toggle this submenu
      toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      submenu.classList.toggle('is-open', !isOpen);
    });
  });

  // ========== Desktop Dropdowns ==========
  const dropdownToggles = $$('[data-dropdown-toggle]');
  let activeDropdown = null;

  const closeAllDropdowns = () => {
    $$('.nav-item.has-children.is-open').forEach((item) => {
      item.classList.remove('is-open');
      const toggle = item.querySelector('[data-dropdown-toggle]');
      toggle?.setAttribute('aria-expanded', 'false');
    });
    activeDropdown = null;
  };

  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      if (isMobileView()) return;
      e.preventDefault();
      const item = toggle.closest('.nav-item.has-children');
      const isOpen = item?.classList.contains('is-open');

      closeAllDropdowns();

      if (!isOpen && item) {
        item.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        activeDropdown = item;
      }
    });

    // Keyboard navigation
    toggle.addEventListener('keydown', (e) => {
      if (isMobileView()) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle.click();
      }
      if (e.key === 'Escape') {
        closeAllDropdowns();
        toggle.focus();
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item.has-children')) {
      closeAllDropdowns();
    }
  });

  // Close dropdowns on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeDropdown) {
      closeAllDropdowns();
    }
  });

  // ========== Mega Menu Hover (Desktop) ==========
  const megaItems = $$('.nav-item--mega');
  let megaTimeout;

  megaItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      if (isMobileView()) return;
      clearTimeout(megaTimeout);
      item.classList.add('is-open');
    });

    item.addEventListener('mouseleave', () => {
      if (isMobileView()) return;
      megaTimeout = setTimeout(() => {
        item.classList.remove('is-open');
      }, 150);
    });

    // Keyboard support for mega menu
    const link = item.querySelector('.nav-link');
    link?.addEventListener('keydown', (e) => {
      if (isMobileView()) return;
      if (e.key === 'Enter') {
        // Allow navigation to the link
        return;
      }
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        item.classList.add('is-open');
        const firstLink = item.querySelector('.nav-mega-link');
        firstLink?.focus();
      }
    });

    // Close mega menu on Escape when inside
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        item.classList.remove('is-open');
        link?.focus();
      }
    });
  });

  // ========== Scroll Behavior ==========
  let lastScrollY = 0;
  let ticking = false;

  const handleScroll = () => {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      header?.classList.add('is-scrolled');
    } else {
      header?.classList.remove('is-scrolled');
    }

    lastScrollY = scrollY;
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    },
    { passive: true },
  );

  // ========== Responsive Handling ==========
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isMobileView() && isNavOpen()) {
        closeNav();
      }
      if (!isMobileView()) {
        closeAllDropdowns();
      }
    }, 120);
  });

  // Orientation change
  if ('onorientationchange' in window) {
    window.addEventListener('orientationchange', () => {
      if (!isMobileView() && isNavOpen()) {
        setTimeout(closeNav, 200);
      }
    });
  }

  // ========== Init ==========
  try {
    if (navShell && nav) {
      navShell.classList.remove('is-open');
      nav.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      syncAria(false);
    }
    // Initial scroll check
    handleScroll();
  } catch (err) {
    if (window?.console?.warn) {
      console.warn('Navigation initialization error:', err);
    }
  }

  // Expose safe global toggles
  window.tsOpenNav = openNav;
  window.tsCloseNav = closeNav;
  window.tsToggleNav = () => (isNavOpen() ? closeNav() : openNav());
})();
