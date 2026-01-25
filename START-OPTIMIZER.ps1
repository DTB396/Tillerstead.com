#!/usr/bin/env pwsh
# QUICK RUNNER - Execute deep optimizer immediately
$ErrorActionPreference = "Continue"
Set-Location "C:\web-dev\github-repos\Tillerstead.com"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  🌙 ALL-NIGHT REPO OPTIMIZER - RUNNING NOW           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Execute the deep optimizer directly
& ".\scripts\deep-overnight.ps1" -MaxHours 8

Write-Host ""
Write-Host "✅ Optimization complete!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
