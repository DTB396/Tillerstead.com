# TillerPro App Expansion Plan
> **Date:** January 20, 2026  
> **Version:** 2.0 Roadmap  
> **Goal:** Transform TillerPro from a calculator suite into a comprehensive tile project companion app

---

## 🎯 Executive Summary

Expand TillerPro beyond calculators to include:
1. **Product Finder** — Search and discover tile supplies (tiles, mortar, grout, tools)
2. **Design Tools** — Visual room designers and pattern testers
3. **Virtual Showroom** — AR/3D environments to preview products
4. **Enhanced Calculators** — Integrated with product recommendations

---

## 📊 Current State Analysis

### Existing Calculator Categories
| Category | Calculators | Status |
|----------|-------------|--------|
| Surface Coverage | Tile, Mortar, Grout, Waterproofing | ✅ Ready |
| Structural & Load | Slope, Deflection, Heated Floor | ✅ Ready |
| Prep & Finishing | Leveling, Thinset Mix, Primer, Deck Mud, Sealant, Sealer | ✅ Ready |
| Planning & Layout | Movement Joints, Moisture, Bath Layout, Labor, Crown, Baseboard, Quarter Round | ✅ Ready |

### Current Architecture
- **Frontend:** Vanilla JS SPA with client-side routing
- **Data:** Local storage with optional tillerstead-toolkit API
- **PWA:** Manifest, service worker, offline-capable

---

## 🆕 New Tool Categories

### Category 1: Product Finder & Supply Search 🔍
**Purpose:** Help users find and compare tile supplies quickly

#### 1.1 Tile Search Engine
```yaml
id: tile-search
name: Tile Search
icon: 🔍
category: product-finder
features:
  - Search by: size, material, color, brand, price range
  - Filter: porcelain, ceramic, natural stone, glass, mosaic
  - Sort: price, popularity, rating, TCNA compliance
  - Integration: Link to retailer APIs (Home Depot, Floor & Decor, local suppliers)
  - Save favorites to project
```

#### 1.2 Material Database
```yaml
id: material-db
name: Material Database
icon: 📚
category: product-finder
features:
  - Mortar types: thin-set, medium-bed, large-format
  - Grout types: sanded, unsanded, epoxy, urethane
  - Waterproofing: liquid membrane, sheet membrane, foam boards
  - Accessories: leveling systems, spacers, transitions
  - Filter by: application, substrate, tile type
  - TDS links and coverage calculators
```

#### 1.3 Local Supplier Finder
```yaml
id: supplier-finder
name: Find Suppliers
icon: 📍
category: product-finder
features:
  - GPS-based local tile showrooms
  - Big box stores (Home Depot, Lowe's)
  - Specialty suppliers (Daltile, MSI, Floor & Decor)
  - Filter: in-stock, delivery available, open now
  - Reviews and ratings integration
```

#### 1.4 Price Comparison Tool
```yaml
id: price-compare
name: Price Compare
icon: 💰
category: product-finder
features:
  - Compare same tile across retailers
  - Track price history
  - Alert on price drops
  - Calculate total cost with delivery
  - Integration with project budget
```

---

### Category 2: Design Tools & Visualizers 🎨
**Purpose:** Help users visualize tile layouts and test different looks

#### 2.1 Pattern Layout Designer
```yaml
id: pattern-designer
name: Pattern Designer
icon: 🎨
category: design-tools
features:
  - Drag-and-drop tile placement
  - Pre-built patterns: herringbone, chevron, basketweave, pinwheel
  - Custom pattern builder
  - Export layout as PDF/image
  - Calculate waste factor for pattern
  - Show cut pieces and material list
```

#### 2.2 Color Palette Builder
```yaml
id: color-palette
name: Color Palette
icon: 🎭
category: design-tools
features:
  - Tile color picker
  - Grout color simulator
  - Accent tile combinations
  - Complementary color suggestions
  - Save palettes to projects
  - Export mood boards
```

#### 2.3 Room Layout Planner
```yaml
id: room-planner
name: Room Planner
icon: 📐
category: design-tools
features:
  - 2D floor plan drawing
  - Drag fixtures: tub, shower, toilet, vanity
  - Auto-calculate tile quantities
  - Show focal points and layout lines
  - Export to scale PDF
  - Save multiple room designs
```

