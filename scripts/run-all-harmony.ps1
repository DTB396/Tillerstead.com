#!/usr/bin/env pwsh
# Tillerstead Stone - Intelligent Site Harmony Script
# Audits first, then fixes issues based on scan results

$ErrorActionPreference = "Continue"
$scriptDir = $PSScriptRoot
$projectRoot = Split-Path $scriptDir -Parent

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TILLERSTEAD STONE - INTELLIGENT SITE HARMONY BUILDER     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Set-Location $projectRoot

# Initialize issue tracking
$issues = @{
    css = $false
    images = $false
    config = $false
    jekyll = $false
    links = $false
    navigation = $false
    assets = $false
}

# ============================================================================
# PHASE 1: ENVIRONMENT SETUP
# ============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "PHASE 1: Environment Setup & Pre-Flight Checks" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

if (Test-Path "$scriptDir\activate-ruby.ps1") {
    Write-Host "[1/2] Activating Ruby environment..." -ForegroundColor Green
    & "$scriptDir\activate-ruby.ps1"
} else {
    Write-Host "[1/2] Ruby activation not available, skipping..." -ForegroundColor Yellow
}

Write-Host "[2/2] Checking dependencies..." -ForegroundColor Green
if (-not (Test-Path "node_modules")) {
    Write-Host "    Installing npm dependencies..." -ForegroundColor Cyan
    npm install
}

# ============================================================================
# PHASE 2: COMPREHENSIVE AUDIT & DIAGNOSTICS
# ============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "PHASE 2: Comprehensive Site Audit (Concurrent Scans)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host "[1/5] Running repo doctor (comprehensive scan)..." -ForegroundColor Green
$doctorOutput = node "$scriptDir\ts-90-repo-doctor.js" --phase=all 2>&1
Write-Output $doctorOutput
if ($doctorOutput -match "missing|error|fail|broken") { 
    $issues.config = $true
    $issues.assets = $true
}

Write-Host "[2/5] Analyzing CSS structure..." -ForegroundColor Green
$cssOutput = node "$scriptDir\analyze-css-structure.js" 2>&1
Write-Output $cssOutput
if ($cssOutput -match "issue|warning|unused|duplicate") { 
    $issues.css = $true 
}

Write-Host "[3/5] Checking for unused CSS..." -ForegroundColor Green
$unusedOutput = node "$scriptDir\find-unused-css.js" 2>&1
Write-Output $unusedOutput
if ($unusedOutput -match "unused") { 
    $issues.css = $true 
}

Write-Host "[4/5] Auditing images..." -ForegroundColor Green
$imageOutput = & "$scriptDir\audit-and-fix-images.ps1" 2>&1
Write-Output $imageOutput
if ($imageOutput -match "missing|broken|error") { 
    $issues.images = $true 
}

Write-Host "[5/5] Running development audit..." -ForegroundColor Green
$devOutput = & "$scriptDir\dev-audit.ps1" 2>&1
Write-Output $devOutput
if ($devOutput -match "error|fail|missing") { 
    $issues.jekyll = $true
    $issues.navigation = $true
}

# ============================================================================
# AUDIT SUMMARY & DECISION MATRIX
# ============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "AUDIT SUMMARY - Issues Detected:" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

if ($issues.config) { Write-Host "  ⚠️  Configuration issues detected" -ForegroundColor Red }
if ($issues.css) { Write-Host "  ⚠️  CSS structure issues detected" -ForegroundColor Red }
if ($issues.images) { Write-Host "  ⚠️  Image optimization needed" -ForegroundColor Red }
if ($issues.jekyll) { Write-Host "  ⚠️  Jekyll config issues detected" -ForegroundColor Red }
if ($issues.navigation) { Write-Host "  ⚠️  Navigation issues detected" -ForegroundColor Red }
if ($issues.assets) { Write-Host "  ⚠️  Asset reference issues detected" -ForegroundColor Red }

$hasIssues = $issues.Values -contains $true
if (-not $hasIssues) {
    Write-Host "  ✓ No critical issues detected!" -ForegroundColor Green
}


# ============================================================================
# PHASE 3: INTELLIGENT REPAIRS (Based on Audit Results)
# ============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "PHASE 3: Intelligent Repairs (Conditional)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

if ($issues.config) {
    Write-Host "[FIX 1] Repairing configuration and package.json..." -ForegroundColor Cyan
    & "$scriptDir\ts-11-repair-config-and-package.ps1"
}

if ($issues.jekyll) {
    Write-Host "[FIX 2] Fixing Jekyll configuration..." -ForegroundColor Cyan
    & "$scriptDir\ts-20-fix-jekyll-config.ps1"
    
    Write-Host "[FIX 3] Fixing head and frontmatter..." -ForegroundColor Cyan
    & "$scriptDir\ts-15-fix-head-and-frontmatter.ps1"
}

if ($issues.assets) {
    Write-Host "[FIX 4] Fixing asset links..." -ForegroundColor Cyan
    & "$scriptDir\ts-30-fix-asset-links.ps1"
}

