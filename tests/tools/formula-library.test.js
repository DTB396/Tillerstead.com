/**
 * Tillerstead Formula Library - Unit Tests
 * 
 * Tests verify mathematical correctness of formulas.
 * Uses Node.js assert module (no external test framework required).
 * 
 * Run with: npm run test:tools
 */

import assert from 'assert';

// ==
// UNIT CONVERSION TESTS
// ==

import {
  inchesToFeet,
  feetToInches,
  toDecimalFeet,
  mmToInches,
  sqInchesToSqFeet,
  cuInchesToCuFeet,
  validatePositiveNumber,
  validatePercentage,
  CONVERSIONS
} from '../../assets/js/tools/formulas/units.js';

function testUnitConversions() {
  console.log('Testing unit conversions...');

  // inchesToFeet
  assert.strictEqual(inchesToFeet(12), 1, '12 inches should equal 1 foot');
  assert.strictEqual(inchesToFeet(24), 2, '24 inches should equal 2 feet');
  assert.strictEqual(inchesToFeet(6), 0.5, '6 inches should equal 0.5 feet');

  // feetToInches
  assert.strictEqual(feetToInches(1), 12, '1 foot should equal 12 inches');
  assert.strictEqual(feetToInches(2.5), 30, '2.5 feet should equal 30 inches');

  // toDecimalFeet
  assert.strictEqual(toDecimalFeet(5, 0), 5, '5 feet 0 inches should equal 5');
  assert.strictEqual(toDecimalFeet(5, 6), 5.5, '5 feet 6 inches should equal 5.5');
  assert.strictEqual(toDecimalFeet(0, 3), 0.25, '0 feet 3 inches should equal 0.25');

  // mmToInches
  assert.strictEqual(mmToInches(25.4), 1, '25.4mm should equal 1 inch');
  assert.strictEqual(mmToInches(12.7), 0.5, '12.7mm should equal 0.5 inch');

  // sqInchesToSqFeet
  assert.strictEqual(sqInchesToSqFeet(144), 1, '144 sq in should equal 1 sq ft');
  assert.strictEqual(sqInchesToSqFeet(288), 2, '288 sq in should equal 2 sq ft');

  // cuInchesToCuFeet
  assert.strictEqual(cuInchesToCuFeet(1728), 1, '1728 cu in should equal 1 cu ft');

  console.log('  ✓ All unit conversion tests passed');
}

function testValidation() {
  console.log('Testing validation functions...');

  // validatePositiveNumber
  const valid1 = validatePositiveNumber(10, 'Test');
  assert.strictEqual(valid1.valid, true);
  assert.strictEqual(valid1.value, 10);

  const invalid1 = validatePositiveNumber(-5, 'Test');
  assert.strictEqual(invalid1.valid, false);

  const invalid2 = validatePositiveNumber('abc', 'Test');
  assert.strictEqual(invalid2.valid, false);

  // validatePercentage
  const validPct = validatePercentage(50, 'Test');
  assert.strictEqual(validPct.valid, true);

  const invalidPct1 = validatePercentage(-10, 'Test');
  assert.strictEqual(invalidPct1.valid, false);

  const invalidPct2 = validatePercentage(150, 'Test');
  assert.strictEqual(invalidPct2.valid, false);

  console.log('  ✓ All validation tests passed');
}

// ==
// ROUNDING TESTS
// ==

import {
  roundUp,
  roundToDecimals,
  toFractionString,
  formatNumber
} from '../../assets/js/tools/formulas/rounding.js';

function testRounding() {
  console.log('Testing rounding functions...');

  // roundUp
  assert.strictEqual(roundUp(5.1), 6, 'roundUp(5.1) should equal 6');
  assert.strictEqual(roundUp(5.9), 6, 'roundUp(5.9) should equal 6');
  assert.strictEqual(roundUp(5.0), 5, 'roundUp(5.0) should equal 5');

  // roundToDecimals
  assert.strictEqual(roundToDecimals(5.1234, 2), 5.12, 'roundToDecimals(5.1234, 2) should equal 5.12');
  assert.strictEqual(roundToDecimals(5.1254, 2), 5.13, 'roundToDecimals(5.1254, 2) should equal 5.13');

  // toFractionString
  assert.strictEqual(toFractionString(0.25), '1/4', '0.25 should display as 1/4');
  assert.strictEqual(toFractionString(0.5), '1/2', '0.5 should display as 1/2');
  assert.strictEqual(toFractionString(1.5), '1 1/2', '1.5 should display as 1 1/2');
  assert.strictEqual(toFractionString(3.75), '3 3/4', '3.75 should display as 3 3/4');

  console.log('  ✓ All rounding tests passed');
}

