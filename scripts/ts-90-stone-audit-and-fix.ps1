# scripts/ts-90-stone-audit-and-fix.ps1
# Tillerstead STONE: Audit + Fix Pack (SANDBOX sync optional)
# Usage: pwsh .\scripts\ts-90-stone-audit-and-fix.ps1 -SandboxPath "..\tillerstead-sandbox"

[CmdletBinding()]
param(
    [string]$SandboxPath = "..\tillerstead-sandbox",
    [switch]$FixHeaderPremium = $true,
    [switch]$SyncWorkflows = $true,
    [switch]$RestoreMissingFromGit = $true,
    [switch]$CopyMissingFromSandbox = $true,
    [switch]$RunBuild = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Section($t) { Write-Host "`n=== $t ===" -ForegroundColor Cyan }
function Ensure-Dir($p) { if (!(Test-Path $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null } }
function RelPath([string]$p) {
    $root = (Resolve-Path ".").Path
    $rp = (Resolve-Path $p).Path
    return $rp.Replace($root, "").TrimStart("\", "/")
}
function File-HashShort($p) {
    if (Test-Path $p) {
        return (Get-FileHash $p -Algorithm SHA256).Hash.Substring(0, 12)
    }
    return $null
}

$Root = (Resolve-Path ".").Path
$ReportDir = Join-Path $Root "reports"
Ensure-Dir $ReportDir
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$ReportMd = Join-Path $ReportDir "STONE_AUDIT_$Stamp.md"
$ReportJson = Join-Path $ReportDir "STONE_AUDIT_$Stamp.json"
$MissingCsv = Join-Path $ReportDir "STONE_MISSING_ASSETS_$Stamp.csv"

$findings = [System.Collections.Generic.List[object]]::new()
$missing = [System.Collections.Generic.List[object]]::new()

Write-Section "Environment"
$gitOk = $false
try { git rev-parse --is-inside-work-tree | Out-Null; $gitOk = $true } catch {}
if (-not $gitOk) { throw "Not in a git repo. Run from STONE repo root." }

$branch = (git branch --show-current).Trim()
Write-Host "Branch: $branch"
$head = (git rev-parse --short HEAD).Trim()
Write-Host "HEAD: $head"

$SandboxAbs = $null
if (Test-Path $SandboxPath) {
    $SandboxAbs = (Resolve-Path $SandboxPath).Path
    Write-Host "SANDBOX detected at: $SandboxAbs" -ForegroundColor Green
}
else {
    Write-Host "SANDBOX not found at: $SandboxPath (sync steps will be skipped)" -ForegroundColor Yellow
}

Write-Section "Quick sanity checks"
# Check required key files
$mustHave = @(
    "_includes\header.html",
    "assets\css\style.scss",
    "assets\js\nav.js",
    "_data\navigation.yml"
)
foreach ($f in $mustHave) {
    if (!(Test-Path $f)) {
        $findings.Add([pscustomobject]@{type = "missing_core"; path = $f; note = "Required file missing" })
    }
}

# Detect desktop nav missing regression (older bug)
# We expect both site-nav--left and site-nav--right to exist in header.html for premium desktop nav.
if (Test-Path "_includes\header.html") {
    $hdr = Get-Content "_includes\header.html" -Raw
    $hasLeft = $hdr -match "site-nav--left"
    $hasRight = $hdr -match "site-nav--right"
    $hasBranding = $hdr -match "site-branding"
    $hasMobileNav = $hdr -match "id\s*=\s*`"mobile-nav`""
    if (-not $hasLeft -or -not $hasRight) {
        $findings.Add([pscustomobject]@{
                type = "header_nav"; severity = "high";
                note = "Desktop nav containers missing (site-nav--left/right not found). Premium header likely broken.";
                path = "_includes/header.html"
            })
    }
    if (-not $hasBranding) {
        $findings.Add([pscustomobject]@{
                type = "header_branding"; severity = "high";
                note = "Logo wrapper missing 'site-branding' class (centering styles won't apply).";
                path = "_includes/header.html"
            })
    }
    if (-not $hasMobileNav) {
        $findings.Add([pscustomobject]@{
                type = "mobile_nav"; severity = "high";
                note = "Mobile nav id='mobile-nav' not found; JS expects it.";
                path = "_includes/header.html"
            })
    }
}

Write-Section "Scan for asset references that are missing"
# Patterns: /assets/... or assets/... or url('...') or src="..."
$scanExt = @("*.html", "*.md", "*.scss", "*.css", "*.js", "*.yml", "*.yaml")
$scanFiles = Get-ChildItem -Recurse -File -Include $scanExt -ErrorAction SilentlyContinue |
Where-Object { $_.FullName -notmatch "\\_site\\|\\node_modules\\|\\vendor\\|\\\.git\\" }

$assetRegexes = @(
    '(?i)src\s*=\s*"(\/?assets\/[^"]+)"',
    "(?i)href\s*=\s*`"(\/?assets\/[^`"]+)`"",
    "(?i)url\(\s*['`"]?(\/?assets\/[^'`")]+)['`"]?\s*\)"
)

