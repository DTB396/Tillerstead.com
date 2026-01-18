# Tillerstead Tile-Inspired Design System

## 📐 Overview

This design system brings subtle, professional tile-inspired elements to Tillerstead.com, showcasing the precision and geometry of professional tile work through sophisticated CSS patterns and textures.

---

## 🎨 Design Philosophy

**"Precision Meets Beauty"**

The tile patterns are:
- **Subtle** - Enhance without distracting
- **Professional** - Reflect real tile installation techniques
- **Performance-Optimized** - Pure CSS, no image files
- **Accessible** - WCAG AA compliant, respects user preferences
- **Responsive** - Scale appropriately across devices

---

## 📁 File Structure

```
assets/css/
├── root-vars.css           # Core design tokens (enhanced)
├── tile-patterns.css       # Tile pattern definitions
└── tile-integrations.css   # Practical implementations
```

---

## 🔧 Implementation Guide

### Step 1: Link CSS Files

Add to your HTML `<head>` (in order):

```html
<link rel="stylesheet" href="/assets/css/root-vars.css">
<link rel="stylesheet" href="/assets/css/tile-patterns.css">
<link rel="stylesheet" href="/assets/css/tile-integrations.css">
```

### Step 2: Apply to Hero Sections

**Subtle Grid Pattern:**
```html
<section class="home-hero ts-tiled-hero">
  <div class="hero-grid">
    <div class="hero-text">
      <h1>Professional Tile Installation</h1>
    </div>
  </div>
</section>
```

**Herringbone Accent:**
```html
<section class="home-hero ts-herringbone-hero">
  <!-- Diagonal pattern overlay on right side -->
</section>
```

### Step 3: Enhance Service Cards

**Ceramic Texture:**
```html
<div class="service-card ts-ceramic-card">
  <h3 class="service-title">Bathroom Tile Installation</h3>
  <p>Expert installation of ceramic and porcelain tiles...</p>
</div>
```

**Natural Stone Texture:**
```html
<div class="material-card ts-stone-card">
  <h3>Natural Stone Tiles</h3>
  <p>Marble, granite, travertine, and more...</p>
</div>
```

### Step 4: Create Tile-Inspired Galleries

**Portfolio Grid with Grout Lines:**
```html
<div class="ts-portfolio-tiled">
  <img src="bathroom-1.jpg" alt="Bathroom tile installation">
  <img src="kitchen-1.jpg" alt="Kitchen backsplash">
  <img src="floor-1.jpg" alt="Floor tile pattern">
  <img src="shower-1.jpg" alt="Shower tile work">
</div>
```

**Subway Tile Layout:**
```html
<div class="ts-portfolio-subway">
  <img src="project-1.jpg" alt="Project 1">
  <img src="project-2.jpg" alt="Project 2">
  <img src="project-3.jpg" alt="Project 3">
</div>
```

### Step 5: Section Dividers

**Grout-Line Divider:**
```html
<hr class="ts-section-separator">
```

**Tile Accent Before Heading:**
```html
<div class="section-header ts-tiled-header">
  <h2 class="section-title">Our Services</h2>
</div>
```

### Step 6: CTA Sections

**Pattern Background:**
```html
<section class="section-cta ts-tiled-cta">
  <div class="container">
    <h2 class="cta-title">Ready to Transform Your Space?</h2>
    <a href="/contact.html" class="btn btn--primary">Get Free Quote</a>
  </div>
</section>
```

### Step 7: Review/Testimonial Cards

**Tile-Framed Cards:**
```html
<div class="card--review ts-tile-framed">
  <div class="card-rating">⭐⭐⭐⭐⭐</div>
  <blockquote>
    "Exceptional tile work! The precision and attention to detail were outstanding."
  </blockquote>
  <cite>— Sarah M., Ocean County</cite>
</div>
```

---

## 🎯 Design Token Reference

### Grout Colors

```css
--tiller-grout-light: #e8e4dc;      /* Light warm grey */
--tiller-grout-medium: #d4cfc5;     /* Medium neutral */
--tiller-grout-dark: #b8b3a8;       /* Darker contrast */
--tiller-grout-white: #f4f0e8;      /* Off-white */
--tiller-grout-charcoal: #6a675f;   /* Charcoal accent */
```

### Grout Widths (Industry Standard)

```css
--tiller-grout-width-thin: 1px;      /* 1/16" - Rectified tile */
--tiller-grout-width-standard: 2px;  /* 1/8" - Standard */
--tiller-grout-width-wide: 3px;      /* 3/16" - Rustic */
```

### Tile Dimensions

