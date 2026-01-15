# Quality Standards & Best Practices

> ⚠️ **CENTRALIZED GOVERNANCE**  
> This file is maintained for historical reference only.  
> **Authoritative source:** [/.ai/OUTPUT_RULES.md](../../.ai/OUTPUT_RULES.md)  
> **AI tools must reference:** `/.ai/SYSTEM.md` → `/.ai/OUTPUT_RULES.md`  
> All standards below are enforced by CI and manual QA.

---

## 🎯 Tillerstead Quality Objectives

- **Semantic HTML5**: Use `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` for structure.  
  _Reference: [OUTPUT_RULES.md §HTML]_
- **SEO Compliance**: Every page must include unique `<title>`, meta description, Open Graph, Twitter Card, canonical URL, and viewport meta.  
  _Reference: [OUTPUT_RULES.md §SEO]_
- **Brand Consistency**: All colors, typography, and spacing must use CSS custom properties from `_sass/base/_tokens.scss`.  
  _Reference: [STYLE.md §Design System]_
- **Performance**: LCP < 2.5s, CLS < 0.1, TTI < 3s, FCP < 1.8s.  
  _Reference: [OUTPUT_RULES.md §Performance]_
- **Accessibility**: WCAG 2.1 AA minimum. All images require descriptive `alt` text; ensure keyboard navigation and ARIA compliance.  
  _Reference: [OUTPUT_RULES.md §Accessibility], [COMPLIANCE.md §Legal]_
- **Technical Authority**: Cite TCNA 2024 and New Jersey HIC standards where relevant.  
  _Reference: [DOMAIN.md §Compliance]_

---

## 🌐 SEO & Performance Checklist

- **HTML5 Structure**:
  - Single `<h1>` per page; logical heading order.
  - `loading="lazy"` and `srcset` for images.
  - Use `defer` or `type="module"` for scripts.
  - `rel="preload"` for critical fonts/images.

- **Meta Tags (Required on Every Page):**
  - `<title>`: 50–60 chars, unique, TCNA/New Jersey HIC compliant.
  - `<meta name="description">`: 150–160 chars, service-specific.
  - Open Graph: `og:title`, `og:description`, `og:image`, `og:url`.
  - Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.
  - `<link rel="canonical">`
  - `<meta name="viewport" content="width=device-width,initial-scale=1">`

- **Structured Data:**
  - Use JSON-LD for `LocalBusiness`, `Organization`, `Service`, and `BreadcrumbList` schemas.
  - Ensure all business info matches New Jersey HIC registration.

- **Performance Targets:**
  - LCP < 2.5s
  - TTI < 3s
  - CLS < 0.1
  - FCP < 1.8s
  - Optimize images (WebP preferred), minimize HTTP requests, inline critical CSS.

---

## 🎨 Brand & Design Standards

- **Design Tokens:**
  - Use only variables from `_sass/base/_tokens.scss` for all colors, typography, spacing, shadows, and radii.
  - Never hardcode colors or fonts.
  - Utility classes for spacing, backgrounds, and typography.

- **CSS Practices:**
  - Modular, reusable, mobile-first.
  - Minimum 4.5:1 contrast for text, 3:1 for large/bold text.
  - No !important except for documented accessibility overrides.

---

## 🔧 Quality Control Process

- **Pre-Commit:**
  - `npm ci`
  - `npm run lint`
  - `bundle install && bundle exec jekyll build`
  - All changes must pass HTMLHint, ESLint, and Jekyll build.

- **Code Review:**
  1. Semantic HTML5 and heading order
  2. Accessibility: ARIA, keyboard, alt text
  3. SEO: meta tags, structured data, canonical URLs
  4. Performance: image optimization, lazy loading, minimal JS
  5. Brand: design tokens, utility classes
  6. Code: clean, maintainable, no dead code
  7. Security: no secrets, XSS protection

---

## 📊 Quality Metrics

- **Automated:**
  - ESLint (JavaScript)
  - HTMLHint (HTML)
  - Jekyll build (site generation)

- **Manual:**
  - Visual consistency
  - Cross-browser (Chrome, Firefox, Safari, Edge)
  - Mobile responsiveness (320–1920px)
  - Keyboard navigation
  - Lighthouse: performance, accessibility, SEO
  - W3C HTML validation

---

## 🛠️ Tools & Scripts

- **SEO Audit:**
  - `scripts/seo-audit.js` checks for required meta tags and outputs `seo-audit.md`.
  - Run: `node scripts/seo-audit.js`

- **Contrast Checker:**
  - Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
  - Validate all text/background pairs using design tokens.

---

## 📝 Documentation & Commit Standards

- **Comments:**
  - Document complex logic, browser workarounds, and accessibility overrides.

- **File Headers:**
  - For major CSS/JS files, include a header with purpose, dependencies, and notes.

- **Commit Messages:**
  - Use [Conventional Commits](https://www.conventionalcommits.org/):
    - `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `chore:`
  - Example: `feat: add TCNA-compliant contact form with ARIA validation`

---

## 🚀 Continuous Improvement

- **Quarterly:**
  - Update dependencies, review SEO/meta, audit accessibility, run Lighthouse, validate HTML, test on real devices.

- **Ongoing:**
  - Monitor Core Web Vitals, gather user feedback, stay current with TCNA/New Jersey HIC and web standards.

---

**Reference:**

- [/.ai/SYSTEM.md](../../.ai/SYSTEM.md)
- [/.ai/OUTPUT_RULES.md](../../.ai/OUTPUT_RULES.md)
- [/.ai/STYLE.md](../../.ai/STYLE.md)
- [/.ai/DOMAIN.md](../../.ai/DOMAIN.md)
- [/.ai/COMPLIANCE.md](../../.ai/COMPLIANCE.md)

