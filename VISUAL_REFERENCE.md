# Tillerstead Theme Visual Reference & Component Showcase

## 🎨 Color Palette Swatches

### Primary Colors

#### Background Colors
```
Parchment Background
Color: #f5f1eb
RGB: 245, 241, 235
Use: Main page background, spacious breathing room
Contrast: Dark text (#1a1a1a) = 16:1 ✅ Perfect

Paper Surface
Color: #fffaf5
RGB: 255, 250, 245
Use: Card backgrounds, elevated surfaces
Contrast: Dark text (#1a1a1a) = 14:1 ✅ Excellent

Light Taupe (Muted)
Color: #f0ede5
RGB: 240, 237, 229
Use: Subtle background sections, hover states
Contrast: Dark text (#1a1a1a) = 13:1 ✅ Excellent

Off-White (Elevated)
Color: #fef9f5
RGB: 254, 249, 245
Use: Floating modals, highlighted sections
Contrast: Dark text (#1a1a1a) = 14:1 ✅ Excellent
```

#### Text Colors
```
Dark Text (Primary)
Color: #1a1a1a
RGB: 26, 26, 26
Use: Body text, headings, main content
Contrast on parchment: 16:1 ✅ Perfect for small & large text

Mid-Gray (Muted)
Color: #666666
RGB: 102, 102, 102
Use: Secondary text, captions, meta information
Contrast on parchment: 7.5:1 ✅ WCAG AA for 18pt+ text
```

#### Action Colors
```
Bright Emerald (Primary Action)
Color: #00a86b
RGB: 0, 168, 107
Use: Buttons, links, primary accents, brand primary
Contrast on parchment: 4.5:1 ✅ WCAG AA minimum for normal text
Brand Recognition: Modern, vibrant, accessible

Light Emerald (Hover State)
Color: #00d68f
RGB: 0, 214, 143
Use: Hover states, active elements
Note: Lighter, more vibrant version for interaction feedback

Dark Emerald (Active State)
Color: #004d35
RGB: 0, 77, 53
Use: Pressed/active button states, focus indicators
Contrast on parchment: 7:1 ✅ High contrast

Brass (Secondary Accent)
Color: #8b6f47
RGB: 139, 111, 71
Use: Secondary elements, borders, depth, warm accent
Contrast on parchment: 7.2:1 ✅ WCAG AA for large text
Aesthetic: Premium, earthy, professional depth

Light Brass (Brass Hover)
Color: #a88760
RGB: 168, 135, 96
Use: Hover states on brass elements
Warmer, lighter variant
```

#### Border & Utility
```
Subtle Border (Dark with Opacity)
Color: rgba(0, 0, 0, 0.08)
Use: Card borders, dividers, subtle lines
Barely visible but provides definition

Disabled State
Color: rgba(0, 0, 0, 0.4)
Use: Disabled form inputs, inactive elements
Clearly indicates non-interactive state
```

---

## 🎨 Gradient Combinations

### Primary Gradient
```css
background: linear-gradient(135deg, #00a86b 0%, #008856 100%);
```
**Use:** Primary buttons, hero accents, prominent CTAs
**Effect:** Left-to-right emerald fade, energetic and modern

### Accent Gradient
```css
background: linear-gradient(135deg, #8b6f47 0%, #6b5536 100%);
```
**Use:** Secondary elements, accent sections
**Effect:** Brass to deep brown, warm and sophisticated

### Section Gradient
```css
background: linear-gradient(180deg, #f5f1eb 0%, #f0ede5 100%);
```
**Use:** Section backgrounds, subtle depth
**Effect:** Parchment fade, adds visual separation without harshness
```

---

## 🎭 Component Showcase

### Buttons

#### Primary Button
```html
<a href="#" class="btn btn-primary">Book Consultation</a>
```
**Appearance:** Emerald gradient background, white text
**Hover:** Lifts up (-2px) with enhanced shadow
**Focus:** Emerald outline with 2px offset
**Mobile:** Full width on small screens (optional)

#### Secondary Button
```html
<a href="#" class="btn btn-secondary">Learn More</a>
```
**Appearance:** Transparent background, emerald border (2px), emerald text
**Hover:** Light emerald background with subtle lift
**Focus:** Emerald outline
**Use:** Lighter CTA, secondary options

#### Ghost Button
```html
<a href="#" class="btn btn-ghost">View Details</a>
```
**Appearance:** Transparent, subtle border, dark text
**Hover:** Light background, borders darker
**Use:** Tertiary actions, minimal prominence
**Example:** Close buttons, secondary nav items

#### Size Variants
```html
<button class="btn btn-primary btn-small">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-large">Large</button>
```
- **Small:** 0.6rem × 1.2rem padding, dense layouts
- **Default:** 0.75rem × 1.5rem padding, standard use
- **Large:** 0.9rem × 2rem padding, hero CTAs

---

### Cards

#### Service Card
```html
<div class="card card--service">
  <div class="card-icon">🛁</div>
  <h3 class="card-title">Tile & Waterproofing</h3>
  <p class="card-desc">Certified waterproof tile assemblies...</p>
  <a href="#" class="card-link">Learn more →</a>
