/**
 * PERFORMANCE OPTIMIZATIONS - Phase 3
 * Tillerstead.com - Advanced Performance Features
 * 
 * Features:
 * - Progressive Image Loading with blur-up
 * - Lazy loading with Intersection Observer
 * - WebP/AVIF format detection
 * - Resource hints (preload, prefetch, preconnect)
 * - Code splitting utilities
 */

class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeAll());
    } else {
      this.initializeAll();
    }
  }

  initializeAll() {
    this.setupProgressiveImages();
    this.setupLazyLoading();
    this.setupWebPSupport();
    this.setupResourceHints();
    this.setupIntersectionObserver();
  }

  /**
   * PROGRESSIVE IMAGE LOADING - Blur-up technique
   */
  setupProgressiveImages() {
    const images = document.querySelectorAll('[data-progressive]');
    
    images.forEach(img => {
      const lowResSrc = img.dataset.lowres;
      const highResSrc = img.dataset.src || img.src;
      
      // Create placeholder with blur
      if (lowResSrc) {
        img.src = lowResSrc;
        img.style.filter = 'blur(10px)';
        img.style.transform = 'scale(1.1)';
        img.style.transition = 'filter 0.5s ease, transform 0.5s ease';
      }

      // Load high-res image
      const highResImg = new Image();
      highResImg.onload = () => {
        img.src = highResSrc;
        img.style.filter = 'blur(0)';
        img.style.transform = 'scale(1)';
        img.classList.add('is-loaded');
        img.removeAttribute('data-progressive');
      };
      highResImg.src = highResSrc;
    });
  }

  /**
   * LAZY LOADING - Images and iframes
   */
  setupLazyLoading() {
    // Native lazy loading support check
    if ('loading' in HTMLImageElement.prototype) {
      const lazyImages = document.querySelectorAll('img[data-lazy]');
      lazyImages.forEach(img => {
        img.loading = 'lazy';
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
      });
    } else {
      // Fallback to Intersection Observer
      this.lazyLoadWithIntersectionObserver();
    }
  }

  lazyLoadWithIntersectionObserver() {
    const lazyElements = document.querySelectorAll('[data-lazy]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          if (element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
          }
          
          if (element.dataset.srcset) {
            element.srcset = element.dataset.srcset;
            element.removeAttribute('data-srcset');
          }

          if (element.dataset.background) {
            element.style.backgroundImage = `url(${element.dataset.background})`;
            element.removeAttribute('data-background');
          }

          element.classList.add('is-loaded');
          observer.unobserve(element);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    lazyElements.forEach(el => imageObserver.observe(el));
  }

  /**
   * WEBP/AVIF SUPPORT DETECTION
   */
  setupWebPSupport() {
    // Check WebP support
    const webpTest = new Image();
    webpTest.onload = webpTest.onerror = () => {
      const hasWebP = webpTest.height === 2;
      document.documentElement.classList.toggle('webp', hasWebP);
      document.documentElement.classList.toggle('no-webp', !hasWebP);
    };
    webpTest.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

    // Check AVIF support
    const avifTest = new Image();
    avifTest.onload = avifTest.onerror = () => {
      const hasAVIF = avifTest.height === 1;
      document.documentElement.classList.toggle('avif', hasAVIF);
      document.documentElement.classList.toggle('no-avif', !hasAVIF);
    };
    avifTest.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  }

  /**
   * RESOURCE HINTS - Preconnect, prefetch, preload
   */
  setupResourceHints() {
    // Add preconnect for critical third-party origins
    const criticalOrigins = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.google-analytics.com'
    ];

    criticalOrigins.forEach(origin => {
      if (!document.querySelector(`link[href="${origin}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });

    // Prefetch next page on link hover
    let prefetchTimer;
    document.querySelectorAll('a[href^="/"]').forEach(link => {
      link.addEventListener('mouseenter', () => {
        prefetchTimer = setTimeout(() => {
          const href = link.getAttribute('href');
          if (href && !document.querySelector(`link[href="${href}"]`)) {
            const prefetch = document.createElement('link');
            prefetch.rel = 'prefetch';
            prefetch.href = href;
            document.head.appendChild(prefetch);
          }
        }, 300);
      });

      link.addEventListener('mouseleave', () => {
        clearTimeout(prefetchTimer);
      });
    });
  }

  /**
   * INTERSECTION OBSERVER UTILITIES
   */
  setupIntersectionObserver() {
    // Observe elements entering viewport
    const observeElements = document.querySelectorAll('[data-observe]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.dispatchEvent(new CustomEvent('elementVisible', {
            detail: { element: entry.target }
          }));
          
          // Remove observer if one-time observation
          if (entry.target.hasAttribute('data-observe-once')) {
            observer.unobserve(entry.target);
          }
        } else {
          if (!entry.target.hasAttribute('data-observe-once')) {
            entry.target.classList.remove('is-visible');
          }
        }
      });
    }, {
      rootMargin: '0px',
      threshold: 0.1
    });

    observeElements.forEach(el => observer.observe(el));
  }

  /**
   * CODE SPLITTING - Dynamic import utility
   */
  static async loadModule(modulePath) {
    try {
      const module = await import(modulePath);
      return module;
    } catch (error) {
      // Module load failed - handle gracefully
      return null;
    }
  }

  /**
   * CRITICAL CSS INLINING - Extract above-the-fold CSS
   */
  static extractCriticalCSS() {
    const criticalStyles = [];
    const sheets = document.styleSheets;

    for (let i = 0; i < sheets.length; i++) {
      try {
        const rules = sheets[i].cssRules || sheets[i].rules;
        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j];
          if (rule.selectorText) {
            const elements = document.querySelectorAll(rule.selectorText);
            elements.forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.top < window.innerHeight) {
                criticalStyles.push(rule.cssText);
              }
            });
          }
        }
      } catch (e) {
        // Cross-origin stylesheet
      }
    }

    return criticalStyles.join('\n');
  }
}

// ImageOptimizer and FontOptimizer removed - already defined in premium-ux.js to avoid duplication

// Initialize performance optimizer
const performanceOptimizer = new PerformanceOptimizer();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PerformanceOptimizer
  };
}
