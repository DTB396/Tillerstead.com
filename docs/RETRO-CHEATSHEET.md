# 90s Retro Design - Quick Cheatsheet 🎨

**Tillerstead.com 90s Enhancement**  
Modern clean design + nostalgic 90s aesthetic

---

## 🌈 Colors

```css
/* Teal */
--retro-teal: #008080;           /* Classic teal */
--retro-teal-light: #5dbdbd;     /* Light */
--retro-teal-dark: #005757;      /* Dark */

/* Salmon */
--retro-salmon: #fa8072;         /* Classic salmon */
--retro-salmon-light: #ffb3a7;   /* Light */
--retro-salmon-dark: #e55b47;    /* Dark */

/* Mint */
--retro-mint: #98ff98;           /* Mint green */
--retro-mint-light: #c4ffc4;     /* Light */
--retro-mint-dark: #6ecc6e;      /* Dark */

/* Purple */
--retro-purple: #9370db;         /* Medium purple */
--retro-purple-light: #b89ee0;   /* Light */
--retro-purple-dark: #6a4db8;    /* Dark */
```

---

## 🔲 Tile Patterns

```html
<!-- Salmon Tile (8% opacity) -->
<div class="ts-pattern-retro-salmon"></div>

<!-- Teal Tile (10% opacity) -->
<div class="ts-pattern-retro-teal"></div>

<!-- Mint Tile (8% opacity) -->
<div class="ts-pattern-retro-mint"></div>

<!-- Checkerboard (6% opacity) -->
<div class="ts-pattern-retro-checkerboard"></div>

<!-- Geometric (5% opacity) -->
<div class="ts-pattern-retro-geometric"></div>

<!-- Diagonal Stripes (8% opacity) -->
<div class="ts-pattern-retro-diagonal"></div>
```

---

## 🃏 Cards

```html
<!-- Salmon Card -->
<div class="ts-card-retro-salmon">
  <h3>Title</h3>
  <p>Content</p>
</div>

<!-- Teal Card -->
<div class="ts-card-retro-teal">
  <h3>Title</h3>
  <p>Content</p>
</div>

<!-- Generic Retro Card -->
<div class="card-retro">
  <h3>Title</h3>
  <p>Content</p>
</div>
```

---

## 🎯 Buttons

```html
<!-- Teal Button -->
<button class="btn-retro-teal">Get Started</button>

<!-- Salmon Button -->
<button class="btn-retro-salmon">Contact Us</button>
```

---

## 💫 Shadows (Offset, Hard-Edged)

```html
<!-- Small (3px) -->
<div class="retro-shadow-offset-sm"></div>

<!-- Medium (5px) -->
<div class="retro-shadow-offset"></div>

<!-- Large (8px) -->
<div class="retro-shadow-offset-lg"></div>

<!-- Colored Shadows -->
<div class="retro-shadow-teal"></div>
<div class="retro-shadow-purple"></div>
<div class="retro-shadow-salmon"></div>
```

---

## 🔳 Borders (Chunky!)

```html
<!-- Teal Border (4px) -->
<div class="retro-border-teal"></div>

<!-- Salmon Border (4px) -->
<div class="retro-border-salmon"></div>

<!-- Mint Border (4px) -->
<div class="retro-border-mint"></div>

<!-- Purple Border (4px) -->
<div class="retro-border-purple"></div>

<!-- Double Border Effect -->
<div class="retro-border-double"></div>
```

---

## 📐 Memphis Accents

```html
<!-- Color Bar Accent -->
<div class="section-header memphis-accent">
  <h2>Title</h2>
</div>

<!-- Triangle in Corner -->
<div class="card memphis-triangle"></div>

<!-- Circle Behind Element -->
<div class="card memphis-circle"></div>

<!-- Zigzag Divider -->
<hr class="memphis-zigzag">
```

---

## 🌈 Gradients

```html
<!-- Teal → Purple -->
<div class="retro-gradient-teal-purple"></div>

<!-- Salmon → Mint -->
<div class="retro-gradient-salmon-mint"></div>

<!-- Subtle Overlay (15% opacity) -->
<section class="retro-gradient-overlay-teal">
  <div>Content</div>
</section>
```

---

## 🎨 Color Blocks