#### 2.4 Grout Joint Simulator
```yaml
id: grout-sim
name: Grout Simulator
icon: 🖌️
category: design-tools
features:
  - Preview grout colors with any tile
  - Joint width comparison (1/16" vs 1/8" vs 3/16")
  - Light vs dark grout visual impact
  - Stain resistance comparison
  - Export side-by-side comparisons
```

---

### Category 3: Virtual Showroom & AR Preview 🏠
**Purpose:** Create immersive environments to test products before purchase

#### 3.1 3D Room Visualizer
```yaml
id: room-visualizer
name: 3D Visualizer
icon: 🏠
category: virtual-showroom
features:
  - Template rooms: bathroom, kitchen, entry, shower
  - Apply tiles to walls/floors
  - Change lighting conditions (natural, artificial)
  - Walk-through navigation
  - Save and share designs
  - Integration with manufacturer tile libraries
```

#### 3.2 AR Tile Preview (Mobile)
```yaml
id: ar-preview
name: AR Preview
icon: 📱
category: virtual-showroom
features:
  - Point camera at floor/wall
  - Overlay selected tile pattern
  - Scale to real room dimensions
  - Save photo with tile overlay
  - Share to social/contractors
  - Works offline (cached tiles)
```

#### 3.3 Before/After Comparison
```yaml
id: before-after
name: Before & After
icon: 🔄
category: virtual-showroom
features:
  - Upload current room photo
  - Apply tile virtually
  - Side-by-side slider comparison
  - Multiple design variants
  - Export presentation PDF
  - Share with stakeholders
```

#### 3.4 Product Swatch Library
```yaml
id: swatch-library
name: Swatch Library
icon: 🗂️
category: virtual-showroom
features:
  - Digital tile samples
  - High-res textures and patterns
  - Search by manufacturer
  - Order physical samples (affiliate links)
  - Compare multiple swatches
  - Save to project boards
```

---

### Category 4: Project Integration Features 📋
**Purpose:** Connect all tools into cohesive project workflows

#### 4.1 Shopping List Generator
```yaml
id: shopping-list
name: Shopping List
icon: 🛒
category: project-tools
features:
  - Auto-generate from calculators
  - Group by store/supplier
  - Add custom items
  - Track purchased vs needed
  - Export to phone for store trips
  - Price estimates with totals
```

#### 4.2 Project Timeline Planner
```yaml
id: timeline
name: Project Timeline
icon: 📅
category: project-tools
features:
  - Template timelines by project type
  - Milestone tracking
  - Cure time reminders (mortar, grout, sealer)
  - Contractor scheduling
  - Weather considerations
  - Export to calendar
```

#### 4.3 Budget Tracker
```yaml
id: budget
name: Budget Tracker
icon: 💵
category: project-tools
features:
  - Material cost tracking
  - Labor estimates
  - Contingency planning (10-15%)
  - Compare quotes
  - Track actual vs estimated
  - Export budget reports
```

---

## 🗂️ Updated Category Structure

```javascript
// Updated CATEGORIES object for tools-app.js
const CATEGORIES = {
  // Existing categories (enhanced)
  coverage: { 
    name: 'Surface Coverage', 
    icon: '🧱', 
    order: 1 
  },
  structural: { 
    name: 'Structural & Load', 
    icon: '🏗️', 
    order: 2 
  },
  prepfinish: { 
    name: 'Prep & Finishing', 
    icon: '🧴', 
    order: 3 
  },
  planning: { 
    name: 'Planning & Layout', 
    icon: '📐', 
    order: 4 
  },
  
  // NEW CATEGORIES
  'product-finder': { 
    name: 'Product Finder', 
    icon: '🔍', 
    order: 5,
    desc: 'Search tiles, materials, and local suppliers',
    isNew: true
  },
  'design-tools': { 
    name: 'Design Tools', 
    icon: '🎨', 
    order: 6,
    desc: 'Visualize patterns, colors, and room layouts',
    isNew: true
  },
  'virtual-showroom': { 
    name: 'Virtual Showroom', 
    icon: '🏠', 
    order: 7,
    desc: '3D/AR preview environments',
    isNew: true
  },
  'project-tools': { 
    name: 'Project Tools', 
    icon: '📋', 
    order: 8,
    desc: 'Shopping lists, timelines, and budgets',
    isNew: true
  }
};
```

---

## 📁 File Structure for New Features

