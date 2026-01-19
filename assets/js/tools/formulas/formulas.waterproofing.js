/**
 * Tillerstead Formula Library - Waterproofing Formulas
 * 
 * Coverage rates sourced from manufacturer TDS documents.
 * All products include source citations.
 * 
 * @module formulas.waterproofing
 */

import { validatePositiveNumber, validatePercentage } from './units.js';
import { roundUp } from './rounding.js';

// ============================================
// WATERPROOFING FORMULA METADATA
// ============================================

export const WATERPROOFING_FORMULA_INFO = {
  name: 'Waterproofing Calculator',
  description: 'Calculates membrane and accessories for wet-area waterproofing',
  version: '1.0.0',
  sources: [
    {
      name: 'Custom Building Products - RedGard TDS',
      url: 'https://www.custombuildingproducts.com/wp-content/uploads/TDS-104-021425.pdf',
      retrieved: '2026-01-19',
      excerpt: 'Coverage: 55 sq ft/gal at 2 coats for ANSI A118.10 compliance (40 mils wet)'
    },
    {
      name: 'Custom Building Products - TB94',
      url: 'https://www.custombuildingproducts.com/media/60997801/tb94-understanding-the-coverage-rate-for-redgard.pdf',
      excerpt: '110 sq ft/gal per coat; 55 sq ft/gal total for 2 coats waterproofing'
    },
    {
      name: 'Mapei - AquaDefense TDS',
      url: 'https://www.wjgrosvenor.com/wp-content/uploads/2024/05/AquaDefense_TDS.pdf',
      retrieved: '2026-01-19',
      excerpt: 'Coverage: up to 60 sq ft/gal for waterproofing with 2 coats'
    },
    {
      name: 'LATICRETE - Hydro Ban TDS',
      url: 'https://cdn-global.laticrete.com/-/media/project/laticrete-international/north-america/product-documents/product-data-sheets/lds6630_hydro-ban.ashx',
      retrieved: '2026-01-19',
      excerpt: 'Coverage: ~50 sq ft/gal for 2 coats; exceeds ANSI A118.10'
    },
    {
      name: 'Schluter - KERDI Datasheet',
      url: 'https://assets.schluter.com/asset/570120892212/document_6plrad34eh1rj0g61f54npqu6c/Waterproofing%20Data%20Sheet.pdf',
      retrieved: '2026-01-19',
      excerpt: 'KERDI rolls: 54.5 sf (standard), 108 sf, 215 sf, 323 sf, 646 sf sizes'
    }
  ],
  assumptions: [
    'Coverage rates are manufacturer-specified for proper application thickness',
    'Liquid membranes require 2 coats for ANSI A118.10 waterproofing compliance',
    '15% waste factor included for cuts and overlaps',
    'Seam tape calculated at 2 ft per inside corner plus 8 ft per niche'
  ]
};

// ============================================
// WATERPROOFING PRODUCT DATABASE
// ============================================

/**
 * Waterproofing product specifications from manufacturer TDS
 * 
 * IMPORTANT: All coverage values are from official TDS documents.
 * Coverage is for complete waterproofing (2 coats for liquid).
 */
