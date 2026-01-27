(function() {
  'use strict';
  
  // // // // // // // // // // // // // // // console.log('[TILLERSTEAD] Initializing - No Bounce Edition'); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
  
  // Header scroll - NO BOUNCE
  const header = document.getElementById('site-header');
  if (header) {
    let lastScroll = 0;
    let ticking = false;
    
    function updateHeader() {
      const scrollY = window.pageYOffset;
      
      // Only update class, not position
      if (scrollY > 50) {
        header.classList.add('ts-header--scrolled');
      } else {
        header.classList.remove('ts-header--scrolled');
      }
      
      lastScroll = scrollY;
      ticking = false;
    }
    
    // Use requestAnimationFrame to prevent jank
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }
  
  // Rest of navigation code...
  initNav();
  initAnimations();
  
  function initNav() {
    // Desktop dropdown navigation
    const dropdowns = document.querySelectorAll('.has-dropdown');
    
    dropdowns.forEach(item => {
      const trigger = item.querySelector('.desktop-nav__trigger');
      const dropdown = item.querySelector('.desktop-nav__dropdown');
      
      if (!trigger || !dropdown) return;
      
      // Click handler
      trigger.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        
        const isOpen = item.classList.contains('is-open');
        
        // Close all other dropdowns
        dropdowns.forEach(other => {
          if (other !== item) {
            other.classList.remove('is-open');
            const t = other.querySelector('.desktop-nav__trigger');
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        });
        
        // Toggle this dropdown
        if (isOpen) {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
      
      // Hover handlers for desktop only
      if (window.innerWidth >= 1080) {
        item.addEventListener('mouseenter', () => {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        });
        
        item.addEventListener('mouseleave', () => {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
        });
        
        // Keep dropdown open when hovering over it
        dropdown.addEventListener('mouseenter', () => {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        });
        
        dropdown.addEventListener('mouseleave', () => {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
        });
      }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', e => {
      if (!e.target.closest('.has-dropdown')) {
        dropdowns.forEach(item => {
          item.classList.remove('is-open');
          const t = item.querySelector('.desktop-nav__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      }
    });
    
    // Close dropdowns on ESC key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        dropdowns.forEach(item => {
          item.classList.remove('is-open');
          const t = item.querySelector('.desktop-nav__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      }
    });
    
    // Mobile nav
    const toggle = document.querySelector('.mobile-nav__toggle');
    const nav = document.getElementById('mobile-nav');
    const close = document.querySelector('.mobile-nav__close');
    const MOBILE_BREAKPOINT = 1080;
    const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;
    
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
        nav.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
        // ONLY block scroll on mobile
        if (isMobile()) {
          // Natural scrolling - no body lock
        }
      });
    }
    
    if (close && nav) {
      close.addEventListener('click', () => {
        nav.setAttribute('aria-hidden', 'true');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        // ONLY unblock scroll on mobile
        if (isMobile()) {
          document.body.style.overflow = '';
        }
      });
    }
    
    // Mobile accordions
    const accordions = document.querySelectorAll('.mobile-nav__accordion-trigger');
    accordions.forEach(acc => {
      acc.addEventListener('click', function() {
        const isOpen = this.getAttribute('aria-expanded') === 'true';
        const panel = this.nextElementSibling;
        this.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
        if (panel) panel.hidden = isOpen;
      });
    });
  }
  
  function initAnimations() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
  }
  
  // Don't force scroll styles - let scroll-fix.js handle it
  
  // // // // // // // // // // // // // // // console.log('[TILLERSTEAD] ✅ Ready - No Bounce!'); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
})();