```
_includes/tools/
├── calculators/           # Existing calculators
│   ├── tile-calculator.html
│   ├── mortar-calculator.html
│   └── ...
├── product-finder/        # NEW
│   ├── tile-search.html
│   ├── material-db.html
│   ├── supplier-finder.html
│   └── price-compare.html
├── design-tools/          # NEW
│   ├── pattern-designer.html
│   ├── color-palette.html
│   ├── room-planner.html
│   └── grout-simulator.html
├── virtual-showroom/      # NEW
│   ├── room-visualizer.html
│   ├── ar-preview.html
│   ├── before-after.html
│   └── swatch-library.html
└── project-tools/         # NEW
    ├── shopping-list.html
    ├── timeline.html
    └── budget-tracker.html

assets/
├── js/
│   ├── tools-app.js           # Main app (update)
│   ├── tools/
│   │   ├── product-finder.js  # NEW module
│   │   ├── design-tools.js    # NEW module
│   │   ├── visualizer.js      # NEW module (Three.js integration)
│   │   └── ar-preview.js      # NEW module (AR.js integration)
├── css/
│   ├── tools-app.css          # Update with new component styles
│   └── tools/
│       ├── product-cards.css  # NEW
│       ├── design-canvas.css  # NEW
│       └── visualizer.css     # NEW

_data/
├── tile-catalog.yml           # NEW - tile database
├── material-catalog.yml       # NEW - mortar/grout database
├── suppliers.yml              # NEW - supplier directory
└── patterns.yml               # NEW - pattern templates
```

---

## 🛠️ Technical Implementation

### Phase 1: Product Finder (Weeks 1-4)
**Priority:** High | **Complexity:** Medium

1. **Create Data Layer**
   ```yaml
   # _data/tile-catalog.yml
   tiles:
     - id: daltile-metro-white-3x6
       name: "Metro White 3×6 Subway"
       brand: Daltile
       material: ceramic
       size: { width: 3, height: 6, thickness: 0.25 }
       colors: [white, glossy]
       price_range: { min: 0.89, max: 1.29, unit: sqft }
       tcna_rating: C1
       applications: [wall, backsplash]
       retailers:
         - name: Home Depot
           url: https://homedepot.com/...
           in_stock: true
         - name: Floor & Decor
           url: https://flooranddecor.com/...
   ```

2. **Build Search Interface**
   - Filter controls (material, size, color, price)
   - Grid/list view toggle
   - Quick add to project
   - Integration with existing calculator inputs

3. **API Integrations (Optional)**
   - Home Depot API for live pricing
   - Google Places for supplier locations
   - Manufacturer APIs for product data

### Phase 2: Design Tools (Weeks 5-8)
**Priority:** High | **Complexity:** High

1. **Pattern Designer Canvas**
   - HTML5 Canvas for tile grid
   - Drag-and-drop tile placement
   - Snap-to-grid functionality
   - Undo/redo history
   - Export as PNG/SVG

2. **Color Tools**
   - Color picker integration
   - Preset color palettes
   - Grout color preview
   - Save custom palettes

3. **Room Planner 2D**
   - SVG-based room drawing
   - Standard fixture library
   - Measurement annotations
   - Scale export to PDF

### Phase 3: Virtual Showroom (Weeks 9-16)
**Priority:** Medium | **Complexity:** Very High

1. **3D Visualizer**
   - Three.js for 3D rendering
   - Pre-built room templates
   - Texture mapping for tiles
   - Camera controls (orbit, walk-through)
   - Lighting presets

2. **AR Preview (Mobile PWA)**
   - WebXR API for AR
   - AR.js for marker-based fallback
   - Plane detection for floors/walls
   - Texture overlay system

3. **Before/After Tool**
   - Image upload
   - Masking/selection tools
   - Tile texture overlay
   - Slider comparison UI

### Phase 4: Project Tools (Weeks 17-20)
**Priority:** Medium | **Complexity:** Low

1. **Shopping List Generator**
   - Pull from calculator results
   - Editable quantities
   - Store assignment
   - Print/export friendly

2. **Timeline Planner**
   - Gantt-style view
   - Milestone templates
   - Calendar export (iCal)

3. **Budget Tracker**
   - Category breakdown
   - Actual vs estimated
   - Charts and graphs

---

## 📱 UI/UX Enhancements

