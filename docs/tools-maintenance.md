# Tools & Calculator Maintenance Guide

This guide explains how to maintain the formula library, add new products, and update calculator specifications.

---

## Architecture Overview

```
assets/js/tools/formulas/
├── index.js              # Main exports
├── units.js              # Unit conversions
├── rounding.js           # Rounding utilities  
├── formulas.tile.js      # Tile quantity formulas
├── formulas.mortar.js    # Mortar/thinset formulas
├── formulas.grout.js     # Grout formulas
├── formulas.waterproofing.js  # Waterproofing formulas
├── formulas.leveling.js  # Self-leveling formulas
└── formulas.slope.js     # Slope formulas

_data/technical/
├── products_technical.yml    # Product specs with TDS sources
└── standards.yml             # Standards reference

tests/tools/
└── formula-library.test.js   # Formula unit tests
```

---

## How to Add a New Product

### 1. Research the Product TDS

Before adding any product, you MUST find the official Technical Data Sheet (TDS):

1. Go to the manufacturer's website
2. Find the product page
3. Download the TDS/spec sheet (usually PDF)
4. Extract these key values:
   - Coverage rate (with units and conditions)
   - Packaging sizes
   - Application requirements
   - Compliance standards claimed

### 2. Add to Products Database

Edit `/_data/technical/products_technical.yml`:

```yaml
- brand: "Manufacturer Name"
  product_name: "Product Name"
  category: "thinset"  # or: grout, waterproofing, leveling, etc.
  packaging:
    - size: 50
      unit: "lb"
      type: "bag"
  coverage:
    - condition: "1/4\"x1/4\" square notch trowel"
      min: 90
      max: 100
      unit: "sq ft per bag"
  compliance:
    - "ANSI A118.4"
  sources:
    - url: "https://manufacturer.com/product-tds.pdf"
      title: "Product TDS"
      retrieved: "2026-01-19"
  notes: "Coverage varies by substrate and technique"
```

### 3. Add to Formula Module (if needed)

If the product has unique coverage logic, add to the appropriate formula file:

```javascript
// In formulas.waterproofing.js
export const WP_PRODUCTS = {
  // ... existing products ...
  
  'new-product': {
    name: 'New Product Name',
    type: 'liquid',
    coverage_sqft_per_gallon: 55,  // From TDS
    coats_required: 2,
    sources: [{
      title: 'New Product TDS',
      url: 'https://manufacturer.com/tds.pdf',
      retrieved: '2026-01-19',
      excerpt: 'Coverage: 110 sq ft per gallon per coat'
    }]
  }
};
```

### 4. Add Tests

Add test cases in `/tests/tools/formula-library.test.js`:

```javascript
test('New product coverage calculation', () => {
  const result = calculateWaterproofing({
    product: 'new-product',
    area_sqft: 100
  });
  assert.strictEqual(result.gallons, 2);  // Expected based on TDS
});
```

### 5. Run Tests

```bash
npm run test:tools
```

---

## How to Add a New Calculator

### 1. Create the Formula Module

Create a new file in `/assets/js/tools/formulas/`:

```javascript
// formulas.newcalc.js

/**
 * New Calculator Formulas
 * Calculates [description]
 * 
 * Sources:
 * - [List your sources here]
 */

export const NEWCALC_CONSTANTS = {
  // Only add constants you can source!
  some_rate: {
    value: 100,
    unit: 'sq ft',
    source: {
      title: 'Source Document',
      url: 'https://...',
      retrieved: '2026-01-19'
    }
  }
};

export function calculateNewThing(inputs) {
  // Validate inputs
  if (!inputs.area || inputs.area <= 0) {
    return { valid: false, error: 'Area must be positive' };
  }

  // Calculate
  const result = inputs.area * NEWCALC_CONSTANTS.some_rate.value;

  return {
    valid: true,
    result: result,
    unit: 'units',
    assumptions: [
      'Based on Source Document at X condition'
    ],
    sources: [NEWCALC_CONSTANTS.some_rate.source]
  };
}
```

### 2. Export from Index

Edit `/assets/js/tools/formulas/index.js`:

```javascript
// Add import
import * as newcalc from './formulas.newcalc.js';

// Add to exports
export { newcalc };

// Add to LIBRARY_INFO.modules
modules: [
  // ... existing modules ...
  'formulas.newcalc.js'
]
```

### 3. Create the UI Component

Create `/_includes/tools/newcalc-calculator.html`:

