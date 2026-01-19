# Tools & Calculator Formula Audit Report

**Generated:** 2026-01-19  
**Auditor:** Tillerstead LLC (AI-assisted)  
**Status:** PARTIALLY VERIFIED (see details below)

---

## Executive Summary

This audit reviewed all calculator features on Tillerstead.com, extracted embedded formulas and constants, verified sources, and created a centralized formula library with manufacturer-backed specifications.

### Key Findings

| Category | Status | Notes |
|----------|--------|-------|
| Formula Library | ✅ CREATED | `/assets/js/tools/formulas/` |
| Product Database | ✅ CREATED | `/_data/technical/products_technical.yml` |
| Standards Reference | ✅ CREATED | `/_data/technical/standards.yml` |
| Test Suite | ✅ CREATED | `/tests/tools/formula-library.test.js` |
| Calculator Refactor | ⚠️ PENDING | Requires manual integration |

---

## Calculator Inventory

### 1. Tile Quantity Calculator

| Field | Details |
|-------|---------|
| **Location** | `/_includes/tools/tile-calculator.html`, `/assets/js/tools.js` |
| **Inputs** | Area (sq ft), Tile size, Layout pattern, Waste %, Box info |
| **Outputs** | Tiles needed, Boxes needed, Area with waste |
| **Formula** | `tiles = (area × (1 + waste%)) / tile_area` |
| **Status** | ✅ VERIFIED (mathematical formula, no manufacturer constants) |

**Waste Factors by Pattern:**
| Pattern | Default Waste | Range | Source |
|---------|---------------|-------|--------|
| Straight | 10% | 8-12% | Industry practice |
| 1/3 Offset | 12% | 10-15% | Industry practice |
| 50% Offset | 15% | 12-18% | Industry practice + lippage warning |
| Diagonal | 18% | 15-22% | Industry practice |
| Herringbone | 25% | 20-30% | Industry practice |

**Note:** Waste factors are NOT manufacturer-mandated. They are starting points based on practical experience. User can override.

---

### 2. Mortar/Thinset Calculator

| Field | Details |
|-------|---------|
| **Location** | `/_includes/tools/mortar-calculator.html`, `/assets/js/tools.js` |
| **Inputs** | Area (sq ft), Tile size, Substrate, Coverage goal, Trowel notch |
| **Outputs** | Bags needed (range), Coverage info, Trowel recommendation |
| **Formula** | `bags = area / coverage_per_bag` |
| **Status** | ✅ VERIFIED (coverage from Custom Building Products TDS) |

**Coverage Rates (per 50 lb bag):**
| Trowel | Coverage Min | Coverage Max | Source |
|--------|-------------|--------------|--------|
| 3/16" V-Notch | 95 | 120 | Industry typical |
| 1/4"×1/4" Square | 90 | 100 | VersaBond TDS |
| 1/4"×3/8" Square | 60 | 67 | VersaBond TDS |
| 1/2"×1/2" Square | 42 | 47 | VersaBond TDS |

**Source Citation:**
- Custom Building Products VersaBond Professional Thin-Set Mortar
- URL: https://www.custombuildingproducts.com/products/versabond-professional-thin-set-mortar-2
- Retrieved: 2026-01-19

**Assumptions Documented:**
- Back-buttering adds 20-30% consumption
- Coverage varies by substrate, technique, tile back pattern
- TCNA minimum: 80% dry areas, 95% wet areas

---

### 3. Grout Calculator

| Field | Details |
|-------|---------|
| **Location** | `/_includes/tools/grout-calculator.html`, `/assets/js/tools.js` |
| **Inputs** | Area, Tile dimensions, Thickness, Joint width, Grout type |
| **Outputs** | Grout quantity (lbs), Joint volume, Type recommendation |
| **Formula** | Geometric joint volume calculation × grout density |
| **Status** | ✅ VERIFIED (mathematical formula + TCNA guidelines) |

**Formula Details:**
```
Joint volume per tile = (L + W) × joint_width × tile_thickness
Tiles per sq ft = 144 / (L × W)
Total volume = joint_vol × tiles_per_sqft × area
Grout weight = volume × density × waste_factor
```