### Updated Navigation Structure
```
┌─────────────────────────────────────────────────────────┐
│  TillerPro                                    [≡] Menu  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Dashboard  │  Calculators  │  Find Products  │  Design │
│     🏠      │      🧮       │       🔍        │   🎨    │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  [Quick Tools]                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Tile    │ │ Search  │ │ Pattern │ │ 3D Room │       │
│  │ Calc    │ │ Tiles   │ │ Builder │ │ Preview │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                         │
│  [My Projects]                       [Saved Searches]   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Mobile Bottom Navigation Update
```html
<!-- New 5-tab bottom nav -->
<nav class="app-bottom-nav">
  <a href="#/dashboard" data-route="dashboard">
    <span class="icon">🏠</span>
    <span>Home</span>
  </a>
  <a href="#/calculators" data-route="calculators">
    <span class="icon">🧮</span>
    <span>Calc</span>
  </a>
  <a href="#/products" data-route="products">
    <span class="icon">🔍</span>
    <span>Find</span>
  </a>
  <a href="#/design" data-route="design">
    <span class="icon">🎨</span>
    <span>Design</span>
  </a>
  <a href="#/projects" data-route="projects">
    <span class="icon">📁</span>
    <span>Projects</span>
  </a>
</nav>
```

---

## 🔗 Integration Points

### Calculator ↔ Product Finder
- After calculating tile quantity → Show matching tiles for sale
- After calculating mortar bags → Link to recommended products
- Auto-populate searches based on calculator inputs

### Design Tools ↔ Virtual Showroom
- Export pattern designs to 3D visualizer
- Use color palette in room visualizer
- Apply room planner layout to 3D template

### Project Tools ↔ All Features
- Every tool result can add to shopping list
- Budget tracker pulls from all material estimates
- Timeline auto-populates from project scope

---

## 🛒 Shop Links & Retailer Integration

### Integration Strategy: BOTH Search Bar AND Calculator Results

#### 1. Calculator Results → Shop Links (Primary)
After every calculation, display contextual "Shop" buttons linking directly to relevant products:

```html
<!-- After Mortar Calculator Results -->
<div class="calc-results__shop">
  <h5>🛒 Shop This Material</h5>
  <div class="shop-links">
    <a href="https://homedepot.com/s/thin-set-mortar" 
       class="shop-link shop-link--homedepot" 
       target="_blank" rel="noopener sponsored">
      <img src="/assets/icons/retailers/homedepot.svg" alt="">
      <span>Home Depot</span>
    </a>
    <a href="https://lowes.com/search?searchTerm=thinset+mortar" 
       class="shop-link shop-link--lowes"
       target="_blank" rel="noopener sponsored">
      <img src="/assets/icons/retailers/lowes.svg" alt="">
      <span>Lowe's</span>
    </a>
    <a href="https://flooranddecor.com/mortar" 
       class="shop-link shop-link--flooranddecor"
       target="_blank" rel="noopener sponsored">
      <img src="/assets/icons/retailers/flooranddecor.svg" alt="">
      <span>Floor & Decor</span>
    </a>
    <button class="shop-link shop-link--local" onclick="TillerApp.findLocalSuppliers('mortar')">
      <span>📍</span>
      <span>Local Suppliers</span>
    </button>
  </div>
</div>
```

#### 2. Global Search Bar (Secondary)
Add a persistent search bar in the header for direct product discovery:

```html
<!-- Header Search Bar -->
<div class="app-header__search">
  <input type="search" 
         placeholder="Search tiles, mortar, grout..." 
         class="search-input"
         aria-label="Search products">
  <button class="search-btn" aria-label="Search">🔍</button>
