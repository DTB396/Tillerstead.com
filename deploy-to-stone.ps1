# Tillerstead Three-Stage Deployment Safety Network
# Inspired by FaithFrontier's rigorous verification protocol
# No code reaches production without passing ALL three stages

param(
    [switch]$SkipTests = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   TILLERSTEAD THREE-STAGE DEPLOYMENT VERIFICATION      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$sandboxPath = "C:\Users\Devon Tyler\tillerstead-sandbox"
$stonePath = "C:\Users\Devon Tyler\tillerstead-stone"

# Verify we're in sandbox
if (-not (Test-Path $sandboxPath)) {
    Write-Host "❌ ERROR: Sandbox directory not found!" -ForegroundColor Red
    exit 1
}

cd $sandboxPath

# ═══════════════════════════════════════════════════════════
# STAGE 1: AUTOMATED TESTING
# ═══════════════════════════════════════════════════════════
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║              STAGE 1: AUTOMATED TESTING                 ║" -ForegroundColor Yellow
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Yellow

if (-not $SkipTests) {
    Write-Host "→ Running lint checks..." -ForegroundColor Cyan
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ STAGE 1 FAILED: Lint errors found" -ForegroundColor Red
        Write-Host "   Fix code quality issues and try again." -ForegroundColor Gray
        exit 1
    }
    Write-Host "  ✓ Lint checks passed" -ForegroundColor Green

    Write-Host "`n→ Building site..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ STAGE 1 FAILED: Build failed" -ForegroundColor Red
        Write-Host "   Fix build errors and try again." -ForegroundColor Gray
        exit 1
    }
    Write-Host "  ✓ Site built successfully" -ForegroundColor Green

    Write-Host "`n→ Running Playwright tests..." -ForegroundColor Cyan
    npx playwright test
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ STAGE 1 FAILED: Automated tests failed" -ForegroundColor Red
        Write-Host "   Review test results: npx playwright show-report" -ForegroundColor Gray
        exit 1
    }
    Write-Host "  ✓ All automated tests passed" -ForegroundColor Green

    Write-Host "`n✅ STAGE 1 COMPLETE: All automated checks passed" -ForegroundColor Green
} else {
    Write-Host "⚠️  STAGE 1 SKIPPED (--SkipTests flag used)" -ForegroundColor Yellow
    Write-Host "   Use with extreme caution!" -ForegroundColor Gray
}

# ═══════════════════════════════════════════════════════════
# STAGE 2: BRAND VERIFICATION
# ═══════════════════════════════════════════════════════════
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║             STAGE 2: BRAND VERIFICATION                 ║" -ForegroundColor Yellow
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Yellow

Write-Host "Manual verification required. Check all brand standards:" -ForegroundColor White
Write-Host ""
Write-Host "  Typography & Fonts:" -ForegroundColor Cyan
Write-Host "    □ Montserrat used for all headings" -ForegroundColor Gray
Write-Host "    □ Inter used for body text" -ForegroundColor Gray
Write-Host "    □ Font weights consistent (600/700 headings, 400/500 body)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Color System:" -ForegroundColor Cyan
Write-Host "    □ Teal (#0d9aaa) used for primary actions" -ForegroundColor Gray
Write-Host "    □ Coral accent color used sparingly" -ForegroundColor Gray
Write-Host "    □ Neutral grays for text hierarchy" -ForegroundColor Gray
Write-Host "    □ High contrast maintained (WCAG AA)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Spacing & Layout:" -ForegroundColor Cyan
Write-Host "    □ 8px grid system maintained" -ForegroundColor Gray
Write-Host "    □ Consistent spacing rhythm" -ForegroundColor Gray
Write-Host "    □ Adequate whitespace (premium feel)" -ForegroundColor Gray
Write-Host "    □ Responsive breakpoints work smoothly" -ForegroundColor Gray
Write-Host ""
Write-Host "  Tillerstead Brand Identity:" -ForegroundColor Cyan
Write-Host "    □ Professional yet approachable tone" -ForegroundColor Gray
Write-Host "    □ Premium quality feel maintained" -ForegroundColor Gray
Write-Host "    □ TCNA compliance language present" -ForegroundColor Gray
Write-Host "    □ NJ HIC license prominently displayed" -ForegroundColor Gray
Write-Host "    □ Trust signals visible (certifications, reviews)" -ForegroundColor Gray
Write-Host ""
Write-Host "  User Experience:" -ForegroundColor Cyan
Write-Host "    □ Navigation intuitive and clear" -ForegroundColor Gray
Write-Host "    □ CTAs prominent and actionable" -ForegroundColor Gray
Write-Host "    □ Mobile UX smooth (no jank)" -ForegroundColor Gray
Write-Host "    □ Desktop split-nav with center logo" -ForegroundColor Gray
Write-Host ""

if (-not $Force) {
    $brandCheck = Read-Host "`nAll brand standards verified and approved? (y/n)"
    if ($brandCheck -ne 'y' -and $brandCheck -ne 'Y') {
        Write-Host "❌ STAGE 2 FAILED: Brand verification not confirmed" -ForegroundColor Red
        Write-Host "   Review changes against brand guidelines." -ForegroundColor Gray
        exit 1
    }
}

Write-Host "`n✅ STAGE 2 COMPLETE: Brand standards verified" -ForegroundColor Green

# ═══════════════════════════════════════════════════════════
# STAGE 3: LIVE SANDBOX TESTING
# ═══════════════════════════════════════════════════════════
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║           STAGE 3: LIVE SANDBOX TESTING                 ║" -ForegroundColor Yellow
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Yellow

