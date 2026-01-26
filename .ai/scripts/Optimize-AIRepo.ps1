<#
.SYNOPSIS
  Cleans and optimizes C:\web-dev\github-repos\Tillerstead.com\.ai by consolidating governance, adding precedence notes,
  archiving deprecated docs (without deleting), and generating a clear authority stack.

.DESCRIPTION
  - Creates/ensures canonical folders: codebooks/, reference/, scripts/, _archive/
  - Ensures AI_IMPORTANT.md exists (or creates a stub if missing)
  - Ensures TYLER_VOICE_CODEBOOK.md and FAILURE_MODE_MAP.md exist (or creates stubs if missing)
  - Adds a precedence note to: SYSTEM.md, STYLE.md, COPILOT.md, GPT.md, CODEX.md, DOMAIN.md, COMPLIANCE.md, OUTPUT_RULES.md
  - Deprecates STYLE.md (does NOT delete) and moves it to _archive once TYLER_VOICE_CODEBOOK.md exists
  - Moves legacy adapters (COPILOT.md, GPT.md) to _archive if you choose to rely on generated .github/copilot-instructions.md
  - Writes a summary report and a reversible manifest of changes

.SAFETY
  - Default mode is PREVIEW (no file writes). Use -Apply to make changes.
  - Uses backups and records changes in .ai\_archive\_manifests\

.USAGE
  Preview:
    .\Optimize-AIRepo.ps1

  Apply:
    .\Optimize-AIRepo.ps1 -Apply

  Apply + also archive COPILOT.md/GPT.md adapters:
    .\Optimize-AIRepo.ps1 -Apply -ArchiveLegacyAdapters

#>

