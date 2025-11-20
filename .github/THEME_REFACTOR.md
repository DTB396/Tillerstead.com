# Tillerstead Refactored Theme System

## Overview

The Tillerstead website has been completely refactored from a dark navy theme to a modern, minimal light parchment theme with bright emerald accents, brass depth, and card-based component system.

**Design Philosophy:**
- **Parchment Base**: Warm, paper-like background (#f5f1eb) for welcoming, professional feel
- **Bright Emerald**: Primary action color (#00a86b) for high contrast and accessibility
- **Brass Accent**: Warm brown (#8b6f47) for secondary elements and depth
- **Minimal + Fancy**: Clean structure with subtle animations and modern card layouts
- **Card-First**: Component-based system emphasizing structured content and visual hierarchy

## Color Palette

### Primary Colors
- **Background**: `#f5f1eb` (parchment)
- **Surface**: `#fffaf5` (paper white)
- **Surface Muted**: `#f0ede5` (light taupe)
- **Surface Elevated**: `#fef9f5` (off-white)
- **Text**: `#1a1a1a` (dark)
- **Text Muted**: `#666666` (mid-gray)
- **Heading**: `#1a1a1a` (dark, same as text)

### Action Colors
- **Primary**: `#00a86b` (bright emerald) — Main CTA, interactive elements
- **Primary Light**: `#00d68f` (lighter emerald) — Hover states
- **Primary Strong**: `#004d35` (dark emerald) — Active/focus states
- **Accent**: `#8b6f47` (brass) — Secondary elements, borders, accents
- **Accent Light**: `#a88760` (lighter brass) — Hover states

### Border & Divider
- **Border**: `rgba(0, 0, 0, 0.08)` (subtle dark)

## Gradients

All gradients are minimal and light-theme optimized:

```css
--gradient-primary: linear-gradient(135deg, #00a86b 0%, #008856 100%);
--gradient-accent: linear-gradient(135deg, #8b6f47 0%, #6b5536 100%);
--gradient-section: linear-gradient(180deg, #f5f1eb 0%, #f0ede5 100%);
```

## Shadows

Light-theme shadows (reduced blur, subtle opacity):

```css
--shadow-soft: 0 2px 4px rgba(26, 26, 26, 0.08);
--shadow-lift: 0 8px 16px rgba(26, 26, 26, 0.12);
--shadow-sharp: 0 12px 32px rgba(26, 26, 26, 0.15);
--shadow-button: 0 6px 16px rgba(0, 168, 107, 0.24);
--shadow-button-hover: 0 10px 24px rgba(0, 168, 107, 0.32);
--shadow-glow: 0 0 24px rgba(0, 168, 107, 0.28);
```

## Typography

### Font Stack
- **Body**: Inter 14–32px (sans-serif, variable)
- **Headings**: Manrope 500–800 (sans-serif, variable)
- **Monospace**: IBM Plex Mono (code, technical content)

### Heading Sizes
- **H1**: `clamp(2.1rem, 3.6vw, 3rem)` — Hero titles
- **H2**: `clamp(1.8rem, 3vw, 2.4rem)` — Section headings
- **H3**: `clamp(1.3rem, 2.2vw, 1.6rem)` — Subheadings
- **H4–H6**: Standard sizes as defined in `tokens.css`

## Spacing System

Consistent spacing scale (8px base):

```css
--space-1: 0.5rem (8px)
--space-2: 1rem (16px)
--space-3: 1.5rem (24px)
--space-4: 2rem (32px)
--space-5: 2.5rem (40px)
--space-6: 3rem (48px)
--space-8: 4rem (64px)
--space-12: 6rem (96px)
```

## Component System

### Hero Component (`hero-refactored.css`)
Modern, minimal hero section:

```html
<section class="hero hero-surface">
  <div class="hero-inner">
    <div class="hero-main">
      <span class="hero-eyebrow">Eyebrow text</span>
      <h1 class="hero-title">Hero title</h1>
      <p class="hero-lead">Lead paragraph</p>
      <div class="hero-actions">
        <a href="#" class="btn btn-primary">Primary CTA</a>
        <a href="#" class="btn btn-secondary">Secondary CTA</a>
      </div>
      <!-- Homepage only: KPI cards -->
      <ul class="hero-kpis">
        <li class="hero-kpi">
          <span class="hero-kpi-label">Label</span>
          <span class="hero-kpi-text">Value</span>
        </li>
      </ul>
    </div>
  </div>
</section>
```

**Features:**
- Eyebrow with emerald border
- Large, bold title (variable font sizing)
- KPI grid (conditional to homepage)
- Smooth animations (prefers-reduced-motion aware)
- Fully responsive

### Card System (`cards.css`)
Reusable card components with variants:

#### Service Cards
```html
<li class="card card--service">
  <div class="card-icon">🛁</div>
  <h3 class="card-title">Service title</h3>
  <p class="card-desc">Description text</p>
  <a href="#" class="card-link">Learn more →</a>
</li>
```

#### Portfolio Cards
```html
<li class="card card--portfolio">
  <img src="..." alt="..." class="card-image" loading="lazy">
  <div class="card-content">
    <span class="card-category">Category</span>
    <h3 class="card-title">Project title</h3>
    <p class="card-desc">Description</p>
  </div>
</li>
```

#### Review Cards
```html
<li class="card card--review">
  <div class="card-rating">★★★★★</div>
  <p class="card-quote">"Quote text"</p>
  <strong class="card-author">Author Name</strong>
  <p class="card-role">Client title</p>
</li>
```

**Grid Utilities:**
- `.cards--2col` — Responsive 2-column grid
- `.cards--3col` — Responsive 3-column grid
- `.cards--4col` — Responsive 4-column grid

### Gallery Component (`gallery.css`)
Media management and content showcase:

#### Upload Area
```html
<div class="upload-area">
  <span class="upload-area-icon">📤</span>
  <label class="upload-area-label">Drag files here or click to upload</label>
  <input type="file" class="upload-area-input" multiple>
</div>
```

#### Photo Grid
```html
<ul class="photo-grid">
  <li class="photo-item">
    <img src="..." alt="..." class="photo-item-image" loading="lazy">
    <div class="photo-item-overlay">
      <p class="photo-caption">Caption</p>
      <p class="photo-meta">Date or metadata</p>
    </div>
  </li>
</ul>
```

#### Trend Showcase
```html
<article class="trend-card">
  <img src="..." alt="..." class="trend-image" loading="lazy">
  <div class="trend-content">
    <span class="trend-label">Trend label</span>
    <h3 class="trend-title">Trend title</h3>
    <p class="trend-desc">Description</p>
    <div class="trend-meta">
      <div class="trend-meta-item">
        <span class="trend-meta-label">Label</span>
        <span class="trend-meta-value">Value</span>
      </div>
    </div>
  </div>
</article>
```

### Button Styles (`components-refactored.css`)

```html
<a href="#" class="btn btn-primary">Primary CTA</a>
<a href="#" class="btn btn-secondary">Secondary</a>
<a href="#" class="btn btn-ghost">Ghost</a>
<a href="#" class="btn btn-small">Small</a>
<a href="#" class="btn btn-large">Large</a>
```

**Classes:**
- `.btn-primary` — Full emerald gradient, white text
- `.btn-secondary` — Emerald border, emerald text
- `.btn-ghost` — Transparent, border, minimal
- `.btn-small` — Reduced padding for dense layouts
- `.btn-large` — Increased padding for hero CTAs

## CSS Architecture

### Layer Order (Load Order)
1. **tokens.css** — Design tokens (colors, spacing, typography, shadows)
2. **base.css** — Element resets, typography defaults, accessibility baseline
3. **layout.css** — Grid system, container, responsive utilities
4. **components-refactored.css** — Button, form, hero, utility classes
5. **hero-refactored.css** — Hero-specific styles
6. **cards.css** — Card component variants and grids
7. **gallery.css** — Gallery, upload, photo grid styles
8. **home-refactored.css** — Homepage section styles (plans, process, assurance)
9. **pattern-showcase.css** — Design system demo (optional)
10. **construction-banner.css** — Construction banner (optional)

### CSS Principles
- **Token-Driven**: All colors, spacing, shadows via CSS custom properties
- **Utility-First**: Spacing, text, shadow utilities for rapid development
- **Component-Based**: Reusable card, button, form patterns
- **Mobile-First**: Base styles target mobile, media queries expand for larger screens
- **Accessible**: WCAG 2.1 AA compliance, focus states, high-contrast mode support
- **Performance**: Minimal specificity, no nested selectors beyond 3 levels

## Design Tokens (tokens.css)

**Location:** `assets/styles/tokens.css`

Contains all design system variables:
- Colors (primary, accent, text, backgrounds)
- Gradients (primary, accent, section)
- Shadows (soft, lift, sharp, button, glow)
- Typography (font families, heading sizes, line heights)
- Spacing scale (space-1 through space-12)
- Border radius (sm, md, lg, pill)
- Transitions (short, med, long)
- Z-index scale

**Usage:**
```css
background: var(--color-bg);
color: var(--color-primary);
padding: var(--space-4);
box-shadow: var(--shadow-lift);
border-radius: var(--radius-lg);
```

## Responsive Design

### Breakpoints
- **Mobile**: 0–479px (base)
- **Tablet**: 480–767px
- **Desktop**: 768px+
- **Large Desktop**: 1200px+

### Mobile-First Approach
- Base styles apply to mobile
- Media queries add complexity for larger screens
- Use `clamp()` for fluid typography and spacing

**Example:**
```css
font-size: clamp(0.95rem, 2vw, 1.25rem);
padding: clamp(1rem, 4vw, 2.5rem);
```

## Animations & Transitions

### Transition Times
- `--transition-short: 0.15s ease-out`
- `--transition-med: 0.3s ease-out`
- `--transition-long: 0.6s ease-out`

### Keyframe Animations
- `fadeIn` — Opacity change
- `slideInUp` — Vertical slide + fade
- `slideInDown` — Vertical slide down + fade
- `scaleIn` — Scale + fade
- `pulse` — Opacity pulse for loading

### Prefers Reduced Motion
All animations respect `prefers-reduced-motion: reduce`. Provides instant transitions for users with vestibular motion disorders.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Accessibility Features

### Color Contrast
- **Text on Background**: 4.5:1 minimum (WCAG AA)
- **Large Text**: 3:1 minimum
- **Interactive Elements**: Emerald (#00a86b) provides sufficient contrast on parchment

### Focus States
```css
*:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
```

### High Contrast Mode
Supports `prefers-contrast: high` with enhanced borders and visibility:

```css
@media (prefers-contrast: high) {
  .btn, .card, input {
    border-width: 2px;
  }
}
```

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus indicators visible and clear
- Tab order is logical and intuitive

## JavaScript Integration

### Theme Toggle
The site supports light/dark mode switching via `main.js`:

```javascript
document.documentElement.classList.toggle('dark-mode');
localStorage.setItem('ts:theme', 'dark');
```

### High Contrast Mode
Accessible via Alt+Shift+C or theme toggle:

```javascript
document.documentElement.classList.toggle('high-contrast');
localStorage.setItem('ts:high-contrast', 'true');
```

### Auto-Contrast System
`auto-contrast.js` automatically corrects contrast issues in semantic text using brand colors:

```javascript
window.autoContrast({
  attemptBrandColors: true,
  recordMetadata: true
});
```

## Development Workflow

### Making Changes to the Theme

1. **Token Changes** → Update `assets/styles/tokens.css` (colors, spacing, shadows)
2. **Component Styling** → Update relevant CSS file (components, cards, gallery)
3. **Test Accessibility** → Run dev audit overlay (Alt+Shift+A) or PowerShell script
4. **Mobile Responsive** → Test on mobile, tablet, desktop with Chrome DevTools
5. **High Contrast** → Toggle high contrast mode (Alt+Shift+C) and verify visibility
6. **Animations** → Test with `prefers-reduced-motion: reduce` enabled

### Adding New Components

1. Create CSS file in `assets/css/` (e.g., `my-component.css`)
2. Add to `_includes/head.html` stylesheet links
3. Use design tokens for all colors, spacing, shadows
4. Include hover/focus states and animations
5. Test keyboard navigation and screen readers
6. Document in this file

### Common Customizations

**Change Primary Color:**
```css
--color-primary: #00a86b;
--color-primary-light: #00d68f;
--color-primary-strong: #004d35;
--gradient-primary: linear-gradient(135deg, #00a86b 0%, #008856 100%);
--shadow-button: 0 6px 16px rgba(0, 168, 107, 0.24);
```

**Adjust Spacing:**
```css
--space-4: 2rem; /* Increase for looser layout */
```

**Modify Typography:**
```css
--heading-1: 3rem;
--heading-2: 2.4rem;
```

## Performance Considerations

### Critical CSS
Inline critical CSS for above-the-fold content (header, hero, buttons) in `<style data-critical>` tag within `_includes/head.html`.

### CSS Loading
- Stylesheet links have `media="screen"` to prevent blocking render
- Fonts use `font-display: swap` to prevent FOIT
- Large images use `loading="lazy"` for deferred loading

### Optimization Tips
- Minimize specificity (use class selectors, avoid IDs)
- Group related styles by component
- Use CSS custom properties to reduce duplication
- Avoid deeply nested selectors
- Prefer `clamp()` for fluid sizes

## Browser Support

Targets modern browsers with CSS Grid, Flexbox, Custom Properties:
- Chrome/Edge 49+
- Firefox 31+
- Safari 9.1+
- iOS Safari 9.1+

## File Structure Reference

```
assets/
├── css/
│   ├── base.css                 — Element defaults, typography
│   ├── layout.css               — Grid, container, responsive
│   ├── components-refactored.css — Buttons, forms, hero base
│   ├── hero-refactored.css      — Hero-specific styles
│   ├── cards.css                — Card variants (service, portfolio, review)
│   ├── gallery.css              — Gallery, upload, trends
│   ├── home-refactored.css      — Homepage sections
│   ├── pattern-showcase.css     — Design system demo
│   └── construction-banner.css  — Construction banner
├── styles/
│   └── tokens.css               — Design tokens (SINGLE SOURCE OF TRUTH)
└── js/
    ├── main.js                  — Navigation, theme toggle
    ├── auto-contrast.js         — Brand-aware contrast correction
    ├── contrast.js              — Mix-based contrast precision
    └── dev-overlay.js           — Dev audit panel
```

## Additional Resources

- **Accessibility Guide**: `.github/instructions/accessibility-tools.md`
- **Quality Standards**: `.github/instructions/quality-standards.instructions.md`
- **Design Tokens**: `assets/styles/tokens.css`
- **CI Pipeline**: `.github/workflows/ci.yml`

## Summary

This refactored theme delivers a modern, minimal, accessible website optimized for content and user experience. The card-based component system, light parchment aesthetic, and bright emerald accents create a welcoming, professional presence for Tillerstead's services. The design system is fully customizable via tokens and scalable for future enhancements.
