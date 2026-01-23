#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Fix broken links in source files
.DESCRIPTION
    Analyzes broken links report and fixes them in source HTML/Markdown files.
    Creates a mapping of broken links to their correct paths.
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$SourcePath = "C:\web-dev\github-repos\Tillerstead.com",
    
    [Parameter(Mandatory=$false)]
    [string]$ReportPath,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "✗ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }

Write-Host "`n🔧 Link Fixer" -ForegroundColor Magenta
Write-Host "=" * 60 -ForegroundColor DarkGray

# Find the most recent report if not specified
if (-not $ReportPath) {
    $reportsDir = Join-Path $SourcePath "_reports"
    $latestReport = Get-ChildItem $reportsDir -Filter "broken-links-*.json" | 
        Sort-Object LastWriteTime -Descending | 
        Select-Object -First 1
    
    if ($latestReport) {
        $ReportPath = $latestReport.FullName
        Write-Info "Using latest report: $($latestReport.Name)"
    } else {
        Write-Error "No broken links report found. Run Scan-Links.ps1 first."
        exit 1
    }
}

# Load report
if (-not (Test-Path $ReportPath)) {
    Write-Error "Report not found: $ReportPath"
    exit 1
}

$report = Get-Content $ReportPath -Raw | ConvertFrom-Json

Write-Info "Found $($report.BrokenCount) broken links to fix"

# Common link fixes
$linkFixes = @{
    'services' = '/services/'
    'portfolio' = '/portfolio/'
    'contact' = '/contact/'
    'about' = '/about/'
    'faq' = '/faq/'
    'reviews' = '/reviews/'
    'pricing' = '/pricing/'
    'process' = '/process/'
}

$fixedCount = 0
$skippedCount = 0

foreach ($broken in $report.BrokenLinks) {
    $oldLink = $broken.Link
    $newLink = $null
    
    # Try to find correct link
    if ($linkFixes.ContainsKey($oldLink)) {
        $newLink = $linkFixes[$oldLink]
    } elseif ($oldLink -notmatch '/$') {
        # Try adding trailing slash
        $newLink = "/$oldLink/"
    }
    
    if ($newLink) {
        Write-Host "`nFixing: $oldLink → $newLink" -ForegroundColor Yellow
        
        foreach ($file in $broken.UsedIn) {
            $fullPath = Join-Path $SourcePath "_site" $file
            
            if (Test-Path $fullPath) {
                if (-not $DryRun) {
                    $content = Get-Content $fullPath -Raw
                    $updated = $content -replace "href=[`"']$oldLink[`"']", "href=`"$newLink`""
                    Set-Content $fullPath $updated -NoNewline
                    Write-Success "  Fixed in $file"
                    $fixedCount++
                } else {
                    Write-Info "  Would fix in $file"
                }
            }
        }
    } else {
        Write-Warning "No automatic fix for: $oldLink"
        $skippedCount++
    }
}

Write-Host "`n📊 Summary" -ForegroundColor Cyan
Write-Host "Fixed: $fixedCount" -ForegroundColor Green
Write-Host "Skipped: $skippedCount" -ForegroundColor Yellow

if ($DryRun) {
    Write-Warning "DRY RUN - No changes were made"
    Write-Info "Remove -DryRun flag to apply fixes"
}
