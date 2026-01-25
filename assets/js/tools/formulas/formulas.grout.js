/**
 * Tillerstead Formula Library - Grout Formulas
 * 
 * Grout quantity calculation based on geometric joint volume.
 * Formula is mathematically derived; density values vary by product.
 * 
 * @module formulas.grout
 */

import { validatePositiveNumber, validatePercentage, mmToInches } from './units.js';
import { roundUp } from './rounding.js';

// ==
// GROUT FORMULA METADATA
// ==

export const GROUT_FORMULA_INFO = {
  name: 'Grout Calculator',
  description: 'Calculates grout quantity based on tile dimensions and joint size',
  version: '1.0.0',
  sources: [
    {
      name: 'Mathematical derivation',
      note: 'Joint volume = (L+W)/(L×W) × thickness × joint_width × area × density',
      type: 'mathematical'
    },
    {
      name: 'TCNA FAQ on Grout',
      url: 'https://tcnatile.com/resource-center/faq/grout/',
      excerpt: 'Sanded grout for joints 1/8" or larger; unsanded for less than 1/8"'
    },
    {
      name: 'Custom Building Products TB85',
      url: 'https://www.custombuildingproducts.com/media/60712312/tb85-grout-joint-width.pdf',
      excerpt: 'Grout joint width recommendations based on tile type and variation'
    }
  ],
  assumptions: [
    'Grout joint depth equals tile thickness (typical for floor tile)',
    'Cement grout density approximately 100 lbs/cu ft',
    'Epoxy grout density approximately 110 lbs/cu ft',
    '10% waste factor included in calculations',
    'Actual coverage varies by mixing consistency and application technique'
  ]
};

// ==
// GROUT CONSTANTS
// ==

/**
 * Grout density values (lbs per cubic foot)
 * 
 * Note: These are typical values. Actual density varies by manufacturer and product.
 * Users should verify with specific product TDS.
 */
export const GROUT_DENSITY = {
  cement: {
    lbsPerCuFt: 100,
    note: 'Typical cement-based grout (sanded or unsanded)',
    source: 'Industry typical - verify with product TDS'
  },
  epoxy: {
    lbsPerCuFt: 110,
    note: 'Epoxy grout - typically denser than cement',
    source: 'Industry typical - verify with product TDS'
  }
};

/**
 * Grout joint width recommendations
 * 
 * SOURCE: TCNA, Custom Building Products TB85
 */
export const JOINT_RECOMMENDATIONS = {
  rectified: {
    minInches: 0.125, // 1/8"
    note: 'Rectified tile: minimum 1/8" joint',
    source: 'TCNA / Industry standard'
  },
  calibrated: {
    minInches: 0.1875, // 3/16"
    note: 'Calibrated (non-rectified) tile: minimum 3/16" joint',
    source: 'TCNA / Industry standard'
  },
  handmade: {
    minInches: 0.25, // 1/4"
    note: 'Handmade/rustic tile: 1/4" or wider based on variation',
    source: 'TCNA / Industry standard'
  },
  absolute_minimum: {
    minInches: 0.0625, // 1/16"
    note: 'ANSI A108.02 Section 4.3.8: In NO circumstance shall grout joint be less than 1/16"',
    source: 'ANSI A108.02'
  },
  variation_rule: {
    note: 'Joint width should be at least 3× the tile facial dimensional variation',
    example: '1/32" tile variation = minimum 3/32" (round to 1/8") joint',
    source: 'TCNA / Custom Building Products TB85'
  }
};

/**
 * Grout type by joint width
 * Source: TCNA FAQ, ANSI A118.6
 */
export const GROUT_TYPE_BY_JOINT = {
  unsanded: {
    maxJointInches: 0.125, // 1/8"
    note: 'Use unsanded grout for joints < 1/8" to prevent scratching polished surfaces',
    bestFor: 'Polished marble, polished stone, narrow joints',
    source: 'TCNA FAQ / ANSI A118.6'
  },
  sanded: {
    minJointInches: 0.125, // 1/8"
    note: 'Use sanded grout for joints 1/8" or larger to prevent shrinking and cracking',
    bestFor: 'Floor tile, wide joints, high-traffic areas',
    source: 'TCNA FAQ / ANSI A118.6'
  },
  epoxy: {
    note: 'Chemical resistant, stain resistant, no sealing required',
    bestFor: 'Commercial kitchens, labs, hospitals, pools, areas requiring chemical resistance',
    caution: 'More difficult to work, shorter working time, higher cost',
    source: 'TCNA Handbook'
  }
};

