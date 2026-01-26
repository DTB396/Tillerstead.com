# /.ai/scripts/ai-lint.ps1
Set-StrictMode -Version Latest

function Get-Root {
  $dir = (Get-Location).Path
  while ($dir -and -not (Test-Path (Join-Path $dir "AI_IMPORTANT.md"))) {
    $parent = Split-Path $dir -Parent
    if ($parent -eq $dir) { break }
    $dir = $parent
  }
  if (-not (Test-Path (Join-Path $dir "AI_IMPORTANT.md"))) { throw "AI_IMPORTANT.md not found." }
  return $dir
}

$root = Get-Root
$files = @(
  "AI_IMPORTANT.md",
  "codebooks/TYLER_VOICE_CODEBOOK.md",
  "reference/FAILURE_MODE_MAP.md",
  ".github/copilot-instructions.md"
) | ForEach-Object { Join-Path $root $_ } | Where-Object { Test-Path $_ }

if ($files.Count -eq 0) { throw "No files found to lint." }

$prohibitedPhrases = @(
  "game-changing",
  "revolutionary",
  "must-have",
  "best on the market",
  "guarantee",
  "act as"
)

$requiredHeadings = @(
  "PRIMARY EXECUTIVE DIRECTIVE",
  "OPERATING MODE",
  "EXECUTIVE"
)

$errors = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

foreach ($path in $files) {
  $content = Get-Content -Raw $path

  foreach ($p in $prohibitedPhrases) {
    if ($content -match [regex]::Escape($p)) {
      $warnings.Add("WARN: '$p' found in $([IO.Path]::GetFileName($path))")
    }
  }

  if ($path.EndsWith("AI_IMPORTANT.md")) {
    foreach ($h in $requiredHeadings) {
      if ($content -notmatch $h) {
        $errors.Add("ERROR: Missing heading '$h' in AI_IMPORTANT.md")
      }
    }
  }

  # Ensure Failure Mode IDs exist
  if ($path.EndsWith("FAILURE_MODE_MAP.md")) {
    if ($content -notmatch "FM-01" -or $content -notmatch "FM-03" -or $content -notmatch "FM-05") {
      $errors.Add("ERROR: FAILURE_MODE_MAP.md missing required FM entries (expected at least FM-01, FM-03, FM-05).")
    }
  }
}

if ($errors.Count -gt 0) {
  $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
  exit 1
}
$warnings | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }

Write-Host "Lint OK." -ForegroundColor Green
exit 0
