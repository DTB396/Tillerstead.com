[CmdletBinding()]
param(
  [string]$TaskName = "DailyBackup",
  [string]$BackupScriptPath = "$(Join-Path $PSScriptRoot "backup-repo.ps1")",
  [string]$ScheduleAt = "2:00AM",
  [string]$LogPath = "$(Join-Path $PSScriptRoot "logs/backup.log")",
  [switch]$TestRun
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupScriptPath)) {
  throw "Backup script not found at $BackupScriptPath"
}

$logDir = Split-Path $LogPath -Parent
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$actionArguments = "-NoProfile -ExecutionPolicy Bypass -File `"$BackupScriptPath`" -All -Incremental -LogPath `"$LogPath`""
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $actionArguments
$trigger = New-ScheduledTaskTrigger -Daily -At $ScheduleAt

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Description "Daily backup task" -Force

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content -Path $LogPath -Value "[$timestamp] [REGISTER] Task '$TaskName' registered for $ScheduleAt."

if ($TestRun) {
  Add-Content -Path $LogPath -Value "[$timestamp] [TEST] Running backup script for validation."
  & $BackupScriptPath -All -Incremental -LogPath $LogPath -DryRun
  Add-Content -Path $LogPath -Value "[$timestamp] [TEST] Validation run completed."
}

Write-Host "Scheduled task '$TaskName' registered." -ForegroundColor Green
