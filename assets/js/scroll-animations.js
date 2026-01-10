/**
 * Scroll-Triggered Animations
 * Performant viewport detection with Intersection Observer
 * Respects prefers-reduced-motion
 *
 * Usage: Add data-animate attribute to any element
 * <div data-animate="fade-in-up" data-animate-delay="200">Content</div>
 */

(function () {
  'use strict';

  // Respect user's motion preferences
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  if (prefersReducedMotion) {
    // Skip animations but still make elements visible
    document.querySelectorAll('[data-animate]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // Get all elements to animate
  const animatedElements = document.querySelectorAll('[data-animate]');

  if (!animatedElements.length) {
    return;
  }

  // Intersection Observer options
  const options = {
    root: null,
    rootMargin: '0px 0px -80px 0px', // Trigger 80px before entering viewport
    threshold: 0.1,
  };

  // Callback when element enters viewport
  const handleIntersection = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const delay = parseInt(element.dataset.animateDelay) || 0;

        // Apply animation with delay
        setTimeout(() => {
          element.classList.add('is-animated');
        }, delay);

        // Stop observing once animated
        observer.unobserve(element);
      }
    });
  };

  // Create observer
  const observer = new IntersectionObserver(handleIntersection, options);

  // Observe all elements
  animatedElements.forEach((element) => {
    observer.observe(element);
  });

  // Animate elements already in viewport on page load
  window.addEventListener('load', () => {
    animatedElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const isInViewport =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth);

      if (isInViewport) {
        const delay = parseInt(element.dataset.animateDelay) || 0;
        setTimeout(() => {
          element.classList.add('is-animated');
        }, delay);
        observer.unobserve(element);
      }
    });
  });
})();
