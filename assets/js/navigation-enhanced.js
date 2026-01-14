// Enhanced navigation functionality
(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  const toggleMenu = (button, menuId) => {
    const menu = document.getElementById(menuId);
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', !isExpanded);
    menu.classList.toggle('is-open', !isExpanded);
  };

  // Mobile navigation toggle
  navToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('is-open');
    mobileNav.classList.toggle('is-open', !isOpen);
    navToggle.setAttribute('aria-expanded', !isOpen);
  });

  // Dropdown menus
  document.querySelectorAll('button[aria-controls]').forEach((button) => {
    button.addEventListener('click', () => {
      toggleMenu(button, button.getAttribute('aria-controls'));
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-container')) {
      mobileNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', false);
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.is-open').forEach((menu) => {
        menu.classList.remove('is-open');
      });
      document.querySelectorAll('button[aria-expanded]').forEach((button) => {
        button.setAttribute('aria-expanded', false);
      });
    }
  });
})();