/**
 * Calendly Integration System
 * Provides easy booking integration across the site
 * Version: 1.0.0
 */

(function() {
  'use strict';

  const CalendlyIntegration = {
    // Configuration
    config: {
      url: 'https://calendly.com/dtb33-pm/30min',
      prefill: {
        name: '',
        email: '',
        customAnswers: {}
      },
      utm: {
        utmCampaign: '',
        utmSource: '',
        utmMedium: '',
        utmContent: '',
        utmTerm: ''
      }
    },

    /**
     * Initialize Calendly widget
     * @param {string} elementId - Container element ID
     * @param {Object} options - Custom options
     */
    initInlineWidget: function(elementId, options = {}) {
      const container = document.getElementById(elementId);
      if (!container) {
        console.warn(`Calendly: Element #${elementId} not found`);
        return;
      }

      // Load Calendly script if not already loaded
      if (!window.Calendly) {
        this.loadScript(() => {
          this.renderWidget(container, options);
        });
      } else {
        this.renderWidget(container, options);
      }
    },

    /**
     * Render inline widget
     */
    renderWidget: function(container, options) {
      const settings = { ...this.config, ...options };
      
      window.Calendly.initInlineWidget({
        url: settings.url,
        parentElement: container,
        prefill: settings.prefill,
        utm: settings.utm
      });

      this.trackEvent('Widget Loaded', settings.url);
    },

    /**
     * Open Calendly popup
     * @param {Object} options - Custom options
     */
    openPopup: function(options = {}) {
      const settings = { ...this.config, ...options };

      if (!window.Calendly) {
        this.loadScript(() => {
          window.Calendly.initPopupWidget({ url: settings.url });
          this.trackEvent('Popup Opened', settings.url);
        });
      } else {
        window.Calendly.initPopupWidget({ url: settings.url });
        this.trackEvent('Popup Opened', settings.url);
      }
    },

    /**
     * Load Calendly script dynamically
     */
    loadScript: function(callback) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = callback;
      document.head.appendChild(script);

      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      document.head.appendChild(link);
    },

    /**
     * Attach to buttons with data-calendly attribute
     */
    attachToButtons: function() {
      const buttons = document.querySelectorAll('[data-calendly]');
      
      buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          
          const url = button.dataset.calendly || this.config.url;
          const prefillName = button.dataset.calendlyName || '';
          const prefillEmail = button.dataset.calendlyEmail || '';
          
          this.openPopup({
            url: url,
            prefill: {
              name: prefillName,
              email: prefillEmail
            }
          });
        });
      });

      this.trackEvent('Buttons Attached', buttons.length);
    },

    /**
     * Prefill from URL parameters
     */
    getPrefillFromURL: function() {
      const urlParams = new URLSearchParams(window.location.search);
      return {
        name: urlParams.get('name') || '',
        email: urlParams.get('email') || '',
        customAnswers: {
          a1: urlParams.get('project_type') || '',
          a2: urlParams.get('project_size') || '',
          a3: urlParams.get('timeline') || ''
        }
      };
    },

    /**
     * Get UTM parameters from URL
     */
    getUTMFromURL: function() {
      const urlParams = new URLSearchParams(window.location.search);
      return {
        utmCampaign: urlParams.get('utm_campaign') || '',
        utmSource: urlParams.get('utm_source') || '',
        utmMedium: urlParams.get('utm_medium') || '',
        utmContent: urlParams.get('utm_content') || '',
        utmTerm: urlParams.get('utm_term') || ''
      };
    },

    /**
     * Track events with Google Analytics
     */
    trackEvent: function(action, label) {
      if (typeof gtag !== 'undefined') {
        gtag('event', action, {
          event_category: 'Calendly',
          event_label: label
        });
      }
      
      if (typeof ga !== 'undefined') {
        ga('send', 'event', 'Calendly', action, label);
      }
    },

    /**
     * Initialize on page load
     */
    init: function() {
      // Auto-attach to buttons
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.attachToButtons();
        });
      } else {
        this.attachToButtons();
      }

      // Auto-initialize inline widgets
      const inlineContainers = document.querySelectorAll('.calendly-inline-widget');
      inlineContainers.forEach(container => {
        const url = container.dataset.url || this.config.url;
        this.initInlineWidget(container.id, { url: url });
      });
    }
  };

  // Listen for Calendly events
  window.addEventListener('message', function(e) {
    if (e.origin === 'https://calendly.com' && e.data.event) {
      switch(e.data.event) {
        case 'calendly.event_scheduled':
          CalendlyIntegration.trackEvent('Event Scheduled', 'Success');
          // Redirect to success page
          if (window.location.pathname !== '/success.html') {
            setTimeout(() => {
              window.location.href = '/success.html?booking=confirmed';
            }, 2000);
          }
          break;
        case 'calendly.profile_page_viewed':
          CalendlyIntegration.trackEvent('Profile Viewed', '');
          break;
        case 'calendly.event_type_viewed':
          CalendlyIntegration.trackEvent('Event Type Viewed', e.data.event_type);
          break;
        case 'calendly.date_and_time_selected':
          CalendlyIntegration.trackEvent('Date Selected', '');
          break;
      }
    }
  });

  // Expose globally
  window.tsCalendly = CalendlyIntegration;

  // Auto-initialize
  CalendlyIntegration.init();
})();
