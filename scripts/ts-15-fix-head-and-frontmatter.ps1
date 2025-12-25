<#
ts-15-fix-head-and-frontmatter.ps1
Fix Jekyll head/front-matter issues with safe backups.
Supports built-in -WhatIf via SupportsShouldProcess (do NOT define your own -WhatIf).
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$RepoRoot = (Get-Location).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Section([string]$Title) {
    Write-Host ""
    Write-Host ("=== {0} ===" -f $Title) -ForegroundColor Cyan
}

function YesNo([bool]$Value) { if ($Value) { "YES" } else { "NO" } }

function New-BackupFolder([string]$root) {
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $b = Join-Path $root (".backups\ts-15-{0}" -f $stamp)
    if (-not $WhatIfPreference) {
        New-Item -ItemType Directory -Force -Path $b | Out-Null
    }
    return $b
}

function Get-RelativePathFromRoot([string]$Path, [string]$Root) {
    $rp = (Resolve-Path -LiteralPath $Path).Path
    $rootNorm = (Resolve-Path -LiteralPath $Root).Path
    if ($rp.StartsWith($rootNorm, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $rp.Substring($rootNorm.Length).TrimStart('\', '/')
    }
    return [IO.Path]::GetFileName($rp)
}

function Backup-File([string]$path, [string]$backupRoot, [string]$root) {
    if ($WhatIfPreference) { return }
    $rel = Get-RelativePathFromRoot -Path $path -Root $root
    $dest = Join-Path $backupRoot $rel
    $destDir = Split-Path $dest -Parent
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    Copy-Item -Force -LiteralPath $path -Destination $dest
}

function Read-Text([string]$path) {
    Get-Content -LiteralPath $path -Raw -Encoding UTF8
}

function Write-Text([string]$path, [string]$content) {
    if ($WhatIfPreference) { return }
    Set-Content -LiteralPath $path -Value $content -Encoding UTF8
}

function Title-Case-From-Slug([string]$slug) {
    if ([string]::IsNullOrWhiteSpace($slug)) { return $null }
    $s = $slug.Trim().Trim('/').Split('/')[0]
    if ([string]::IsNullOrWhiteSpace($s)) { return "Home" }
    $words = $s -split '[-_ ]+' | Where-Object { $_ -and $_.Trim() -ne "" }
    if (-not $words) { return $null }
    return ($words | ForEach-Object {
            $w = $_.Trim()
            if ($w.Length -le 1) { $w.ToUpper() } else { $w.Substring(0, 1).ToUpper() + $w.Substring(1) }
        }) -join " "
}

function Ensure-FrontMatter-Title {
    param(
        [string]$FilePath,
        [hashtable]$PermalinkTitleMap,
        [string]$BackupRoot,
        [string]$Root
    )

    $text = Read-Text $FilePath
    if ($text -notmatch '^\s*---\s*\r?\n') { return $false }

    $m = [regex]::Match($text, '^\s*---\s*\r?\n(?<fm>[\s\S]*?)\r?\n---\s*\r?\n', "Multiline")
    if (-not $m.Success) { return $false }

    $fm = $m.Groups["fm"].Value
    $rest = $text.Substring($m.Length)

    $permalink = $null
    $pm = [regex]::Match($fm, '^\s*permalink\s*:\s*(?<p>.+?)\s*$', "Multiline")
    if ($pm.Success) { $permalink = $pm.Groups["p"].Value.Trim().Trim('"').Trim("'") }

    $desiredTitle = $null
    if ($permalink -and $PermalinkTitleMap.ContainsKey($permalink)) {
        $desiredTitle = $PermalinkTitleMap[$permalink]
    }
    elseif ($permalink) {
        $desiredTitle = Title-Case-From-Slug $permalink
    }
    else {
        $nameGuess = [IO.Path]::GetFileNameWithoutExtension($FilePath)
        $desiredTitle = Title-Case-From-Slug $nameGuess
    }

    if ([string]::IsNullOrWhiteSpace($desiredTitle)) { return $false }

    $titleMatch = [regex]::Match($fm, '^\s*title\s*:\s*(?<t>.*)\s*$', "Multiline")
    $changed = $false

    if ($titleMatch.Success) {
        $existing = $titleMatch.Groups["t"].Value.Trim().Trim('"').Trim("'")
        if ([string]::IsNullOrWhiteSpace($existing) -or
            ($permalink -and $PermalinkTitleMap.ContainsKey($permalink) -and $existing -ne $desiredTitle)) {
            $fm = [regex]::Replace($fm, '^\s*title\s*:\s*.*\s*$', ("title: `"{0}`"" -f $desiredTitle), "Multiline")
            $changed = $true
        }
    }
    else {
        if ($fm -match '^\s*layout\s*:') {
            $fm = [regex]::Replace($fm, '(^\s*layout\s*:\s*.*\r?\n)', ('$1' + ("title: `"{0}`"" -f $desiredTitle) + "`r`n"), "Multiline")
        }
        else {
            $fm = ("title: `"{0}`"" -f $desiredTitle) + "`r`n" + $fm
        }
        $changed = $true
    }

    if (-not $changed) { return $false }

    $rebuilt = "---`r`n$fm`r`n---`r`n$rest"

    if ($PSCmdlet.ShouldProcess($FilePath, "Update front matter title")) {
        Backup-File $FilePath $BackupRoot $Root
        Write-Text $FilePath $rebuilt
    }
    return $true
}

function Fix-Head-Include {
    param(
        [string]$HeadPath,
        [string]$BackupRoot,
        [string]$Root
    )

    if (-not (Test-Path -LiteralPath $HeadPath)) { return $false }

    $text = Read-Text $HeadPath
    $orig = $text

    $text = [regex]::Replace($text, 'href="/assets/img/logo/\s*\r?\n\s*([^"]+)"', 'href="/assets/img/logo/$1"', "IgnoreCase")

    if ($text -match '<link\s+rel="canonical"\s+href="[^"]*"\s*>') {
        $canonicalReplacement = '<link rel="canonical" href="{% if site.url %}{{ site.url }}{{ page.url }}{% else %}{{ page.url }}{% endif %}">'
        $text = [regex]::Replace($text, '<link\s+rel="canonical"\s+href="[^"]*"\s*>', $canonicalReplacement, "IgnoreCase")
    }

    $text = [regex]::Replace($text, '(<link\s+rel="mask-icon"\s+href="[^"]*"\s+color="[^"]*)(\s*>)', '$1"$2', "IgnoreCase")

    if ($text -eq $orig) { return $false }

    if ($PSCmdlet.ShouldProcess($HeadPath, "Update head include")) {
        Backup-File $HeadPath $BackupRoot $Root
        Write-Text $HeadPath $text
    }
    return $true
}

# ------------------- main -------------------

Write-Section "Repo Root"
Write-Host $RepoRoot

$backupRoot = New-BackupFolder $RepoRoot
Write-Host ("Backup folder: {0}" -f $backupRoot) -ForegroundColor DarkGray
if ($WhatIfPreference) {
    Write-Host "WhatIf: ON (no writes, no backups created)" -ForegroundColor Yellow
}

$permalinkTitleMap = @{
    "/portfolio/"            = "Portfolio"
    "/reviews/"              = "Reviews & Client Testimonials"
    "/terms/"                = "Terms & Conditions"
    "/privacy/"              = "Privacy Policy"
    "/success/"              = "Thank You"
    "/process/"              = "Our Process"
    "/pricing/"              = "Tile Installation Pricing"
    "/plans/"                = "Property Maintenance Plans"
    "/recommended-products/" = "Recommended Products & Materials"
    "/services/"             = "Tile Installation & Waterproofing Services"
}

Write-Section "Fix _includes/head.html"
$headCandidates = @(
    (Join-Path $RepoRoot "_includes\head.html"),
    (Join-Path $RepoRoot "_includes\head\head.html")
) | Where-Object { Test-Path -LiteralPath $_ }

$headChanged = $false
if ($headCandidates.Count -eq 0) {
    Write-Host "WARN: No head include found at expected paths." -ForegroundColor Yellow
}
else {
    foreach ($hp in $headCandidates) {
        if (Fix-Head-Include -HeadPath $hp -BackupRoot $backupRoot -Root $RepoRoot) {
            Write-Host ("UPDATED: {0}" -f $hp) -ForegroundColor Green
            $headChanged = $true
        }
        else {
            Write-Host ("OK:      {0}" -f $hp) -ForegroundColor DarkGreen
        }
    }
}

Write-Section "Fix missing/blank titles in content files"
$roots = @(
    (Join-Path $RepoRoot "_pages"),
    (Join-Path $RepoRoot "_posts"),
    (Join-Path $RepoRoot "pages"),
    $RepoRoot
) | Select-Object -Unique

$contentFiles = @()
foreach ($r in $roots) {
    if (Test-Path -LiteralPath $r) {
        $contentFiles += Get-ChildItem -LiteralPath $r -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
            $_.Extension -in @(".md", ".markdown", ".html") -and
            $_.FullName -notmatch '\\_site\\' -and
            $_.FullName -notmatch '\\node_modules\\' -and
            $_.FullName -notmatch '\\\.backups\\'
        }
    }
}
$contentFiles = $contentFiles | Sort-Object FullName -Unique

[int]$touched = 0
foreach ($f in $contentFiles) {
    $path = $f.FullName
    $before = $null
    try { $before = Read-Text $path } catch { continue }
    if ($before -notmatch '^\s*---\s*\r?\n') { continue }

    try {
        if (Ensure-FrontMatter-Title -FilePath $path -PermalinkTitleMap $permalinkTitleMap -BackupRoot $backupRoot -Root $RepoRoot) {
            $touched++
            Write-Host ("FIXED title: {0}" -f $path) -ForegroundColor Green
        }
    }
    catch {
        Write-Host ("SKIP (error): {0} -> {1}" -f $path, $_.Exception.Message) -ForegroundColor Yellow
    }
}

Write-Section "Summary"
Write-Host ("Head changed: {0}" -f (YesNo $headChanged))
Write-Host ("Files updated with title fixes: {0}" -f $touched)
