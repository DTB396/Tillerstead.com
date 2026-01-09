[CmdletBinding()]
param(
  [string]$LogPath = "$(Join-Path $PSScriptRoot "logs/backup.log")",
  [switch]$TestRun,
  [switch]$Incremental
)

$ErrorActionPreference = "Stop"

$logDir = Split-Path $LogPath -Parent
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$mode = if ($TestRun) { "TEST" } else { "RUN" }

Add-Content -Path $LogPath -Value "[$timestamp] [$mode] Daily backup starting."

$backupScript = Join-Path $PSScriptRoot "backup-repo.ps1"
if (-not (Test-Path $backupScript)) {
  throw "Backup script not found at $backupScript"
}

& $backupScript -All -LogPath $LogPath -Incremental:$Incremental -DryRun:$TestRun

Add-Content -Path $LogPath -Value "[$timestamp] [$mode] Daily backup completed."
