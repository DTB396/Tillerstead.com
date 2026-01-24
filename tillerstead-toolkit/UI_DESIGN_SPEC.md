# Premium Calculator Interface Design
## Tillerstead Toolkit UX/UI Specifications

---

## 🎨 Design System

### Color Palette (Dark Theme)
```css
/* Primary Brand Colors */
--emerald-500: #10b981;      /* Primary CTA, success */
--emerald-600: #059669;      /* Hover states */
--gold-500: #c9a227;         /* Accents, highlights */

/* Category Colors */
--tile-emerald: #10b981;     /* Tile Installation */
--water-blue: #3b82f6;       /* Waterproofing */
--substrate-amber: #f59e0b;  /* Substrate Prep */
--grout-gold: #c9a227;       /* Grouting */
--trim-purple: #8b5cf6;      /* Trim */
--nj-red: #dc2626;           /* NJ Compliance */

/* Surface Colors */
--app-bg: #0f1110;           /* Main background */
--app-surface: #1a1c1a;      /* Card background */
--app-surface-2: #242624;    /* Elevated cards */
--app-border: rgba(255, 255, 255, 0.12);

/* Text Colors */
--text-primary: #ffffff;
--text-muted: rgba(255, 255, 255, 0.85);
--text-dim: rgba(255, 255, 255, 0.7);
```

### Typography
```css
/* Headings */
--font-heading: 'Inter', 'Manrope', system-ui, sans-serif;
--font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Sizes */
--text-xs: 0.75rem;      /* 12px - Labels */
--text-sm: 0.875rem;     /* 14px - Body small */
--text-base: 1rem;       /* 16px - Body */
--text-lg: 1.125rem;     /* 18px - Subheadings */
--text-xl: 1.25rem;      /* 20px - Card titles */
--text-2xl: 1.5rem;      /* 24px - Section headers */
--text-3xl: 1.875rem;    /* 30px - Page titles */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## 📱 Layout Structure

### Page Hierarchy
```
┌─────────────────────────────────────────┐
│ App Header (Sticky)                     │
│ ┌─────────────────┬──────────────────┐ │
│ │ Logo            │ Search   Profile │ │
│ └─────────────────┴──────────────────┘ │
├─────────────────────────────────────────┤
│ Breadcrumbs / Quick Access              │
├─────────────────────────────────────────┤
│ Main Content Area                       │
│ ┌───────────────────────────────────┐  │
│ │ [Dynamic Content]                 │  │
│ │ - Home Dashboard                  │  │
│ │ - Category Browser                │  │
│ │ - Calculator Interface            │  │
│ │ - Results View                    │  │
│ └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│ Footer (Minimal)                        │
└─────────────────────────────────────────┘
```

### Mobile Responsive (< 768px)
```
┌──────────────────────┐
│ ☰ Logo     Search 🔍 │  <- Compact header
├──────────────────────┤
│ [Full-width content] │  <- Stack everything
│                      │
│ ┌──────────────────┐ │
│ │  Category Card   │ │  <- Touch-optimized
│ │  (Full width)    │ │     48px min height
│ └──────────────────┘ │
│                      │
│ [FAB: Recent Tools]  │  <- Floating button
└──────────────────────┘
```

---

## 🏠 Home Dashboard

### Hero Section
```html
┌─────────────────────────────────────────────┐
│  🏗️ TillerPro Calculators                  │
│  Professional tools for South Jersey pros   │
│                                              │
│  [🔍 Search calculators...]                 │
│                                              │
│  ⭐ Featured: NJ Compliance Tools           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ HIC      │ │ Sales    │ │ Permit   │   │
│  │ Contract │ │ Tax      │ │ Estimate │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────┘
```

### Category Grid (Desktop 3-4 cols, Mobile 1-2 cols)
```html
┌─────────────────────────────────────┐
│ Browse by Category                  │
├──────────┬──────────┬──────────────┤
│ 🔲 TILE  │ 💧 WATER │ 🏗️ SUBSTRATE │
│ 42 tools │ 15 tools │ 18 tools     │
│          │          │              │
│ Popular: │ Popular: │ Popular:     │
│ · Floor  │ · Liquid │ · Leveler    │
│ · Wall   │ · Shower │ · Backer     │
└──────────┴──────────┴──────────────┘
```

### Quick Access
```html
┌─────────────────────────────────────┐
│ 🕐 Recently Used                    │
│ ┌─────────────────────────────────┐│
│ │ Tile Floor (2 min ago)          ││
│ │ NJ Sales Tax (1 hour ago)       ││
│ │ Large Format Tile (Today)       ││
│ └─────────────────────────────────┘│
│                                     │
│ ⭐ Favorites (0)                    │
│ └─ Add favorites for quick access  │
└─────────────────────────────────────┘
```

---

## 📂 Category Browser

### Category Header
```html
┌───────────────────────────────────────────┐
│ ← Back to Categories                      │
├───────────────────────────────────────────┤
│ 🔲 Tile Installation                      │
│ Professional tile calculations & planning │
│                                            │
│ 42 calculators · TCNA Compliant           │
└───────────────────────────────────────────┘
```

### Calculator Cards (Grid)
```html
┌─────────────────────────────────────┐
│ 🔥 Tile Floor Calculator            │  <- Badge
│ ─────────────────────────────────── │
│ Calculate tiles, mortar, and grout  │
│ for floor installations             │
│                                      │
│ ⏱️ 2 min  ✓ TCNA  ⭐ Popular       │  <- Metadata
│                                      │
│ [Calculate →]                        │  <- CTA
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🆕 Large Format Tile                │
│ ─────────────────────────────────── │
│ Special calculator for tiles >15"   │
│ Includes lippage control system     │
│                                      │
│ ⏱️ 3 min  ✓ TCNA  🆕 New           │
│                                      │
│ [Calculate →]                        │
└─────────────────────────────────────┘
```

---

## 🧮 Calculator Interface

### Layout (2-Column Desktop, Stack Mobile)

```html
┌─────────────────────────────────────────────────────┐
│ ← Back to Tile Installation                         │
├─────────────────────────────────────────────────────┤
│ 🔲 Tile Floor Calculator                            │
│ Calculate tiles, mortar, and grout                  │
├──────────────────────┬──────────────────────────────┤
│ INPUT PANEL (Left)   │ RESULTS PANEL (Right)        │
│                      │                              │
│ Floor Area (sqft)    │ 📊 Materials Summary         │
│ ┌──────────────────┐│ ─────────────────────────── │
│ │ 150              ││ 🔲 Tiles Needed: 172         │
│ └──────────────────┘│ 🪣 Thinset: 4 bags (50lb)    │
│                      │ ✨ Grout: 2 bags (25lb)      │
│ Tile Size            │                              │
│ ┌─────┬─────┬─────┐│ 💰 Estimated Cost: $XXX      │
│ │ 12" │ 18" │ 24" ││ (if products in database)    │
│ └─────┴─────┴─────┘│                              │
│                      │ [📥 Export PDF]              │
│ Waste %              │ [💾 Save Project]            │
│ ┌──────────────────┐│ [🔄 Reset]                   │
│ │ 10%     [▓▓▓  ] ││                              │
│ └──────────────────┘│                              │
│                      │                              │
│ [🧮 Calculate]       │                              │
└──────────────────────┴──────────────────────────────┘
```

### Mobile Stack Version
```html
┌────────────────────────┐
│ ← Tile Floor Calc      │
├────────────────────────┤
│ INPUTS                 │
│ ┌────────────────────┐ │
│ │ Area: 150 sqft     │ │
│ │ Tile: 12"×12"      │ │
│ │ Waste: 10%         │ │
│ └────────────────────┘ │
│                        │
│ [Calculate]            │
├────────────────────────┤
│ RESULTS (Expandable)   │
│ ▼ Materials Summary    │
│   · Tiles: 172         │
│   · Thinset: 4 bags    │
│   · Grout: 2 bags      │
│                        │
│ [Export] [Save] [⋮]    │
└────────────────────────┘
```

---

## 🎯 Input Field Components

### Text Input
```html
<div class="input-group">
  <label>
    Floor Area (sqft)
    <span class="tooltip">ⓘ</span>
  </label>
  <input 
    type="number" 
    placeholder="150"
    min="0"
    step="0.1"
  />
  <span class="helper-text">Measure length × width</span>
