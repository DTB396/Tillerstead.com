---

# OUTPUT_RULES.md — Code Quality & Deployment-Safe Standards

**Inherits From**: `SYSTEM.md`
**Scope**: Code, documentation, assets, and workflow standards
**Applies To**: Files modified in a given commit (context-aware)
**Authority**: Tillerstead conventions, TCNA, NJ HIC (where applicable), WCAG 2.1, modern web standards

---

# 1) Purpose

This document defines quality, accessibility, and safety standards **without blocking unrelated deployments**.

**Core principle**:

> A rule only blocks deployment if the modified file type is within that rule’s scope **and** the violation presents a real functional, accessibility, security, or legal risk.

Formatting tweaks, copy edits, and unrelated documentation updates **must never be blocked** by CSS, JS, or HTML rules.

---

## 2) Enforcement Model (Mandatory)

All rules are classified by **severity** and **scope**.

### Severity Levels

#### A. BLOCKER (must block commit/deploy)

Used only when the issue causes:

* Runtime failure
* Security exposure
* Accessibility failure (WCAG AA regression)
* Broken build
* Legal/compliance violation

#### B. REQUIRED (must be fixed *only if applicable*)

Must be fixed **when the modified file falls within the rule’s scope**.

#### C. RECOMMENDED (never blocks)

Best practices, optimization goals, or stylistic consistency.

---

## 3) Scope Awareness (Non-Negotiable)

A rule **only applies** if the commit modifies files in its scope.

| Rule Type         | Applies Only If Commit Touches                     |
| ----------------- | -------------------------------------------------- |
| HTML rules        | `*.html`, Jekyll layouts/includes                  |
| CSS/SCSS rules    | `*.css`, `*.scss`                                  |
| JS rules          | `*.js`, `*.mjs`                                    |
| Jekyll rules      | `_layouts/`, `_includes/`, pages with front matter |
| Performance rules | HTML/CSS/JS affecting render path                  |
| Docs rules        | `README.md`, `*.md`                                |
| Assets            | `images/`, `svg/`, fonts                           |

**If no scoped files are modified → rule is skipped automatically.**

---

## 4) File Naming & Structure

### Severity: REQUIRED (Scoped)

Applies only to **new or renamed files**.

#### HTML

* `kebab-case.html`
* Root pages: `index.html`, `404.html`, `success.html`

#### CSS / SCSS

* `kebab-case.css`
* SCSS partials must start with `_`

#### JavaScript

* `camelCase.js` (preferred) or `kebab-case.js`
* Be consistent within a directory

#### Images / SVG

* `kebab-case.svg|png|jpg|webp`
* `icon-*`, `pattern-*` prefixes where applicable

#### Directories

* `kebab-case/`
* Underscore-prefixed only for system dirs (`_includes`, `_layouts`, `_sass`)

---

## 5) HTML Standards

### HTML Severity

* **BLOCKER**: Broken semantics, duplicate IDs, missing labels on form controls
* **REQUIRED**: Semantic structure, meta basics
* **RECOMMENDED**: Advanced SEO/perf enhancements

### Semantic & Accessibility (WCAG 2.1 AA)

* One `<h1>` per page
* Logical heading order
* `<label for>` on all form inputs
* `alt` text required for informative images
* ARIA only when semantic HTML is insufficient

### Meta & SEO (REQUIRED)

* `<meta charset="UTF-8">`
* `<meta name="viewport">`
* Unique `<title>`
* `<meta name="description">`

### Performance (RECOMMENDED unless regression detected)

* `loading="lazy"` for non-critical images
* Defer or module-load scripts
* Responsive images via `srcset`

### HTMLHint

* **BLOCKER only if HTMLHint error affects rendering or accessibility**
* Style-only warnings → **RECOMMENDED**

---

## 6) CSS / SCSS Standards

### CSS Severity

* **BLOCKER**: Broken build, invalid CSS
* **REQUIRED**: Token usage for theme-critical styles
* **RECOMMENDED**: Optimization and architecture rules

### Tokens

* Prefer CSS variables and SCSS tokens
* **Exception allowed** for:

  * Third-party overrides
  * One-off experimental components
  * Temporary debug styling (must be removed before release)

### Architecture

* Mobile-first
* Grid for layout, Flexbox for alignment
* BEM-style naming preferred, not enforced

### Linting

* Stylelint warnings do **not** block unless they cause invalid CSS or visual breakage

---

## 7) JavaScript Standards

### JS Severity

* **BLOCKER**: Runtime errors, uncaught promise rejections, syntax failures
* **REQUIRED**: ES6+, error handling in async code
* **RECOMMENDED**: Performance optimizations

### Rules

* Use `const` / `let`
* Wrap async logic in `try/catch`
* Fail gracefully — UI must not hard-crash

### ESLint

* Errors that break execution → **BLOCKER**
* Style preferences → **RECOMMENDED**

---

## 8) Jekyll / Liquid

### Jekyll Severity: REQUIRED (Scoped)

Applies only to files with front matter or Liquid usage.

* Front matter must include `layout`, `title`, `description`
* Avoid heavy logic in templates
* Prefer data files for complexity

---

## 9) Performance Targets

### Performance Severity

* **BLOCKER**: Regressions that materially degrade UX
* **RECOMMENDED**: Target scores

### Targets (Goals, not gates)

* Desktop: Perf ≥ 90
* Mobile: Perf ≥ 85
* Accessibility ≥ 95
* CLS < 0.1, LCP < 2.5s

Performance budgets **must not block copy-only or doc-only commits**.

---

## 10) Documentation Rules

### Documentation Severity: REQUIRED (Scoped)

* Update docs **only when behavior, structure, or usage changes**
* No requirement to update README for cosmetic or copy edits

---

## 11) Git Commit Standards

### Severity: REQUIRED

Conventional Commits format:

```text
type(scope): subject
```

* Enforced only on **commit message**
* Never blocks file content changes

---

## 12) Security

### Severity: BLOCKER

* Secrets, API keys, credentials
* Personal data
* Private client information

Use `.env` (gitignored) and environment config.

---

## 13) Mandatory Failure Behavior (Critical Fix)

If a rule fails, the enforcement system **must output**:

1. **Severity**
2. **File(s) and line range**
3. **Why it failed (plain English)**
4. **Exact proposed fix**
5. **Minimal-change alternative**

> A failure without a proposed fix is itself non-compliant.

---

## 14) Fast Verification Checklist

### Only check what changed

* [ ] Scope applies to modified files
* [ ] No BLOCKER issues introduced
* [ ] REQUIRED issues fixed where applicable
* [ ] RECOMMENDED issues logged, not blocked

---

**Version**: 2.0.0 (deployment-safe)
**Last Updated**: 2026-01-02
**Authority**: SYSTEM.md, STYLE.md, DOMAIN.md, COMPLIANCE.md
**Intent**: Enforce quality **without sabotaging velocity**

---

