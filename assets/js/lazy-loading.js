// Lazy Loading Images with Intersection Observer
// Automatically loads images as they enter the viewport for better performance

(function() {
  'use strict';

  // Check for native lazy loading support
  const supportsLazyLoading = 'loading' in HTMLImageElement.prototype;

  if (supportsLazyLoading) {
    // Use native lazy loading
    console.log('Using native lazy loading');
    return;
  }

  // Fallback to Intersection Observer for older browsers
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;

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
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  // Observe all images with data-src attribute
  document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src], img[data-srcset]');
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });

    console.log(`Lazy loading ${lazyImages.length} images with Intersection Observer`);
  });
})();