</div>
```

### Button Group (Tile Size Selector)
```html
<div class="button-group">
  <button class="btn-option active">12"×12"</button>
  <button class="btn-option">18"×18"</button>
  <button class="btn-option">24"×24"</button>
  <button class="btn-option">Custom</button>
</div>
```

### Slider Input
```html
<div class="slider-group">
  <label>Waste Percentage</label>
  <input 
    type="range" 
    min="5" 
    max="25" 
    value="10" 
    step="1"
  />
  <output>10%</output>
</div>
```

### Dropdown Select
```html
<div class="select-group">
  <label>Trowel Size</label>
  <select>
    <option>1/4" × 1/4" (Small tile)</option>
    <option selected>1/2" × 1/2" (Large tile)</option>
    <option>3/4" × 3/4" (Extra large)</option>
  </select>
</div>
```

---

## 📊 Results Display

### Summary Card
```html
┌─────────────────────────────────────┐
│ 📊 Materials Summary                │
│ ─────────────────────────────────── │
│                                      │
│ 🔲 Tiles Needed                     │
│    172 tiles (12"×12")              │
│    → 172 sqft coverage              │
│    → Includes 10% waste             │
│                                      │
│ 🪣 Thinset Mortar                   │
│    4 bags (50lb)                    │
│    → 1/2"×1/2" trowel               │
│    → ~43 sqft/bag coverage          │
│                                      │
│ ✨ Grout                             │
│    2 bags (25lb sanded)             │
│    → 1/4" joint width               │
│                                      │
│ 💡 Recommendations                   │
│ ✓ Use medium bed mortar for large   │
│   format tiles                       │
│ ⚠️ Back-butter all tiles for proper │
│   coverage                           │
│                                      │
│ 💰 Estimated Material Cost          │
│    Tiles: $XXX (if priced)          │
│    Mortar: $XX                      │
│    Grout: $XX                       │
│    ────────────────                 │
│    Total: $XXX                      │
└─────────────────────────────────────┘
```

### Detailed Line Items (Expandable)
```html
┌─────────────────────────────────────┐
│ ▼ Detailed Materials List           │
│ ─────────────────────────────────── │
│                                      │
│ Item              Qty    Unit  Cost │
│ ───────────────────────────────────│
│ 12×12 Porcelain  172    tiles  $XXX│
│ Thinset 50lb       4    bags   $XX │
│ Grout 25lb         2    bags   $XX │
│ Grout Sealer     0.5    qt     $XX │
│                                      │
│ Sub-Total:                     $XXX │
│ Tax (6.625%):                  $XX  │
│ ─────────────────────────────────── │
│ Total:                         $XXX │
└─────────────────────────────────────┘
```

### Warnings & Tips (Accordion)
```html
┌─────────────────────────────────────┐
│ ⚠️ Important Notes                  │
│ ─────────────────────────────────── │
│ ▼ TCNA Requirements                 │
│   · Substrate must be flat within   │
│     1/8" in 10'                     │
│   · Use appropriate trowel size     │
│                                      │
│ ▼ Installation Tips                 │
│   · Mix thinset in small batches    │
│   · Check for 95% coverage          │
│   · Use spacers for consistent gaps │
└─────────────────────────────────────┘
```

---

## 🔍 Search Interface

### Search Bar (Always Visible)
```html
┌─────────────────────────────────────┐
│ 🔍 Search calculators...            │
│     ┌─────────────────────────────┐│
│     │ tile floor                  ││
│     └─────────────────────────────┘│
│                                      │
│ Recent Searches:                    │
│ · grout                             │
│ · NJ sales tax                      │
│ · waterproofing                     │
└─────────────────────────────────────┘
```

### Search Results (Real-time)
```html
┌─────────────────────────────────────┐
│ 5 results for "tile floor"          │
│ ─────────────────────────────────── │
│                                      │
│ 🔲 Tile Floor Calculator            │
│ Tile Installation · 🔥 Popular      │
│                                      │
│ 🔲 Large Format Tile                │
│ Tile Installation · 🆕 New          │
│                                      │
│ 🏗️ Self-Leveling Compound          │
│ Substrate Prep                      │
│ └─ Prepare floor for tile install  │
└─────────────────────────────────────┘
```

---

## 🎨 Component Library

### Buttons
```css
/* Primary CTA */
.btn-primary {
  background: var(--emerald-500);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  min-height: 48px; /* Touch target */
}