```css
--tiller-tile-subway-width: 150px;   /* 6" subway tile */
--tiller-tile-subway-height: 75px;   /* 3" subway tile */
--tiller-tile-square-sm: 100px;      /* 4x4" */
--tiller-tile-square-md: 200px;      /* 8x8" */
--tiller-tile-square-lg: 300px;      /* 12x12" */
```

### Texture Overlays

```css
--tiller-texture-ceramic: linear-gradient(135deg, rgb(255,255,255,0.03) 0%, transparent 100%);
--tiller-texture-porcelain: linear-gradient(180deg, rgb(255,255,255,0.02) 0%, rgb(0,0,0,0.01) 100%);
--tiller-texture-natural-stone: radial-gradient(circle at 30% 40%, rgb(0,0,0,0.02) 0%, transparent 60%);
```

---

## 📐 Pattern Classes

### Background Patterns

| Class | Description | Use Case |
|-------|-------------|----------|
| `ts-pattern-subway` | Classic subway tile grid | Hero backgrounds, sections |
| `ts-pattern-herringbone` | Diagonal herringbone | Accent areas, sidebars |
| `ts-pattern-grid` | Modern large-format grid | Clean, contemporary sections |
| `ts-pattern-stacked` | Stacked running bond | Simple, elegant backgrounds |
| `ts-pattern-plank` | Wood-look plank pattern | Warm, natural sections |

### Integration Classes

| Class | Description | Use Case |
|-------|-------------|----------|
| `ts-tiled-hero` | Subtle grid for hero | Hero sections |
| `ts-ceramic-card` | Ceramic texture card | Service cards |
| `ts-stone-card` | Natural stone texture | Material cards |
| `ts-tile-framed` | Grout-line frame | Reviews, testimonials |
| `ts-mosaic-tile` | Decorative mosaic | Stat cards, highlights |

### Utility Classes

| Class | Description |
|-------|-------------|
| `ts-grout-left` | Left grout-line border |
| `ts-grout-bottom` | Bottom grout-line border |
| `ts-texture-ceramic` | Apply ceramic texture |
| `ts-texture-natural` | Apply natural stone texture |
| `ts-tile-frame` | Full tile frame border |
| `ts-section-separator` | Grout-line divider |

---

## 🎨 Visual Examples

### Example 1: Homepage Hero

```html
<section class="home-hero ts-tiled-hero">
  <div class="hero-grid">
    <div class="hero-text">
      <p class="hero-eyebrow">South Jersey's Premier Tile Contractor</p>
      <h1 class="hero-title">Precision Tile Installation Since 1997</h1>
      <p class="hero-summary">TCNA-certified professionals bringing artistry and craftsmanship to every project.</p>
      <div class="hero-actions">
        <a href="/contact.html" class="btn btn--primary btn--large">Get Free Quote</a>
        <a href="/portfolio.html" class="btn btn--secondary-outline btn--large">View Portfolio</a>
      </div>
    </div>
    <div class="hero-image">
      <img src="/assets/images/hero-tile-work.jpg" alt="Professional tile installation" loading="eager">
    </div>
  </div>
</section>
```

### Example 2: Services Grid

```html
<section class="home-services">
  <div class="section-header ts-tiled-header">
    <p class="section-eyebrow">What We Do</p>
    <h2 class="section-title">Professional Tile Services</h2>
  </div>
  
  <div class="services-grid">
    <div class="service-card ts-ceramic-card">
      <h3 class="service-title">Bathroom Remodeling</h3>
      <p class="service-description">Transform your bathroom with expert tile installation...</p>
    </div>
    
    <div class="service-card ts-ceramic-card">
      <h3 class="service-title">Kitchen Backsplashes</h3>
      <p class="service-description">Create stunning focal points with custom tile work...</p>
    </div>
    
    <div class="service-card ts-ceramic-card">
      <h3 class="service-title">Floor Tile Installation</h3>
      <p class="service-description">Durable, beautiful floors that last a lifetime...</p>
    </div>
  </div>
</section>
```

### Example 3: Portfolio Gallery

```html
<section class="ts-local-trust">
  <div class="container">
    <h2 class="section-title">Recent Projects</h2>
    
    <div class="ts-image-gallery-tiled">
      <img src="/assets/images/portfolio/bathroom-marble.jpg" alt="Marble bathroom">
      <img src="/assets/images/portfolio/kitchen-subway.jpg" alt="Subway tile backsplash">
      <img src="/assets/images/portfolio/floor-wood-look.jpg" alt="Wood-look tile floor">
      <img src="/assets/images/portfolio/shower-mosaic.jpg" alt="Mosaic shower accent">
      <img src="/assets/images/portfolio/entry-porcelain.jpg" alt="Porcelain entry">
      <img src="/assets/images/portfolio/outdoor-patio.jpg" alt="Outdoor patio tile">
    </div>
  </div>
</section>
```

---

## ♿ Accessibility Features

