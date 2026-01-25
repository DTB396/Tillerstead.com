/**
 * Lead Capture & Conversion Tracking System
 * Premium feature for capturing and scoring leads with analytics
 */

(function() {
  'use strict';

  // ==
  // LEAD CAPTURE SYSTEM
  // ==

  class LeadCaptureSystem {
    constructor() {
      this.leadScore = 0;
      this.leadData = {};
      this.interactions = [];
      this.init();
    }

    init() {
      this.trackUserBehavior();
      this.setupSmartForms();
      this.setupExitIntentPopup();
      this.setupProgressiveDisclosure();
      this.setupLeadScoring();
    }

    // Track User Behavior for Lead Scoring
    trackUserBehavior() {
      // Time on site
      const startTime = Date.now();
      window.addEventListener('beforeunload', () => {
        const timeOnSite = (Date.now() - startTime) / 1000;
        this.addInteraction('time_on_site', { seconds: timeOnSite });
      });

      // Page views
      this.addInteraction('page_view', { page: window.location.pathname });

      // Calculator usage
      document.addEventListener('click', (e) => {
        if (e.target.closest('[id^="calc-"]')) {
          this.addInteraction('calculator_used', { score: 10 });
          this.leadScore += 10;
        }
      });

      // Portfolio views
      const portfolioLinks = document.querySelectorAll('a[href*="portfolio"]');
      portfolioLinks.forEach(link => {
        link.addEventListener('click', () => {
          this.addInteraction('portfolio_view', { score: 5 });
          this.leadScore += 5;
        });
      });

      // Pricing page visit
      if (window.location.pathname.includes('pricing')) {
        this.addInteraction('pricing_view', { score: 15 });
        this.leadScore += 15;
      }

      // Service page engagement
      const serviceCards = document.querySelectorAll('[data-service]');
      serviceCards.forEach(card => {
        card.addEventListener('click', () => {
          this.addInteraction('service_interest', { 
            service: card.dataset.service,
            score: 8
          });
          this.leadScore += 8;
        });
      });
    }

    addInteraction(type, data) {
      this.interactions.push({
        type,
        data,
        timestamp: new Date().toISOString()
      });

      // Store in localStorage
      localStorage.setItem('tillerstead_interactions', JSON.stringify(this.interactions));
      
      // Check if we should show lead capture
      this.checkLeadCaptureThreshold();
    }

    // Smart Forms with Progressive Disclosure
    setupSmartForms() {
      const forms = document.querySelectorAll('.lead-capture-form');
      
      forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.captureLead(new FormData(form));
        });

        // Auto-save as user types
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
          input.addEventListener('input', () => {
            this.leadData[input.name] = input.value;
            this.saveLeadProgress();
          });
        });
      });
    }

    setupProgressiveDisclosure() {
      // Start with minimal fields, reveal more based on interest
      const progressiveForms = document.querySelectorAll('[data-progressive-form]');
      
      progressiveForms.forEach(form => {
        const step1 = form.querySelector('[data-step="1"]');
        const step2 = form.querySelector('[data-step="2"]');
        const step3 = form.querySelector('[data-step="3"]');

        // Show step 2 after email entered
        const emailInput = form.querySelector('input[type="email"]');
        if (emailInput) {
          emailInput.addEventListener('blur', () => {
            if (emailInput.validity.valid && step2) {
              step2.classList.remove('hidden');
              this.addInteraction('form_engagement', { step: 2, score: 5 });
              this.leadScore += 5;
            }
          });
        }

        // Show step 3 after phone entered
        const phoneInput = form.querySelector('input[type="tel"]');
        if (phoneInput) {
          phoneInput.addEventListener('blur', () => {
            if (phoneInput.value && step3) {
              step3.classList.remove('hidden');
              this.addInteraction('form_engagement', { step: 3, score: 10 });
              this.leadScore += 10;
            }
          });
        }
      });
    }

    // Exit Intent Popup
    setupExitIntentPopup() {
      let shown = false;
      const showPopup = () => {
        if (shown || this.leadScore < 20) return;
        
        const modal = document.getElementById('exit-intent-modal');
        if (modal) {
          modal.classList.add('show');
          shown = true;
          this.addInteraction('exit_intent_shown', { score: 0 });
        }
      };

      // Track mouse leaving viewport
      document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 0) {
          showPopup();
        }
      });

      // Mobile: track back button
      if ('onpopstate' in window) {
        window.addEventListener('popstate', showPopup);
      }
    }

    // Lead Scoring Algorithm
    setupLeadScoring() {
      // Scoring rules:
      // - Email provided: +25 points
      // - Phone provided: +20 points
      // - Calculator used: +10 points per use
      // - Pricing viewed: +15 points
      // - Portfolio viewed: +5 points per item
      // - Time on site >2min: +10 points
      // - Multiple page views: +5 points per page
      // - Form started: +15 points
      // - Quote requested: +30 points

      this.scoreThresholds = {
        cold: 0,      // 0-20 points
        warm: 20,     // 20-50 points
        hot: 50,      // 50-80 points
        qualified: 80 // 80+ points
      };
    }

    getLeadTemperature() {
      if (this.leadScore >= this.scoreThresholds.qualified) return 'qualified';
      if (this.leadScore >= this.scoreThresholds.hot) return 'hot';
      if (this.leadScore >= this.scoreThresholds.warm) return 'warm';
      return 'cold';
    }

    checkLeadCaptureThreshold() {
      // Show lead capture when user is "warm" or better
      if (this.leadScore >= this.scoreThresholds.warm && !this.hasContact()) {
        this.showInlineLeadCapture();
      }
    }

    hasContact() {
      return this.leadData.email || this.leadData.phone;
    }

    showInlineLeadCapture() {
      const banners = document.querySelectorAll('.smart-lead-banner');
      banners.forEach(banner => {
        if (banner.dataset.shown !== 'true') {
          banner.classList.add('show');
          banner.dataset.shown = 'true';
        }
      });
    }

    async captureLead(formData) {
      const data = Object.fromEntries(formData);
      
      // Merge with existing lead data
      this.leadData = { ...this.leadData, ...data };

      // Add lead score and temperature
      this.leadData.score = this.leadScore;
      this.leadData.temperature = this.getLeadTemperature();
      this.leadData.interactions = this.interactions;
      this.leadData.timestamp = new Date().toISOString();

      // Send to backend
      try {
        const response = await fetch('/api/leads/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.leadData)
        });

        if (response.ok) {
          this.showThankYou();
          this.triggerLeadNotification();
          
          // Track conversion
          if (typeof gtag !== 'undefined') {
            gtag('event', 'generate_lead', {
              value: this.leadScore,
              currency: 'USD'
            });
          }
        }
      } catch (error) {
        console.error('Lead capture error:', error);
        // Fallback: save to localStorage
        this.saveLeadLocally();
      }
    }

    saveLeadProgress() {
      localStorage.setItem('tillerstead_lead_progress', JSON.stringify(this.leadData));
    }

    saveLeadLocally() {
      const leads = JSON.parse(localStorage.getItem('tillerstead_leads') || '[]');
      leads.push(this.leadData);
      localStorage.setItem('tillerstead_leads', JSON.stringify(leads));
    }

    showThankYou() {
      const modal = document.getElementById('thank-you-modal');
      if (modal) {
        modal.classList.add('show');
      }
    }

    triggerLeadNotification() {
      // In production, trigger real-time notification to sales team
      // console.log('New lead captured:', this.leadData); // AUTO-DISABLED
    }
  }

  // ==
  // CONVERSION ANALYTICS
  // ==

  class ConversionAnalytics {
    constructor() {
      this.events = [];
      this.init();
    }

    init() {
      this.trackConversionFunnel();
      this.setupHeatmapTracking();
      this.trackFormAbandonment();
      this.trackCTAClicks();
    }

    trackConversionFunnel() {
      const funnelSteps = {
        'landing': () => true,
        'service_view': () => !!document.querySelector('[data-service]'),
        'calculator_use': () => this.hasUsedCalculator(),
        'contact_intent': () => this.hasContactIntent(),
        'lead_captured': () => this.hasSubmittedForm()
      };

      Object.entries(funnelSteps).forEach(([step, condition]) => {
        if (condition()) {
          this.trackEvent('funnel_step', { step });
        }
      });
    }

    setupHeatmapTracking() {
      // Track clicks for heatmap
      document.addEventListener('click', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        const element = e.target.tagName;
        
        this.trackEvent('click', {
          x,
          y,
          element,
          page: window.location.pathname
        });
      });

      // Track scroll depth
      let maxScroll = 0;
      window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent;
          if (scrollPercent >= 25 && scrollPercent < 50) {
            this.trackEvent('scroll_depth', { depth: 25 });
          } else if (scrollPercent >= 50 && scrollPercent < 75) {
            this.trackEvent('scroll_depth', { depth: 50 });
          } else if (scrollPercent >= 75 && scrollPercent < 100) {
            this.trackEvent('scroll_depth', { depth: 75 });
          } else if (scrollPercent >= 100) {
            this.trackEvent('scroll_depth', { depth: 100 });
          }
        }
      });
    }

    trackFormAbandonment() {
      const forms = document.querySelectorAll('form');
      
      forms.forEach(form => {
        let formStarted = false;
        
        form.addEventListener('focus', () => {
          if (!formStarted) {
            formStarted = true;
            this.trackEvent('form_started', { form: form.id || form.className });
          }
        }, true);

        form.addEventListener('submit', () => {
          this.trackEvent('form_submitted', { form: form.id || form.className });
        });

        window.addEventListener('beforeunload', () => {
          if (formStarted && !this.hasSubmittedForm()) {
            this.trackEvent('form_abandoned', { form: form.id || form.className });
          }
        });
      });
    }

    trackCTAClicks() {
      const ctas = document.querySelectorAll('.btn--primary, .cta-button, [data-cta]');
      
      ctas.forEach(cta => {
        cta.addEventListener('click', () => {
          this.trackEvent('cta_click', {
            text: cta.textContent.trim(),
            href: cta.href || '',
            location: this.getElementPosition(cta)
          });
        });
      });
    }

    trackEvent(eventName, data) {
      const event = {
        name: eventName,
        data,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        sessionId: this.getSessionId()
      };

      this.events.push(event);
      
      // Send to analytics backend
      this.sendToAnalytics(event);
      
      // Store locally
      this.saveEventsLocally();
    }

    async sendToAnalytics(event) {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
      } catch (error) {
        console.error('Analytics error:', error);
      }
    }

    saveEventsLocally() {
      localStorage.setItem('tillerstead_analytics', JSON.stringify(this.events.slice(-100)));
    }

    getSessionId() {
      let sessionId = sessionStorage.getItem('tillerstead_session_id');
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('tillerstead_session_id', sessionId);
      }
      return sessionId;
    }

    getElementPosition(element) {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      };
    }

    hasUsedCalculator() {
      return localStorage.getItem('tillerstead_calc_used') === 'true';
    }

    hasContactIntent() {
      return localStorage.getItem('tillerstead_contact_intent') === 'true';
    }

    hasSubmittedForm() {
      return localStorage.getItem('tillerstead_form_submitted') === 'true';
    }
  }

  // Initialize systems
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.leadCapture = new LeadCaptureSystem();
      window.analytics = new ConversionAnalytics();
    });
  } else {
    window.leadCapture = new LeadCaptureSystem();
    window.analytics = new ConversionAnalytics();
  }

})();
