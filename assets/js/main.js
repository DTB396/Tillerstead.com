(function() {
  'use strict';
  
  // // // console.log('[TILLERSTEAD] Initializing - No Bounce Edition'); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
  
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
    const dropdowns = document.querySelectorAll('.desktop-nav__item--dropdown');
    
    dropdowns.forEach(item => {
      const trigger = item.querySelector('.desktop-nav__trigger');
      if (!trigger) return;
      
      trigger.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        
        dropdowns.forEach(other => {
          if (other !== item) {
            const t = other.querySelector('.desktop-nav__trigger');
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        });
        
        trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });
      
      if (window.innerWidth > 768) {
        item.addEventListener('mouseenter', () => {
          trigger.setAttribute('aria-expanded', 'true');
        });
        item.addEventListener('mouseleave', () => {
          trigger.setAttribute('aria-expanded', 'false');
        });
      }
    });
    
    document.addEventListener('click', e => {
      if (!e.target.closest('.desktop-nav__item--dropdown')) {
        dropdowns.forEach(item => {
          const t = item.querySelector('.desktop-nav__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      }
    });
    
    // Mobile nav
    const toggle = document.querySelector('.mobile-nav__toggle');
    const nav = document.getElementById('mobile-nav');
    const close = document.querySelector('.mobile-nav__close');
    
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
        nav.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
        document.body.style.overflow = isOpen ? '' : 'hidden';
      });
    }
    
    if (close && nav) {
      close.addEventListener('click', () => {
        nav.setAttribute('aria-hidden', 'true');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
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
  
  // Force scroll enable
  document.documentElement.style.overflowY = 'scroll';
  document.body.style.overflowY = 'auto';
  
  // // // console.log('[TILLERSTEAD] ✅ Ready - No Bounce!'); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
})();
