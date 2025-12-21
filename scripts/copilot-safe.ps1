<#
copilot-safe.ps1
Launch GitHub Copilot CLI with a tight allowlist and hard denies.
Edit the allow/deny rules to match your repo’s AI instruction guide boundaries.

Usage:
  pwsh -File .\scripts\copilot-safe.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# --- Guardrails: only run from inside a trusted repo root ---
$repoRoot = (Resolve-Path ".").Path

function Assert-RequiredPath {
  param(
    [Parameter(Mandatory=$true)][string]$RepoRoot,
    [Parameter(Mandatory=$true)][string]$RelativePath,
    [ValidateSet("Any","File","Directory")][string]$Kind = "Any"
  )

  $full = Join-Path $RepoRoot $RelativePath
  if (!(Test-Path $full)) {
    throw "Missing required repo governance/instruction path: $RelativePath`nRefusing to start Copilot CLI."
  }

  if ($Kind -eq "File" -and !(Test-Path $full -PathType Leaf)) {
    throw "Required path is not a file: $RelativePath`nRefusing to start Copilot CLI."
  }
  if ($Kind -eq "Directory" -and !(Test-Path $full -PathType Container)) {
    throw "Required path is not a directory: $RelativePath`nRefusing to start Copilot CLI."
  }
}

# Require this to be a git repo root-ish (prevents running in random folders).
if (!(Test-Path (Join-Path $repoRoot ".git"))) {
  throw "Not a git repository (missing .git).`nRefusing to start Copilot CLI."
}

# Governance/instruction files (strict): adjust to match your repo.
# Tip: Keep these files small, explicit, and aligned to your SDLC.
$requiredGovernance = @(
  @{ Path = ".github\copilot-instructions.md"; Kind = "File" },
  @{ Path = "AI_PROJECT_INSTRUCTIONS.md"; Kind = "File" },

  # Common governance & contribution boundaries
  @{ Path = "README.md"; Kind = "File" },
  @{ Path = "LICENSE"; Kind = "File" },
  @{ Path = "SECURITY.md"; Kind = "File" },
  @{ Path = "CONTRIBUTING.md"; Kind = "File" },
  @{ Path = ".github\CODEOWNERS"; Kind = "File" },

  # Templates help keep changes intentional and reviewable
  @{ Path = ".github\pull_request_template.md"; Kind = "File" },
  @{ Path = ".github\ISSUE_TEMPLATE"; Kind = "Directory" },

  # Docs are part of repo governance for Copilot-driven overnight builds
  # Require the docs root plus the baseline (ground truth) docs set.
  @{ Path = "docs"; Kind = "Directory" },
  @{ Path = "docs\README.md"; Kind = "File" },
  @{ Path = "docs\baseline"; Kind = "Directory" },
  @{ Path = "docs\baseline\README.md"; Kind = "File" },

  # Script entrypoint folder exists
  @{ Path = "scripts"; Kind = "Directory" }
)

foreach ($item in $requiredGovernance) {
  Assert-RequiredPath -RepoRoot $repoRoot -RelativePath $item.Path -Kind $item.Kind
}

# --- Copilot CLI policy ---
# Prefer: allow specific tools/commands; deny the sharp knives.
# Notes:
# - GitHub docs show Copilot CLI supports allow/deny tool patterns and an allow-all-tools mode (don’t use allow-all-tools). :contentReference[oaicite:1]{index=1}
# - Example patterns shown publicly include allowing git:* but denying git push. :contentReference[oaicite:2]{index=2}

# Allowlist examples (tighten/expand as needed)
$allowTools = @(
  # File edits (if you want Copilot to write)
  "write",

  # Read-only ops are usually safest
  "read",

  # Shell: allow common dev tooling but keep it narrow.
  # These patterns are illustrative; adjust to your workflow.
  "shell(git status)",
  "shell(git diff*)",
  "shell(git log*)",
  "shell(git add*)",
  "shell(git commit*)",

  # Fast, narrow, intentional build/test commands (expand only as needed)
  "shell(npm run build*)",
  "shell(npm run test*)",
  "shell(npm run lint*)",
  "shell(npm ci)",
  "shell(npm install)",
  "shell(node -v)",
  "shell(npm -v)",

  # Docs/site build (overnight): keep the commands explicit and repeatable
  "shell(bundle exec jekyll build*)",
  "shell(jekyll build*)",

  "shell(npm*)",
  "shell(node*)",
  "shell(ruby*)",
  "shell(bundle*)",
  "shell(jekyll*)"
)

# Denylist examples (keep these blocked)
$denyTools = @(
  # Destructive file ops
  "shell(rm*)",
  "shell(rmdir*)",
  "shell(del*)",
  "shell(erase*)",
  "shell(Remove-Item*)",

  # Disk/partition/process tampering
  "shell(format*)",
  "shell(diskpart*)",
  "shell(taskkill*)",

  # Permission/system tampering
  "shell(chmod*)",
  "shell(chown*)",
  "shell(icacls*)",
  "shell(takeown*)",

  # Network fetch/execute patterns (tighten as you see fit)
  "shell(curl*)",
  "shell(wget*)",
  "shell(Invoke-WebRequest*)",
  "shell(Invoke-RestMethod*)",

  # Remote access / secrets exfil patterns
  "shell(ssh*)",
  "shell(scp*)",
  "shell(sftp*)",
  "shell(ftp*)",

  # Git operations that can publish/overwrite remotely
  "shell(git push*)",
  "shell(git fetch*)",
  "shell(git remote*)"
)

# Build args for the copilot CLI process
$copilotArgs = @()

foreach ($t in $allowTools) { $copilotArgs += @("--allow-tool", $t) }
foreach ($t in $denyTools)  { $copilotArgs += @("--deny-tool",  $t) }

# Start Copilot CLI in the current directory.
# The “trust this folder” prompt is a separate concept in Copilot CLI docs; you can choose “remember this folder” once to stop repeated trust prompts. :contentReference[oaicite:3]{index=3}
Write-Host "Starting Copilot CLI with allow/deny rules..." -ForegroundColor Green
& copilot @copilotArgs
