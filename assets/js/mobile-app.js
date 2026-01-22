/**
 * Mobile App Features - Bottom Nav, FAB, Pull-to-Refresh
 * Tillerstead.com PWA Enhancement
 */

class MobileAppFeatures {
  constructor() {
    this.init();
  }

  init() {
    if (this.isMobile()) {
      this.initBottomNav();
      this.initFAB();
      this.initPullToRefresh();
      this.initAppShell();
    }
  }

  isMobile() {
    return window.matchMedia('(max-width: 768px)').matches || 
           ('ontouchstart' in window);
  }

  /**
   * Bottom Navigation Bar
   * Sticky navigation with safe area support for notched devices
   */
  initBottomNav() {
    const nav = document.createElement('nav');
    nav.className = 'mobile-bottom-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Mobile bottom navigation');

    const currentPath = window.location.pathname;
    
    const navItems = [
      { href: '/', icon: 'home', label: 'Home' },
      { href: '/tools/', icon: 'calculator', label: 'Tools' },
      { href: '/portfolio/', icon: 'gallery', label: 'Portfolio' },
      { href: '/contact/', icon: 'message', label: 'Contact' }
    ];

    navItems.forEach(item => {
      const link = document.createElement('a');
      link.href = item.href;
      link.className = 'mobile-nav-item';
      link.setAttribute('aria-label', item.label);
      
      if (currentPath === item.href || currentPath.startsWith(item.href.replace('/', ''))) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }

      link.innerHTML = `
        <span class="mobile-nav-icon" data-icon="${item.icon}" aria-hidden="true"></span>
        <span class="mobile-nav-label">${item.label}</span>
      `;

      // Haptic feedback on tap
      link.addEventListener('click', () => {
        this.hapticFeedback('light');
      });

      nav.appendChild(link);
    });

    document.body.appendChild(nav);
    document.body.classList.add('has-bottom-nav');
  }

  /**
   * Floating Action Button (FAB)
   * Primary CTA always accessible
   */
  initFAB() {
    // Don't show FAB on contact page
    if (window.location.pathname.includes('/contact')) return;

    const fab = document.createElement('button');
    fab.className = 'mobile-fab';
    fab.setAttribute('aria-label', 'Get a free quote');
    fab.innerHTML = `
      <span class="fab-icon" aria-hidden="true">✉</span>
      <span class="fab-label">Get Quote</span>
    `;

    fab.addEventListener('click', (e) => {
      e.preventDefault();
      this.hapticFeedback('medium');
      window.location.href = '/contact/';
    });

    // Hide FAB on scroll down, show on scroll up
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            fab.classList.add('fab-hidden');
          } else {
            fab.classList.remove('fab-hidden');
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    });

    document.body.appendChild(fab);
  }

  /**
   * Pull-to-Refresh
   * Native mobile refresh pattern
   */
  initPullToRefresh() {
    let startY = 0;
    let isPulling = false;
    const threshold = 80;
    const maxPull = 120;

    const refreshIndicator = document.createElement('div');
    refreshIndicator.className = 'pull-refresh-indicator';
    refreshIndicator.innerHTML = `
      <div class="refresh-spinner" role="status" aria-live="polite">
        <span class="visually-hidden">Pull to refresh</span>
      </div>
    `;
    document.body.insertBefore(refreshIndicator, document.body.firstChild);

    const canPull = () => {
      return window.scrollY === 0 && !document.body.classList.contains('refreshing');
    };

    document.addEventListener('touchstart', (e) => {
      if (canPull()) {
        startY = e.touches[0].clientY;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!canPull()) return;

      const currentY = e.touches[0].clientY;
      const pullDistance = Math.min(currentY - startY, maxPull);

      if (pullDistance > 0) {
        isPulling = true;
        refreshIndicator.style.transform = `translateY(${pullDistance}px)`;
        refreshIndicator.style.opacity = pullDistance / threshold;

        if (pullDistance >= threshold) {
          refreshIndicator.classList.add('ready');
        } else {
          refreshIndicator.classList.remove('ready');
        }
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (isPulling) {
        const pullDistance = parseFloat(refreshIndicator.style.transform.replace(/[^\d.]/g, '')) || 0;

        if (pullDistance >= threshold) {
          this.performRefresh(refreshIndicator);
        } else {
          this.resetRefresh(refreshIndicator);
        }

        isPulling = false;
      }
    }, { passive: true });
  }

  performRefresh(indicator) {
    document.body.classList.add('refreshing');
    indicator.classList.add('refreshing');
    this.hapticFeedback('medium');

    // Update service worker cache
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'REFRESH_CACHE' });
    }

    // Reload page after brief delay
    setTimeout(() => {
      window.location.reload();
    }, 800);
  }

  resetRefresh(indicator) {
    indicator.style.transform = '';
    indicator.style.opacity = '';
    indicator.classList.remove('ready');
  }

  /**
   * App Shell - Loading States
   */
  initAppShell() {
    // Add skeleton loaders for lazy-loaded content
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
      const wrapper = document.createElement('div');
      wrapper.className = 'skeleton-img-wrapper';
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);

      img.addEventListener('load', () => {
        wrapper.classList.add('loaded');
      });
    });

    // Show loading state for navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href && !link.target && !link.download && 
          link.hostname === window.location.hostname) {
        // Don't show loader for anchor links
        if (!link.hash || link.pathname !== window.location.pathname) {
          this.showPageTransition();
        }
      }
    });
  }

  showPageTransition() {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.innerHTML = `
      <div class="page-transition-spinner">
        <div class="dot-loader">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Remove overlay if navigation doesn't happen (e.g., # links)
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 300);
      }
    }, 5000);
  }

  /**
   * Haptic Feedback
   * Tactile response for interactions
   */
  hapticFeedback(intensity = 'light') {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30
      };
      navigator.vibrate(patterns[intensity] || 10);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MobileAppFeatures();
  });
} else {
  new MobileAppFeatures();
}

export default MobileAppFeatures;
