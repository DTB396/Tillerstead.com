/**
 * Premium Header Scroll Effects
 * Handles header shrinking on scroll and mobile menu
 */

(function () {
  'use strict';

  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileBackdrop = document.querySelector('.mobile-nav-backdrop');
  const mobileShell = document.querySelector('.mobile-nav-shell');

  let lastScrollY = window.scrollY;
  let ticking = false;

  // Scroll handler with RAF for performance
  function onScroll() {
    lastScrollY = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateHeader();
        ticking = false;
      });
      ticking = true;
    }
  }

  // Update header based on scroll position
  function updateHeader() {
    if (lastScrollY > 50) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  // Close mobile menu
  function closeMobileMenu() {
    if (mobileNav && mobileBackdrop) {
      mobileShell && mobileShell.classList.remove('is-open');
      mobileNav.classList.remove('is-open');
      mobileBackdrop.classList.remove('is-open');
      navToggle && navToggle.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.body.classList.remove('nav-open');
      navToggle && navToggle.focus();
    }
  }

  // Event listeners
  if (header) {
    window.addEventListener('scroll', onScroll, { passive: true });
    updateHeader(); // Check initial state
  }

  // Navigation interactions handled by nav.js to avoid event conflicts.
  // Header script focuses on scroll/shrink behavior only.
  // (Removed duplicate open/close handlers to satisfy test expectations.)

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'Escape' &&
      mobileNav &&
      mobileNav.classList.contains('is-open')
    ) {
      closeMobileMenu();
    }
  });

  // Close mobile menu on window resize above mobile breakpoint
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (
        window.innerWidth > 920 &&
        mobileNav &&
        mobileNav.classList.contains('is-open')
      ) {
        closeMobileMenu();
      }
    }, 250);
  });
})();
