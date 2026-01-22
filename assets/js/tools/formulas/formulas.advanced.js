/**
 * Tillerstead Formula Library - Advanced/Adjacency Calculations
 *
 * Covers structural, environmental, electrical, and consumable estimators that
 * support tile installations. Values align to TCNA EJ171, ANSI A108/A118, IPC,
 * and typical manufacturer TDS where noted.
 *
 * @module formulas.advanced
 */

import { inchesToFeet, validatePositiveNumber, validateNonNegativeNumber, validatePercentage } from './units.js';
import { roundUp, roundToDecimals, formatNumber } from './rounding.js';

// ============================================
// CONSTANTS & LOOKUPS
// ============================================

export const MOVEMENT_JOINT_INFO = {
  name: 'Movement Joint Spacing (TCNA EJ171)',
  version: '1.0.0',
  sources: [
    {
      name: 'TCNA EJ171',
      note: 'Interior: 20–25 ft; Exterior/Sun/Heated: 8–12 ft; Reduce spacing with temperature swing'
    }
  ],
  assumptions: [
    'Rectangular field divided on regular grid',
    'Spacing reduced for high ΔT or sun-exposed areas',
    'Perimeter, columns, and changes of plane still require soft joints'
  ]
};

const MOVEMENT_JOINT_SPACING = {
  interior: {
    standard: 24, // ft
    highTemp: 20
  },
  exterior: {
    standard: 12, // ft
    highTemp: 8
  }
};

export const DEFLECTION_INFO = {
  name: 'Deflection Check (Span/Joist)',
  version: '1.0.0',
  sources: [
    { name: 'TCNA / ANSI A108', note: 'L/360 ceramic, L/720 stone minimum' },
    { name: 'Beam formula', note: 'Δ = 5wL^4 / (384EI) for simple span, uniform load' }
  ],
  assumptions: [
    'Simply supported joists',
    'Uniform load = live + dead (default 40 + 10 psf)',
    'Modulus of elasticity defaults to SPF ~1.6e6 psi'
  ]
};

export const HEATED_FLOOR_INFO = {
  name: 'Heated Floor Electrical Load',
  version: '1.0.0',
  sources: [
    { name: 'NFPA 70 (NEC)', note: 'Branch circuit sizing based on continuous load @125%' },
    { name: 'Typical radiant mats', note: '12 W/sf nominal at 120/240 VAC' }
  ],
  assumptions: [
    'Watts per square foot provided by heating mat/cable specification',
    'Thermostat relay rating typically 15 A; above this requires external relay/contactor'
  ]
};

export const MOISTURE_LIMITS_INFO = {
  name: 'Moisture Emission / RH Check',
  version: '1.0.0',
  sources: [
    { name: 'ASTM F1869', note: 'MVER lbs/1000 sf/24h' },
    { name: 'ASTM F2170', note: 'In-situ RH %' }
  ],
  assumptions: [
    'Thresholds are product-specific; defaults are conservative for many SLUs/adhesives',
    'Use lower of MVER or RH limits to gate installation'
  ]
};

export const THINSET_MIX_INFO = {
  name: 'Thinset Mixing Ratios',
  version: '1.0.0',
  sources: [
    {
      name: 'Custom Building Products VersaBond LFT TDS',
      note: '5–6 quarts water per 50 lb bag; pot life ~2–4 hours depending on conditions'
    }
  ],
  assumptions: [
    'Linear scaling of water for partial batches',
    'Pot life set to conservative 2 hours unless overridden',
    'Yield is approximation; verify with specific TDS'
  ]
};

export const SEALER_COVERAGE = {
  polished: { min: 800, max: 1000, note: 'Polished porcelain / dense stone' },
  semi_porcelain: { min: 400, max: 600, note: 'Semi-porous porcelain/ceramic' },
  natural_stone: { min: 200, max: 400, note: 'Honed/rough natural stone' },
  concrete: { min: 150, max: 250, note: 'Broom finish or open concrete' }
};

export const SEALER_INFO = {
  name: 'Sealer Coverage Estimator',
  version: '1.0.0',
  sources: [
    { name: 'Manufacturer TDS (typical)', note: 'Coverage varies by porosity and product' }
  ],
  assumptions: [
    'Uses conservative (low-end) coverage to avoid shortages',
    'Coats parameter multiplies total required volume'
  ]
};

export const DECK_MUD_INFO = {
  name: 'Shower Pan / Curb Volume',
  version: '1.0.0',
  sources: [
    { name: 'TCNA B415/B421', note: 'Minimum 1-1/4" deck mud at drain, 1/4" per foot slope' }
  ],
  assumptions: [
    'Average thickness = (min + max) / 2',
    'Bag yield defaults to 0.5 cu ft per 50 lb deck mud bag'
  ]
};

export const PRIMER_INFO = {
  name: 'Primer / SLU Coverage',
  version: '1.0.0',
  sources: [
    { name: 'SLU Primers (typical)', note: 'Porous 200–300 sf/gal; non-porous 300–400 sf/gal' }
  ],
  assumptions: [
    'Double-prime multiplies primer quantity by 2',
    'Coverage uses conservative (low-end) values'
  ]
};

