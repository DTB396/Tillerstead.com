<#
.SYNOPSIS
    Validate SEO meta tags for all pages

.DESCRIPTION
    Checks title, description, Open Graph, Twitter Card, and canonical URLs
    for all HTML pages in the site.

.PARAMETER RootPath
    Root path of Tillerstead.com repository

.PARAMETER Page
    Specific page to validate (optional)

.EXAMPLE
    .\Validate-SEO.ps1 -RootPath "C:\web-dev\github-repos\Tillerstead.com"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$RootPath,
    
    [string]$Page
)

$ErrorActionPreference = "Stop"

function Test-MetaTags {
    param([string]$FilePath)
    
    $content = Get-Content -Path $FilePath -Raw
    $issues = @()
    
    # Extract meta tags
    $title = if ($content -match '<title[^>]*>([^<]+)</title>') { $matches[1] } else { $null }
    $description = if ($content -match '<meta\s+name="description"\s+content="([^"]+)"') { $matches[1] } else { $null }
    $canonical = if ($content -match '<link\s+rel="canonical"\s+href="([^"]+)"') { $matches[1] } else { $null }
    
    $ogTitle = if ($content -match '<meta\s+property="og:title"\s+content="([^"]+)"') { $matches[1] } else { $null }
    $ogDesc = if ($content -match '<meta\s+property="og:description"\s+content="([^"]+)"') { $matches[1] } else { $null }
    $ogImage = if ($content -match '<meta\s+property="og:image"\s+content="([^"]+)"') { $matches[1] } else { $null }
    $ogUrl = if ($content -match '<meta\s+property="og:url"\s+content="([^"]+)"') { $matches[1] } else { $null }
    
    $twitterCard = if ($content -match '<meta\s+name="twitter:card"\s+content="([^"]+)"') { $matches[1] } else { $null }
    $twitterTitle = if ($content -match '<meta\s+name="twitter:title"\s+content="([^"]+)"') { $matches[1] } else { $null }
    
    # Validate title
    if (-not $title) {
        $issues += "Missing <title> tag"
    } elseif ($title.Length -lt 50) {
        $issues += "Title too short ($($title.Length) < 50)"
    } elseif ($title.Length -gt 60) {
        $issues += "Title too long ($($title.Length) > 60)"
    }
    
    # Validate description
    if (-not $description) {
        $issues += "Missing meta description"
    } elseif ($description.Length -lt 150) {
        $issues += "Description too short ($($description.Length) < 150)"
    } elseif ($description.Length -gt 160) {
        $issues += "Description too long ($($description.Length) > 160)"
    }
    
    # Validate Open Graph
    if (-not $ogTitle) { $issues += "Missing og:title" }
    if (-not $ogDesc) { $issues += "Missing og:description" }
    if (-not $ogImage) { $issues += "Missing og:image" }
    if (-not $ogUrl) { $issues += "Missing og:url" }
    
    # Validate Twitter Card
    if (-not $twitterCard) { $issues += "Missing twitter:card" }
    if (-not $twitterTitle) { $issues += "Missing twitter:title" }
    
    # Validate canonical
    if (-not $canonical) { $issues += "Missing canonical URL" }
    
    return @{
        Title = $title
        Description = $description
        Canonical = $canonical
        OpenGraph = @{
            Title = $ogTitle
            Description = $ogDesc
            Image = $ogImage
            Url = $ogUrl
        }
        TwitterCard = @{
            Card = $twitterCard
            Title = $twitterTitle
        }
        Issues = $issues
        Valid = $issues.Count -eq 0
    }
}

Write-Host "🔍 Validating SEO Meta Tags..." -ForegroundColor Cyan

if ($Page) {
    $pages = @(Get-Item (Join-Path $RootPath $Page))
} else {
    $pages = Get-ChildItem -Path $RootPath -Filter "*.html" -Depth 1
}

$results = @()

foreach ($page in $pages) {
    Write-Host "`n📄 Checking: $($page.Name)" -ForegroundColor Yellow
    
    $validation = Test-MetaTags -FilePath $page.FullName
    
    if ($validation.Valid) {
        Write-Host "  ✓ All checks passed" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Issues found:" -ForegroundColor Red
        foreach ($issue in $validation.Issues) {
            Write-Host "    • $issue" -ForegroundColor Red
        }
    }
    
    $results += @{
        Page = $page.Name
        Validation = $validation
    }
}

# Summary
$totalPages = $results.Count
$validPages = ($results | Where-Object { $_.Validation.Valid }).Count
$pagesWithIssues = $totalPages - $validPages

Write-Host "`n📊 Summary" -ForegroundColor Green
Write-Host "=" * 60
Write-Host "Total Pages: $totalPages" -ForegroundColor Cyan
Write-Host "Valid: $validPages" -ForegroundColor $(if ($validPages -eq $totalPages) { 'Green' } else { 'Yellow' })
Write-Host "With Issues: $pagesWithIssues" -ForegroundColor $(if ($pagesWithIssues -gt 0) { 'Red' } else { 'Green' })

# Export report
$reportPath = Join-Path $RootPath "_reports\seo-audit-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$reportDir = Split-Path $reportPath -Parent
if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

$report = @{
    Timestamp = Get-Date -Format 'o'
    TotalPages = $totalPages
    ValidPages = $validPages
    PagesWithIssues = $pagesWithIssues
    Results = $results
} | ConvertTo-Json -Depth 10

Set-Content -Path $reportPath -Value $report
Write-Host "`n💾 Report saved: $reportPath" -ForegroundColor Green