foreach ($file in $scanFiles) {
    $raw = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (!$raw) { continue }
    foreach ($rx in $assetRegexes) {
        $m = [regex]::Matches($raw, $rx)
        foreach ($hit in $m) {
            $path = $hit.Groups[1].Value
            if ([string]::IsNullOrWhiteSpace($path)) { continue }

            # ignore external urls
            if ($path -match "^(https?:|data:)") { continue }

            # normalize
            $norm = $path.TrimStart("/")
            $local = Join-Path $Root $norm
            if (!(Test-Path $local)) {
                $missing.Add([pscustomobject]@{
                        file       = RelPath $file.FullName
                        referenced = $path
                        expected   = $norm
                        exists     = $false
                    })
            }
        }
    }
}

# de-dupe missing list by expected file
$missingUnique = $missing | Sort-Object expected -Unique

$missingUnique | Export-Csv -NoTypeInformation -Path $MissingCsv

if ($missingUnique.Count -gt 0) {
    $findings.Add([pscustomobject]@{
            type = "missing_assets"; severity = "high"; count = $missingUnique.Count;
            note = "Broken asset references found. See CSV report."
        })
    Write-Host "Missing assets found: $($missingUnique.Count). Report: $MissingCsv" -ForegroundColor Yellow
}
else {
    Write-Host "No missing asset references detected." -ForegroundColor Green
}

Write-Section "Attempt restore missing assets from git history (if enabled)"
if ($RestoreMissingFromGit -and $missingUnique.Count -gt 0) {
    foreach ($row in $missingUnique) {
        $p = $row.expected
        if (Test-Path $p) { continue }

        # Check if file ever existed in git
        $existsInGit = $false
        try {
            $log = git log --oneline -- $p 2>$null
            if ($log) { $existsInGit = $true }
        }
        catch {}

        if ($existsInGit) {
            try {
                # restore from last commit where present
                git checkout HEAD -- $p 2>$null
            }
            catch {}
            if (Test-Path $p) {
                $findings.Add([pscustomobject]@{
                        type = "restored_from_git"; path = $p; severity = "info";
                        note = "Restored missing file from current HEAD checkout attempt (if it existed in index)."
                    })
            }
        }
    }
}

Write-Section "Copy missing assets from SANDBOX (if enabled and SANDBOX exists)"
if ($CopyMissingFromSandbox -and $SandboxAbs -and $missingUnique.Count -gt 0) {
    foreach ($row in $missingUnique) {
        $p = $row.expected
        if (Test-Path $p) { continue }

        $src = Join-Path $SandboxAbs $p
        if (Test-Path $src) {
            Ensure-Dir (Split-Path $p -Parent)
            Copy-Item -Force $src $p
            $findings.Add([pscustomobject]@{
                    type = "copied_from_sandbox"; path = $p; severity = "info";
                    note = "Copied missing file from SANDBOX."
                })
        }
    }
}

Write-Section "Patch: Ensure Premium header in STONE matches SANDBOX (if enabled)"
if ($FixHeaderPremium -and $SandboxAbs -and (Test-Path "_includes\header.html")) {
    $sandboxHeader = Join-Path $SandboxAbs "_includes\header.html"
    if (Test-Path $sandboxHeader) {
        $stoneHdrHash = File-HashShort "_includes\header.html"
        $sandHdrHash = File-HashShort $sandboxHeader

        if ($stoneHdrHash -ne $sandHdrHash) {
            Copy-Item -Force $sandboxHeader "_includes\header.html"
            $findings.Add([pscustomobject]@{
                    type = "header_synced"; severity = "high";
                    note = "Replaced STONE _includes/header.html with SANDBOX version (Premium header).";
                    from = "SANDBOX"; to = "STONE"
                })
            Write-Host "Header synced from SANDBOX." -ForegroundColor Green
        }
        else {
            Write-Host "Header already matches SANDBOX (hash same)." -ForegroundColor Green
        }
    }
    else {
        Write-Host "SANDBOX header not found; skipping header sync." -ForegroundColor Yellow
    }
}

