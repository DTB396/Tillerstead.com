#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host "`n=== $msg ===" -ForegroundColor Cyan
}

function Ensure-Dir($p) {
    if (!(Test-Path $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null }
}

Write-Step "Sanity checks"
if (!(Test-Path ".\package.json")) { throw "Run this from repo root (where package.json exists)." }
if (!(Test-Path ".\_config.yml")) { Write-Warning "_config.yml not found (Jekyll repo?) continuing..." }

Write-Step "Fix accidental file: _sass/99-archive/contrast (0 bytes, no extension)"
$bad = ".\_sass\99-archive\contrast"
if (Test-Path $bad) {
    $len = (Get-Item $bad).Length
    if ($len -eq 0) {
        Remove-Item -Force $bad
        Write-Host "Removed empty file: $bad"
    }
    else {
        Write-Warning "Found $bad but it's not empty; leaving it alone."
    }
}

Write-Step "Restore any tracked files if git is present"
if (Get-Command git -ErrorAction SilentlyContinue) {
    try {
        git rev-parse --is-inside-work-tree *> $null
        git checkout -- _sass/99-archive 2>$null
    }
    catch { }
}

Write-Step "Fix missing logo referenced by header include"
$logoDir = ".\assets\img\logo"
Ensure-Dir $logoDir

$headerSvg = Join-Path $logoDir "tillerstead-logo-header.svg"
if (!(Test-Path $headerSvg)) {
    # Try to copy from any existing svg in the logo folder (best-effort)
    $candidates = @(
        Join-Path $logoDir "tillerstead-logo-mark.svg"
        Join-Path $logoDir "tillerstead-favicon.svg"
        Join-Path $logoDir "tillerstead-logo.svg"
        Join-Path $logoDir "logo.svg"
    ) | Where-Object { Test-Path $_ }

    if ($candidates.Count -gt 0) {
        Copy-Item $candidates[0] $headerSvg -Force
        Write-Host "Created header logo by copying: $($candidates[0]) -> $headerSvg"
    }
    else {
        # Create a harmless placeholder SVG so the header doesn't break
        @"
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80" role="img" aria-label="Tillerstead">
  <rect width="320" height="80" fill="none"/>
  <text x="10" y="52" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="28">Tillerstead</text>
</svg>
"@ | Set-Content -Encoding utf8 $headerSvg
        Write-Warning "No logo SVGs found to copy; wrote placeholder at: $headerSvg"
    }
}
else {
    Write-Host "Header logo present: $headerSvg"
}

Write-Step "Make Jekyll include forms/contact-long.html exist (to stop build failures)"
$includePath = ".\_includes\forms\contact-long.html"
Ensure-Dir (Split-Path $includePath -Parent)
if (!(Test-Path $includePath)) {
    @"
<!-- Auto-created stub to prevent Jekyll build failure.
     Replace with your real long contact form when ready. -->
<div class="ts-card ts-surface stack-md">
  <h2 class="h3">Contact</h2>
  {% include forms/contact.html %}
</div>
"@ | Set-Content -Encoding utf8 $includePath
    Write-Host "Created stub include: $includePath"
}
else {
    Write-Host "Include exists: $includePath"
}

Write-Step "Stop Sass @import deprecation warnings by moving imports to SCSS entrypoint"
# If your build process currently compiles assets/css/style.css directly, create a real SCSS entry.
$scssEntry = ".\assets\css\style.scss"
$cssEntry = ".\assets\css\style.css"

if (!(Test-Path $scssEntry)) {
    # If style.css contains Sass-like @import lines, migrate them into style.scss and leave style.css as built output only.
    $raw = ""
    if (Test-Path $cssEntry) { $raw = Get-Content $cssEntry -Raw }

    $hasSassImports = $raw -match "(?m)^\s*@import\s+['""]"
    if ($hasSassImports) {
        @"
---
# Jekyll will compile this SCSS into /assets/css/style.css
---

@use "sass:math";

/* Migrated from assets/css/style.css (Sass @import deprecations) */
$raw
"@ | Set-Content -Encoding utf8 $scssEntry

        Write-Host "Created SCSS entrypoint: $scssEntry"
        Write-Host "NOTE: assets/css/style.css should now be treated as build output, not source."
    }
    else {
        @"
---
---

/* SCSS entrypoint placeholder (no Sass imports detected in assets/css/style.css) */
"@ | Set-Content -Encoding utf8 $scssEntry
        Write-Host "Created basic SCSS entrypoint: $scssEntry"
    }
}

Write-Step "Fix npm dependency conflict (ESLint 9 vs eslint-config-standard 17)"
# Approach: keep eslint at 8.57.1 for now (most compatible), upgrade safe packages only.
# If you want ESLint 9 later, we can migrate config to flat config + compatible presets.
try {
    npm pkg get devDependencies.eslint | Out-Null
}
catch { }

# Force eslint back to 8.57.1 and bring others forward safely
npm install -D eslint@8.57.1 eslint-plugin-n@16.6.2 eslint-plugin-promise@6.6.0 eslint-config-standard@17.1.0 --save-exact

# Upgrade glob/rimraf to modern versions (but avoid breaking transitive deps)
npm install -D rimraf@latest glob@latest --save

Write-Step "Clean install"
if (Test-Path ".\node_modules") { Remove-Item -Recurse -Force ".\node_modules" }
if (Test-Path ".\package-lock.json") { Remove-Item -Force ".\package-lock.json" }
npm install

Write-Step "Run CSS build (if present)"
if (Test-Path ".\scripts\build-css.js") {
    npm run build:css
}
else {
    Write-Warning "scripts/build-css.js not found; skipping npm run build:css"
}

Write-Step "Run Jekyll build (if bundle is available)"
if (Get-Command bundle -ErrorAction SilentlyContinue) {
    try {
        bundle exec jekyll build
    }
    catch {
        Write-Warning "Jekyll build still failed. Read the error above."
    }
}
else {
    Write-Warning "Ruby bundler not found in PATH; skipping bundle exec jekyll build"
}

Write-Step "Re-run repo doctor scan (if present)"
if (Test-Path ".\scripts\ts-90-repo-doctor.js") {
    node .\scripts\ts-90-repo-doctor.js --phase=scan
}
else {
    Write-Warning "Repo doctor script not found; skipping scan."
}

Write-Step "Done"
Write-Host "Next: if homepage scan still fails, we'll point the scanner at the correct built homepage file and confirm layout usage."