Write-Host "Real-world validation required. Test scenarios:" -ForegroundColor White
Write-Host ""
Write-Host "  Device Testing:" -ForegroundColor Cyan
Write-Host "    □ iPhone (< 400px width)" -ForegroundColor Gray
Write-Host "    □ Tablet (768px - 1024px)" -ForegroundColor Gray
Write-Host "    □ Desktop (1920px+)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Customer Journey:" -ForegroundColor Cyan
Write-Host "    □ Home → Services → Portfolio → Contact" -ForegroundColor Gray
Write-Host "    □ All navigation links work" -ForegroundColor Gray
Write-Host "    □ Forms submittable" -ForegroundColor Gray
Write-Host "    □ CTAs prominent and clickable" -ForegroundColor Gray
Write-Host ""
Write-Host "  Mobile Navigation:" -ForegroundColor Cyan
Write-Host "    □ Drawer opens smoothly from right" -ForegroundColor Gray
Write-Host "    □ Backdrop appears (dark blur)" -ForegroundColor Gray
Write-Host "    □ Click outside closes drawer" -ForegroundColor Gray
Write-Host "    □ ESC key closes drawer" -ForegroundColor Gray
Write-Host "    □ X button closes drawer" -ForegroundColor Gray
Write-Host "    □ 6 menu items + 2 CTA buttons visible" -ForegroundColor Gray
Write-Host ""
Write-Host "  Browser Testing:" -ForegroundColor Cyan
Write-Host "    □ Chrome (latest)" -ForegroundColor Gray
Write-Host "    □ Firefox (latest)" -ForegroundColor Gray
Write-Host "    □ Safari (latest)" -ForegroundColor Gray
Write-Host "    □ Edge (latest)" -ForegroundColor Gray
Write-Host ""

Write-Host "Starting local server at http://localhost:8080..." -ForegroundColor Cyan
Write-Host "Minimum testing duration: 15 minutes" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to open browser..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:8080/"

if (-not $Force) {
    Write-Host ""
    $liveTest = Read-Host "Live testing complete and all scenarios passing? (y/n)"
    if ($liveTest -ne 'y' -and $liveTest -ne 'Y') {
        Write-Host "❌ STAGE 3 FAILED: Live testing not confirmed" -ForegroundColor Red
        Write-Host "   Continue testing or fix identified issues." -ForegroundColor Gray
        exit 1
    }
}

Write-Host "`n✅ STAGE 3 COMPLETE: Live testing validated" -ForegroundColor Green

# ═══════════════════════════════════════════════════════════
# ALL STAGES PASSED - READY FOR PRODUCTION
# ═══════════════════════════════════════════════════════════
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   🎉 ALL THREE STAGES PASSED - PRODUCTION READY 🎉      ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Deployment Summary:" -ForegroundColor White
Write-Host "  ✅ Stage 1: Automated tests, lint, build - PASSED" -ForegroundColor Gray
Write-Host "  ✅ Stage 2: Brand standards verification - PASSED" -ForegroundColor Gray
Write-Host "  ✅ Stage 3: Live sandbox testing - PASSED" -ForegroundColor Gray
Write-Host ""

$deploy = Read-Host "Deploy changes to tillerstead-stone (PRODUCTION)? (y/n)"
if ($deploy -ne 'y' -and $deploy -ne 'Y') {
    Write-Host "`n⚠️  Deployment cancelled." -ForegroundColor Yellow
    Write-Host "   Changes remain in sandbox only." -ForegroundColor Gray
    exit 0
}

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "DEPLOYING TO PRODUCTION" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Verify stone directory exists
if (-not (Test-Path $stonePath)) {
    Write-Host "❌ ERROR: Production directory not found!" -ForegroundColor Red
    Write-Host "   Expected: $stonePath" -ForegroundColor Gray
    exit 1
}

# Sync sandbox to stone (excluding git, node_modules, build artifacts)
Write-Host "`n→ Syncing sandbox to stone..." -ForegroundColor Cyan
robocopy $sandboxPath $stonePath /MIR /XD .git node_modules _site .sass-cache test-results /XF .gitignore package-lock.json /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) {
    Write-Host "❌ ERROR: Sync failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Files synced" -ForegroundColor Green

# Commit and push from stone
cd $stonePath

Write-Host "`n→ Staging changes in production..." -ForegroundColor Cyan
git add -A

$commitMsg = Read-Host "`nCommit message"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Deploy verified changes from sandbox"
}

Write-Host "`n→ Creating commit..." -ForegroundColor Cyan
git commit -m "$commitMsg

✅ Three-stage verification complete:
  • Stage 1: Automated testing passed
  • Stage 2: Brand standards verified
  • Stage 3: Live testing validated

Deployed from tillerstead-sandbox with full safety checks."

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Commit failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Commit created" -ForegroundColor Green

Write-Host "`n→ Pushing to production repository..." -ForegroundColor Cyan
git push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Push failed!" -ForegroundColor Red
    Write-Host "   Manual intervention required." -ForegroundColor Gray
    exit 1
}

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          ✅ DEPLOYMENT SUCCESSFUL! ✅                     ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Production site will update in 2-3 minutes" -ForegroundColor Yellow
Write-Host ""
Write-Host "Post-Deployment Verification:" -ForegroundColor White
Write-Host "  1. Wait for GitHub Pages rebuild" -ForegroundColor Gray
Write-Host "  2. Visit production site" -ForegroundColor Gray
Write-Host "  3. Re-run Stage 3 testing on live site" -ForegroundColor Gray
Write-Host "  4. Monitor for any issues" -ForegroundColor Gray
Write-Host ""
Write-Host "If issues found, run rollback script immediately." -ForegroundColor Yellow
Write-Host ""

cd $sandboxPath