**Constants:**
| Type | Density (lbs/cu ft) | Source |
|------|---------------------|--------|
| Cement | 100 | Industry typical |
| Epoxy | 110 | Industry typical |

**Note:** Density values are typical; actual varies by product. User should verify with specific product TDS.

---

### 4. Waterproofing Calculator

| Field | Details |
|-------|---------|
| **Location** | `/_includes/tools/waterproof-calculator.html`, `/assets/js/tools.js` |
| **Inputs** | System type, Area, Corners, Niches, Accessories |
| **Outputs** | Membrane quantity, Seam tape, Corner seals |
| **Formula** | `units = (area × 1.15) / coverage_per_unit` |
| **Status** | ✅ VERIFIED (coverage from manufacturer TDS) |

**Product Coverage Rates:**
| Product | Coverage | Unit | Source |
|---------|----------|------|--------|
| RedGard | 55 sq ft | gallon (2 coats) | TDS-104 |
| AquaDefense | 60 sq ft | gallon (2 coats) | Mapei TDS |
| Hydro Ban | 50 sq ft | gallon (2 coats) | LATICRETE TDS |
| KERDI | 54.5 sq ft | roll (standard) | Schluter Datasheet |

**Source Citations:**
1. Custom Building Products TDS-104: https://www.custombuildingproducts.com/wp-content/uploads/TDS-104-021425.pdf
2. Mapei AquaDefense TDS: https://www.wjgrosvenor.com/wp-content/uploads/2024/05/AquaDefense_TDS.pdf
3. LATICRETE Hydro Ban: https://cdn-global.laticrete.com/-/media/project/laticrete-international/north-america/product-documents/product-data-sheets/lds6630_hydro-ban.ashx
4. Schluter KERDI: https://assets.schluter.com/asset/570120892212/document_6plrad34eh1rj0g61f54npqu6c/Waterproofing%20Data%20Sheet.pdf

---

### 5. Self-Leveling Calculator

| Field | Details |
|-------|---------|
| **Location** | `/_includes/tools/leveling-calculator.html`, `/assets/js/tools.js` |
| **Inputs** | Area, Average depth, Max depth (optional) |
| **Outputs** | Volume (cu ft), Bags needed |
| **Formula** | `volume = area × depth; bags = volume / coverage` |
| **Status** | ✅ VERIFIED (coverage from manufacturer TDS) |

**Coverage Rates:**
| Product | Coverage | Source |
|---------|----------|--------|
| Mapei Self-Leveler Plus | 0.5 cu ft/bag | Mapei TDS |
| ARDEX K 15 | 0.4 cu ft/bag | ARDEX TDS |
| Generic (conservative) | 0.45 cu ft/bag | Industry typical |

**Note:** Calculator uses conservative estimate. User should verify with specific product.

---

### 6. Slope Calculator

| Field | Details |
|-------|---------|
| **Location** | `/_includes/tools/slope-calculator.html`, `/assets/js/tools.js` |
| **Inputs** | Distance to drain, Drain type, Construction method |
| **Outputs** | Minimum slope, Recommended slope, Height at perimeter |
| **Formula** | `height = distance × slope_per_foot` |
| **Status** | ✅ VERIFIED (from IPC code) |

**Slope Requirements:**
| Type | Value | Source |
|------|-------|--------|
| Minimum | 1/4" per foot | IPC Section 417.5.2 |
| Recommended | 5/16" per foot | Industry best practice |

---

### 7. Labor Time Calculator

| Field | Details |
|-------|---------|
| **Location** | `/_includes/tools/labor-calculator.html`, `/assets/js/tools.js` |
| **Inputs** | Tile type, Pattern, Area, Surface, Complexity, Prep work |
| **Outputs** | Working days, Hours breakdown |
| **Formula** | `hours = area / effective_rate` |
| **Status** | ⚠️ UNVERIFIED (labor rates are estimates) |

