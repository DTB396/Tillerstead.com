// nav-drawer.js
// Modern, accessible, responsive nav bar + drawer for Tillerstead.com

document.addEventListener('DOMContentLoaded', function () {
  const drawer = document.querySelector('.nav-drawer');
  const overlay = document.querySelector('.nav-overlay');
  const openBtn = document.querySelector('.nav-toggle');
  const closeBtn = document.querySelector('.nav-close');
  const focusableSelectors = 'a, button, input, [tabindex]:not([tabindex="-1"])';

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
    drawer.classList.add('open');
    overlay.classList.add('active');
    closeBtn.focus();
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    openBtn.focus();
    document.body.style.overflow = '';
  }
  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (drawer.classList.contains('open')) {
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
});