// ==
// TILE FORMULA TESTS
// ==

import {
  calculateTileArea,
  calculateTileQuantity,
  calculateBoxesNeeded,
  isLargeFormat,
  isPlankFormat
} from '../../assets/js/tools/formulas/formulas.tile.js';
import {
  calculateMovementJoints,
  calculateDeflection,
  calculateHeatedFloorLoad,
  evaluateMoistureReadings,
  calculateThinsetMix,
  estimateSealer,
  calculateDeckMud,
  estimatePrimer,
  estimateSealantTubes,
  estimateLaborSensitivity,
  calculateBathLayout
} from '../../assets/js/tools/formulas/formulas.advanced.js';

function testTileFormulas() {
  console.log('Testing tile formulas...');

  // calculateTileArea
  // 12"x12" tile = 144 sq in = 1 sq ft
  assert.strictEqual(calculateTileArea(12, 12), 1, '12x12 tile should be 1 sq ft');
  // 6"x6" tile = 36 sq in = 0.25 sq ft
  assert.strictEqual(calculateTileArea(6, 6), 0.25, '6x6 tile should be 0.25 sq ft');
  // 12"x24" tile = 288 sq in = 2 sq ft
  assert.strictEqual(calculateTileArea(12, 24), 2, '12x24 tile should be 2 sq ft');

  // isLargeFormat
  assert.strictEqual(isLargeFormat(12, 12), false, '12x12 is not large format');
  assert.strictEqual(isLargeFormat(12, 24), true, '12x24 is large format (24 >= 15)');
  assert.strictEqual(isLargeFormat(24, 24), true, '24x24 is large format');

  // isPlankFormat
  assert.strictEqual(isPlankFormat(6, 24), true, '6x24 is plank (ratio 4:1)');
  assert.strictEqual(isPlankFormat(12, 12), false, '12x12 is not plank (ratio 1:1)');
  assert.strictEqual(isPlankFormat(8, 48), true, '8x48 is plank (ratio 6:1)');

  // calculateTileQuantity - Example case
  // 100 sq ft area, 12x12 tile (1 sq ft each), 10% waste
  const result1 = calculateTileQuantity({
    areaSqFt: 100,
    tileWidthInches: 12,
    tileHeightInches: 12,
    wastePercent: 10
  });
  assert.strictEqual(result1.valid, true, 'Should be valid calculation');
  assert.strictEqual(result1.tiles, 110, '100 sq ft + 10% waste = 110 tiles for 12x12');

  // 100 sq ft area, 6x6 tile (0.25 sq ft each), 10% waste
  const result2 = calculateTileQuantity({
    areaSqFt: 100,
    tileWidthInches: 6,
    tileHeightInches: 6,
    wastePercent: 10
  });
  assert.strictEqual(result2.valid, true);
  assert.strictEqual(result2.tiles, 440, '100 sq ft + 10% = 110 sq ft / 0.25 = 440 tiles for 6x6');

  // calculateBoxesNeeded
  const boxResult = calculateBoxesNeeded({
    tilesNeeded: 100,
    tilesPerBox: 10
  });
  assert.strictEqual(boxResult.valid, true);
  assert.strictEqual(boxResult.boxes, 10, '100 tiles / 10 per box = 10 boxes');

  // With attic stock
  const boxResultAttic = calculateBoxesNeeded({
    tilesNeeded: 100,
    tilesPerBox: 10,
    addAtticStock: true
  });
  assert.strictEqual(boxResultAttic.boxes, 11, '10 boxes + 1 attic stock = 11 boxes');

  // Invalid input handling
  const invalidResult = calculateTileQuantity({
    areaSqFt: -10,
    tileWidthInches: 12,
    tileHeightInches: 12,
    wastePercent: 10
  });
  assert.strictEqual(invalidResult.valid, false, 'Negative area should be invalid');

  console.log('  ✓ All tile formula tests passed');
}

