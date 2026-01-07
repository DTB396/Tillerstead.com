<#=====================================================================
  build-site.ps1
  ----------------------------------------------------
  Automates the full build pipeline for the Tillerstead
  contractor site (Jekyll + SCSS).
  
  What it does:
   1️⃣ Installs required npm / Ruby gems (once)
   2️⃣ Compiles SCSS → compressed CSS (with a hash for cache busting)
   3️⃣ Optimises images (WebP/AVIF + lossless PNG/JPEG)
   4️⃣ Builds the Jekyll site
   5️⃣ Runs a quick Lighthouse audit (optional)
   6️⃣ Copies the final `_site` folder to a configurable output dir
  
  Prerequisites (once):
   • Node.js (>= 14) + npm
   • Ruby + Bundler (`gem install bundler`)
   • Sass (Dart Sass) – installed via npm
   • ImageMagick (for AVIF/WebP conversion) OR `cwebp`/`avifenc`
   • Jekyll (`gem install jekyll`)

  Usage:
   .\build-site.ps1 [-Production] [-SkipAudit]

  Parameters:
   -Production   : Uses production‑only settings (no source‑maps, hashed CSS)
   -SkipAudit    : Skips the Lighthouse audit (faster local builds)

=====================================================================#>

[CmdletBinding()]
param (
    [switch]$Production,
    [switch]$SkipAudit
)

#-------------------------------------------------
# Helper function – write coloured status messages
function Write-Status {
    param(
        [string]$Message,
        [ConsoleColor]$Color = 'Cyan'
    )
    Write-Host "[+] $Message" -ForegroundColor $Color
}

#-------------------------------------------------
# 0️⃣  Verify we are in the project root (contains _config.yml)
$projectRoot = Get-Location
if (-not (Test-Path "$projectRoot\_config.yml")) {
    Write-Error "Could not find _config.yml – run this script from the repo root."
    exit 1
}

#-------------------------------------------------
# 1️⃣  Ensure npm packages are installed (only once)
Write-Status "Installing npm dependencies (if needed)…"
if (-not (Test-Path "$projectRoot\node_modules")) {
    npm ci   # reads package-lock.json, installs exact versions
    if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed."; exit 1 }
}
else {
    Write-Status "node_modules already present – skipping npm install." "Gray"
}

#-------------------------------------------------
# 2️⃣  Compile SCSS → CSS
#    Output: assets/css/style.<hash>.css  (production) or style.css (dev)
$scssEntry = "$projectRoot\assets\css\style.scss"
$cssOutDir = "$projectRoot\assets\css"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$hash = (Get-FileHash -Algorithm SHA256 -Path $scssEntry).Hash.Substring(0, 8)

if (-not (Test-Path $cssOutDir)) { New-Item -ItemType Directory -Path $cssOutDir | Out-Null }

if ($Production) {
    $cssFile = "style.$hash.css"
    $style = "compressed"
    $sourceMap = $false
}
else {
    $cssFile = "style.css"
    $style = "expanded"
    $sourceMap = $true
}
$cssFullPath = Join-Path $cssOutDir $cssFile

Write-Status "Compiling SCSS → $cssFile ($style)…"
$sassArgs = @(
    $scssEntry,
    $cssFullPath,
    "--style=$style"
)
if ($sourceMap) { $sassArgs += "--source-map" }

# Use Dart Sass installed via npm (node_modules/.bin/sass)
$nodeSass = Join-Path $projectRoot "node_modules\.bin\sass"
& $nodeSass @sassArgs
if ($LASTEXITCODE -ne 0) { Write-Error "Sass compilation failed."; exit 1 }

# Update the Jekyll include that references the stylesheet (if you have one)
$headInclude = "$projectRoot\_includes\head.html"
if (Test-Path $headInclude) {
    (Get-Content $headInclude) `
        -replace '<link rel="stylesheet".*?>',
    "<link rel=`"stylesheet`" href=`"/assets/css/$cssFile`">" |
    Set-Content $headInclude
    Write-Status "Updated stylesheet reference in _includes/head.html"
}

