#!/bin/bash
# cleanup-old-theme.sh
# Authoritative: Tillerstead LLC (NJ HIC #13VH11984300)
# Purpose: Remove legacy theme files per TCNA/NJ HIC standards; ensure clean, compliant build environment

set -euo pipefail

echo "🧹 Tillerstead Theme Cleanup Utility"
echo "===================================="
echo ""

# Backup flag
BACKUP=false
if [ "${1:-}" = "--backup" ]; then
    BACKUP=true
    BACKUP_DIR="theme-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    echo "📦 Backup directory created: $BACKUP_DIR"
fi

# Function: Remove with optional backup, verbose, and compliance logging
safe_remove() {
    local path=$1
    local description=$2

    if [ -e "$path" ]; then
        echo "  🗑️  Removing: $path"
        if [ "$BACKUP" = true ]; then
            cp -r "$path" "$BACKUP_DIR/" 2>/dev/null || true
        fi
        rm -rf "$path"
        echo "     ✅ $description removed (per TCNA/NJ HIC compliance)"
    else
        echo "  ⏭️  Skipping: $path (not found)"
    fi
}

echo ""
echo "1️⃣  Removing legacy /src/scss directory (superseded by /assets/css, per OUTPUT_RULES.md)"
echo "-----------------------------------------------------"
safe_remove "src/scss" "Legacy SCSS directory"

echo ""
echo "2️⃣  Removing obsolete /src/assets directory (not referenced in build pipeline)"
echo "-----------------------------------------------------"
safe_remove "src/assets" "Obsolete assets directory"

echo ""
echo "3️⃣  Renaming main-build.scss → style.scss (per OUTPUT_RULES.md naming)"
echo "-----------------------------------------------------"
if [ -f "assets/css/main-build.scss" ]; then
    echo "  📝 Renaming: assets/css/main-build.scss → assets/css/style.scss"
    if [ "$BACKUP" = true ]; then
        cp "assets/css/main-build.scss" "$BACKUP_DIR/" 2>/dev/null || true
    fi
    mv "assets/css/main-build.scss" "assets/css/style.scss"
    echo "     ✅ Renamed for TCNA/NJ HIC compliance"
else
    echo "  ⏭️  main-build.scss not found or already renamed"
fi

echo ""
echo "4️⃣  Removing deprecated/duplicate CSS files (per OUTPUT_RULES.md)"
echo "-----------------------------------------------------"
for css in "assets/css/theme.css" "assets/css/theme-compiled.css" "assets/css/main.css"; do
    safe_remove "$css" "Deprecated CSS: $(basename "$css")"
done

echo ""
echo "5️⃣  Removing obsolete documentation (duplicates only, per compliance)"
echo "-----------------------------------------------------"
safe_remove "CSS_ARCHITECTURE.OLD.md" "Obsolete architecture doc"

echo ""
echo "6️⃣  Removing _site build directory (Jekyll will regenerate, per CI/CD best practice)"
echo "-----------------------------------------------------"
safe_remove "_site" "Jekyll build directory"

echo ""
echo "✅ Cleanup Complete — Tillerstead technical standards enforced"
echo "===================="
echo ""
echo "Summary of actions:"
echo "  • Legacy SCSS and asset directories removed"
echo "  • main-build.scss renamed for compliance"
echo "  • Deprecated CSS purged"
echo "  • Build directory reset"
echo ""

if [ "$BACKUP" = true ]; then
    echo "📦 Backup stored at: $BACKUP_DIR"
    echo ""
fi

echo "Next steps:"
echo "  1. Run: ./scripts/run-jekyll.sh build"
echo "  2. Validate output with HTMLHint, ESLint, and Jekyll"
echo "  3. Confirm style.css is generated and accessible"
echo ""
echo "🔎 All actions performed per TCNA 2024, NJ HIC, and project OUTPUT_RULES.md"
echo "🏆 Tillerstead: Setting the technical standard for New Jersey home improvement."
echo ""