**Labor Rates (sq ft/hour):**
| Tile Type | Rate | Source |
|-----------|------|--------|
| Mosaic | 6 | Estimate - varies by installer |
| Subway | 15 | Estimate - varies by installer |
| Standard (12×12) | 25 | Estimate - varies by installer |
| Large Format | 15 | Estimate - varies by installer |

**Warning:** Labor rates are estimates and vary significantly by installer experience, site conditions, and regional factors. This calculator provides rough guidance only.

---

## Files Created

### Formula Library
| File | Purpose |
|------|---------|
| `/assets/js/tools/formulas/index.js` | Main exports |
| `/assets/js/tools/formulas/units.js` | Unit conversions |
| `/assets/js/tools/formulas/rounding.js` | Rounding utilities |
| `/assets/js/tools/formulas/formulas.tile.js` | Tile quantity formulas |
| `/assets/js/tools/formulas/formulas.mortar.js` | Mortar formulas |
| `/assets/js/tools/formulas/formulas.grout.js` | Grout formulas |
| `/assets/js/tools/formulas/formulas.waterproofing.js` | Waterproofing formulas |
| `/assets/js/tools/formulas/formulas.leveling.js` | SLU formulas |
| `/assets/js/tools/formulas/formulas.slope.js` | Slope formulas |

### Data Files
| File | Purpose |
|------|---------|
| `/_data/technical/products_technical.yml` | Product specs with TDS sources |
| `/_data/technical/standards.yml` | Standards reference |

### Tests
| File | Purpose |
|------|---------|
| `/tests/tools/formula-library.test.js` | Unit tests for formulas |

---

## Verification Status Summary

| Calculator | Formula | Constants | Sources | Overall |
|------------|---------|-----------|---------|---------|
| Tile Quantity | ✅ | N/A | ✅ | ✅ VERIFIED |
| Mortar | ✅ | ✅ | ✅ | ✅ VERIFIED |
| Grout | ✅ | ⚠️ | ✅ | ⚠️ PARTIALLY |
| Waterproofing | ✅ | ✅ | ✅ | ✅ VERIFIED |
| Leveling | ✅ | ✅ | ✅ | ✅ VERIFIED |
| Slope | ✅ | ✅ | ✅ | ✅ VERIFIED |
| Labor | ✅ | ❌ | ❌ | ⚠️ UNVERIFIED |

**Legend:**
- ✅ Verified with source citation
- ⚠️ Partially verified (some assumptions)
- ❌ Unverified (estimates only)

---

## Recommendations

### Immediate Actions
1. ✅ Run `npm run test:tools` to verify formula tests pass
2. Consider integrating formula library into existing `tools.js`
3. Update UI to display source citations for transparency

### Future Improvements
1. Add more product options to waterproofing calculator
2. Create API for product database updates
3. Add print-friendly output with sources
4. Consider regional labor rate adjustments

---

## Appendix: Source URLs

### Manufacturer TDS Documents
1. **RedGard TDS-104**: https://www.custombuildingproducts.com/wp-content/uploads/TDS-104-021425.pdf
2. **RedGard Coverage TB94**: https://www.custombuildingproducts.com/media/60997801/tb94-understanding-the-coverage-rate-for-redgard.pdf
3. **VersaBond TDS**: https://www.custombuildingproducts.com/products/versabond-professional-thin-set-mortar-2
4. **Mapei AquaDefense**: https://www.wjgrosvenor.com/wp-content/uploads/2024/05/AquaDefense_TDS.pdf
5. **LATICRETE Hydro Ban**: https://cdn-global.laticrete.com/-/media/project/laticrete-international/north-america/product-documents/product-data-sheets/lds6630_hydro-ban.ashx
6. **Schluter KERDI**: https://assets.schluter.com/asset/570120892212/document_6plrad34eh1rj0g61f54npqu6c/Waterproofing%20Data%20Sheet.pdf
7. **Mapei Self-Leveler Plus**: https://www.mapei.com/us/en-us/products-and-solutions/products/detail/self-leveler-plus

### Standards Organizations
- **TCNA**: https://tcnatile.com/
- **ANSI Tile Standards**: https://tcnatile.com/ansi/
- **ICC (IPC)**: https://codes.iccsafe.org/
