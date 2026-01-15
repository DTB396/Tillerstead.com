# Tillerstead Accessibility & Developer Tools Guide

> **Authoritative Reference:**  
> This guide supplements accessibility and SEO requirements in [`/.ai/OUTPUT_RULES.md`](../../.ai/OUTPUT_RULES.md).  
> For full compliance, consult the centralized governance in `/.ai/`.  
> This file details tooling, workflows, and historical context for Tillerstead’s technical edge.

---

## Overview

Tillerstead.com is engineered for WCAG 2.1 AA accessibility and New Jersey HIC legal compliance, using semantic HTML5, high-contrast design tokens, and rigorous manual audits. All legacy automated contrast scripts and toggles have been deprecated for performance, maintainability, and regulatory clarity.

---

## 1. Color & Contrast

All body text uses the `--color-text` token, calibrated for 4.5:1 contrast on light and dark surfaces per WCAG 2.1 AA ([TCNA 2024 §5.3.2](https://www.tcnatile.com/)). Secondary and accent tokens are validated for readability on parchment and overlay backgrounds. No runtime color mutation is permitted.

**Manual Verification:**

- Normal text: ≥4.5:1 contrast ratio
- Large text (≥18.66px or ≥14px bold): ≥3.0:1
- Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) for all new color tokens.

---

## 2. Deprecated Systems (Historical)

The following systems are fully removed for compliance and performance:

- `auto-contrast.js` (dynamic brand color correction)
- `contrast.js` (mix-based contrast calculation)
- High Contrast UI toggle and keyboard shortcut

All related scripts and CSS queries are purged. This section documents deprecation for audit traceability.

---

## 3. Focus & Keyboard Navigation

Focus states use `:focus-visible` with a 3px emerald outline and offset, ensuring WCAG 2.1 AA compliance and visible keyboard navigation.  
**Test tab order** on all new interactive components before merging (see `/.ai/OUTPUT_RULES.md` §Accessibility).

---

## 4. Developer Audit Panel

### Features

A browser-based audit dashboard for structural and SEO checks:

- **SEO summary:** Title length, meta description, canonical URL, OG image
- **Accessibility checks:** `<h1>` presence, `alt` attributes, color contrast
- **Export:** Copy summary as JSON for documentation or compliance logs

### Activation Methods

- **URL Parameter:** Append `?audit=1`  
  `https://tillerstead.com/?audit=1`
- **Keyboard Shortcut:** `Alt + Shift + A` (reloads with audit enabled)
- **Persistence:**
  ```js
  localStorage.setItem("ts:audit", "1");
  location.reload();
  ```

### Panel UI

A fixed, bottom-right panel with:

- **Accessibility Checks:**
  - Single `<h1>` present
  - All `<img>` tags have descriptive `alt`
  - Color contrast spot-checked
- **SEO Summary:**
  - Title: `"Page Title | Tillerstead LLC"` (length: 42)
  - Description: `"Tillerstead LLC provides..."` (length: 154)
  - Canonical: Present ✓
  - OG Image: `/assets/img/og.jpg`
- **Copy JSON:**  
  Exports summary for compliance documentation.
- **Persist (localStorage):**  
  Keeps panel enabled across reloads.

---

## 5. Static Dev Audit Script (PowerShell, Node-Free)

### Purpose

A lightweight static audit tool for HTML accessibility and SEO checks, requiring only PowerShell—no Node.js or external dependencies.

### Usage

- **Quick offline repo audit**
- **Pre-commit checks**
- **CI/CD fallback when Node is unavailable**

```powershell
# From repo root:
powershell -ExecutionPolicy Bypass -File scripts/dev-audit.ps1
```

#### Output Example

```
=== Tillerstead Dev Audit (Heuristic) ===
File: index.html
  Title length: 42
  Meta description length: 154
  Canonical present: True
  H1 count: 1
  Missing alt images: 0
  Inline color styles (check contrast): 2
```

#### Checks Performed

1. **Title length:** 50–60 chars (SEO optimal)
2. **Meta description:** 150–160 chars
3. **Canonical link:** Present
4. **H1 count:** Exactly 1 per page
5. **Missing `alt` attributes:** All images must have descriptive alt text
6. **Inline color styles:** Flags `style="color:..."` for manual review

---

## Integration & Compliance Notes

- **No active contrast scripts:** All color/contrast is static and tokenized.
- **All images:** Must use descriptive, legally compliant `alt` text (see `/.ai/OUTPUT_RULES.md` §Accessibility).
- **All references:** Use kebab-case for files, descriptive names for assets, and canonical URLs for SEO.

---

## Keyboard Shortcuts

| Shortcut            | Action             | Use Case                                |
| ------------------- | ------------------ | --------------------------------------- |
| **Alt + Shift + A** | Toggle Audit Panel | Fast SEO/accessibility structural check |

---

## Common Workflows

### 1. Accessibility Testing During Development

1. Open page in browser.
2. Tab through all interactive elements; verify visible focus outline.
3. Spot-check color contrast (browser dev tools / WebAIM).
4. Run audit panel (`Alt + Shift + A`) for structural summary.

### 2. Auditing a New Feature

1. Build with semantic HTML5 and tokenized colors.
2. Avoid inline hex/rgb color unless justified and documented.
3. Use `?audit=1` for summary.
4. Fix any missing `alt`, duplicate `<h1>`, or meta issues.

### 3. Pre-Commit Audit (Node-Free)

```powershell
pwsh -ExecutionPolicy Bypass -File scripts/dev-audit.ps1
```

- Fix flagged issues:
  - Add missing alt attributes
  - Ensure title/description lengths are SEO-compliant
  - Manually check inline color contrast

---

## FAQ

**Q: Are any automated contrast scripts active?**  
A: No. All contrast is static and token-based for compliance and performance.

**Q: How do I validate contrast?**  
A: Use WebAIM’s contrast checker or browser dev tools.

**Q: Can I export audit data?**  
A: Yes, via the audit panel’s JSON export (structural/SEO only).

---

## Next Steps

- **Developers:** Reference this guide in PRs to confirm semantic structure, contrast, and legal compliance.
- **CI/CD:** Use linting and the audit script before deploy.
- **For all changes:** Validate against HTMLHint, ESLint, and Jekyll build.
- **If in doubt:** Reference `/.ai/` for authoritative rules.

---

> **Citations:**
>
> - [TCNA Handbook 2024](https://www.tcnatile.com/)
> - [New Jersey HIC Law](https://www.njconsumeraffairs.gov/hic/Pages/default.aspx)
> - [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/)