export const SEALANT_INFO = {
  name: 'Sealant / Caulk Bead Estimator',
  version: '1.0.0',
  sources: [
    { name: 'ASTM C920 practice', note: 'Bead volume = area × length; 10.1 oz tube ≈ 18.3 in³' }
  ],
  assumptions: [
    'Round bead cross-section',
    'Uses low-end tube volume for conservative count'
  ]
};

export const LABOR_SENSITIVITY_INFO = {
  name: 'Labor Rate Sensitivity',
  version: '1.0.0',
  sources: [
    { name: 'TCNA Handbook Note', note: 'Productivity varies by layout, substrate, tile type' }
  ],
  assumptions: [
    'Base productivity specified by user or defaults to standard floor work',
    'Multipliers compound for complexity, pattern, and substrate prep'
  ]
};

export const BATH_LAYOUT_INFO = {
  name: 'Bath Layout & Clearances',
  version: '1.0.0',
  sources: [
    { name: 'IPC/IRC typical minimums', note: 'Toilet 15" side clearance, 21–24" front; 30–36" circulation' },
    { name: 'ICC A117.1 guidance', note: '36" clear path recommended for accessibility' }
  ],
  assumptions: [
    'Fixtures arranged primarily along the longer wall',
    'Door located on layout wall; width deducted from usable wall length',
    'Clear path measured from deepest fixture to opposite wall'
  ]
};

// ============================================
// MOVEMENT JOINT CALCULATION
// ============================================

/**
 * Calculate movement joint spacing and count based on TCNA EJ171 guidance.
 *
 * @param {Object} params
 * @param {number} params.lengthFt - Long dimension (ft)
 * @param {number} params.widthFt - Short dimension (ft)
 * @param {'interior'|'exterior'} [params.exposure='interior']
 * @param {number} [params.tempSwingF=30] - Anticipated temperature swing (°F)
 * @param {boolean} [params.isSunExposed=false] - Sun/dark or heated slabs
 * @returns {{ valid: boolean, errors: string[], spacingFt: number, jointsLong: number, jointsShort: number, totalJoints: number, assumptions: string[] }}
 */
export function calculateMovementJoints({
  lengthFt,
  widthFt,
  exposure = 'interior',
  tempSwingF = 30,
  isSunExposed = false
}) {
  const errors = [];
  const assumptions = [];

  const lengthVal = validatePositiveNumber(lengthFt, 'Length');
  const widthVal = validatePositiveNumber(widthFt, 'Width');
  const tempVal = validateNonNegativeNumber(tempSwingF, 'Temperature swing');

  if (!lengthVal.valid) errors.push(lengthVal.error);
  if (!widthVal.valid) errors.push(widthVal.error);
  if (!tempVal.valid) errors.push(tempVal.error);

  if (errors.length > 0) {
    return { valid: false, errors, spacingFt: 0, jointsLong: 0, jointsShort: 0, totalJoints: 0, assumptions };
  }

  const isExterior = exposure === 'exterior' || isSunExposed;
  const spacing =
    tempVal.value >= 40
      ? (isExterior ? MOVEMENT_JOINT_SPACING.exterior.highTemp : MOVEMENT_JOINT_SPACING.interior.highTemp)
      : (isExterior ? MOVEMENT_JOINT_SPACING.exterior.standard : MOVEMENT_JOINT_SPACING.interior.standard);

  const jointsLong = Math.max(0, roundUp(lengthVal.value / spacing) - 1);
  const jointsShort = Math.max(0, roundUp(widthVal.value / spacing) - 1);
  const totalJoints = jointsLong + jointsShort;

  assumptions.push(`Exposure: ${isExterior ? 'Exterior/Sun/Heated' : 'Interior (conditioned)'}`);
  assumptions.push(`Temperature swing: ${tempVal.value}°F`);
  assumptions.push(`Spacing target per EJ171: ${spacing} ft grid`);

  return { valid: true, errors: [], spacingFt: spacing, jointsLong, jointsShort, totalJoints, assumptions };
}

// ============================================
// DEFLECTION CHECK (SPAN/JOIST)
// ============================================

/**
 * Estimate deflection ratio using simple-span uniform load model.
 *
 * @param {Object} params
 * @param {number} params.spanFeet - Joist span in feet
 * @param {number} params.joistSpacingInches - Joist spacing (typically 16")
 * @param {number} params.joistWidthInches - Joist width (e.g., 1.5")
 * @param {number} params.joistDepthInches - Joist depth (e.g., 9.25" for 2x10)
 * @param {number} [params.modulusPsi=1600000] - Modulus of elasticity (psi)
 * @param {number} [params.liveLoadPsft=40]
 * @param {number} [params.deadLoadPsft=10]
 * @returns {{ valid: boolean, errors: string[], deflectionRatio: number, passesCeramic: boolean, passesStone: boolean, deltaInches: number, assumptions: string[] }}
 */
