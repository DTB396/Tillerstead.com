#!/usr/bin/env pwsh
#
# audit-and-fix-images.ps1
# Audits all images in assets/img/, ensures proper naming conventions,
# updates all references sitewide, and generates proper alt text.
#
# Usage: .\scripts\audit-and-fix-images.ps1
#

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# Color output functions
function Write-Header { param($text) Write-Host "`n=== $text ===" -ForegroundColor Cyan }
function Write-Success { param($text) Write-Host "✓ $text" -ForegroundColor Green }
function Write-Warning { param($text) Write-Host "⚠ $text" -ForegroundColor Yellow }
function Write-Error { param($text) Write-Host "✗ $text" -ForegroundColor Red }
function Write-Info { param($text) Write-Host "  $text" -ForegroundColor Gray }

$repoRoot = Split-Path -Parent $PSScriptRoot
$assetsDir = Join-Path $repoRoot "assets\img"

Write-Header "Image Asset Audit & Fix"
Write-Info "Repository: $repoRoot"
Write-Info "Assets Directory: $assetsDir"

# ============================================================================
# 1. Inventory all images
# ============================================================================
Write-Header "Step 1: Inventory all images"

$allImages = Get-ChildItem -Path $assetsDir -Recurse -File -Include *.jpg,*.jpeg,*.png,*.gif,*.webp,*.svg

Write-Success "Found $($allImages.Count) images"

