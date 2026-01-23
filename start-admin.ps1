#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start Tillerstead Admin Panel

.DESCRIPTION
    Starts the admin backend server with optional configuration

.PARAMETER Port
    Port to run admin server on (default: 3001)

.PARAMETER Env
    Environment mode: development or production (default: development)

.EXAMPLE
    .\start-admin.ps1
    .\start-admin.ps1 -Port 8080
    .\start-admin.ps1 -Env production
#>

param(
    [int]$Port = 3001,
    [ValidateSet('development', 'production')]
    [string]$Env = 'development'
)

Write-Host ""
Write-Host "🔧 Starting Tillerstead Admin Panel..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check Node version
$nodeVersion = node --version
Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Dependency installation failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Set environment variables
$env:ADMIN_PORT = $Port
$env:NODE_ENV = $Env

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Port: $Port" -ForegroundColor White
Write-Host "  Environment: $Env" -ForegroundColor White
Write-Host ""
Write-Host "Starting server..." -ForegroundColor Yellow
Write-Host ""

# Start the server
if ($Env -eq 'development') {
    npm run admin:dev
} else {
    npm run admin
}
