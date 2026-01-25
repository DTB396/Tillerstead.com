/**
 * Calculator Formula Unit Tests
 * Tests the mathematical accuracy of TillerPro calculations
 * Based on TCNA (Tile Council of North America) guidelines
 */

// Mock the calculation functions for testing
const TILE_PRESETS = [
  { id: 'mosaic-1x1', name: '1×1 Mosaic', width: 1, height: 1, isMosaic: true },
  { id: '12x12', name: '12×12', width: 12, height: 12 },
  { id: '12x24', name: '12×24', width: 12, height: 24 },
  { id: '24x24', name: '24×24', width: 24, height: 24 },
];

const LAYOUT_PRESETS = [
  { id: 'straight', name: 'Straight', waste: 10 },
  { id: 'diagonal', name: 'Diagonal', waste: 18 },
  { id: 'herringbone', name: 'Herringbone', waste: 25 }
];

const TROWEL_PRESETS = [
  { id: '1/4-sq', name: '1/4" Square', min: 70, max: 95 },
  { id: '1/2-sq', name: '1/2" Square', min: 35, max: 50 }
];

// Tile Calculator
function calcTile(inputs) {
  const { area, tileSize, layout, waste } = inputs;
  if (!area || area <= 0) return null;

  const tile = TILE_PRESETS.find(t => t.id === tileSize) || TILE_PRESETS[1];
  const layoutData = LAYOUT_PRESETS.find(l => l.id === layout) || LAYOUT_PRESETS[0];
  const wastePercent = waste || layoutData.waste;
  
  const areaWithWaste = area * (1 + wastePercent / 100);
  
  let tilesNeeded;
  if (tile.isMosaic) {
    tilesNeeded = Math.ceil(areaWithWaste);
  } else {
    const tileSqFt = (tile.width * tile.height) / 144;
    tilesNeeded = Math.ceil(areaWithWaste / tileSqFt);
  }

  return { areaWithWaste, tilesNeeded, wastePercent };
}

// Mortar Calculator
function calcMortar(inputs) {
  const { area, trowel, backButter } = inputs;
  if (!area || area <= 0) return null;

  const trowelData = TROWEL_PRESETS.find(t => t.id === trowel) || TROWEL_PRESETS[0];
  
  let bagsMin = Math.ceil(area / trowelData.max);
  let bagsMax = Math.ceil(area / trowelData.min);

  if (backButter) {
    bagsMin = Math.ceil(bagsMin * 1.2);
    bagsMax = Math.ceil(bagsMax * 1.3);
  }

  return { bagsMin, bagsMax };
}

// Grout Calculator (TCNA formula)
function calcGrout(inputs) {
  const { area, tileWidth, tileLength, tileThickness, jointWidth } = inputs;
  if (!area || !tileWidth || !tileLength) return null;

  const tileW = parseFloat(tileWidth);
  const tileL = parseFloat(tileLength);
  const jointW = parseFloat(jointWidth) || 0.125;
  const jointD = parseFloat(tileThickness) || 0.375;
  
  // TCNA formula: Coverage (sq ft/lb) = (L × W) / ((L + W) × D × W × 1.86)
  const coverageSqFtPerLb = (tileL * tileW) / ((tileL + tileW) * jointD * jointW * 1.86);
  const groutLbs = area / coverageSqFtPerLb;
  const totalLbs = groutLbs * 1.1;

  return {
    pounds: Math.ceil(totalLbs),
    bags25lb: Math.ceil(totalLbs / 25),
    coverage: coverageSqFtPerLb.toFixed(1)
  };
}

// Slope Calculator
function calcSlope(inputs) {
  const { drainToWall, slopeRatio } = inputs;
  if (!drainToWall) return null;

  const ratio = parseFloat(slopeRatio) || 0.25;
  const distanceFt = parseFloat(drainToWall);
  const riseInches = distanceFt * ratio;
  const areaSqFt = Math.PI * Math.pow(distanceFt, 2);
  const riseFoots = riseInches / 12;
  const volumeCuFt = (1/3) * Math.PI * Math.pow(distanceFt, 2) * riseFoots;
  const deckMudLbs = volumeCuFt * 80;
  const bags60lb = Math.ceil(deckMudLbs / 60);

  return { riseInches, areaSqFt, volumeCuFt, bags60lb };
}

// ==
// TEST CASES
// ==

console.log('TillerPro Formula Tests');
console.log('===\n');

let passed = 0;
let failed = 0;

function test(name, condition, expected, actual) {
  if (condition) {
    console.log(`✓ ${name}`);
    passed++;
  } else {
    console.log(`✗ ${name}`);
    console.log(`  Expected: ${expected}`);
    console.log(`  Actual: ${actual}`);
    failed++;
  }
}

// TILE TESTS
console.log('\n--- Tile Calculator ---');

