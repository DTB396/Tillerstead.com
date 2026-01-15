# CSS Contrast Scan Report

**Generated:** 1/1/2026, 11:27:59 PM
**Standard:** WCAG 2.1 Level AA (4.5:1)

## Summary

- **Critical Issues:** 1 🚨
- **Medium Issues:** 1 ⚠️
- **Warnings:** 42

## 🚨 Critical Contrast Issues

### 1. Footer Contrast Issue [MEDIUM]

**File:** `_sass\00-settings\_luxury-refinements.scss:141`

**Code:**

```scss
--overlay-light: rgb(255, 255, 255, 0.7);
```

**Issue:** rgba(255,255,255,0.7) on dark teal may fail AA (needs testing)

**Recommendation:** Test contrast or increase to 0.85+ opacity

---

### 2. Low Opacity White Text [HIGH]

**File:** `_sass\30-components\_footer.scss:145`

**Code:**

```scss
color: rgb(255, 255, 255, 0.5); /* WCAG 2.1 compliant - increased from 0.3 */
```

**Issue:** White text at 50% opacity may fail contrast on dark backgrounds

**Recommendation:** Increase opacity to >= 0.85 or use semantic color variable

---

## ⚠️ Warnings

| Type                | File:Line                                           | Note                                            |
| ------------------- | --------------------------------------------------- | ----------------------------------------------- |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:117` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:118` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:119` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:123` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:132` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:133` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:137` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:152` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:153` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:154` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:155` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:156` | Using !important may override contrast fixes    |
| Hardcoded Color     | `_sass\00-settings\_dark-theme-experiment.scss:157` | Consider using CSS variable for maintainability |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:157` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:158` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:159` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:160` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:161` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:170` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:172` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:178` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:198` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:199` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:200` | Using !important may override contrast fixes    |
| Hardcoded Color     | `_sass\00-settings\_dark-theme-experiment.scss:206` | Consider using CSS variable for maintainability |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:206` | Using !important may override contrast fixes    |
| Hardcoded Color     | `_sass\00-settings\_dark-theme-experiment.scss:212` | Consider using CSS variable for maintainability |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:212` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:221` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:222` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:244` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:245` | Using !important may override contrast fixes    |
| Hardcoded Color     | `_sass\00-settings\_dark-theme-experiment.scss:267` | Consider using CSS variable for maintainability |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:267` | Using !important may override contrast fixes    |
| Hardcoded Color     | `_sass\00-settings\_dark-theme-experiment.scss:275` | Consider using CSS variable for maintainability |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:275` | Using !important may override contrast fixes    |
| Hardcoded Color     | `_sass\00-settings\_dark-theme-experiment.scss:281` | Consider using CSS variable for maintainability |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:281` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:289` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:298` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:299` | Using !important may override contrast fixes    |
| Dark Theme Override | `_sass\00-settings\_dark-theme-experiment.scss:300` | Using !important may override contrast fixes    |

---

**Compliance:** TCNA 2024, NJ HIC, WCAG 2.1

