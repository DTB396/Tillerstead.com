/**
 * Tillerstead Formula Library - Shower Slope Formulas
 * 
 * Slope requirements from IPC (International Plumbing Code).
 * 
 * @module formulas.slope
 */

import { validatePositiveNumber } from './units.js';
import { toFractionString } from './rounding.js';

// ==
// SLOPE FORMULA METADATA
// ==

export const SLOPE_FORMULA_INFO = {
  name: 'Shower Slope Calculator',
  description: 'Calculates required pre-slope for shower pans per IPC code',
  version: '1.0.0',
  sources: [
    {
      name: 'IPC Section 417.5.2',
      note: 'Minimum 1/4" per foot slope toward drain',
      type: 'code'
    },
    {
      name: 'NJ Building Code',
      note: 'New Jersey adopts IPC with local amendments',
      type: 'code'
    }
  ],
  assumptions: [
    'Minimum slope per IPC: 1/4" per foot',
    'Recommended slope: 5/16" per foot for better drainage',
    'Linear drains may reduce effective slope distance',
    'Substrate must achieve slope before waterproofing (bonded systems)'
  ]
};

// ==
// SLOPE CONSTANTS
// ==

/**
 * Slope requirements per IPC code
 * All values in inches per foot
 */
export const SLOPE_REQUIREMENTS = {
  minimum: {
    inchesPerFoot: 0.25, // 1/4"
    fraction: '1/4"',
    source: 'IPC Section 417.5.2',
    note: 'Code minimum'
  },
  recommended: {
    inchesPerFoot: 0.3125, // 5/16"
    fraction: '5/16"',
    source: 'Industry best practice',
    note: 'Recommended for better drainage'
  }
};

/**
 * Drain type adjustments
 */
export const DRAIN_TYPES = {
  center: {
    name: 'Center Drain',
    distanceMultiplier: 1.0,
    note: 'Standard center drain - slope from all directions'
  },
  linear: {
    name: 'Linear Drain',
    distanceMultiplier: 0.75,
    note: 'Linear drains reduce effective slope distance (single direction slope)'
  },
  offset: {
    name: 'Offset Drain',
    distanceMultiplier: 1.15,
    note: 'Offset drain may require additional slope considerations'
  }
};

/**
 * Construction method notes
 */
export const CONSTRUCTION_METHODS = {
  'mud-bed': {
    name: 'Traditional Mud Bed',
    note: 'Traditional mud bed allows precise slope control. Use dry-pack mortar (4:1 sand:cement ratio) reinforced with metal lath.',
    source: 'TCNA Handbook'
  },
  'foam-pan': {
    name: 'Pre-Sloped Foam Pan',
    note: 'Pre-sloped foam pans are factory-made to code. Verify slope before waterproofing. Faster install, consistent results.',
    source: 'Product manufacturers'
  },
  'bonded': {
    name: 'Bonded System (Kerdi, Wedi)',
    note: 'Bonded waterproofing systems require substrate slope. Build slope into substrate before membrane installation.',
    source: 'Schluter, Wedi installation guides'
  }
};

// ==
// MAIN CALCULATION FUNCTIONS
// ==

/**
 * Calculate shower slope requirements
 * 
 * FORMULA: height = distance × slope_per_foot
 * 
 * @param {Object} params
 * @param {number} params.distanceToDrawnFt - Distance from farthest point to drain (feet)
 * @param {string} [params.drainType='center'] - Drain type from DRAIN_TYPES
 * @param {string} [params.constructionMethod='mud-bed'] - Method from CONSTRUCTION_METHODS
 * @returns {{
 *   valid: boolean,
 *   errors: string[],
 *   minSlopeHeight: number,
 *   minSlopeFormatted: string,
 *   recSlopeHeight: number,
 *   recSlopeFormatted: string,
 *   effectiveDistance: number,
 *   constructionNote: string,
 *   assumptions: string[],
 *   sources: string[]
 * }}
 */
export function calculateSlope({
  distanceToDrawnFt,
  drainType = 'center',
  constructionMethod = 'mud-bed'
}) {
  const errors = [];
  const assumptions = [];
  const sources = [];

  // Validate inputs
  const distVal = validatePositiveNumber(distanceToDrawnFt, 'Distance to drain');
  if (!distVal.valid) {
    return {
      valid: false,
      errors: [distVal.error],
      minSlopeHeight: 0,
      minSlopeFormatted: '',
      recSlopeHeight: 0,
      recSlopeFormatted: '',
      effectiveDistance: 0,
      constructionNote: '',
      assumptions,
      sources
    };
  }

  // Get drain type configuration
  const drain = DRAIN_TYPES[drainType] || DRAIN_TYPES.center;
  const method = CONSTRUCTION_METHODS[constructionMethod] || CONSTRUCTION_METHODS['mud-bed'];

  // Calculate effective distance
  const effectiveDistance = distVal.value * drain.distanceMultiplier;

  // Calculate heights
  const minSlopeHeight = effectiveDistance * SLOPE_REQUIREMENTS.minimum.inchesPerFoot;
  const recSlopeHeight = effectiveDistance * SLOPE_REQUIREMENTS.recommended.inchesPerFoot;

  // Format heights
  const formatHeight = (inches) => {
    return `${toFractionString(inches)}"`;
  };

  // Document assumptions
  assumptions.push(`Drain type: ${drain.name}`);
  assumptions.push(`Distance to drain: ${distVal.value} ft`);
  if (drain.distanceMultiplier !== 1.0) {
    assumptions.push(`Effective distance adjusted: ${effectiveDistance.toFixed(2)} ft`);
  }
  assumptions.push(`Minimum slope: ${SLOPE_REQUIREMENTS.minimum.fraction}/ft (IPC code)`);
  assumptions.push(`Recommended slope: ${SLOPE_REQUIREMENTS.recommended.fraction}/ft`);

  // Add sources
  sources.push(SLOPE_REQUIREMENTS.minimum.source);
  sources.push(method.source);

  return {
    valid: true,
    errors: [],
    minSlopeHeight,
    minSlopeFormatted: `${SLOPE_REQUIREMENTS.minimum.fraction}/ft (${formatHeight(minSlopeHeight)} at ${distVal.value} ft)`,
    recSlopeHeight,
    recSlopeFormatted: `${SLOPE_REQUIREMENTS.recommended.fraction}/ft (${formatHeight(recSlopeHeight)} at ${distVal.value} ft)`,
    effectiveDistance,
    constructionNote: method.note,
    assumptions,
    sources
  };
}

/**
 * Get drain type options
 * @returns {Array<{ id: string, name: string, note: string }>}
 */
export function getDrainTypes() {
  return Object.entries(DRAIN_TYPES).map(([id, data]) => ({
    id,
    name: data.name,
    note: data.note
  }));
}

/**
 * Get construction method options
 * @returns {Array<{ id: string, name: string, note: string }>}
 */
export function getConstructionMethods() {
  return Object.entries(CONSTRUCTION_METHODS).map(([id, data]) => ({
    id,
    name: data.name,
    note: data.note
  }));
}
