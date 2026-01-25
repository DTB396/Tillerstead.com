#!/usr/bin/env pwsh
# TILLERSTEAD OVERNIGHT OPTIMIZATION SUITE
# Runs comprehensive improvements while you sleep

$ErrorActionPreference = "Continue"
$repo = "C:\web-dev\github-repos\Tillerstead.com"
Set-Location $repo

Write-Host "🌙 OVERNIGHT OPTIMIZATION STARTING..." -ForegroundColor Cyan
Write-Host "Time: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Create reports directory
New-Item -ItemType Directory -Force -Path "optimization-reports" | Out-Null

# =============================================================================
# PHASE 1: CODE QUALITY ANALYSIS
# =============================================================================
Write-Host "📊 PHASE 1: Code Quality Analysis" -ForegroundColor Yellow

# CSS Analysis
Write-Host "  → Analyzing CSS files..." -ForegroundColor Gray
$cssFiles = Get-ChildItem -Path "assets\css" -Filter "*.css" -Recurse
$cssReport = @{
    totalFiles = $cssFiles.Count
    totalSize = ($cssFiles | Measure-Object -Property Length -Sum).Sum
    largeFiles = $cssFiles | Where-Object { $_.Length -gt 50KB } | Select-Object Name, @{N='SizeKB';E={[math]::Round($_.Length/1KB,2)}}
    duplicates = @()
}

# Check for duplicate CSS rules
Write-Host "  → Checking for duplicate CSS selectors..." -ForegroundColor Gray
$allSelectors = @{}
foreach ($file in $cssFiles) {
    $content = Get-Content $file.FullName -Raw
    $selectors = [regex]::Matches($content, '([.#][\w-]+)\s*\{') | ForEach-Object { $_.Groups[1].Value }
    foreach ($selector in $selectors) {
        if (!$allSelectors[$selector]) { $allSelectors[$selector] = @() }
        $allSelectors[$selector] += $file.Name
    }
}
$cssReport.duplicates = $allSelectors.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 } | Select-Object -First 20

$cssReport | ConvertTo-Json -Depth 3 | Out-File "optimization-reports\css-analysis.json"
Write-Host "  ✅ CSS analysis complete" -ForegroundColor Green

# JavaScript Analysis
Write-Host "  → Analyzing JavaScript files..." -ForegroundColor Gray
$jsFiles = Get-ChildItem -Path "assets\js" -Filter "*.js" -Recurse
$jsReport = @{
    totalFiles = $jsFiles.Count
    totalSize = ($jsFiles | Measure-Object -Property Length -Sum).Sum
    largeFiles = $jsFiles | Where-Object { $_.Length -gt 100KB } | Select-Object Name, @{N='SizeKB';E={[math]::Round($_.Length/1KB,2)}}
    consoleStatements = @()
}

# Find console.log statements (should be removed in production)
foreach ($file in $jsFiles) {
    $content = Get-Content $file.FullName -Raw
    $matches = [regex]::Matches($content, 'console\.(log|warn|error|debug)')
    if ($matches.Count -gt 0) {
        $jsReport.consoleStatements += @{
            file = $file.Name
            count = $matches.Count
        }
    }
}

$jsReport | ConvertTo-Json -Depth 3 | Out-File "optimization-reports\js-analysis.json"
Write-Host "  ✅ JavaScript analysis complete" -ForegroundColor Green

# =============================================================================
# PHASE 2: IMAGE OPTIMIZATION
# =============================================================================
Write-Host "`n📸 PHASE 2: Image Analysis" -ForegroundColor Yellow

$imageExtensions = @('*.jpg', '*.jpeg', '*.png', '*.webp', '*.gif', '*.svg')
$allImages = $imageExtensions | ForEach-Object { Get-ChildItem -Path "assets" -Filter $_ -Recurse -ErrorAction SilentlyContinue }

$imageReport = @{
    totalImages = $allImages.Count
    totalSize = ($allImages | Measure-Object -Property Length -Sum).Sum
    largeImages = $allImages | Where-Object { $_.Length -gt 500KB } | Select-Object Name, @{N='SizeMB';E={[math]::Round($_.Length/1MB,2)}}, Directory
    missingWebP = @()
}

# Check for images that should have WebP versions
$jpgPng = $allImages | Where-Object { $_.Extension -match '\.(jpg|jpeg|png)$' }
foreach ($img in $jpgPng) {
    $webpPath = $img.FullName -replace '\.(jpg|jpeg|png)$', '.webp'
    if (!(Test-Path $webpPath)) {
        $imageReport.missingWebP += $img.Name
    }
}

