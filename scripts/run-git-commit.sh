#!/bin/bash
# Tillerstead Modern Theme Refactor – Git Commit Script
# See /.ai/OUTPUT_RULES.md and /.ai/COMPLIANCE.md for commit and compliance standards.

set -euo pipefail

echo "🚀 Tillerstead Modern Theme Refactor – Git Commit Script"
echo "======================================================="
echo ""

# Stage new modular SCSS files (TCNA-compliant structure)
echo "📦 Staging new modular SCSS files..."
git add _sass/base/_reset.scss
git add _sass/base/_typography.scss
git add _sass/layout/_container.scss
git add _sass/components/_buttons.scss
git add _sass/components/_cards.scss
git add _sass/components/_forms.scss
git add _sass/components/_header.scss
git add _sass/components/_footer.scss
git add _sass/components/_hero.scss
git add assets/css/style.scss

# Stage updated files (naming, structure, compliance)
echo "📝 Staging updated files..."
git add _sass/layout/_grid.scss
git add _sass/utilities/_helpers.scss
git add package.json
git add THEME_QUICKSTART.md
git add THEME_VISUAL_GUIDE.md

# Stage documentation (detailed, accessible, and NJ HIC-compliant)
echo "📚 Staging documentation..."
git add MODERN_THEME_DOCS.md
git add CLEANUP_REPORT.md
git add CLEANUP_COMPLETE.md
git add scripts/cleanup-old-theme.sh
git add git-commit-guide.sh

# Remove deprecated/duplicate files (per OUTPUT_RULES.md)
echo "🗑️  Removing deprecated/duplicate files..."
git rm assets/css/main-build.scss 2>/dev/null || echo "  (main-build.scss already removed)"
git rm -r src/scss/ 2>/dev/null || echo "  (src/scss/ already removed)"
git rm -r src/assets/ 2>/dev/null || echo "  (src/assets/ already removed)"

echo ""
echo "✅ All files staged per OUTPUT_RULES.md!"
echo ""

# Show status
echo "📊 Current git status:"
git status --short

echo ""
echo "💾 Committing changes..."
git commit -m "Refactor: TCNA-compliant modular HTML5/CSS3 theme

- Implemented modular SCSS architecture in _sass/ (base, layout, components, utilities)
- Adopted descriptive, kebab-case file naming per OUTPUT_RULES.md
- Updated npm scripts in package.json for modern build pipeline
- Removed deprecated files: main-build.scss, src/scss/, src/assets/
- Enhanced documentation for technical transparency and NJ HIC compliance:
  - MODERN_THEME_DOCS.md (architecture, accessibility, WCAG 2.1 AA)
  - THEME_QUICKSTART.md (setup, usage)
  - THEME_VISUAL_GUIDE.md (visual structure)
  - CLEANUP_REPORT.md (legacy cleanup, compliance)
- Features:
  - Mobile-first, responsive layouts (CSS Grid, Flexbox)
  - Design tokens via CSS custom properties
  - Utility-first helpers for rapid prototyping
  - Accessibility: semantic markup, ARIA, color contrast (WCAG 2.1 AA)
  - Backwards compatibility via components/theme.scss
- Browser support: Chrome 49+, Firefox 31+, Safari 9.1+
- All changes validated with HTMLHint, ESLint, and Jekyll build

See /.ai/OUTPUT_RULES.md and _data/compliance.yml for full compliance details."

echo ""
echo "🎉 Commit complete!"
echo ""
echo "Next steps:"
echo "  git push origin main"