// ==
// MORTAR FORMULA TESTS
// ==

import {
  calculateMortarBags,
  getRecommendedTrowel,
  TROWEL_COVERAGE
} from '../../assets/js/tools/formulas/formulas.mortar.js';

function testMortarFormulas() {
  console.log('Testing mortar formulas...');

  // Test trowel recommendation
  const rec1 = getRecommendedTrowel(1, 1); // 1x1 mosaic
  assert.strictEqual(rec1.trowelId, '3/16-v', 'Mosaic should get 3/16 V-notch');

  const rec2 = getRecommendedTrowel(12, 12); // 12x12 tile
  assert.strictEqual(rec2.trowelId, '1/4x3/8-sq', '12x12 tile should get 1/4x3/8 square');

  // UPDATED: Per CBP TDS, large format should use U-notch, NOT 1/2" square
  const rec3 = getRecommendedTrowel(24, 24); // Large format
  assert.strictEqual(rec3.trowelId, '3/4x9/16-u-30', '24x24 LFT should get U-notch per CBP TDS (NOT 1/2" square)');
  assert.strictEqual(rec3.backButter, true, 'Large format should recommend back-buttering');
  assert(rec3.warning, 'Large format should include warning about 1/2" square notch');

  // Test mortar calculation
  // 100 sq ft with 1/4x1/4 trowel (90-100 coverage)
  const mortar1 = calculateMortarBags({
    areaSqFt: 100,
    trowelId: '1/4-sq'
  });
  assert.strictEqual(mortar1.valid, true);
  assert.strictEqual(mortar1.bagsMin, 1, '100 sq ft / 100 coverage = 1 bag min');
  assert.strictEqual(mortar1.bagsMax, 2, '100 sq ft / 90 coverage = 1.11 -> 2 bags max');

  // 200 sq ft with 1/2x1/2 trowel (42-47 coverage)
  const mortar2 = calculateMortarBags({
    areaSqFt: 200,
    trowelId: '1/2-sq'
  });
  assert.strictEqual(mortar2.bagsMin, 5, '200 / 47 = 4.25 -> 5 bags min');
  assert.strictEqual(mortar2.bagsMax, 5, '200 / 42 = 4.76 -> 5 bags max');

  // With back-buttering (adds 20-30%)
  const mortar3 = calculateMortarBags({
    areaSqFt: 100,
    trowelId: '1/4-sq',
    backButter: true
  });
  assert.strictEqual(mortar3.bagsMin, 2, '1 * 1.2 = 1.2 -> 2 bags with back-butter');
  assert.strictEqual(mortar3.bagsMax, 3, '2 * 1.3 = 2.6 -> 3 bags with back-butter');

  // Test U-notch trowels for LFT (per CBP TDS)
  const mortar4 = calculateMortarBags({
    areaSqFt: 100,
    trowelId: '3/4x9/16-u-30'  // U-notch at 30° - 38-47 coverage
  });
  assert.strictEqual(mortar4.valid, true, 'U-notch trowel should be valid');
  assert.strictEqual(mortar4.bagsMin, 3, '100 / 47 = 2.13 -> 3 bags min');
  assert.strictEqual(mortar4.bagsMax, 3, '100 / 38 = 2.63 -> 3 bags max');

  // Verify U-notch at 45° (per CBP TDS - 34-42 coverage)
  const mortar5 = calculateMortarBags({
    areaSqFt: 100,
    trowelId: '3/4x9/16-u-45'
  });
  assert.strictEqual(mortar5.valid, true, 'U-notch 45° should be valid');
  assert.strictEqual(mortar5.bagsMin, 3, '100 / 42 = 2.38 -> 3 bags min');
  assert.strictEqual(mortar5.bagsMax, 3, '100 / 34 = 2.94 -> 3 bags max');

  console.log('  ✓ All mortar formula tests passed');
}

// ==
// GROUT FORMULA TESTS
// ==