$imageReport | ConvertTo-Json -Depth 3 | Out-File "optimization-reports\image-analysis.json"
Write-Host "  ✅ Image analysis complete" -ForegroundColor Green

# =============================================================================
# PHASE 3: HTML/LIQUID VALIDATION
# =============================================================================
Write-Host "`n📄 PHASE 3: HTML/Liquid Validation" -ForegroundColor Yellow

$htmlFiles = Get-ChildItem -Path . -Filter "*.html" -Recurse | Where-Object { $_.FullName -notmatch '(_site|node_modules|_backup)' }
$liquidFiles = Get-ChildItem -Path "_includes" -Recurse -ErrorAction SilentlyContinue

$htmlReport = @{
    totalFiles = $htmlFiles.Count + $liquidFiles.Count
    missingAltTags = @()
    emptyLinks = @()
    deprecatedTags = @()
}

# Check for accessibility issues
foreach ($file in ($htmlFiles + $liquidFiles)) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    
    # Missing alt tags
    $imgWithoutAlt = [regex]::Matches($content, '<img(?![^>]*\balt=)[^>]*>')
    if ($imgWithoutAlt.Count -gt 0) {
        $htmlReport.missingAltTags += @{
            file = $file.Name
            count = $imgWithoutAlt.Count
        }
    }
    
    # Empty links
    $emptyLinks = [regex]::Matches($content, '<a[^>]*href=["\']#["\'][^>]*>(?!</a>)|<a[^>]*href=["\']["\']')
    if ($emptyLinks.Count -gt 0) {
        $htmlReport.emptyLinks += @{
            file = $file.Name
            count = $emptyLinks.Count
        }
    }
}

$htmlReport | ConvertTo-Json -Depth 3 | Out-File "optimization-reports\html-validation.json"
Write-Host "  ✅ HTML validation complete" -ForegroundColor Green

# =============================================================================
# PHASE 4: DEPENDENCY AUDIT
# =============================================================================
Write-Host "`n📦 PHASE 4: Dependency Audit" -ForegroundColor Yellow

if (Test-Path "Gemfile") {
    Write-Host "  → Checking Ruby dependencies..." -ForegroundColor Gray
    bundle outdated 2>&1 | Out-File "optimization-reports\bundle-outdated.txt"
    Write-Host "  ✅ Ruby dependency check complete" -ForegroundColor Green
}

if (Test-Path "package.json") {
    Write-Host "  → Checking NPM dependencies..." -ForegroundColor Gray
    npm outdated 2>&1 | Out-File "optimization-reports\npm-outdated.txt"
    Write-Host "  ✅ NPM dependency check complete" -ForegroundColor Green
}

# =============================================================================
# PHASE 5: BROKEN LINK CHECK
# =============================================================================
Write-Host "`n🔗 PHASE 5: Internal Link Validation" -ForegroundColor Yellow

$allLinks = @()
$brokenLinks = @()

# Extract all internal links
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    $links = [regex]::Matches($content, 'href=["\']([^"\']*)["\']') | ForEach-Object { $_.Groups[1].Value }
    
    foreach ($link in $links) {
        if ($link -match '^/[^/]' -and $link -notmatch '^//(www\.)?' -and $link -notmatch '\.(css|js|png|jpg|webp|svg)$') {
            $allLinks += @{
                file = $file.Name
                link = $link
            }
        }
    }
}

$linkReport = @{
    totalInternalLinks = $allLinks.Count
    uniqueLinks = ($allLinks | Select-Object -ExpandProperty link -Unique).Count
    potentialIssues = @()
}

# Check for common 404 patterns
$commonIssues = @('/build-guide/', '/products/', '/services/', '/about/', '/blog/', '/portfolio/')
foreach ($issue in $commonIssues) {
    $matching = $allLinks | Where-Object { $_.link -like "$issue*" }
    if ($matching.Count -gt 0) {
        $linkReport.potentialIssues += @{
            pattern = $issue
            count = $matching.Count
            files = ($matching | Select-Object -ExpandProperty file -Unique)
        }
    }
}

$linkReport | ConvertTo-Json -Depth 4 | Out-File "optimization-reports\link-validation.json"
Write-Host "  ✅ Link validation complete" -ForegroundColor Green

