# Tillerstead Tile Pattern Library

Professional SVG patterns for use across the Tillerstead website. All patterns are tile-inspired and optimized for subtle, sophisticated backgrounds.

## Available Patterns

### 1. **Tile Crosshatch** (`tile-crosshatch.svg`)
- **File**: `/assets/img/patterns/tile-crosshatch.svg`
- **Size**: 120×120px
- **Style**: Grid pattern with grout lines, corner accents, and diagonal details
- **Usage**: Homepage hero background
- **CSS Class**: `.ts-hero--pattern-tile-crosshatch`
- **Best for**: Main hero sections, feature areas

```scss
background-image: url('/assets/img/patterns/tile-crosshatch.svg');
background-size: 120px 120px;
background-repeat: repeat;
```

### 2. **Subway Tile** (`subway-tile.svg`)
- **File**: `/assets/img/patterns/subway-tile.svg`
- **Size**: 180×120px (3:2 ratio brick layout)
- **Style**: Classic subway tile with offset brick pattern
- **CSS Class**: `.ts-hero--pattern-subway-tile`
- **Best for**: Service pages, bathroom/kitchen sections

```scss
background-image: url('/assets/img/patterns/subway-tile.svg');
background-size: 180px 120px;
background-repeat: repeat;
```

### 3. **Hexagon Tile** (`hexagon-tile.svg`)
- **File**: `/assets/img/patterns/hexagon-tile.svg`
- **Size**: 120×104px
- **Style**: Honeycomb hexagonal pattern with center accents
- **CSS Class**: `.ts-hero--pattern-hexagon-tile`
- **Best for**: Modern/contemporary sections, testimonials

```scss
background-image: url('/assets/img/patterns/hexagon-tile.svg');
background-size: 120px 104px;
background-repeat: repeat;
```

### 4. **Moroccan Tile** (`moroccan-tile.svg`)
- **File**: `/assets/img/patterns/moroccan-tile.svg`
- **Size**: 100×100px
- **Style**: Zellige-inspired quatrefoil with star details
- **CSS Class**: `.ts-hero--pattern-moroccan-tile`
- **Best for**: Premium sections, decorative accents

```scss
background-image: url('/assets/img/patterns/moroccan-tile.svg');
background-size: 100px 100px;
background-repeat: repeat;
```

## Footer Pattern

The current footer uses the **Sacred Tile** pattern:
- **File**: `/assets/img/patterns/sacred-tile.svg`
- **Style**: Sacred geometry flower-of-life inspired
- **Location**: Applied in footer SCSS

## Pattern Design Principles

1. **Subtlety**: All patterns use low opacity (0.08-0.15) for background elements
2. **Color Harmony**: Blues (#2c5282, #3182ce) match Tillerstead brand
3. **Tile Authenticity**: Grout lines, corner details, and realistic proportions
4. **Performance**: Optimized SVG files, small file sizes
5. **Responsive**: Scale appropriately at all viewport sizes

## How to Use

### Apply to Hero Sections
```html
<section class="ts-hero ts-hero--pattern-tile-crosshatch">
  <!-- content -->
</section>
```

### Apply to Cards/Components
```scss
.custom-section {
  background-image: url('/assets/img/patterns/subway-tile.svg');
  background-size: 180px 120px;
  background-repeat: repeat;
  background-color: #f8f9fa; // Light base color
}
```

### Layering Patterns
```scss
.layered-bg {
  background-color: #f8f9fa;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
    url('/assets/img/patterns/tile-crosshatch.svg');
}
```

## Animation (Optional)

Add subtle movement to patterns:

```scss
@keyframes pattern-float {
  0%, 100% { background-position: 0 0; }
  50% { background-position: 20px 20px; }
}

.pattern-animated {
  animation: pattern-float 60s ease-in-out infinite;
}
```

## Accessibility

- Patterns are purely decorative (no critical information)
- Low contrast ensures readability of foreground text
- Patterns are removed in print stylesheets
- No motion for users with `prefers-reduced-motion`

## Current Implementation

- **Homepage Hero**: Tile Crosshatch pattern
- **Footer**: Sacred Tile pattern (existing)
- **Future**: Can apply to service cards, testimonial sections, CTAs

## Maintenance

When creating new patterns:
1. Keep file sizes under 3KB
2. Use consistent color palette (#2c5282, #3182ce, #f8f9fa)
3. Maintain opacity between 0.08-0.15 for subtle effect
4. Test readability with all text colors
5. Add to `_sass/00-settings/_patterns.scss`
6. Document in this file

---

**Last Updated**: December 21, 2024
**Pattern Count**: 5 (4 new tile patterns + 1 existing sacred tile)
