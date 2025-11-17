/**
 * Tillerstead "Boss" Theme - Interactive Enhancements
 * Premium micro-interactions and animations
 */

(function () {
  'use strict'

  // Check if reduced motion is preferred
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /**
   * Initialize all interactive enhancements
   */
  function init () {
    if (!prefersReducedMotion) {
      initCardHoverEffects()
      initImageLazyLoading()
      initButtonRippleEffect()
      initSmoothScrolling()
      initParallaxEffects()
      initIntersectionObserver()
    }

    // Always initialize these (accessibility features)
    initKeyboardNavigation()
    initFocusManagement()
  }

  /**
   * Card hover effects with mouse tracking
   */
  function initCardHoverEffects () {
    const cards = document.querySelectorAll('.ts-card, .card, .gc-card')

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        card.style.setProperty('--mouse-x', `${x}%`)
        card.style.setProperty('--mouse-y', `${y}%`)
      })

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--mouse-x', '50%')
        card.style.setProperty('--mouse-y', '50%')
      })
    })
  }

  /**
   * Enhanced lazy loading for images
   */
  function initImageLazyLoading () {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]')

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target
            img.classList.add('loaded')
            imageObserver.unobserve(img)
          }
        })
      })

      lazyImages.forEach(img => imageObserver.observe(img))
    } else {
      // Fallback for older browsers
      lazyImages.forEach(img => img.classList.add('loaded'))
    }
  }

  /**
   * Material Design-inspired ripple effect for buttons
   */
  function initButtonRippleEffect () {
    const buttons = document.querySelectorAll('.btn, button.btn')

    buttons.forEach(button => {
      button.addEventListener('click', function (e) {
        // Don't add ripple if reduced motion is preferred
        if (prefersReducedMotion) return

        const ripple = document.createElement('span')
        const rect = this.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const x = e.clientX - rect.left - size / 2
        const y = e.clientY - rect.top - size / 2

        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: scale(0);
          animation: ripple-animation 0.6s ease-out;
          top: ${y}px;
          left: ${x}px;
          pointer-events: none;
        `

        this.appendChild(ripple)

        setTimeout(() => ripple.remove(), 600)
      })
    })

    // Add ripple animation keyframes if not already present
    if (!document.getElementById('ripple-styles')) {
      const style = document.createElement('style')
      style.id = 'ripple-styles'
      style.textContent = `
        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `
      document.head.appendChild(style)
    }
  }

  /**
   * Smooth scrolling for anchor links
   */
  function initSmoothScrolling () {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href')
        
        // Skip if it's just "#" or empty
        if (!href || href === '#') return

        const target = document.querySelector(href)
        if (target) {
          e.preventDefault()
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })

          // Update URL without jumping
          if (history.pushState) {
            history.pushState(null, null, href)
          }

          // Focus the target for accessibility
          target.focus({ preventScroll: true })
        }
      })
    })
  }

  /**
   * Subtle parallax effect for hero sections
   */
  function initParallaxEffects () {
    const heroSections = document.querySelectorAll('.hero-surface, .hero-panel')

    if (heroSections.length === 0) return

    let ticking = false

    function updateParallax () {
      const scrolled = window.pageYOffset

      heroSections.forEach(hero => {
        const heroTop = hero.offsetTop
        const heroHeight = hero.offsetHeight

        // Only apply parallax if hero is in viewport
        if (scrolled < heroTop + heroHeight) {
          const offset = (scrolled - heroTop) * 0.5
          hero.style.transform = `translateY(${offset}px)`
        }
      })

      ticking = false
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax)
        ticking = true
      }
    })
  }

  /**
   * Intersection Observer for fade-in animations
   */
  function initIntersectionObserver () {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    // Observe sections and cards
    const elements = document.querySelectorAll('.ts-section, .ts-card, .card')
    elements.forEach(el => {
      el.classList.add('fade-in-element')
      observer.observe(el)
    })

    // Add CSS for fade-in animation if not present
    if (!document.getElementById('fade-in-styles')) {
      const style = document.createElement('style')
      style.id = 'fade-in-styles'
      style.textContent = `
        .fade-in-element {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-in-element.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `
      document.head.appendChild(style)
    }
  }

  /**
   * Enhanced keyboard navigation
   */
  function initKeyboardNavigation () {
    // Add keyboard support for custom elements
    const interactiveElements = document.querySelectorAll('[role="button"], .chip, [data-tooltip]')

    interactiveElements.forEach(element => {
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0')
      }

      element.addEventListener('keydown', (e) => {
        // Activate on Enter or Space
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          element.click()
        }
      })
    })
  }

  /**
   * Focus management for better accessibility
   */
  function initFocusManagement () {
    // Track if user is using keyboard for navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav')
      }
    })

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav')
    })

    // Add styles for keyboard navigation
    if (!document.getElementById('keyboard-nav-styles')) {
      const style = document.createElement('style')
      style.id = 'keyboard-nav-styles'
      style.textContent = `
        body:not(.keyboard-nav) *:focus {
          outline: none;
        }
        body.keyboard-nav *:focus-visible {
          outline: 3px solid var(--color-primary);
          outline-offset: 3px;
        }
      `
      document.head.appendChild(style)
    }
  }

  /**
   * Performance optimization: debounce function
   */
  function debounce (func, wait) {
    let timeout
    return function executedFunction (...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  /**
   * Handle window resize events
   */
  const handleResize = debounce(() => {
    // Recalculate any size-dependent features
    console.log('Window resized, recalculating...')
  }, 250)

  window.addEventListener('resize', handleResize)

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // Expose for external use if needed
  window.TillersteadBoss = {
    init,
    prefersReducedMotion
  }
})()