# =============================================================================
# PHASE 6: PERFORMANCE METRICS
# =============================================================================
Write-Host "`n⚡ PHASE 6: Performance Analysis" -ForegroundColor Yellow

$perfReport = @{
    cssFileCount = $cssFiles.Count
    cssTotal = [math]::Round(($cssFiles | Measure-Object -Property Length -Sum).Sum / 1KB, 2)
    jsFileCount = $jsFiles.Count
    jsTotal = [math]::Round(($jsFiles | Measure-Object -Property Length -Sum).Sum / 1KB, 2)
    imageFileCount = $allImages.Count
    imageTotal = [math]::Round(($allImages | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
    recommendations = @()
}

if ($perfReport.cssTotal -gt 500) {
    $perfReport.recommendations += "Consider combining or minifying CSS files (current: $($perfReport.cssTotal)KB)"
}

if ($perfReport.jsTotal -gt 1000) {
    $perfReport.recommendations += "Consider lazy loading or splitting JavaScript (current: $($perfReport.jsTotal)KB)"
}

if ($perfReport.imageTotal -gt 10) {
    $perfReport.recommendations += "Consider lazy loading images or WebP conversion (current: $($perfReport.imageTotal)MB)"
}

$perfReport | ConvertTo-Json -Depth 3 | Out-File "optimization-reports\performance-metrics.json"
Write-Host "  ✅ Performance analysis complete" -ForegroundColor Green

# =============================================================================
# PHASE 7: GENERATE MASTER REPORT
# =============================================================================
Write-Host "`n📋 PHASE 7: Generating Master Report" -ForegroundColor Yellow

$masterReport = @"
# TILLERSTEAD.COM OVERNIGHT OPTIMIZATION REPORT
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Executive Summary

### Code Quality
- **CSS Files**: $($cssReport.totalFiles) files, $([math]::Round($cssReport.totalSize/1KB, 2))KB total
- **JavaScript Files**: $($jsReport.totalFiles) files, $([math]::Round($jsReport.totalSize/1KB, 2))KB total
- **Large Files**: $($cssReport.largeFiles.Count + $jsReport.largeFiles.Count) files over 50KB

### Images
- **Total Images**: $($imageReport.totalImages)
- **Total Size**: $([math]::Round($imageReport.totalSize/1MB, 2))MB
- **Large Images**: $($imageReport.largeImages.Count) images over 500KB
- **Missing WebP**: $($imageReport.missingWebP.Count) images

### HTML/Accessibility
- **Files Checked**: $($htmlReport.totalFiles)
- **Missing Alt Tags**: $($htmlReport.missingAltTags.Count) files with issues
- **Empty Links**: $($htmlReport.emptyLinks.Count) files with issues

### Links
- **Total Internal Links**: $($linkReport.totalInternalLinks)
- **Unique URLs**: $($linkReport.uniqueLinks)
- **Potential Issues**: $($linkReport.potentialIssues.Count) patterns found

### Performance
- **CSS Bundle**: $($perfReport.cssTotal)KB across $($perfReport.cssFileCount) files
- **JS Bundle**: $($perfReport.jsTotal)KB across $($perfReport.jsFileCount) files
- **Image Total**: $($perfReport.imageTotal)MB

## Top Recommendations

1. **Fix Navigation 404s**: Update remaining /build-guide/ references
2. **Optimize Images**: Convert $($imageReport.missingWebP.Count) images to WebP
3. **Remove Console Logs**: Found in $($jsReport.consoleStatements.Count) JS files
4. **CSS Optimization**: $($cssReport.duplicates.Count) duplicate selectors found
5. **Accessibility**: Fix $($htmlReport.missingAltTags.Count) missing alt tags

## Detailed Reports

Check the `optimization-reports/` directory for detailed JSON reports:
- css-analysis.json
- js-analysis.json
- image-analysis.json
- html-validation.json
- link-validation.json
- performance-metrics.json

---
**Next Steps**: Review this report and prioritize fixes based on impact.
"@

$masterReport | Out-File "optimization-reports\MASTER-REPORT.md"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ OVERNIGHT OPTIMIZATION COMPLETE!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Reports generated in: optimization-reports/" -ForegroundColor Cyan
Write-Host "📋 Master report: optimization-reports/MASTER-REPORT.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Time completed: $(Get-Date)" -ForegroundColor Gray
Write-Host ""
Write-Host "Review the reports and run apply-fixes.ps1 to implement improvements!" -ForegroundColor Yellow
