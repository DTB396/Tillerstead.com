/**
 * Tillerstead Premium Performance & UX Enhancements
 * Smooth scrolling, lazy loading, image optimization, page transitions
 */

// ===== SMOOTH SCROLLING =====
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    // Enable smooth scrolling for all internal anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          this.scrollToElement(target);
        }
      });
    });

    // Back to top button
    this.createBackToTopButton();
  }

  scrollToElement(element, offset = 80) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    // Update URL hash without jumping
    if (element.id) {
      history.pushState(null, null, `#${element.id}`);
    }

    // Focus element for accessibility
    element.setAttribute('tabindex', '-1');
    element.focus();
  }

  createBackToTopButton() {
    const button = document.createElement('button');
    button.className = 'ts-back-to-top';
    button.setAttribute('aria-label', 'Back to top');
    button.innerHTML = `
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    `;
    button.style.display = 'none';
    document.body.appendChild(button);

    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 500) {
        button.style.display = 'flex';
      } else {
        button.style.display = 'none';
      }
    });

    // Scroll to top on click
    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// ===== LAZY LOADING =====
class LazyLoader {
  constructor() {
    this.images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
    this.iframes = document.querySelectorAll('iframe[data-src]');
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.createObserver();
    } else {
      // Fallback for older browsers
      this.loadAll();
    }
  }

  createObserver() {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadElement(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, options);

    // Observe all lazy-loadable elements
    this.images.forEach(img => observer.observe(img));
    this.iframes.forEach(iframe => observer.observe(iframe));
  }

  loadElement(element) {
    if (element.dataset.src) {
      // Load image/iframe with data-src
      const src = element.dataset.src;
      
      if (element.tagName === 'IMG') {
        element.src = src;
        if (element.dataset.srcset) {
          element.srcset = element.dataset.srcset;
        }
      } else if (element.tagName === 'IFRAME') {
        element.src = src;
      }

      // Add loaded class for fade-in animation
      element.addEventListener('load', () => {
        element.classList.add('loaded');
        delete element.dataset.src;
        delete element.dataset.srcset;
      });
    }
  }

  loadAll() {
    this.images.forEach(img => this.loadElement(img));
    this.iframes.forEach(iframe => this.loadElement(iframe));
  }
}

// ===== IMAGE OPTIMIZATION =====
class ImageOptimizer {
  constructor() {
    this.init();
  }

  init() {
    // Add WebP support detection
    this.checkWebPSupport();
    
    // Optimize all images on page
    this.optimizeImages();
  }

  checkWebPSupport() {
    const webP = new Image();
    webP.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    webP.onload = webP.onerror = () => {
      document.documentElement.classList.add(webP.height === 1 ? 'webp' : 'no-webp');
    };
  }

  optimizeImages() {
    const images = document.querySelectorAll('img:not([data-optimized])');
    
    images.forEach(img => {
      // Add responsive attributes if missing
      if (!img.loading && !img.classList.contains('no-lazy')) {
        img.loading = 'lazy';
      }

      // Add decode async for better performance
      if ('decoding' in img) {
        img.decoding = 'async';
      }

      // Mark as optimized
      img.dataset.optimized = 'true';
    });
  }
}

// ===== PAGE TRANSITIONS =====
class PageTransitions {
  constructor() {
    this.isNavigating = false;
    this.init();
  }

