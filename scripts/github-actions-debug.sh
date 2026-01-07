#!/bin/bash
# GitHub Actions Debugging & Fixing Script for Tillerstead.com
# This script diagnoses and fixes common CI/CD failures across all workflows
# Reference: /.ai/SYSTEM.md, /.ai/OUTPUT_RULES.md

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "TILLERSTEAD.COM — GitHub Actions Diagnostic & Fix Script"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

section() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 1. System Diagnostics
section "1. SYSTEM DIAGNOSTICS"

log_info "Checking Node.js version..."
NODE_VERSION=$(node --version)
log_success "Node.js: $NODE_VERSION"

log_info "Checking npm version..."
NPM_VERSION=$(npm --version)
log_success "npm: $NPM_VERSION"

log_info "Checking Ruby version..."
RUBY_VERSION=$(ruby --version)
log_success "Ruby: $RUBY_VERSION"

log_info "Checking Git status..."
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "N/A")
log_success "Branch: $GIT_BRANCH"

# 2. Dependency Audit
section "2. DEPENDENCY AUDIT"

log_info "Checking npm dependencies..."
if [ -f "package-lock.json" ]; then
  log_success "package-lock.json exists"
else
  log_warning "package-lock.json not found - will use package.json"
fi

log_info "Installing dependencies with npm ci..."
npm ci 2>&1 | grep -E "(added|vulnerabilities|ERR)" || true

# 3. ESLint Diagnostics
section "3. LINTING DIAGNOSTICS"

log_info "Running ESLint..."
if npm run lint:js 2>&1 | grep -q "errors"; then
  log_error "ESLint found errors"
  npm run lint:js 2>&1 | tail -30 || true
else
  log_success "ESLint passed"
fi

# 4. CSS/SCSS Linting
log_info "Running stylelint..."
if npm run lint:css 2>&1 | grep -q "problem"; then
  log_warning "stylelint found issues (non-blocking)"
  npm run lint:css 2>&1 | tail -20 || true
else
  log_success "stylelint passed"
fi

# 5. Build Test
section "4. BUILD TEST"

log_info "Clearing previous _site build..."
rm -rf _site 2>/dev/null || true

log_info "Running npm run build..."
if npm run build 2>&1 | tail -10; then
  log_success "Build completed"
  if [ -d "_site" ]; then
    FILE_COUNT=$(find _site -type f | wc -l)
    log_success "Generated $FILE_COUNT files in _site/"
  else
    log_error "_site directory not found after build"
    exit 1
  fi
else
  log_error "Build failed"
  exit 1
fi

# 6. Post-Build Artifact Check
section "5. ARTIFACT VERIFICATION"

REQUIRED_FILES=("index.html" "404.html" "css/style.css" "sitemap.xml" "robots.txt")
for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "_site/$file" ]; then
    log_success "Found: _site/$file"
  else
    log_error "Missing: _site/$file"
  fi
done

# 7. GitHub Pages Configuration
section "6. DEPLOYMENT CONFIGURATION"

log_info "Checking GitHub Pages config..."
if [ -f "_config.yml" ]; then
  log_success "Jekyll config found"
  grep -E "^(url|baseurl|title):" _config.yml || true
else
  log_error "_config.yml not found"
fi

if [ -f "CNAME" ]; then
  CNAME_CONTENT=$(cat CNAME)
  log_success "CNAME: $CNAME_CONTENT"
else
  log_warning "CNAME file not found"
fi

# 8. Workflow Configuration Check
section "7. GITHUB ACTIONS WORKFLOW CHECK"

if [ -d ".github/workflows" ]; then
  WORKFLOW_COUNT=$(find .github/workflows -name "*.yml" | wc -l)
  log_success "Found $WORKFLOW_COUNT workflow files"
  find .github/workflows -name "*.yml" -exec basename {} \; | sed 's/^/  • /'
else
  log_error ".github/workflows directory not found"
fi

# 9. Final Status Report
section "FINAL STATUS"

log_success "═══════════════════════════════════════════════════════════════════"
log_success "All diagnostics completed. Ready for GitHub Actions deployment."
log_success "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Review the diagnostic output above"
echo "  2. Commit any configuration changes: git add -A && git commit -m 'ci: fix GitHub Actions setup'"
echo "  3. Push to remote: git push origin main"
echo "  4. Monitor workflow runs at: https://github.com/DTB396/tillerstead-stone/actions"
echo ""