export function calculateDeflection({
  spanFeet,
  joistSpacingInches,
  joistWidthInches,
  joistDepthInches,
  modulusPsi = 1600000,
  liveLoadPsft = 40,
  deadLoadPsft = 10
}) {
  const errors = [];
  const assumptions = [];

  const spanVal = validatePositiveNumber(spanFeet, 'Span');
  const spacingVal = validatePositiveNumber(joistSpacingInches, 'Joist spacing');
  const widthVal = validatePositiveNumber(joistWidthInches, 'Joist width');
  const depthVal = validatePositiveNumber(joistDepthInches, 'Joist depth');
  const modulusVal = validatePositiveNumber(modulusPsi, 'Modulus');

  if (!spanVal.valid) errors.push(spanVal.error);
  if (!spacingVal.valid) errors.push(spacingVal.error);
  if (!widthVal.valid) errors.push(widthVal.error);
  if (!depthVal.valid) errors.push(depthVal.error);
  if (!modulusVal.valid) errors.push(modulusVal.error);

  if (errors.length > 0) {
    return { valid: false, errors, deflectionRatio: 0, passesCeramic: false, passesStone: false, deltaInches: 0, assumptions };
  }

  const L = spanVal.value * 12; // inches
  const I = (widthVal.value * Math.pow(depthVal.value, 3)) / 12; // in^4
  const uniformLoadPsf = liveLoadPsft + deadLoadPsft;
  const wPlf = uniformLoadPsf * (spacingVal.value / 12); // pounds per linear foot
  const wPerInch = wPlf / 12; // pounds per inch

  const delta = (5 * wPerInch * Math.pow(L, 4)) / (384 * modulusVal.value * I);
  const deflectionRatio = L / delta;

  assumptions.push(`Load: ${uniformLoadPsf} psf (live + dead)`);
  assumptions.push(`Modulus: ${formatNumber(modulusVal.value)} psi`);
  assumptions.push(`Section I: ${formatNumber(roundToDecimals(I, 2))} in^4`);

  return {
    valid: true,
    errors: [],
    deflectionRatio,
    passesCeramic: deflectionRatio >= 360,
    passesStone: deflectionRatio >= 720,
    deltaInches: roundToDecimals(delta, 3),
    assumptions
  };
}

// ============================================
// HEATED FLOOR ELECTRICAL LOAD
// ============================================

/**
 * Calculate heated floor electrical load and breaker/relay needs.
 *
 * @param {Object} params
 * @param {number} params.areaSqFt
 * @param {number} [params.wattsPerSqFt=12]
 * @param {number} [params.voltage=120]
 * @param {number} [params.thermostatMaxAmps=15]
 * @returns {{ valid: boolean, errors: string[], totalWatts: number, amps: number, breakerAmps: number, circuits: number, needsRelay: boolean, assumptions: string[] }}
 */
export function calculateHeatedFloorLoad({
  areaSqFt,
  wattsPerSqFt = 12,
  voltage = 120,
  thermostatMaxAmps = 15
}) {
  const errors = [];
  const assumptions = [];

  const areaVal = validatePositiveNumber(areaSqFt, 'Area');
  const wattVal = validatePositiveNumber(wattsPerSqFt, 'Watts per sq ft');
  const voltVal = validatePositiveNumber(voltage, 'Voltage');

  if (!areaVal.valid) errors.push(areaVal.error);
  if (!wattVal.valid) errors.push(wattVal.error);
  if (!voltVal.valid) errors.push(voltVal.error);

  if (errors.length > 0) {
    return { valid: false, errors, totalWatts: 0, amps: 0, breakerAmps: 0, circuits: 0, needsRelay: false, assumptions };
  }

  const totalWatts = areaVal.value * wattVal.value;
  const amps = totalWatts / voltVal.value;

  // NEC continuous load sizing @125%
  const breakerAmpRaw = amps * 1.25;
  const breakerAmps = breakerAmpRaw <= 15 ? 15 : breakerAmpRaw <= 20 ? 20 : 30;
  const circuits = Math.max(1, roundUp(breakerAmpRaw / breakerAmps));
  const needsRelay = amps > thermostatMaxAmps;

  assumptions.push(`Continuous load factor 125% applied per NEC`);
  assumptions.push(`Thermostat relay limit ${thermostatMaxAmps} A`);

  return {
    valid: true,
    errors: [],
    totalWatts: roundToDecimals(totalWatts, 1),
    amps: roundToDecimals(amps, 2),
    breakerAmps,
    circuits,
    needsRelay,
    assumptions
  };
}

// ============================================
// MOISTURE EMISSION / RH CHECK
// ============================================

/**
 * Evaluate MVER/RH readings against product limits.
 *
 * @param {Object} params
 * @param {number} params.mverLbs - lbs/1000 sf/24h (ASTM F1869)
 * @param {number} params.rhPercent - in-situ RH % (ASTM F2170)
 * @param {number} [params.productLimitMver=5]
 * @param {number} [params.productLimitRh=75]
 * @returns {{ valid: boolean, errors: string[], mverPass: boolean, rhPass: boolean, requiresMitigation: boolean, assumptions: string[] }}
 */