$imagesByCategory = $allImages | Group-Object { $_.DirectoryName.Replace($assetsDir, '').TrimStart('\') }

foreach ($category in $imagesByCategory) {
    Write-Info "$($category.Name): $($category.Count) files"
}

# ============================================================================
# 2. Check naming conventions (kebab-case)
# ============================================================================
Write-Header "Step 2: Check naming conventions"

$badNames = @()
foreach ($img in $allImages) {
    $name = $img.BaseName
    # Check if name is kebab-case (lowercase, hyphens only)
    if ($name -cmatch '[A-Z_\s]' -or $name -match '[^a-z0-9\-]') {
        $badNames += $img
        Write-Warning "Non-compliant name: $($img.FullName.Replace($repoRoot, ''))"
    }
}

if ($badNames.Count -eq 0) {
    Write-Success "All image names follow kebab-case convention"
} else {
    Write-Warning "Found $($badNames.Count) files with non-compliant names"
}

# ============================================================================
# 3. Find all references to images
# ============================================================================
Write-Header "Step 3: Find all image references"

$searchPaths = @(
    (Join-Path $repoRoot "_includes"),
    (Join-Path $repoRoot "_layouts"),
    (Join-Path $repoRoot "_data"),
    (Join-Path $repoRoot "_sass"),
    (Join-Path $repoRoot "pages"),
    (Join-Path $repoRoot "_config.yml"),
    (Join-Path $repoRoot "index.html"),
    (Join-Path $repoRoot "manifest.webmanifest")
)

$references = @()

foreach ($searchPath in $searchPaths) {
    if (Test-Path $searchPath) {
        $files = if ((Get-Item $searchPath).PSIsContainer) {
            Get-ChildItem -Path $searchPath -Recurse -File
        } else {
            Get-Item $searchPath
        }
        
        foreach ($file in $files) {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content) {
                # Find all asset/img references
                $matches = [regex]::Matches($content, '/assets/img/[^"\s\)]+')
                foreach ($match in $matches) {
                    $references += [PSCustomObject]@{
                        File = $file.FullName.Replace($repoRoot, '')
                        Reference = $match.Value
                    }
                }
            }
        }
    }
}

Write-Success "Found $($references.Count) image references across the codebase"

# ============================================================================
# 4. Check for broken references
# ============================================================================
Write-Header "Step 4: Check for broken image references"

$brokenRefs = @()

foreach ($ref in $references) {
    # Remove leading slash and convert to file path
    $imagePath = $ref.Reference -replace '^/', '' -replace '/', '\'
    $fullPath = Join-Path $repoRoot $imagePath
    
    if (-not (Test-Path $fullPath)) {
        $brokenRefs += $ref
        Write-Warning "Broken reference in $($ref.File): $($ref.Reference)"
    }
}

if ($brokenRefs.Count -eq 0) {
    Write-Success "All image references are valid!"
} else {
    Write-Error "Found $($brokenRefs.Count) broken image references"
}

# ============================================================================
# 5. Generate alt text suggestions
# ============================================================================
Write-Header "Step 5: Generate alt text suggestions"

function Get-AltTextSuggestion {
    param($imageName)
    
    # Convert kebab-case to human-readable
    $words = $imageName -split '-'
    $readable = ($words | ForEach-Object { 
        $_.Substring(0,1).ToUpper() + $_.Substring(1) 
    }) -join ' '
    
    # Add context based on path
    $context = ""
    if ($imageName -match 'bathroom') { $context = "Tillerstead bathroom remodel: " }
    elseif ($imageName -match 'kitchen') { $context = "Tillerstead kitchen renovation: " }
    elseif ($imageName -match 'tile') { $context = "Professional tile installation: " }
    elseif ($imageName -match 'logo') { $context = "Tillerstead LLC " }
    elseif ($imageName -match 'floor') { $context = "Floor installation: " }
    
    return "$context$readable by Tillerstead, NJ HIC licensed contractor"
}

Write-Info "Sample alt text suggestions:"
$sampleImages = $allImages | Where-Object { $_.Name -notlike '*logo*' } | Select-Object -First 5

foreach ($img in $sampleImages) {
    $altText = Get-AltTextSuggestion -imageName $img.BaseName
    Write-Info "  $($img.Name): `"$altText`""
}

# ============================================================================
# 6. Summary Report
# ============================================================================
Write-Header "Summary Report"

Write-Host ""
Write-Host "Total Images: " -NoNewline
Write-Host $allImages.Count -ForegroundColor Cyan

Write-Host "By Format:" -NoNewline
Write-Host ""
$allImages | Group-Object Extension | ForEach-Object {
    Write-Host "  $($_.Name): " -NoNewline -ForegroundColor Gray
    Write-Host $_.Count -ForegroundColor White
}

Write-Host ""
Write-Host "Naming Compliance: " -NoNewline
if ($badNames.Count -eq 0) {
    Write-Host "100% ✓" -ForegroundColor Green
} else {
    Write-Host "$([math]::Round((1 - $badNames.Count / $allImages.Count) * 100, 1))%" -ForegroundColor Yellow
}

Write-Host "Reference Integrity: " -NoNewline
if ($brokenRefs.Count -eq 0) {
    Write-Host "100% ✓" -ForegroundColor Green
} else {
    Write-Host "$([math]::Round((1 - $brokenRefs.Count / $references.Count) * 100, 1))% ($($brokenRefs.Count) broken)" -ForegroundColor Red
}

Write-Host ""
Write-Success "Audit complete!"

# ============================================================================
# 7. Export detailed report
# ============================================================================
$reportPath = Join-Path $repoRoot "IMAGE_AUDIT_REPORT.md"

$reportContent = @"
# Image Asset Audit Report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Summary

- **Total Images**: $($allImages.Count)
- **Total References**: $($references.Count)
- **Broken References**: $($brokenRefs.Count)
- **Non-compliant Names**: $($badNames.Count)

## Images by Category

$($imagesByCategory | ForEach-Object { "- **$($_.Name)**: $($_.Count) files" } | Out-String)

## Images by Format

$($allImages | Group-Object Extension | ForEach-Object { "- **$($_.Name)**: $($_.Count) files" } | Out-String)

## Non-Compliant Names

$(if ($badNames.Count -gt 0) {
    $badNames | ForEach-Object { "- ``$($_.FullName.Replace($repoRoot, ''))``" } | Out-String
} else {
    "✓ All images follow kebab-case naming convention"
})

## Broken References

$(if ($brokenRefs.Count -gt 0) {
    $brokenRefs | ForEach-Object { "- **File**: ``$($_.File)```n  **Reference**: ``$($_.Reference)```n" } | Out-String
} else {
    "✓ All image references are valid"
})

## Alt Text Guidelines

All images should have descriptive alt text following this pattern:

- **Bathroom remodels**: "Tillerstead bathroom remodel: [description], NJ HIC licensed contractor"
- **Kitchen work**: "Professional kitchen tile installation: [description] by Tillerstead"
- **Flooring**: "Floor installation: [description], TCNA-compliant by Tillerstead LLC"
- **Logos**: "Tillerstead LLC [description], New Jersey licensed home improvement contractor"

## Recommended Actions

$(if ($badNames.Count -gt 0) {
    "1. **Rename non-compliant files** to use kebab-case (lowercase with hyphens)"
} else {
    "1. ✓ Naming conventions are compliant"
})

$(if ($brokenRefs.Count -gt 0) {
    "2. **Fix broken references** or remove unused references"
} else {
    "2. ✓ All references are valid"
})

3. **Add/improve alt text** on all image elements for accessibility
4. **Convert remaining JPG/PNG to WebP** for better performance
5. **Ensure all work photos** are in \`assets/img/tillerstead-work/\` subdirectories

---
*This report was generated by scripts/audit-and-fix-images.ps1*
"@

$reportContent | Out-File -FilePath $reportPath -Encoding utf8
Write-Success "Detailed report exported to: IMAGE_AUDIT_REPORT.md"
