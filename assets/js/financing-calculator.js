/**
 * TillerPro™ Financing Calculator
 * Monthly payment calculator with Truth in Lending Act compliance
 * 
 * @version 1.0.0
 * @author Tillerstead LLC
 */

(function() {
  'use strict';

  class FinancingCalculator {
    constructor(config) {
      this.config = config || window.TillerProConfig;
      this.financing = this.config?.financing || this.getDefaultConfig();
    }

    /**
     * Get default financing configuration
     */
    getDefaultConfig() {
      return {
        enabled: true,
        
        // Finance partners
        partners: [
          {
            id: 'lightstream',
            name: 'LightStream',
            logo: '/assets/img/partners/lightstream.png',
            aprRange: { min: 5.99, max: 24.99 },
            termsMonths: [12, 24, 36, 48, 60, 72, 84],
            minAmount: 5000,
            maxAmount: 100000,
            url: 'https://www.lightstream.com/',
            disclosure: 'Rate is quoted with AutoPay discount. AutoPay discount is only available prior to loan funding. Rates without AutoPay are 0.50% points higher. Subject to credit approval. Conditions and limitations apply.'
          },
          {
            id: 'greensky',
            name: 'GreenSky',
            logo: '/assets/img/partners/greensky.png',
            aprRange: { min: 0.00, max: 17.99 },
            termsMonths: [12, 24, 36, 48, 60, 72],
            minAmount: 1000,
            maxAmount: 55000,
            promotions: ['12 months same as cash', '6 months deferred interest'],
            url: 'https://www.greensky.com/',
            disclosure: 'GreenSky® financing is subject to credit approval. Minimum monthly payments required. See store for details.'
          }
        ],
        
        // Default calculation settings
        defaults: {
          apr: 9.99,
          termMonths: 60,
          estimatedCreditScore: 'excellent' // excellent, good, fair
        },
        
        // Credit score tiers
        creditTiers: {
          excellent: { min: 740, aprAdjustment: 0 },
          good: { min: 670, aprAdjustment: 2.0 },
          fair: { min: 580, aprAdjustment: 5.0 },
          poor: { min: 300, aprAdjustment: 10.0 }
        },
        
        // Truth in Lending disclosures
        disclosures: {
          apr: 'APR (Annual Percentage Rate) represents the cost of credit as a yearly rate.',
          financeCharge: 'The dollar amount the credit will cost you.',
          amountFinanced: 'The amount of credit provided to you or on your behalf.',
          totalPayments: 'The amount you will have paid after you have made all payments as scheduled.',
          paymentSchedule: 'Number and amounts of payments, and when payments are due.',
          latePayment: 'Late payment fees may apply if payment is not received by the due date.',
          prepayment: 'If you pay off early, you may or may not be entitled to a refund of part of the finance charge.',
          security: 'This credit agreement is not secured by collateral.',
          assumption: 'Someone buying your home cannot assume the remainder of the debt on the original terms.',
          creditCheck: 'Applying for financing will result in a credit inquiry which may affect your credit score.'
        }
      };
    }

    /**
     * Calculate monthly payment
     * @param {number} principal - Loan amount
     * @param {number} annualRate - Annual interest rate (as percentage, e.g., 9.99)
     * @param {number} termMonths - Loan term in months
     * @returns {number} Monthly payment
     */
    calculateMonthlyPayment(principal, annualRate, termMonths) {
      if (annualRate === 0) {
        // 0% APR (promotional)
        return principal / termMonths;
      }
      
      const monthlyRate = annualRate / 100 / 12;
      const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                      (Math.pow(1 + monthlyRate, termMonths) - 1);
      
      return payment;
    }

    /**
     * Calculate total interest paid
     * @param {number} principal - Loan amount
     * @param {number} monthlyPayment - Monthly payment
     * @param {number} termMonths - Loan term in months
     * @returns {number} Total interest
     */
    calculateTotalInterest(principal, monthlyPayment, termMonths) {
      const totalPaid = monthlyPayment * termMonths;
      return totalPaid - principal;
    }

    /**
     * Get estimated APR based on credit tier
     * @param {string} creditTier - Credit tier (excellent, good, fair, poor)
     * @param {string} partnerId - Finance partner ID
     * @returns {number} Estimated APR
     */
    getEstimatedAPR(creditTier, partnerId) {
      const partner = this.financing.partners.find(p => p.id === partnerId);
      if (!partner) return this.financing.defaults.apr;
      
      const tier = this.financing.creditTiers[creditTier];
      if (!tier) return partner.aprRange.min;
      
      // Base APR is minimum for excellent credit
      let apr = partner.aprRange.min + tier.aprAdjustment;
      
      // Cap at partner's maximum APR
      apr = Math.min(apr, partner.aprRange.max);
      
      return apr;
    }

    /**
     * Generate financing options for a quote
     * @param {number} quoteTotal - Total quote amount
     * @param {string} creditTier - Credit tier
     * @returns {Array} Financing options
     */
    generateFinancingOptions(quoteTotal, creditTier = 'good') {
      const options = [];
      
      this.financing.partners.forEach(partner => {
        // Skip if quote is outside partner's range
        if (quoteTotal < partner.minAmount || quoteTotal > partner.maxAmount) {
          return;
        }
        
        const apr = this.getEstimatedAPR(creditTier, partner.id);
        
        partner.termsMonths.forEach(term => {
          const monthlyPayment = this.calculateMonthlyPayment(quoteTotal, apr, term);
          const totalInterest = this.calculateTotalInterest(quoteTotal, monthlyPayment, term);
          const totalPayment = quoteTotal + totalInterest;
          
          options.push({
            partnerId: partner.id,
            partnerName: partner.name,
            principal: quoteTotal,
            apr: apr,
            termMonths: term,
            monthlyPayment: monthlyPayment,
            totalInterest: totalInterest,
            totalPayment: totalPayment,
            promotions: partner.promotions || [],
            disclosure: partner.disclosure
          });
        });
      });
      
      // Sort by monthly payment (lowest first)
      options.sort((a, b) => a.monthlyPayment - b.monthlyPayment);
      
      return options;
    }

    /**
     * Format currency
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency
     */
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    }

    /**
     * Render financing options UI
     * @param {number} quoteTotal - Total quote amount
     * @param {HTMLElement} container - Container element
     * @param {string} creditTier - Credit tier
     */
    renderFinancingOptions(quoteTotal, container, creditTier = 'good') {
      if (!container) return;
      
      const options = this.generateFinancingOptions(quoteTotal, creditTier);
      
      if (options.length === 0) {
        container.innerHTML = `
          <div class="financing-unavailable">
            <p>Financing options are currently unavailable for this quote amount.</p>
            <p class="hint">Typical financing range: ${this.formatCurrency(5000)} - ${this.formatCurrency(100000)}</p>
          </div>
        `;
        return;
      }
      
      // Group by partner
      const byPartner = {};
      options.forEach(opt => {
        if (!byPartner[opt.partnerId]) {
          byPartner[opt.partnerId] = [];
        }
        byPartner[opt.partnerId].push(opt);
      });
      
      container.innerHTML = `
        <div class="financing-calculator">
          <div class="financing-header">
            <h3>Flexible Financing Options</h3>
            <p class="financing-subtitle">Make your project affordable with monthly payments as low as <strong>${this.formatCurrency(options[0].monthlyPayment)}/month</strong></p>
          </div>
          
          <div class="credit-tier-selector">
            <label for="credit-tier-select">Estimated Credit Score:</label>
            <select id="credit-tier-select" onchange="window.updateFinancingCalculator(this.value)">
              <option value="excellent" ${creditTier === 'excellent' ? 'selected' : ''}>Excellent (740+)</option>
              <option value="good" ${creditTier === 'good' ? 'selected' : ''}>Good (670-739)</option>
              <option value="fair" ${creditTier === 'fair' ? 'selected' : ''}>Fair (580-669)</option>
            </select>
            <small class="credit-note">Better credit = lower rates. This is an estimate only.</small>
          </div>
          
          <div class="financing-partners">
            ${Object.keys(byPartner).map(partnerId => {
              const partnerOptions = byPartner[partnerId];
              const partner = this.financing.partners.find(p => p.id === partnerId);
              
              return `
                <div class="financing-partner">
                  <div class="partner-header">
                    <h4>${partner.name}</h4>
                    ${partner.promotions && partner.promotions.length > 0 ? `
                      <div class="partner-promotions">
                        ${partner.promotions.map(promo => `<span class="promo-badge">${promo}</span>`).join('')}
                      </div>
                    ` : ''}
                  </div>
                  
                  <div class="financing-options-grid">
                    ${partnerOptions.slice(0, 3).map(opt => `
                      <div class="financing-option">
                        <div class="option-header">
                          <span class="term">${opt.termMonths} Months</span>
                          <span class="apr">${opt.apr.toFixed(2)}% APR</span>
                        </div>
                        <div class="payment-amount">
                          ${this.formatCurrency(opt.monthlyPayment)}<span class="period">/mo</span>
                        </div>
                        <div class="option-details">
                          <div class="detail-row">
                            <span>Total Interest:</span>
                            <span>${this.formatCurrency(opt.totalInterest)}</span>
                          </div>
                          <div class="detail-row">
                            <span>Total Payment:</span>
                            <span>${this.formatCurrency(opt.totalPayment)}</span>
                          </div>
                        </div>
                        <button class="btn-select-financing" onclick="window.selectFinancingOption('${partnerId}', ${opt.termMonths}, ${opt.apr})">
                          Select This Option
                        </button>
                      </div>
                    `).join('')}
                  </div>
                  
                  <div class="partner-disclosure">
                    <small>${partner.disclosure}</small>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          
          <div class="tila-disclosures">
            <h4>Truth in Lending Act Disclosures</h4>
            <div class="disclosure-grid">
              ${Object.keys(this.financing.disclosures).map(key => `
                <div class="disclosure-item">
                  <strong>${this.formatDisclosureKey(key)}:</strong>
                  <span>${this.financing.disclosures[key]}</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="financing-cta">
            <p><strong>Ready to apply?</strong> Select a financing option above and we'll help you through the application process.</p>
            <p class="financing-note">
              <svg class="icon-sm" width="16" height="16" fill="currentColor">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Applying for financing will result in a credit inquiry. All rates and terms are subject to credit approval.
            </p>
          </div>
        </div>
      `;
    }

    /**
     * Format disclosure key for display
     * @param {string} key - Disclosure key
     * @returns {string} Formatted key
     */
    formatDisclosureKey(key) {
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    }

    /**
     * Get financing summary for PDF/email
     * @param {number} quoteTotal - Total quote amount
     * @param {string} partnerId - Selected partner ID
     * @param {number} termMonths - Selected term
     * @param {string} creditTier - Credit tier
     * @returns {Object} Financing summary
     */
    getFinancingSummary(quoteTotal, partnerId, termMonths, creditTier = 'good') {
      const partner = this.financing.partners.find(p => p.id === partnerId);
      if (!partner) return null;
      
      const apr = this.getEstimatedAPR(creditTier, partnerId);
      const monthlyPayment = this.calculateMonthlyPayment(quoteTotal, apr, termMonths);
      const totalInterest = this.calculateTotalInterest(quoteTotal, monthlyPayment, termMonths);
      
      return {
        partner: partner.name,
        principal: quoteTotal,
        apr: apr,
        termMonths: termMonths,
        monthlyPayment: monthlyPayment,
        totalInterest: totalInterest,
        totalPayment: quoteTotal + totalInterest,
        disclosure: partner.disclosure
      };
    }
  }

  // Export globally
  window.FinancingCalculator = FinancingCalculator;
  
  // Create global instance
  window.financingCalc = new FinancingCalculator();
  
  /**
   * Global helper: Update financing calculator when credit tier changes
   */
  window.updateFinancingCalculator = function(creditTier) {
    const container = document.querySelector('.financing-calculator-container');
    const quoteTotal = parseFloat(document.getElementById('quote-total-value')?.textContent?.replace(/[^0-9.]/g, '')) || 0;
    
    if (container && quoteTotal > 0) {
      window.financingCalc.renderFinancingOptions(quoteTotal, container, creditTier);
    }
  };
  
  /**
   * Global helper: Select financing option
   */
  window.selectFinancingOption = function(partnerId, termMonths, apr) {
    // Store selected financing option
    if (window.ProjectState) {
      window.ProjectState.set('quote.financing', {
        partnerId: partnerId,
        termMonths: termMonths,
        apr: apr,
        selected: true,
        selectedAt: new Date().toISOString()
      });
    }
    
    // Update UI
    const selectedOption = document.querySelector('.financing-option .btn-select-financing');
    if (selectedOption) {
      document.querySelectorAll('.btn-select-financing').forEach(btn => {
        btn.textContent = 'Select This Option';
        btn.classList.remove('selected');
      });
      
      event.target.textContent = '✓ Selected';
      event.target.classList.add('selected');
    }
    
    // Notify user
    const notification = document.createElement('div');
    notification.className = 'financing-selected-notification';
    notification.innerHTML = `
      <svg class="icon-sm" width="16" height="16" fill="currentColor">
        <path d="M9 12l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>Financing option selected! This will be included in your quote.</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

})();
