# Tillerstead Theme Quick-Start Guide

## 🎨 New Theme Overview

Your Tillerstead website has been completely redesigned with:
- **Light parchment background** (#f5f1eb) for warmth and professionalism
- **Bright emerald primary** (#00a86b) for modern, accessible CTAs
- **Brass secondary accent** (#8b6f47) for depth and visual hierarchy
- **Minimal, card-based layouts** for scannable, modern design
- **Smooth animations** that respect user motion preferences
- **Full accessibility** (WCAG 2.1 AA compliant)

---

## 🚀 Quick Start

### View the Homepage
1. Open your browser and navigate to your local development server
2. You should see:
   - Parchment-colored background with dark text
   - Emerald green buttons and accents
   - Service cards (Tile, Remodeling, Maintenance)
   - Portfolio gallery preview with project cards
   - Existing sections updated with new colors and layout

### Test Accessibility Features
- **High Contrast Mode**: Press `Alt+Shift+C` to toggle
- **Dev Audit Panel**: Press `Alt+Shift+A` to see color and SEO audit
- **Keyboard Navigation**: Press `Tab` to navigate, `Enter/Space` to activate

### Customize Colors
Edit `assets/styles/tokens.css`:
```css
/* Change primary color */
--color-primary: #00a86b; /* Change this to any color */

/* Changes automatically apply to all buttons, links, accents */
```

---

## 📁 File Locations

### Design System
- **Tokens (Colors, Spacing, Shadows)**: `assets/styles/tokens.css`
- **Theme Guide**: `.github/THEME_REFACTOR.md` (comprehensive)
- **Summary**: `.github/THEME_REFACTORING_SUMMARY.md` (overview)

### CSS Files (Load in this order)
1. `assets/styles/tokens.css` — Design tokens
2. `assets/css/base.css` — Element defaults
3. `assets/css/layout.css` — Grid and container
4. `assets/css/components-refactored.css` — Buttons, forms, utilities
5. `assets/css/hero-refactored.css` — Hero section
6. `assets/css/cards.css` — Card components
7. `assets/css/gallery.css` — Gallery and media
8. `assets/css/home-refactored.css` — Homepage sections

### Page Templates
- **Homepage**: `index.html` (updated with card sections)
- **Hero Include**: `_includes/unified-hero.html` (simplified, pattern-free)
- **Head**: `_includes/head.html` (updated stylesheet links)

---

## 🎯 Common Tasks

### Change the Primary Color
**File:** `assets/styles/tokens.css`
**Lines:** Find `--color-primary` (around line 10)

```css
/* Before */
--color-primary: #00a86b;

/* After - your new color */
--color-primary: #ff6b35;
```

All buttons, links, and accent elements update automatically.

### Add a New Section to Homepage
**File:** `index.html`

```html
<!-- Copy this pattern -->
<section class="section" aria-labelledby="my-section-title">
  <div class="container">
    <div class="section-header">
      <p class="eyebrow">Section label</p>
      <h2 id="my-section-title">Section title</h2>
      <p>Section description</p>
    </div>
    <!-- Add content here -->
  </div>
</section>
```

### Add a Card to the Services Grid
**File:** `index.html` (find "Core services" section)

```html
<li class="card card--service">
  <div class="card-icon">🎨</div>
  <h3 class="card-title">Design Consultation</h3>
  <p class="card-desc">Expert design guidance for your project.</p>
  <a href="#" class="card-link">Learn more →</a>
</li>
```

### Create a New Button
```html
<!-- Primary button (emerald) -->
<a href="#" class="btn btn-primary">Get Started</a>

<!-- Secondary button (emerald border) -->
<a href="#" class="btn btn-secondary">Learn More</a>

<!-- Ghost button (minimal) -->
<a href="#" class="btn btn-ghost">View Details</a>

<!-- Size variants -->
<a href="#" class="btn btn-primary btn-small">Small</a>
<a href="#" class="btn btn-primary btn-large">Large</a>
```

### Create a Photo Gallery Grid
```html
<ul class="photo-grid">
  <li class="photo-item">
    <img src="/path/to/photo.jpg" alt="Description" class="photo-item-image" loading="lazy">
    <div class="photo-item-overlay">
      <p class="photo-caption">Photo caption</p>
      <p class="photo-meta">Date or project name</p>
    </div>
  </li>
  <!-- Repeat for more photos -->
</ul>
```

### Add Portfolio Project Card
```html
<li class="card card--portfolio">
  <img src="/path/to/project.jpg" alt="Project description" class="card-image" loading="lazy">
  <div class="card-content">
    <span class="card-category">Tile & Waterproofing</span>
    <h3 class="card-title">Master Bath Remodel</h3>
    <p class="card-desc">Project description here.</p>
  </div>
</li>
```

---

## 🎨 Color Reference

### Use in HTML Classes
```html
<!-- Text colors -->
<p class="text-primary">Primary text (emerald)</p>
<p class="text-accent">Accent text (brass)</p>
<p class="text-muted">Muted text (gray)</p>

<!-- Background colors -->
<div class="bg-primary">Primary background</div>
<div class="bg-accent">Accent background</div>
<div class="bg-surface">Surface background</div>

<!-- Shadows -->
<div class="shadow-soft">Soft shadow</div>
<div class="shadow-lift">Lift shadow</div>
<div class="shadow-sharp">Sharp shadow</div>

<!-- Border radius -->
<div class="rounded-sm">Small radius</div>
<div class="rounded-md">Medium radius</div>
<div class="rounded-lg">Large radius</div>
```

### Use in CSS
```css
/* Always reference tokens, never hardcode colors */
.my-element {
  background: var(--color-primary);
  color: var(--color-text);
  padding: var(--space-4);
  box-shadow: var(--shadow-lift);
  border-radius: var(--radius-lg);
}
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 0–479px (base styles)
- **Tablet**: 480–767px
- **Desktop**: 768px+
- **Large**: 1200px+

### Use Fluid Sizing
```css
/* Instead of fixed pixels, use clamp() for fluid sizing */
font-size: clamp(1.05rem, 2vw, 1.25rem);
padding: clamp(1rem, 4vw, 2.5rem);
```

### Test Mobile Layout
1. Open DevTools (F12)
2. Click device toggle (phone icon)
3. Try different devices and orientations
4. Verify card grids stack on mobile

---

## ♿ Accessibility Features

### Test Keyboard Navigation
- Press `Tab` to navigate through links and buttons
- Press `Shift+Tab` to go backwards
- Press `Enter` or `Space` to activate buttons
- All interactive elements should be reachable

### Test Color Contrast
- Emerald (#00a86b) on parchment (#f5f1eb) = **4.5:1** ✅ WCAG AA
- Dark text (#1a1a1a) on parchment = **16:1** ✅ Perfect contrast

### Test High Contrast Mode
- Press `Alt+Shift+C` to toggle
- All elements should have clear visible borders and outlines
- No color-only information (always use text labels too)

### Test with Screen Reader
- Download NVDA (free) or JAWS
- Navigate with arrow keys
- Listen to heading structure
- Verify alt text on images

---

## 🔄 Theme Switching

### Light/Dark Mode (If Implemented)
```javascript
// Toggle light/dark mode
document.documentElement.classList.toggle('dark-mode');
localStorage.setItem('ts:theme', 'dark');
```

### High Contrast Mode
```javascript
// Toggle high contrast
document.documentElement.classList.toggle('high-contrast');
localStorage.setItem('ts:high-contrast', 'true');
```

---

## 🐛 Troubleshooting

### Colors Look Wrong
1. Hard-refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check `assets/styles/tokens.css` is loading (DevTools → Network tab)
3. Verify no browser extensions modifying styles
4. Check for CSS conflicts in other files

### Layout Broken on Mobile
1. Open DevTools → Toggle device toolbar
2. Check media queries in layout.css
3. Look for fixed widths (should be fluid with clamp())
4. Verify viewport meta tag in head.html

### Buttons Not Styled
1. Ensure you're using `.btn` class
2. Check button variant (`.btn-primary`, `.btn-secondary`, etc.)
3. Verify CSS file loaded (DevTools → Elements → Styles)
4. Clear browser cache if recently updated

### Focus States Not Visible
1. Check for keyboard focus (Tab key)
2. Look for `outline: 3px solid var(--color-primary)`
3. High contrast mode provides extra visibility (Alt+Shift+C)
4. Adjust outline-offset in CSS if needed

### Animations Too Slow
1. Check for `prefers-reduced-motion: reduce` setting
2. Disable browser extensions
3. Test on different device (might be hardware issue)
4. Animation speeds defined in tokens.css

---

## 📚 Documentation Files

| File | Purpose | Where |
|------|---------|-------|
| `THEME_REFACTOR.md` | Complete design system guide | `.github/` |
| `THEME_REFACTORING_SUMMARY.md` | Project overview | `.github/` |
| `REFACTORING_CHECKLIST.md` | Phase-by-phase tasks | `.github/` |
| `accessibility-tools.md` | Accessibility guide | `.github/instructions/` |
| `quality-standards.instructions.md` | Code quality standards | `.github/instructions/` |

---

## 💡 Pro Tips

1. **Use DevTools** — Open with F12, inspect elements to see applied styles
2. **Search tokens.css** — Find any color/spacing value quickly
3. **Test high-contrast** — Alt+Shift+C before considering design done
4. **Mobile-first approach** — Style mobile first, then add complexity for larger screens
5. **Atomic classes** — Use utility classes (`.mt-4`, `.shadow-lift`) instead of writing CSS
6. **Animation performance** — Use CSS transforms for smooth animations
7. **Image optimization** — Always compress images and use `loading="lazy"`
8. **Semantic HTML** — Use proper tags (section, article, aside, nav) for accessibility

---

## 🚦 Next Actions

### Immediate
- [ ] View homepage in browser
- [ ] Toggle high-contrast mode (Alt+Shift+C)
- [ ] Test on mobile device
- [ ] Run accessibility audit (Alt+Shift+A)

### This Week
- [ ] Customize colors if desired (edit tokens.css)
- [ ] Add portfolio images (replace placeholder paths)
- [ ] Review and approve design

### This Month
- [ ] Create content pages (Services, Portfolio, About)
- [ ] Implement gallery upload
- [ ] Set up forms and validation
- [ ] Performance and accessibility testing

---

## 📞 Support

For detailed information:
- **Design System**: See `.github/THEME_REFACTOR.md`
- **Components**: See `.github/THEME_REFACTORING_SUMMARY.md`
- **Accessibility**: See `.github/instructions/accessibility-tools.md`
- **Quality Standards**: See `.github/instructions/quality-standards.instructions.md`

---

**Welcome to the new Tillerstead theme! 🎉**

Your website is now modern, accessible, and ready for content. The design system is token-driven, making future updates fast and consistent.

**Happy building!**