export const WP_PRODUCTS = {
  'redgard': {
    brand: 'Custom Building Products',
    productName: 'RedGard',
    type: 'liquid',
    unit: 'gallon',
    coverageSqFtPerUnit: 55,
    coatsRequired: 2,
    wetMilsPerCoat: 20,
    dryMilsTotal: 24,
    standards: ['ANSI A118.10', 'ANSI A118.12', 'IAPMO'],
    source: {
      name: 'TDS-104',
      url: 'https://www.custombuildingproducts.com/wp-content/uploads/TDS-104-021425.pdf',
      retrieved: '2026-01-19'
    },
    accessories: ['Mesh tape', 'Inside corners', 'Outside corners'],
    notes: 'Apply with 3/4" nap roller or 3/16"×1/4" V-notch trowel. Allow to dry pink to red between coats.'
  },
  'aquadefense': {
    brand: 'Mapei',
    productName: 'Mapelastic AquaDefense',
    type: 'liquid',
    unit: 'gallon',
    coverageSqFtPerUnit: 60,
    coatsRequired: 2,
    standards: ['ANSI A118.10', 'ANSI A118.12'],
    source: {
      name: 'AquaDefense TDS',
      url: 'https://www.wjgrosvenor.com/wp-content/uploads/2024/05/AquaDefense_TDS.pdf',
      retrieved: '2026-01-19'
    },
    accessories: ['Fabric tape'],
    notes: 'Apply 2 coats. Embed fabric tape in first coat at corners and seams.'
  },
  'hydroban': {
    brand: 'LATICRETE',
    productName: 'Hydro Ban',
    type: 'liquid',
    unit: 'gallon',
    coverageSqFtPerUnit: 50,
    coatsRequired: 2,
    standards: ['ANSI A118.10', 'ANSI A118.12'],
    source: {
      name: 'Hydro Ban TDS',
      url: 'https://cdn-global.laticrete.com/-/media/project/laticrete-international/north-america/product-documents/product-data-sheets/lds6630_hydro-ban.ashx',
      retrieved: '2026-01-19'
    },
    accessories: ['Hydro Ban Board', 'Seam Tape'],
    notes: 'Apply 2 coats with drying time between. Use with Hydro Ban Board for shower niches.'
  },
  'kerdi': {
    brand: 'Schluter',
    productName: 'KERDI',
    type: 'sheet',
    unit: 'roll (54.5 sf)',
    coverageSqFtPerUnit: 54.5,
    thicknessMils: 8,
    standards: ['ANSI A118.10'],
    source: {
      name: 'Schluter Waterproofing Data Sheet',
      url: 'https://assets.schluter.com/asset/570120892212/document_6plrad34eh1rj0g61f54npqu6c/Waterproofing%20Data%20Sheet.pdf',
      retrieved: '2026-01-19'
    },
    rollSizes: [
      { sqFt: 54.5, dimensions: '3\'3" × 16\'5"' },
      { sqFt: 108, dimensions: '3\'3" × 33\'' },
      { sqFt: 215, dimensions: '3\'3" × 65\'7"' },
      { sqFt: 323, dimensions: '3\'3" × 98\'5"' },
      { sqFt: 646, dimensions: '6\'7" × 98\'5"' }
    ],
    thinsetRequirement: 'unmodified',
    accessories: ['KERDI-BAND', 'KERDI-SEAL', 'KERDI-DRAIN', 'KERDI-KERECK'],
    notes: 'Must be set in unmodified thinset (ANSI A118.1). Use KERDI-BAND for seams and corners.'
  },
  'goboard': {
    brand: 'Johns Manville',
    productName: 'GoBoard',
    type: 'panel',
    unit: 'panel (15 sf)',
    coverageSqFtPerUnit: 15,
    panelDimensions: '3\' × 5\' × 1/2"',
    standards: ['ANSI A118.10'],
    source: {
      name: 'GoBoard manufacturer specs',
      retrieved: '2026-01-19'
    },
    accessories: ['GoBoard Sealant', 'Seam Tape'],
    notes: 'Waterproof at joints only. Seal all fastener holes with sealant.'
  }
};

// ============================================
// MAIN CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate waterproofing materials needed
 * 
 * @param {Object} params
 * @param {string} params.productId - Product ID from WP_PRODUCTS
 * @param {number} params.areaSqFt - Total area to waterproof in square feet
 * @param {number} [params.insideCorners=0] - Number of inside corners
 * @param {number} [params.niches=0] - Number of niches/benches
 * @param {number} [params.wastePercent=15] - Waste factor percentage
 * @returns {{
 *   valid: boolean,
 *   errors: string[],
 *   unitsNeeded: number,
 *   unit: string,
 *   seamTapeFt: number,
 *   cornerSeals: number,
 *   accessories: string[],
 *   assumptions: string[],
 *   sources: Array<{ name: string, url?: string }>
 * }}
 */