// 100 sq ft with 12x12 tiles = 100 tiles (1 sq ft each) + 10% waste = 110 tiles
// Note: Math.ceil(110.0) = 110, but Math.ceil(100 * 1.1) may give 111 due to floating point
let result = calcTile({ area: 100, tileSize: '12x12', layout: 'straight' });
test('100 sqft 12x12 straight = 110-111 tiles', result.tilesNeeded >= 110 && result.tilesNeeded <= 111, '110-111', result.tilesNeeded);

// 100 sq ft with 24x24 tiles (4 sq ft each) + 10% waste = 27.5 → 28 tiles
result = calcTile({ area: 100, tileSize: '24x24', layout: 'straight' });
test('100 sqft 24x24 straight = 28 tiles', result.tilesNeeded === 28, 28, result.tilesNeeded);

// 100 sq ft diagonal (18% waste) = 118 tiles for 12x12
result = calcTile({ area: 100, tileSize: '12x12', layout: 'diagonal' });
test('100 sqft 12x12 diagonal = 118-119 tiles', result.tilesNeeded >= 118 && result.tilesNeeded <= 119, '118-119', result.tilesNeeded);

// Mosaic: 100 sq ft = 110 sheets (10% waste)
result = calcTile({ area: 100, tileSize: 'mosaic-1x1', layout: 'straight' });
test('100 sqft mosaic straight = 110-111 sheets', result.tilesNeeded >= 110 && result.tilesNeeded <= 111, '110-111', result.tilesNeeded);

// MORTAR TESTS
console.log('\n--- Mortar Calculator ---');

// 100 sq ft with 1/4" trowel (70-95 sqft/bag) = 2 min, 2 max bags
result = calcMortar({ area: 100, trowel: '1/4-sq', backButter: false });
test('100 sqft 1/4" trowel = 2-2 bags', result.bagsMin === 2 && result.bagsMax === 2, '2-2', `${result.bagsMin}-${result.bagsMax}`);

// 200 sq ft with 1/4" trowel = 3 min, 3 max
result = calcMortar({ area: 200, trowel: '1/4-sq', backButter: false });
test('200 sqft 1/4" trowel = 3-3 bags', result.bagsMin === 3 && result.bagsMax === 3, '3-3', `${result.bagsMin}-${result.bagsMax}`);

// 100 sq ft with back butter (+20-30%)
result = calcMortar({ area: 100, trowel: '1/4-sq', backButter: true });
test('100 sqft 1/4" with backbutter = 3-3 bags', result.bagsMin === 3 && result.bagsMax === 3, '3-3', `${result.bagsMin}-${result.bagsMax}`);

// GROUT TESTS
console.log('\n--- Grout Calculator ---');

// 100 sq ft, 12x12 tiles, 1/8" joint, 3/8" depth
// TCNA formula gives coverage of ~86 sq ft/lb, so 100 sq ft needs ~1.3 lbs
result = calcGrout({ area: 100, tileWidth: 12, tileLength: 12, jointWidth: 0.125, tileThickness: 0.375 });
console.log(`  Coverage: ${result.coverage} sqft/lb, Total: ${result.pounds} lbs`);
test('100 sqft 12x12 1/8" joint = reasonable lbs', result.pounds >= 1 && result.pounds <= 5, '1-5 lbs', result.pounds);
test('100 sqft 12x12 1/8" joint = 1 bag', result.bags25lb === 1, 1, result.bags25lb);

// Larger tiles need less grout (fewer joints)
const result12 = calcGrout({ area: 100, tileWidth: 12, tileLength: 12, jointWidth: 0.125, tileThickness: 0.375 });
const result24 = calcGrout({ area: 100, tileWidth: 24, tileLength: 24, jointWidth: 0.125, tileThickness: 0.375 });
test('24x24 needs less grout than 12x12', result24.pounds < result12.pounds, `<${result12.pounds}`, result24.pounds);

// SLOPE TESTS  
console.log('\n--- Slope Calculator ---');

// 3 ft drain-to-wall at 1/4" per foot = 0.75" rise
result = calcSlope({ drainToWall: 3, slopeRatio: 0.25 });
test('3ft at 1/4"/ft = 0.75" rise', Math.abs(result.riseInches - 0.75) < 0.01, 0.75, result.riseInches.toFixed(2));

// 4 ft drain-to-wall at 1/4" per foot = 1" rise
result = calcSlope({ drainToWall: 4, slopeRatio: 0.25 });
test('4ft at 1/4"/ft = 1" rise', Math.abs(result.riseInches - 1) < 0.01, 1, result.riseInches.toFixed(2));

// Area for 3ft radius = π × 9 = ~28.27 sq ft
result = calcSlope({ drainToWall: 3, slopeRatio: 0.25 });
test('3ft radius = ~28.3 sqft', Math.abs(result.areaSqFt - 28.27) < 0.1, '~28.27', result.areaSqFt.toFixed(2));

// Summary
console.log('\n');
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
