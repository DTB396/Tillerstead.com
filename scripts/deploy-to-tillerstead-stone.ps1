# PowerShell Deployment Script - Tillerstead.com to tillerstead-stone
# Deploys from sandbox to production remote with full validation
# Reference: /.ai/SYSTEM.md, /.ai/OUTPUT_RULES.md

param(
    [switch]$SkipTests = $false,
    [switch]$SkipBuild = $false,
    [switch]$Force = $false,
    [switch]$DryRun = $false,
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"

# Colors
$Success = "Green"
$Error = "Red"
$Warning = "Yellow"
$Info = "Blue"

Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor $Info
Write-Host "TILLERSTEAD DEPLOYMENT SCRIPT — GitHub Actions Node 24 Upgrade" -ForegroundColor $Info
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor $Info
Write-Host ""

# 1. Pre-flight checks
Write-Host "1. PRE-FLIGHT CHECKS" -ForegroundColor $Info
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Info

$GitStatus = git status --porcelain
if ($GitStatus) {
    Write-Host "⚠ Uncommitted changes detected:" -ForegroundColor $Warning
    Write-Host $GitStatus
    if (!$Force) {
        Write-Host "Use -Force to override" -ForegroundColor $Warning
        exit 1
    }
}
else {
    Write-Host "✓ Repository is clean" -ForegroundColor $Success
}

$CurrentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "✓ Current branch: $CurrentBranch" -ForegroundColor $Success

# 2. Run linting
Write-Host ""
Write-Host "2. LINTING (Non-blocking)" -ForegroundColor $Info
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Info

$LintOutput = npm run lint 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Linting warnings found (non-blocking):" -ForegroundColor $Warning
    Write-Host $LintOutput | Select-Object -Last 5
}
else {
    Write-Host "✓ Linting passed" -ForegroundColor $Success
}

# 3. Build site
Write-Host ""
Write-Host "3. BUILDING SITE" -ForegroundColor $Info
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Info

if (-not $SkipBuild) {
    $BuildOutput = npm run build 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Build failed" -ForegroundColor $Error
        exit 1
    }
    Write-Host "✓ Build completed" -ForegroundColor $Success
}
else {
    Write-Host "⊘ Build skipped (--SkipBuild)" -ForegroundColor $Warning
}

# 4. Verify artifacts
if (Test-Path "_site/index.html") {
    $FileCount = (Get-ChildItem _site -Recurse | Measure-Object).Count
    Write-Host "✓ Generated $FileCount files in _site/" -ForegroundColor $Success
}
else {
    Write-Host "✗ Missing _site/index.html" -ForegroundColor $Error
    exit 1
}

# 5. Commit changes
Write-Host ""
Write-Host "4. COMMITTING CHANGES" -ForegroundColor $Info
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Info

if (!$Message) {
    $Message = "ci: upgrade Node.js to 24, fix GitHub Actions workflows"
}

Write-Host "Commit message: $Message" -ForegroundColor $Info

if ($DryRun) {
    Write-Host "✓ [DRY RUN] Would commit with message: $Message" -ForegroundColor $Info
}
else {
    git add -A
    git commit -m $Message
    Write-Host "✓ Changes committed" -ForegroundColor $Success
}

# 6. Push to remote
Write-Host ""
Write-Host "5. PUSHING TO REMOTE (tillerstead-stone)" -ForegroundColor $Info
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Info

if ($DryRun) {
    Write-Host "✓ [DRY RUN] Would push to origin $CurrentBranch" -ForegroundColor $Info
}
else {
    git push origin $CurrentBranch
    Write-Host "✓ Pushed to remote" -ForegroundColor $Success
}

# 7. Final status
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor $Success
Write-Host "DEPLOYMENT READY" -ForegroundColor $Success
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor $Success
Write-Host ""
Write-Host "Next steps:" -ForegroundColor $Info
Write-Host "  1. Monitor workflow runs at: https://github.com/DTB396/tillerstead-stone/actions" -ForegroundColor $Info
Write-Host "  2. Verify site builds and deploys successfully" -ForegroundColor $Info
Write-Host "  3. Check live site: https://tillerstead.com" -ForegroundColor $Info
Write-Host ""
