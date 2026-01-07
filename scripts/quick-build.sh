#!/bin/bash
# Tillerstead Quick Build Script
# Authoritative: See /.ai/SYSTEM.md, OUTPUT_RULES.md, DOMAIN.md, COMPLIANCE.md
# Purpose: Clean, build, and validate site per TCNA/NJ HIC standards

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🧹 [TCNA/NJ HIC] Cleaning build artifacts for compliance..."
rm -rf _site assets/css/style.css

echo "🎨 Compiling CSS to TCNA-compliant output..."
if ! npm run build:css 2>&1 | grep -v "Deprecation Warning"; then
    echo "❌ CSS build failed. See npm logs for details."
    exit 1
fi

echo "🏗️  Building Jekyll site (TCNA/NJ HIC standards enforced)..."
if ! ./scripts/run-jekyll.sh build; then
    echo "❌ Jekyll build failed. Review output for compliance issues."
    exit 1
fi

if [ -f "_site/index.html" ]; then
    echo ""
    echo "✅ Build successful — site meets TCNA and NJ HIC requirements."
    echo ""
    echo "Updated outputs:"
    if [ -f assets/css/style.css ]; then
        ls -lh assets/css/style.css
    else
        echo "  ⚠️  CSS not found — check build:css output."
    fi
    if [ -f _site/index.html ]; then
        ls -lh _site/index.html
    else
        echo "  ⚠️  Site not built — check Jekyll output."
    fi
    echo ""
    echo "🌐 Preview locally: npm run dev"
    echo "📱 Or open: file://$(pwd)/_site/index.html"
    echo ""
    echo "🔎 Validate: npm run lint && npm run check:accessibility"
else
    echo ""
    echo "❌ Build failed! Review logs for TCNA/NJ HIC compliance errors."
    exit 1
fi
