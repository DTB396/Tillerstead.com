#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Scan all links in the Jekyll site and detect 404s
.DESCRIPTION
    Scans all HTML files for internal links and validates they resolve correctly.
    Prevents 404 errors by checking href attributes, Jekyll permalinks, and file paths.
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$SitePath = "C:\web-dev\github-repos\Tillerstead.com\_site",
    
    [Parameter(Mandatory=$false)]
    [string]$SourcePath = "C:\web-dev\github-repos\Tillerstead.com",
    
    [Parameter(Mandatory=$false)]
    [switch]$FixLinks
)

# Color output helpers
function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "✗ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }

Write-Host "`n🔍 Link Scanner & 404 Detector" -ForegroundColor Magenta
Write-Host "=" * 60 -ForegroundColor DarkGray

# Check if site exists
if (-not (Test-Path $SitePath)) {
    Write-Error "Site path not found: $SitePath"
    Write-Info "Run 'npm run build:site' first"
    exit 1
}

Write-Info "Scanning site: $SitePath"
Write-Host ""

# Get all HTML files
$htmlFiles = Get-ChildItem -Path $SitePath -Recurse -Filter "*.html" -File
Write-Info "Found $($htmlFiles.Count) HTML files to scan"

# Initialize tracking
$brokenLinks = @()
$allLinks = @()
$linkMap = @{}

# Regex patterns for different link types
$patterns = @{
    Href = '<a\s+[^>]*href=["' + "'" + ']([^"' + "'" + ']+)["' + "'" + ']'
    Src = '<(?:img|script|link)\s+[^>]*(?:src|href)=["' + "'" + ']([^"' + "'" + ']+)["' + "'" + ']'
}

Write-Info "Extracting links..."

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $relativePath = $file.FullName.Replace($SitePath, "").TrimStart('\', '/')
    
    # Extract all href links
    $hrefMatches = [regex]::Matches($content, $patterns.Href)
    
    foreach ($match in $hrefMatches) {
        $url = $match.Groups[1].Value
        
        # Skip external links, anchors, mailto, tel, etc.
        if ($url -match '^(https?:|mailto:|tel:|#|javascript:)') {
            continue
        }
        
        # Normalize the URL
        $cleanUrl = $url -replace '#.*$', ''  # Remove anchor
        $cleanUrl = $cleanUrl -replace '\?.*$', ''  # Remove query string
        $cleanUrl = $cleanUrl.Trim('/')
        
        if ([string]::IsNullOrWhiteSpace($cleanUrl)) {
            continue
        }
        
        $linkInfo = [PSCustomObject]@{
            SourceFile = $relativePath
            SourcePath = $file.FullName
            Link = $url
            CleanLink = $cleanUrl
            Type = 'Internal'
        }
        
        $allLinks += $linkInfo
        
        # Track unique links
        if (-not $linkMap.ContainsKey($cleanUrl)) {
            $linkMap[$cleanUrl] = @()
        }
        $linkMap[$cleanUrl] += $relativePath
    }
}

Write-Success "Extracted $($allLinks.Count) internal links"
Write-Info "Checking for broken links..."

$checkedLinks = @{}

foreach ($link in $linkMap.Keys) {
    # Build possible file paths
    $possiblePaths = @(
        Join-Path $SitePath $link
        Join-Path $SitePath "$link.html"
        Join-Path $SitePath $link "index.html"
    )
    
    $exists = $false
    $resolvedPath = $null
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $exists = $true
            $resolvedPath = $path
            break
        }
    }
    
    if (-not $exists) {
        $brokenLinks += [PSCustomObject]@{
            Link = $link
            UsedIn = $linkMap[$link]
            Count = $linkMap[$link].Count
        }
    }
    
    $checkedLinks[$link] = $exists
}

# Report results
Write-Host "`n📊 Scan Results" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor DarkGray

Write-Host "Total links scanned:     $($allLinks.Count)" -ForegroundColor White
Write-Host "Unique links:            $($linkMap.Keys.Count)" -ForegroundColor White
Write-Host "Working links:           $(($checkedLinks.Values | Where-Object {$_}).Count)" -ForegroundColor Green
Write-Host "Broken links:            $($brokenLinks.Count)" -ForegroundColor $(if ($brokenLinks.Count -gt 0) {'Red'} else {'Green'})

if ($brokenLinks.Count -gt 0) {
    Write-Host "`n🔴 Broken Links Detected:" -ForegroundColor Red
    Write-Host "=" * 60 -ForegroundColor DarkGray
    
    foreach ($broken in ($brokenLinks | Sort-Object -Property Count -Descending)) {
        Write-Host "`n  Link: /$($broken.Link)" -ForegroundColor Yellow
        Write-Host "  Used in $($broken.Count) file(s):" -ForegroundColor Gray
        foreach ($file in ($broken.UsedIn | Select-Object -First 5)) {
            Write-Host "    • $file" -ForegroundColor DarkGray
        }
        if ($broken.Count -gt 5) {
            Write-Host "    ... and $($broken.Count - 5) more" -ForegroundColor DarkGray
        }
    }
    
    # Generate report
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $reportPath = Join-Path $SourcePath "_reports" "broken-links-$timestamp.json"
    
    $report = @{
        Timestamp = Get-Date -Format "o"
        SitePath = $SitePath
        TotalLinks = $allLinks.Count
        UniqueLinks = $linkMap.Keys.Count
        BrokenCount = $brokenLinks.Count
        BrokenLinks = $brokenLinks
    }
    
    $report | ConvertTo-Json -Depth 10 | Set-Content $reportPath
    Write-Host "`n💾 Report saved: $reportPath" -ForegroundColor Cyan
    
    exit 1
} else {
    Write-Host "`n✅ All links are valid!" -ForegroundColor Green -BackgroundColor DarkGreen
    exit 0
}