</div>
```

**Search behavior:**
- Type-ahead suggestions from local product database
- Results link to multiple retailers with price comparison
- Recent searches saved to project context

#### 3. Shop Link Mapping by Calculator

| Calculator | Shop Links | Search Terms |
|------------|------------|--------------|
| Tile Quantity | Tile retailers, local showrooms | `{tile_size} {tile_type} tile` |
| Mortar Coverage | Mortar/thin-set products | `thin-set mortar {lft ? "large format" : ""}` |
| Grout Calculator | Grout products | `{sanded ? "sanded" : "unsanded"} grout` |
| Waterproofing | Membrane products | `waterproof membrane {type}` |
| Self-Leveling | SLU products | `self-leveling underlayment` |
| Heated Floor | Radiant heat systems | `radiant floor heating {sqft} sqft` |

#### 4. Retailer Deep Links

```javascript
// Retailer URL generators
const RETAILERS = {
  homedepot: {
    name: 'Home Depot',
    logo: '/assets/icons/retailers/homedepot.svg',
    baseUrl: 'https://www.homedepot.com',
    searchUrl: (term) => `https://www.homedepot.com/s/${encodeURIComponent(term)}`,
    affiliateParam: '?NCNI-5' // Example affiliate tracking
  },
  lowes: {
    name: "Lowe's",
    logo: '/assets/icons/retailers/lowes.svg',
    baseUrl: 'https://www.lowes.com',
    searchUrl: (term) => `https://www.lowes.com/search?searchTerm=${encodeURIComponent(term)}`
  },
  flooranddecor: {
    name: 'Floor & Decor',
    logo: '/assets/icons/retailers/flooranddecor.svg',
    baseUrl: 'https://www.flooranddecor.com',
    searchUrl: (term) => `https://www.flooranddecor.com/search?q=${encodeURIComponent(term)}`
  },
  amazon: {
    name: 'Amazon',
    logo: '/assets/icons/retailers/amazon.svg',
    baseUrl: 'https://www.amazon.com',
    searchUrl: (term) => `https://www.amazon.com/s?k=${encodeURIComponent(term)}&tag=tillerstead-20`
  },
  msi: {
    name: 'MSI Surfaces',
    logo: '/assets/icons/retailers/msi.svg',
    baseUrl: 'https://www.msisurfaces.com',
    searchUrl: (term) => `https://www.msisurfaces.com/search?q=${encodeURIComponent(term)}`
  },
  daltile: {
    name: 'Daltile',
    logo: '/assets/icons/retailers/daltile.svg',
    baseUrl: 'https://www.daltile.com',
    searchUrl: (term) => `https://www.daltile.com/search?search=${encodeURIComponent(term)}`
  }
};

// Generate shop links for calculator results
function generateShopLinks(calcId, inputs, results) {
  const searchTerms = getSearchTermsForCalc(calcId, inputs);
  return Object.entries(RETAILERS).map(([key, retailer]) => ({
    name: retailer.name,
    logo: retailer.logo,
    url: retailer.searchUrl(searchTerms)
  }));
}
```

---

## 💾 Auto-Save to Project (UX Improvement)

### Current Behavior (Remove)
- User must click "Save to Project" button after each calculation
- Easy to forget, loses work if navigating away

### New Behavior: Auto-Save on Every Calculation

```javascript
// BEFORE: Manual save required
saveToProject(calcId) {
  if (!AppState.activeProject) {
    this.createNewProject();
    return;
  }
  // ... save logic
  Toast.show('Saved to project', 'success');
}

// AFTER: Auto-save on calculation complete
async runCalculation(calcId, inputs) {
  // 1. Run calculation
  const results = await HybridCalculator.calculate(calcId, inputs);
  
  // 2. Store in app state
  AppState.calculatorInputs[calcId] = inputs;
  AppState.calculatorResults[calcId] = results;
  
  // 3. AUTO-SAVE to active project (NEW)
  this.autoSaveToProject(calcId, inputs, results);
  
  // 4. Render results with shop links
  this.renderResults(calcId, results);
  
  return results;
}

