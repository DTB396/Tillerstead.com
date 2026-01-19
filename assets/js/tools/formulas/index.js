/**
 * Tillerstead Formula Library - Main Index
 * 
 * Single source of truth for all calculator formulas.
 * All coverage rates and constants are sourced from manufacturer TDS.
 * 
 * @module formulas
 */

// ============================================
// EXPORTS
// ============================================

// Unit conversion and validation
export * from './units.js';

// Rounding strategies
export * from './rounding.js';

// Tile quantity calculations
export * from './formulas.tile.js';

// Mortar/thinset calculations
export * from './formulas.mortar.js';

// Grout calculations
export * from './formulas.grout.js';

// Waterproofing calculations
export * from './formulas.waterproofing.js';

// Self-leveling compound calculations
export * from './formulas.leveling.js';

// Shower slope calculations
export * from './formulas.slope.js';

// ============================================
// LIBRARY METADATA
// ============================================

export const FORMULA_LIBRARY_INFO = {
  name: 'Tillerstead Formula Library',
  version: '1.0.0',
  description: 'Source-backed calculator formulas for tile installation projects',
  modules: [
    'units',
    'rounding',
    'formulas.tile',
    'formulas.mortar',
    'formulas.grout',
    'formulas.waterproofing',
    'formulas.leveling',
    'formulas.slope'
  ],
  principles: [
    'No unsourced constants - all values traced to TDS or standards',
    'Explicit units everywhere',
    'User-configurable variables clearly marked',
    'Assumptions documented in output',
    'Conservative estimates - round up for materials'
  ],
  maintainer: 'Tillerstead LLC',
  lastUpdated: '2026-01-19'
};

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Get all formula info objects
 * @returns {Object<string, Object>}
 */
export function getAllFormulaInfo() {
  // Lazy import to avoid circular dependencies
  const { TILE_FORMULA_INFO } = require('./formulas.tile.js');
  const { MORTAR_FORMULA_INFO } = require('./formulas.mortar.js');
  const { GROUT_FORMULA_INFO } = require('./formulas.grout.js');
  const { WATERPROOFING_FORMULA_INFO } = require('./formulas.waterproofing.js');
  const { LEVELING_FORMULA_INFO } = require('./formulas.leveling.js');
  const { SLOPE_FORMULA_INFO } = require('./formulas.slope.js');

  return {
    tile: TILE_FORMULA_INFO,
    mortar: MORTAR_FORMULA_INFO,
    grout: GROUT_FORMULA_INFO,
    waterproofing: WATERPROOFING_FORMULA_INFO,
    leveling: LEVELING_FORMULA_INFO,
    slope: SLOPE_FORMULA_INFO
  };
}
