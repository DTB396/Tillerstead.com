# Tillerstead.com Development Helper
param(
    [Parameter(Position=0)]
    [ValidateSet("serve", "build", "deploy", "clean", "test")]
    [string]$Command = "serve"
)

switch ($Command) {
    "serve" {
        Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
        bundle exec jekyll serve --livereload
    }
    "build" {
        Write-Host "🔨 Building site..." -ForegroundColor Cyan
        bundle exec jekyll build
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build successful!" -ForegroundColor Green
        }
    }
    "deploy" {
        Write-Host "🚀 Deploying to GitHub..." -ForegroundColor Cyan
        bundle exec jekyll build
        if ($LASTEXITCODE -eq 0) {
            git add .
            $msg = Read-Host "Commit message"
            git commit -m "$msg"
            git push origin main
            Write-Host "✅ Deployed!" -ForegroundColor Green
        }
    }
    "clean" {
        Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Cyan
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue _site, .jekyll-cache
        Write-Host "✅ Clean complete!" -ForegroundColor Green
    }
    "test" {
        Write-Host "🧪 Running tests..." -ForegroundColor Cyan
        bundle exec jekyll build
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Site builds successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Build failed!" -ForegroundColor Red
        }
    }
}
