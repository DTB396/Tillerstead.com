/**
 * Haptic Feedback Utilities
 * Cross-platform vibration API wrapper
 */

class HapticFeedback {
  constructor() {
    this.isSupported = 'vibrate' in navigator;
    this.enabled = this.loadPreference();
  }

  /**
   * Trigger haptic feedback
   * @param {string} type - 'light', 'medium', 'heavy', 'success', 'warning', 'error'
   */
  trigger(type = 'light') {
    if (!this.isSupported || !this.enabled) return;

    const patterns = {
      // Basic feedback
      light: 10,
      medium: 20,
      heavy: 30,
      
      // Semantic feedback
      success: [10, 50, 10],
      warning: [20, 100, 20],
      error: [30, 100, 30, 100, 30],
      
      // Interaction feedback
      tap: 10,
      longPress: 50,
      swipe: [10, 30, 10],
      
      // UI feedback
      toggle: 15,
      selection: 5,
      notification: [20, 100, 20, 100, 20]
    };

    const pattern = patterns[type] || patterns.light;
    navigator.vibrate(pattern);
  }

  /**
   * Cancel ongoing vibration
   */
  cancel() {
    if (this.isSupported) {
      navigator.vibrate(0);
    }
  }

  /**
   * Enable/disable haptic feedback
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    this.savePreference(enabled);
  }

  /**
   * Check if haptics are enabled
   */
  isEnabled() {
    return this.enabled && this.isSupported;
  }

  /**
   * Save preference to localStorage
   */
  savePreference(enabled) {
    try {
      localStorage.setItem('tillerstead-haptics-enabled', enabled ? '1' : '0');
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Load preference from localStorage
   */
  loadPreference() {
    try {
      const stored = localStorage.getItem('tillerstead-haptics-enabled');
      return stored === null ? true : stored === '1';
    } catch (e) {
      return true; // Default enabled
    }
  }
}

// Create singleton instance
const haptics = new HapticFeedback();

// Add global helper functions
window.hapticFeedback = (type) => haptics.trigger(type);
window.haptics = haptics;

// Auto-attach to common interactive elements
document.addEventListener('DOMContentLoaded', () => {
  // Buttons
  document.addEventListener('click', (e) => {
    const button = e.target.closest('button, .btn, [role="button"]');
    if (button && !button.disabled) {
      haptics.trigger('tap');
    }
  }, { passive: true });

  // Links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (link && !link.classList.contains('no-haptic')) {
      haptics.trigger('light');
    }
  }, { passive: true });

  // Form inputs
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('focus', () => haptics.trigger('selection'), { passive: true });
  });

  // Checkboxes and radios
  const toggles = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', () => haptics.trigger('toggle'), { passive: true });
  });

  // Form submission
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', () => haptics.trigger('success'), { passive: true });
  });
});

haptics;