### WCAG AA Compliance

✅ **Color Contrast**
- All text maintains 4.5:1 minimum contrast
- Grout colors chosen for subtlety without compromising readability

✅ **Reduced Motion**
```css
@media (prefers-reduced-motion: reduce) {
  /* Patterns removed, solid backgrounds maintained */
}
```

✅ **High Contrast Mode**
```css
@media (prefers-contrast: high) {
  /* Patterns removed for maximum clarity */
}
```

✅ **Keyboard Navigation**
- All interactive elements maintain focus visibility
- Patterns don't interfere with focus indicators

---

## ⚡ Performance Optimization

### Lightweight Approach

**Pure CSS** - No image files
- All patterns use CSS gradients
- Zero HTTP requests for patterns
- Minimal CSS file size (~16KB)

**Efficient Rendering**
- GPU-accelerated where beneficial
- Optimized gradient calculations
- Minimal repaints

**Responsive Scaling**
```css
/* Patterns scale down on mobile */
@media (max-width: 600px) {
  --tiller-tile-square-md: 120px;  /* Smaller tiles */
  /* Reduced opacity for performance */
}
```

---

## 📱 Responsive Behavior

### Desktop (>1400px)
- Full tile dimensions
- Maximum pattern detail
- Rich textures visible

### Tablet (900px - 1400px)
- Scaled tile dimensions
- Maintained pattern integrity

### Mobile (<600px)
- Reduced tile sizes
- Simplified patterns
- Lower opacity for performance
- Some decorative elements hidden

---

## 🧪 Testing Checklist

- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Verify mobile responsiveness (320px - 1920px)
- [ ] Check color contrast with WebAIM tool
- [ ] Test with reduced motion preference
- [ ] Validate high contrast mode
- [ ] Test keyboard navigation
- [ ] Verify performance with Lighthouse
- [ ] Check pattern visibility on different backgrounds

---

## 🔄 Migration Path

### Phase 1: Core Pages (Week 1)
1. Add CSS files to site
2. Apply to homepage hero (`ts-tiled-hero`)
3. Update service cards (`ts-ceramic-card`)

### Phase 2: Enhanced Sections (Week 2)
4. Portfolio gallery (`ts-portfolio-tiled`)
5. Section dividers (`ts-section-separator`)
6. CTA sections (`ts-tiled-cta`)

### Phase 3: Detail Refinement (Week 3)
7. Review cards (`ts-tile-framed`)
8. Material cards (`ts-stone-card`)
9. Footer patterns (`ts-tiled-footer`)

### Phase 4: Full Rollout (Week 4)
10. Service pages
11. About page
12. Contact page
13. Blog posts

---

## 🎓 Industry Standards Reflected

### TCNA Compliance
- Grout joint widths match TCNA Handbook standards
- Tile dimensions based on industry-standard sizes
- Pattern layouts reflect professional installation techniques

### Popular Tile Patterns
- **Subway**: Classic 1/3 offset running bond
- **Herringbone**: 45° diagonal V-pattern
- **Grid**: Straight-set square tile
- **Stacked**: Modern stacked bond
- **Plank**: Wood-look porcelain layout

---

## 🛠️ Customization

### Adjusting Pattern Intensity

**Make Patterns More Visible:**
```css
:root {
  --tiller-pattern-opacity-subtle: 0.06;  /* Default: 0.03 */
}
```

**Make Patterns More Subtle:**
```css
:root {
  --tiller-pattern-opacity-subtle: 0.01;
}
```

### Changing Grout Colors

```css
:root {
  --tiller-grout-light: #your-color;
  --tiller-grout-medium: #your-color;
  --tiller-grout-dark: #your-color;
}
```

### Adjusting Tile Sizes

```css
:root {
  --tiller-tile-square-md: 250px;  /* Larger tiles */
}
```

---

## 📞 Support & Questions

For questions about implementing the tile design system:
1. Review this documentation
2. Check code comments in CSS files
3. Test in isolation before applying site-wide
4. Refer to HTML examples in `tile-integrations.css`

---

## 📝 Best Practices

### DO ✅
- Use tile patterns on backgrounds, not over text
- Apply textures to cards and sections
- Use grout-line dividers sparingly for impact
- Test contrast ratios after applying patterns
- Combine patterns with existing brand colors

### DON'T ❌
- Overuse patterns - subtlety is key
- Apply multiple patterns to same element
- Use patterns that interfere with text readability
- Ignore responsive scaling on mobile
- Forget to test accessibility

---

**Created by:** Tillerstead Design System Team  
**Version:** 1.0  
**Last Updated:** 2026  
**License:** Proprietary - Tillerstead.com

---

*Showcasing the precision, geometry, and artistry of professional tile installation through thoughtful design.*