#-------------------------------------------------
# 3️⃣  Optimize images (WebP & AVIF)
#    This step is optional but dramatically improves LCP.
function Optimize-Images {
    param(
        [string]$SourceFolder,
        [string]$DestFolder
    )
    if (-not (Test-Path $DestFolder)) { New-Item -ItemType Directory -Path $DestFolder | Out-Null }

    $imageFiles = Get-ChildItem -Path $SourceFolder -Recurse -Include *.png, *.jpg, *.jpeg
    foreach ($img in $imageFiles) {
        $relPath = $img.FullName.Substring($SourceFolder.Length).TrimStart('\')
        $destPath = Join-Path $DestFolder $relPath
        $destDir = Split-Path $destPath -Parent
        if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }

        # Copy original (kept for fallback)
        Copy-Item $img.FullName $destPath -Force

        # ---------- WebP ----------
        $webpPath = [IO.Path]::ChangeExtension($destPath, ".webp")
        & cwebp -q 85 $img.FullName -o $webpPath | Out-Null

        # ---------- AVIF ----------
        $avifPath = [IO.Path]::ChangeExtension($destPath, ".avif")
        & avifenc -j all -a cq -c 30 $img.FullName $avifPath | Out-Null
    }
    Write-Status "Image optimisation complete (WebP & AVIF)."
}

Write-Status "Optimising images…" 
$imagesSrc = "$projectRoot\assets\img"
$imagesDst = "$projectRoot\assets\img-optimized"
Optimize-Images -SourceFolder $imagesSrc -DestFolder $imagesDst

# Update Jekyll config to point to the optimized folder (if you use it)
$configFile = "$projectRoot\_config.yml"
if (Test-Path $configFile) {
    (Get-Content $configFile) `
        -replace 'assets/img:', 'assets/img-optimized:' |
    Set-Content $configFile
    Write-Status "Adjusted image path in _config.yml"
}

#-------------------------------------------------
# 4️⃣  Build the Jekyll site
Write-Status "Running Jekyll build…"
# Use bundle if you have a Gemfile, otherwise fall back to jekyll command
if (Test-Path "$projectRoot\Gemfile") {
    bundle exec jekyll build
}
else {
    jekyll build
}
if ($LASTEXITCODE -ne 0) { Write-Error "Jekyll build failed."; exit 1 }

#-------------------------------------------------
# 5️⃣  Optional Lighthouse audit (local)
if (-not $SkipAudit) {
    Write-Status "Running a quick Lighthouse audit (desktop, no‑network throttling)…"
    # Requires Chrome/Chromium and the lighthouse npm package
    if (-not (Get-Command lighthouse -ErrorAction SilentlyContinue)) {
        Write-Status "Installing lighthouse globally…" "Yellow"
        npm install -g lighthouse
    }
    $siteUrl = "http://localhost:4000"
    # Start a temporary Jekyll server in the background
    $jekyllProc = Start-Process -FilePath "jekyll" -ArgumentList "serve", "--detach" -PassThru
    Start-Sleep -Seconds 5   # give it a moment to start
    lighthouse $siteUrl --quiet --output=json --output-path=./lighthouse-report.json
    Stop-Process -Id $jekyllProc.Id -Force
    Write-Status "Lighthouse report saved as lighthouse-report.json"
}
else {
    Write-Status "Skipping Lighthouse audit per user request." "Gray"
}

#-------------------------------------------------
# 6️⃣  Deploy / copy final output
$finalOut = "$projectRoot\dist"
if (Test-Path $finalOut) { Remove-Item -Recurse -Force $finalOut }
Copy-Item -Path "$projectRoot\_site\*" -Destination $finalOut -Recurse -Force
Write-Status "Site copied to $finalOut"

#-------------------------------------------------
# 7️⃣  Summary
Write-Host "`n=== Build Complete ===" -ForegroundColor Green
Write-Host " • CSS file   : $cssFile"
Write-Host " • Output dir : $finalOut"
Write-Host " • Production : $($Production.IsPresent)"
Write-Host " • Lighthouse : $(! $SkipAudit.IsPresent)"


<#=====================================================================
  End of script
=====================================================================#>
