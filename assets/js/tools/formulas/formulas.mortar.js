/**
 * Tillerstead Formula Library - Mortar/Thinset Formulas
 * 
 * Coverage rates sourced from manufacturer TDS documents.
 * All constants include source citations.
 * 
 * @module formulas.mortar
 */

import { validatePositiveNumber, validatePercentage } from './units.js';
import { roundUp, formatRange } from './rounding.js';

// ============================================
// MORTAR FORMULA METADATA
// ============================================

export const MORTAR_FORMULA_INFO = {
  name: 'Mortar/Thinset Calculator',
  description: 'Calculates thinset mortar bags needed based on trowel notch size',
  version: '1.0.0',
  sources: [
    {
      name: 'Custom Building Products - VersaBond TDS',
      url: 'https://www.custombuildingproducts.com/products/versabond-professional-thin-set-mortar-2',
      retrieved: '2026-01-19',
      excerpt: 'Coverage: 1/4"x1/4" = 90-100 sq ft, 1/4"x3/8" = 60-67 sq ft, 1/2"x1/2" = 42-47 sq ft per 50 lb bag'
    },
    {
      name: 'TCNA Handbook',
      note: 'Minimum 80% coverage dry areas, 95% wet areas, all tile edges supported',
      type: 'standard'
    },
    {
      name: 'ANSI A108/A118',
      note: 'Installation standards requiring proper trowel selection for coverage',
      type: 'standard'
    }
  ],
  assumptions: [
    'Coverage rates are manufacturer-provided ranges for typical conditions',
    'Actual coverage varies by substrate flatness, troweling technique, and tile back pattern',
    'Back-buttering adds approximately 20-30% additional mortar consumption',
    'User should verify with specific product TDS'
  ]
};

// ============================================
// TROWEL COVERAGE DATA
// ============================================

/**
 * Trowel notch coverage rates per 50 lb bag
 * 
 * SOURCE: Custom Building Products VersaBond TDS
 * URL: https://www.custombuildingproducts.com/products/versabond-professional-thin-set-mortar-2
 * 
 * Note: These are industry-typical values. Always verify with specific product TDS.
 * 
 * @type {Object<string, { name: string, coverageMin: number, coverageMax: number, source: string }>}
 */
export const TROWEL_COVERAGE = {
  '3/16-v': {
    name: '3/16" V-Notch',
    coverageMin: 95,
    coverageMax: 120,
    source: 'Industry typical for mosaic/small tile; verify with product TDS',
    recommendedFor: 'Mosaic, tile ≤2"'
  },
  '1/4-sq': {
    name: '1/4" × 1/4" Square',
    coverageMin: 90,
    coverageMax: 100,
    source: 'Custom Building Products VersaBond TDS: 90-100 sq ft per 50 lb bag',
    recommendedFor: 'Tile up to 8"×8"'
  },
  '1/4x3/8-sq': {
    name: '1/4" × 3/8" Square',
    coverageMin: 60,
    coverageMax: 67,
    source: 'Custom Building Products VersaBond TDS: 60-67 sq ft per 50 lb bag',
    recommendedFor: 'Tile 8"×8" to 13"×13"'
  },
  '1/2-sq': {
    name: '1/2" × 1/2" Square',
    coverageMin: 42,
    coverageMax: 47,
    source: 'Custom Building Products VersaBond TDS: 42-47 sq ft per 50 lb bag',
    recommendedFor: 'Large format tile ≥15" or natural stone'
  }
};

/**
 * TCNA/ANSI coverage requirements by application
 */
export const COVERAGE_REQUIREMENTS = {
  dry_interior: {
    minimumPercent: 80,
    source: 'TCNA Handbook / ANSI A108',
    note: 'Dry interior floors - minimum 80% coverage'
  },
  wet_area: {
    minimumPercent: 95,
    source: 'TCNA Handbook / ANSI A108',
    note: 'Wet areas, exteriors - minimum 95% coverage with full edge support'
  },
  large_format: {
    minimumPercent: 95,
    source: 'TCNA Handbook / Industry best practice',
    note: 'Large format tile (≥15") - 95% coverage recommended with back-buttering'
  }
};

// ============================================
// TROWEL RECOMMENDATION LOGIC
// ============================================

/**
 * Get recommended trowel notch based on tile size
 * 
 * Based on industry guidelines and manufacturer recommendations.
 * These are STARTING POINTS - actual trowel should be verified in field
 * by lifting test tiles to check coverage.
 * 
 * @param {number} tileWidthInches
 * @param {number} tileHeightInches
 * @param {string} [substrate='typical'] - 'smooth', 'typical', 'needs-flattening'
 * @returns {{
 *   trowelId: string,
 *   backButter: boolean,
 *   note: string,
 *   source: string
 * }}
 */