autoSaveToProject(calcId, inputs, results) {
  // Create project if none exists
  if (!AppState.activeProject) {
    const newProject = Projects.create({
      name: `Project ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      calculations: {}
    });
    AppState.activeProject = newProject.id;
    Projects.updateCount();
  }
  
  // Save calculation to project
  const project = Projects.get(AppState.activeProject);
  if (!project.calculations) project.calculations = {};
  
  project.calculations[calcId] = {
    inputs,
    results,
    savedAt: new Date().toISOString(),
    shopLinksClicked: [] // Track which shop links user clicks
  };
  
  // Update project totals
  this.updateProjectTotals(project, calcId, inputs, results);
  
  Projects.update(AppState.activeProject, project);
  
  // Subtle feedback (not intrusive toast)
  this.showAutoSaveIndicator();
}

showAutoSaveIndicator() {
  const indicator = document.getElementById('autosave-indicator');
  if (indicator) {
    indicator.classList.add('is-saving');
    indicator.textContent = '✓ Auto-saved';
    setTimeout(() => {
      indicator.classList.remove('is-saving');
    }, 2000);
  }
}
```

### UI Changes for Auto-Save

```html
<!-- Replace "Save to Project" button with auto-save indicator -->
<div class="calc-results__actions">
  <!-- Auto-save indicator (replaces manual save button) -->
  <div class="autosave-indicator" id="autosave-indicator">
    <span class="autosave-icon">💾</span>
    <span class="autosave-text">Auto-saved to project</span>
  </div>
  
  <!-- Keep export button -->
  <button type="button" class="btn btn--ghost btn--sm" onclick="TillerApp.downloadCalcPDF('${calcId}')">
    📄 Export PDF
  </button>
  
  <!-- NEW: View Project button -->
  <a href="#/projects" class="btn btn--secondary btn--sm">
    📁 View Project
  </a>
</div>
```

### Auto-Save Settings (User Control)

```javascript
// Settings panel option
AppState.settings = {
  autoSave: true,           // Default ON
  autoSaveDelay: 0,         // Immediate (can add debounce)
  createProjectOnFirstCalc: true, // Auto-create project
  notifications: true,
  darkMode: true,
  units: 'imperial'
};
```

Users who want manual control can disable in Settings, but default is auto-save ON.

### Project Structure with Auto-Saved Calculations

```javascript
// Enhanced project structure
{
  id: 'proj-001',
  name: 'Master Bath Remodel',
  createdAt: '2026-01-20T10:00:00Z',
  updatedAt: '2026-01-20T14:30:00Z',
  
  // Auto-populated from calculations
  totalArea: 85,  // From tile calc
  estimatedCost: 2450, // Aggregated from all calcs
  
  // All calculations auto-saved
  calculations: {
    tile: {
      inputs: { area: 85, tileWidth: 12, tileHeight: 24, waste: 12 },
      results: { tilesNeeded: 47, boxes: 5, wasteAmount: 5 },
      savedAt: '2026-01-20T10:05:00Z',
      shopLinksClicked: ['homedepot', 'flooranddecor']
    },
    mortar: {
      inputs: { area: 85, trowelSize: '1/2-sq', backButter: true },
      results: { bags: 4, coverage: 21.25 },
      savedAt: '2026-01-20T10:08:00Z'
    },
    grout: {
      inputs: { ... },
      results: { ... },
      savedAt: '2026-01-20T10:12:00Z'
    }
  },
  
  // Shopping list auto-generated
  shoppingList: [
    { item: '12×24 Porcelain Tile', qty: 5, unit: 'boxes', source: 'tile-calc' },
    { item: 'Large Format Thin-Set', qty: 4, unit: 'bags', source: 'mortar-calc' },
    { item: 'Sanded Grout', qty: 2, unit: 'bags', source: 'grout-calc' }
  ],
  
  // Retailer links clicked (for analytics)
  retailerClicks: [
    { retailer: 'homedepot', product: 'mortar', timestamp: '2026-01-20T10:10:00Z' }
  ]
}

---

## 📊 Success Metrics

| Metric | Current | Target (6 months) |
|--------|---------|-------------------|
| Calculator Usage | ~500/month | 2,000/month |
| Avg. Session Duration | 3 min | 12 min |
| Projects Saved | 200 | 2,000 |
| Product Searches | 0 | 5,000/month |
| Design Tools Usage | 0 | 1,500/month |
| 3D Visualizer Sessions | 0 | 500/month |
| Shopping List Exports | 0 | 1,000/month |

---

## 💰 Monetization Opportunities

1. **Affiliate Revenue** (Existing, Enhanced)
   - Product finder → Amazon/retailer affiliate links
   - "Buy these tiles" from calculator results

2. **Premium Features** (Future)
   - Unlimited project saves
   - HD 3D renders
   - Priority support
   - Contractor network access

3. **Lead Generation** (Future)
   - Connect homeowners with local contractors
   - Material supplier partnerships

---

## 📅 Implementation Timeline

| Phase | Features | Duration | Target Date |
|-------|----------|----------|-------------|
| **Phase 1** | Product Finder (Search, Database, Suppliers) | 4 weeks | Feb 2026 |
| **Phase 2** | Design Tools (Pattern Designer, Color Palette, Room Planner) | 4 weeks | Mar 2026 |
| **Phase 3** | Virtual Showroom (3D Visualizer, AR Preview) | 8 weeks | May 2026 |
| **Phase 4** | Project Tools (Shopping List, Timeline, Budget) | 4 weeks | Jun 2026 |
| **Phase 5** | Polish & Integration | 4 weeks | Jul 2026 |

---

## ✅ Next Steps (Immediate Actions)

### Week 1 Tasks
1. [ ] Create `_data/tile-catalog.yml` with 50 popular tile entries
2. [ ] Create `_data/material-catalog.yml` with mortar/grout products
3. [ ] Design Product Finder UI mockups
4. [ ] Update `tools-app.js` with new category structure
5. [ ] Create placeholder routes for new sections

### Research Tasks
- [ ] Evaluate Three.js vs Babylon.js for 3D
- [ ] Research WebXR browser support
- [ ] Identify potential retailer API partnerships
- [ ] Survey users on most-wanted features

---

## 🎯 Quick Wins (Can Ship This Week)

1. **Auto-Save on Every Calculation** ⭐ PRIORITY
   - Remove "Save to Project" button requirement
   - Auto-create project on first calculation
   - Show subtle "✓ Auto-saved" indicator
   - Add "View Project" link in results

2. **Shop Links After Calculator Results** ⭐ PRIORITY
   - Add "🛒 Shop This Material" section below every result
   - Links to: Home Depot, Lowe's, Floor & Decor, Amazon
   - Include "📍 Find Local Suppliers" button
   - Track clicks for analytics

3. **Global Product Search Bar**
   - Add search input to header
   - Type-ahead suggestions
   - Results open retailer comparison

4. **Shopping List Auto-Generation**
   - Pull items from all calculator results
   - Group by material type
   - Export as printable PDF

---

## 🔧 Implementation: Auto-Save + Shop Links

### File Changes Required

#### 1. `assets/js/tools-app.js` Updates

```javascript
// Add retailer configuration
const RETAILERS = {
  homedepot: {
    name: 'Home Depot',
    icon: '🏠',
    searchUrl: (term) => `https://www.homedepot.com/s/${encodeURIComponent(term)}`
  },
  lowes: {
    name: "Lowe's",
    icon: '🔵',
    searchUrl: (term) => `https://www.lowes.com/search?searchTerm=${encodeURIComponent(term)}`
  },
  flooranddecor: {
    name: 'Floor & Decor',
    icon: '🏪',
    searchUrl: (term) => `https://www.flooranddecor.com/search?q=${encodeURIComponent(term)}`
  },
  amazon: {
    name: 'Amazon',
    icon: '📦',
    searchUrl: (term) => `https://www.amazon.com/s?k=${encodeURIComponent(term)}&tag=tillerstead-20`
  }
};

// Shop search terms by calculator
const SHOP_SEARCH_TERMS = {
  tile: (inputs) => `${inputs.tileWidth}x${inputs.tileHeight} tile`,
  mortar: (inputs) => inputs.backButter ? 'large format thin-set mortar' : 'thin-set mortar',
  grout: (inputs) => inputs.jointWidth > 0.125 ? 'sanded grout' : 'unsanded grout',
  leveling: () => 'self-leveling underlayment',
  waterproof: () => 'waterproof membrane',
  slope: () => 'deck mud mortar',
  'heated-floor': (inputs) => `radiant floor heat ${inputs.voltage}v`
};
```

#### 2. New CSS for Shop Links

```css
/* Shop Links Section */
.calc-results__shop {
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background: var(--app-surface-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--app-border);
}

.calc-results__shop h5 {
  margin: 0 0 var(--space-sm);
  font-size: 0.875rem;
  color: var(--app-text-muted);
}

.shop-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.shop-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--app-surface-3);
  border: 1px solid var(--app-border);
  border-radius: var(--radius-sm);
  color: var(--app-text);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.shop-link:hover {
  background: var(--app-primary-muted);
  border-color: var(--app-primary);
  color: var(--app-primary);
}

.shop-link--local {
  background: var(--app-gold-muted);
  border-color: var(--app-gold);
}

/* Auto-save indicator */
.autosave-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: var(--app-text-muted);
  opacity: 0.7;
  transition: opacity var(--transition-base);
}

.autosave-indicator.is-saving {
  opacity: 1;
  color: var(--app-primary);
}

.autosave-indicator .autosave-icon {
  animation: pulse 0.5s ease-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

---

*This plan positions TillerPro as the go-to tile project companion — from discovery to design to delivery.*
