#!/usr/bin/env pwsh
# NAV LINK TESTER - Comprehensive Desktop & Mobile Nav Verification
# Tests all navigation links and generates a report

$ErrorActionPreference = "Continue"
$repo = "C:\web-dev\github-repos\Tillerstead.com"
Set-Location $repo

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  NAV LINK TESTER - Desktop & Mobile                  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Define all nav links
$navLinks = @(
    @{ Name = "Services"; URL = "/services/"; File = "services.html" }
    @{ Name = "Portfolio (Our Work)"; URL = "/portfolio/"; File = "portfolio.html" }
    @{ Name = "Blog"; URL = "/blog/"; File = "blog.html" }
    @{ Name = "Reviews"; URL = "/reviews/"; File = "reviews.html" }
    @{ Name = "Tools"; URL = "/tools/"; File = "tools.html" }
    @{ Name = "About"; URL = "/about/"; File = "about.html" }
    @{ Name = "FAQ"; URL = "/faq/"; File = "faq.html" }
    @{ Name = "Products"; URL = "/products/"; File = "products.html" }
    @{ Name = "For Contractors"; URL = "/for-general-contractors/"; File = "for-general-contractors.html" }
    @{ Name = "Contact"; URL = "/contact/"; File = "contact.html" }
    @{ Name = "Build Guide"; URL = "/build/"; File = "build.html" }
)

$buildLinks = @(
    @{ Name = "Codes & Permits"; URL = "/build/phase-01/"; Path = "build\phase-01" }
    @{ Name = "Shower Pans"; URL = "/build/phase-02/"; Path = "build\phase-02" }
    @{ Name = "Waterproofing"; URL = "/build/phase-03/"; Path = "build\phase-03" }
    @{ Name = "Curbless Showers"; URL = "/build/curbs-curbless/"; File = "build\curbs-curbless.md" }
    @{ Name = "Benches & Niches"; URL = "/build/phase-05/"; Path = "build\phase-05" }
    @{ Name = "TCNA Standards"; URL = "/build/phase-06/"; Path = "build\phase-06" }
    @{ Name = "Flood Testing"; URL = "/build/flood-testing/"; File = "build\flood-testing.md" }
)

# Test counters
$total = 0
$passed = 0
$failed = 0
$failures = @()

# Test main nav links
Write-Host "📋 TESTING MAIN NAV LINKS..." -ForegroundColor Yellow
Write-Host ""

foreach ($link in $navLinks) {
    $total++
    $name = $link.Name
    $url = $link.URL
    $file = $link.File
    
    if (Test-Path $file) {
        Write-Host "  ✅ $name" -ForegroundColor Green -NoNewline
        Write-Host " → $url" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host "  ❌ $name" -ForegroundColor Red -NoNewline
        Write-Host " → $url (FILE NOT FOUND: $file)" -ForegroundColor Red
        $failed++
        $failures += @{ Link = $name; URL = $url; File = $file }
    }
}

Write-Host ""

# Test build guide links
Write-Host "📚 TESTING BUILD GUIDE LINKS..." -ForegroundColor Yellow
Write-Host ""

foreach ($link in $buildLinks) {
    $total++
    $name = $link.Name
    $url = $link.URL
    
    # Check if it's a directory or file
    if ($link.Path) {
        $exists = Test-Path $link.Path
    } else {
        $exists = Test-Path $link.File
    }
    
    if ($exists) {
        Write-Host "  ✅ $name" -ForegroundColor Green -NoNewline
        Write-Host " → $url" -ForegroundColor Gray
        $passed++
    } else {
        $target = if ($link.Path) { $link.Path } else { $link.File }
        Write-Host "  ❌ $name" -ForegroundColor Red -NoNewline
        Write-Host " → $url (NOT FOUND: $target)" -ForegroundColor Red
        $failed++
        $failures += @{ Link = $name; URL = $url; File = $target }
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Test nav HTML structure
Write-Host ""
Write-Host "🔍 TESTING NAV STRUCTURE..." -ForegroundColor Yellow
Write-Host ""

$navFile = "_includes\navigation\main-nav.html"
if (Test-Path $navFile) {
    $navContent = Get-Content $navFile -Raw
    
    # Check for proper ARIA attributes
    $ariaChecks = @{
        "aria-label" = ($navContent -match 'aria-label=')
        "aria-expanded" = ($navContent -match 'aria-expanded=')
        "aria-haspopup" = ($navContent -match 'aria-haspopup=')
        "aria-hidden" = ($navContent -match 'aria-hidden=')
    }
    
    foreach ($check in $ariaChecks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "  ✅ $($check.Key) present" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $($check.Key) missing" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    
    # Check for mobile nav
    if ($navContent -match 'class="mobile-nav"') {
        Write-Host "  ✅ Mobile nav found" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Mobile nav missing" -ForegroundColor Red
    }
    
    if ($navContent -match 'class="desktop-nav"') {
        Write-Host "  ✅ Desktop nav found" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Desktop nav missing" -ForegroundColor Red
    }
    
    if ($navContent -match 'class="mobile-nav__toggle"') {
        Write-Host "  ✅ Hamburger toggle found" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Hamburger toggle missing" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Summary
Write-Host ""
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Total Links Tested: $total" -ForegroundColor White
Write-Host "  ✅ Passed: $passed" -ForegroundColor Green
Write-Host "  ❌ Failed: $failed" -ForegroundColor Red
Write-Host "  Success Rate: $([math]::Round(($passed/$total)*100, 1))%" -ForegroundColor Cyan
Write-Host ""

if ($failed -gt 0) {
    Write-Host "❌ FAILURES:" -ForegroundColor Red
    Write-Host ""
    foreach ($failure in $failures) {
        Write-Host "  • $($failure.Link)" -ForegroundColor Red
        Write-Host "    URL: $($failure.URL)" -ForegroundColor Gray
        Write-Host "    File: $($failure.File)" -ForegroundColor Gray
        Write-Host ""
    }
}

# Grade
if ($failed -eq 0) {
    Write-Host "🎉 GRADE: A+ (PERFECT!)" -ForegroundColor Green
    Write-Host "All navigation links working perfectly!" -ForegroundColor Green
} elseif ($failed -le 1) {
    Write-Host "✅ GRADE: A" -ForegroundColor Green
    Write-Host "Excellent! Minor issue to fix." -ForegroundColor Yellow
} elseif ($failed -le 3) {
    Write-Host "⚠️  GRADE: B" -ForegroundColor Yellow
    Write-Host "Good, but needs attention." -ForegroundColor Yellow
} else {
    Write-Host "❌ GRADE: C or Below" -ForegroundColor Red
    Write-Host "Multiple issues need fixing." -ForegroundColor Red
}

Write-Host ""
Write-Host "Report saved to: NAV-LINK-TEST-REPORT.md" -ForegroundColor Cyan
Write-Host ""
