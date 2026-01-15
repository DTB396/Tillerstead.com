# Build Troubleshooting Guide

> **This guide supplements the authoritative build standards in [`/.ai/OUTPUT_RULES.md`](../../.ai/OUTPUT_RULES.md) and [`/.ai/CODEX.md`](../../.ai/CODEX.md).**  
> For official workflows, compliance, and technical requirements, always consult the centralized governance in the `.ai/` directory.  
> This document provides targeted troubleshooting for Tillerstead’s static site build, with actionable, standards-based solutions.

---

## Homepage Not Updating After Edits

### Problem

You’ve modified source files, but the homepage remains unchanged after refresh.

### Root Cause

Jekyll is a **static site generator**—all changes to:

- HTML, Liquid templates (`_includes/`, `_layouts/`)
- SCSS/CSS (`_sass/`, `assets/css/`)
- Data (`_data/`)
- Configuration (`_config.yml`)
  require a full rebuild to propagate.

### Solution

**Always rebuild after edits:**

```bash
# Complete build (CSS + Jekyll)
npm run build

# Or build and serve with live reload
npm run dev
```

#### Build Workflow Breakdown

1. **CSS Compilation** (`npm run build:css`)
   - Compiles `assets/css/main.scss` → `assets/css/main.css`
   - Resolves all `@import` statements from `_sass/`
   - Minifies and optimizes output per OUTPUT_RULES.md

2. **Jekyll Static Build** (`bundle exec jekyll build`)
   - Processes Liquid templates and layouts
   - Outputs accessible, standards-compliant HTML to `_site/`
   - Copies assets to `_site/assets/`

3. **Result:**
   - `_site/` contains the latest, production-ready site

#### Common Pitfalls

**Avoid:**

- Editing files and refreshing the browser without rebuilding
- Modifying files directly in `_site/` (these are overwritten on build)

**Do:**

- Edit only source files
- Run `npm run build` after changes
- Confirm updates in `_site/`
- Then refresh your browser

#### Quick Verification

```bash
# Confirm CSS is compiled
ls -lh assets/css/main.css

# Confirm Jekyll output exists
ls -lh _site/index.html

# Check last build timestamp
stat -c '%y' _site/index.html
```

#### Recommended: Dev Server

For automatic rebuilds and live reload:

```bash
npm run dev
```

- Local server at `http://localhost:4000`
- Auto-rebuilds on file changes
- Live reload for rapid iteration

#### CI/CD Pipeline

On push to `main`, GitHub Actions:

1. Runs all linters (ESLint, HTMLHint)
2. Compiles CSS
3. Builds Jekyll site
4. Deploys to GitHub Pages/Netlify

**Local builds are required for local preview and compliance.**

---

## CSS Not Updating

### Symptoms

- SCSS changes not reflected in browser
- Outdated styles persist

### Solution

```bash
# Force CSS rebuild
npm run build:css

# Rebuild Jekyll for HTML updates
bundle exec jekyll build

# Or run both
npm run build
```

#### Cache Busting

If styles still don’t update:

- **Chrome/Edge:** Ctrl+Shift+R (Cmd+Shift+R on Mac)
- **Firefox:** Ctrl+F5
- **Safari:** Cmd+Option+R

---

## Jekyll Template or Config Changes Not Showing

### Check:

- `_includes/` (partials)
- `_layouts/` (layouts)
- `_config.yml` (site config)

**Note:**  
Changes to `_config.yml` require a full dev server restart.

```bash
# Stop server (Ctrl+C)
# Restart
npm run dev
```

---

## Logo or Image Updates Not Appearing

### SVG Logos

SVGs are aggressively cached. To update:

1. **Hard refresh** (Ctrl+Shift+R)
2. **Clear browser cache**
3. **Add version query string** (temporary):
   ```html
   <img
     src="/assets/img/logo.svg?v=2"
     alt="Tillerstead logo: TCNA-compliant tilework"
   />
   ```

### PNG Generation

To generate high-quality PNGs from SVGs:

```bash
node scripts/generate-png-logos.js
```

**Dependencies:**

- ImageMagick (recommended):
  ```bash
  sudo apt-get update && sudo apt-get install -y imagemagick
  ```

---

## Quick Fixes Checklist

- [ ] Run `npm run build`
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Confirm `_site/` is up-to-date
- [ ] Verify `assets/css/main.css` is compiled and matches OUTPUT_RULES.md
- [ ] Restart dev server after `_config.yml` changes
- [ ] Clear browser cache
- [ ] Check browser console for errors (F12)
- [ ] Ensure all file names and paths follow kebab-case and OUTPUT_RULES.md

---

## Still Not Working? Advanced Recovery

### Clean Build

```bash
# Remove generated files
rm -rf _site assets/css/main.css

# Full rebuild
npm run build

# Restart dev server
npm run dev
```

### Error Diagnostics

```bash
# Verbose Jekyll build for error tracing
JEKYLL_TRACE=1 bundle exec jekyll build

# Check for Sass errors
npm run build:css 2>&1 | less
```

### File Path Verification

```bash
# Inspect built assets
ls -lh _site/assets/css/
ls -lh _site/assets/img/logo/

# Confirm file integrity
diff assets/css/main.css _site/assets/css/main.css
```

---

## Compliance, Accessibility & Performance

- All images must have descriptive, legally compliant `alt` text (see DOMAIN.md, COMPLIANCE.md)
- Confirm color contrast and keyboard navigation (WCAG 2.1 AA)
- Validate all changes with:
  - `npx htmlhint '**/*.html'`
  - `npx eslint .`
  - Jekyll build (`bundle exec jekyll build`)
- Meet performance targets:
  - LCP < 2.5s, TTI < 3s, CLS < 0.1 (see OUTPUT_RULES.md)

---

## Need Help?

- Review `.ai/` governance for authoritative standards
- Reference OUTPUT_RULES.md for naming, structure, and compliance
- For persistent issues, open a detailed issue with:
  - Steps to reproduce
  - Error logs
  - Screenshots of file structure and browser console

**Tillerstead: TCNA-literate, New Jersey HIC-compliant, and committed to technical excellence.**  
Every build, every pixel—no shortcuts, no technical debt.

