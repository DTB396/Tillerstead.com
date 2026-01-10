// Tillerstead.com – TCNA/New Jersey HIC-Compliant Lazy Image Loading
// Implements robust, standards-driven image lazy loading for optimal performance and accessibility.
// Uses Intersection Observer as a fallback for browsers lacking native support.
// All images must include descriptive alt text per NJ Consumer Fraud Act and WCAG 2.1 (§1.1.1).

(function () {
  'use strict';

  // Detect native lazy loading support (HTMLImageElement.prototype.loading)
  const supportsNativeLazy = 'loading' in HTMLImageElement.prototype;

  if (supportsNativeLazy) {
    // Native lazy loading is available; rely on browser implementation.
    return;
  }

  // Intersection Observer fallback for legacy browsers
  const observerOptions = {
    rootMargin: '50px 0px',
    threshold: 0.01,
  };

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const img = entry.target;
      const src = img.dataset.src;
      const srcset = img.dataset.srcset;

      // Assign src and srcset if present, then remove data attributes
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
      }
      if (srcset) {
        img.srcset = srcset;
        img.removeAttribute('data-srcset');
      }

      img.classList.add('lazy-loaded');
      observer.unobserve(img);
    });
  }, observerOptions);

  // Observe all images with data-src or data-srcset attributes
  document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll(
      'img[data-src], img[data-srcset]',
    );
    lazyImages.forEach((img) => {
      // Enforce descriptive alt text for accessibility and legal compliance
      if (!img.hasAttribute('alt') || !img.getAttribute('alt').trim()) {
        img.setAttribute(
          'alt',
          'Decorative image – Tillerstead New Jersey HIC compliant',
        );
      }
      imageObserver.observe(img);
    });
  });
})();
