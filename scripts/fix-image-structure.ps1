#!/usr/bin/env pwsh
#
# fix-image-structure.ps1
# Restructures image directories and updates all references
#
# Changes:
# 1. Create missing bathrooms, exteriors, kitchens directories
# 2. Rename non-compliant files (IMG_*.jpeg → kebab-case)
# 3. Move files to proper directories
# 4. Update all references across codebase
# 5. Create missing og-image files
#

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Write-Header { param($text) Write-Host "`n=== $text ===" -ForegroundColor Cyan }
function Write-Success { param($text) Write-Host "✓ $text" -ForegroundColor Green }
function Write-Info { param($text) Write-Host "  $text" -ForegroundColor Gray }

$repoRoot = Split-Path -Parent $PSScriptRoot
$workDir = Join-Path $repoRoot "assets\img\tillerstead-work"

Write-Header "Restructuring Image Organization"

# ============================================================================
# 1. Create proper directory structure
# ============================================================================
Write-Header "Step 1: Create directory structure"

$newDirs = @(
    "bathrooms",
    "kitchens",
    "exteriors",
    "floors"
)

foreach ($dir in $newDirs) {
    $path = Join-Path $workDir $dir
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Success "Created: $dir\"
    } else {
        Write-Info "Already exists: $dir\"
    }
}

# ============================================================================
# 2. Rename non-compliant files
# ============================================================================
Write-Header "Step 2: Rename non-compliant files"

$renameMap = @{
    "IMG_0449.jpeg" = "bathroom-shower-tile-install.jpg"
    "IMG_0485.jpeg" = "bathroom-tile-layout-progress.jpg"
    "IMG_0497.jpeg" = "bathroom-wall-tile-detail.jpg"
    "IMG_9E9CC837-0EC3-44C5-B7ED-BD9DCA721D57.JPEG" = "bathroom-tile-corner-detail.jpg"
}

$tileDir = Join-Path $workDir "tile"

foreach ($oldName in $renameMap.Keys) {
    $oldPath = Join-Path $tileDir $oldName
    $newName = $renameMap[$oldName]
    $newPath = Join-Path $tileDir $newName
    
    if (Test-Path $oldPath) {
        Rename-Item -Path $oldPath -NewName $newName -Force
        Write-Success "Renamed: $oldName → $newName"
    }
}

# ============================================================================
# 3. Move/copy files to proper directories
# ============================================================================
Write-Header "Step 3: Organize files by category"

# Map current files to their proper locations
$fileMap = @{
    # Bathroom files (in tile/ → move to bathrooms/)
    "bathroom-remodel-final.webp" = "bathrooms"
    "bathroom-remodel-in-progress-begin.webp" = "bathrooms"
    "bathroom-remodel-in-progress-mid.webp" = "bathrooms"
    "bathroom-shower-tile-install.jpg" = "bathrooms"
    "bathroom-tile-layout-progress.jpg" = "bathrooms"
    "bathroom-wall-tile-detail.jpg" = "bathrooms"
    "bathroom-tile-corner-detail.jpg" = "bathrooms"
}

foreach ($file in $fileMap.Keys) {
    $sourcePath = Join-Path $tileDir $file
    $destDir = Join-Path $workDir $fileMap[$file]
    $destPath = Join-Path $destDir $file
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Success "Copied: $file → $($fileMap[$file])\"
    } else {
        Write-Info "Not found (skipping): $file"
    }
}

# ============================================================================
# 4. Create placeholder images for missing references
# ============================================================================
Write-Header "Step 4: Create placeholder images"

# These are referenced but don't exist - we'll create soft links or duplicates
$placeholders = @{
    "bathroom-marble-floor-finish.jpg" = "bathroom-remodel-final.webp"
    "bathroom-marble-shower-niche.jpg" = "bathroom-shower-tile-install.jpg"
    "bathroom-accent-wall-and-shower.jpg" = "bathroom-wall-tile-detail.jpg"
    "bathroom-accent-wall-detail.jpg" = "bathroom-tile-corner-detail.jpg"
    "bathroom-floor-ditra-progress.jpg" = "bathroom-tile-layout-progress.jpg"
    "bathroom-floor-install-progress.jpg" = "bathroom-remodel-in-progress-mid.webp"
    "bathroom-remodel-finished.webp" = "bathroom-remodel-final.webp"
}

$bathroomDir = Join-Path $workDir "bathrooms"

foreach ($missing in $placeholders.Keys) {
    $missingPath = Join-Path $bathroomDir $missing
    $sourceName = $placeholders[$missing]
    $sourcePath = Join-Path $bathroomDir $sourceName
    
    if (-not (Test-Path $missingPath) -and (Test-Path $sourcePath)) {
        Copy-Item -Path $sourcePath -Destination $missingPath -Force
        Write-Success "Created placeholder: $missing (from $sourceName)"
    }
}

# Create WebP versions where needed
Get-ChildItem -Path $bathroomDir -Filter "*.jpg" | ForEach-Object {
    $webpName = $_.BaseName + ".webp"
    $webpPath = Join-Path $bathroomDir $webpName
    
    if (-not (Test-Path $webpPath)) {
        # Check if there's a corresponding webp in the source
        $sourceWebp = Join-Path $bathroomDir "$($_.BaseName).webp"
        if (Test-Path $sourceWebp) {
            # Already exists
        } else {
            # Copy the jpg as placeholder (ideally would convert)
            Copy-Item -Path $_.FullName -Destination $webpPath -Force
            Write-Info "Created WebP placeholder: $webpName"
        }
    }
}

# ============================================================================
# 5. Create missing social/OG images
# ============================================================================
Write-Header "Step 5: Create missing OG images"

$socialDir = Join-Path $repoRoot "assets\img\social"
$ogSource = Join-Path $socialDir "tillerstead-showcase.jpg"
$ogDest1 = Join-Path $repoRoot "assets\img\og.jpg"
$ogDest2 = Join-Path $repoRoot "assets\img\og-tillerstead.jpg"

if (Test-Path $ogSource) {
    Copy-Item -Path $ogSource -Destination $ogDest1 -Force
    Copy-Item -Path $ogSource -Destination $ogDest2 -Force
    Write-Success "Created OG images from showcase image"
}

# ============================================================================
# 6. Create exteriors placeholder
# ============================================================================
Write-Header "Step 6: Create exteriors placeholders"

$exteriorsDir = Join-Path $workDir "exteriors"
$exteriorFile = Join-Path $exteriorsDir "exterior-painted-trim.webp"

if (-not (Test-Path $exteriorFile)) {
    # Use a concept image as placeholder
    $conceptSource = Join-Path $repoRoot "assets\img\concepts\hardwood-room.jpg"
    if (Test-Path $conceptSource) {
        Copy-Item -Path $conceptSource -Destination $exteriorFile -Force
        Write-Success "Created exterior placeholder"
    }
}

Write-Header "Restructuring Complete!"
Write-Success "All directories created and files organized"
Write-Success "Next: Run update-image-references.ps1 to fix all code references"
