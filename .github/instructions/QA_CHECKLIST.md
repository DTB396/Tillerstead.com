# Tillerstead.com — Manual QA Checklist

> 🔗 **SUPPLEMENTS CENTRALIZED GOVERNANCE**  
> This checklist augments **[`/.ai/OUTPUT_RULES.md`](../../.ai/OUTPUT_RULES.md)** and the Tillerstead compliance system.  
> For code quality, accessibility, and legal standards, always reference the authoritative `.ai/` directory.  
> This file details human-driven verification for TCNA/New Jersey HIC compliance and conversion optimization.

---

**Run this checklist after pulling changes on a staging or local server. All findings must be logged with page, URL, browser, viewport, and reproduction steps.**

## Quick Run Commands (Windows PowerShell)

```powershell
# Serve locally (static, no build required)
python3 -m http.server
# Lint HTML & JS (requires Node deps)
npx htmlhint "**/*.html"
npx eslint .
# Jekyll build (vendor gems, offline)
bundle exec jekyll build
```

## Visual & Layout

- [ ] Header: sticky, with backdrop blur; no double borders or stacking artifacts
- [ ] Hero: clear semantic `<h1>`, visible eyebrow, lead text; CTAs aligned and accessible
- [ ] Services: exactly three cards in a responsive grid; spacing matches design tokens
- [ ] Portfolio: images fill cards, maintain aspect ratio, zero layout shift (CLS < 0.1)
- [ ] Breadcrumbs: visible on all non-home pages; "Home" and current page always shown on mobile
- [ ] Footer: columns stack cleanly on mobile; no overflow or clipping

## Navigation & Links

- [ ] Primary nav: current page highlighted with `aria-current="page"` (WCAG 2.1 AA)
- [ ] All nav links resolve (no 404s or dead anchors)
- [ ] Homepage services CTAs jump to `#services` anchors
- [ ] Footer legal links (Privacy, Sitemap) load and match canonical URLs

## Contact Flow

- [ ] Contact hero: displays valid email and tel CTAs (mailto: and tel: links)
- [ ] Form: required fields enforced (name, email, phone, city, details, request type); error messages are clear and accessible
- [ ] No JS console errors on submit (static POST to same URL)
- [ ] Tel/mailto links open correctly on desktop and mobile (test with screen reader)

## Images & Media

- [ ] Homepage card images: no cumulative layout shift; `object-fit: cover` applied
- [ ] Portfolio slider: fallback image renders, next/prev swaps are smooth
- [ ] Alt text: descriptive, specific, and New Jersey HIC-compliant (sample at least 3 images)
- [ ] Large images use `loading="lazy"` and `srcset` for responsive loading

## Accessibility (WCAG 2.1 AA)

- [ ] Skip link jumps to `#main` and is visible on focus
- [ ] Keyboard navigation: focus rings on all interactive elements; tab order logical
- [ ] Breadcrumb: last item uses `aria-current="page"`
- [ ] Reduced motion: prefers-reduced-motion honored; animations soften or disable
- [ ] Color contrast: all text meets 4.5:1 (normal) or 3:1 (large); test with high-contrast toggle

## SEO & Structured Data

- [ ] Each key page: unique `<title>` (50–60 chars) and meta description (150–160 chars)
- [ ] Canonical link: resolves to pretty URL (no `.html`)
- [ ] Open Graph: default OG image loads, correct dimensions and alt text
- [ ] Business JSON-LD: present in `<head>` on all pages, matches New Jersey HIC license and contact info
- [ ] BreadcrumbList JSON-LD: renders only on non-home pages
- [ ] ContactPage structured data: included and valid on contact page

## Performance

- [ ] No 404s in Network tab (manifest, icons, CSS, JS, images)
- [ ] CSS: only consolidated files loaded; no `*-refactored.css` or legacy assets
- [ ] Fonts: use `font-display: swap` or print trick; no render-blocking
- [ ] CLS: minimal on hero and images (LCP < 2.5s, CLS < 0.1)

## PWA/Manifest

- [ ] `manifest.webmanifest` loads; brand colors use design tokens (`--color-primary`, `--color-surface`)
- [ ] Shortcuts: open `/contact/` and `/portfolio/`
- [ ] Icons: SVGs under `assets/img/logo/`; PNGs at 192/256/384/512px under `assets/img/icons/` (if present)

## Content & Copy

- [ ] Services: language is specific, New Jersey-focused, and cites TCNA/New Jersey HIC standards where relevant
- [ ] Heading hierarchy: single `<h1>` per page, logical `<h2>`–`<h6>` structure
- [ ] Phone number and New Jersey HIC license: visible in footer and contact sections

## Optional/Nice-to-Have

- [ ] Manifest icons: use purpose-made PNGs in all required sizes under `assets/img/icons/`
- [ ] Convert heavy JPGs to WebP (preserve quality, test fallback)
- [ ] Move services card content to `_data/services.yml` for easy editing
- [ ] Add `cards-grid.html` include for portfolio highlights (modular, reusable)
- [ ] Implement lazy-loading thresholds or blur-up previews for gallery images

---

**Log all issues with: page, URL, browser, viewport, and reproduction steps.**  
**Reference `.ai/OUTPUT_RULES.md` and `.ai/COMPLIANCE.md` for all technical or legal questions.**