import {
  calculateGrout,
  getRecommendedGroutType
} from '../../assets/js/tools/formulas/formulas.grout.js';

function testGroutFormulas() {
  console.log('Testing grout formulas...');

  // Test grout type recommendation
  const type1 = getRecommendedGroutType(0.0625); // 1/16"
  assert.strictEqual(type1.type, 'unsanded', '1/16" joint should use unsanded');

  const type2 = getRecommendedGroutType(0.125); // 1/8"
  assert.strictEqual(type2.type, 'sanded', '1/8" joint should use sanded');

  // Test grout calculation
  // This tests the formula logic, not a specific product coverage
  const grout1 = calculateGrout({
    areaSqFt: 100,
    tileLengthInches: 12,
    tileWidthInches: 12,
    tileThicknessMm: 8,
    jointWidthInches: 0.125,
    groutType: 'cement'
  });
  assert.strictEqual(grout1.valid, true, 'Should be valid calculation');
  assert.ok(grout1.quantityLbs > 0, 'Should calculate positive grout quantity');
  assert.ok(grout1.volumeCuFt > 0, 'Should calculate positive volume');
  assert.strictEqual(grout1.recommendedType, 'sanded', '1/8" joint should recommend sanded');

  // Mosaic should use more grout
  const grout2 = calculateGrout({
    areaSqFt: 100,
    tileLengthInches: 1,
    tileWidthInches: 1,
    tileThicknessMm: 6,
    jointWidthInches: 0.0625,
    groutType: 'cement',
    isMosaic: true
  });
  assert.strictEqual(grout2.valid, true);
  assert.ok(grout2.quantityLbs > grout1.quantityLbs, 'Mosaic should use more grout than standard tile');

  console.log('  ✓ All grout formula tests passed');
}

// ==
// WATERPROOFING FORMULA TESTS
// ==

import {
  calculateWaterproofing,
  getWaterproofingProducts,
  WP_PRODUCTS
} from '../../assets/js/tools/formulas/formulas.waterproofing.js';

function testWaterproofingFormulas() {
  console.log('Testing waterproofing formulas...');

  // Test that products have sources
  for (const [id, product] of Object.entries(WP_PRODUCTS)) {
    assert.ok(product.source, `Product ${id} should have source`);
    assert.ok(product.coverageSqFtPerUnit > 0, `Product ${id} should have positive coverage`);
  }

  // Test RedGard calculation (55 sq ft/gal)
  const wp1 = calculateWaterproofing({
    productId: 'redgard',
    areaSqFt: 100,
    insideCorners: 4,
    wastePercent: 15
  });
  assert.strictEqual(wp1.valid, true);
  // 100 * 1.15 = 115 sq ft / 55 = 2.09 -> 3 gallons
  assert.strictEqual(wp1.unitsNeeded, 3, 'RedGard should need 3 gallons for 100 sq ft + 15% waste');
  assert.strictEqual(wp1.seamTapeFt, 8, '4 corners * 2 ft = 8 ft tape');

  // Test KERDI calculation (54.5 sq ft/roll)
  const wp2 = calculateWaterproofing({
    productId: 'kerdi',
    areaSqFt: 100,
    wastePercent: 15
  });
  assert.strictEqual(wp2.valid, true);
  // 100 * 1.15 = 115 sq ft / 54.5 = 2.11 -> 3 rolls
  assert.strictEqual(wp2.unitsNeeded, 3, 'KERDI should need 3 rolls for 100 sq ft + 15% waste');

  // Test product list
  const products = getWaterproofingProducts();
  assert.ok(products.length >= 4, 'Should have at least 4 waterproofing products');

  console.log('  ✓ All waterproofing formula tests passed');
}

// ==
// LEVELING FORMULA TESTS
// ==

import {
  calculateLeveler,
  getLevelerProducts,
  SLU_PRODUCTS
} from '../../assets/js/tools/formulas/formulas.leveling.js';