export function evaluateMoistureReadings({
  mverLbs,
  rhPercent,
  productLimitMver = 5,
  productLimitRh = 75
}) {
  const errors = [];
  const assumptions = [];

  const mverVal = validateNonNegativeNumber(mverLbs, 'MVER');
  const rhVal = validateNonNegativeNumber(rhPercent, 'RH');

  if (!mverVal.valid) errors.push(mverVal.error);
  if (!rhVal.valid) errors.push(rhVal.error);

  if (errors.length > 0) {
    return { valid: false, errors, mverPass: false, rhPass: false, requiresMitigation: false, assumptions };
  }

  const mverPass = mverVal.value <= productLimitMver;
  const rhPass = rhVal.value <= productLimitRh;
  const requiresMitigation = !(mverPass && rhPass);

  assumptions.push(`Product limits: ${productLimitMver} lbs MVER, ${productLimitRh}% RH`);

  return { valid: true, errors: [], mverPass, rhPass, requiresMitigation, assumptions };
}

// ============================================
// THINSET MIXING / YIELD
// ============================================

/**
 * Calculate thinset mixing water and estimated yield for partial batches.
 *
 * @param {Object} params
 * @param {number} [params.bagWeightLbs=50]
 * @param {number} [params.waterQuartsPerBagMin=5]
 * @param {number} [params.waterQuartsPerBagMax=6]
 * @param {number} [params.batchWeightLbs] - If omitted, uses full bag
 * @param {number} [params.potLifeMinutes=120]
 * @param {number} [params.yieldCuFtPerBag=0.45]
 * @returns {{ valid: boolean, errors: string[], waterQuartsRange: [number, number], batchWeightLbs: number, potLifeMinutes: number, estimatedYieldCuFt: number, assumptions: string[] }}
 */
export function calculateThinsetMix({
  bagWeightLbs = 50,
  waterQuartsPerBagMin = 5,
  waterQuartsPerBagMax = 6,
  batchWeightLbs,
  potLifeMinutes = 120,
  yieldCuFtPerBag = 0.45
}) {
  const errors = [];
  const assumptions = [];

  const bagVal = validatePositiveNumber(bagWeightLbs, 'Bag weight');
  const waterMinVal = validatePositiveNumber(waterQuartsPerBagMin, 'Water (min)');
  const waterMaxVal = validatePositiveNumber(waterQuartsPerBagMax, 'Water (max)');
  const yieldVal = validatePositiveNumber(yieldCuFtPerBag, 'Yield');

  if (!bagVal.valid) errors.push(bagVal.error);
  if (!waterMinVal.valid) errors.push(waterMinVal.error);
  if (!waterMaxVal.valid) errors.push(waterMaxVal.error);
  if (!yieldVal.valid) errors.push(yieldVal.error);

  const batchVal = batchWeightLbs ? validatePositiveNumber(batchWeightLbs, 'Batch weight') : null;
  if (batchVal && !batchVal.valid) errors.push(batchVal.error);

  if (errors.length > 0) {
    return { valid: false, errors, waterQuartsRange: [0, 0], batchWeightLbs: 0, potLifeMinutes: 0, estimatedYieldCuFt: 0, assumptions };
  }

  const batchWeight = batchVal?.value || bagVal.value;
  const ratio = batchWeight / bagVal.value;
  const waterQuartsRange = [
    roundToDecimals(waterMinVal.value * ratio, 2),
    roundToDecimals(waterMaxVal.value * ratio, 2)
  ];

  assumptions.push('Linear water scaling used for partial batches');
  assumptions.push('Yield is approximate; verify with product TDS');

  return {
    valid: true,
    errors: [],
    waterQuartsRange,
    batchWeightLbs: batchWeight,
    potLifeMinutes,
    estimatedYieldCuFt: roundToDecimals(yieldVal.value * ratio, 2),
    assumptions
  };
}

// ============================================
// SEALER COVERAGE
// ============================================

/**
 * Estimate sealer gallons needed by surface type.
 *
 * @param {Object} params
 * @param {number} params.areaSqFt
 * @param {'polished'|'semi_porcelain'|'natural_stone'|'concrete'} [params.surface='natural_stone']
 * @param {number} [params.coats=2]
 * @returns {{ valid: boolean, errors: string[], gallons: number, coverageUsedSqFtPerGal: number, assumptions: string[] }}
 */
export function estimateSealer({
  areaSqFt,
  surface = 'natural_stone',
  coats = 2
}) {
  const errors = [];
  const assumptions = [];

  const areaVal = validatePositiveNumber(areaSqFt, 'Area');
  const coatsVal = validatePositiveNumber(coats, 'Coats');

  if (!areaVal.valid) errors.push(areaVal.error);
  if (!coatsVal.valid) errors.push(coatsVal.error);

  const coverage = SEALER_COVERAGE[surface];
  if (!coverage) errors.push(`Unknown surface: ${surface}`);

  if (errors.length > 0) {
    return { valid: false, errors, gallons: 0, coverageUsedSqFtPerGal: 0, assumptions };
  }

  const coverageSqFtPerGal = coverage.min; // conservative
  const gallons = roundUp((areaVal.value * coatsVal.value) / coverageSqFtPerGal);

  assumptions.push(`Surface: ${surface} (${coverage.note})`);
  assumptions.push(`Coverage (conservative): ${coverageSqFtPerGal} sq ft/gal`);
  assumptions.push(`Coats: ${coatsVal.value}`);

  return { valid: true, errors: [], gallons, coverageUsedSqFtPerGal: coverageSqFtPerGal, assumptions };
}