if ($issues.navigation) {
    Write-Host "[FIX 5] Applying navigation fixes..." -ForegroundColor Cyan
    & "$scriptDir\copilot-nav-fix.ps1"
}

if ($issues.css) {
    Write-Host "[FIX 6] Consolidating CSS colors..." -ForegroundColor Cyan
    node "$scriptDir\consolidate-colors.js"
    
    Write-Host "[FIX 7] Refactoring CSS prefixes..." -ForegroundColor Cyan
    node "$scriptDir\refactor-css-prefixes.js"
}

if (-not $hasIssues) {
    Write-Host "  ✓ No repairs needed - site is healthy!" -ForegroundColor Green
}

# ============================================================================
# PHASE 4: ASSET OPTIMIZATION (Always Run)
# ============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "PHASE 4: Asset Optimization" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host "[1/4] Generating PNG logos..." -ForegroundColor Green
node "$scriptDir\generate-png-logos.js"

if ($issues.images) {
    Write-Host "[2/4] Optimizing images..." -ForegroundColor Green
    node "$scriptDir\optimize-images.js"
    
    Write-Host "[3/4] Converting to WebP format..." -ForegroundColor Green
    node "$scriptDir\convert-images-to-webp.js"
    
    Write-Host "[4/4] Fixing image structure..." -ForegroundColor Green
    & "$scriptDir\fix-image-structure.ps1"
} else {
    Write-Host "[2/4] Image optimization skipped (no issues)" -ForegroundColor Gray
    Write-Host "[3/4] WebP conversion skipped" -ForegroundColor Gray
    Write-Host "[4/4] Image structure fix skipped" -ForegroundColor Gray
}

# ============================================================================
# PHASE 5: BUILD PROCESS
# ============================================================================

# ============================================================================
# PHASE 5: BUILD PROCESS
# ============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "PHASE 5: Clean Build" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host "[1/3] Cleaning previous build..." -ForegroundColor Green
Remove-Item -Recurse -Force _site -ErrorAction SilentlyContinue
Remove-Item -Force assets\css\style.css -ErrorAction SilentlyContinue

Write-Host "[2/3] Building CSS from SCSS..." -ForegroundColor Green
node "$scriptDir\build-css.js"

Write-Host "[3/3] Building Jekyll site..." -ForegroundColor Green
& "$scriptDir\build-site.ps1"

# ============================================================================
# PHASE 6: POST-BUILD TASKS
# ============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "PHASE 6: Post-Build Verification" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host "[1/3] Running post-build link script..." -ForegroundColor Green
node "$scriptDir\post-build-link.js"

Write-Host "[2/3] Checking links..." -ForegroundColor Green
$linkOutput = node "$scriptDir\check-links.js" 2>&1
Write-Output $linkOutput
if ($linkOutput -match "broken|404|error") {
    $issues.links = $true
    Write-Host "    ⚠️  Broken links detected!" -ForegroundColor Red
}

Write-Host "[3/3] Verifying deployment readiness..." -ForegroundColor Green
node "$scriptDir\verify-deployment.js"

# ============================================================================
# PHASE 7: TESTING & VALIDATION
# ============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "PHASE 7: Testing & Validation" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host "[1/2] Testing navigation (JavaScript)..." -ForegroundColor Green
node "$scriptDir\test-navigation.js"

Write-Host "[2/2] Running Playwright tests..." -ForegroundColor Green
npm test

# ============================================================================
# FINAL SUMMARY & RECOMMENDATIONS
# ============================================================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✓ INTELLIGENT SITE HARMONY BUILD COMPLETE                ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Display final status
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "FINAL STATUS REPORT:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$issueCount = ($issues.Values | Where-Object { $_ -eq $true }).Count
if ($issueCount -eq 0) {
    Write-Host "  ✓ Site is production-ready!" -ForegroundColor Green
    Write-Host "  ✓ All systems operational" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "  1. Test locally: npm run serve" -ForegroundColor Gray
    Write-Host "  2. Deploy: git add -A && git commit -m 'Harmony build' && git push" -ForegroundColor Gray
} else {
    Write-Host "  ⚠️  $issueCount issue categories detected and fixed" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Recommendations:" -ForegroundColor White
    Write-Host "  1. Review logs above for details" -ForegroundColor Gray
    Write-Host "  2. Test locally: npm run serve" -ForegroundColor Gray
    Write-Host "  3. Verify in browser at http://localhost:4000" -ForegroundColor Gray
    Write-Host "  4. If OK, deploy: git add -A && git commit -m 'Fix issues' && git push" -ForegroundColor Gray
    
    if ($issues.links) {
        Write-Host ""
        Write-Host "  🔗 Broken links need manual review!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Build artifacts:" -ForegroundColor Cyan
if (Test-Path "_site") {
    $fileCount = (Get-ChildItem -Recurse _site -File).Count
    Write-Host "  📁 _site/: $fileCount files generated" -ForegroundColor Gray
}
if (Test-Path "assets\css\style.css") {
    $cssSize = [math]::Round((Get-Item "assets\css\style.css").Length / 1KB, 2)
    Write-Host "  📄 CSS compiled: ${cssSize}KB" -ForegroundColor Gray
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
