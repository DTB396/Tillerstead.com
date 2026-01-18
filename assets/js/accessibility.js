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
   * Detect system/browser accessibility preferences
   * Auto-enables features based on OS/browser settings
   */
  function detectSystemPreferences() {
    const detected = {};

    // Detect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      detected.reducedMotion = true;
      document.documentElement.classList.add('reduce-motion');
      console.log('[A11Y] Detected: prefers-reduced-motion');
    }

    // Detect high contrast / forced colors (Windows High Contrast Mode)
    if (window.matchMedia('(forced-colors: active)').matches) {
      detected.highContrast = true;
      detected.forcedColors = true;
      document.documentElement.setAttribute('data-high-contrast', 'true');
      document.documentElement.setAttribute('data-forced-colors', 'true');
      console.log('[A11Y] Detected: forced-colors (Windows High Contrast)');
    }

    // Detect prefers-contrast: more (macOS/iOS increase contrast)
    if (window.matchMedia('(prefers-contrast: more)').matches) {
      detected.highContrast = true;
      document.documentElement.setAttribute('data-high-contrast', 'true');
      console.log('[A11Y] Detected: prefers-contrast: more');
    }

    // Detect prefers-contrast: less
    if (window.matchMedia('(prefers-contrast: less)').matches) {
      detected.lowContrast = true;
      document.documentElement.setAttribute('data-low-contrast', 'true');
      console.log('[A11Y] Detected: prefers-contrast: less');
    }

    // Detect color scheme preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      detected.darkMode = true;
      document.documentElement.setAttribute('data-color-scheme', 'dark');
      console.log('[A11Y] Detected: prefers-color-scheme: dark');
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      detected.lightMode = true;
      document.documentElement.setAttribute('data-color-scheme', 'light');
    }

    // Detect inverted colors (iOS accessibility)
    if (window.matchMedia('(inverted-colors: inverted)').matches) {
      detected.invertedColors = true;
      document.documentElement.setAttribute('data-inverted-colors', 'true');
      console.log('[A11Y] Detected: inverted-colors');
    }

    // Detect transparency preference (reduce transparency - macOS)
    if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches) {
      detected.reducedTransparency = true;
      document.documentElement.setAttribute('data-reduced-transparency', 'true');
      console.log('[A11Y] Detected: prefers-reduced-transparency');
    }

    // Detect pointer type (touch vs mouse)
    if (window.matchMedia('(pointer: coarse)').matches) {
      detected.touchDevice = true;
      document.documentElement.setAttribute('data-pointer', 'coarse');
      // Increase touch targets for touch devices
      document.documentElement.classList.add('touch-friendly');
      console.log('[A11Y] Detected: coarse pointer (touch device)');
    }

    // Detect hover capability
    if (window.matchMedia('(hover: none)').matches) {
      detected.noHover = true;
      document.documentElement.setAttribute('data-hover', 'none');
      console.log('[A11Y] Detected: no hover capability');
    }

    // Detect screen reader hints (limited detection)
    // Note: Direct screen reader detection is unreliable and privacy-invasive
    // Instead, we ensure all ARIA is always active

    return detected;
  }

  /**
   * Listen for changes to system preferences
   */
  function watchSystemPreferences() {
    // Watch for reduced motion changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('reduce-motion');
        announce('Reduced motion enabled');
      } else {
        document.documentElement.classList.remove('reduce-motion');
        announce('Reduced motion disabled');
      }
    });

    // Watch for high contrast changes
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    contrastQuery.addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.setAttribute('data-high-contrast', 'true');
        announce('High contrast mode enabled');
      } else {
        // Only remove if not forced colors
        if (!window.matchMedia('(forced-colors: active)').matches) {
          document.documentElement.removeAttribute('data-high-contrast');
        }
      }
    });

    // Watch for forced colors changes (Windows High Contrast)
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
    forcedColorsQuery.addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.setAttribute('data-high-contrast', 'true');
        document.documentElement.setAttribute('data-forced-colors', 'true');
        announce('Windows High Contrast Mode detected');
      } else {
        document.documentElement.removeAttribute('data-forced-colors');
        // Check if user manually enabled high contrast
        const prefs = loadPreferences();
        if (!prefs.highContrast) {
          document.documentElement.removeAttribute('data-high-contrast');
        }
      }
    });

    // Watch for color scheme changes
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkQuery.addEventListener('change', (e) => {
      document.documentElement.setAttribute('data-color-scheme', e.matches ? 'dark' : 'light');
    });

    // Watch for pointer type changes (e.g., connecting mouse to tablet)
    const pointerQuery = window.matchMedia('(pointer: coarse)');
    pointerQuery.addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.setAttribute('data-pointer', 'coarse');
        document.documentElement.classList.add('touch-friendly');
      } else {
        document.documentElement.setAttribute('data-pointer', 'fine');
        document.documentElement.classList.remove('touch-friendly');
      }
    });
  }

  /**
   * Apply saved preferences (user overrides)
   */
  function applyPreferences() {
    // First, detect and apply system preferences
    const systemPrefs = detectSystemPreferences();
    
    // Then, apply user-saved preferences (these override system where applicable)
    const prefs = loadPreferences();

    // User preference for high contrast overrides system
    if (prefs.highContrast === true) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    } else if (prefs.highContrast === false && !systemPrefs.highContrast && !systemPrefs.forcedColors) {
      document.documentElement.removeAttribute('data-high-contrast');
    }

    if (prefs.textSize) {
      document.documentElement.setAttribute('data-text-size', prefs.textSize);
    }

    if (prefs.dyslexiaFont) {
      document.documentElement.setAttribute('data-font', 'dyslexia');
    }

    // User can force reduced motion even if system doesn't prefer it
    if (prefs.reducedMotion === true) {
      document.documentElement.classList.add('reduce-motion');
    }

    if (prefs.readingGuide) {
      document.documentElement.setAttribute('data-reading-guide', 'true');
    }

    if (prefs.largerCursor) {
      document.documentElement.setAttribute('data-larger-cursor', 'true');
    }

    if (prefs.focusHighlight) {
      document.documentElement.setAttribute('data-focus-highlight', 'true');
    }

    // Start watching for system preference changes
    watchSystemPreferences();
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

  // ============================================================================
  // TEXT-TO-SPEECH (Read Aloud) - For Blind/Low Vision/Reading Disabilities
  // ============================================================================

  /**
   * Text-to-Speech engine using Web Speech API
   * Helps users who are blind, have low vision, dyslexia, or reading difficulties
   */
  const TextToSpeech = {
    synth: window.speechSynthesis,
    utterance: null,
    isReading: false,
    isPaused: false,
    currentElement: null,
    rate: 1.0,
    pitch: 1.0,
    voice: null,

    /**
     * Get available voices
     */
    getVoices() {
      return this.synth ? this.synth.getVoices() : [];
    },

    /**
     * Set preferred voice
     */
    setVoice(voiceName) {
      const voices = this.getVoices();
      this.voice = voices.find(v => v.name === voiceName) || 
                   voices.find(v => v.lang.startsWith('en')) ||
                   voices[0];
      
      const prefs = loadPreferences();
      prefs.ttsVoice = voiceName;
      savePreferences(prefs);
    },

    /**
     * Set speech rate (0.5 - 2.0)
     */
    setRate(rate) {
      this.rate = Math.max(0.5, Math.min(2.0, rate));
      const prefs = loadPreferences();
      prefs.ttsRate = this.rate;
      savePreferences(prefs);
    },

    /**
     * Speak text
     */
    speak(text, options = {}) {
      if (!this.synth) {
        console.warn('[A11Y] Speech synthesis not supported');
        return false;
      }

      // Cancel any ongoing speech
      this.stop();

      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.rate = options.rate || this.rate;
      this.utterance.pitch = options.pitch || this.pitch;
      this.utterance.voice = this.voice;

      // Events
      this.utterance.onstart = () => {
        this.isReading = true;
        document.documentElement.setAttribute('data-tts-active', 'true');
        if (this.currentElement) {
          this.currentElement.classList.add('tts-reading');
        }
      };

      this.utterance.onend = () => {
        this.isReading = false;
        this.isPaused = false;
        document.documentElement.removeAttribute('data-tts-active');
        if (this.currentElement) {
          this.currentElement.classList.remove('tts-reading');
          this.currentElement = null;
        }
      };

      this.utterance.onerror = (e) => {
        console.warn('[A11Y] TTS Error:', e.error);
        this.isReading = false;
      };

      this.synth.speak(this.utterance);
      return true;
    },

    /**
     * Read element content
     */
    readElement(element) {
      if (!element) return;
      
      this.currentElement = element;
      const text = element.textContent || element.innerText;
      
      if (text.trim()) {
        this.speak(text.trim());
      }
    },

    /**
     * Read entire page content
     */
    readPage() {
      const main = document.querySelector('main, [role="main"], #main-content');
      if (main) {
        this.readElement(main);
        announce('Reading page content');
      }
    },

    /**
     * Read selected text
     */
    readSelection() {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text) {
        this.speak(text);
        announce('Reading selected text');
      } else {
        announce('No text selected');
      }
    },

    /**
     * Pause reading
     */
    pause() {
      if (this.synth && this.isReading) {
        this.synth.pause();
        this.isPaused = true;
        announce('Reading paused');
      }
    },

    /**
     * Resume reading
     */
    resume() {
      if (this.synth && this.isPaused) {
        this.synth.resume();
        this.isPaused = false;
        announce('Reading resumed');
      }
    },

    /**
     * Stop reading
     */
    stop() {
      if (this.synth) {
        this.synth.cancel();
        this.isReading = false;
        this.isPaused = false;
        document.documentElement.removeAttribute('data-tts-active');
        if (this.currentElement) {
          this.currentElement.classList.remove('tts-reading');
          this.currentElement = null;
        }
      }
    },

    /**
     * Toggle reading state
     */
    toggle() {
      if (this.isReading && !this.isPaused) {
        this.pause();
      } else if (this.isPaused) {
        this.resume();
      } else {
        this.readPage();
      }
    },

    /**
     * Initialize TTS with saved preferences
     */
    init() {
      if (!this.synth) return;

      // Load saved preferences
      const prefs = loadPreferences();
      if (prefs.ttsRate) this.rate = prefs.ttsRate;
      if (prefs.ttsPitch) this.pitch = prefs.ttsPitch;

      // Wait for voices to load
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          const voices = this.getVoices();
          if (prefs.ttsVoice) {
            this.setVoice(prefs.ttsVoice);
          } else if (voices.length > 0) {
            // Prefer English voice
            this.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
          }
        };
      }

      console.log('[A11Y] Text-to-Speech initialized');
    }
  };

  // Make TTS globally available
  window.a11yTTS = TextToSpeech;
  window.a11yReadPage = () => TextToSpeech.readPage();
  window.a11yReadSelection = () => TextToSpeech.readSelection();
  window.a11yStopReading = () => TextToSpeech.stop();
  window.a11yPauseReading = () => TextToSpeech.pause();
  window.a11yResumeReading = () => TextToSpeech.resume();

  /**
   * Toggle text-to-speech
   */
  function toggleTextToSpeech() {
    TextToSpeech.toggle();
    return TextToSpeech.isReading;
  }

  window.a11yToggleTextToSpeech = toggleTextToSpeech;

  // ============================================================================
  // DEAF/HARD OF HEARING SUPPORT
  // ============================================================================

  /**
   * Visual alerts for deaf users
   * Converts audio cues to visual feedback
   */
  const VisualAlerts = {
    /**
     * Flash the screen for urgent alerts
     */
    flash(color = '#ffff00', duration = 200) {
      const overlay = document.createElement('div');
      overlay.className = 'a11y-visual-alert';
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: ${color};
        opacity: 0.5;
        z-index: 100000;
        pointer-events: none;
        animation: a11y-flash ${duration}ms ease-out;
      `;
      document.body.appendChild(overlay);
      
      setTimeout(() => overlay.remove(), duration);
    },

    /**
     * Show visual notification
     */
    notify(message, options = {}) {
      const notification = document.createElement('div');
      notification.className = 'a11y-visual-notification';
      notification.setAttribute('role', 'alert');
      notification.setAttribute('aria-live', 'assertive');
      notification.innerHTML = `
        <span class="notification-icon" aria-hidden="true">${options.icon || 'ℹ️'}</span>
        <span class="notification-message">${message}</span>
      `;
      
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${options.background || '#1a2a3a'};
        color: ${options.color || '#ffffff'};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 100000;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;
        max-width: 400px;
        animation: a11y-slide-in 0.3s ease-out;
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'a11y-slide-out 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
      }, options.duration || 5000);
    },

    /**
     * Convert audio events to visual
     */
    convertAudioToVisual() {
      // Override browser beep/alert sounds with visual
      const originalAlert = window.alert;
      window.alert = (message) => {
        this.notify(message, { icon: '⚠️' });
        // Also show native alert for screen readers
        originalAlert(message);
      };
    }
  };

  window.a11yVisualAlerts = VisualAlerts;

  /**
   * Ensure all media has captions indicator
   */
  function checkMediaCaptions() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
      const hasTrack = video.querySelector('track[kind="captions"], track[kind="subtitles"]');
      
      if (!hasTrack) {
        // Add warning for developers
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.warn('[A11Y] Video without captions:', video.src || video.querySelector('source')?.src);
        }
        
        // Add visual indicator that captions are not available
        const wrapper = video.parentElement;
        if (wrapper && !wrapper.querySelector('.no-captions-warning')) {
          const warning = document.createElement('div');
          warning.className = 'no-captions-warning';
          warning.setAttribute('role', 'note');
          warning.innerHTML = '<span aria-hidden="true">🔇</span> <span>Captions not available for this video</span>';
          wrapper.appendChild(warning);
        }
      }
    });
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

    // Initialize Text-to-Speech
    TextToSpeech.init();

    // Initialize visual alerts for deaf users
    VisualAlerts.convertAudioToVisual();

    // Check media for captions
    checkMediaCaptions();

    // Development checks
    checkImageAccessibility();
    checkHeadingStructure();

    // Create toolbar if enabled
    createAccessibilityToolbar();

    // Add keyboard shortcut for read aloud (Alt+R)
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'r') {
        e.preventDefault();
        toggleTextToSpeech();
      }
      // Alt+S to stop reading
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        TextToSpeech.stop();
      }
      // Alt+P to pause/resume
      if (e.altKey && e.key === 'p') {
        e.preventDefault();
        if (TextToSpeech.isPaused) {
          TextToSpeech.resume();
        } else {
          TextToSpeech.pause();
        }
      }
    });

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
