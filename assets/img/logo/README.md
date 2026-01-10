# Tillerstead Logo Assets

This directory contains all official Tillerstead LLC branding assets optimized for web use.

---

## 🎨 Sprite System (Recommended)

**Primary Implementation**: Use the SVG sprite system for all logo implementations.

**File**: `tillerstead-logo-sprite.svg`  
**Documentation**: [/docs/LOGO_SYSTEM.md](/docs/LOGO_SYSTEM.md)

### Quick Start

```liquid
{% include logo-header.html symbol="logo-mark" variant="mono" %}
```

Available symbols:

- `logo-mark` / `logo-mark-mono` – Icon only
- `logo-full` / `logo-full-mono` – Full horizontal logo
- `logo-stacked` / `logo-stacked-mono` – Vertical stacked

---

## 📁 Individual Logo Files

### Header Logos

- **`tillerstead-logo-header.svg`**  
  Primary horizontal logo for light backgrounds

- **`tillerstead-logo-header-dark.svg`**  
  Header logo optimized for dark backgrounds

### Full Logos

- **`tillerstead-logo-full.svg`**  
  Complete logo with tagline and New Jersey HIC license  
  _Use: Marketing materials, hero sections_

- **`tillerstead-logo-stacked.svg`**  
  Vertical/stacked version for narrow spaces  
  _Use: Sidebars, mobile layouts, vertical banners_

### Icon/Mark Logos

- **`tillerstead-logo-mark.svg`**  
  Standalone tile "T" mark  
  _Use: Favicons, app icons, social media avatars_

- **`tillerstead-logo-mark-with-word.svg`**  
  Compact lockup with wordmark  
  _Use: Inline contexts, compact headers_

### Inverse/Dark Theme

- **`tillerstead-inverse.svg`**  
  Light-on-dark inverse logo  
  _Use: Dark backgrounds, footer, overlays_

### Favicon

- **`tillerstead-favicon.svg`**  
  Optimized favicon base mark  
  _Use: Browser tabs, bookmarks_

---

## 🧩 Sprite System

**`tillerstead-logo-sprite.svg`**  
Complete SVG symbol sprite with all logo variants.

**Benefits:**

- Single HTTP request (cached)
- CSS variable theming
- Consistent rendering
- Performance optimized

**Full documentation**: [/docs/LOGO_SYSTEM.md](/docs/LOGO_SYSTEM.md)

---

## 🎯 Usage Guidelines

### Minimum Sizes

| Logo Type    | Minimum Width |
| ------------ | ------------- |
| Mark Only    | 48px          |
| Full Logo    | 180px         |
| Stacked Logo | 120px         |

### Color Specifications

- **Kelly Green**: `#078930` (tile fill)
- **Golden Yellow**: `#FCDD09` (tile stroke)
- **Tillerstead Red**: `#DA121A` (wordmark)
- **Monochrome**: `currentColor` (inherits)

### Brand Compliance

See [/.ai/STYLE.md](/.ai/STYLE.md) for official brand standards.

---

## 🚀 Performance

All SVG files are:

- Optimized and minified
- Accessible (ARIA labels included)
- Responsive (viewBox-based scaling)
- Cacheable (immutable URLs)

**Sprite preload** (in `_includes/head.html`):

```html
<link
  rel="preload"
  as="image"
  href="/assets/img/logo/tillerstead-logo-sprite.svg"
  type="image/svg+xml"
  fetchpriority="high"
/>
```

---

## 📚 Documentation

- **Implementation Guide**: [/docs/LOGO_SYSTEM.md](/docs/LOGO_SYSTEM.md)
- **Brand Standards**: [/.ai/STYLE.md](/.ai/STYLE.md)
- **Component Usage**: [/docs/LOGO_SYSTEM.md#usage](/docs/LOGO_SYSTEM.md#usage)

---

**New Jersey HIC**: #13VH10808800  
**Last Updated**: 2025-12-26