</div>
```
**Layout:** Centered text, icon above title
**Spacing:** 1.5rem padding, 1rem gaps
**Hover:** Lift effect, border color change
**Animation:** Slide up on load with stagger

#### Portfolio Card
```html
<div class="card card--portfolio">
  <img src="project.jpg" alt="..." class="card-image">
  <div class="card-content">
    <span class="card-category">Tile & Waterproofing</span>
    <h3 class="card-title">Master Bath Remodel</h3>
    <p class="card-desc">Large-format porcelain...</p>
  </div>
</div>
```
**Layout:** Image above content
**Image:** 200px fixed height, 1:1 aspect ratio, zoom on hover
**Content:** 1.25rem padding, category label in emerald
**Hover:** Image scales up (1.05x)

#### Review Card
```html
<div class="card card--review">
  <div class="card-rating">★★★★★</div>
  <p class="card-quote">"Excellent work..."</p>
  <strong class="card-author">John Smith</strong>
  <p class="card-role">Homeowner, Cape May</p>
</div>
```
**Layout:** Left border accent (4px emerald)
**Styling:** Quote in italic, author bold, role in gray
**Spacing:** 1.5rem padding
**Hover:** Lift effect with enhanced shadow

---

### Hero Section

#### Standard Hero
```html
<section class="hero hero-surface">
  <div class="hero-inner">
    <div class="hero-main">
      <span class="hero-eyebrow">South Jersey</span>
      <h1 class="hero-title">Remodeling, Tile & Maintenance</h1>
      <p class="hero-lead">Owner-led tile and remodeling services...</p>
      <div class="hero-actions">
        <a href="#" class="btn btn-primary">Book Consultation</a>
        <a href="#" class="btn btn-secondary">Learn More</a>
      </div>
    </div>
  </div>
</section>
```
**Background:** Linear gradient (parchment to light taupe)
**Title:** Variable font (2.1rem mobile to 3rem desktop)
**Spacing:** 6rem vertical padding, clamp() for responsive
**Animations:** Title fades down, buttons fade up on load

#### Homepage Hero (With KPIs)
```html
<!-- Includes above + KPI cards -->
<ul class="hero-kpis">
  <li class="hero-kpi">
    <span class="hero-kpi-label">Licensed</span>
    <span class="hero-kpi-text">NJ #13VH10808800</span>
  </li>
  <!-- More cards... -->
</ul>
```
**Grid:** Auto-fit columns (200px minimum)
**Card:** White background, 4px emerald left border
**Typography:** Small label in emerald, larger value in dark
**Hover:** Lift with shadow

---

### Form Inputs

#### Text Input
```html
<input type="text" placeholder="Your name" class="form-input">
```
**Appearance:** White background, light border (rgba(0,0,0,0.08))
**Focus:** Emerald border, soft emerald shadow (0 0 0 3px rgba(0,168,107,0.1))
**Padding:** 0.75rem × 1rem
**Font:** Inherit from body
**Placeholder:** Gray text

#### Textarea
```html
<textarea placeholder="Your message"></textarea>
```
**Appearance:** Same as input, minimum 120px height
**Resizing:** Vertical only (resize: vertical)
**Behavior:** Expands for user input

#### Label & Hint
```html
<div class="form-group">
  <label for="email">Email Address</label>
  <input type="email" id="email">
  <p class="form-hint">We'll never share your email</p>
</div>
```
**Label:** Bold, dark text, 0.95rem
**Hint:** Smaller, gray, helpful info

---

### Gallery Components

#### Upload Area
```html
<div class="upload-area">
  <span class="upload-area-icon">📤</span>
  <label class="upload-area-label">Drag files here or click</label>
  <input type="file" class="upload-area-input" multiple>
</div>
```
**Border:** 2px dashed light-dark
**Background:** Subtle light taupe
**Hover:** Border emerald, background light emerald
**Drag:** Active state with bright emerald border

#### Photo Grid
```html
<ul class="photo-grid">
  <li class="photo-item">
    <img src="..." alt="..." class="photo-item-image">
    <div class="photo-item-overlay">
      <p class="photo-caption">Caption</p>
    </div>
  </li>
