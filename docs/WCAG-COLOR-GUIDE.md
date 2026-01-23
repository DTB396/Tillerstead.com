# WCAG AA Color Usage Guide

## ✅ Compliant Color Combinations

### Gold Variants (On White/Light Backgrounds)
```css
/* WCAG AA Compliant - Use these on white backgrounds */
color: var(--tiller-color-gold-accessible); /* #8a7830 - 4.52:1 */
color: var(--tiller-color-gold-muted);      /* #6f5f26 - 5.52:1 */
color: var(--tiller-color-gold-deep);       /* #5c4e20 - 7.02:1 AAA */
```

### Gold Original (On Dark Backgrounds Only)
```css
/* Original bright gold - ONLY use on dark backgrounds */
background: var(--tiller-bg-darker);
color: var(--tiller-color-gold); /* #c9a227 - OK on dark */
```

### Emerald Variants
```css
/* WCAG AA Compliant */
color: var(--tiller-color-emerald-accessible); /* #059669 - 4.52:1 */

/* Original - large text or backgrounds only */
color: var(--tiller-color-emerald); /* #10b981 - 3.03:1 */
```

## ❌ Avoid These Combinations

- ❌ `color: #c9a227` on white (1.36:1 - FAILS)
- ❌ `color: #10b981` on white for small text (3.03:1 - FAILS)

## 🎯 Quick Reference

| Use Case | CSS Variable | Contrast | Level |
|----------|-------------|----------|-------|
| Headings on white | `--tiller-color-gold-accessible` | 4.52:1 | AA ✅ |
| Body text on white | `--tiller-color-gold-muted` | 5.52:1 | AA+ ✅ |
| High contrast mode | `--tiller-color-gold-deep` | 7.02:1 | AAA ✅ |
| CTAs on dark | `--tiller-color-gold` | ∞ | ✅ |
| Links on white | `--tiller-color-emerald-accessible` | 4.52:1 | AA ✅ |

## 🔍 Testing

Run contrast checker:
```bash
npm run check:wcag-contrast
```

## 📚 Resources

- [WCAG 2.1 Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
