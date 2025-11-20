# Tillerstead.com — Manual QA Checklist

Use this checklist after pulling changes on a staging or local server.

## Quick Run Commands (Windows PowerShell)
```powershell
# Serve locally
python -m http.server
# Lint HTML + JS (optional; requires Node deps)
npx htmlhint "**/*.html"
npx eslint .
# Jekyll build (optional; vendor gems included)
bundle exec jekyll build
```

## Visual & Layout
- [ ] Header sticks, blur applies; no double borders
- [ ] Hero: clear H1, eyebrow, lead; buttons visible and aligned
- [ ] Services: three cards in a responsive grid; balanced spacing
- [ ] Portfolio previews: images fill cards; no layout shift on load
- [ ] Breadcrumbs show on non-home pages; Home + current visible on mobile
- [ ] Footer columns stack cleanly on mobile

## Navigation & Links
- [ ] Primary nav highlights current page (`aria-current="page"`)
- [ ] All nav links resolve without 404s
- [ ] Homepage services CTA links jump to `services` anchors
- [ ] Footer legal links load (Privacy, Sitemap)

## Contact Flow
- [ ] Contact hero shows email and call CTAs
- [ ] Form required fields enforce properly (name, email, phone, city, details, request type)
- [ ] No console errors on submit (static post to same URL)
- [ ] Tel and mailto links open correctly on desktop and mobile

## Images & Media
- [ ] Homepage card images: no CLS; `object-fit: cover` works
- [ ] Portfolio slider: initial fallback renders; next images swap correctly
- [ ] Alt text is descriptive (sample a few)
- [ ] Large images load lazily where appropriate

## Accessibility
- [ ] Skip link jumps to `#main`
- [ ] Keyboard nav: focus rings visible on links, buttons, controls
- [ ] Breadcrumb last item uses `aria-current="page"`
- [ ] Reduced motion honored: animations soften when enabled in OS
- [ ] Contrast meets WCAG AA; try high-contrast toggle

## SEO & Structured Data
- [ ] Unique `<title>` and meta description per key page
- [ ] Canonical link resolves to the pretty URL (no `.html`)
- [ ] Open Graph image loads (check the `default_og_image`)
- [ ] Business JSON-LD present in head on all pages
- [ ] BreadcrumbList JSON-LD renders on non-home pages only
- [ ] ContactPage structured data included on contact page

## Performance
- [ ] No 404s in Network (manifest, icons, CSS, JS)
- [ ] CSS requests match consolidated files; no `*-refactored.css`
- [ ] Fonts load without blocking rendering (swap/print trick)
- [ ] CLS minimal on hero and images (use Performance panel)

## PWA/Manifest
- [ ] `manifest.webmanifest` loads; brand colors (emerald/parchment)
- [ ] Shortcuts open `/contact/` and `/portfolio/`
- [ ] Icons resolve (temp use of `assets/img/tillerstead-logo.png`); optional: add true 192/256/384/512 PNGs

## Content & Copy
- [ ] Services language is specific and NJ-focused
- [ ] H1/H2 hierarchy is logical on each page
- [ ] Phone number and license appear where expected

## Optional/Nice-to-Have
- [ ] Replace manifest icons with purpose-made sizes under `assets/img/icons/`
- [ ] Convert more heavy JPGs to WebP (preserve quality)
- [ ] Move services card content to `_data/services.yml` for simple edits
- [ ] Add a `cards-grid.html` include for portfolio highlights
- [ ] Add lazy-loading thresholds or blur-up previews for galleries

## Issue Logging
Note any issues with page name, URL, browser, viewport, and steps to reproduce.