// ============================================
// DECK MUD / SHOWER PAN VOLUME
// ============================================

/**
 * Compute deck mud quantity based on plan area and slope.
 *
 * @param {Object} params
 * @param {number} params.areaSqFt
 * @param {number} params.runFeet - Longest run to drain (ft) for slope calc
 * @param {number} [params.minThicknessInches=1.25]
 * @param {number} [params.slopeInchesPerFoot=0.25]
 * @param {number} [params.bagYieldCuFt=0.5]
 * @returns {{ valid: boolean, errors: string[], volumeCuFt: number, bags: number, maxThicknessInches: number, assumptions: string[] }}
 */
export function calculateDeckMud({
  areaSqFt,
  runFeet,
  minThicknessInches = 1.25,
  slopeInchesPerFoot = 0.25,
  bagYieldCuFt = 0.5
}) {
  const errors = [];
  const assumptions = [];

  const areaVal = validatePositiveNumber(areaSqFt, 'Area');
  const runVal = validatePositiveNumber(runFeet, 'Run to drain');
  const minVal = validatePositiveNumber(minThicknessInches, 'Minimum thickness');
  const slopeVal = validatePositiveNumber(slopeInchesPerFoot, 'Slope');
  const yieldVal = validatePositiveNumber(bagYieldCuFt, 'Bag yield');

  if (!areaVal.valid) errors.push(areaVal.error);
  if (!runVal.valid) errors.push(runVal.error);
  if (!minVal.valid) errors.push(minVal.error);
  if (!slopeVal.valid) errors.push(slopeVal.error);
  if (!yieldVal.valid) errors.push(yieldVal.error);

  if (errors.length > 0) {
    return { valid: false, errors, volumeCuFt: 0, bags: 0, maxThicknessInches: 0, assumptions };
  }

  const maxThicknessInches = minVal.value + slopeVal.value * runVal.value;
  const avgThicknessInches = (minVal.value + maxThicknessInches) / 2;
  const volumeCuFt = areaVal.value * inchesToFeet(avgThicknessInches);
  const bags = roundUp(volumeCuFt / yieldVal.value);

  assumptions.push(`Slope: ${slopeVal.value}" per ft over ${runVal.value} ft`);
  assumptions.push(`Bag yield: ${yieldVal.value} cu ft`);

  return {
    valid: true,
    errors: [],
    volumeCuFt: roundToDecimals(volumeCuFt, 2),
    bags,
    maxThicknessInches: roundToDecimals(maxThicknessInches, 2),
    assumptions
  };
}

// ============================================
// PRIMER / SLU CONSUMPTION
// ============================================

const PRIMER_COVERAGE = {
  porous: 200,
  nonporous: 300
};

/**
 * Estimate primer gallons needed based on porosity and coats.
 *
 * @param {Object} params
 * @param {number} params.areaSqFt
 * @param {'porous'|'nonporous'} [params.porosity='porous']
 * @param {boolean} [params.doublePrime=false]
 * @returns {{ valid: boolean, errors: string[], gallons: number, coverageSqFtPerGal: number, assumptions: string[] }}
 */
export function estimatePrimer({
  areaSqFt,
  porosity = 'porous',
  doublePrime = false
}) {
  const errors = [];
  const assumptions = [];

  const areaVal = validatePositiveNumber(areaSqFt, 'Area');
  if (!areaVal.valid) errors.push(areaVal.error);

  const coverage = PRIMER_COVERAGE[porosity];
  if (!coverage) errors.push(`Unknown porosity: ${porosity}`);

  if (errors.length > 0) {
    return { valid: false, errors, gallons: 0, coverageSqFtPerGal: 0, assumptions };
  }

  const coats = doublePrime ? 2 : 1;
  const gallons = roundUp((areaVal.value * coats) / coverage);

  assumptions.push(`Porosity: ${porosity}`);
  assumptions.push(`Coverage (conservative): ${coverage} sq ft/gal`);
  assumptions.push(`Coats: ${coats}`);

  return { valid: true, errors: [], gallons, coverageSqFtPerGal: coverage, assumptions };
}

// ============================================
// SEALANT / CAULK BEAD ESTIMATOR
// ============================================

/**
 * Estimate sealant tubes based on bead size and length.
 *
 * @param {Object} params
 * @param {number} params.linearFeet
 * @param {number} [params.beadDiameterInches=0.25]
 * @param {number} [params.tubeVolumeOz=10.1]
 * @returns {{ valid: boolean, errors: string[], tubes: number, volumePerTubeIn3: number, assumptions: string[] }}
 */