/* Secondary */
.btn-secondary {
  background: var(--app-surface-2);
  border: 1px solid var(--app-border);
}

/* Ghost */
.btn-ghost {
  background: transparent;
  border: 1px solid var(--app-border);
}

/* Icon Button */
.btn-icon {
  width: 48px;
  height: 48px;
  padding: 12px;
  border-radius: 50%;
}
```

### Cards
```css
.card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.card-header {
  border-bottom: 1px solid var(--app-border);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
```

### Badges
```css
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-new { background: #ef4444; color: white; }
.badge-popular { background: #f59e0b; color: white; }
.badge-featured { background: #8b5cf6; color: white; }
.badge-tcna { background: #10b981; color: white; }
```

---

## 📱 Mobile Optimizations

### Touch Targets
- Minimum 48×48px for all interactive elements
- Spacing between touch targets: 8px minimum

### Gestures
- Swipe left/right to navigate between categories
- Pull-to-refresh on calculator list
- Tap-to-expand accordion sections

### FAB (Floating Action Button)
```html
<!-- Bottom-right corner -->
<button class="fab" aria-label="Recent tools">
  🕐
</button>

<!-- Expands to show recent/favorites -->
<div class="fab-menu">
  <a>Tile Floor</a>
  <a>NJ Sales Tax</a>
  <a>Grout Calc</a>
</div>
```

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance
- Color contrast ratio ≥ 4.5:1 for text
- Color contrast ratio ≥ 3:1 for UI components
- Keyboard navigation support
- ARIA labels for all interactive elements
- Focus indicators (3px emerald outline)

### Screen Reader Support
```html
<button aria-label="Calculate tile floor requirements">
  Calculate
</button>

<div role="status" aria-live="polite">
  Calculation complete. Results updated.
</div>
```

---

This premium interface positions Tillerstead as a professional-grade tool while remaining approachable for all skill levels! 🚀
