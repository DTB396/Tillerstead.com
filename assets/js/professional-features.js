/**
 * Tillerstead Professional Features Suite
 * High-end interactions for a premium web experience
 * 
 * Features:
 * - Custom cursor with glow effect
 * - Page load animations
 * - Scroll progress indicator
 * - Scroll-to-top button
 * - Toast notification system
 * - Theme toggle (dark/light)
 * - Sticky CTA on scroll
 * - Image lightbox
 * - Smooth page transitions
 */

(function() {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================

  const CONFIG = {
    cursor: {
      enabled: false, // Disabled - intrusive UX, changes user's system cursor
      size: 24,
      glowColor: 'rgba(16, 185, 129, 0.4)',
      hoverScale: 2.5
    },
    scrollProgress: {
      enabled: true,
      color: 'var(--tiller-color-emerald, #10b981)',
      height: '3px'
    },
    scrollToTop: {
      enabled: false, // Disabled - integrated into accessibility toolbar instead
      showAfter: 400,
      duration: 600
    },
    toast: {
      duration: 4000,
      position: 'bottom-right'
    },
    stickyCTA: {
      enabled: false, // Disabled - integrated into accessibility toolbar instead
      showAfter: 600
    }
  };

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================================
  // CUSTOM CURSOR
  // ============================================================

  class CustomCursor {
    constructor() {
      // Check if user has enabled custom cursor via accessibility preferences
      this.userEnabled = this.checkUserPreference();
      
      // Only auto-init if CONFIG enables it AND user hasn't explicitly disabled
      // Since CONFIG is now false by default, cursor only activates via a11y toggle
      if (prefersReducedMotion || this.isTouchDevice()) {
        this.supported = false;
        return;
      }
      
      this.supported = true;
      this.cursor = null;
      this.cursorDot = null;
      this.mouseX = 0;
      this.mouseY = 0;
      this.cursorX = 0;
      this.cursorY = 0;
      this.dotX = 0;
      this.dotY = 0;
      this.isHovering = false;
      this.isActive = false;
      this.styleElement = null;
      
      // If user previously enabled cursor, activate it
      if (this.userEnabled) {
        this.enable();
      }
    }

    checkUserPreference() {
      try {
        const prefs = JSON.parse(localStorage.getItem('tillerstead-a11y-prefs') || '{}');
        return prefs.customCursor === true;
      } catch (e) {
        return false;
      }
    }

    isTouchDevice() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    enable() {
      if (!this.supported || this.isActive) return;
      this.isActive = true;
      this.createCursor();
      this.bindEvents();
      this.animate();
      document.documentElement.setAttribute('data-custom-cursor', 'true');
    }

    disable() {
      if (!this.isActive) return;
      this.isActive = false;
      
      // Remove cursor elements
      if (this.cursor) {
        this.cursor.remove();
        this.cursor = null;
      }
      if (this.cursorDot) {
        this.cursorDot.remove();
        this.cursorDot = null;
      }
      if (this.styleElement) {
        this.styleElement.remove();
        this.styleElement = null;
      }
      
      document.body.classList.remove('custom-cursor-active');
      document.documentElement.removeAttribute('data-custom-cursor');
    }

    init() {
      this.createCursor();
      this.bindEvents();
      this.animate();
    }

    createCursor() {
      // Main cursor ring
      this.cursor = document.createElement('div');
      this.cursor.className = 'custom-cursor';
      this.cursor.innerHTML = `
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      `;

      // Center dot
      this.cursorDot = document.createElement('div');
      this.cursorDot.className = 'custom-cursor-dot';

      document.body.appendChild(this.cursor);
      document.body.appendChild(this.cursorDot);

      // Add styles
      this.injectStyles();
    }

    injectStyles() {
      this.styleElement = document.createElement('style');
      this.styleElement.textContent = `
        .custom-cursor,
        .custom-cursor-dot {
          position: fixed;
          pointer-events: none;
          z-index: 99999;
          mix-blend-mode: difference;
        }

        .custom-cursor {
          width: ${CONFIG.cursor.size * 2}px;
          height: ${CONFIG.cursor.size * 2}px;
          color: #fff;
          transition: transform 0.15s ease-out, opacity 0.2s ease;
          opacity: 0;
        }

        .custom-cursor.visible {
          opacity: 1;
        }

        .custom-cursor.hovering {
          transform: scale(${CONFIG.cursor.hoverScale});
        }

        .custom-cursor.hovering svg circle {
          stroke: var(--tiller-color-emerald, #10b981);
          stroke-width: 1;
        }

        .custom-cursor.clicking {
          transform: scale(0.8);
        }

        .custom-cursor-dot {
          width: 6px;
          height: 6px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.1s ease-out, background 0.2s ease;
          opacity: 0;
        }

        .custom-cursor-dot.visible {
          opacity: 1;
        }

        .custom-cursor-dot.hovering {
          transform: scale(0);
        }

        /* Hide default cursor when custom cursor is active */
        body.custom-cursor-active,
        body.custom-cursor-active * {
          cursor: none !important;
        }

        body.custom-cursor-active a,
        body.custom-cursor-active button,
        body.custom-cursor-active [role="button"],
        body.custom-cursor-active input,
        body.custom-cursor-active textarea,
        body.custom-cursor-active select {
          cursor: none !important;
        }

        @media (max-width: 1024px) {
          .custom-cursor,
          .custom-cursor-dot {
            display: none !important;
          }
        }
      `;
      document.head.appendChild(this.styleElement);
    }

    bindEvents() {
      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        if (!this.cursor.classList.contains('visible')) {
          this.cursor.classList.add('visible');
          this.cursorDot.classList.add('visible');
          document.body.classList.add('custom-cursor-active');
        }
      });

      document.addEventListener('mouseleave', () => {
        this.cursor.classList.remove('visible');
        this.cursorDot.classList.remove('visible');
      });

      document.addEventListener('mouseenter', () => {
        this.cursor.classList.add('visible');
        this.cursorDot.classList.add('visible');
      });

      document.addEventListener('mousedown', () => {
        this.cursor.classList.add('clicking');
      });

      document.addEventListener('mouseup', () => {
        this.cursor.classList.remove('clicking');
      });

      // Hover effects on interactive elements
      const interactiveElements = 'a, button, [role="button"], input, textarea, select, .btn, [data-cursor-hover]';
      
      document.querySelectorAll(interactiveElements).forEach(el => {
        el.addEventListener('mouseenter', () => {
          this.cursor.classList.add('hovering');
          this.cursorDot.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
          this.cursor.classList.remove('hovering');
          this.cursorDot.classList.remove('hovering');
        });
      });
    }

    animate() {
      // Smooth follow with lerp
      this.cursorX += (this.mouseX - this.cursorX) * 0.15;
      this.cursorY += (this.mouseY - this.cursorY) * 0.15;
      this.dotX += (this.mouseX - this.dotX) * 0.35;
      this.dotY += (this.mouseY - this.dotY) * 0.35;

      this.cursor.style.left = `${this.cursorX - CONFIG.cursor.size}px`;
      this.cursor.style.top = `${this.cursorY - CONFIG.cursor.size}px`;
      this.cursorDot.style.left = `${this.dotX - 3}px`;
      this.cursorDot.style.top = `${this.dotY - 3}px`;

      requestAnimationFrame(() => this.animate());
    }
  }

  // ============================================================
  // SCROLL PROGRESS INDICATOR
  // ============================================================

  class ScrollProgress {
    constructor() {
      if (!CONFIG.scrollProgress.enabled) return;
      this.init();
    }

    init() {
      this.createProgressBar();
      this.bindEvents();
    }

    createProgressBar() {
      this.progressBar = document.createElement('div');
      this.progressBar.className = 'scroll-progress-bar';
      this.progressBar.setAttribute('role', 'progressbar');
      this.progressBar.setAttribute('aria-label', 'Page scroll progress');
      this.progressBar.setAttribute('aria-valuenow', '0');
      this.progressBar.setAttribute('aria-valuemin', '0');
      this.progressBar.setAttribute('aria-valuemax', '100');

      const style = document.createElement('style');
      style.textContent = `
        .scroll-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          width: 0;
          height: ${CONFIG.scrollProgress.height};
          background: linear-gradient(90deg, 
            var(--tiller-color-emerald, #10b981), 
            var(--tiller-color-gold, #c9a227)
          );
          z-index: 99998;
          transition: width 0.1s ease-out;
          box-shadow: 0 0 10px var(--tiller-color-emerald-glow, rgba(16, 185, 129, 0.5));
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(this.progressBar);
    }

    bindEvents() {
      window.addEventListener('scroll', () => this.updateProgress(), { passive: true });
      this.updateProgress();
    }

    updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      this.progressBar.style.width = `${progress}%`;
      this.progressBar.setAttribute('aria-valuenow', Math.round(progress));
    }
  }

  // ============================================================
  // SCROLL TO TOP BUTTON
  // ============================================================

  class ScrollToTop {
    constructor() {
      if (!CONFIG.scrollToTop.enabled) return;
      this.init();
    }

    init() {
      this.createButton();
      this.bindEvents();
    }

    createButton() {
      this.button = document.createElement('button');
      this.button.className = 'scroll-to-top';
      this.button.setAttribute('aria-label', 'Scroll to top of page');
      this.button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      `;

      const style = document.createElement('style');
      style.textContent = `
        .scroll-to-top {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--tiller-color-emerald, #10b981);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px) scale(0.8);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
          z-index: 9999;
        }

        .scroll-to-top:hover {
          transform: translateY(0) scale(1.1);
          box-shadow: 0 8px 30px rgba(16, 185, 129, 0.5);
          background: var(--tiller-color-gold, #c9a227);
        }

        .scroll-to-top:focus {
          outline: 3px solid var(--tiller-color-gold, #c9a227);
          outline-offset: 3px;
        }

        .scroll-to-top.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }

        .scroll-to-top svg {
          transition: transform 0.2s ease;
        }

        .scroll-to-top:hover svg {
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .scroll-to-top {
            bottom: 1.5rem;
            right: 1.5rem;
            width: 44px;
            height: 44px;
          }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(this.button);
    }

    bindEvents() {
      window.addEventListener('scroll', () => this.toggleVisibility(), { passive: true });
      this.button.addEventListener('click', () => this.scrollToTop());
    }

    toggleVisibility() {
      if (window.scrollY > CONFIG.scrollToTop.showAfter) {
        this.button.classList.add('visible');
      } else {
        this.button.classList.remove('visible');
      }
    }

    scrollToTop() {
      if (prefersReducedMotion) {
        window.scrollTo(0, 0);
        return;
      }

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  // ============================================================
  // TOAST NOTIFICATION SYSTEM
  // ============================================================

  class ToastSystem {
    constructor() {
      this.container = null;
      this.init();
    }

    init() {
      this.createContainer();
    }

    createContainer() {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'true');

      const style = document.createElement('style');
      style.textContent = `
        .toast-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          z-index: 99999;
          pointer-events: none;
        }

        .toast {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: var(--tiller-bg-elevated, #323534);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--tiller-text-primary, #fff);
          font-size: 0.9375rem;
          pointer-events: auto;
          transform: translateX(120%);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-width: 400px;
        }

        .toast.visible {
          transform: translateX(0);
          opacity: 1;
        }

        .toast.exiting {
          transform: translateX(120%);
          opacity: 0;
        }

        .toast-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
        }

        .toast-message {
          flex: 1;
        }

        .toast-close {
          flex-shrink: 0;
          background: none;
          border: none;
          color: inherit;
          opacity: 0.6;
          cursor: pointer;
          padding: 0.25rem;
          transition: opacity 0.2s ease;
        }

        .toast-close:hover {
          opacity: 1;
        }

        .toast--success {
          border-left: 4px solid var(--tiller-color-emerald, #10b981);
        }

        .toast--success .toast-icon {
          color: var(--tiller-color-emerald, #10b981);
        }

        .toast--error {
          border-left: 4px solid #ef4444;
        }

        .toast--error .toast-icon {
          color: #ef4444;
        }

        .toast--warning {
          border-left: 4px solid var(--tiller-color-gold, #c9a227);
        }

        .toast--warning .toast-icon {
          color: var(--tiller-color-gold, #c9a227);
        }

        .toast--info {
          border-left: 4px solid #3b82f6;
        }

        .toast--info .toast-icon {
          color: #3b82f6;
        }

        @media (max-width: 480px) {
          .toast-container {
            left: 1rem;
            right: 1rem;
            bottom: 1rem;
          }

          .toast {
            max-width: 100%;
          }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = CONFIG.toast.duration) {
      const toast = document.createElement('div');
      toast.className = `toast toast--${type}`;
      
      const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
      };

      toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Dismiss notification">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      `;

      this.container.appendChild(toast);

      // Trigger animation
      requestAnimationFrame(() => {
        toast.classList.add('visible');
      });

      // Close button
      toast.querySelector('.toast-close').addEventListener('click', () => {
        this.dismiss(toast);
      });

      // Auto dismiss
      if (duration > 0) {
        setTimeout(() => this.dismiss(toast), duration);
      }

      return toast;
    }

    dismiss(toast) {
      toast.classList.remove('visible');
      toast.classList.add('exiting');
      setTimeout(() => toast.remove(), 400);
    }

    success(message, duration) {
      return this.show(message, 'success', duration);
    }

    error(message, duration) {
      return this.show(message, 'error', duration);
    }

    warning(message, duration) {
      return this.show(message, 'warning', duration);
    }

    info(message, duration) {
      return this.show(message, 'info', duration);
    }
  }

  // ============================================================
  // PAGE LOAD ANIMATION
  // ============================================================

  class PageLoadAnimation {
    constructor() {
      if (prefersReducedMotion) return;
      this.init();
    }

    init() {
      // Add loading class to body
      document.body.classList.add('page-loading');

      // Animate elements when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.animateIn());
      } else {
        this.animateIn();
      }

      this.injectStyles();
    }

    injectStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .page-loading .animate-on-load {
          opacity: 0;
          transform: translateY(30px);
        }

        .page-loaded .animate-on-load {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .page-loaded .animate-on-load:nth-child(1) { transition-delay: 0ms; }
        .page-loaded .animate-on-load:nth-child(2) { transition-delay: 100ms; }
        .page-loaded .animate-on-load:nth-child(3) { transition-delay: 200ms; }
        .page-loaded .animate-on-load:nth-child(4) { transition-delay: 300ms; }
        .page-loaded .animate-on-load:nth-child(5) { transition-delay: 400ms; }
        .page-loaded .animate-on-load:nth-child(6) { transition-delay: 500ms; }
      `;
      document.head.appendChild(style);
    }

    animateIn() {
      // Small delay for paint
      requestAnimationFrame(() => {
        document.body.classList.remove('page-loading');
        document.body.classList.add('page-loaded');
      });
    }
  }

  // ============================================================
  // STICKY CTA ON SCROLL
  // ============================================================

  class StickyCTA {
    constructor() {
      if (!CONFIG.stickyCTA.enabled) return;
      
      // Check if CTA element exists on page
      const existingCTA = document.querySelector('.sticky-cta, [data-sticky-cta]');
      if (existingCTA) return; // Don't duplicate

      this.init();
    }

    init() {
      this.createCTA();
      this.bindEvents();
    }

    createCTA() {
      this.cta = document.createElement('div');
      this.cta.className = 'sticky-cta';
      this.cta.innerHTML = `
        <a href="/contact/" class="sticky-cta-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Free Quote</span>
        </a>
      `;

      const style = document.createElement('style');
      style.textContent = `
        .sticky-cta {
          position: fixed;
          bottom: 2rem;
          left: 2rem;
          z-index: 9998;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .sticky-cta.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .sticky-cta-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.25rem;
          background: linear-gradient(135deg, var(--tiller-color-emerald, #10b981), var(--tiller-color-emerald-dark, #059669));
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9375rem;
          border-radius: 50px;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
          transition: all 0.3s ease;
        }

        .sticky-cta-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(16, 185, 129, 0.5);
          background: linear-gradient(135deg, var(--tiller-color-gold, #c9a227), var(--tiller-color-gold-dark, #9a7a1a));
        }

        .sticky-cta-btn:focus {
          outline: 3px solid var(--tiller-color-gold, #c9a227);
          outline-offset: 3px;
        }

        @media (max-width: 768px) {
          .sticky-cta {
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            bottom: 1rem;
          }

          .sticky-cta.visible {
            transform: translateX(-50%) translateY(0);
          }

          .sticky-cta-btn span {
            display: none;
          }

          .sticky-cta-btn {
            padding: 1rem;
            border-radius: 50%;
          }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(this.cta);
    }

    bindEvents() {
      window.addEventListener('scroll', () => this.toggleVisibility(), { passive: true });
    }

    toggleVisibility() {
      // Don't show on contact page
      if (window.location.pathname.includes('contact')) {
        this.cta.classList.remove('visible');
        return;
      }

      if (window.scrollY > CONFIG.stickyCTA.showAfter) {
        this.cta.classList.add('visible');
      } else {
        this.cta.classList.remove('visible');
      }
    }
  }

  // ============================================================
  // IMAGE LIGHTBOX
  // ============================================================

  class Lightbox {
    constructor() {
      this.overlay = null;
      this.currentImage = null;
      this.init();
    }

    init() {
      this.createOverlay();
      this.bindEvents();
    }

    createOverlay() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'lightbox-overlay';
      this.overlay.innerHTML = `
        <button class="lightbox-close" aria-label="Close lightbox">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div class="lightbox-content">
          <img class="lightbox-image" src="" alt="">
        </div>
        <div class="lightbox-caption"></div>
      `;

      const style = document.createElement('style');
      style.textContent = `
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .lightbox-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        .lightbox-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          opacity: 0.7;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .lightbox-close:hover {
          opacity: 1;
          transform: scale(1.1);
        }

        .lightbox-content {
          max-width: 90vw;
          max-height: 85vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lightbox-image {
          max-width: 100%;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          transform: scale(0.9);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .lightbox-overlay.active .lightbox-image {
          transform: scale(1);
          opacity: 1;
        }

        .lightbox-caption {
          color: white;
          text-align: center;
          padding: 1rem;
          font-size: 0.9375rem;
          opacity: 0.8;
          max-width: 600px;
        }

        [data-lightbox] {
          cursor: zoom-in;
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(this.overlay);
    }

    bindEvents() {
      // Click on images with data-lightbox attribute
      document.querySelectorAll('[data-lightbox], .portfolio-image img, .gallery img').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', (e) => this.open(e.target));
      });

      // Close handlers
      this.overlay.querySelector('.lightbox-close').addEventListener('click', () => this.close());
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (!this.overlay.classList.contains('active')) return;
        if (e.key === 'Escape') this.close();
      });
    }

    open(img) {
      const lightboxImg = this.overlay.querySelector('.lightbox-image');
      const caption = this.overlay.querySelector('.lightbox-caption');
      
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      caption.textContent = img.alt || '';
      
      this.overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.currentImage = img;
    }

    close() {
      this.overlay.classList.remove('active');
      document.body.style.overflow = '';
      this.currentImage = null;
    }
  }

  // ============================================================
  // HAMBURGER MENU ANIMATION
  // ============================================================

  class HamburgerAnimation {
    constructor() {
      this.init();
    }

    init() {
      const hamburgers = document.querySelectorAll('.hamburger, .nav-toggle, [data-hamburger]');
      
      hamburgers.forEach(hamburger => {
        // Check if already animated
        if (hamburger.classList.contains('hamburger-animated')) return;
        
        hamburger.classList.add('hamburger-animated');
        
        // Add animation classes on click
        hamburger.addEventListener('click', () => {
          hamburger.classList.toggle('is-active');
        });
      });

      this.injectStyles();
    }

    injectStyles() {
      if (document.querySelector('style[data-hamburger-animation]')) return;

      const style = document.createElement('style');
      style.setAttribute('data-hamburger-animation', '');
      style.textContent = `
        .hamburger-animated {
          position: relative;
          width: 24px;
          height: 20px;
        }

        .hamburger-animated span,
        .hamburger-animated::before,
        .hamburger-animated::after {
          display: block;
          position: absolute;
          width: 100%;
          height: 2px;
          background: currentColor;
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .hamburger-animated::before,
        .hamburger-animated::after {
          content: '';
        }

        .hamburger-animated::before {
          top: 0;
        }

        .hamburger-animated span {
          top: 50%;
          transform: translateY(-50%);
        }

        .hamburger-animated::after {
          bottom: 0;
        }

        .hamburger-animated.is-active::before {
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
        }

        .hamburger-animated.is-active span {
          transform: scaleX(0);
          opacity: 0;
        }

        .hamburger-animated.is-active::after {
          bottom: 50%;
          transform: translateY(50%) rotate(-45deg);
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ============================================================
  // SMOOTH LINK TRANSITIONS
  // ============================================================

  class SmoothLinkTransitions {
    constructor() {
      if (prefersReducedMotion) return;
      this.init();
    }

    init() {
      // Add transition class to internal links
      document.querySelectorAll('a[href^="/"], a[href^="./"]').forEach(link => {
        // Skip if has download attribute or opens in new tab
        if (link.hasAttribute('download') || link.target === '_blank') return;
        
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          
          // Skip anchor links
          if (href.startsWith('#')) return;
          
          e.preventDefault();
          
          // Add exit animation
          document.body.classList.add('page-transitioning');
          
          setTimeout(() => {
            window.location.href = href;
          }, 300);
        });
      });

      this.injectStyles();
    }

    injectStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .page-transitioning {
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  class ProfessionalFeatures {
    constructor() {
      this.modules = {};
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    setup() {
      // Initialize all modules
      this.modules.cursor = new CustomCursor();
      this.modules.scrollProgress = new ScrollProgress();
      this.modules.scrollToTop = new ScrollToTop();
      this.modules.toast = new ToastSystem();
      this.modules.pageLoad = new PageLoadAnimation();
      this.modules.stickyCTA = new StickyCTA();
      this.modules.lightbox = new Lightbox();
      this.modules.hamburger = new HamburgerAnimation();
      this.modules.linkTransitions = new SmoothLinkTransitions();

      console.log('✨ Professional features initialized');
    }

    // Public API
    toast(message, type, duration) {
      return this.modules.toast?.show(message, type, duration);
    }
  }

  // Create and initialize
  const features = new ProfessionalFeatures();
  features.init();

  // Expose to global scope
  window.TillersteadPro = features;

  // Expose cursor control for accessibility toolbar
  window.TillersteadCursor = {
    enable: () => features.modules.cursor?.enable(),
    disable: () => features.modules.cursor?.disable(),
    isActive: () => features.modules.cursor?.isActive || false
  };

  // Convenience methods
  window.toast = {
    success: (msg, dur) => features.modules.toast?.success(msg, dur),
    error: (msg, dur) => features.modules.toast?.error(msg, dur),
    warning: (msg, dur) => features.modules.toast?.warning(msg, dur),
    info: (msg, dur) => features.modules.toast?.info(msg, dur)
  };

})();
