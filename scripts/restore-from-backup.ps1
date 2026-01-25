#!/usr/bin/env pwsh
# RESTORE FROM BACKUP
# Reverts to the state before deep optimization started

$repo = "C:\web-dev\github-repos\Tillerstead.com"
Set-Location $repo

Write-Host ""
Write-Host "⚠️  RESTORE FROM BACKUP" -ForegroundColor Yellow
Write-Host "This will UNDO ALL changes from deep optimization" -ForegroundColor Yellow
Write-Host ""

# Show what will be restored
Write-Host "Current commit: $(git rev-parse --short HEAD)" -ForegroundColor Gray
Write-Host "Backup commit: $(git rev-parse --short backup-before-deep-optimization)" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Type 'RESTORE' to confirm"

if ($confirm -eq 'RESTORE') {
    Write-Host ""
    Write-Host "🔄 Restoring to backup point..." -ForegroundColor Yellow
    
    # Reset to backup tag
    git reset --hard backup-before-deep-optimization
    
    # Clean any new files
    git clean -fd
    
    Write-Host ""
    Write-Host "✅ RESTORED TO BACKUP!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Current commit: $(git rev-parse --short HEAD)" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Restore cancelled" -ForegroundColor Red
    Write-Host ""
}