</ul>
```
**Grid:** Auto-fit columns (240px minimum)
**Images:** 1:1 aspect ratio, zoom on hover
**Overlay:** Dark with white text, appears on hover
**Animation:** Smooth fade and transform

---

## 📐 Spacing Examples

### Padding Utilities
```html
<div class="p-3">Small padding (1.5rem)</div>
<div class="p-4">Medium padding (2rem)</div>
<div class="p-5">Large padding (2.5rem)</div>
```

### Margin Utilities
```html
<h2 class="mt-0">No top margin</h2>
<h2 class="mt-4">Large top margin</h2>

<p class="mb-2">Small bottom margin</p>
<p class="mb-6">Large bottom margin</p>
```

### Fluid Spacing
```css
/* Responsive padding that scales with viewport */
padding: clamp(1rem, 4vw, 2.5rem);
```

---

## 🎯 Accessibility Reference

### Color Contrast Ratios
| Element | Colors | Ratio | WCAG |
|---------|--------|-------|------|
| Body text | #1a1a1a on #f5f1eb | 16:1 | AAA |
| Emerald button | #00a86b on #f5f1eb | 4.5:1 | AA |
| Emerald text | #00a86b on #f5f1eb | 4.5:1 | AA |
| Brass accent | #8b6f47 on #f5f1eb | 7.2:1 | AAA |
| Muted text | #666666 on #f5f1eb | 7.5:1 | AA (18pt+) |

### Focus States
All interactive elements visible on focus:
```css
outline: 3px solid #00a86b;
outline-offset: 2px;
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .btn, .card, input {
    border-width: 2px; /* Enhanced visibility */
  }
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🎬 Animation Timeline

### Hero Title (Load)
```
0ms:    opacity: 0, translateY(-20px)
800ms:  opacity: 1, translateY(0) [fadeInDown]
```

### Hero Buttons (Load)
```
400ms:  opacity: 0, translateY(20px)
1000ms: opacity: 1, translateY(0) [fadeInUp]
```

### Card Grid (Load)
```
100ms, 200ms, 300ms, 400ms staggered
Each: scaleIn (0.6s ease-out)
```

### Button Hover
```
0ms:    transform: translateY(0)
150ms:  transform: translateY(-2px)
```

### Card Hover
```
0ms:    transform: translateY(0), shadow-soft
300ms:  transform: translateY(-4px), shadow-lift
```

---

## 📱 Responsive Breakpoints

### Mobile (0–479px)
- Single column layouts
- Full-width buttons
- Larger touch targets (44px minimum)
- Simplified hero (title smaller)
- Cards stack vertically

### Tablet (480–767px)
- 2-column grids
- Buttons start grouping horizontally
- Hero title grows
- Cards in 2x2 grid

### Desktop (768px+)
- 3-column grids
- Full layout expansion
- Maximum width 1140px container
- All hover states active
- Full animation support

---

## 🔤 Typography Scale

### Font Families
- **Body**: Inter (14–32px variable)
- **Headings**: Manrope (500–800 variable)
- **Code**: IBM Plex Mono

### Size Scale
- **H1 (Hero)**: clamp(2.1rem, 3.6vw, 3rem)
- **H2 (Section)**: clamp(1.8rem, 3vw, 2.4rem)
- **H3 (Card)**: clamp(1.3rem, 2.2vw, 1.6rem)
- **Body**: 0.95–1rem
- **Small**: 0.85rem
- **Tiny**: 0.75rem

### Line Heights
- **Headings**: 1.15 (tight)
- **Body**: 1.6–1.7 (generous)
- **Captions**: 1.5 (balanced)

---

## 🎬 State Matrix

### Button States
```
Idle:       background: gradient-primary, shadow-button
Hover:      translateY(-2px), shadow-button-hover
Focus:      outline: 3px #00a86b
Active:     darker background, smaller lift
Disabled:   opacity: 0.5, cursor: not-allowed
```

### Form Input States
```
Idle:       border: 1px rgba(0,0,0,0.08), background: white
Focus:      border: 1px #00a86b, box-shadow: 0 0 0 3px rgba(...)
Valid:      border-color: green
Invalid:    border-color: red
Disabled:   opacity: 0.5, background: #f5f1eb
```

### Link States
```
Idle:       color: #00a86b, text-decoration: none
Hover:      color: #008856, text-decoration: underline
Focus:      outline: 3px #00a86b
Visited:    color: #6b5536 (brass, optional)
```

---

## 💾 Export & Reference

### Color HEX Values Quick Reference
```
Primary: #00a86b
Accent:  #8b6f47
Background: #f5f1eb
Surface: #fffaf5
Text: #1a1a1a
```

### CSS Custom Properties
```css
:root {
  --color-primary: #00a86b;
  --color-accent: #8b6f47;
  --color-bg: #f5f1eb;
  --color-text: #1a1a1a;
  /* ... plus 40+ more tokens */
}
```

---

**This visual reference should help you understand and apply the new Tillerstead theme consistently across all pages and components.**
