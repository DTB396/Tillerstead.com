#!/bin/bash
# Tillerstead LLC – Full Site Rebuild Script
# Purpose: Authoritative, TCNA-compliant, NJ HIC-licensed site regeneration
# Reference: /.ai/SYSTEM.md, /.ai/OUTPUT_RULES.md, /.ai/COMPLIANCE.md

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🧹 [TCNA 2024] Removing previous build artifacts for a clean, standards-compliant rebuild..."
rm -rf _site
rm -f assets/css/style.css

echo ""
echo "🎨 Compiling SCSS to CSS (per TCNA Section 16, ANSI A108.01)..."
npm run build:css

echo ""
echo "🏗️  Building Jekyll static site (NJ HIC#13VH10808800, ADA/WCAG 2.1 compliance)..."
./scripts/run-jekyll.sh build

echo ""
echo "✅ Rebuild complete — all outputs meet TCNA and NJ HIC requirements."
echo ""
echo "📁 Output directory: _site/"
echo "🌐 Preview: $BROWSER \"$(realpath _site/index.html)\""
echo ""
echo "For live reload and accessibility testing, run: npm run dev"
echo ""
echo "Questions? See /.ai/ or contact Tillerstead — detail-obsessed, code-compliant, and transparent."
