# Link Health Check - Pre-Deployment Script
# Run this before every deployment to prevent 404s

Write-Host "`n🔍 Running Link Health Check..." -ForegroundColor Cyan

# Run link scanner
$scanResult = & "$PSScriptRoot\.mcp-agents\scripts\Scan-Links.ps1"
$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host "✅ All links healthy - ready to deploy!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ Broken links detected!" -ForegroundColor Red
    Write-Host "📝 Review the report and update _redirects file" -ForegroundColor Yellow
    Write-Host "📍 Report location: _reports\broken-links-*.json" -ForegroundColor Cyan
    
    # Show option to auto-fix
    Write-Host "`n💡 TIP: Common fixes are in _redirects - redeploy to apply" -ForegroundColor Magenta
    
    exit 1
}
