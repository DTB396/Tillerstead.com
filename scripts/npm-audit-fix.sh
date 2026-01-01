#!/bin/bash
# npm-audit-fix.sh - Automated npm audit and dependency upgrade script
# Usage: bash scripts/npm-audit-fix.sh
# Run from repository root

set -e

echo "=========================================="
echo "  npm Audit & Dependency Upgrade Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check current audit status
echo -e "${YELLOW}[1/6] Running initial npm audit...${NC}"
npm audit --audit-level=info || true
echo ""

# Step 2: Backup package files
echo -e "${YELLOW}[2/6] Backing up package files...${NC}"
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
echo -e "${GREEN}✓ Backup created: package.json.backup, package-lock.json.backup${NC}"
echo ""

# Step 3: Run npm audit fix (safe fixes only)
echo -e "${YELLOW}[3/6] Applying safe audit fixes...${NC}"
npm audit fix || true
echo ""

# Step 4: Check for remaining vulnerabilities
echo -e "${YELLOW}[4/6] Checking remaining vulnerabilities...${NC}"
AUDIT_RESULT=$(npm audit --json 2>/dev/null || echo '{"vulnerabilities":{}}')
VULN_COUNT=$(echo "$AUDIT_RESULT" | node -e "const d=require('fs').readFileSync(0,'utf8');try{const j=JSON.parse(d);console.log(Object.keys(j.vulnerabilities||{}).length)}catch{console.log(0)}")

if [ "$VULN_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠ $VULN_COUNT vulnerabilities remain. Attempting force fix...${NC}"
    npm audit fix --force || true
    echo ""
fi

# Step 5: Update all dependencies to latest safe versions
echo -e "${YELLOW}[5/6] Upgrading dependencies to latest safe versions...${NC}"
npm update
echo ""

# Step 6: Final audit and summary
echo -e "${YELLOW}[6/6] Final audit check...${NC}"
echo ""

if npm audit --audit-level=moderate 2>/dev/null; then
    echo -e "${GREEN}=========================================="
    echo "  ✓ All vulnerabilities resolved!"
    echo "==========================================${NC}"
else
    echo -e "${YELLOW}=========================================="
    echo "  ⚠ Some vulnerabilities may remain."
    echo "  Review output above for manual fixes."
    echo "==========================================${NC}"
fi

echo ""
echo "Summary of changes:"
echo "-------------------"
npm outdated 2>/dev/null || echo "All packages are up to date!"
echo ""

echo -e "${GREEN}Done! Review changes with:${NC}"
echo "  git diff package.json package-lock.json"
echo ""
echo "To revert changes:"
echo "  mv package.json.backup package.json"
echo "  mv package-lock.json.backup package-lock.json"
echo "  npm ci"
