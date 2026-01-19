// nav-drawer.js
// Modern, accessible, responsive nav bar + drawer for Tillerstead.com

document.addEventListener('DOMContentLoaded', function () {
  const drawer = document.querySelector('.nav-drawer');
  const overlay = document.querySelector('.nav-overlay');
  const openBtn = document.querySelector('.nav-toggle, [data-nav-toggle]');
  const closeBtn = document.querySelector('.nav-close, [data-nav-close]');
  const focusableSelectors = 'a, button, input, [tabindex]:not([tabindex="-1"])';

  if (!drawer || !openBtn) return;

  // Submenu logic for drawer mode
  const submenuGroups = drawer.querySelectorAll('.nav-submenu-group');
  submenuGroups.forEach(group => {
    const trigger = group.querySelector('.has-submenu');
    if (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        // Toggle open class
        const isOpen = group.classList.contains('open');
        submenuGroups.forEach(g => g.classList.remove('open'));
        if (!isOpen) group.classList.add('open');
      });
    }
  });

  function openDrawer() {
    drawer.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
    if (closeBtn) closeBtn.focus();
  }
  
  function closeDrawer() {
    drawer.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
    openBtn.focus();
  }
  
  openBtn.addEventListener('click', function() {
    const isOpen = drawer.classList.contains('is-open');
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }
  
  if (overlay) {
    overlay.addEventListener('click', closeDrawer);
  }
  
  document.addEventListener('keydown', function (e) {
    if (drawer.classList.contains('is-open')) {
      if (e.key === 'Escape') closeDrawer();
      // Trap focus
      if (e.key === 'Tab') {
        const focusables = drawer.querySelectorAll(focusableSelectors);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });
  
  // Close drawer on link click
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function() {
      setTimeout(closeDrawer, 150);
    });
  });
  
  // Close on resize to desktop
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth >= 1024 && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    }, 100);
  });
});
