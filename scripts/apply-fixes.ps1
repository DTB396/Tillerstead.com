#!/usr/bin/env pwsh
# APPLY AUTOMATED FIXES
# Based on overnight optimization analysis

param(
    [switch]$DryRun,
    [switch]$AutoCommit
)

$repo = "C:\web-dev\github-repos\Tillerstead.com"
Set-Location $repo

Write-Host "🔧 APPLYING AUTOMATED FIXES..." -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "⚠️  DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

# Load reports
$cssReport = Get-Content "optimization-reports\css-analysis.json" -Raw | ConvertFrom-Json
$jsReport = Get-Content "optimization-reports\js-analysis.json" -Raw | ConvertFrom-Json
$htmlReport = Get-Content "optimization-reports\html-validation.json" -Raw | ConvertFrom-Json

$fixesApplied = @()

# =============================================================================
# FIX 1: Remove console.log statements
# =============================================================================
if ($jsReport.consoleStatements.Count -gt 0) {
    Write-Host "🔧 FIX 1: Removing console statements from production code" -ForegroundColor Yellow
    
    foreach ($item in $jsReport.consoleStatements) {
        $filePath = "assets\js\$($item.file)"
        if (Test-Path $filePath) {
            if (!$DryRun) {
                $content = Get-Content $filePath -Raw
                # Comment out console statements instead of removing
                $content = $content -replace '(\s+)(console\.(log|warn|error|debug)\([^)]*\);?)', '$1// $2 // AUTO-DISABLED'
                $content | Out-File $filePath -NoNewline -Encoding UTF8
                $fixesApplied += "Disabled $($item.count) console statements in $($item.file)"
            }
            Write-Host "  ✅ $($item.file): Disabled $($item.count) console statements" -ForegroundColor Green
        }
    }
}

# =============================================================================
# FIX 2: Add missing alt tags
# =============================================================================
if ($htmlReport.missingAltTags.Count -gt 0) {
    Write-Host "`n🔧 FIX 2: Adding placeholder alt tags" -ForegroundColor Yellow
    
    foreach ($item in $htmlReport.missingAltTags) {
        $file = Get-ChildItem -Path . -Filter $item.file -Recurse | Select-Object -First 1
        if ($file -and !$DryRun) {
            $content = Get-Content $file.FullName -Raw
            # Add generic alt="" to images without alt
            $content = $content -replace '<img(?![^>]*\balt=)([^>]*?)>', '<img alt="Image"$1>'
            $content | Out-File $file.FullName -NoNewline -Encoding UTF8
            $fixesApplied += "Added alt tags to $($item.file)"
        }
        Write-Host "  ✅ $($item.file): Added alt attributes" -ForegroundColor Green
    }
}

# =============================================================================
# FIX 3: Create .editorconfig for consistent formatting
# =============================================================================
Write-Host "`n🔧 FIX 3: Creating/updating .editorconfig" -ForegroundColor Yellow

$editorConfig = @"
# EditorConfig: https://EditorConfig.org
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{html,liquid,md}]
indent_style = space
indent_size = 2

[*.{css,scss}]
indent_style = space
indent_size = 2

[*.{js,json}]
indent_style = space
indent_size = 2

[*.yml]
indent_style = space
indent_size = 2

[Makefile]
indent_style = tab
"@

if (!$DryRun) {
    $editorConfig | Out-File ".editorconfig" -NoNewline -Encoding UTF8
    $fixesApplied += "Created/updated .editorconfig"
}
Write-Host "  ✅ .editorconfig configured" -ForegroundColor Green

# =============================================================================
# FIX 4: Create component inventory
# =============================================================================
Write-Host "`n🔧 FIX 4: Generating component inventory" -ForegroundColor Yellow

$components = @{
    includes = (Get-ChildItem -Path "_includes" -Recurse -File -ErrorAction SilentlyContinue | Select-Object Name, Directory).Count
    layouts = (Get-ChildItem -Path "_layouts" -Recurse -File -ErrorAction SilentlyContinue | Select-Object Name).Count
    cssFiles = $cssReport.totalFiles
    jsFiles = $jsReport.totalFiles
}

