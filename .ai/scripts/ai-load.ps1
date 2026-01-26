# /.ai/scripts/ai-load.ps1
# Loads governance files, builds an "AI Preamble", and provides wrappers for Copilot CLI usage.

Set-StrictMode -Version Latest

function Get-AiWorkspaceRoot {
  param([string]$Start = (Get-Location).Path)
  $dir = Resolve-Path $Start
  while ($dir -and -not (Test-Path (Join-Path $dir "AI_IMPORTANT.md"))) {
    $parent = Split-Path $dir -Parent
    if ($parent -eq $dir) { break }
    $dir = $parent
  }
  if (-not (Test-Path (Join-Path $dir "AI_IMPORTANT.md"))) {
    throw "AI_IMPORTANT.md not found. Run from within a governed workspace."
  }
  return $dir
}

function Get-AiPreamble {
  param(
    [string]$Root = (Get-AiWorkspaceRoot),
    [string[]]$Files = @(
      "AI_IMPORTANT.md",
      "codebooks/TYLER_VOICE_CODEBOOK.md",
      "reference/FAILURE_MODE_MAP.md"
    )
  )

  $chunks = foreach ($f in $Files) {
    $path = Join-Path $Root $f
    if (-not (Test-Path $path)) { throw "Missing required governance file: $f" }
    $content = Get-Content -Raw -Path $path
    "===== BEGIN $f =====`n$content`n===== END $f =====`n"
  }

  return ($chunks -join "`n")
}

function Set-AiClipboardPreamble {
  $root = Get-AiWorkspaceRoot
  $preamble = Get-AiPreamble -Root $root
  Set-Clipboard -Value $preamble
  Write-Host "AI governance preamble copied to clipboard."
}

function Invoke-GhCopilotWithGovernance {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory=$true)][ValidateSet("suggest","explain")][string]$Mode,
    [Parameter(Mandatory=$true)][string]$Prompt,
    [ValidateSet("shell","git","gh")][string]$Type = "shell"
  )

  $root = Get-AiWorkspaceRoot
  $preamble = Get-AiPreamble -Root $root

  # Prefix governance to reduce drift.
  $full = @"
$($preamble)

===== TASK =====
$Prompt
"@

  # Uses gh copilot extension commands (common and stable).
  # If your environment uses the new Copilot CLI directly, this still works with gh copilot suggest/explain.
  if ($Mode -eq "suggest") {
    gh copilot suggest $full -t $Type
  } else {
    gh copilot explain $full
  }
}

function Start-CopilotSession {
  # For interactive Copilot CLI sessions ("copilot" or "gh copilot"), clipboard preamble is the robust injection.
  Set-AiClipboardPreamble
  Write-Host "Start your Copilot session now, then paste clipboard contents as your first message."
  # Try to launch if installed; fall back gracefully.
  if (Get-Command copilot -ErrorAction SilentlyContinue) {
    copilot
    return
  }
  if (Get-Command gh -ErrorAction SilentlyContinue) {
    gh copilot
    return
  }
  throw "Neither 'copilot' nor 'gh' found in PATH."
}

Set-Alias ai-copilot Start-CopilotSession
Set-Alias ai-gcs { param($p) Invoke-GhCopilotWithGovernance -Mode suggest -Prompt $p -Type shell }
Set-Alias ai-gce { param($p) Invoke-GhCopilotWithGovernance -Mode explain -Prompt $p }