```html
<!-- Teal Background -->
<section class="retro-block-teal">
  <h2>Title</h2>
  <p>Content</p>
</section>

<!-- Salmon Background -->
<section class="retro-block-salmon"></section>

<!-- Mint Background -->
<section class="retro-block-mint"></section>

<!-- Purple Background -->
<section class="retro-block-purple"></section>
```

---

## ➖ Dividers

```html
<!-- Rainbow Gradient Bar -->
<hr class="ts-divider-retro-rainbow">

<!-- Zigzag Pattern -->
<hr class="memphis-zigzag">

<!-- Accent Bar -->
<div class="retro-accent-bar"></div>

<!-- Vertical Accent -->
<div class="retro-accent-bar-vertical"></div>
```

---

## 🎭 Text Effects

```html
<!-- Teal Text with Shadow -->
<h1 class="text-retro-teal">90s Vibes</h1>

<!-- Salmon Text with Shadow -->
<h2 class="text-retro-salmon">Nostalgic</h2>

<!-- Purple Text with Shadow -->
<h3 class="text-retro-purple">Design</h3>
```

---

## 🏠 Hero Enhancement

```html
<section class="home-hero hero-retro ts-pattern-retro-teal">
  <div class="hero-grid">
    <div class="hero-text">
      <h1 class="hero-title text-retro-teal">Title</h1>
      <p class="hero-summary">Description</p>
      <button class="btn-retro-teal">CTA</button>
    </div>
  </div>
</section>
```

---

## 📊 Grout Lines

```html
<!-- Teal Grout Grid -->
<section class="grout-retro-teal"></section>

<!-- Salmon Grout Grid -->
<section class="grout-retro-salmon"></section>

<!-- Mint Grout Grid -->
<section class="grout-retro-mint"></section>
```

---

## 🎨 Pattern Overlays

```html
<!-- Geometric Pattern -->
<section class="retro-pattern-geometric">
  <div>Content</div>
</section>

<!-- Pixel/8-bit Pattern -->
<section class="retro-pattern-pixel">
  <div>Content</div>
</section>
```

---

## ✅ Usage Rules

### DO:
- ✅ Use as accents (8-15% opacity)
- ✅ Apply to CTAs, cards, dividers
- ✅ Combine with emerald/gold brand colors
- ✅ Maintain WCAG AA contrast (4.5:1)
- ✅ Test on mobile devices

### DON'T:
- ❌ Use as primary text color
- ❌ Exceed 20% opacity on patterns
- ❌ Use 3+ retro colors per section
- ❌ Compromise accessibility
- ❌ Apply to every element

---

## 📱 Responsive Behavior

**900px and below:**
- Tile patterns reduce to 80px
- Shadows reduce to 3px
- Checkerboard reduces to 30px

**600px and below:**
- Tile patterns reduce to 60px
- Pattern opacity reduces to 5%
- Borders reduce to 2px
- Memphis accents hidden (performance)

---

## ♿ Accessibility

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  /* All animations disabled */
}
```

**High Contrast:**
```css
@media (prefers-contrast: high) {
  /* Patterns disabled, borders increased */
}
```

---

## 🚀 Quick Start

### 1. Add CSS
```html
<link rel="stylesheet" href="/assets/css/retro-enhancements.css">
```

### 2. Apply Classes
```html
<section class="home-hero hero-retro ts-pattern-retro-teal">
  <button class="btn-retro-teal">Click Me</button>
</section>
```

### 3. Test & Deploy
- ✅ Check contrast
- ✅ Test on devices
- ✅ Validate HTML
- ✅ Run Lighthouse

---

## 📚 Full Documentation

- **Complete Guide:** `90S-RETRO-DESIGN-GUIDE.md`
- **Implementation:** `RETRO-IMPLEMENTATION.md`
- **Visual Demo:** `retro-showcase.html`

---

## 🎉 Summary

**60+ CSS classes** for 90s retro design  
**12+ color variables** (teal, salmon, mint, purple)  
**6 tile patterns** (subtle overlays)  
**20+ components** (cards, buttons, dividers)  
**Lightweight** (25KB CSS)  
**Accessible** (WCAG AA)  
**Responsive** (mobile-optimized)

---

**Made with:** Pure CSS, no frameworks  
**Inspired by:** Memphis design, Windows 95, 90s tile  
**Philosophy:** Professional with personality 🎨✨