/**
 * Large Format Tile joint requirements
 * Source: TCNA Handbook, TileBar technical guide
 */
export const LFT_JOINT_REQUIREMENTS = {
  running_bond_offset: {
    maximum: '33%',
    reason: 'Running bond at 50% offset with LFT causes significant lippage due to tile warpage',
    note: 'Offset should not exceed 33% (1/3) for tiles ≥15"',
    source: 'TCNA Handbook'
  },
  joint_width: {
    minimum: '1/8" for rectified, 3/16" for calibrated',
    recommendation: 'Wider joints help mask lippage and accommodate tile variation',
    source: 'TCNA / Industry best practice'
  }
};

/**
 * PRO TIPS: Grout installation
 */
export const GROUT_PRO_TIPS = {
  mixing: [
    'Mix to peanut butter consistency - not too wet, not too dry',
    'Slake (let rest) for 5-10 minutes after initial mix, then remix briefly',
    'Do NOT add water after slaking - will weaken grout',
    'Mix only what you can use within working time (typically 30 minutes)'
  ],
  application: [
    'Push grout diagonally across joints - not parallel',
    'Work grout into joints with firm pressure to eliminate voids',
    'Remove excess at 45° angle to avoid pulling grout from joints',
    'Work in small sections (10-20 sq ft) in warm/dry conditions'
  ],
  cleaning: [
    'Initial wipe when grout firms (fingerprint test - should not stick)',
    'Use clean water and change frequently',
    'Second wipe to remove haze after initial set',
    'Final polish with dry cloth when grout is firm but not fully cured'
  ],
  curing: [
    'Keep grout damp for 72 hours minimum (cement grout) - mist with water',
    'Avoid foot traffic for 24-48 hours depending on product',
    'Do not seal for 28 days (full cure) or per manufacturer instructions',
    'Epoxy grout: follow manufacturer cure time strictly'
  ],
  common_mistakes: [
    'Adding too much water - causes weak, powdery grout',
    'Cleaning too soon - pulls grout from joints',
    'Cleaning too late - grout haze becomes permanent',
    'Using same water for entire floor - redeposits haze',
    'Not sealing cement grout - allows staining (applies to cement grout only)'
  ]
};

// ==
// MAIN CALCULATION FUNCTIONS
// ==

/**
 * Calculate grout quantity needed
 * 
 * FORMULA:
 * Joint perimeter per tile = (L + W) × 2 / 2 = (L + W)
 * Joint volume per tile = (L + W) × joint_width × tile_thickness
 * Tiles per sq ft = 144 / (L × W)
 * Total joint volume = joint_volume_per_tile × tiles_per_sq_ft × area
 * Grout weight = total_volume × density
 * 
 * @param {Object} params
 * @param {number} params.areaSqFt - Area to grout in square feet
 * @param {number} params.tileLengthInches - Tile length in inches
 * @param {number} params.tileWidthInches - Tile width in inches
 * @param {number} params.tileThicknessMm - Tile thickness in millimeters
 * @param {number} params.jointWidthInches - Grout joint width in inches
 * @param {string} [params.groutType='cement'] - 'cement' or 'epoxy'
 * @param {boolean} [params.isMosaic=false] - Mosaic tiles use more grout
 * @param {number} [params.wastePercent=10] - Waste factor percentage
 * @returns {{
 *   valid: boolean,
 *   errors: string[],
 *   quantityLbs: number,
 *   volumeCuFt: number,
 *   recommendedType: string,
 *   assumptions: string[],
 *   sources: string[]
 * }}
 */
