# Tillerstead Compliance Audit Report

**Generated:** 2026-01-19T05:20:45.870Z
**License:** NJ HIC #13VH10808800
**Site:** https://tillerstead.com

## Summary

| Category | Status |
|----------|--------|
| TCNA 2024 | WARNING |
| NJ HIC | FAIL |
| WCAG 2.1 | FAIL |
| Build Phase | FAIL |
| Metadata | FAIL |
| Color Contrast | FAIL |

**Total Checks:** 13
**Passed:** 0
**Warnings:** 1
**Failures:** 5

## Detailed Findings


### TCNA 2024 Handbook Compliance
**Status:** WARNING

#### Issues

- **WARNING**: Could not read index.html: ENOENT: no such file or directory, open 'C:\web-dev\github-repos\Tillerstead.com\index.html'
- **WARNING**: Could not read pages/services.html: ENOENT: no such file or directory, open 'C:\web-dev\github-repos\Tillerstead.com\pages\services.html'
- **WARNING**: Could not read pages/build/index.md: ENOENT: no such file or directory, open 'C:\web-dev\github-repos\Tillerstead.com\pages\build\index.md'
- **WARNING**: Could not audit Build Phase guides: ENOENT: no such file or directory, scandir 'C:\web-dev\github-repos\Tillerstead.com\_build'

### undefined
**Status:** FAIL

#### Issues

- **ERROR**: License number not found on any major pages - violates NJ HIC requirements
- **WARNING**: HIC disclaimers found on fewer than 3 pages - recommend prominent display

### WCAG 2.1 Accessibility
**Status:** FAIL

#### Issues

- **ERROR**: Could not audit WCAG compliance: ENOENT: no such file or directory, open 'C:\web-dev\github-repos\Tillerstead.com\index.html'

### undefined
**Status:** FAIL

#### Issues

- **ERROR**: Could not audit Build Phase guides: ENOENT: no such file or directory, scandir 'C:\web-dev\github-repos\Tillerstead.com\_build'

### undefined
**Status:** FAIL

#### Issues

- **ERROR**: Could not audit metadata: ENOENT: no such file or directory, open 'C:\web-dev\github-repos\Tillerstead.com\index.html'

### undefined
**Status:** FAIL

#### Issues

- **WARNING**: Meets WCAG AA (4.5:1) but not AAA (7:1) — Teal on White [4.54:1]
- **WARNING**: Meets WCAG AA (4.5:1) but not AAA (7:1) — Red on White [5.14:1]
- **ERROR**: Does not meet WCAG AA minimum (4.5:1) — Gold on White [1.36:1]
- **WARNING**: Meets WCAG AA (4.5:1) but not AAA (7:1) — White on Teal [4.54:1]
