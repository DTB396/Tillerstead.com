# Tillerstead Development Server - Persistent & Auto-Reload
# This stays running and auto-rebuilds on changes

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   TILLERSTEAD DEVELOPMENT SERVER - AUTO-RELOAD MODE    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$sandboxPath = "C:\Users\Devon Tyler\tillerstead-sandbox"
cd $sandboxPath

Write-Host "→ Initial build..." -ForegroundColor Yellow
npm run build:css
bundle exec jekyll build

Write-Host "`n→ Starting server at http://localhost:4000..." -ForegroundColor Cyan
Write-Host "→ Server will stay running (Ctrl+C to stop)" -ForegroundColor Gray
Write-Host "`n✅ Ready! Open http://localhost:4000/ in your browser" -ForegroundColor Green
Write-Host ""

# Start Python HTTP server in background
$serverJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\Devon Tyler\tillerstead-sandbox"
    python -m http.server 4000 --directory _site
}

Write-Host "Server PID: $($serverJob.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "To rebuild after changes:" -ForegroundColor Yellow
Write-Host "  1. Edit files" -ForegroundColor Gray
Write-Host "  2. Run: npm run build" -ForegroundColor Gray  
Write-Host "  3. Refresh browser (Ctrl+Shift+R)" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop server..." -ForegroundColor White

# Keep script alive and monitor
try {
    while ($true) {
        Start-Sleep -Seconds 5
        if ($serverJob.State -ne "Running") {
            Write-Host "`n❌ Server stopped unexpectedly!" -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host "`n→ Stopping server..." -ForegroundColor Yellow
    Stop-Job $serverJob
    Remove-Job $serverJob
    Write-Host "✅ Server stopped" -ForegroundColor Green
}