export function calculateGrout({
  areaSqFt,
  tileLengthInches,
  tileWidthInches,
  tileThicknessMm,
  jointWidthInches,
  groutType = 'cement',
  isMosaic = false,
  wastePercent = 10
}) {
  const errors = [];
  const assumptions = [];
  const sources = [];

  // Validate inputs
  const areaVal = validatePositiveNumber(areaSqFt, 'Area');
  const lengthVal = validatePositiveNumber(tileLengthInches, 'Tile length');
  const widthVal = validatePositiveNumber(tileWidthInches, 'Tile width');
  const thicknessVal = validatePositiveNumber(tileThicknessMm, 'Tile thickness');
  const jointVal = validatePositiveNumber(jointWidthInches, 'Joint width');
  const wasteVal = validatePercentage(wastePercent, 'Waste factor');

  if (!areaVal.valid) errors.push(areaVal.error);
  if (!lengthVal.valid) errors.push(lengthVal.error);
  if (!widthVal.valid) errors.push(widthVal.error);
  if (!thicknessVal.valid) errors.push(thicknessVal.error);
  if (!jointVal.valid) errors.push(jointVal.error);
  if (!wasteVal.valid) errors.push(wasteVal.error);

  if (errors.length > 0) {
    return { valid: false, errors, quantityLbs: 0, volumeCuFt: 0, recommendedType: '', assumptions, sources };
  }

  // Convert thickness to inches
  const tileThicknessInches = mmToInches(thicknessVal.value);

  // Calculate
  const tileSqInches = lengthVal.value * widthVal.value;
  const jointPerimeterPerTile = (lengthVal.value + widthVal.value); // Each tile contributes half perimeter to joints

  // Joint volume per tile (cubic inches)
  const jointVolumePerTileCuIn = jointPerimeterPerTile * jointVal.value * tileThicknessInches;

  // Tiles per square foot
  const tilesPerSqFt = 144 / tileSqInches;

  // Total joint volume (cubic feet)
  // 1728 cubic inches per cubic foot
  const totalJointVolumeCuFt = (jointVolumePerTileCuIn * tilesPerSqFt * areaVal.value) / 1728;

  // Get grout density
  const density = GROUT_DENSITY[groutType]?.lbsPerCuFt || GROUT_DENSITY.cement.lbsPerCuFt;
  
  // Calculate weight
  let groutLbs = totalJointVolumeCuFt * density;

  // Mosaic multiplier (more joints = more grout)
  if (isMosaic) {
    groutLbs *= 1.5;
    assumptions.push('Mosaic tile: +50% for additional joint area');
  }

  // Add waste factor
  const wasteFactor = 1 + (wasteVal.value / 100);
  groutLbs *= wasteFactor;
  const finalVolumeCuFt = totalJointVolumeCuFt * wasteFactor * (isMosaic ? 1.5 : 1);

  // Determine recommended grout type
  let recommendedType = 'sanded';
  if (jointVal.value < 0.125) {
    recommendedType = 'unsanded';
  }

  // Document assumptions
  assumptions.push(`Tile: ${lengthVal.value}"×${widthVal.value}", ${thicknessVal.value}mm thick`);
  assumptions.push(`Joint width: ${jointVal.value}" (${jointVal.value < 0.125 ? 'unsanded' : 'sanded'} grout)`);
  assumptions.push(`Grout type: ${groutType} (${density} lbs/cu ft density)`);
  assumptions.push(`Waste factor: ${wasteVal.value}%`);
  
  sources.push(GROUT_FORMULA_INFO.sources[0].note);
  sources.push('TCNA grout type guidelines');

  return {
    valid: true,
    errors: [],
    quantityLbs: roundUp(groutLbs),
    volumeCuFt: Math.round(finalVolumeCuFt * 100) / 100, // 2 decimals
    recommendedType,
    assumptions,
    sources
  };
}

/**
 * Get recommended grout type based on joint width
 * @param {number} jointWidthInches
 * @returns {{ type: string, note: string }}
 */
export function getRecommendedGroutType(jointWidthInches) {
  if (jointWidthInches < 0.125) {
    return {
      type: 'unsanded',
      note: GROUT_TYPE_BY_JOINT.unsanded.note
    };
  }
  return {
    type: 'sanded',
    note: GROUT_TYPE_BY_JOINT.sanded.note
  };
}

/**
 * Common joint width presets
 */
export const JOINT_PRESETS = [
  { id: '1/16', name: '1/16"', sizeInches: 0.0625 },
  { id: '1/8', name: '1/8"', sizeInches: 0.125 },
  { id: '3/16', name: '3/16"', sizeInches: 0.1875 },
  { id: '1/4', name: '1/4"', sizeInches: 0.25 },
  { id: '3/8', name: '3/8"', sizeInches: 0.375 }
];
