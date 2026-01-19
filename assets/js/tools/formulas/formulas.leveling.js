/**
 * Tillerstead Formula Library - Self-Leveling Compound Formulas
 * 
 * Coverage rates sourced from manufacturer TDS documents.
 * 
 * @module formulas.leveling
 */

import { validatePositiveNumber, inchesToFeet } from './units.js';
import { roundUp, formatNumber } from './rounding.js';

// ============================================
// LEVELING FORMULA METADATA
// ============================================

export const LEVELING_FORMULA_INFO = {
  name: 'Self-Leveling Calculator',
  description: 'Calculates self-leveling compound quantity based on area and depth',
  version: '1.0.0',
  sources: [
    {
      name: 'Mapei Self-Leveler Plus',
      url: 'https://www.mapei.com/us/en-us/products-and-solutions/products/detail/self-leveler-plus',
      retrieved: '2026-01-19',
      excerpt: '~48 sq ft at 1/8" thick = ~0.5 cu ft per 50 lb bag'
    },
    {
      name: 'Industry typical',
      note: '0.45-0.5 cu ft per 50 lb bag at 1" depth is conservative estimate',
      type: 'industry'
    }
  ],
  assumptions: [
    'Coverage varies by product - always verify with specific product TDS',
    'Substrate must be properly primed before application',
    'Self-leveling ≠ self-flattening; substrate must be within product limits',
    'Average depth used for calculation; actual pour varies across floor'
  ]
};

// ============================================
// LEVELING PRODUCT DATABASE
// ============================================

/**
 * Self-leveling compound specifications
 * 
 * Coverage is expressed as cubic feet per bag at 1" depth
 * or square feet per bag at a specified thickness.
 */
export const SLU_PRODUCTS = {
  'mapei-slf-plus': {
    brand: 'Mapei',
    productName: 'Self-Leveler Plus',
    bagSizeLbs: 50,
    coverageCuFtPerBag: 0.5,
    coverageSqFtAtEighthInch: 48,
    minThicknessInches: 0.125, // 1/8"
    maxThicknessInches: 1,
    source: {
      name: 'Mapei Self-Leveler Plus',
      url: 'https://www.mapei.com/us/en-us/products-and-solutions/products/detail/self-leveler-plus',
      retrieved: '2026-01-19'
    },
    notes: 'Use Mapei Primer T or ECO Prim Grip for priming. Can be extended with aggregate.'
  },
  'ardex-k15': {
    brand: 'ARDEX',
    productName: 'K 15',
    bagSizeLbs: 50,
    coverageCuFtPerBag: 0.4,
    coverageSqFtAtEighthInch: 44,
    minThicknessInches: 0.0625, // 1/16" feather edge
    maxThicknessInches: 2,
    source: {
      name: 'ARDEX K 15 (industry reference)',
      retrieved: '2026-01-19'
    },
    notes: 'Premium self-leveler. Primer required.'
  },
  'generic': {
    brand: 'Generic',
    productName: 'Self-Leveling Compound',
    bagSizeLbs: 50,
    coverageCuFtPerBag: 0.45,
    coverageSqFtAtEighthInch: 40,
    minThicknessInches: 0.125,
    maxThicknessInches: 1,
    source: {
      name: 'Industry typical (conservative)',
      type: 'industry'
    },
    notes: 'Conservative estimate. Verify with specific product TDS.'
  }
};

// ============================================
// MAIN CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate self-leveling compound needed
 * 
 * FORMULA: volume (cu ft) = area (sq ft) × depth (in) / 12
 *          bags = volume / coverage_per_bag
 * 
 * @param {Object} params
 * @param {number} params.areaSqFt - Area to level in square feet
 * @param {number} params.avgDepthInches - Average depth in inches
 * @param {number} [params.maxDepthInches] - Maximum depth for range calculation
 * @param {string} [params.productId='generic'] - Product ID from SLU_PRODUCTS
 * @returns {{
 *   valid: boolean,
 *   errors: string[],
 *   warnings: string[],
 *   bags: number,
 *   bagsMax: number | null,
 *   volumeCuFt: number,
 *   assumptions: string[],
 *   sources: Array<{ name: string, url?: string }>
 * }}
 */
export function calculateLeveler({
  areaSqFt,
  avgDepthInches,
  maxDepthInches,
  productId = 'generic'
}) {
  const errors = [];
  const warnings = [];
  const assumptions = [];
  const sources = [];

  // Validate inputs
  const areaVal = validatePositiveNumber(areaSqFt, 'Area');
  const depthVal = validatePositiveNumber(avgDepthInches, 'Average depth');

  if (!areaVal.valid) errors.push(areaVal.error);
  if (!depthVal.valid) errors.push(depthVal.error);

  // Get product
  const product = SLU_PRODUCTS[productId] || SLU_PRODUCTS.generic;

  if (errors.length > 0) {
    return { valid: false, errors, warnings, bags: 0, bagsMax: null, volumeCuFt: 0, assumptions, sources };
  }

  // Check depth against product limits
  if (depthVal.value < product.minThicknessInches) {
    warnings.push(`Depth ${depthVal.value}" is below minimum ${product.minThicknessInches}" for ${product.productName}`);
  }
  if (depthVal.value > product.maxThicknessInches) {
    warnings.push(`Depth ${depthVal.value}" exceeds maximum ${product.maxThicknessInches}" for ${product.productName}. Multiple pours required.`);
  }

  // Calculate volume (cubic feet)
  const depthFt = inchesToFeet(depthVal.value);
  const volumeCuFt = areaVal.value * depthFt;

  // Calculate bags
  const bags = roundUp(volumeCuFt / product.coverageCuFtPerBag);

  // Calculate max bags if max depth provided
  let bagsMax = null;
  if (maxDepthInches && maxDepthInches > depthVal.value) {
    const maxDepthFt = inchesToFeet(maxDepthInches);
    const maxVolumeCuFt = areaVal.value * maxDepthFt;
    bagsMax = roundUp(maxVolumeCuFt / product.coverageCuFtPerBag);
  }

  // Document assumptions
  assumptions.push(`Product: ${product.brand} ${product.productName}`);
  assumptions.push(`Coverage: ${product.coverageCuFtPerBag} cu ft per ${product.bagSizeLbs} lb bag`);
  assumptions.push(`Depth: ${formatNumber(depthVal.value, 3)}" average`);
  if (product.notes) {
    assumptions.push(product.notes);
  }

  // Add source
  if (product.source.url) {
    sources.push({
      name: product.source.name,
      url: product.source.url
    });
  } else {
    sources.push({
      name: product.source.name
    });
  }

  return {
    valid: true,
    errors: [],
    warnings,
    bags,
    bagsMax,
    volumeCuFt: Math.round(volumeCuFt * 100) / 100, // 2 decimals
    assumptions,
    sources
  };
}

/**
 * Get available self-leveling products
 * @returns {Array<{ id: string, brand: string, name: string, coverage: number, bagSize: number }>}
 */
export function getLevelerProducts() {
  return Object.entries(SLU_PRODUCTS).map(([id, product]) => ({
    id,
    brand: product.brand,
    name: product.productName,
    coverage: product.coverageCuFtPerBag,
    bagSize: product.bagSizeLbs,
    minDepth: product.minThicknessInches,
    maxDepth: product.maxThicknessInches
  }));
}
