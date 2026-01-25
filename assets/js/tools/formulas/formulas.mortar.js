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

// ==
// MORTAR FORMULA METADATA
// ==

export const MORTAR_FORMULA_INFO = {
  name: 'Mortar/Thinset Calculator',
  description: 'Calculates thinset mortar bags needed based on trowel notch size',
  version: '1.1.0',
  sources: [
    {
      name: 'Custom Building Products - VersaBond LFT TDS',
      url: 'https://www.custombuildingproducts.com/products/versabond-lft-professional-large-format-tile-mortar',
      retrieved: '2026-01-19',
      excerpt: 'Coverage: 1/4"x1/4" = 90-100 sq ft, 1/4"x3/8" = 60-67 sq ft, 3/4"x9/16" U-notch @30° = 38-47 sq ft per 50 lb bag. NOTE: 1/2"x1/2" square NOT recommended for LFT.'
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
    'Back-buttering (flat-back troweling) adds approximately 20-30% additional mortar consumption',
    'For LFT ≥15": use U-notch or ridged trowel that promotes ridge collapse',
    'User should verify with specific product TDS'
  ]
};

// ==
// TROWEL COVERAGE DATA
// ==

/**
 * Trowel notch coverage rates per 50 lb bag
 * 
 * SOURCE: Custom Building Products VersaBond & VersaBond LFT TDS
 * URL: https://www.custombuildingproducts.com/products/versabond-lft-professional-large-format-tile-mortar
 * 
 * IMPORTANT: For Large Format Tile (LFT ≥15"), Custom Building Products 
 * does NOT recommend 1/2"×1/2" square notch trowels. Use U-notch instead.
 * 
 * @type {Object<string, { name: string, coverageMin: number, coverageMax: number, source: string, recommendedFor: string, warning?: string }>}
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
    source: 'Custom Building Products VersaBond LFT TDS: 90-100 sq ft per 50 lb bag',
    recommendedFor: 'Tile up to 8"×8"'
  },
  '1/4x3/8-sq': {
    name: '1/4" × 3/8" Square',
    coverageMin: 60,
    coverageMax: 67,
    source: 'Custom Building Products VersaBond LFT TDS: 60-67 sq ft per 50 lb bag',
    recommendedFor: 'Tile 8"×8" to 13"×13"'
  },
  '1/2-sq': {
    name: '1/2" × 1/2" Square',
    coverageMin: 42,
    coverageMax: 47,
    source: 'Custom Building Products VersaBond LFT TDS: 42-47 sq ft per 50 lb bag',
    recommendedFor: 'Medium format tile 13"×13" to 15"×15"',
    warning: 'NOT RECOMMENDED FOR LFT by manufacturer. Use U-notch trowel instead for tiles ≥15". The 1/2" spacing makes it difficult to bed tiles and achieve proper coverage.'
  },
  '3/4x9/16-u-45': {
    name: '3/4" × 9/16" × 3/8" U-Notch @ 45°',
    coverageMin: 34,
    coverageMax: 42,
    source: 'Custom Building Products VersaBond LFT TDS: 34-42 sq ft per 50 lb bag',
    recommendedFor: 'Large Format Tile (LFT) ≥15", natural stone, tiles with deep back patterns'
  },
  '3/4x9/16-u-30': {
    name: '3/4" × 9/16" × 3/8" U-Notch @ 30°',
    coverageMin: 38,
    coverageMax: 47,
    source: 'Custom Building Products VersaBond LFT TDS: 38-47 sq ft per 50 lb bag',
    recommendedFor: 'Large Format Tile (LFT) ≥15" - better coverage than 1/2" square, same yield'
  }
};

/**
 * TCNA/ANSI coverage requirements by application
 * Source: TCNA Handbook 2025, ANSI A108
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

/**
 * TCNA/ANSI Substrate Flatness Requirements
 * Source: ANSI A108.02, TCNA Handbook 2025
 */
export const SUBSTRATE_FLATNESS = {
  standard_tile: {
    max_variation_10ft: '1/4"',
    max_variation_12in: '1/16"',
    applies_to: 'Tiles with all edges <15"',
    source: 'ANSI A108.02'
  },
  large_format_tile: {
    max_variation_10ft: '1/8"',
    max_variation_24in: '1/16"',
    applies_to: 'Tiles with any edge ≥15" (LFT) and natural stone',
    source: 'ANSI A108.02'
  },
  note: 'If substrate does not meet flatness tolerances, lippage standards do NOT apply. Installer cannot be held responsible for lippage caused by out-of-tolerance substrate.'
};

/**
 * Deflection Requirements
 * Source: TCNA Handbook
 */
export const DEFLECTION_REQUIREMENTS = {
  ceramic_tile: {
    maximum: 'L/360',
    description: 'Span length (inches) ÷ 360',
    example: '10 ft span (120") = max 1/3" deflection'
  },
  natural_stone: {
    maximum: 'L/720',
    description: 'Span length (inches) ÷ 720',
    example: '10 ft span (120") = max 1/6" deflection'
  },
  source: 'TCNA Handbook',
  note: 'Excessive deflection causes grout cracking and tile failure. Verify before installation.'
};

/**
 * PRO TIPS: Common installation issues and prevention
 */
export const PRO_TIPS = {
  mortar_application: [
    'Comb mortar in ONE direction only (not swirling) - creates consistent ridges',
    'Press tile perpendicular to ridges to collapse them and eliminate voids',
    'Work in small sections - mortar should not skin over before tile is set',
    'Key in (burn) a thin layer to substrate before combing for better bond'
  ],
  coverage_verification: [
    'Periodically lift tiles to verify coverage - especially first few tiles',
    'Look for full collapse of ridges with no voids',
    'All tile edges must be supported - especially corners',
    'Document coverage checks on wet area installations'
  ],
  back_buttering: [
    'Required by ANSI A108.5 when 95% coverage is specified',
    'Flat-back trowel (formerly "back-butter") a skim coat on tile back',
    'For tiles with deep lugs, use notched-back troweling technique',
    'Back-buttering adds 20-30% mortar consumption - factor into estimates'
  ],
  large_format_tile: [
    'ALWAYS use U-notch or ridged trowel - NOT 1/2" square (per CBP TDS)',
    'Back-butter every tile - no exceptions',
    'Limit running bond offset to 33% max (not 50%) to reduce lippage',
    'Use tile leveling system (clips/wedges) for consistent lippage control',
    'Substrate MUST meet LFT flatness tolerance (1/8" in 10 ft) before starting'
  ],
  open_time: [
    'Check mortar open time on TDS - typically 20-30 minutes',
    'If ridges do not collapse when pressing tile, scrape and re-apply',
    'Hot/dry conditions reduce open time significantly',
    'Do not set tile into skinned-over mortar'
  ]
};

// ==
// TROWEL RECOMMENDATION LOGIC
// ==

/**
 * Get recommended trowel notch based on tile size
 * 
 * Based on Custom Building Products VersaBond LFT TDS and industry guidelines.
 * These are STARTING POINTS - actual trowel should be verified in field
 * by lifting test tiles to check coverage.
 * 
 * CRITICAL: For Large Format Tile (≥15"), manufacturer does NOT recommend 
 * 1/2"×1/2" square notch. Use U-notch trowel instead.
 * 
 * @param {number} tileWidthInches
 * @param {number} tileHeightInches
 * @param {string} [substrate='typical'] - 'smooth', 'typical', 'needs-flattening'
 * @returns {{
 *   trowelId: string,
 *   backButter: boolean,
 *   note: string,
 *   source: string,
 *   warning?: string
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
    source: 'Custom Building Products VersaBond LFT TDS'
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
  // Large format (>= 15" on any side) - USE U-NOTCH, NOT SQUARE
  else {
    result.trowelId = '3/4x9/16-u-30';  // U-notch at 30° - per CBP TDS recommendation
    result.backButter = true;
    result.note = '3/4" × 9/16" U-notch @ 30° for large format tile. Back-buttering (flat-back troweling) required for 95% coverage.';
    result.warning = 'Per Custom Building Products TDS: Do NOT use 1/2"×1/2" square notch for LFT. U-notch promotes better mortar ridge collapse.';
  }

  // Substrate adjustment
  if (substrate === 'needs-flattening') {
    result.note += ' Substrate may need flattening - larger notch compensates but does not replace proper prep.';
  }

  return result;
}

// ==
// MAIN CALCULATION FUNCTIONS
// ==

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
