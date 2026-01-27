/**
 * TillerPro™ Configuration System
 * White-label, multi-tenant support for licensing
 * 
 * This file contains ALL customizable settings for TillerPro.
 * When licensing to other contractors, create a new config file
 * or use environment variables to override these defaults.
 * 
 * @version 2.0.0
 * @author Tillerstead LLC
 */

const TillerProConfig = {
  
  /**
   * Application Metadata
   */
  app: {
    name: 'TillerPro™',
    version: '2.0.0',
    environment: 'production', // development, staging, production
    
    // Multi-tenant support
    tenant: {
      id: 'tillerstead',
      name: 'Tillerstead LLC',
      type: 'master', // master, partner, enterprise, solo
      licenseKey: null, // Set when licensing to others
      expiresAt: null // License expiration (null = perpetual)
    }
  },
  
  /**
   * Company/Contractor Branding
   * WHITE-LABEL: Customize these for each licensee
   */
  company: {
    name: 'Tillerstead LLC',
    legalName: 'Tillerstead Limited Liability Company',
    tagline: 'TCNA-Certified Professional Tile Installation',
    description: 'New Jersey\'s premier tile installation specialists',
    
    license: {
      number: 'NJ HIC #13VH11902300',
      state: 'NJ',
      type: 'Home Improvement Contractor',
      issueDate: '2019-03-15',
      expiresAt: '2027-03-15'
    },
    
    contact: {
      phone: '(856) 555-0100',
      email: 'quotes@tillerstead.com',
      website: 'tillerstead.com',
      supportEmail: 'support@tillerstead.com'
    },
    
    address: {
      street: '123 Main Street',
      city: 'Cherry Hill',
      state: 'NJ',
      zip: '08002',
      country: 'USA'
    },
    
    social: {
      facebook: 'https://facebook.com/tillersteadllc',
      instagram: 'https://instagram.com/tillerstead',
      linkedin: 'https://linkedin.com/company/tillerstead',
      twitter: null,
      youtube: null
    },
    
    certification: {
      tcna: true,
      ansi: true,
      insurance: {
        liability: true,
        workersComp: true,
        bondAmount: 500000,
        carrier: 'State Farm Business Insurance'
      }
    },
    
    experience: {
      yearsInBusiness: 15,
      projectsCompleted: 1200,
      averageRating: 4.8,
      totalReviews: 847
    }
  },
  
  /**
   * Branding Assets
   * WHITE-LABEL: Replace with licensee's branding
   */
  branding: {
    logo: {
      main: '/assets/img/logo/logo-main.webp',
      compact: '/assets/img/logo/logo-compact.webp',
      white: '/assets/img/logo/logo-white.webp',
      favicon: '/assets/icons/favicon-32x32.png'
    },
    
    colors: {
      primary: '#10b981',      // Emerald green
      primaryDark: '#059669',
      primaryLight: '#34d399',
      secondary: '#0f1110',    // Almost black
      accent: '#fbbf24',       // Amber
      
      // Semantic colors
      success: '#10b981',
      warning: '#fbbf24',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Neutrals
      neutral50: '#f9fafb',
      neutral100: '#f3f4f6',
      neutral200: '#e5e7eb',
      neutral300: '#d1d5db',
      neutral400: '#9ca3af',
      neutral500: '#6b7280',
      neutral600: '#4b5563',
      neutral700: '#374151',
      neutral800: '#1f2937',
      neutral900: '#111827'
    },
    
    typography: {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      headingFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }
  },
  
  /**
   * Pricing Configuration
   * WHITE-LABEL: Adjust for regional pricing, contractor margins
   */
  pricing: {
    
    // Labor rates
    labor: {
      hourlyRate: 65,           // $ per hour
      overtimeMultiplier: 1.5,   // 1.5x for overtime
      minimumHours: 4,           // Minimum billable hours
      
      // Regional adjustments (multipliers)
      regions: {
        'north-nj': 1.0,
        'central-nj': 0.95,
        'south-nj': 0.90,
        'philadelphia': 1.05,
        'nyc': 1.25
      }
    },
    
    // Material costs ($ per unit)
    // These are base costs - actual costs should come from supplier APIs
    materials: {
      tile: {
        perSqFt: 8.50,
        unit: 'sq ft',
        wasteFactor: 1.10      // 10% waste
      },
      grout: {
        perBag: 18,
        coverage: 50,          // sq ft per bag
        unit: 'bag'
      },
      mortar: {
        perBag: 22,
        coverage: 95,          // sq ft per 50lb bag
        unit: 'bag'
      },
      waterproofing: {
        liquid: { perGallon: 45, coverage: 50 },
        sheet: { perRoll: 180, coverage: 54 },
        board: { perBoard: 65, coverage: 32 }
      },
      leveling: {
        perBag: 38,
        coverage: 50,
        unit: 'bag'
      },
      slope: {
        preslope: { perBag: 28, coverage: 12 },
        pan: { perKit: 450, coverage: 32 }
      },
      backerboard: {
        perSheet: 24,
        coverage: 32           // sq ft per 3x5 sheet
      },
      membrane: {
        perSqFt: 2.80
      },
      sealer: {
        perQuart: 32,
        coverage: 125
      }
    },
    
    // Markup & margins
    markup: {
      materials: 1.35,           // 35% markup on materials
      subcontractors: 1.20,      // 20% markup on subs
      equipment: 1.25            // 25% markup on equipment rental
    },
    
    // Fees
    fees: {
      warranty: {
        enabled: true,
        amount: 250,
        description: '10-Year Waterproof Installation Warranty',
        coverage: 'workmanship and waterproofing integrity'
      },
      permit: {
        enabled: false,         // Only charge if required
        amount: 150,
        description: 'Building permit fee (if required)',
        note: 'Not all projects require permits'
      },
      disposal: {
        enabled: false,
        perTon: 85,
        description: 'Debris removal and disposal'
      },
      travel: {
        enabled: false,
        perMile: 0.67,          // IRS standard mileage rate
        minimumDistance: 30,    // Miles - free within this radius
        description: 'Travel fee for projects outside service area'
      }
    },
    
    // Discounts
    discounts: {
      multiRoom: {
        enabled: true,
        threshold: 2,           // Number of rooms
        percent: 0.10           // 10% off
      },
      seasonal: {
        enabled: false,
        months: [1, 2, 11, 12], // Jan, Feb, Nov, Dec
        percent: 0.05           // 5% off
      },
      referral: {
        enabled: true,
        percent: 0.05           // 5% off for referrals
      },
      veteran: {
        enabled: true,
        percent: 0.10           // 10% off for veterans
      }
    },
    
    // Tax
    tax: {
      rate: 0.06625,            // NJ sales tax 6.625%
      applicableTo: ['materials', 'labor'], // What gets taxed
      exempt: []                // Tax-exempt customer types
    },
    
    // Payment terms
    payment: {
      schedule: {
        deposit: 0.30,          // 30% upfront
        midpoint: 0.40,         // 40% mid-project
        final: 0.30             // 30% on completion
      },
      
      methods: ['check', 'cash', 'card', 'ach', 'financing'],
      
      cardFee: {
        enabled: true,
        percent: 0.03,          // 3% card processing fee
        note: 'Credit card payments subject to 3% processing fee'
      },
      
      terms: {
        net: 30,                // Net 30 days (for commercial)
        lateFeePercent: 0.015,  // 1.5% per month late fee
        minimumLateFee: 25
      }
    }
  },
  
  /**
   * Quote Configuration
   */
  quote: {
    numbering: {
      prefix: 'TPRO',
      format: 'TPRO-YYYYMMDD-###', // TPRO-20260127-001
      startNumber: 1
    },
    
    validity: {
      days: 30,                 // Quote valid for 30 days
      extendable: true          // Can be extended
    },
    
    templates: {
      default: 'professional',
      available: ['professional', 'luxury', 'budget']
    },
    
    includes: {
      warranty: true,
      paymentSchedule: true,
      termsAndConditions: true,
      signatureBlock: true,
      materialBreakdown: true,
      laborBreakdown: true,
      legalDisclaimers: true
    },
    
    // Validation requirements before quote generation
    validation: {
      requireCustomerName: true,
      requireCustomerEmail: true,
      requireCustomerPhone: true,
      requireProjectDescription: false,
      minimumMaterialsCalculated: 1,  // At least 1 material type
      requireLaborEstimate: true,
      
      // Sanity checks
      maxQuoteValue: 100000,         // Flag quotes over $100K for review
      minQuoteValue: 500,             // Flag quotes under $500
      maxLaborHours: 200,             // Flag if >200 hours
      maxMaterialQuantity: 10000      // Flag unusual quantities
    },
    
    // Legal disclaimers (CRITICAL - Protects both parties)
    disclaimers: {
      estimate: `
        IMPORTANT: This quote is an ESTIMATE based on information provided. 
        Actual costs may vary if project scope, site conditions, or material 
        selections differ from initial assessment. Customer will be notified 
        of any changes before work proceeds.
      `.trim(),
      
      siteConditions: `
        Quote assumes standard site conditions. Additional charges may apply for: 
        asbestos removal, mold remediation, structural repairs, plumbing/electrical 
        modifications, or other unforeseen conditions discovered during demolition 
        or installation. Customer will approve all change orders in writing.
      `.trim(),
      
      materialAvailability: `
        Material pricing and availability subject to market conditions. If selected 
        materials become unavailable, contractor will propose suitable alternatives 
        at comparable pricing. Customer retains final approval of all substitutions.
      `.trim(),
      
      permits: `
        Permits and inspections are the responsibility of the property owner unless 
        explicitly stated otherwise in this contract. Contractor will assist with 
        permit applications if requested, but cannot guarantee approval or timeline.
      `.trim(),
      
      warranty: `
        Contractor warrants workmanship for 10 years from completion date. Warranty 
        covers installation defects and waterproofing integrity. Warranty DOES NOT 
        cover: material defects (covered by manufacturer), damage from improper use, 
        modifications by others, or normal wear and tear. Warranty void if materials 
        are not maintained per manufacturer specifications.
      `.trim(),
      
      materialWarranty: `
        Material warranties are provided by manufacturers and vary by product. 
        Contractor makes no warranties regarding materials beyond manufacturer 
        specifications. Customer should review manufacturer warranty documentation 
        for coverage details and limitations.
      `.trim(),
      
      liability: `
        Contractor liability is limited to the contract amount. Contractor is NOT 
        liable for: consequential damages, lodging expenses, lost business income, 
        or damages beyond direct repair costs. Contractor carries general liability 
        and workers compensation insurance as required by law.
      `.trim(),
      
      timeline: `
        Estimated completion timeline is subject to: weather conditions, material 
        delivery delays, permit approval, and unforeseen site conditions. Contractor 
        will make reasonable efforts to meet estimated dates but cannot guarantee 
        completion by specific date unless expressly stated as "time is of the essence" 
        and agreed to in writing by both parties.
      `.trim(),
      
      changeOrders: `
        Any changes to scope of work require written change order signed by both parties 
        before work proceeds. Change orders may affect project cost and timeline. 
        Customer has right to refuse change orders; contractor has right to cease work 
        if change order is necessary for code compliance or safety.
      `.trim(),
      
      payment: `
        Payment schedule as follows: ${'' /* Will be populated from config */}
        Final payment due upon substantial completion and customer approval. Customer 
        retains right to withhold final payment for punch-list items, but not to exceed 
        10% of contract value. Late payments subject to 1.5% monthly finance charge.
      `.trim(),
      
      disputeResolution: `
        Any disputes arising from this contract shall first be resolved through good-faith 
        negotiation. If negotiation fails, parties agree to mediation before pursuing 
        arbitration or litigation. New Jersey law governs this contract. Prevailing party 
        in any legal action entitled to reasonable attorney fees.
      `.trim(),
      
      codeCompliance: `
        All work performed in accordance with applicable building codes and TCNA Handbook 
        standards. Contractor follows industry best practices but does not provide engineering, 
        architectural, or legal advice. Customer responsible for ensuring work complies with 
        HOA rules, deed restrictions, or other private agreements.
      `.trim(),
      
      accuracyDisclaimer: `
        Measurements and calculations based on information provided by customer. Contractor 
        recommends professional site measurement for projects over $10,000. Customer accepts 
        responsibility for accuracy of dimensions and site information provided. Contractor 
        will verify critical measurements on-site before installation.
      `.trim()
    },
    
    // Contract terms (legally binding language)
    contractTerms: `
TERMS AND CONDITIONS OF CONTRACT

1. SCOPE OF WORK
This contract covers tile installation services as described in the attached quote. Work includes: surface preparation, waterproofing installation, tile setting, grouting, and cleanup. Customer provides clear access to work area and protects furnishings.

2. MATERIALS
Contractor provides materials listed in quote. Customer approves all material selections before purchase. Materials cannot be returned once cut or installed. Customer responsible for storing materials if delivered before installation date.

3. PAYMENT TERMS
Payment schedule: 30% deposit upon contract signing, 40% at midpoint (preparation complete), 30% upon substantial completion. Payment by: check, cash, ACH, or credit card (3% processing fee applies). Late payments subject to 1.5% monthly finance charge after 30 days.

4. TIMELINE
Estimated start date and completion timeline provided in quote. Actual dates subject to: material availability, permit approval, weather, and site conditions. Contractor will notify customer of delays promptly. Customer delays (access issues, material selection, etc.) may extend timeline.

5. CHANGES
Changes to scope require written change order signed by both parties. Change orders may affect price and timeline. Customer has 3 business days to approve/reject change orders. Contractor reserves right to cease work if change order is necessary for safety or code compliance and customer refuses.

6. WARRANTIES
Contractor warrants workmanship for 10 years. Warranty covers installation defects and waterproofing integrity. Warranty does not cover: material defects, damage from improper use, modifications by others, or normal wear. Material warranties provided by manufacturers separately.

7. PERMITS AND INSPECTIONS
Customer responsible for permits unless otherwise agreed in writing. Contractor will assist with applications if requested. Work performed to code; inspections required where applicable. Customer must allow reasonable access for inspections.

8. UNFORESEEN CONDITIONS
Quote assumes standard conditions. Additional costs may apply for: asbestos, mold, structural issues, or other hidden conditions. Customer will be notified immediately. Work will not proceed on affected areas until customer approves change order.

9. CLEANUP
Contractor performs daily cleanup and final cleanup upon completion. Debris removal included. Customer responsible for protecting personal property and making work area accessible.

10. LIABILITY
Contractor carries general liability and workers compensation insurance. Contractor not liable for: damage to hidden utilities not marked, pre-existing conditions, consequential damages, or amounts exceeding contract value. Customer should verify contractor's insurance before signing.

11. CANCELLATION
Customer may cancel within 3 business days of signing (NJ law). After 3 days, customer may cancel but forfeits deposit. If contractor has purchased materials, customer responsible for material costs plus 20% restocking fee.

12. DISPUTE RESOLUTION
Disputes resolved through negotiation first, then mediation, then arbitration if necessary. New Jersey law governs. Prevailing party in legal action entitled to attorney fees.

13. ACCEPTANCE
This quote becomes binding contract upon customer signature and deposit payment. Customer has read and understands all terms, disclaimers, and conditions. Customer warrants authority to enter this contract.

14. ENTIRE AGREEMENT
This contract (quote + terms) represents entire agreement. Modifications must be in writing signed by both parties. No verbal agreements or representations outside this document are binding.

15. SEVERABILITY
If any term is found unenforceable, remaining terms remain in effect.

BY SIGNING BELOW, CUSTOMER ACCEPTS THESE TERMS AND CONDITIONS.
    `.trim(),
    
    // Required acknowledgments (customer must check boxes)
    requiredAcknowledgments: [
      'I have read and understand the entire quote including all terms, conditions, and disclaimers',
      'I understand this is an estimate and actual costs may vary based on site conditions',
      'I acknowledge the payment schedule and agree to make timely payments',
      'I understand the warranty covers workmanship only, not material defects',
      'I acknowledge my responsibilities regarding permits, access, and site preparation',
      'I have authority to enter into this contract on behalf of the property owner'
    ]
  },
  
  /**
   * Email Configuration
   */
  email: {
    provider: 'netlify',       // netlify, sendgrid, mailgun, ses
    
    from: {
      name: 'Tillerstead LLC',
      email: 'quotes@tillerstead.com'
    },
    
    replyTo: {
      name: 'Tillerstead Support',
      email: 'support@tillerstead.com'
    },
    
    templates: {
      quote: {
        subject: 'Your Professional Tile Installation Quote - {{quoteNumber}}',
        preheader: 'Thank you for your interest in Tillerstead',
        includeAttachment: true
      },
      
      quoteSigned: {
        subject: 'Quote {{quoteNumber}} Signed - Next Steps',
        preheader: 'Thank you for choosing Tillerstead!'
      },
      
      projectStart: {
        subject: 'Your Project Starts {{startDate}}',
        preheader: 'What to expect on installation day'
      },
      
      projectComplete: {
        subject: 'Your Project is Complete!',
        preheader: 'Thank you for choosing Tillerstead'
      }
    },
    
    tracking: {
      enabled: true,
      trackOpens: true,
      trackClicks: true
    }
  },
  
  /**
   * E-Signature Configuration
   */
  esignature: {
    provider: 'docusign',      // docusign, hellosign, pandadoc, adobesign
    
    // Mock mode for testing without API keys
    mockMode: true,
    
    // API credentials (set via environment variables in production)
    apiKey: process.env.DOCUSIGN_API_KEY || null,
    integrationKey: process.env.DOCUSIGN_INTEGRATION_KEY || null,
    accountId: process.env.DOCUSIGN_ACCOUNT_ID || null,
    
    settings: {
      signatureRequired: true,
      initialRequired: false,
      witnessRequired: false,
      notarizeRequired: false,
      
      reminderDays: 3,          // Send reminder after 3 days
      expireDays: 30,           // Signature request expires after 30 days
      
      allowDecline: true,
      allowComments: true,
      allowDownloadAfterSign: true
    }
  },
  
  /**
   * Financing Configuration
   */
  financing: {
    enabled: true,
    
    providers: [
      {
        id: 'greensky',
        name: 'GreenSky',
        enabled: true,
        apiKey: process.env.GREENSKY_API_KEY || null,
        merchantId: process.env.GREENSKY_MERCHANT_ID || null,
        
        terms: [
          { months: 24, apr: 0, promoCode: '24MONTHS', description: '24 Months Same-As-Cash' },
          { months: 60, apr: 7.99, description: '60 Months @ 7.99% APR' },
          { months: 120, apr: 9.99, description: '120 Months @ 9.99% APR' }
        ],
        
        minAmount: 1000,
        maxAmount: 55000
      },
      
      {
        id: 'hearth',
        name: 'Hearth',
        enabled: true,
        apiKey: process.env.HEARTH_API_KEY || null,
        
        terms: [
          { months: 36, apr: 5.99, description: '36 Months @ 5.99% APR' },
          { months: 60, apr: 8.99, description: '60 Months @ 8.99% APR' }
        ],
        
        minAmount: 500,
        maxAmount: 100000
      }
    ],
    
    // Display settings
    display: {
      showInQuote: true,
      showAsLowAs: true,         // "Pay as low as $XXX/month"
      defaultTerm: 60,            // Default to 60 months
      emphasizePromo: true        // Highlight 0% APR offers
    }
  },
  
  /**
   * Multi-Location Configuration
   */
  locations: {
    enabled: false,             // Enable for multi-location contractors
    
    headquarters: {
      id: 'main',
      name: 'Cherry Hill Headquarters',
      address: {
        street: '123 Main Street',
        city: 'Cherry Hill',
        state: 'NJ',
        zip: '08002'
      },
      phone: '(856) 555-0100',
      email: 'quotes@tillerstead.com',
      serviceRadius: 50,        // Miles
      active: true
    },
    
    // Additional locations (for enterprise licensees)
    branches: []
  },
  
  /**
   * Analytics & Tracking
   */
  analytics: {
    enabled: true,
    
    providers: {
      googleAnalytics: {
        enabled: false,
        measurementId: null
      },
      
      plausible: {
        enabled: true,
        domain: 'tillerstead.com'
      },
      
      hotjar: {
        enabled: false,
        siteId: null
      }
    },
    
    events: {
      trackQuoteGenerated: true,
      trackQuoteSigned: true,
      trackCalculatorUsage: true,
      trackFormSubmissions: true,
      trackEmailOpens: true
    },
    
    privacy: {
      anonymizeIp: true,
      respectDoNotTrack: true,
      cookieConsent: true
    }
  },
  
  /**
   * Feature Flags
   * Enable/disable features for different licensees
   */
  features: {
    calculators: true,
    instantQuote: true,
    emailDelivery: true,
    esignature: true,
    financing: true,
    multiLocation: false,
    dashboard: true,
    api: false,
    mobileApp: false,
    
    // Advanced features (Enterprise tier only)
    customTemplates: false,
    apiAccess: false,
    whiteLabel: false,
    subAccounts: false
  },
  
  /**
   * Supplier Integration
   */
  suppliers: {
    enabled: false,             // Enable when supplier APIs are integrated
    
    partners: [
      {
        id: 'msi',
        name: 'MSI (Surfaces)',
        apiKey: null,
        accountNumber: null,
        locations: ['Cherry Hill, NJ', 'Philadelphia, PA'],
        priority: 1
      },
      {
        id: 'florida-tile',
        name: 'Florida Tile',
        apiKey: null,
        accountNumber: null,
        locations: ['Cherry Hill, NJ'],
        priority: 2
      },
      {
        id: 'dal-tile',
        name: 'Dal-Tile',
        apiKey: null,
        accountNumber: null,
        locations: ['Multiple'],
        priority: 3
      }
    ],
    
    autoOrder: false,           // Automatically place orders
    priceCheck: true,           // Check real-time pricing
    stockCheck: true            // Check inventory
  },
  
  /**
   * Financing Configuration
   * Integrate with finance partners for customer payment options
   */
  financing: {
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
      estimatedCreditScore: 'good' // excellent, good, fair
    },
    
    // Credit score tiers (for APR estimation)
    creditTiers: {
      excellent: { min: 740, aprAdjustment: 0 },
      good: { min: 670, aprAdjustment: 2.0 },
      fair: { min: 580, aprAdjustment: 5.0 }
    },
    
    // Truth in Lending Act disclosures
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
  },
  
  /**
   * E-Signature Configuration
   */
  eSignature: {
    // Provider selection
    provider: 'docusign', // 'docusign' | 'hellosign' | 'adobesign' | 'custom'
    
    // Environment
    testMode: true, // Set to false for production
    
    // Behavior settings
    autoSend: false, // Auto-send signature request on quote generation
    requireAllSignatures: true, // Both customer AND contractor must sign
    reminderSchedule: [3, 7, 14], // Days to send reminders (3 days, 1 week, 2 weeks)
    expirationDays: 30, // Quote expires after 30 days
    
    // Document retention
    documentRetention: 'permanent', // 'permanent' | '1year' | '3years' | '7years'
    
    // Email settings
    emailSubject: 'Please Sign Your Quote from {company}',
    emailMessage: 'Your quote is ready for review and signature. Please click the button below to review and sign electronically.',
    
    // Success redirect
    successRedirectUrl: '/tools-hub/#/quote-signed',
    
    // Signature positions (PDF coordinates)
    signatureFields: {
      customer: {
        page: 4,
        signature: { x: 50, y: 680 },
        date: { x: 350, y: 680 },
        printName: { x: 50, y: 710 }
      },
      contractor: {
        page: 4,
        signature: { x: 50, y: 750 },
        date: { x: 350, y: 750 },
        printName: { x: 50, y: 780 }
      }
    }
  },

  /**
   * Development & Debugging
   */
  debug: {
    enabled: false,             // Set to true in development
    verboseLogging: false,
    showPerformanceMetrics: false,
    mockAPIs: true              // Use mock data when APIs not configured
  }
};

// Freeze config to prevent accidental modifications
Object.freeze(TillerProConfig);

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TillerProConfig;
}

// Expose globally for browser
if (typeof window !== 'undefined') {
  window.TillerProConfig = TillerProConfig;
}

console.log('[TillerPro Config] Loaded v' + TillerProConfig.app.version);