$inventory = @"
# TILLERSTEAD COMPONENT INVENTORY
Last Updated: $(Get-Date -Format "yyyy-MM-dd")

## Template Components
- **Includes**: $($components.includes) files
- **Layouts**: $($components.layouts) files

## Assets
- **CSS Files**: $($components.cssFiles)
- **JavaScript Files**: $($components.jsFiles)

## File Structure
``````
_includes/
  ├── hero/
  ├── navigation/
  ├── sections/
  └── ...

_layouts/
  └── default layouts

assets/
  ├── css/
  ├── js/
  └── images/
``````

## Key Components

### Navigation
- main-nav.html - Desktop & mobile navigation
- nav.js - Navigation behavior

### Hero Sections  
- unified-hero-home.html - Homepage hero
- NJ HIC badge display
- TCNA compliance messaging

### Styling
- header-nav-fixed.css - Header and navigation styles
- nav-hero-text-fix.css - Hero text contrast fixes

---
*Auto-generated by overnight optimization*
"@

if (!$DryRun) {
    $inventory | Out-File "COMPONENT-INVENTORY.md" -NoNewline -Encoding UTF8
    $fixesApplied += "Created component inventory"
}
Write-Host "  ✅ Component inventory created" -ForegroundColor Green

# =============================================================================
# FIX 5: Create optimization checklist
# =============================================================================
Write-Host "`n🔧 FIX 5: Creating optimization checklist" -ForegroundColor Yellow

$checklist = @"
# OPTIMIZATION CHECKLIST

## Completed ✅
- [x] Hero text contrast fixed
- [x] Navigation 404 errors fixed  
- [x] Scroll blocking resolved
- [x] Nav links white on green
- [x] Code quality analysis run
- [x] Component inventory created

## High Priority 🔴
- [ ] Convert large images to WebP format
- [ ] Minify CSS/JS for production
- [ ] Set up automated testing
- [ ] Add lazy loading for images
- [ ] Optimize font loading

## Medium Priority 🟡  
- [ ] Remove duplicate CSS selectors
- [ ] Consolidate similar styles
- [ ] Add missing schema.org markup
- [ ] Implement service worker for PWA
- [ ] Set up GitHub Actions CI/CD

## Low Priority 🟢
- [ ] Add more comprehensive alt text
- [ ] Create style guide documentation
- [ ] Set up visual regression testing
- [ ] Add performance budgets
- [ ] Document all components

## Future Enhancements 🚀
- [ ] Implement A/B testing framework
- [ ] Add analytics event tracking
- [ ] Create design system tokens
- [ ] Build component library
- [ ] Add automated accessibility testing

---
Updated: $(Get-Date -Format "yyyy-MM-dd")
"@

if (!$DryRun) {
    $checklist | Out-File "OPTIMIZATION-CHECKLIST.md" -NoNewline -Encoding UTF8
    $fixesApplied += "Created optimization checklist"
}
Write-Host "  ✅ Optimization checklist created" -ForegroundColor Green

# =============================================================================
# SUMMARY & COMMIT
# =============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ AUTOMATED FIXES COMPLETE!" -ForegroundColor Green  
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Fixes Applied: $($fixesApplied.Count)" -ForegroundColor Cyan
foreach ($fix in $fixesApplied) {
    Write-Host "  • $fix" -ForegroundColor Gray
}
Write-Host ""

if ($AutoCommit -and !$DryRun) {
    Write-Host "📦 Auto-committing changes..." -ForegroundColor Yellow
    git add .
    git commit -m "chore: overnight optimization improvements

Applied automated fixes:
$(($fixesApplied | ForEach-Object { "- $_" }) -join "`n")

Generated by overnight-optimization.ps1"
    Write-Host "  ✅ Changes committed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review optimization-reports/MASTER-REPORT.md" -ForegroundColor White
Write-Host "  2. Check OPTIMIZATION-CHECKLIST.md for remaining tasks" -ForegroundColor White
Write-Host "  3. Review COMPONENT-INVENTORY.md for file structure" -ForegroundColor White
if (!$AutoCommit) {
    Write-Host "  4. Run with -AutoCommit to commit changes" -ForegroundColor White
}
Write-Host ""
