[CmdletBinding()]
param(
  [string]$Version = "2.63.1",
  [switch]$Force
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  throw "winget is required to install GitHub CLI. Install winget and re-run this script."
}

$installedVersion = $null
if (Get-Command gh -ErrorAction SilentlyContinue) {
  $versionOutput = gh --version 2>$null
  if ($versionOutput) {
    $installedVersion = ($versionOutput | Select-String -Pattern "gh version (?<version>[0-9.]+)").Matches.Groups["version"].Value
  }
}

if ($installedVersion -and $installedVersion -eq $Version -and -not $Force) {
  Write-Host "GitHub CLI already installed at version $Version." -ForegroundColor Green
  return
}

$wingetList = winget list --id GitHub.cli --exact --source winget | Out-String
$wingetHasPackage = $wingetList -match "GitHub.cli"

if ($wingetHasPackage) {
  Write-Host "Upgrading GitHub CLI to version $Version..." -ForegroundColor Cyan
  winget upgrade --id GitHub.cli --exact --version $Version --accept-source-agreements --accept-package-agreements
} else {
  Write-Host "Installing GitHub CLI version $Version..." -ForegroundColor Cyan
  winget install --id GitHub.cli --exact --version $Version --accept-source-agreements --accept-package-agreements
}

Write-Host "GitHub CLI setup complete." -ForegroundColor Green