function testLevelingFormulas() {
  console.log('Testing leveling formulas...');

  // Test calculation at 1/4" depth
  // 100 sq ft * 0.25" = 100 * 0.0208 ft = 2.08 cu ft
  // Generic coverage: 0.45 cu ft per bag -> 2.08/0.45 = 4.62 -> 5 bags
  const level1 = calculateLeveler({
    areaSqFt: 100,
    avgDepthInches: 0.25,
    productId: 'generic'
  });
  assert.strictEqual(level1.valid, true);
  assert.strictEqual(level1.bags, 5, '100 sq ft at 1/4" should need ~5 bags');

  // Test with max depth
  const level2 = calculateLeveler({
    areaSqFt: 100,
    avgDepthInches: 0.25,
    maxDepthInches: 0.5,
    productId: 'generic'
  });
  assert.strictEqual(level2.valid, true);
  assert.ok(level2.bagsMax > level2.bags, 'Max depth should give higher bag count');

  // Test depth warnings
  const level3 = calculateLeveler({
    areaSqFt: 100,
    avgDepthInches: 2,
    productId: 'mapei-slf-plus' // max 1"
  });
  assert.ok(level3.warnings.length > 0, 'Should warn about exceeding max depth');

  console.log('  ✓ All leveling formula tests passed');
}

// ==
// SLOPE FORMULA TESTS
// ==

import {
  calculateSlope,
  SLOPE_REQUIREMENTS
} from '../../assets/js/tools/formulas/formulas.slope.js';

function testSlopeFormulas() {
  console.log('Testing slope formulas...');

  // Test basic slope calculation
  // 3 ft distance * 0.25 in/ft = 0.75" min height
  const slope1 = calculateSlope({
    distanceToDrawnFt: 3,
    drainType: 'center'
  });
  assert.strictEqual(slope1.valid, true);
  assert.strictEqual(slope1.minSlopeHeight, 0.75, '3 ft at 1/4"/ft should be 0.75"');
  // 3 ft * 0.3125 = 0.9375" recommended
  assert.strictEqual(slope1.recSlopeHeight, 0.9375, '3 ft at 5/16"/ft should be 0.9375"');

  // Test linear drain (reduced distance)
  const slope2 = calculateSlope({
    distanceToDrawnFt: 4,
    drainType: 'linear'
  });
  // 4 * 0.75 = 3 ft effective, * 0.25 = 0.75" min
  assert.strictEqual(slope2.effectiveDistance, 3, 'Linear drain should reduce effective distance');
  assert.strictEqual(slope2.minSlopeHeight, 0.75, 'Linear drain: 3 ft effective at 1/4"/ft = 0.75"');

  // Test constants
  assert.strictEqual(SLOPE_REQUIREMENTS.minimum.inchesPerFoot, 0.25, 'Min slope should be 1/4"/ft');
  assert.strictEqual(SLOPE_REQUIREMENTS.recommended.inchesPerFoot, 0.3125, 'Rec slope should be 5/16"/ft');

  console.log('  ✓ All slope formula tests passed');
}

// ==
// ADVANCED FORMULA TESTS
// ==

