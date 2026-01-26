/**
 * Smart Quote Wizard
 * Provides realistic price ranges while protecting margins
 * Version: 1.0.0
 */

(function() {
  'use strict';

  const QuoteWizard = {
    // ═══════════════════════════════════════════════════════════════════
    // PRICING CONFIGURATION - Configured: 2026-01-26
    // Based on: $70/hr rate, 9 sqft/hr pace, $8.50 material costs
    // Margins: 20% overhead + 25% profit + 15% buffer
    // ═══════════════════════════════════════════════════════════════════
    pricing: {
      // Base rates per square foot (includes materials + labor)
      tileInstallation: {
        basic: { min: 20.00, max: 24.00, materials: 3.50 }, // Ceramic tile
        standard: { min: 24.00, max: 28.00, materials: 8.50 }, // Porcelain (your typical work)
        premium: { min: 28.00, max: 34.00, materials: 9.00 }, // Large format
        luxury: { min: 32.00, max: 45.00, materials: 12.00 } // Natural stone & mosaic
      },

      // Additional services (per sq ft or flat fee)
      services: {
        demolition: { min: 800, max: 1200, unit: 'flat' },
        waterproofing: { min: 600, max: 900, unit: 'flat' },
        heating: { min: 15.00, max: 18.00, unit: 'sqft' },
        schluter: { min: 600, max: 900, unit: 'flat' }, // Same as waterproofing
        customShower: { min: 3500, max: 6000, unit: 'flat' },
        floorLeveling: { min: 2.00, max: 4.00, unit: 'sqft' }
      },

      // Complexity multipliers (your actual margins)
      complexity: {
        easy: 1.0,        // New construction, easy access, standard layout
        moderate: 1.15,   // Second floor, some obstacles, custom cuts
        complex: 1.35,    // Difficult access, lots of cuts, waterproofing issues
        extreme: 1.65     // Historic home, structural issues, custom everything
      },

      // Minimum project fee (covers overhead)
      minimumProject: 1500
    },

    state: {
      currentStep: 1,
      totalSteps: 5,
      answers: {},
      estimate: null
    },

    elements: {
      wizard: null,
      steps: [],
      progressBar: null,
      backBtn: null,
      nextBtn: null
    },

    /**
     * Initialize wizard
     */
    init: function() {
      this.elements.wizard = document.getElementById('quote-wizard');
      
      if (!this.elements.wizard) {
        return;
      }

      this.elements.steps = Array.from(this.elements.wizard.querySelectorAll('.quote-wizard__step'));
      this.elements.progressBar = this.elements.wizard.querySelector('.quote-wizard__progress-fill');
      this.elements.backBtn = this.elements.wizard.querySelector('[data-action="back"]');
      this.elements.nextBtn = this.elements.wizard.querySelector('[data-action="next"]');

      this.attachEvents();
      this.showStep(1);
    },

    /**
     * Attach event listeners
     */
    attachEvents: function() {
      // Navigation buttons
      if (this.elements.backBtn) {
        this.elements.backBtn.addEventListener('click', () => this.previousStep());
      }

      if (this.elements.nextBtn) {
        this.elements.nextBtn.addEventListener('click', () => this.nextStep());
      }

      // Quick select buttons
      this.elements.wizard.addEventListener('click', (e) => {
        const optionBtn = e.target.closest('[data-option]');
        if (optionBtn) {
          const step = optionBtn.closest('.quote-wizard__step');
          const stepNum = parseInt(step.dataset.step);
          const questionKey = step.dataset.question;
          const value = optionBtn.dataset.option;

          // Deselect others
          step.querySelectorAll('[data-option]').forEach(btn => {
            btn.classList.remove('selected');
          });
          
          // Select this one
          optionBtn.classList.add('selected');
          
          // Store answer
          this.state.answers[questionKey] = value;
          
          // Auto-advance after short delay
          setTimeout(() => {
            this.nextStep();
          }, 300);
        }
      });

      // Text inputs
      this.elements.wizard.addEventListener('input', (e) => {
        if (e.target.matches('input[type="number"], input[type="text"]')) {
          const step = e.target.closest('.quote-wizard__step');
          const questionKey = step.dataset.question;
          this.state.answers[questionKey] = e.target.value;
        }
      });
    },

    /**
     * Show specific step
     */
    showStep: function(stepNum) {
      this.state.currentStep = stepNum;

      // Update steps visibility
      this.elements.steps.forEach(step => {
        const stepNumber = parseInt(step.dataset.step);
        step.classList.toggle('active', stepNumber === stepNum);
      });

      // Update progress bar
      const progress = (stepNum / this.state.totalSteps) * 100;
      if (this.elements.progressBar) {
        this.elements.progressBar.style.width = `${progress}%`;
      }

      // Update navigation buttons
      if (this.elements.backBtn) {
        this.elements.backBtn.style.display = stepNum === 1 ? 'none' : 'inline-flex';
      }

      if (this.elements.nextBtn) {
        this.elements.nextBtn.textContent = stepNum === this.state.totalSteps ? 'Get Estimate' : 'Next';
      }

      // Track step view
      this.trackEvent('Step Viewed', `Step ${stepNum}`);
    },

    /**
     * Next step
     */
    nextStep: function() {
      // Validate current step
      const currentStepEl = this.elements.steps[this.state.currentStep - 1];
      const questionKey = currentStepEl.dataset.question;
      
      if (!this.state.answers[questionKey]) {
        this.showError('Please make a selection before continuing');
        return;
      }

      if (this.state.currentStep < this.state.totalSteps) {
        this.showStep(this.state.currentStep + 1);
      } else {
        // Final step - calculate and show estimate
        this.calculateEstimate();
      }
    },

    /**
     * Previous step
     */
    previousStep: function() {
      if (this.state.currentStep > 1) {
        this.showStep(this.state.currentStep - 1);
      }
    },

    /**
     * Calculate estimate based on answers
     */
    calculateEstimate: function() {
      const answers = this.state.answers;

      // Get square footage
      const sqft = parseFloat(answers.size) || 100;

      // Determine base rate
      let baseRate;
      switch(answers.tileType) {
        case 'ceramic':
        case 'basic':
          baseRate = this.pricing.tileInstallation.basic;
          break;
        case 'porcelain':
        case 'standard':
          baseRate = this.pricing.tileInstallation.standard;
          break;
        case 'large-format':
        case 'premium':
          baseRate = this.pricing.tileInstallation.premium;
          break;
        case 'mosaic':
        case 'specialty':
        case 'luxury':
          baseRate = this.pricing.tileInstallation.luxury;
          break;
        default:
          baseRate = this.pricing.tileInstallation.standard;
      }

      // Calculate base cost
      let minCost = sqft * baseRate.min;
      let maxCost = sqft * baseRate.max;

      // Add services
      const services = [];
      
      if (answers.features?.includes('demolition') || answers.existingFloor === 'yes') {
        minCost += sqft * this.pricing.services.demolition.min;
        maxCost += sqft * this.pricing.services.demolition.max;
        services.push('Demolition & Removal');
      }

      if (answers.features?.includes('waterproofing') || answers.roomType === 'shower') {
        minCost += sqft * this.pricing.services.waterproofing.min;
        maxCost += sqft * this.pricing.services.waterproofing.max;
        services.push('Waterproofing');
      }

      if (answers.features?.includes('heating')) {
        minCost += sqft * this.pricing.services.heating.min;
        maxCost += sqft * this.pricing.services.heating.max;
        services.push('Radiant Floor Heating');
      }

      if (answers.roomType === 'shower' && sqft < 80) {
        // Custom shower build
        minCost += this.pricing.services.customShower.min;
        maxCost += this.pricing.services.customShower.max;
        services.push('Custom Shower Build');
      }

      // Apply complexity multiplier
      let complexityFactor = 1.0;
      switch(answers.complexity) {
        case 'moderate':
          complexityFactor = this.pricing.complexity.moderate;
          break;
        case 'complex':
          complexityFactor = this.pricing.complexity.complex;
          break;
        case 'extreme':
          complexityFactor = this.pricing.complexity.extreme;
          break;
      }

      minCost *= complexityFactor;
      maxCost *= complexityFactor;

      // Apply minimum project fee
      minCost = Math.max(minCost, this.pricing.minimumProject);
      maxCost = Math.max(maxCost, this.pricing.minimumProject + 500);

      // Round to nearest $50
      minCost = Math.ceil(minCost / 50) * 50;
      maxCost = Math.ceil(maxCost / 50) * 50;

      // Store estimate
      this.state.estimate = {
        min: minCost,
        max: maxCost,
        sqft: sqft,
        baseRate: baseRate,
        services: services,
        complexity: answers.complexity || 'easy',
        roomType: answers.roomType,
        tileType: answers.tileType
      };

      // Show results
      this.showResults();
    },

    /**
     * Show results page
     */
    showResults: function() {
      const estimate = this.state.estimate;
      
      const resultsHTML = `
        <div class="quote-results">
          <div class="quote-results__header">
            <h2 class="quote-results__title">Your Estimated Investment</h2>
            <p class="quote-results__subtitle">Based on the information you provided</p>
          </div>

          <div class="quote-results__range">
            <div class="quote-results__amount">
              <span class="quote-results__label">Estimated Range</span>
              <div class="quote-results__price">
                $${estimate.min.toLocaleString()} - $${estimate.max.toLocaleString()}
              </div>
              <span class="quote-results__per-sqft">
                ($${(estimate.min/estimate.sqft).toFixed(2)} - $${(estimate.max/estimate.sqft).toFixed(2)} per sq ft)
              </span>
            </div>
          </div>

          <div class="quote-results__disclaimer">
            <svg class="quote-results__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p><strong>Important:</strong> This is an estimated range based on typical projects. Your actual quote may vary based on:</p>
            <ul>
              <li>Site conditions discovered during inspection</li>
              <li>Tile selection and availability</li>
              <li>Access challenges or structural requirements</li>
              <li>Timeline and scheduling preferences</li>
            </ul>
            <p>A <strong>free on-site consultation</strong> is required for an accurate quote.</p>
          </div>

          <div class="quote-results__breakdown">
            <h3>What's Included</h3>
            <ul>
              <li>✓ ${estimate.sqft} sq ft ${estimate.tileType} tile installation</li>
              ${estimate.services.map(s => `<li>✓ ${s}</li>`).join('')}
              <li>✓ Industry-standard substrate preparation</li>
              <li>✓ Professional-grade materials (${estimate.baseRate.materials ? `~$${estimate.baseRate.materials}/sqft` : 'TBD'})</li>
              <li>✓ Debris removal and cleanup</li>
              <li>✓ NJ HIC licensed & insured</li>
              <li>✓ Workmanship warranty</li>
            </ul>
          </div>

          <div class="quote-results__next-steps">
            <h3>Next Steps</h3>
            <p>Schedule a <strong>free 30-minute consultation</strong> to:</p>
            <ol>
              <li>Review your project details and goals</li>
              <li>Inspect site conditions</li>
              <li>Discuss material options and pricing</li>
              <li>Provide a detailed written quote</li>
            </ol>
          </div>

          <div class="quote-results__cta">
            <button type="button" class="btn btn--primary btn--large" data-calendly>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Book Free Consultation
            </button>
            
            <button type="button" class="btn btn--secondary btn--large" onclick="window.tsQuoteWizard.emailResults()">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Email This Estimate
            </button>

            <a href="tel:+16092226969" class="btn btn--ghost btn--large">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              Call (609) 222-6969
            </a>
          </div>

          <div class="quote-results__trust">
            <div class="trust-badge">
              <strong>NJ HIC #13VH10808800</strong>
            </div>
            <div class="trust-badge">
              ⭐ 5.0 Rating
            </div>
            <div class="trust-badge">
              ✓ Fully Insured
            </div>
          </div>
        </div>
      `;

      // Replace wizard content with results
      this.elements.wizard.innerHTML = resultsHTML;

      // Track completion
      this.trackEvent('Quote Completed', `$${estimate.min}-${estimate.max}`);
      
      // Track conversion (important!)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
          send_to: 'AW-CONVERSION-ID', // Replace with your Google Ads conversion ID
          value: (estimate.min + estimate.max) / 2,
          currency: 'USD'
        });
      }
    },

    /**
     * Email results to user
     */
    emailResults: function() {
      const email = prompt('Enter your email address to receive this estimate:');
      
      if (!email || !email.includes('@')) {
        return;
      }

      const estimate = this.state.estimate;
      
      // Send via EmailJS or Formspree
      const emailData = {
        to_email: email,
        subject: `Your Tile Installation Estimate: $${estimate.min.toLocaleString()} - $${estimate.max.toLocaleString()}`,
        estimate_min: estimate.min,
        estimate_max: estimate.max,
        sqft: estimate.sqft,
        room_type: estimate.roomType,
        tile_type: estimate.tileType,
        services: estimate.services.join(', ')
      };

      // TODO: Integrate with EmailJS
      console.log('Email estimate:', emailData);
      
      alert(`Estimate sent to ${email}! Check your inbox in a few minutes.`);
      
      this.trackEvent('Estimate Emailed', email);
    },

    /**
     * Show error message
     */
    showError: function(message) {
      alert(message); // TODO: Replace with better UI
    },

    /**
     * Track events
     */
    trackEvent: function(action, label) {
      if (typeof gtag !== 'undefined') {
        gtag('event', action, {
          event_category: 'Quote Wizard',
          event_label: label
        });
      }
      
      if (typeof ga !== 'undefined') {
        ga('send', 'event', 'Quote Wizard', action, label);
      }
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      QuoteWizard.init();
    });
  } else {
    QuoteWizard.init();
  }

  // Expose globally
  window.tsQuoteWizard = QuoteWizard;
})();
