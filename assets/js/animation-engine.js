/**
 * Tillerstead Animation Engine
 * High-performance, vanilla JS animation system
 * Inspired by: GSAP, Framer Motion, Motion One
 * 
 * Features:
 * - Intersection Observer scroll animations
 * - Magnetic hover effects (Stripe-inspired)
 * - 3D tilt effects (card hovers)
 * - Spotlight cursor tracking
 * - Smooth counter animations
 * - Split text animations
 * - Performance optimized with RAF
 */

(function() {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================
  
  const CONFIG = {
    // Intersection Observer thresholds
    scrollThreshold: 0.15,
    
    // Animation timing
    defaultDuration: 600,
    staggerDelay: 100,
    
    // Magnetic effect settings
    magneticStrength: 0.3,
    magneticRadius: 100,
    
    // Tilt effect settings
    tiltMaxAngle: 8,
    tiltPerspective: 1000,
    
    // Debug mode
    debug: false
  };

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  /**
   * Linear interpolation
   */
  const lerp = (start, end, factor) => start + (end - start) * factor;

  /**
   * Clamp value between min and max
   */
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  /**
   * Get element's center coordinates
   */
  const getElementCenter = (el) => {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  };

  /**
   * Check if reduced motion is preferred
   */
  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /**
   * RAF-based smooth animation
   */
  const animate = (options) => {
    const {
      from,
      to,
      duration = CONFIG.defaultDuration,
      easing = easeOutQuint,
      onUpdate,
      onComplete
    } = options;

    const startTime = performance.now();

    const tick = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      const current = {};
      for (const key in from) {
        current[key] = lerp(from[key], to[key], easedProgress);
      }

      onUpdate(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else if (onComplete) {
        onComplete();
      }
    };

    requestAnimationFrame(tick);
  };

  // ============================================================
  // EASING FUNCTIONS
  // ============================================================

  const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
  const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  const easeOutBack = (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  const easeInOutQuint = (t) => t < 0.5 
    ? 16 * t * t * t * t * t 
    : 1 - Math.pow(-2 * t + 2, 5) / 2;

  // ============================================================
  // SCROLL-TRIGGERED ANIMATIONS
  // ============================================================

  class ScrollAnimations {
    constructor() {
      this.observer = null;
      this.init();
    }

    init() {
      if (prefersReducedMotion()) {
        // Show all elements immediately if reduced motion preferred
        document.querySelectorAll('.animate-on-scroll, .scroll-fade-in, .scroll-scale-in, .scroll-slide-left, .scroll-slide-right, .stagger-children')
          .forEach(el => el.classList.add('is-visible'));
        return;
      }

      // Create intersection observer
      this.observer = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        {
          threshold: CONFIG.scrollThreshold,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      // Observe all scroll-animated elements
      this.observeElements();
    }

    observeElements() {
      const selectors = [
        '.animate-on-scroll',
        '.scroll-fade-in',
        '.scroll-scale-in', 
        '.scroll-slide-left',
        '.scroll-slide-right',
        '.stagger-children',
        '[data-animate]'
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        this.observer.observe(el);
      });
    }

    handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          
          // Add visible class
          el.classList.add('is-visible');
          
          // Handle data-animate attribute
          const animationType = el.dataset.animate;
          if (animationType) {
            el.classList.add(`animate-${animationType}`);
          }

          // Unobserve after animation triggered (one-time)
          this.observer.unobserve(el);
        }
      });
    }

    // Add new element to observe
    observe(element) {
      if (this.observer && element) {
        this.observer.observe(element);
      }
    }
  }

  // ============================================================
  // MAGNETIC HOVER EFFECT
  // ============================================================

  class MagneticEffect {
    constructor() {
      this.elements = [];
      this.init();
    }

    init() {
      if (prefersReducedMotion()) return;

      document.querySelectorAll('[data-magnetic]').forEach(el => {
        this.setupElement(el);
      });
    }

    setupElement(el) {
      const data = {
        el,
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        isHovering: false
      };

      this.elements.push(data);

      el.addEventListener('mouseenter', () => {
        data.isHovering = true;
      });

      el.addEventListener('mouseleave', () => {
        data.isHovering = false;
        data.targetX = 0;
        data.targetY = 0;
      });

      el.addEventListener('mousemove', (e) => {
        if (!data.isHovering) return;

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        data.targetX = deltaX * CONFIG.magneticStrength;
        data.targetY = deltaY * CONFIG.magneticStrength;
      });

      // Start animation loop for this element
      this.animate(data);
    }

    animate(data) {
      const loop = () => {
        data.x = lerp(data.x, data.targetX, 0.1);
        data.y = lerp(data.y, data.targetY, 0.1);

        data.el.style.setProperty('--magnetic-x', `${data.x}px`);
        data.el.style.setProperty('--magnetic-y', `${data.y}px`);

        requestAnimationFrame(loop);
      };
      loop();
    }
  }

  // ============================================================
  // 3D TILT EFFECT
  // ============================================================

  class TiltEffect {
    constructor() {
      this.init();
    }

    init() {
      if (prefersReducedMotion()) return;

      document.querySelectorAll('[data-tilt]').forEach(el => {
        this.setupElement(el);
      });
    }

    setupElement(el) {
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;

      el.addEventListener('mouseenter', () => {
        el.style.transition = 'none';
      });

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const percentX = (e.clientX - centerX) / (rect.width / 2);
        const percentY = (e.clientY - centerY) / (rect.height / 2);

        targetX = percentY * CONFIG.tiltMaxAngle * -1;
        targetY = percentX * CONFIG.tiltMaxAngle;
      });

      el.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
        el.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
      });

      // Animation loop
      const animate = () => {
        currentX = lerp(currentX, targetX, 0.1);
        currentY = lerp(currentY, targetY, 0.1);

        el.style.setProperty('--tilt-x', `${currentX}deg`);
        el.style.setProperty('--tilt-y', `${currentY}deg`);
        el.style.transform = `perspective(${CONFIG.tiltPerspective}px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;

        requestAnimationFrame(animate);
      };
      animate();
    }
  }

  // ============================================================
  // SPOTLIGHT CURSOR EFFECT
  // ============================================================

  class SpotlightEffect {
    constructor() {
      this.init();
    }

    init() {
      if (prefersReducedMotion()) return;

      document.querySelectorAll('.card-spotlight').forEach(el => {
        this.setupElement(el);
      });
    }

    setupElement(el) {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);
      });
    }
  }

  // ============================================================
  // COUNTER ANIMATION
  // ============================================================

  class CounterAnimation {
    constructor() {
      this.observer = null;
      this.init();
    }

    init() {
      if (prefersReducedMotion()) {
        // Just show final values
        document.querySelectorAll('[data-count-to]').forEach(el => {
          el.textContent = el.dataset.countTo;
        });
        return;
      }

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.animateCounter(entry.target);
              this.observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      document.querySelectorAll('[data-count-to]').forEach(el => {
        this.observer.observe(el);
      });
    }

    animateCounter(el) {
      const target = parseInt(el.dataset.countTo, 10);
      const duration = parseInt(el.dataset.countDuration, 10) || 2000;
      const suffix = el.dataset.countSuffix || '';
      const prefix = el.dataset.countPrefix || '';

      animate({
        from: { value: 0 },
        to: { value: target },
        duration,
        easing: easeOutQuint,
        onUpdate: ({ value }) => {
          el.textContent = `${prefix}${Math.round(value)}${suffix}`;
        }
      });
    }
  }

  // ============================================================
  // SPLIT TEXT ANIMATION
  // ============================================================

  class SplitTextAnimation {
    constructor() {
      this.observer = null;
      this.init();
    }

    init() {
      if (prefersReducedMotion()) return;

      // Split text into spans
      document.querySelectorAll('[data-split-text]').forEach(el => {
        this.splitText(el);
      });

      // Observe for animation trigger
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.animateText(entry.target);
              this.observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      document.querySelectorAll('[data-split-text]').forEach(el => {
        this.observer.observe(el);
      });
    }

    splitText(el) {
      const text = el.textContent;
      const splitType = el.dataset.splitText || 'chars'; // 'chars' or 'words'
      
      if (splitType === 'words') {
        const words = text.split(' ');
        // XSS-safe: Create spans without innerHTML
        el.textContent = ''; // Clear existing content
        words.forEach((word, i) => {
          const span = document.createElement('span');
          span.className = 'word';
          span.style.transitionDelay = `${i * 30}ms`;
          span.textContent = word;
          el.appendChild(span);
          if (i < words.length - 1) {
            el.appendChild(document.createTextNode(' '));
          }
        });
      }
    }

    animateText(el) {
      el.classList.add('split-animate');
    }
  }

  // ============================================================
  // RIPPLE EFFECT
  // ============================================================

  class RippleEffect {
    constructor() {
      this.init();
    }

    init() {
      if (prefersReducedMotion()) return;

      document.querySelectorAll('.ripple-effect').forEach(el => {
        el.addEventListener('click', (e) => this.createRipple(e, el));
      });
    }

    createRipple(e, el) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: ripple-expand 0.6s cubic-bezier(0, 0, 0.2, 1);
      `;

      el.style.position = 'relative';
      el.style.overflow = 'hidden';
      el.appendChild(ripple);

      ripple.addEventListener('animationend', () => ripple.remove());
    }
  }

  // ============================================================
  // SMOOTH REVEAL ON SCROLL
  // ============================================================

  class SmoothReveal {
    constructor() {
      this.elements = [];
      this.init();
    }

    init() {
      if (prefersReducedMotion()) return;

      // Add smooth reveal to hero elements
      document.querySelectorAll('[data-reveal]').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
          el.style.transition = 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, index * CONFIG.staggerDelay + 100);
      });
    }
  }

  // ============================================================
  // SCROLL PROGRESS INDICATOR
  // ============================================================

  class ScrollProgress {
    constructor() {
      this.progressBar = null;
      this.init();
    }

    init() {
      this.progressBar = document.querySelector('[data-scroll-progress]');
      if (!this.progressBar) return;

      this.progressBar.style.transformOrigin = 'left';
      this.progressBar.style.transform = 'scaleX(0)';

      window.addEventListener('scroll', () => this.updateProgress(), { passive: true });
    }

    updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTop / docHeight;

      this.progressBar.style.transform = `scaleX(${progress})`;
    }
  }

  // ============================================================
  // PARALLAX ELEMENTS
  // ============================================================

  class ParallaxElements {
    constructor() {
      this.elements = [];
      this.init();
    }

    init() {
      if (prefersReducedMotion()) return;

      document.querySelectorAll('[data-parallax]').forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        this.elements.push({ el, speed });
      });

      if (this.elements.length > 0) {
        window.addEventListener('scroll', () => this.update(), { passive: true });
      }
    }

    update() {
      const scrollY = window.scrollY;

      this.elements.forEach(({ el, speed }) => {
        const rect = el.getBoundingClientRect();
        const offsetTop = rect.top + scrollY;
        const elementMiddle = offsetTop + rect.height / 2;
        const viewportMiddle = scrollY + window.innerHeight / 2;
        const distance = elementMiddle - viewportMiddle;
        
        const translateY = distance * speed * -1;
        el.style.transform = `translateY(${translateY}px)`;
      });
    }
  }

  // ============================================================
  // STAGGER ANIMATION HELPER
  // ============================================================

  const staggerElements = (selector, options = {}) => {
    const {
      delay = CONFIG.staggerDelay,
      animation = 'fade-in-up',
      duration = CONFIG.defaultDuration
    } = options;

    const elements = document.querySelectorAll(selector);
    
    elements.forEach((el, index) => {
      el.style.animationDelay = `${index * delay}ms`;
      el.style.animationDuration = `${duration}ms`;
      el.classList.add(`animate-${animation}`);
    });
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================

  class AnimationEngine {
    constructor() {
      this.modules = {};
      this.init();
    }

    init() {
      // Wait for DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    setup() {
      // Auto-wire premium effects onto common UI patterns
      this.decorateDom();

      // Initialize all animation modules
      this.modules.scroll = new ScrollAnimations();
      this.modules.magnetic = new MagneticEffect();
      this.modules.tilt = new TiltEffect();
      this.modules.spotlight = new SpotlightEffect();
      this.modules.counter = new CounterAnimation();
      this.modules.splitText = new SplitTextAnimation();
      this.modules.reveal = new SmoothReveal();
      this.modules.progress = new ScrollProgress();
      this.modules.parallax = new ParallaxElements();
    }

    decorateDom() {
      // Buttons / CTAs
      document.querySelectorAll('a.btn, button.btn, input.btn').forEach((el) => {
        if (!el.hasAttribute('data-button-premium')) {
          el.setAttribute('data-button-premium', '');
        }
        if (!el.hasAttribute('data-magnetic')) {
          el.setAttribute('data-magnetic', '');
        }
        el.classList.add('ripple-effect');
      });

      // Common cards
      document
        .querySelectorAll(
          '.ts-card, .card--post, .service-card, .plan-card, .testimonial-card, .card--review'
        )
        .forEach((el) => {
          if (!el.hasAttribute('data-card-premium')) {
            el.setAttribute('data-card-premium', '');
          }
          el.classList.add('card-spotlight');
        });

      // Inject ripple keyframes
      this.injectStyles();

      if (CONFIG.debug) {
        console.log('✨ Tillerstead Animation Engine initialized');
      }
    }

    injectStyles() {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes ripple-expand {
          to {
            width: 400px;
            height: 400px;
            opacity: 0;
          }
        }

        .split-char, .split-word {
          display: inline-block;
          opacity: 0;
          transform: translateY(100%);
        }

        .split-animate .split-char,
        .split-animate .split-word {
          animation: split-reveal 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes split-reveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Public API for dynamic elements
    observe(element) {
      if (this.modules.scroll) {
        this.modules.scroll.observe(element);
      }
    }

    // Manually trigger stagger animation
    stagger(selector, options) {
      staggerElements(selector, options);
    }
  }

  // ============================================================
  // EXPORT / GLOBAL
  // ============================================================

  // Create global instance
  window.TillersteadAnimations = new AnimationEngine();

  // Also expose utilities
  window.TillersteadAnimations.utils = {
    lerp,
    clamp,
    animate,
    easeOutQuint,
    easeOutExpo,
    easeOutBack,
    easeInOutQuint,
    staggerElements
  };

})();
