/**
 * Tillerstead Formula Library - Tile Quantity Formulas
 * 
 * All formulas are mathematically derived from geometry.
 * Waste factors are user-configurable defaults based on industry practice.
 * 
 * @module formulas.tile
 */

import { sqInchesToSqFeet, validatePositiveNumber, validatePercentage } from './units.js';
import { roundUp, formatNumber } from './rounding.js';

// ==
// TILE FORMULA METADATA
// ==

export const TILE_FORMULA_INFO = {
  name: 'Tile Quantity Calculator',
  description: 'Calculates number of tiles and boxes needed for a given area',
  version: '1.0.0',
  sources: [
    {
      name: 'Mathematical derivation',
      note: 'Area-based calculation: Area / Tile Size = Quantity',
      type: 'mathematical'
    }
  ],
  assumptions: [
    'Tile dimensions are nominal (actual tile size excluding grout joint)',
    'Waste factor is user-configurable with industry-typical defaults',
    'Box/carton quantities vary by manufacturer - user must input'
  ]
};

// ==
// WASTE FACTOR RECOMMENDATIONS
// ==

/**
 * Industry-typical waste factor recommendations by layout pattern
 * These are NOT manufacturer-mandated values - they are starting points
 * based on practical experience. User should adjust based on:
 * - Room complexity (corners, obstacles)
 * - Tile quality/variation
 * - Installer experience
 * 
 * @type {Object<string, { min: number, max: number, typical: number, note: string }>}
 */
export const WASTE_FACTORS = {
  straight: {
    min: 8,
    max: 12,
    typical: 10,
    note: 'Grid/stacked pattern - minimal cuts required'
  },
  offset_third: {
    min: 10,
    max: 15,
    typical: 12,
    note: '1/3 offset (recommended) - moderate cuts at edges'
  },
  offset_half: {
    min: 12,
    max: 18,
    typical: 15,
    note: '50% offset (brick) - more cuts, lippage risk with long tiles'
  },
  running_bond: {
    min: 10,
    max: 15,
    typical: 12,
    note: 'Running bond - similar to 1/3 offset'
  },
  diagonal: {
    min: 15,
    max: 22,
    typical: 18,
    note: 'Diagonal - all edges require cuts'
  },
  herringbone: {
    min: 20,
    max: 30,
    typical: 25,
    note: 'Herringbone - complex cutting, many small pieces'
  },
  mosaic: {
    min: 10,
    max: 15,
    typical: 12,
    note: 'Mosaic sheets - edge trimming'
  }
};

// ==
// TILE SIZE CALCULATIONS
// ==

/**
 * Calculate area of a single tile in square feet
 * 
 * @param {number} widthInches - Tile width in inches
 * @param {number} heightInches - Tile height (length) in inches
 * @returns {number} Area in square feet
 */
export function calculateTileArea(widthInches, heightInches) {
  const sqInches = widthInches * heightInches;
  return sqInchesToSqFeet(sqInches);
}

/**
 * Determine if tile is large-format (any side >= 15" per industry definition)
 * 
 * @param {number} widthInches
 * @param {number} heightInches
 * @returns {boolean}
 */
export function isLargeFormat(widthInches, heightInches) {
  // Industry defines large format as any tile with one side >= 15"
  // Some definitions use >= 16" or where one side >= 15" and area > 1 sq ft
  return Math.max(widthInches, heightInches) >= 15;
}

/**
 * Determine if tile is a plank format (length >= 3x width)
 * 
 * @param {number} widthInches
 * @param {number} heightInches
 * @returns {boolean}
 */
export function isPlankFormat(widthInches, heightInches) {
  const ratio = Math.max(widthInches, heightInches) / Math.min(widthInches, heightInches);
  return ratio >= 3;
}

// ==
// MAIN CALCULATION FUNCTIONS
// ==

/**
 * Calculate tile quantity needed for a project
 * 
 * FORMULA: tiles = (area * (1 + waste%)) / tileArea
 * 
 * @param {Object} params
 * @param {number} params.areaSqFt - Total area to tile in square feet
 * @param {number} params.tileWidthInches - Tile width in inches
 * @param {number} params.tileHeightInches - Tile height in inches
 * @param {number} params.wastePercent - Waste factor as percentage (e.g., 10 for 10%)
 * @returns {{ 
 *   valid: boolean, 
 *   errors: string[], 
 *   tiles: number, 
 *   areaWithWaste: number, 
 *   tileAreaSqFt: number,
 *   assumptions: string[]
 * }}
 */