export function getRecommendedTrowel(tileWidthInches, tileHeightInches, substrate = 'typical') {
  const smallestSide = Math.min(tileWidthInches, tileHeightInches);
  const largestSide = Math.max(tileWidthInches, tileHeightInches);
  const tileArea = tileWidthInches * tileHeightInches;

  let result = {
    trowelId: '1/4-sq',
    backButter: false,
    note: '',
    source: 'Industry typical based on tile size'
  };

  // Mosaic or very small tile (< 2")
  if (smallestSide <= 2) {
    result.trowelId = '3/16-v';
    result.note = '3/16" V-notch typical for small tile/mosaic. Verify coverage.';
  }
  // Small to medium (up to 8×8)
  else if (largestSide <= 8) {
    result.trowelId = '1/4-sq';
    result.note = '1/4" × 1/4" square notch typical for tiles up to 8"×8".';
  }
  // Medium (up to 13×13)
  else if (largestSide <= 13) {
    result.trowelId = '1/4x3/8-sq';
    result.backButter = substrate !== 'smooth';
    result.note = '1/4" × 3/8" square notch for medium tile. Back-butter recommended.';
  }
  // Large format (>= 15" on any side)
  else {
    result.trowelId = '1/2-sq';
    result.backButter = true;
    result.note = '1/2" × 1/2" square notch for large format. Back-buttering required for 95% coverage.';
  }

  // Substrate adjustment
  if (substrate === 'needs-flattening') {
    const trowels = Object.keys(TROWEL_COVERAGE);
    const currentIndex = trowels.indexOf(result.trowelId);
    if (currentIndex < trowels.length - 1) {
      result.trowelId = trowels[currentIndex + 1];
    }
    result.note += ' Substrate may need flattening - larger notch compensates but does not replace proper prep.';
  }

  return result;
}

// ============================================
// MAIN CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate mortar/thinset bags needed
 * 
 * FORMULA: bags = area / coverage_per_bag
 * 
 * @param {Object} params
 * @param {number} params.areaSqFt - Area to cover in square feet
 * @param {string} params.trowelId - Trowel notch ID from TROWEL_COVERAGE
 * @param {boolean} [params.backButter=false] - Include back-buttering (+20-30%)
 * @param {number} [params.bagSizeLbs=50] - Bag size (default 50 lb)
 * @returns {{
 *   valid: boolean,
 *   errors: string[],
 *   bagsMin: number,
 *   bagsMax: number,
 *   coverageRange: string,
 *   assumptions: string[],
 *   sources: string[]
 * }}
 */
export function calculateMortarBags({
  areaSqFt,
  trowelId,
  backButter = false,
  bagSizeLbs = 50
}) {
  const errors = [];
  const assumptions = [];
  const sources = [];

  // Validate inputs
  const areaVal = validatePositiveNumber(areaSqFt, 'Area');
  if (!areaVal.valid) {
    return { valid: false, errors: [areaVal.error], bagsMin: 0, bagsMax: 0, coverageRange: '', assumptions, sources };
  }

  // Get trowel coverage
  const trowel = TROWEL_COVERAGE[trowelId];
  if (!trowel) {
    return { valid: false, errors: [`Unknown trowel: ${trowelId}`], bagsMin: 0, bagsMax: 0, coverageRange: '', assumptions, sources };
  }

  // Calculate bag range
  let bagsMin = roundUp(areaVal.value / trowel.coverageMax);
  let bagsMax = roundUp(areaVal.value / trowel.coverageMin);

  assumptions.push(`Trowel: ${trowel.name}`);
  assumptions.push(`Coverage: ${trowel.coverageMin}–${trowel.coverageMax} sq ft per ${bagSizeLbs} lb bag`);
  sources.push(trowel.source);

  // Back-buttering adjustment
  if (backButter) {
    bagsMin = roundUp(bagsMin * 1.2); // +20% minimum
    bagsMax = roundUp(bagsMax * 1.3); // +30% maximum
    assumptions.push('Back-buttering: +20-30% mortar consumption added');
  }

  // Handle bag size other than 50 lb
  if (bagSizeLbs !== 50) {
    const ratio = 50 / bagSizeLbs;
    bagsMin = roundUp(bagsMin * ratio);
    bagsMax = roundUp(bagsMax * ratio);
    assumptions.push(`Adjusted for ${bagSizeLbs} lb bag size`);
  }

  return {
    valid: true,
    errors: [],
    bagsMin,
    bagsMax,
    coverageRange: formatRange(trowel.coverageMin, trowel.coverageMax, 'sq ft/bag'),
    assumptions,
    sources
  };
}

/**
 * Get trowel options with metadata
 * @returns {Array<{ id: string, name: string, coverageMin: number, coverageMax: number, recommendedFor: string }>}
 */
export function getTrowelOptions() {
  return Object.entries(TROWEL_COVERAGE).map(([id, data]) => ({
    id,
    name: data.name,
    coverageMin: data.coverageMin,
    coverageMax: data.coverageMax,
    recommendedFor: data.recommendedFor
  }));
}