export function estimateSealantTubes({
  linearFeet,
  beadDiameterInches = 0.25,
  tubeVolumeOz = 10.1
}) {
  const errors = [];
  const assumptions = [];

  const lengthVal = validatePositiveNumber(linearFeet, 'Length');
  const beadVal = validatePositiveNumber(beadDiameterInches, 'Bead diameter');
  const tubeVal = validatePositiveNumber(tubeVolumeOz, 'Tube volume');

  if (!lengthVal.valid) errors.push(lengthVal.error);
  if (!beadVal.valid) errors.push(beadVal.error);
  if (!tubeVal.valid) errors.push(tubeVal.error);

  if (errors.length > 0) {
    return { valid: false, errors, tubes: 0, volumePerTubeIn3: 0, assumptions };
  }

  const radius = beadVal.value / 2;
  const beadAreaIn2 = Math.PI * Math.pow(radius, 2);
  const lengthInches = lengthVal.value * 12;
  const totalVolumeIn3 = beadAreaIn2 * lengthInches;
  const volumePerTubeIn3 = tubeVal.value * 1.80469; // cubic inches per fluid ounce
  const tubes = roundUp(totalVolumeIn3 / volumePerTubeIn3);

  assumptions.push(`Bead: ${beadVal.value}" diameter`);
  assumptions.push(`Tube volume: ${tubeVal.value} oz (≈${roundToDecimals(volumePerTubeIn3, 1)} in³)`);

  return { valid: true, errors: [], tubes, volumePerTubeIn3: roundToDecimals(volumePerTubeIn3, 2), assumptions };
}

// ============================================
// LABOR RATE SENSITIVITY
// ============================================

const COMPLEXITY_MULTIPLIERS = {
  standard: 1,
  medium: 1.15,
  high: 1.3
};

const PATTERN_MULTIPLIERS = {
  straight: 1,
  diagonal: 1.15,
  herringbone: 1.3
};

const SURFACE_MULTIPLIERS = {
  floor: 1,
  wall: 1.2,
  ceiling: 1.4
};

/**
 * Estimate labor hours with sensitivity to complexity and pattern.
 *
 * @param {Object} params
 * @param {number} params.areaSqFt
 * @param {number} [params.baseProductivitySqFtPerHour=25]
 * @param {'standard'|'medium'|'high'} [params.complexity='standard']
 * @param {'straight'|'diagonal'|'herringbone'} [params.pattern='straight']
 * @param {'floor'|'wall'|'ceiling'} [params.surface='floor']
 * @param {number} [params.crewSize=1]
 * @returns {{ valid: boolean, errors: string[], hours: number, crewDays: number, effectiveProductivitySqFtPerHour: number, assumptions: string[] }}
 */
export function estimateLaborSensitivity({
  areaSqFt,
  baseProductivitySqFtPerHour = 25,
  complexity = 'standard',
  pattern = 'straight',
  surface = 'floor',
  crewSize = 1
}) {
  const errors = [];
  const assumptions = [];

  const areaVal = validatePositiveNumber(areaSqFt, 'Area');
  const baseVal = validatePositiveNumber(baseProductivitySqFtPerHour, 'Base productivity');
  const crewVal = validatePositiveNumber(crewSize, 'Crew size');

  if (!areaVal.valid) errors.push(areaVal.error);
  if (!baseVal.valid) errors.push(baseVal.error);
  if (!crewVal.valid) errors.push(crewVal.error);

  const complexityMultiplier = COMPLEXITY_MULTIPLIERS[complexity];
  const patternMultiplier = PATTERN_MULTIPLIERS[pattern];
  const surfaceMultiplier = SURFACE_MULTIPLIERS[surface];

  if (!complexityMultiplier) errors.push(`Unknown complexity: ${complexity}`);
  if (!patternMultiplier) errors.push(`Unknown pattern: ${pattern}`);
  if (!surfaceMultiplier) errors.push(`Unknown surface: ${surface}`);

  if (errors.length > 0) {
    return { valid: false, errors, hours: 0, crewDays: 0, effectiveProductivitySqFtPerHour: 0, assumptions };
  }

  const totalMultiplier = complexityMultiplier * patternMultiplier * surfaceMultiplier;
  const effectiveProductivity = baseVal.value / totalMultiplier;
  const hours = areaVal.value / effectiveProductivity;
  const crewDays = hours / (crewVal.value * 8); // 8-hour day

  assumptions.push(`Base productivity: ${baseVal.value} sf/hr`);
  assumptions.push(`Multipliers -> complexity ${complexityMultiplier}, pattern ${patternMultiplier}, surface ${surfaceMultiplier}`);
  assumptions.push(`Crew size: ${crewVal.value}`);

  return {
    valid: true,
    errors: [],
    hours: roundToDecimals(hours, 2),
    crewDays: roundToDecimals(crewDays, 2),
    effectiveProductivitySqFtPerHour: roundToDecimals(effectiveProductivity, 2),
    assumptions
  };
}

// ============================================
// BATH LAYOUT / CLEARANCES
// ============================================