export function calculateTileQuantity({
  areaSqFt,
  tileWidthInches,
  tileHeightInches,
  wastePercent = 10
}) {
  const errors = [];
  const assumptions = [];

  // Validate inputs
  const areaVal = validatePositiveNumber(areaSqFt, 'Area');
  const widthVal = validatePositiveNumber(tileWidthInches, 'Tile width');
  const heightVal = validatePositiveNumber(tileHeightInches, 'Tile height');
  const wasteVal = validatePercentage(wastePercent, 'Waste factor');

  if (!areaVal.valid) errors.push(areaVal.error);
  if (!widthVal.valid) errors.push(widthVal.error);
  if (!heightVal.valid) errors.push(heightVal.error);
  if (!wasteVal.valid) errors.push(wasteVal.error);

  if (errors.length > 0) {
    return { valid: false, errors, tiles: 0, areaWithWaste: 0, tileAreaSqFt: 0, assumptions };
  }

  // Calculate
  const tileAreaSqFt = calculateTileArea(widthVal.value, heightVal.value);
  const wasteFactor = 1 + (wasteVal.value / 100);
  const areaWithWaste = areaVal.value * wasteFactor;
  const tilesNeeded = roundUp(areaWithWaste / tileAreaSqFt);

  // Document assumptions
  assumptions.push(`Waste factor: ${wasteVal.value}%`);
  assumptions.push(`Tile area: ${formatNumber(tileAreaSqFt, 3)} sq ft each`);

  if (isLargeFormat(widthVal.value, heightVal.value)) {
    assumptions.push('Large-format tile: consider additional waste for cuts');
  }

  return {
    valid: true,
    errors: [],
    tiles: tilesNeeded,
    areaWithWaste: roundUp(areaWithWaste * 10) / 10, // round to 1 decimal
    tileAreaSqFt,
    assumptions
  };
}

/**
 * Calculate boxes/cartons needed
 * 
 * User must provide either tiles per box OR sq ft per box (from product packaging)
 * 
 * @param {Object} params
 * @param {number} params.tilesNeeded - Total tiles needed (from calculateTileQuantity)
 * @param {number} [params.tilesPerBox] - Tiles per box (from packaging)
 * @param {number} [params.sqFtPerBox] - Square feet per box (from packaging)
 * @param {number} [params.tileAreaSqFt] - Area per tile in sq ft (for sqFtPerBox mode)
 * @param {boolean} [params.addAtticStock=false] - Add 5% or 1 box for repairs
 * @returns {{
 *   valid: boolean,
 *   errors: string[],
 *   boxes: number,
 *   atticStockBoxes: number,
 *   assumptions: string[]
 * }}
 */
export function calculateBoxesNeeded({
  tilesNeeded,
  tilesPerBox,
  sqFtPerBox,
  tileAreaSqFt,
  addAtticStock = false
}) {
  const errors = [];
  const assumptions = [];

  // Validate we have needed inputs
  const tilesVal = validatePositiveNumber(tilesNeeded, 'Tiles needed');
  if (!tilesVal.valid) {
    return { valid: false, errors: [tilesVal.error], boxes: 0, atticStockBoxes: 0, assumptions };
  }

  let boxes = 0;

  // Method 1: Tiles per box
  if (tilesPerBox && tilesPerBox > 0) {
    boxes = roundUp(tilesVal.value / tilesPerBox);
    assumptions.push(`Using ${tilesPerBox} tiles per box (from packaging)`);
  }
  // Method 2: Sq ft per box
  else if (sqFtPerBox && sqFtPerBox > 0 && tileAreaSqFt && tileAreaSqFt > 0) {
    const tilesPerBoxCalc = sqFtPerBox / tileAreaSqFt;
    boxes = roundUp(tilesVal.value / tilesPerBoxCalc);
    assumptions.push(`Using ${sqFtPerBox} sq ft per box (from packaging)`);
  }
  else {
    errors.push('Provide either tiles per box or sq ft per box from product packaging');
    return { valid: false, errors, boxes: 0, atticStockBoxes: 0, assumptions };
  }

  // Attic stock calculation
  let atticStockBoxes = 0;
  if (addAtticStock) {
    atticStockBoxes = Math.max(1, roundUp(boxes * 0.05));
    boxes += atticStockBoxes;
    assumptions.push(`Attic stock: +${atticStockBoxes} box(es) for future repairs`);
  }

  return {
    valid: true,
    errors: [],
    boxes,
    atticStockBoxes,
    assumptions
  };
}

/**
 * Calculate mosaic sheet quantity
 * Mosaic tiles come on sheets with pre-determined coverage
 * 
 * @param {Object} params
 * @param {number} params.areaSqFt - Area to cover
 * @param {number} params.sheetCoverageSqFt - Coverage per sheet (from packaging)
 * @param {number} params.wastePercent - Waste factor
 * @returns {{ valid: boolean, errors: string[], sheets: number, assumptions: string[] }}
 */
export function calculateMosaicSheets({
  areaSqFt,
  sheetCoverageSqFt,
  wastePercent = 12
}) {
  const errors = [];
  const assumptions = [];

  const areaVal = validatePositiveNumber(areaSqFt, 'Area');
  const coverageVal = validatePositiveNumber(sheetCoverageSqFt, 'Sheet coverage');
  const wasteVal = validatePercentage(wastePercent, 'Waste factor');

  if (!areaVal.valid) errors.push(areaVal.error);
  if (!coverageVal.valid) errors.push(coverageVal.error);
  if (!wasteVal.valid) errors.push(wasteVal.error);

  if (errors.length > 0) {
    return { valid: false, errors, sheets: 0, assumptions };
  }

  const wasteFactor = 1 + (wasteVal.value / 100);
  const areaWithWaste = areaVal.value * wasteFactor;
  const sheets = roundUp(areaWithWaste / coverageVal.value);

  assumptions.push(`Mosaic sheets at ${coverageVal.value} sq ft each`);
  assumptions.push(`Waste factor: ${wasteVal.value}%`);

  return {
    valid: true,
    errors: [],
    sheets,
    assumptions
  };
}