function testAdvancedFormulas() {
  console.log('Testing advanced formulas...');

  // Movement joints interior normal temp
  const mj1 = calculateMovementJoints({ lengthFt: 40, widthFt: 20, exposure: 'interior', tempSwingF: 20 });
  assert.strictEqual(mj1.valid, true);
  assert.strictEqual(mj1.spacingFt, 24);
  assert.strictEqual(mj1.jointsLong, 1);
  assert.strictEqual(mj1.jointsShort, 0);

  // Exterior high temp should tighten spacing
  const mj2 = calculateMovementJoints({ lengthFt: 40, widthFt: 20, exposure: 'exterior', tempSwingF: 50 });
  assert.strictEqual(mj2.spacingFt, 8);

  // Deflection check 2x10, 16" oc, 12 ft span
  const defl = calculateDeflection({
    spanFeet: 12,
    joistSpacingInches: 16,
    joistWidthInches: 1.5,
    joistDepthInches: 9.25,
    modulusPsi: 1600000
  });
  assert.strictEqual(defl.valid, true);
  assert.strictEqual(defl.passesCeramic, true);

  // Heated floor load 100 sf @12 W/sf 120V
  const heat = calculateHeatedFloorLoad({ areaSqFt: 100, wattsPerSqFt: 12, voltage: 120 });
  assert.strictEqual(heat.valid, true);
  assert.ok(heat.amps > 0);
  assert.ok(heat.breakerAmps >= 15);

  // Moisture limits
  const moisture = evaluateMoistureReadings({ mverLbs: 4, rhPercent: 70, productLimitMver: 5, productLimitRh: 75 });
  assert.strictEqual(moisture.requiresMitigation, false);

  const moistureFail = evaluateMoistureReadings({ mverLbs: 8, rhPercent: 80, productLimitMver: 5, productLimitRh: 75 });
  assert.strictEqual(moistureFail.requiresMitigation, true);

  // Thinset mix partial batch
  const mix = calculateThinsetMix({ bagWeightLbs: 50, batchWeightLbs: 25, waterQuartsPerBagMin: 5, waterQuartsPerBagMax: 6 });
  assert.strictEqual(mix.valid, true);
  assert.ok(mix.waterQuartsRange[0] > 0);

  // Sealer coverage
  const sealer = estimateSealer({ areaSqFt: 500, surface: 'natural_stone', coats: 2 });
  assert.strictEqual(sealer.valid, true);
  assert.ok(sealer.gallons >= 1);

  // Deck mud volume
  const deck = calculateDeckMud({ areaSqFt: 25, runFeet: 3 });
  assert.strictEqual(deck.valid, true);
  assert.ok(deck.bags >= 1);

  // Primer
  const primer = estimatePrimer({ areaSqFt: 400, porosity: 'porous', doublePrime: true });
  assert.strictEqual(primer.valid, true);
  assert.ok(primer.gallons >= 1);

  // Sealant
  const sealant = estimateSealantTubes({ linearFeet: 50, beadDiameterInches: 0.25, tubeVolumeOz: 10.1 });
  assert.strictEqual(sealant.valid, true);
  assert.ok(sealant.tubes >= 1);

  // Labor sensitivity
  const labor = estimateLaborSensitivity({
    areaSqFt: 200,
    baseProductivitySqFtPerHour: 25,
    complexity: 'high',
    pattern: 'herringbone',
    surface: 'wall',
    crewSize: 2
  });
  assert.strictEqual(labor.valid, true);
  assert.ok(labor.hours > 0);

  console.log('  ✓ All advanced formula tests passed');
}

function testBathLayout() {
  console.log('Testing bath layout...');

  const result = calculateBathLayout({
    roomLengthFt: 14,
    roomWidthFt: 8,
    doorWidthIn: 32,
    walkwayMinIn: 30,
    includeTub: true,
    tubLengthIn: 60,
    tubWidthIn: 30,
    tubFrontClearIn: 30,
    includeShower: false,
    includeToilet: true,
    toiletSideClearIn: 15,
    toiletDepthIn: 28,
    toiletFrontClearIn: 24,
    includeVanity: true,
    vanityWidthIn: 36,
    vanityDepthIn: 22,
    vanityFrontClearIn: 30
  });

  assert.strictEqual(result.valid, true, 'Bath layout should be valid');
  assert.strictEqual(result.fitsLinear, 'Yes', 'Should fit along primary wall');
  assert.strictEqual(result.walkwayPass, 'Yes', 'Walkway should pass minimum clearance');
  assert.ok(result.requiredWallIn > 0, 'Required wall should be positive');
  assert.ok(result.availableWallIn > 0, 'Available wall should be positive');

  console.log('  ✓ Bath layout test passed');
}

// ==
// RUN ALL TESTS
// ==

function runAllTests() {
  console.log('\n=====');
  console.log('Tillerstead Formula Library - Test Suite');
  console.log('=====\n');

  let passed = 0;
  let failed = 0;

  const tests = [
    testUnitConversions,
    testValidation,
    testRounding,
    testTileFormulas,
    testMortarFormulas,
    testGroutFormulas,
    testWaterproofingFormulas,
    testLevelingFormulas,
    testSlopeFormulas,
    testAdvancedFormulas,
    testBathLayout
  ];

  for (const test of tests) {
    try {
      test();
      passed++;
    } catch (err) {
      console.error(`  ✗ FAILED: ${test.name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  console.log('\n=====');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('=====\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();