/**
 * Plan bathroom layout clearances for tub, shower, toilet, and vanity.
 *
 * @param {Object} params
 * @param {number} params.roomLengthFt
 * @param {number} params.roomWidthFt
 * @param {number} [params.doorWidthIn=32]
 * @param {number} [params.walkwayMinIn=30]
 * @param {boolean} [params.includeTub=true]
 * @param {number} [params.tubLengthIn=60]
 * @param {number} [params.tubWidthIn=30]
 * @param {number} [params.tubFrontClearIn=30]
 * @param {boolean} [params.includeShower=true]
 * @param {number} [params.showerWidthIn=36]
 * @param {number} [params.showerDepthIn=36]
 * @param {number} [params.showerFrontClearIn=30]
 * @param {boolean} [params.includeToilet=true]
 * @param {number} [params.toiletSideClearIn=15]
 * @param {number} [params.toiletDepthIn=28]
 * @param {number} [params.toiletFrontClearIn=24]
 * @param {boolean} [params.includeVanity=true]
 * @param {number} [params.vanityWidthIn=48]
 * @param {number} [params.vanityDepthIn=22]
 * @param {number} [params.vanityFrontClearIn=30]
 * @returns {{ valid: boolean, errors: string[], availableWallIn: number, requiredWallIn: number, fitsLinear: string, walkwayWidthIn: number, walkwayPass: string, maxDepthClearIn: number, assumptions: string[], warnings?: string[], notes?: string[] }}
 */
