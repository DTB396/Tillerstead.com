/* navigation.js — Finalized high-end responsive navigation functionality */

(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu.mobile');

  const toggleNav = () => {
    const isOpen = navMenu.classList.contains('is-open');
    navMenu.classList.toggle('is-open', !isOpen);
    navToggle.setAttribute('aria-expanded', !isOpen);
    document.body.classList.toggle('nav-open', !isOpen);
  };

  navToggle.addEventListener('click', toggleNav);

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-container')) {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', false);
      document.body.classList.remove('nav-open');
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', false);
      document.body.classList.remove('nav-open');
    }
  });

  // Smooth scrolling for internal links
  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
  smoothScrollLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();