```html
<div class="calculator-card" id="newcalc-calculator">
  <h3>New Calculator</h3>
  
  <div class="input-group">
    <label for="newcalc-area">Area (sq ft)</label>
    <input type="number" id="newcalc-area" min="0" step="0.1">
  </div>
  
  <button onclick="calculateNew()">Calculate</button>
  
  <div class="results" id="newcalc-results">
    <!-- Results appear here -->
  </div>
  
  <details class="assumptions">
    <summary>Assumptions & Sources</summary>
    <ul id="newcalc-sources">
      <!-- Sources listed here -->
    </ul>
  </details>
</div>
```

### 4. Add Tests

```javascript
// In formula-library.test.js

describe('New Calculator', () => {
  test('basic calculation', () => {
    const result = calculateNewThing({ area: 100 });
    assert(result.valid);
    assert.strictEqual(result.result, 10000);
  });

  test('rejects negative input', () => {
    const result = calculateNewThing({ area: -5 });
    assert(!result.valid);
  });
});
```

---

## How to Update Specs When Manufacturers Revise TDS

### 1. Document the Change

When a manufacturer updates their TDS:

1. Download the new TDS
2. Compare coverage rates, compliance claims, etc.
3. Note what changed

### 2. Update the Product Database

In `/_data/technical/products_technical.yml`, update the product entry:

```yaml
- brand: "Manufacturer"
  product_name: "Product"
  # ... update coverage values ...
  sources:
    - url: "https://new-tds-url.pdf"
      title: "Product TDS (Rev 2026)"
      retrieved: "2026-06-15"  # Update date!
  notes: "Updated from Rev 2025 to Rev 2026. Coverage changed from X to Y."
```

### 3. Update Formula Constants

If the formula file has hardcoded values, update them:

```javascript
export const PRODUCT_COVERAGE = {
  // Update the value
  coverage_rate: 55,  // Was 50 in previous TDS
  
  // Update the source
  source: {
    title: 'Product TDS Rev 2026',
    url: 'https://new-url.pdf',
    retrieved: '2026-06-15',
    excerpt: 'Coverage increased to 55 sq ft per gallon'
  }
};
```

### 4. Update Tests

Adjust expected values in tests:

```javascript
test('coverage calculation with updated TDS', () => {
  const result = calculate({ area: 100 });
  // Updated expected value based on new TDS
  assert.strictEqual(result.units, 2);  // Was 2.2 before update
});
```

### 5. Document in Changelog

Add a note to the audit report or create a changelog:

```markdown
## 2026-06-15: TDS Update

- **Product X**: Coverage changed from 50 to 55 sq ft/gal
- **Source**: TDS Rev 2026
- **Affected calculators**: Waterproofing
```

---

## Source Documentation Requirements

### Required Information for Each Constant

Every hardcoded value in the formula library MUST have:

1. **Value** - The actual number
2. **Unit** - What the number measures
3. **Condition** - Under what circumstances (trowel size, thickness, etc.)
4. **Source URL** - Link to the TDS or standard
5. **Source Title** - Name of the document
6. **Retrieved Date** - When you accessed it

### Example

```javascript
const COVERAGE = {
  value: 90,
  unit: 'sq ft per 50 lb bag',
  condition: '1/4"×1/4" square notch trowel',
  source: {
    url: 'https://custombuildingproducts.com/versabond-tds.pdf',
    title: 'VersaBond Professional Thin-Set Mortar TDS',
    retrieved: '2026-01-19',
    excerpt: 'Coverage: 90-100 sq ft per 50 lb bag using 1/4"×1/4" square notch trowel'
  }
};
```

### What to Do If You Can't Find a Source

1. **DO NOT** invent a value
2. Mark the field as `UNVERIFIED`
3. Require user input instead of using a default
4. Add a warning in the UI

```javascript
const RATE = {
  value: null,  // UNVERIFIED - no TDS available
  source: 'User input required',
  warning: 'Coverage varies - check product TDS'
};
```

---

## Testing Commands

```bash
# Run formula tests
npm run test:tools

# Run all tests (includes E2E)
npm test

# Run specific test file
node --experimental-vm-modules tests/tools/formula-library.test.js
```

---

## Troubleshooting

### Tests Failing After Update

1. Check if you updated the expected values in tests
2. Verify the formula logic matches the new TDS
3. Check unit conversions

### Product Not Showing in Calculator

1. Verify the product is in `products_technical.yml`
2. Check the formula file includes the product key
3. Verify the UI component references the correct product ID

### Coverage Mismatch

1. Re-read the TDS carefully
2. Check if coverage is per coat or total
3. Verify units match (sq ft vs sq m, bag vs bucket)
4. Check application thickness assumptions

---

## Contact

For questions about this system, contact the Tillerstead development team.

**Last Updated:** 2026-01-19
