
# Includes Refactor Changelog (2026-01-12)

## Major Changes

- All major section and component includes moved to organized subfolders:
  - `components/ts-services.html`
  - `components/ts-plans.html`
  - `components/ts-portfolio.html`
  - `components/ts-peace-of-mind.html`
  - `components/ts-icon.html`
  - `components/ts-service-card.html`

- All references in layouts, pages, and other includes updated to use new paths.

- Duplicates and legacy versions removed from:
  - `_includes/` root
  - `_includes/content/`

## Files Removed

- `_includes/ts-services.html`
- `_includes/ts-plans.html`
- `_includes/ts-portfolio.html`
- `_includes/ts-peace-of-mind.html`
- `_includes/ts-icon.html`
- `_includes/ts-service-card.html`
- `_includes/content/ts-services.html`
- `_includes/content/ts-plans.html`
- `_includes/content/ts-portfolio.html`

## Structure Now

- Canonical, reusable includes are in `components/`.
- No legacy or duplicate includes remain in root or content/.
- All references are up to date.

---
This changelog documents the full audit, refactor, and cleanup of the `_includes/` directory for maintainability and best practices.