  init() {
    // Intercept internal link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (this.shouldIntercept(link)) {
        e.preventDefault();
        this.navigate(link.href);
      }
    });

    // Handle back/forward navigation
    window.addEventListener('popstate', () => {
      this.navigate(location.href, false);
    });

    // Fade in on page load
    this.fadeIn();
  }

  shouldIntercept(link) {
    if (!link || this.isNavigating) return false;
    
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return false;
    }

    // Only intercept same-origin links
    try {
      const url = new URL(href, window.location.origin);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  async navigate(url, pushState = true) {
    if (this.isNavigating) return;
    this.isNavigating = true;

    try {
      // Fade out
      await this.fadeOut();

      // Update URL
      if (pushState) {
        history.pushState(null, '', url);
      }

      // Fetch new page
      const response = await fetch(url);
      const html = await response.text();

      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Replace content
      this.replaceContent(doc);

      // Fade in
      await this.fadeIn();

      // Scroll to top
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to regular navigation
      window.location.href = url;
    } finally {
      this.isNavigating = false;
    }
  }

  fadeOut() {
    return new Promise(resolve => {
      document.body.classList.add('page-transition-out');
      setTimeout(resolve, 300);
    });
  }

  fadeIn() {
    return new Promise(resolve => {
      document.body.classList.remove('page-transition-out');
      document.body.classList.add('page-transition-in');
      setTimeout(() => {
        document.body.classList.remove('page-transition-in');
        resolve();
      }, 300);
    });
  }

  replaceContent(newDoc) {
    // Update title
    document.title = newDoc.title;

    // Update main content
    const newMain = newDoc.querySelector('main');
    const currentMain = document.querySelector('main');
    if (newMain && currentMain) {
      currentMain.innerHTML = newMain.innerHTML;
    }

    // Update meta tags
    ['description', 'keywords'].forEach(name => {
      const newMeta = newDoc.querySelector(`meta[name="${name}"]`);
      const currentMeta = document.querySelector(`meta[name="${name}"]`);
      if (newMeta && currentMeta) {
        currentMeta.setAttribute('content', newMeta.getAttribute('content'));
      }
    });

    // Re-initialize components that need it
    this.reinitializeComponents();
  }

  reinitializeComponents() {
    // Reinitialize any JavaScript components
    if (window.lazyLoader) {
      window.lazyLoader = new LazyLoader();
    }
    
    // Trigger custom event for other scripts
    window.dispatchEvent(new CustomEvent('page-transition-complete'));
  }
}

// ===== SCROLL PROGRESS INDICATOR =====
class ScrollProgress {
  constructor() {
    this.bar = document.querySelector('[data-scroll-progress]');
    if (this.bar) {
      this.init();
    }
  }

  init() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
  }

  update() {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    this.bar.style.width = scrolled + '%';
  }
}

// ===== FORM VALIDATION ENHANCEMENT =====
class FormValidator {
  constructor(formSelector) {
    this.forms = document.querySelectorAll(formSelector);
    this.init();
  }

  init() {
    this.forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => {
          if (input.classList.contains('ts-form-group--error')) {
            this.validateField(input);
          }
        });
      });

      // Form submission
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  }

  validateField(input) {
    const formGroup = input.closest('.ts-form-group');
    if (!formGroup) return true;

    const errorMsg = formGroup.querySelector('.ts-form-error');
    let isValid = true;
    let message = '';

    // Required validation
    if (input.hasAttribute('required') && !input.value.trim()) {
      isValid = false;
      message = 'This field is required';
    }

    // Email validation
    if (input.type === 'email' && input.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        isValid = false;
        message = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (input.type === 'tel' && input.value) {
      const phoneRegex = /^[\d\s\-\(\)\+]+$/;
      if (!phoneRegex.test(input.value) || input.value.replace(/\D/g, '').length < 10) {
        isValid = false;
        message = 'Please enter a valid phone number';
      }
    }

    // Update UI
    if (isValid) {
      formGroup.classList.remove('ts-form-group--error');
      formGroup.classList.add('ts-form-group--success');
      if (errorMsg) errorMsg.textContent = '';
    } else {
      formGroup.classList.remove('ts-form-group--success');
      formGroup.classList.add('ts-form-group--error');
      if (errorMsg) {
        errorMsg.textContent = message;
      } else {
        const error = document.createElement('span');
        error.className = 'ts-form-error';
        error.textContent = message;
        formGroup.appendChild(error);
      }
    }

    return isValid;
  }

  validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    // Focus first invalid field
    if (!isValid) {
      const firstError = form.querySelector('.ts-form-group--error input, .ts-form-group--error textarea, .ts-form-group--error select');
      if (firstError) {
        firstError.focus();
      }
    }

    return isValid;
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize smooth scrolling
  window.smoothScroll = new SmoothScroll();

  // Initialize lazy loading
  window.lazyLoader = new LazyLoader();

  // Initialize image optimization
  window.imageOptimizer = new ImageOptimizer();

  // Initialize scroll progress
  window.scrollProgress = new ScrollProgress();

  // Initialize form validation
  window.formValidator = new FormValidator('.ts-form, form');

  // Initialize page transitions (only if motion is not reduced)
  if (!prefersReducedMotion) {
    window.pageTransitions = new PageTransitions();
  }

  // Add loaded class to body for CSS animations
  setTimeout(() => {
    document.body.classList.add('page-loaded');
  }, 100);

  // // // console.log('✨ Premium UX enhancements loaded'); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SmoothScroll,
    LazyLoader,
    ImageOptimizer,
    PageTransitions,
    ScrollProgress,
    FormValidator
  };
}