export function calculateWaterproofing({
  productId,
  areaSqFt,
  insideCorners = 0,
  niches = 0,
  wastePercent = 15
}) {
  const errors = [];
  const assumptions = [];
  const sources = [];

  // Validate inputs
  const areaVal = validatePositiveNumber(areaSqFt, 'Area');
  const wasteVal = validatePercentage(wastePercent, 'Waste factor');

  if (!areaVal.valid) errors.push(areaVal.error);
  if (!wasteVal.valid) errors.push(wasteVal.error);

  // Get product
  const product = WP_PRODUCTS[productId];
  if (!product) {
    errors.push(`Unknown waterproofing product: ${productId}`);
    return { valid: false, errors, unitsNeeded: 0, unit: '', seamTapeFt: 0, cornerSeals: 0, accessories: [], assumptions, sources };
  }

  if (errors.length > 0) {
    return { valid: false, errors, unitsNeeded: 0, unit: '', seamTapeFt: 0, cornerSeals: 0, accessories: [], assumptions, sources };
  }

  // Calculate area with waste
  const wasteFactor = 1 + (wasteVal.value / 100);
  const areaWithWaste = areaVal.value * wasteFactor;

  // Calculate units needed
  const unitsNeeded = roundUp(areaWithWaste / product.coverageSqFtPerUnit);

  // Calculate seam tape (2 ft per inside corner + 8 ft per niche)
  const cornerTape = (insideCorners || 0) * 2;
  const nicheTape = (niches || 0) * 8;
  const seamTapeFt = roundUp(cornerTape + nicheTape);

  // Document assumptions
  assumptions.push(`Product: ${product.brand} ${product.productName}`);
  assumptions.push(`Coverage: ${product.coverageSqFtPerUnit} sq ft per ${product.unit}`);
  if (product.coatsRequired) {
    assumptions.push(`Coats required: ${product.coatsRequired} for waterproofing compliance`);
  }
  assumptions.push(`Waste factor: ${wasteVal.value}%`);
  if (product.thinsetRequirement) {
    assumptions.push(`Thinset: ${product.thinsetRequirement} thinset required`);
  }

  // Add source
  sources.push({
    name: `${product.brand} ${product.productName} TDS`,
    url: product.source.url
  });

  return {
    valid: true,
    errors: [],
    unitsNeeded,
    unit: product.unit,
    seamTapeFt,
    cornerSeals: insideCorners || 0,
    accessories: product.accessories || [],
    productNotes: product.notes,
    standards: product.standards,
    assumptions,
    sources
  };
}

/**
 * Get list of available waterproofing products
 * @returns {Array<{ id: string, brand: string, name: string, type: string, coverage: number, unit: string }>}
 */
export function getWaterproofingProducts() {
  return Object.entries(WP_PRODUCTS).map(([id, product]) => ({
    id,
    brand: product.brand,
    name: product.productName,
    type: product.type,
    coverage: product.coverageSqFtPerUnit,
    unit: product.unit
  }));
}

/**
 * Get optimal Schluter KERDI roll size for area
 * @param {number} areaSqFt
 * @returns {{ sqFt: number, dimensions: string } | null}
 */
export function getOptimalKerdiRoll(areaSqFt) {
  const kerdi = WP_PRODUCTS.kerdi;
  if (!kerdi || !kerdi.rollSizes) return null;

  // Add 15% waste
  const areaWithWaste = areaSqFt * 1.15;

  // Find smallest roll that covers the area
  for (const roll of kerdi.rollSizes) {
    if (roll.sqFt >= areaWithWaste) {
      return roll;
    }
  }

  // If no single roll is large enough, return largest
  return kerdi.rollSizes[kerdi.rollSizes.length - 1];
}
