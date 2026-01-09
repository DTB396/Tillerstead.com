[CmdletBinding()]
param(
  [string]$Version = "18.6.0",
  [string]$ThemePath = "$(Join-Path $PSScriptRoot "posh/tillerstead.omp.json")",
  [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "Installing oh-my-posh $Version..." -ForegroundColor Cyan
Install-Module -Name oh-my-posh -RequiredVersion $Version -Scope CurrentUser -Force:$Force

$destinationDir = Join-Path $HOME ".config/oh-my-posh"
$destinationPath = Join-Path $destinationDir "tillerstead.omp.json"

if (-not (Test-Path $destinationDir)) {
  New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
}

if (-not (Test-Path $ThemePath)) {
  throw "Theme file not found at $ThemePath"
}

Copy-Item -Path $ThemePath -Destination $destinationPath -Force

Write-Host "Theme installed to $destinationPath" -ForegroundColor Green
Write-Host "Run tools/setup-pwsh-profile.ps1 to initialize the prompt." -ForegroundColor Yellow
