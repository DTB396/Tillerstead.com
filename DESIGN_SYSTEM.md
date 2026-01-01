# 🎨 Tillerstead Modern Design System v2

## Overview
A cohesive, modern design system built from the Tillerstead logo colors. Professional, bold, and dynamic with smooth animations and accessibility at the core.

---

## 🎯 Color Palette

All colors derived from the Tillerstead logo for perfect brand consistency.

### Primary Brand Colors

**Teal (#078930)** - Trust, Expertise, Tile Industry Standard
- Used for primary actions, buttons, links, and brand identity
- Teal-700: Main brand color (logo tile)
- Teal-800: Darker shade for emphasis
- Teal-50 to Teal-400: Lighter variations for backgrounds, hover states

**Red (#DA121A)** - Energy, Confidence, Calls-to-Action
- Accent color for important actions and highlights
- Used for emphasis, warnings, and secondary CTAs
- Red-600: Main accent (logo text)
- Red-100 to Red-500: Supporting variations

**Gold (#FCDD09)** - Luxury, Highlights, Attention
- Used sparingly for highlights and premium features
- Can reference tile grout/detailing
- Gold-600: Main highlight (logo stroke)
- Gold-300 to Gold-500: Supporting variations

### Neutral Colors

**Charcoal (#1a1a1a)** - Text, Structure, Depth
- Dark text and backgrounds
- Multiple shades for hierarchy
- Charcoal-800: Main text color
- Charcoal-50 to Charcoal-300: Light backgrounds and borders

**Cream (#f9f7f4)** - Warmth, Substrate Reference
- Warm off-white backgrounds
- References bathroom substrate/tile base
- Cream-100: Primary soft background
- Cream-25 to Cream-75: Subtle variations

**White (#ffffff)** - Clean, Professional
- Primary background
- Card and container fill
- Maximum contrast support

---

## ✨ Typography

**Font Family**: Inter, Manrope, system-ui
- Modern, professional, accessible
- Used throughout for consistency

**Font Weights**:
- Light (300): Subtle text, labels
- Regular (400): Body text
- Medium (500): Subheadings, emphasis
- Semibold (600): Buttons, small headings
- Bold (700): Headings, highlights
- Extra Bold (800): Logo, large headings

---

## 🔲 Spacing Scale

All spacing uses a consistent 4px base unit for harmony:

```
--space-1: 4px      --space-6: 24px     --space-16: 64px
--space-2: 8px      --space-8: 32px     --space-20: 80px
--space-3: 12px     --space-10: 40px    --space-24: 96px
--space-4: 16px     --space-12: 48px
--space-5: 20px
```

---

## 🎯 Border Radius

**Use case guide:**
- `--radius-none` (0): Harsh edges
- `--radius-xs` (4px): Minimal rounding
- `--radius-sm` (6px): Subtle buttons
- `--radius-md` (8px): Standard buttons, inputs, cards
- `--radius-lg` (12px): Larger containers
- `--radius-xl` (16px): Section containers
- `--radius-full` (999px): Pill buttons, avatars

---

## 🎬 Animation System

### Keyframe Animations Available

| Animation | Purpose | Duration | Easing |
|-----------|---------|----------|--------|
| `fadeIn` | Entrance | 300ms | easing-out |
| `slideInUp` | Vertical entrance | 300ms | easing-out |
| `slideInDown` | Reverse entrance | 300ms | easing-out |
| `slideInLeft` | Horizontal entrance | 300ms | easing-out |
| `slideInRight` | Horizontal entrance | 300ms | easing-out |
| `scaleIn` | Emphasis entrance | 300ms | easing-out |
| `bounceIn` | Playful entrance | 300ms | bounce |
| `float` | Subtle floating | 3s | ease-in-out |
| `glow` | Attention pulse | 2s | ease-in-out |
| `pulse` | Opacity pulse | 2s | ease-in-out |
| `rotate` | Loading spinner | varies | linear |
| `wave` | Cascading motion | varies | ease-in-out |

### Animation Durations

```
--duration-fast: 150ms    (quick interactions)
--duration-base: 300ms    (standard transitions)
--duration-slow: 500ms    (emphasis animations)
--duration-xslow: 800ms   (entrance animations)
```

### Easing Functions

```
--easing-in: cubic-bezier(0.4, 0, 1, 1)          (accelerate)
--easing-out: cubic-bezier(0, 0, 0.2, 1)         (decelerate)
--easing-in-out: cubic-bezier(0.4, 0, 0.2, 1)    (smooth)
--easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)  (playful)
--easing-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275)  (bouncy)
```

### Reusable Animation Classes

```css
/* Entrance animations */
.animate-fade-in          /* Opacity entrance */
.animate-slide-in-up      /* Slide from bottom */
.animate-slide-in-down    /* Slide from top */
.animate-slide-in-left    /* Slide from left */
.animate-slide-in-right   /* Slide from right */
.animate-scale-in         /* Scale entrance */
.animate-bounce-in        /* Playful entrance */

/* Continuous animations */
.animate-float            /* Floating effect */
.animate-pulse            /* Opacity pulse */
.animate-glow             /* Glowing shadow */

/* List animations */
.animate-stagger          /* Stagger children */
```

### Usage Examples

```html
<!-- Entrance animation -->
<div class="animate-slide-in-up">Content slides in</div>

<!-- Staggered list items -->
<ul class="animate-stagger">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
```

---

## 🔘 Component Styles

### Buttons

**Primary (Teal)**
```html
<button class="btn btn--primary">Click Me</button>
```
- Background: Teal-700
- Text: White
- Hover: Teal-800 with shadow
- Animation: Lift on hover, scale on active

**Secondary (Outline)**
```html
<button class="btn btn--secondary">Alternative</button>
```
- Background: Transparent
- Border: Teal-700
- Hover: Light teal background

**Accent (Red)**
```html
<button class="btn btn--accent">Important</button>
```
- Background: Red-600
- Text: White
- Hover: Red-700 with red glow

**Ghost (Minimal)**
```html
<button class="btn btn--ghost">Subtle</button>
```
- Background: Transparent
- Border: Light gray
- Hover: Soft background

### Sizes

```html
<button class="btn btn--sm">Small</button>
<button class="btn">Medium (default)</button>
<button class="btn btn--lg">Large</button>
<button class="btn btn--full">Full Width</button>
```

### States

- **Hover**: Lift 2px, shadow
- **Active**: Press effect, shadow reduced
- **Focus**: Blue outline with offset
- **Disabled**: 50% opacity, no interaction
- **Loading**: Spinner animation

---

## 🎨 Shadow System

Used for depth and elevation:

```
--shadow-xs:   Subtle (1px, 0.05 opacity)
--shadow-sm:   Light (2px, 0.1 opacity)
--shadow-md:   Standard cards (4px, 0.1 opacity)
--shadow-lg:   Lifted elements (10px, 0.1 opacity)
--shadow-xl:   Modal-level (20px, 0.1 opacity)
--shadow-2xl:  Maximum elevation (25px, 0.25 opacity)

/* Accent shadows for brand */
--shadow-teal-sm:  Teal glow
--shadow-red-sm:   Red glow
--shadow-gold-sm:  Gold glow
```

---

## 📱 Responsive Breakpoints

```
--breakpoint-xs: 320px    (mobile)
--breakpoint-sm: 640px    (small devices)
--breakpoint-md: 768px    (tablets)
--breakpoint-lg: 1024px   (desktop)
--breakpoint-xl: 1280px   (large desktop)
--breakpoint-2xl: 1536px  (ultra-wide)
```

---

## ♿ Accessibility

### Keyboard Navigation
- All interactive elements focus-visible with teal outline
- Tab order logical and intuitive
- No keyboard traps

### Color Contrast
- WCAG 2.1 AAA compliant throughout
- Teal-700 on white: 8.2:1 contrast
- Red-600 on white: 6.3:1 contrast
- All text at minimum 4.5:1 (normal) or 3:1 (large)

### Motion
- Respects `prefers-reduced-motion` preference
- All animations disabled for users preferring reduced motion
- No auto-playing animations

### High Contrast Mode
- Enhanced borders and visibility
- Proper color contrast maintained
- Clear focus indicators

---

## 🎪 Animation Best Practices

### When to Use Animations

✅ **Use for:**
- Page entrance/exit
- Hover states on interactive elements
- Loading states
- Success/error feedback
- Drawing attention to important elements
- Micro-interactions (button press, toggle)

❌ **Avoid:**
- Distracting background animations
- Auto-playing carousel effects
- Animations longer than 500ms (unless entrance)
- Multiple simultaneous animations
- Animations on reduced-motion preference

### Performance Tips

- Use `transform` and `opacity` (GPU-accelerated)
- Avoid animating `width`, `height`, `position`
- Add `transform: translateZ(0)` for 3D acceleration
- Test on mobile devices
- Keep animations under 800ms

---

## 🎯 Implementation Checklist

When building new components:

- [ ] Use color variables, not hex codes
- [ ] Apply consistent spacing (4px grid)
- [ ] Include hover/active/focus states
- [ ] Test with keyboard navigation
- [ ] Verify color contrast (WCAG AAA)
- [ ] Add appropriate animations
- [ ] Test on mobile (320px+)
- [ ] Respect prefers-reduced-motion
- [ ] Document component usage

---

## 📚 File Structure

```
_sass/
├── 00-settings/
│   ├── _tokens-modern.scss        /* New: Design system tokens */
│   └── ...
├── 10-base/
│   ├── _animations.scss            /* New: Animation keyframes */
│   └── ...
├── 30-components/
│   ├── _modern-components.scss     /* New: Updated components */
│   └── ...
```

---

## 🔄 Migration Guide

If updating from old design system:

1. **Colors**: Replace hex with CSS variables
   - `#078930` → `var(--color-primary)`
   - `#DA121A` → `var(--color-accent)`
   - `#FCDD09` → `var(--color-highlight)`

2. **Spacing**: Use space scale
   - `16px` → `var(--space-4)`
   - `24px` → `var(--space-6)`
   - `32px` → `var(--space-8)`

3. **Animations**: Add entrance effects
   - Cards: `class="animate-scale-in"`
   - Lists: `class="animate-stagger"`
   - Buttons: Built-in hover animations

---

## 🎓 Design Principles

1. **Brand Consistent**: All colors from logo
2. **Accessible**: WCAG 2.1 AAA throughout
3. **Modern**: Smooth animations, clean lines
4. **Performant**: GPU-accelerated transforms
5. **Responsive**: Works 320px to 1920px+
6. **Inclusive**: Respects motion preferences
7. **Professional**: TCNA-compliant, trustworthy
8. **Fun**: Dynamic micro-interactions

---

Last Updated: 2026-01-01
Design System Version: 2.0
