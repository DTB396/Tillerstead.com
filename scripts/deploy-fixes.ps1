#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Deploy GitHub Actions fixes to production
    
.DESCRIPTION
    Commits and pushes all workflow fixes to main branch with proper messaging
    
.PARAMETER NoVerify
    Skip pre-commit verification (not recommended)
    
.PARAMETER DryRun
    Show what would be committed without actually committing
#>

param(
    [switch]$NoVerify,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# Colors
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Cyan = "`e[36m"
$Reset = "`e[0m"

function Write-Banner {
    param([string]$Text)
    Write-Host "`n$Cyan═══════════════════════════════════════════════════════$Reset" -NoNewline
    Write-Host "`n$Cyan $Text $Reset" -NoNewline
    Write-Host "`n$Cyan═══════════════════════════════════════════════════════$Reset`n"
}

function Write-Status {
    param([string]$Text, [bool]$Success = $true)
    $Icon = if ($Success) { "$Green✓$Reset" } else { "$Red✗$Reset" }
    Write-Host "$Icon $Text"
}

function Write-Error-Box {
    param([string]$Text)
    Write-Host "`n$Red╔════════════════════════════════════════════╗$Reset"
    Write-Host "$Red║ ERROR: $Text$Reset"
    Write-Host "$Red╚════════════════════════════════════════════╝$Reset`n"
}

Write-Banner "GitHub Actions Fixes Deployment Script"

# Step 1: Verify repository state
Write-Host "$Cyan[1/5]$Reset Checking repository state..."
if (!(Test-Path ".git")) {
    Write-Error-Box "Not a Git repository"
    exit 1
}

$CurrentBranch = git rev-parse --abbrev-ref HEAD
Write-Status "Current branch: $CurrentBranch"

if ($CurrentBranch -ne "main") {
    Write-Host "$Yellow⚠$Reset Warning: Not on main branch (currently on '$CurrentBranch')"
    $Confirm = Read-Host "Continue anyway? (y/n)"
    if ($Confirm -ne "y") {
        Write-Host "$Red Deployment cancelled"
        exit 1
    }
}

# Step 2: Verify changed files
Write-Host "$Cyan[2/5]$Reset Verifying modified files..."
$ChangedFiles = @(
    ".github/workflows/ci.yml",
    "scripts/diagnose-gh-actions.ps1",
    "GITHUB_ACTIONS_FIX_REPORT.md"
)

$MissingFiles = @()
foreach ($File in $ChangedFiles) {
    if (!(Test-Path $File)) {
        $MissingFiles += $File
    }
}

if ($MissingFiles.Count -gt 0) {
    Write-Error-Box "Missing files: $($MissingFiles -join ', ')"
    exit 1
}

foreach ($File in $ChangedFiles) {
    Write-Status "Found: $File"
}

# Step 3: Check git status
Write-Host "$Cyan[3/5]$Reset Checking Git status..."
$Status = git status --porcelain
if ([string]::IsNullOrEmpty($Status)) {
    Write-Host "$Yellow⚠$Reset No uncommitted changes detected"
} else {
    Write-Host "`n$Status`n"
}

# Step 4: Prepare commit
Write-Host "$Cyan[4/5]$Reset Preparing commit..."

$CommitMessage = @(
    "fix: upgrade Node 24, separate build/deploy jobs, fix artifact handling",
    "",
    "- Upgrade Node.js from 20 to 24 for better compatibility",
    "- Split single job into separate build and deploy jobs",
    "- Fix build command: npm run test → npm run build",
    "- Improve artifact handling with success() condition",
    "- Add GitHub Pages deployment with CNAME",
    "- Create diagnostic script for workflow validation",
    "",
    "Closes: GitHub Actions workflow failures"
) -join "`n"

Write-Host "$Cyan Commit Message:$Reset`n"
Write-Host $CommitMessage
Write-Host "`n"

# Step 5: Execute commit and push
if ($DryRun) {
    Write-Host "$Yellow[DRY RUN MODE]$Reset Would execute:"
    Write-Host "git add $($ChangedFiles -join ' ')"
    Write-Host "git commit -m `"$CommitMessage`""
    Write-Host "git push origin $CurrentBranch"
    exit 0
}

Write-Host "$Cyan[5/5]$Reset Executing deployment..."

try {
    Write-Status "Staging files..."
    git add @ChangedFiles
    
    Write-Status "Creating commit..."
    git commit -m $CommitMessage -q
    
    Write-Status "Pushing to remote..."
    git push origin $CurrentBranch -q
    
    Write-Host "`n$Green══════════════════════════════════════════════════════$Reset"
    Write-Host "$Green ✓ Deployment successful! $Reset"
    Write-Host "$Green══════════════════════════════════════════════════════$Reset`n"
    
    Write-Host "Next steps:"
    Write-Host "1. Monitor: GitHub > Actions > CI/CD"
    Write-Host "2. Verify: https://tillerstead.com"
    Write-Host "3. Check logs for any issues"
    
} catch {
    Write-Error-Box "Deployment failed: $_"
    exit 1
}