[CmdletBinding()]
param(
  [string]$AiRoot = "C:\web-dev\github-repos\Tillerstead.com\.ai",
  [switch]$Apply,
  [switch]$ArchiveLegacyAdapters
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Section($t) {
  Write-Host ""
  Write-Host "==== $t ====" -ForegroundColor Cyan
}

function Ensure-Dir($Path) {
  if (-not (Test-Path $Path)) {
    if ($Apply) { New-Item -ItemType Directory -Path $Path | Out-Null }
    else { Write-Host "PREVIEW: would create directory $Path" -ForegroundColor Yellow }
  }
}

function Read-Text($Path) {
  if (-not (Test-Path $Path)) { return $null }
  return Get-Content -Raw -Path $Path
}

function Backup-File($Path, $BackupDir) {
  if (-not (Test-Path $Path)) { return $null }
  $name = Split-Path $Path -Leaf
  $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
  $dest = Join-Path $BackupDir "$name.$stamp.bak"
  if ($Apply) {
    Copy-Item -Path $Path -Destination $dest -Force
  } else {
    Write-Host "PREVIEW: would backup $Path -> $dest" -ForegroundColor Yellow
  }
  return $dest
}

function Write-Text($Path, $Content) {
  if ($Apply) {
    Set-Content -Path $Path -Value $Content -Encoding UTF8
  } else {
    Write-Host "PREVIEW: would write $Path" -ForegroundColor Yellow
  }
}

function Move-File($Src, $Dest) {
  if (-not (Test-Path $Src)) { return }
  if ($Apply) {
    if (-not (Test-Path (Split-Path $Dest -Parent))) { New-Item -ItemType Directory -Path (Split-Path $Dest -Parent) | Out-Null }
    Move-Item -Path $Src -Destination $Dest -Force
  } else {
    Write-Host "PREVIEW: would move $Src -> $Dest" -ForegroundColor Yellow
  }
}

function Add-PrecedenceNoteIfMissing($Path, $Note) {
  if (-not (Test-Path $Path)) { return @{ changed=$false; reason="missing" } }
  $txt = Read-Text $Path
  if ($txt -match [regex]::Escape($Note.Trim())) {
    return @{ changed=$false; reason="already_present" }
  }

  # Insert after first heading if present, else prepend.
  $updated = $null
  if ($txt -match "^\s*#\s+") {
    # Find end of first line
    $lines = $txt -split "`r?`n"
    $updated = @()
    $updated += $lines[0]
    $updated += ""
    $updated += $Note.TrimEnd()
    $updated += ""
    $updated += ($lines[1..($lines.Length-1)])
    $updated = ($updated -join "`n")
  } else {
    $updated = $Note.TrimEnd() + "`n`n" + $txt
  }

  Write-Text -Path $Path -Content $updated
  return @{ changed=$true; reason="inserted" }
}

function Ensure-Stub($Path, $Content) {
  if (Test-Path $Path) { return $false }
  Write-Text -Path $Path -Content $Content
  return $true
}

# --- Begin ---
Write-Section "Validate Paths"
if (-not (Test-Path $AiRoot)) {
  throw "AI root not found: $AiRoot"
}
Write-Host "AI root: $AiRoot"
Write-Host ("Mode: " + ($(if ($Apply) { "APPLY" } else { "PREVIEW" }))) -ForegroundColor Green

# Create archive + manifests folder
$archiveDir = Join-Path $AiRoot "_archive"
$manifestDir = Join-Path $archiveDir "_manifests"
Ensure-Dir $archiveDir
Ensure-Dir $manifestDir

# Canonical structure
Write-Section "Ensure Canonical Folder Structure"
$codebooksDir = Join-Path $AiRoot "codebooks"
$referenceDir = Join-Path $AiRoot "reference"
$scriptsDir   = Join-Path $AiRoot "scripts"
Ensure-Dir $codebooksDir
Ensure-Dir $referenceDir
Ensure-Dir $scriptsDir

# Canonical new files (expected)
$aiImportant     = Join-Path $AiRoot "AI_IMPORTANT.md"
$voiceCodebook   = Join-Path $codebooksDir "TYLER_VOICE_CODEBOOK.md"
$failureMap      = Join-Path $referenceDir "FAILURE_MODE_MAP.md"

Write-Section "Ensure Core Governance Files Exist (stubs if missing)"
$created = @()
if (Ensure-Stub $aiImportant @"
# AI_IMPORTANT.md
## Executive Governance Framework (Stub)

> This file is the supreme authority for AI behavior in this repository.
> If missing, replace this stub with the full governance framework.

**Version:** 0.0.0  
**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")

### PRIMARY EXECUTIVE DIRECTIVE (PED)
- [Define directive here]

### OPERATING MODE
- No roleplay; execute under constraints and review gates.

"@) { $created += "AI_IMPORTANT.md" }

if (Ensure-Stub $voiceCodebook @"
# TYLER_VOICE_CODEBOOK.md
## Voice & Authority Standards (Stub)

**Version:** 0.0.0  
**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")

### Voice rules
- Declarative, practical, contractor-to-client, no hype.

"@) { $created += "codebooks/TYLER_VOICE_CODEBOOK.md" }

if (Ensure-Stub $failureMap @"
# FAILURE_MODE_MAP.md
## Photographic Failure-Mode Reference Map (Stub)

**Version:** 0.0.0  
**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")

### Failure modes
- FM-01 Cracked grout
- FM-03 Tenting
- FM-05 Water intrusion

"@) { $created += "reference/FAILURE_MODE_MAP.md" }

if ($created.Count -gt 0) {
  Write-Host ("Created stubs: " + ($created -join ", ")) -ForegroundColor Yellow
}

# Precedence note to add
$precedenceNote = @"
> NOTE: This file is subordinate to `AI_IMPORTANT.md`.
> In case of conflict, `AI_IMPORTANT.md` governs.
"@

# Files to annotate
Write-Section "Add Precedence Notes (non-destructive)"
$targets = @(
  "SYSTEM.md",
  "STYLE.md",
  "DOMAIN.md",
  "COMPLIANCE.md",
  "OUTPUT_RULES.md",
  "COPILOT.md",
  "GPT.md",
  "CODEX.md",
  "README.md"
) | ForEach-Object { Join-Path $AiRoot $_ }

$manifest = [ordered]@{
  timestamp = (Get-Date).ToString("s")
  mode = ($(if ($Apply) { "apply" } else { "preview" }))
  aiRoot = $AiRoot
  changes = @()
  backups = @()
  archived = @()
  notes = @()
}

foreach ($p in $targets) {
  if (-not (Test-Path $p)) {
    $manifest.notes += "Skipped missing: $(Split-Path $p -Leaf)"
    continue
  }
  $backup = Backup-File -Path $p -BackupDir $manifestDir
  if ($backup) { $manifest.backups += $backup }

  $r = Add-PrecedenceNoteIfMissing -Path $p -Note $precedenceNote
  if ($r.changed) {
    $manifest.changes += "Added precedence note: $(Split-Path $p -Leaf)"
  }
}

# Deprecate/Archive STYLE.md after codebook exists
Write-Section "Consolidation / Deprecation Actions"
$stylePath = Join-Path $AiRoot "STYLE.md"
if (Test-Path $stylePath) {
  if (Test-Path $voiceCodebook) {
    # Mark STYLE.md deprecated and archive it (do not delete)
    $styleTxt = Read-Text $stylePath
    if ($styleTxt -notmatch "DEPRECATED") {
      $deprecatedBanner = @"
> DEPRECATED: This file is retained for audit/history.
> Canonical voice rules now live in `codebooks/TYLER_VOICE_CODEBOOK.md`.
> Do not edit this file unless explicitly restoring legacy behavior.

"@
      $backup = Backup-File -Path $stylePath -BackupDir $manifestDir
      if ($backup) { $manifest.backups += $backup }
      $newStyle = $deprecatedBanner + $styleTxt
      Write-Text -Path $stylePath -Content $newStyle
      $manifest.changes += "Marked STYLE.md as DEPRECATED"
    }

    $dest = Join-Path $archiveDir ("STYLE.md." + (Get-Date -Format "yyyyMMdd_HHmmss"))
    Move-File -Src $stylePath -Dest $dest
    $manifest.archived += "Archived STYLE.md -> $(Split-Path $dest -Leaf)"
  } else {
    $manifest.notes += "STYLE.md present but codebook missing; not archiving STYLE.md."
  }
}

# Optionally archive legacy adapters
if ($ArchiveLegacyAdapters) {
  Write-Section "Archive Legacy Adapters (optional)"
  foreach ($name in @("COPILOT.md","GPT.md")) {
    $src = Join-Path $AiRoot $name
    if (Test-Path $src) {
      $dest = Join-Path $archiveDir ("$name." + (Get-Date -Format "yyyyMMdd_HHmmss"))
      $backup = Backup-File -Path $src -BackupDir $manifestDir
      if ($backup) { $manifest.backups += $backup }
      Move-File -Src $src -Dest $dest
      $manifest.archived += "Archived $name -> $(Split-Path $dest -Leaf)"
    }
  }
} else {
  $manifest.notes += "Legacy adapters not archived (use -ArchiveLegacyAdapters to archive COPILOT.md/GPT.md)."
}

# Write authority stack report
Write-Section "Write Authority Stack Report"
$reportPath = Join-Path $AiRoot "AUTHORITY_STACK.md"
$report = @"
# AUTHORITY_STACK.md
**Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**AI Root:** $AiRoot

## TIER 0 (Supreme Authority)
- `AI_IMPORTANT.md`

## TIER 1 (Governance & Voice)
- `codebooks/TYLER_VOICE_CODEBOOK.md`
- `reference/FAILURE_MODE_MAP.md`

## TIER 2 (Execution References)
- `SYSTEM.md`
- `DOMAIN.md`
- `COMPLIANCE.md`
- `OUTPUT_RULES.md`

## TIER 3 (Tool Adapters)
- `COPILOT.md` (or generated `.github/copilot-instructions.md`)
- `GPT.md`
- `CODEX.md`

## Notes
- Files in `_archive/` are retained for audit/history and should not be edited.
"@
Write-Text -Path $reportPath -Content $report
$manifest.changes += "Wrote AUTHORITY_STACK.md"

# Save manifest
Write-Section "Write Manifest"
$manifestName = "manifest_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".json"
$manifestPath = Join-Path $manifestDir $manifestName
$manifestJson = ($manifest | ConvertTo-Json -Depth 6)
Write-Text -Path $manifestPath -Content $manifestJson

Write-Section "Done"
Write-Host "Manifest: $manifestPath"
Write-Host "Report:   $reportPath"
Write-Host ""
Write-Host "Next recommended steps:" -ForegroundColor Cyan
Write-Host "1) Ensure AI_IMPORTANT.md contains the full executive governance framework."
Write-Host "2) Ensure TYLER_VOICE_CODEBOOK.md and FAILURE_MODE_MAP.md are complete."
Write-Host "3) Generate .github/copilot-instructions.md (via your ai-sync.ps1 if present)."
Write-Host "4) Run your lint pre-flight checks (ai-lint.ps1) and commit."
