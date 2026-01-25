/**
 * App Shell Architecture - Route Transitions & Performance
 * Tillerstead.com Performance Enhancement
 */

class AppShell {
  constructor() {
    this.isTransitioning = false;
    this.init();
  }

  init() {
    this.initRouteTransitions();
    this.initCriticalPathOptimization();
    this.initResourceHints();
    this.initPerformanceMonitoring();
  }

  /**
   * Smooth Page Transitions
   * Eliminates white flash, provides app-like navigation
   */
  initRouteTransitions() {
    // Skip if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Intercept internal link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      
      if (!this.shouldTransition(link)) {
        return;
      }

      e.preventDefault();
      this.navigateWithTransition(link.href);
    });

    // Handle back/forward navigation
    window.addEventListener('popstate', () => {
      this.loadPageContent(window.location.href, false);
    });
  }

  shouldTransition(link) {
    if (!link || !link.href) return false;
    
    // Skip external links
    if (link.hostname !== window.location.hostname) return false;
    
    // Skip special links
    if (link.target || link.download || link.rel === 'external') return false;
    
    // Skip anchor links on same page
    if (link.pathname === window.location.pathname && link.hash) return false;
    
    // Skip if already transitioning
    if (this.isTransitioning) return false;
    
    return true;
  }

  async navigateWithTransition(url) {
    this.isTransitioning = true;
    
    // Start exit animation
    this.showTransition('exit');
    
    if (window.haptics) {
      window.haptics.trigger('light');
    }

    try {
      // Fetch new page
      const response = await fetch(url);
      const html = await response.text();
      
      // Parse new page
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');
      
      // Wait for minimum transition time (prevents flash)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update content
      this.updatePageContent(newDoc);
      
      // Update URL
      window.history.pushState({}, '', url);
      
      // Start enter animation
      this.showTransition('enter');
      
      // Notify analytics
      if (typeof gtag !== 'undefined') {
        gtag('config', 'G-XXXXXXXX', {
          page_path: url
        });
      }
      
    } catch (error) {
      console.error('[AppShell] Navigation failed:', error);
      // Fallback to normal navigation
      window.location.href = url;
    } finally {
      setTimeout(() => {
        this.isTransitioning = false;
        this.hideTransition();
      }, 600);
    }
  }

  updatePageContent(newDoc) {
    // Update title
    document.title = newDoc.title;
    
    // Update main content
    const newMain = newDoc.querySelector('#main-content');
    const currentMain = document.querySelector('#main-content');
    
    if (newMain && currentMain) {
      currentMain.innerHTML = newMain.innerHTML;
    }
    
    // Update breadcrumbs if present
    const newBreadcrumbs = newDoc.querySelector('.ts-breadcrumbs');
    const currentBreadcrumbs = document.querySelector('.ts-breadcrumbs');
    
    if (newBreadcrumbs && currentBreadcrumbs) {
      currentBreadcrumbs.innerHTML = newBreadcrumbs.innerHTML;
    } else if (currentBreadcrumbs) {
      currentBreadcrumbs.remove();
    }
    
    // Update meta tags
    this.updateMetaTags(newDoc);
    
    // Re-initialize components
    this.reinitializeComponents();
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateMetaTags(newDoc) {
    // Update description
    const newDesc = newDoc.querySelector('meta[name="description"]');
    const currentDesc = document.querySelector('meta[name="description"]');
    if (newDesc && currentDesc) {
      currentDesc.content = newDesc.content;
    }
    
    // Update canonical
    const newCanonical = newDoc.querySelector('link[rel="canonical"]');
    const currentCanonical = document.querySelector('link[rel="canonical"]');
    if (newCanonical && currentCanonical) {
      currentCanonical.href = newCanonical.href;
    }
    
    // Update Open Graph
    const ogTags = ['og:title', 'og:description', 'og:url', 'og:image'];
    ogTags.forEach(tag => {
      const newTag = newDoc.querySelector(`meta[property="${tag}"]`);
      const currentTag = document.querySelector(`meta[property="${tag}"]`);
      if (newTag && currentTag) {
        currentTag.content = newTag.content;
      }
    });
  }

  reinitializeComponents() {
    // Re-run lazy loading
    if (window.lazyLoad) {
      window.lazyLoad.update();
    }
    
    // Re-run animations
    if (window.animationEngine) {
      window.animationEngine.init();
    }
    
    // Re-attach event listeners for forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      // Trigger custom event for form reinitialization
      form.dispatchEvent(new Event('reinitialize'));
    });
  }

  showTransition(type) {
    let overlay = document.querySelector('.app-shell-transition');
    
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'app-shell-transition';
      document.body.appendChild(overlay);
    }
    
    overlay.className = `app-shell-transition ${type}`;
  }

  hideTransition() {
    const overlay = document.querySelector('.app-shell-transition');
    if (overlay) {
      overlay.classList.add('hidden');
      setTimeout(() => overlay.remove(), 300);
    }
  }

  /**
   * Critical Path Optimization
   * Inline critical CSS, defer non-critical
   */
  initCriticalPathOptimization() {
    // Defer non-critical CSS
    const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"][data-defer]');
    nonCriticalCSS.forEach(link => {
      link.media = 'print';
      link.onload = function() {
        this.media = 'all';
      };
    });
    
    // Lazy load images below the fold
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  }

  /**
   * Resource Hints
   * Prefetch likely next pages
   */
  initResourceHints() {
    // Prefetch on hover (200ms delay)
    let prefetchTimer;
    
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a[href]');
      
      if (link && link.hostname === window.location.hostname) {
        prefetchTimer = setTimeout(() => {
          this.prefetchPage(link.href);
        }, 200);
      }
    });
    
    document.addEventListener('mouseout', () => {
      clearTimeout(prefetchTimer);
    });
    
    // Prefetch primary CTAs immediately
    const ctaLinks = document.querySelectorAll('.cta-button, .btn-primary');
    ctaLinks.forEach(link => {
      if (link.href && link.hostname === window.location.hostname) {
        this.prefetchPage(link.href);
      }
    });
  }

  prefetchPage(url) {
    // Skip if already prefetched
    if (document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    document.head.appendChild(link);
  }

  /**
   * Performance Monitoring
   * Track Core Web Vitals
   */
  initPerformanceMonitoring() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          // // // console.log('[Performance] LCP:', lastEntry.renderTime || lastEntry.loadTime); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
          
          if (typeof gtag !== 'undefined') {
            gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'LCP',
              value: Math.round(lastEntry.renderTime || lastEntry.loadTime),
              non_interaction: true
            });
          }
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Silently fail in unsupported browsers
      }
      
      // First Input Delay → Interaction to Next Paint
      try {
        const inpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            // // // console.log('[Performance] INP:', entry.processingStart - entry.startTime); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
          });
        });
        
        inpObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // Silently fail
      }
      
      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          
          // // // console.log('[Performance] CLS:', clsValue); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Silently fail
      }
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.appShell = new AppShell();
  });
} else {
  window.appShell = new AppShell();
}

AppShell;
