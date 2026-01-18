/**
 * ============================================================================
 * TILLERSTEAD ACCESSIBILITY JAVASCRIPT
 * ============================================================================
 * Comprehensive accessibility features:
 * - Keyboard navigation support
 * - Focus management
 * - Screen reader announcements
 * - User preference detection and persistence
 * - Accessibility toolbar
 * 
 * WCAG 2.1 AAA Compliance Support
 * ============================================================================
 */

(function() {
  'use strict';

  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  
  const A11Y_CONFIG = {
    storageKey: 'tillerstead-a11y-prefs',
    announceDelay: 100,
    focusTrapSelectors: 'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    skipLinkTarget: '#main-content'
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Debounce function for performance
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Get all focusable elements within a container
   */
  function getFocusableElements(container = document) {
    return Array.from(container.querySelectorAll(A11Y_CONFIG.focusTrapSelectors))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               el.offsetParent !== null;
      });
  }

  /**
   * Check if user prefers reduced motion
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Check if user prefers high contrast
   */
  function prefersHighContrast() {
    return window.matchMedia('(forced-colors: active)').matches ||
           window.matchMedia('(prefers-contrast: more)').matches;
  }

  // ============================================================================
  // SCREEN READER ANNOUNCEMENTS
  // ============================================================================

  /**
   * Create live region for screen reader announcements
   */
  function createLiveRegion() {
    const existing = document.getElementById('a11y-announcer');
    if (existing) return existing;

    const announcer = document.createElement('div');
    announcer.id = 'a11y-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
    return announcer;
  }

  /**
   * Create assertive live region for urgent announcements
   */
  function createAssertiveRegion() {
    const existing = document.getElementById('a11y-announcer-assertive');
    if (existing) return existing;

    const announcer = document.createElement('div');
    announcer.id = 'a11y-announcer-assertive';
    announcer.setAttribute('role', 'alert');
    announcer.setAttribute('aria-live', 'assertive');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
    return announcer;
  }

  /**
   * Announce message to screen readers (polite)
   */
  function announce(message, options = {}) {
    const announcer = options.assertive 
      ? createAssertiveRegion() 
      : createLiveRegion();
    
    // Clear and re-announce to ensure it's read
    announcer.textContent = '';
    
    setTimeout(() => {
      announcer.textContent = message;
    }, A11Y_CONFIG.announceDelay);

    // Clear after announcement
    if (options.clearAfter !== false) {
      setTimeout(() => {
        announcer.textContent = '';
      }, options.clearAfter || 5000);
    }
  }

  // Make announce globally available
  window.a11yAnnounce = announce;

  // ============================================================================
  // FOCUS MANAGEMENT
  // ============================================================================

  /**
   * Focus trap for modals and dialogs
   */
  class FocusTrap {
    constructor(element) {
      this.element = element;
      this.firstFocusable = null;
      this.lastFocusable = null;
      this.previouslyFocused = null;
      this.handleKeydown = this.handleKeydown.bind(this);
    }

    activate() {
      this.previouslyFocused = document.activeElement;
      const focusable = getFocusableElements(this.element);
      
      if (focusable.length === 0) return;

      this.firstFocusable = focusable[0];
      this.lastFocusable = focusable[focusable.length - 1];

      this.element.addEventListener('keydown', this.handleKeydown);
      this.element.setAttribute('data-focus-trap', 'true');

      // Focus first element or element with autofocus
      const autoFocus = this.element.querySelector('[autofocus]');
      (autoFocus || this.firstFocusable).focus();

      announce('Dialog opened. Press Escape to close.');
    }

    deactivate() {
      this.element.removeEventListener('keydown', this.handleKeydown);
      this.element.removeAttribute('data-focus-trap');

      if (this.previouslyFocused && this.previouslyFocused.focus) {
        this.previouslyFocused.focus();
      }
    }

    handleKeydown(e) {
      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements(this.element);
      this.firstFocusable = focusable[0];
      this.lastFocusable = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === this.firstFocusable) {
          e.preventDefault();
          this.lastFocusable.focus();
        }
      } else {
        if (document.activeElement === this.lastFocusable) {
          e.preventDefault();
          this.firstFocusable.focus();
        }
      }
    }
  }

  // Make FocusTrap globally available
  window.FocusTrap = FocusTrap;

  /**
   * Move focus to element with announcement
   */
  function moveFocusTo(element, message) {
    if (!element) return;

    element.setAttribute('tabindex', '-1');
    element.focus();
    
    if (message) {
      announce(message);
    }

    // Remove tabindex after blur
    element.addEventListener('blur', function handler() {
      element.removeAttribute('tabindex');
      element.removeEventListener('blur', handler);
    });
  }

  window.moveFocusTo = moveFocusTo;

  // ============================================================================
  // KEYBOARD NAVIGATION ENHANCEMENTS
  // ============================================================================

  /**
   * Arrow key navigation for menu items
   */
  function initMenuKeyboardNav() {
    const menus = document.querySelectorAll('[role="menu"], [role="menubar"]');

    menus.forEach(menu => {
      const items = menu.querySelectorAll('[role="menuitem"]');
      
      items.forEach((item, index) => {
        item.addEventListener('keydown', (e) => {
          let targetIndex;

          switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
              e.preventDefault();
              targetIndex = (index + 1) % items.length;
              items[targetIndex].focus();
              break;

            case 'ArrowUp':
            case 'ArrowLeft':
              e.preventDefault();
              targetIndex = (index - 1 + items.length) % items.length;
              items[targetIndex].focus();
              break;

            case 'Home':
              e.preventDefault();
              items[0].focus();
              break;

            case 'End':
              e.preventDefault();
              items[items.length - 1].focus();
              break;

            case 'Escape':
              const trigger = menu.closest('[aria-haspopup]') || 
                             document.querySelector(`[aria-controls="${menu.id}"]`);
              if (trigger) {
                trigger.focus();
                // Close menu if it has aria-expanded
                if (trigger.getAttribute('aria-expanded') === 'true') {
                  trigger.click();
                }
              }
              break;
          }
        });
      });
    });
  }

  /**
   * Tab panel keyboard navigation
   */
  function initTabPanelKeyboardNav() {
    const tabLists = document.querySelectorAll('[role="tablist"]');

    tabLists.forEach(tabList => {
      const tabs = tabList.querySelectorAll('[role="tab"]');
      
      tabs.forEach((tab, index) => {
        tab.addEventListener('keydown', (e) => {
          let targetIndex;
          const isVertical = tabList.getAttribute('aria-orientation') === 'vertical';
          const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
          const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

          switch (e.key) {
            case nextKey:
              e.preventDefault();
              targetIndex = (index + 1) % tabs.length;
              tabs[targetIndex].focus();
              tabs[targetIndex].click();
              break;

            case prevKey:
              e.preventDefault();
              targetIndex = (index - 1 + tabs.length) % tabs.length;
              tabs[targetIndex].focus();
              tabs[targetIndex].click();
              break;

            case 'Home':
              e.preventDefault();
              tabs[0].focus();
              tabs[0].click();
              break;

            case 'End':
              e.preventDefault();
              tabs[tabs.length - 1].focus();
              tabs[tabs.length - 1].click();
              break;
          }
        });
      });
    });
  }

  /**
   * Escape key handler for closable elements
   */
  function initEscapeKeyHandler() {
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;

      // Close any open modals
      const openModal = document.querySelector('[role="dialog"][aria-modal="true"]:not([hidden])');
      if (openModal) {
        const closeBtn = openModal.querySelector('[data-close], .modal-close, [aria-label*="close" i]');
        if (closeBtn) {
          closeBtn.click();
          return;
        }
      }

      // Close any open dropdowns
      const openDropdowns = document.querySelectorAll('[aria-expanded="true"]');
      openDropdowns.forEach(dropdown => {
        dropdown.setAttribute('aria-expanded', 'false');
        const menu = document.getElementById(dropdown.getAttribute('aria-controls'));
        if (menu) menu.hidden = true;
      });
    });
  }

  // ============================================================================
  // SKIP LINKS
  // ============================================================================

  /**
   * Enhance skip links functionality
   */
  function initSkipLinks() {
    const skipLinks = document.querySelectorAll('.skip-link, [href^="#main"], [href="#main-content"]');

    skipLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);

        if (target) {
          e.preventDefault();
          moveFocusTo(target, `Skipped to ${target.getAttribute('aria-label') || 'main content'}`);
          
          // Smooth scroll if motion is OK
          if (!prefersReducedMotion()) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            target.scrollIntoView({ block: 'start' });
          }
        }
      });
    });
  }

  // ============================================================================
  // USER PREFERENCES
  // ============================================================================

  /**
   * Load saved accessibility preferences
   */
  function loadPreferences() {
    try {
      const saved = localStorage.getItem(A11Y_CONFIG.storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * Save accessibility preferences
   */
  function savePreferences(prefs) {
    try {
      localStorage.setItem(A11Y_CONFIG.storageKey, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Could not save accessibility preferences');
    }
  }

  /**
   * Apply saved preferences
   */
  function applyPreferences() {
    const prefs = loadPreferences();

    if (prefs.highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    }

    if (prefs.textSize) {
      document.documentElement.setAttribute('data-text-size', prefs.textSize);
    }

    if (prefs.dyslexiaFont) {
      document.documentElement.setAttribute('data-font', 'dyslexia');
    }

    if (prefs.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    }

    if (prefs.readingGuide) {
      document.documentElement.setAttribute('data-reading-guide', 'true');
    }
  }

  /**
   * Toggle high contrast mode
   */
  function toggleHighContrast() {
    const current = document.documentElement.getAttribute('data-high-contrast') === 'true';
    const newValue = !current;
    
    document.documentElement.setAttribute('data-high-contrast', newValue);
    
    const prefs = loadPreferences();
    prefs.highContrast = newValue;
    savePreferences(prefs);

    announce(newValue ? 'High contrast mode enabled' : 'High contrast mode disabled');
    return newValue;
  }

  /**
   * Toggle text size
   */
  function toggleTextSize() {
    const sizes = ['normal', 'large', 'larger'];
    const current = document.documentElement.getAttribute('data-text-size') || 'normal';
    const currentIndex = sizes.indexOf(current);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const nextSize = sizes[nextIndex];

    document.documentElement.setAttribute('data-text-size', nextSize);

    const prefs = loadPreferences();
    prefs.textSize = nextSize;
    savePreferences(prefs);

    announce(`Text size: ${nextSize}`);
    return nextSize;
  }

  /**
   * Toggle dyslexia-friendly font
   */
  function toggleDyslexiaFont() {
    const current = document.documentElement.getAttribute('data-font') === 'dyslexia';
    const newValue = !current;

    if (newValue) {
      document.documentElement.setAttribute('data-font', 'dyslexia');
    } else {
      document.documentElement.removeAttribute('data-font');
    }

    const prefs = loadPreferences();
    prefs.dyslexiaFont = newValue;
    savePreferences(prefs);

    announce(newValue ? 'Dyslexia-friendly font enabled' : 'Standard font restored');
    return newValue;
  }

  /**
   * Toggle reading guide
   */
  function toggleReadingGuide() {
    const current = document.documentElement.getAttribute('data-reading-guide') === 'true';
    const newValue = !current;

    document.documentElement.setAttribute('data-reading-guide', newValue);

    const prefs = loadPreferences();
    prefs.readingGuide = newValue;
    savePreferences(prefs);

    announce(newValue ? 'Reading guide enabled' : 'Reading guide disabled');
    return newValue;
  }

  // Make preference toggles globally available
  window.a11yToggleHighContrast = toggleHighContrast;
  window.a11yToggleTextSize = toggleTextSize;
  window.a11yToggleDyslexiaFont = toggleDyslexiaFont;
  window.a11yToggleReadingGuide = toggleReadingGuide;

  // ============================================================================
  // ACCESSIBILITY TOOLBAR
  // ============================================================================

  /**
   * Create accessibility toolbar
   */
  function createAccessibilityToolbar() {
    // Check if toolbar should be shown (user preference or URL param)
    const urlParams = new URLSearchParams(window.location.search);
    const showToolbar = urlParams.has('a11y-tools') || loadPreferences().showToolbar;

    if (!showToolbar) return;

    const toolbar = document.createElement('div');
    toolbar.className = 'a11y-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'Accessibility options');

    const buttons = [
      { icon: '🔲', label: 'Toggle high contrast', action: toggleHighContrast, pref: 'highContrast' },
      { icon: 'A+', label: 'Increase text size', action: toggleTextSize, pref: 'textSize' },
      { icon: '📖', label: 'Toggle dyslexia font', action: toggleDyslexiaFont, pref: 'dyslexiaFont' },
      { icon: '📏', label: 'Toggle reading guide', action: toggleReadingGuide, pref: 'readingGuide' }
    ];

    const prefs = loadPreferences();

    buttons.forEach(({ icon, label, action, pref }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = icon;
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      
      // Set pressed state
      if (prefs[pref]) {
        btn.setAttribute('aria-pressed', 'true');
      }

      btn.addEventListener('click', () => {
        const newState = action();
        btn.setAttribute('aria-pressed', newState ? 'true' : 'false');
      });

      toolbar.appendChild(btn);
    });

    document.body.appendChild(toolbar);
  }

  // ============================================================================
  // FORM ENHANCEMENTS
  // ============================================================================

  /**
   * Enhance form accessibility
   */
  function enhanceForms() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      // Add novalidate to use custom validation
      form.setAttribute('novalidate', '');

      // Find all required fields
      const requiredFields = form.querySelectorAll('[required], [aria-required="true"]');

      requiredFields.forEach(field => {
        // Ensure aria-required is set
        field.setAttribute('aria-required', 'true');

        // Add asterisk to associated label
        const label = form.querySelector(`label[for="${field.id}"]`);
        if (label && !label.querySelector('.required-indicator')) {
          const indicator = document.createElement('span');
          indicator.className = 'required-indicator';
          indicator.setAttribute('aria-hidden', 'true');
          indicator.textContent = ' *';
          label.appendChild(indicator);
        }
      });

      // Enhance validation messages
      form.addEventListener('submit', (e) => {
        const invalidFields = form.querySelectorAll(':invalid');

        if (invalidFields.length > 0) {
          e.preventDefault();

          // Create error summary
          let errorSummary = document.getElementById(`${form.id}-errors`);
          if (!errorSummary) {
            errorSummary = document.createElement('div');
            errorSummary.id = `${form.id}-errors`;
            errorSummary.className = 'error-summary';
            errorSummary.setAttribute('role', 'alert');
            errorSummary.setAttribute('tabindex', '-1');
            form.insertBefore(errorSummary, form.firstChild);
          }

          const errorList = document.createElement('ul');
          
          invalidFields.forEach(field => {
            // Mark field as invalid
            field.setAttribute('aria-invalid', 'true');
            
            // Create error message
            const errorId = `${field.id}-error`;
            let errorMsg = document.getElementById(errorId);
            
            if (!errorMsg) {
              errorMsg = document.createElement('div');
              errorMsg.id = errorId;
              errorMsg.className = 'field-error-message';
              errorMsg.setAttribute('role', 'alert');
              field.parentNode.appendChild(errorMsg);
            }

            errorMsg.textContent = field.validationMessage;
            field.setAttribute('aria-describedby', errorId);

            // Add to error summary
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${field.id}`;
            link.textContent = `${field.labels?.[0]?.textContent || field.name}: ${field.validationMessage}`;
            li.appendChild(link);
            errorList.appendChild(li);
          });

          errorSummary.innerHTML = '<h3>Please correct the following errors:</h3>';
          errorSummary.appendChild(errorList);

          // Focus error summary
          errorSummary.focus();
          announce(`Form has ${invalidFields.length} error${invalidFields.length > 1 ? 's' : ''}. Please correct them.`, { assertive: true });
        }
      });

      // Clear error state on input
      form.addEventListener('input', (e) => {
        const field = e.target;
        if (field.validity.valid && field.getAttribute('aria-invalid') === 'true') {
          field.setAttribute('aria-invalid', 'false');
          field.classList.add('touched');
          
          const errorMsg = document.getElementById(`${field.id}-error`);
          if (errorMsg) {
            errorMsg.textContent = '';
          }
        }
      });
    });
  }

  // ============================================================================
  // IMAGE ACCESSIBILITY
  // ============================================================================

  /**
   * Check for images without alt text (development warning)
   */
  function checkImageAccessibility() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      
      if (imagesWithoutAlt.length > 0) {
        console.warn(`[A11Y] Found ${imagesWithoutAlt.length} images without alt text:`);
        imagesWithoutAlt.forEach(img => {
          console.warn(`  - ${img.src}`);
        });
      }
    }
  }

  // ============================================================================
  // LINK ACCESSIBILITY
  // ============================================================================

  /**
   * Enhance external links
   */
  function enhanceExternalLinks() {
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="tillerstead"])');

    externalLinks.forEach(link => {
      // Add rel attributes for security
      link.setAttribute('rel', 'noopener noreferrer');

      // Add screen reader text if not present
      if (!link.querySelector('.sr-only') && !link.getAttribute('aria-label')) {
        const srText = document.createElement('span');
        srText.className = 'sr-only';
        srText.textContent = ' (opens in new window)';
        link.appendChild(srText);
      }

      // Set target if not already set
      if (!link.hasAttribute('target')) {
        link.setAttribute('target', '_blank');
      }
    });
  }

  // ============================================================================
  // HEADING STRUCTURE
  // ============================================================================

  /**
   * Check heading hierarchy (development warning)
   */
  function checkHeadingStructure() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      let issues = [];

      // Check for single h1
      const h1s = document.querySelectorAll('h1');
      if (h1s.length === 0) {
        issues.push('No H1 heading found on page');
      } else if (h1s.length > 1) {
        issues.push(`Multiple H1 headings found (${h1s.length})`);
      }

      // Check heading order
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName[1]);
        
        if (index > 0 && level > lastLevel + 1) {
          issues.push(`Skipped heading level: H${lastLevel} to H${level} ("${heading.textContent.substring(0, 30)}...")`);
        }
        
        lastLevel = level;
      });

      if (issues.length > 0) {
        console.warn('[A11Y] Heading structure issues:');
        issues.forEach(issue => console.warn(`  - ${issue}`));
      }
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  function init() {
    // Apply saved preferences first
    applyPreferences();

    // Create live regions for announcements
    createLiveRegion();
    createAssertiveRegion();

    // Initialize keyboard navigation
    initMenuKeyboardNav();
    initTabPanelKeyboardNav();
    initEscapeKeyHandler();
    initSkipLinks();

    // Enhance forms
    enhanceForms();

    // Enhance external links
    enhanceExternalLinks();

    // Development checks
    checkImageAccessibility();
    checkHeadingStructure();

    // Create toolbar if enabled
    createAccessibilityToolbar();

    // Announce page load for screen readers
    const pageTitle = document.title || 'Page';
    setTimeout(() => {
      announce(`${pageTitle} loaded`);
    }, 500);

    console.log('[A11Y] Accessibility features initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-initialize on dynamic content changes
  const observer = new MutationObserver(debounce(() => {
    initMenuKeyboardNav();
    initTabPanelKeyboardNav();
    enhanceForms();
  }, 250));

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