Write-Section "Patch: Sync premium header SCSS/JS if present in SANDBOX"
if ($SandboxAbs) {
    $syncPairs = @(
        @{src = "_sass\30-components\_header-premium.scss"; dst = "_sass\30-components\_header-premium.scss" },
        @{src = "assets\js\header-premium.js"; dst = "assets\js\header-premium.js" },
        @{src = "assets\js\nav.js"; dst = "assets\js\nav.js" }
    )
    foreach ($pair in $syncPairs) {
        $src = Join-Path $SandboxAbs $pair.src
        $dst = $pair.dst
        if (Test-Path $src) {
            Ensure-Dir (Split-Path $dst -Parent)
            $dstHash = File-HashShort $dst
            $srcHash = File-HashShort $src
            if ($dstHash -ne $srcHash) {
                Copy-Item -Force $src $dst
                $findings.Add([pscustomobject]@{
                        type = "synced_file"; path = $dst; from = $pair.src; severity = "info";
                        note = "Synced from SANDBOX due to mismatch."
                    })
            }
        }
    }
}

Write-Section "Patch: Sync workflows (optional)"
if ($SyncWorkflows -and $SandboxAbs) {
    $sandboxWF = Join-Path $SandboxAbs ".github\workflows"
    if (Test-Path $sandboxWF) {
        Ensure-Dir ".github\workflows"
        Get-ChildItem $sandboxWF -File -Filter "*.yml" -ErrorAction SilentlyContinue | ForEach-Object {
            $dst = Join-Path $Root ".github\workflows\$($_.Name)"
            $dstHash = File-HashShort $dst
            $srcHash = File-HashShort $_.FullName
            if ($dstHash -ne $srcHash) {
                Copy-Item -Force $_.FullName $dst
                $findings.Add([pscustomobject]@{
                        type = "workflow_synced"; path = ".github/workflows/$($_.Name)"; severity = "info";
                        note = "Workflow synced from SANDBOX."
                    })
            }
        }
    }
    else {
        Write-Host "SANDBOX workflows directory not found; skipping." -ForegroundColor Yellow
    }
}

Write-Section "Build validation (optional)"
if ($RunBuild) {
    # Try npm build if package.json exists
    if (Test-Path "package.json") {
        try {
            Write-Host "Running: npm ci" -ForegroundColor DarkGray
            npm ci | Out-Host
            Write-Host "Running: npm run build" -ForegroundColor DarkGray
            npm run build | Out-Host
            $findings.Add([pscustomobject]@{type = "build"; tool = "npm"; status = "success"; note = "npm build succeeded" })
        }
        catch {
            $findings.Add([pscustomobject]@{type = "build"; tool = "npm"; status = "fail"; note = $_.Exception.Message })
            Write-Host "npm build failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    # Try Jekyll build if Gemfile exists
    if (Test-Path "Gemfile") {
        try {
            Write-Host "Running: bundle install" -ForegroundColor DarkGray
            bundle install | Out-Host
            Write-Host "Running: bundle exec jekyll build" -ForegroundColor DarkGray
            bundle exec jekyll build | Out-Host
            $findings.Add([pscustomobject]@{type = "build"; tool = "jekyll"; status = "success"; note = "jekyll build succeeded" })
        }
        catch {
            $findings.Add([pscustomobject]@{type = "build"; tool = "jekyll"; status = "fail"; note = $_.Exception.Message })
            Write-Host "jekyll build failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Section "Write reports"
# Markdown
$md = @()
$md += "# STONE Audit & Fix Report ($Stamp)"
$md += ""
$md += "- Repo: $Root"
$md += "- Branch: $branch"
$md += "- HEAD: $head"
$md += "- SANDBOX: " + ($(if ($SandboxAbs) { $SandboxAbs }else { "(not found)" }))
$md += ""
$md += "## Findings"
if ($findings.Count -eq 0) {
    $md += "_No findings recorded._"
}
else {
    foreach ($f in $findings) {
        $md += "- **$($f.type)** [$($f.severity)] $($f.note) " + ($(if ($f.path) { "(path: $($f.path))" }else { "" }))
    }
}
$md += ""
$md += "## Missing assets (unique)"
$md += "CSV: `$(Split-Path $MissingCsv -Leaf)`"
$md += ""
$md += "## Next steps"
$md += "1) Review the CSV missing-assets list and confirm any copied/restored files are correct."
$md += "2) Commit changes, push to main, and watch GitHub Actions run."
$md += "3) Hard refresh browser and verify: Desktop nav visible + mobile drawer works + icons render."
Set-Content -Path $ReportMd -Value ($md -join "`n") -Encoding UTF8

# JSON
$payload = [pscustomobject]@{
    stamp = $Stamp; root = $Root; branch = $branch; head = $head;
    sandbox = $SandboxAbs;
    findings = $findings;
    missing_assets = $missingUnique
}
$payload | ConvertTo-Json -Depth 6 | Set-Content -Path $ReportJson -Encoding UTF8

Write-Host "Report: $ReportMd" -ForegroundColor Green
Write-Host "JSON:   $ReportJson" -ForegroundColor Green
Write-Host "CSV:    $MissingCsv" -ForegroundColor Green

Write-Section "Done"
Write-Host "Review git status, then commit/push." -ForegroundColor Cyan
