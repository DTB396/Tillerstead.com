/**
 * Tillerstead - Micro-Interactions & Scroll Animations
 * Luxury polish with accessibility-first approach
 */

(function () {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  /**
   * Fade-in on Scroll Observer
   */
  function initScrollAnimations() {
    if (prefersReducedMotion) return; // Respect accessibility

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Animate only once
        }
      });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in-scroll').forEach((el) => {
      observer.observe(el);
    });

    // Observe section dividers
    document.querySelectorAll('.section-divider').forEach((el) => {
      observer.observe(el);
    });
  }

  /**
   * Smooth Anchor Scrolling with offset for fixed header
   */
  function initSmoothScroll() {
    const headerHeight = 80; // Adjust based on your header height

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');

        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          e.preventDefault();

          const targetPosition =
            targetElement.getBoundingClientRect().top +
            window.pageYOffset -
            headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
          });

          // Update URL without jumping
          history.pushState(null, null, targetId);
        }
      });
    });
  }

  /**
   * Active Navigation State on Scroll
   */
  function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    function updateActiveNav() {
      const scrollPosition = window.scrollY + 100;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav(); // Run on load
  }

  /**
   * Form Input Enhancements
   */
  function initFormEnhancements() {
    // Auto-grow textareas
    document.querySelectorAll('textarea.auto-grow').forEach((textarea) => {
      textarea.style.overflow = 'hidden';

      const resize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      };

      textarea.addEventListener('input', resize);
      resize(); // Initialize
    });

    // Add floating label effect
    document.querySelectorAll('.form-group').forEach((group) => {
      const input = group.querySelector('input, textarea');
      const label = group.querySelector('label');

      if (!input || !label) return;

      const updateLabel = () => {
        if (input.value || document.activeElement === input) {
          label.classList.add('floating');
        } else {
          label.classList.remove('floating');
        }
      };

      input.addEventListener('focus', updateLabel);
      input.addEventListener('blur', updateLabel);
      input.addEventListener('input', updateLabel);
      updateLabel(); // Initialize
    });
  }

  /**
   * Image Lazy Loading Enhancement
   */
  function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
      // Browser supports native lazy loading
      document.querySelectorAll('img[data-src]').forEach((img) => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    } else {
      // Fallback to Intersection Observer
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }

  /**
   * Card Parallax Effect (subtle)
   */
  function initCardParallax() {
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('.card, .service-card, .plan-card');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /**
   * Initialize all enhancements
   */
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    initScrollAnimations();
    initSmoothScroll();
    initActiveNavigation();
    initFormEnhancements();
    initLazyLoading();
    initCardParallax();

    console.log('✨ Tillerstead micro-interactions initialized');
  }

  // Start initialization
  init();
})();
