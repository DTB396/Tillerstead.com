// SweatEquity Insurance Demo Data
// Multiple user scenarios for demonstration

const DEMO_USERS = {
  'sarah-johnson': {
    id: 'user-001',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    joinDate: '2025-01-15',
    state: 'NJ',
    vehicle: {
      year: 2021,
      make: 'Honda',
      model: 'Civic',
      vin: 'JH2RC50***'
    },
    drivingScore: 92,
    scoreBreakdown: {
      speedCompliance: 98,
      smoothBraking: 87,
      dayDriving: 94,
      lowMileage: 92
    },
    scoreHistory: [
      { month: 'Jan 2026', score: 92, trend: 'up' },
      { month: 'Dec 2025', score: 89, trend: 'up' },
      { month: 'Nov 2025', score: 91, trend: 'up' },
      { month: 'Oct 2025', score: 88, trend: 'down' },
      { month: 'Sep 2025', score: 90, trend: 'stable' }
    ],
    premium: {
      monthly: 89,
      baseRate: 110,
      discount: 21
    },
    benefitLedger: {
      balance: 1247.35,
      monthsAccrued: 12,
      transactions: [
        { date: '2026-01-20', amount: 127.50, score: 92, tier: 'Excellent' },
        { date: '2025-12-20', amount: 118.25, score: 89, tier: 'Good' },
        { date: '2025-11-20', amount: 124.10, score: 91, tier: 'Excellent' },
        { date: '2025-10-20', amount: 115.80, score: 88, tier: 'Good' },
        { date: '2025-09-20', amount: 121.40, score: 90, tier: 'Excellent' }
      ]
    },
    claims: [],
    claimFreeDays: 437,
    stats: {
      totalTrips: 287,
      totalMiles: 7800,
      avgMilesPerMonth: 650,
      speedingEvents: 2,
      harshBrakingEvents: 12,
      nightTripPercent: 6
    }
  },
  
  'michael-chen': {
    id: 'user-002',
    name: 'Michael Chen',
    email: 'm.chen@example.com',
    joinDate: '2025-11-01',
    state: 'NJ',
    vehicle: {
      year: 2019,
      make: 'Toyota',
      model: 'Camry',
      vin: '4T1BF1FK***'
    },
    drivingScore: 78,
    scoreBreakdown: {
      speedCompliance: 82,
      smoothBraking: 71,
      dayDriving: 68,
      lowMileage: 91
    },
    scoreHistory: [
      { month: 'Jan 2026', score: 78, trend: 'up' },
      { month: 'Dec 2025', score: 74, trend: 'up' },
      { month: 'Nov 2025', score: 72, trend: 'new' }
    ],
    premium: {
      monthly: 134,
      baseRate: 145,
      discount: 11
    },
    benefitLedger: {
      balance: 287.60,
      monthsAccrued: 3,
      transactions: [
        { date: '2026-01-20', amount: 107.20, score: 78, tier: 'Fair' },
        { date: '2025-12-20', amount: 99.20, score: 74, tier: 'Fair' },
        { date: '2025-11-20', amount: 81.20, score: 72, tier: 'Fair' }
      ]
    },
    claims: [
      {
        id: 'CLM-002-001',
        date: '2025-12-18',
        type: 'Minor Collision',
        status: 'Approved',
        amount: 2400,
        description: 'Rear-ended at stop light - minor bumper damage',
        atFault: false,
        photos: 2,
        timeline: [
          { date: '2025-12-18', event: 'Claim Filed', note: 'Initial report submitted with photos' },
          { date: '2025-12-19', event: 'Under Review', note: 'Assigned to claims adjuster' },
          { date: '2025-12-21', event: 'Approved', note: 'Not at fault verified via police report' },
          { date: '2025-12-23', event: 'Payment Issued', note: '$2,400 paid to member' }
        ]
      }
    ],
    claimFreeDays: 36,
    stats: {
      totalTrips: 98,
      totalMiles: 2750,
      avgMilesPerMonth: 917,
      speedingEvents: 18,
      harshBrakingEvents: 34,
      nightTripPercent: 32
    }
  },
  
  'emma-rodriguez': {
    id: 'user-003',
    name: 'Emma Rodriguez',
    email: 'emma.r@example.com',
    joinDate: '2025-08-10',
    state: 'NJ',
    vehicle: {
      year: 2023,
      make: 'Tesla',
      model: 'Model 3',
      vin: '5YJ3E1EA***'
    },
    drivingScore: 97,
    scoreBreakdown: {
      speedCompliance: 99,
      smoothBraking: 96,
      dayDriving: 98,
      lowMileage: 95
    },
    scoreHistory: [
      { month: 'Jan 2026', score: 97, trend: 'stable' },
      { month: 'Dec 2025', score: 98, trend: 'up' },
      { month: 'Nov 2025', score: 96, trend: 'down' },
      { month: 'Oct 2025', score: 97, trend: 'stable' },
      { month: 'Sep 2025', score: 97, trend: 'stable' },
      { month: 'Aug 2025', score: 95, trend: 'new' }
    ],
    premium: {
      monthly: 72,
      baseRate: 105,
      discount: 33
    },
    benefitLedger: {
      balance: 842.50,
      monthsAccrued: 6,
      transactions: [
        { date: '2026-01-20', amount: 145.80, score: 97, tier: 'Excellent' },
        { date: '2025-12-20', amount: 147.60, score: 98, tier: 'Excellent' },
        { date: '2025-11-20', amount: 141.60, score: 96, tier: 'Excellent' },
        { date: '2025-10-20', amount: 145.80, score: 97, tier: 'Excellent' },
        { date: '2025-09-20', amount: 145.80, score: 97, tier: 'Excellent' },
        { date: '2025-08-20', amount: 115.90, score: 95, tier: 'Excellent' }
      ]
    },
    claims: [],
    claimFreeDays: 196,
    stats: {
      totalTrips: 154,
      totalMiles: 3920,
      avgMilesPerMonth: 653,
      speedingEvents: 1,
      harshBrakingEvents: 3,
      nightTripPercent: 2
    }
  },
  
  'james-williams': {
    id: 'user-004',
    name: 'James Williams',
    email: 'j.williams@example.com',
    joinDate: '2025-05-20',
    state: 'NJ',
    vehicle: {
      year: 2020,
      make: 'Ford',
      model: 'F-150',
      vin: '1FTEW1EP***'
    },
    drivingScore: 64,
    scoreBreakdown: {
      speedCompliance: 58,
      smoothBraking: 62,
      dayDriving: 71,
      lowMileage: 65
    },
    scoreHistory: [
      { month: 'Jan 2026', score: 64, trend: 'down' },
      { month: 'Dec 2025', score: 68, trend: 'down' },
      { month: 'Nov 2025', score: 71, trend: 'stable' },
      { month: 'Oct 2025', score: 70, trend: 'up' },
      { month: 'Sep 2025', score: 66, trend: 'down' }
    ],
    premium: {
      monthly: 178,
      baseRate: 185,
      discount: 7
    },
    benefitLedger: {
      balance: 412.80,
      monthsAccrued: 8,
      transactions: [
        { date: '2026-01-20', amount: 53.40, score: 64, tier: 'Needs Improvement' },
        { date: '2025-12-20', amount: 57.12, score: 68, tier: 'Fair' },
        { date: '2025-11-20', score: 71, tier: 'Fair', amount: 60.24 },
        { date: '2025-10-20', amount: 58.80, score: 70, tier: 'Fair' },
        { date: '2025-09-20', amount: 52.56, score: 66, tier: 'Needs Improvement' }
      ]
    },
    claims: [
      {
        id: 'CLM-004-001',
        date: '2025-08-15',
        type: 'Comprehensive - Theft',
        status: 'Paid',
        amount: 8500,
        description: 'Work tools stolen from truck bed',
        atFault: false,
        photos: 5,
        timeline: [
          { date: '2025-08-15', event: 'Claim Filed', note: 'Police report #2025-08-NJ-4521 attached' },
          { date: '2025-08-16', event: 'Under Review', note: 'Claims investigator assigned' },
          { date: '2025-08-20', event: 'Additional Info Requested', note: 'Tool purchase receipts needed' },
          { date: '2025-08-22', event: 'Documentation Received', note: 'Member submitted receipts' },
          { date: '2025-08-25', event: 'Approved', note: 'Verified via receipts and police report' },
          { date: '2025-08-28', event: 'Payment Issued', note: '$8,500 paid to member' }
        ]
      },
      {
        id: 'CLM-004-002',
        date: '2026-01-10',
        type: 'At-Fault Collision',
        status: 'Under Review',
        amount: 0,
        description: 'Backed into parked car in parking lot',
        atFault: true,
        photos: 3,
        timeline: [
          { date: '2026-01-10', event: 'Claim Filed', note: 'Member submitted incident photos' },
          { date: '2026-01-11', event: 'Under Review', note: 'Estimating damage costs' },
          { date: '2026-01-15', event: 'Third Party Contacted', note: 'Obtaining repair estimate from other party' }
        ]
      }
    ],
    claimFreeDays: 13,
    stats: {
      totalTrips: 542,
      totalMiles: 18450,
      avgMilesPerMonth: 2306,
      speedingEvents: 87,
      harshBrakingEvents: 92,
      nightTripPercent: 29
    }
  }
};

// Pool-level aggregated data
const POOL_DATA = {
  totalMembers: 2847,
  totalPremiumsCollected: 2340000,
  claimsPaidYTD: 1125000,
  lossRatio: 48.1,
  reserveBalance: 850000,
  memberBenefitsAccrued: 345000,
  avgDrivingScore: 84,
  avgMonthlyPremium: 102,
  claimFreeMemberPercent: 87
};

// Admin dashboard statistics
const ADMIN_STATS = {
  members: {
    total: 2847,
    active: 2721,
    suspended: 18,
    pendingOnboarding: 108
  },
  claims: {
    open: 23,
    underReview: 12,
    approved: 8,
    denied: 3,
    avgProcessingDays: 6.2
  },
  fraud: {
    flaggedClaims: 5,
    suspendedMembers: 3,
    investigationsOpen: 2
  },
  compliance: {
    mode: 'Beta Testing',
    state: 'NJ',
    benefitLedgerEnabled: true,
    rewardsOnlyMode: false
  },
  financial: {
    monthlyRevenue: 290340,
    monthlyExpenses: 178420,
    reserveRatio: 36.3,
    reinsuranceUtilization: 0
  }
};

// Export for use in demo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEMO_USERS, POOL_DATA, ADMIN_STATS };
}