export function calculateBathLayout(params) {
  const errors = [];
  const warnings = [];
  const notes = [];
  const assumptions = [];

  const {
    roomLengthFt,
    roomWidthFt,
    doorWidthIn = 32,
    doorWall = 'primary',
    walkwayMinIn = 30,
    includeTub = true,
    tubLengthIn = 60,
    tubWidthIn = 30,
    tubFrontClearIn = 30,
    includeShower = false,
    showerWidthIn = 36,
    showerDepthIn = 36,
    showerFrontClearIn = 30,
    includeToilet = true,
    toiletSideClearIn = 15,
    toiletDepthIn = 28,
    toiletFrontClearIn = 24,
    includeVanity = true,
    vanityWidthIn = 48,
    vanityDepthIn = 22,
    vanityFrontClearIn = 30
  } = params;

  const roomLengthVal = validatePositiveNumber(roomLengthFt, 'Room length');
  const roomWidthVal = validatePositiveNumber(roomWidthFt, 'Room width');
  const doorWidthVal = validatePositiveNumber(doorWidthIn, 'Door width');
  const walkwayVal = validatePositiveNumber(walkwayMinIn, 'Walkway minimum');

  [roomLengthVal, roomWidthVal, doorWidthVal, walkwayVal].forEach(v => {
    if (!v.valid) errors.push(v.error);
  });

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      availableWallIn: 0,
      requiredWallIn: 0,
      fitsLinear: 'No',
      walkwayWidthIn: 0,
      walkwayPass: 'No',
      maxDepthClearIn: 0,
      assumptions,
      warnings,
      notes
    };
  }

  if (!includeTub && !includeShower && !includeToilet && !includeVanity) {
    return {
      valid: false,
      errors: ['Select at least one fixture to place'],
      availableWallIn: 0,
      requiredWallIn: 0,
      fitsLinear: 'No',
      walkwayWidthIn: 0,
      walkwayPass: 'No',
      maxDepthClearIn: 0,
      assumptions,
      warnings,
      notes
    };
  }

  const fixtures = [];

  if (includeTub) {
    fixtures.push({
      type: 'tub',
      width: tubLengthIn,
      depth: tubWidthIn + tubFrontClearIn
    });
    if (tubWidthIn < 30) warnings.push('Tub width under 30" may feel tight.');
    notes.push(`Tub front clearance: ${tubFrontClearIn}"`);
  }

  if (includeShower) {
    fixtures.push({
      type: 'shower',
      width: showerWidthIn,
      depth: showerDepthIn + showerFrontClearIn
    });
    if (showerWidthIn < 30 || showerDepthIn < 30) warnings.push('Shower minimum is 30" x 30" per IPC; aim for 36" x 36".');
    notes.push(`Shower front clearance: ${showerFrontClearIn}"`);
  }

  if (includeToilet) {
    const toiletZoneWidth = Math.max(30, toiletSideClearIn * 2);
    fixtures.push({
      type: 'toilet',
      width: toiletZoneWidth,
      depth: toiletDepthIn + toiletFrontClearIn
    });
    if (toiletSideClearIn < 15) warnings.push('Toilet side clearance below 15" violates IPC/IRC.');
    if (toiletFrontClearIn < 21) warnings.push('Toilet front clearance below 21" may violate code; 24"+ recommended.');
    notes.push(`Toilet zone width uses ${toiletSideClearIn}" side clearances (30" min). Front clearance: ${toiletFrontClearIn}"`);
  }

  if (includeVanity) {
    fixtures.push({
      type: 'vanity',
      width: vanityWidthIn,
      depth: vanityDepthIn + vanityFrontClearIn
    });
    notes.push(`Vanity front clearance: ${vanityFrontClearIn}"`);
  }

  const requiredWallInRaw = fixtures.reduce((sum, f) => sum + f.width, 0);
  const maxDepthClearInRaw = fixtures.reduce((max, f) => Math.max(max, f.depth), 0);

  const primaryWall = roomLengthVal.value >= roomWidthVal.value ? 'length' : 'width';
  const lengthWallIn = roomLengthVal.value * 12;
  const widthWallIn = roomWidthVal.value * 12;

  const resolveDoorDeductionIn = (fixtureWall) => {
    if (doorWall === 'none') return 0;
    if (doorWall === 'primary') return fixtureWall === primaryWall ? doorWidthVal.value : 0;
    if (doorWall === 'length') return fixtureWall === 'length' ? doorWidthVal.value : 0;
    if (doorWall === 'width') return fixtureWall === 'width' ? doorWidthVal.value : 0;
    return doorWidthVal.value; // fallback to legacy behavior
  };

  const evaluate = (fixtureWall) => {
    const wallIn = fixtureWall === 'length' ? lengthWallIn : widthWallIn;
    const crossWallIn = fixtureWall === 'length' ? widthWallIn : lengthWallIn;
    const doorDeductIn = resolveDoorDeductionIn(fixtureWall);
    const availableWallIn = Math.max(0, wallIn - doorDeductIn);
    const walkwayWidthIn = crossWallIn - maxDepthClearInRaw;
    const walkwayPassBool = walkwayWidthIn >= walkwayVal.value;
    const fitsLinearBool = requiredWallInRaw <= availableWallIn;

    return {
      fixtureWall,
      availableWallIn,
      requiredWallIn: requiredWallInRaw,
      maxDepthClearIn: maxDepthClearInRaw,
      walkwayWidthIn,
      walkwayPassBool,
      fitsLinearBool,
      doorDeductIn
    };
  };

  const evalLength = evaluate('length');
  const evalWidth = evaluate('width');

  const score = (e) => {
    // Prefer passing both checks; then maximize clear path; then maximize spare wall.
    const passScore = (e.fitsLinearBool ? 2 : 0) + (e.walkwayPassBool ? 1 : 0);
    const walkwayOver = e.walkwayWidthIn - walkwayVal.value;
    const wallSpare = e.availableWallIn - e.requiredWallIn;
    return [passScore, walkwayOver, wallSpare];
  };

  const a = score(evalLength);
  const b = score(evalWidth);
  const selected =
    a[0] !== b[0] ? (a[0] > b[0] ? evalLength : evalWidth) :
    a[1] !== b[1] ? (a[1] > b[1] ? evalLength : evalWidth) :
    (a[2] >= b[2] ? evalLength : evalWidth);

  const alternate = selected.fixtureWall === 'length' ? evalWidth : evalLength;

  assumptions.push(`Layout wall tested: length + width (best chosen)`);
  assumptions.push(`Selected fixture wall: ${selected.fixtureWall}`);
  assumptions.push(`Door wall setting: ${doorWall}`);
  assumptions.push(`Door width deducted on selected wall: ${roundToDecimals(selected.doorDeductIn, 1)}"`);
  assumptions.push(`Walkway minimum target: ${walkwayVal.value}"`);

  notes.push(`Alternate (${alternate.fixtureWall}) — Available wall: ${roundToDecimals(alternate.availableWallIn, 1)}", Clear path: ${roundToDecimals(alternate.walkwayWidthIn, 1)}"`);

  if (!selected.fitsLinearBool) warnings.push('Fixtures exceed available wall length—consider switching walls or reducing widths.');
  if (!selected.walkwayPassBool) warnings.push(`Clear path under ${walkwayVal.value}" — increase room width or reduce front clearances.`);

  return {
    valid: true,
    errors: [],
    layoutWall: selected.fixtureWall,
    availableWallIn: roundToDecimals(selected.availableWallIn, 1),
    requiredWallIn: roundToDecimals(selected.requiredWallIn, 1),
    fitsLinear: selected.fitsLinearBool ? 'Yes' : 'No',
    walkwayWidthIn: roundToDecimals(selected.walkwayWidthIn, 1),
    walkwayPass: selected.walkwayPassBool ? 'Yes' : 'No',
    maxDepthClearIn: roundToDecimals(selected.maxDepthClearIn, 1),
    assumptions,
    warnings,
    notes
  };
}

// ============================================
// MODULE INFO
// ============================================

export const ADVANCED_FORMULA_INFO = {
  name: 'Advanced Installation Calculators',
  version: '1.0.0',
  description: 'Movement joints, deflection, heated floors, moisture, mixing, sealer, deck mud, primer, sealant, labor sensitivity, bath layout',
  modules: [
    'calculateMovementJoints',
    'calculateDeflection',
    'calculateHeatedFloorLoad',
    'evaluateMoistureReadings',
    'calculateThinsetMix',
    'estimateSealer',
    'calculateDeckMud',
    'estimatePrimer',
    'estimateSealantTubes',
    'estimateLaborSensitivity',
    'calculateBathLayout'
  ]
};
