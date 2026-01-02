# Ollama Qwen 2.5 Setup Script (Windows PowerShell)
# Sets up local LLM for Tillerstead development
# Usage: .\scripts\setup-ollama-qwen.ps1

param(
    [switch]$SkipPull = $false,
    [string]$Model = "qwen2.5:7b"
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗"
Write-Host "║           Ollama Qwen 2.5 Setup for Tillerstead               ║"
Write-Host "╚════════════════════════════════════════════════════════════════╝"
Write-Host ""

# Check if Ollama is installed
$ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue
if (-not $ollamaPath) {
    Write-Host "❌ Ollama is not installed or not in PATH."
    Write-Host ""
    Write-Host "Install Ollama from: https://ollama.ai"
    Write-Host ""
    Write-Host "Once installed, run this script again:"
    Write-Host "  .\scripts\setup-ollama-qwen.ps1"
    Write-Host ""
    exit 1
}

Write-Host "✅ Ollama found at: $($ollamaPath.Source)"
Write-Host ""

# Check if Ollama service is accessible
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method Get -ErrorAction SilentlyContinue
    Write-Host "✅ Ollama service is running (port 11434)"
} catch {
    Write-Host "⚠️  Ollama service is not responding."
    Write-Host ""
    Write-Host "Start Ollama with one of these options:"
    Write-Host "  1. Open Ollama from your Start Menu"
    Write-Host "  2. Run 'ollama serve' in PowerShell/Command Prompt"
    Write-Host ""
    Write-Host "Then run this script again:"
    Write-Host "  .\scripts\setup-ollama-qwen.ps1"
    Write-Host ""
    exit 1
}

Write-Host ""

# Pull models if not skipped
if (-not $SkipPull) {
    Write-Host "📥 Pulling Qwen 2.5 models..."
    Write-Host ""

    # Main model (7B for balanced performance)
    Write-Host "Downloading qwen2.5:7b (3.3GB)..."
    Write-Host "This may take 5-15 minutes depending on your connection..."
    Write-Host ""
    & ollama pull qwen2.5:7b
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to pull qwen2.5:7b"
        exit 1
    }

    Write-Host ""
    Write-Host "Downloading qwen2.5:3b (1.7GB) for faster responses..."
    Write-Host "This may take 3-10 minutes..."
    Write-Host ""
    & ollama pull qwen2.5:3b
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Failed to pull qwen2.5:3b (optional, continuing anyway)"
    }
}

# Test the installation
Write-Host ""
Write-Host "🧪 Testing Qwen 2.5 installation..."
Write-Host ""

try {
    $testOutput = & ollama run qwen2.5:7b "What is TCNA tile installation?" 2>&1
    Write-Host "✅ Model is working! Sample output:"
    Write-Host ""
    Write-Host $testOutput.Substring(0, [math]::Min(300, $testOutput.Length))
    if ($testOutput.Length -gt 300) { Write-Host "..." }
    Write-Host ""
} catch {
    Write-Host "⚠️  Could not test model (it may still be fine)"
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗"
Write-Host "║                    Setup Complete! ✅                         ║"
Write-Host "╚════════════════════════════════════════════════════════════════╝"
Write-Host ""
Write-Host "📌 QUICK START:"
Write-Host ""
Write-Host "  1. Make sure Ollama is running (check system tray)"
Write-Host ""
Write-Host "  2. Use Qwen in PowerShell:"
Write-Host "     ollama run qwen2.5:7b 'Your question here'"
Write-Host ""
Write-Host "  3. Or use the smaller/faster model:"
Write-Host "     ollama run qwen2.5:3b 'Your question here'"
Write-Host ""
Write-Host "  4. Start an interactive session:"
Write-Host "     ollama run qwen2.5:7b"
Write-Host ""
Write-Host "📚 Available Models:"
Write-Host "   - qwen2.5:7b   (recommended, balanced)"
Write-Host "   - qwen2.5:3b   (faster, lighter)"
Write-Host ""
Write-Host "Learn more: https://ollama.ai/library/qwen2.5"
Write-Host ""
