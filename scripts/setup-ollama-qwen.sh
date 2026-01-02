#!/bin/bash
# Ollama Qwen 2.5 Setup Script
# Sets up local LLM for Tillerstead development
# Usage: bash scripts/setup-ollama-qwen.sh

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           Ollama Qwen 2.5 Setup for Tillerstead               ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo ""
    echo "❌ Ollama is not installed."
    echo ""
    echo "Install Ollama from: https://ollama.ai"
    echo ""
    echo "Once installed, run this script again:"
    echo "  bash scripts/setup-ollama-qwen.sh"
    exit 1
fi

echo ""
echo "✅ Ollama found at: $(command -v ollama)"
echo ""

# Check if Ollama service is running
if ! pgrep -x "ollama" > /dev/null; then
    echo "⚠️  Ollama service is not running."
    echo ""
    echo "Start Ollama with one of these options:"
    echo "  1. Run 'ollama serve' in a terminal"
    echo "  2. On macOS: Open the Ollama app"
    echo "  3. On Windows: Open Ollama from Start Menu"
    echo ""
    echo "Then run this script again:"
    echo "  bash scripts/setup-ollama-qwen.sh"
    exit 1
fi

echo "✅ Ollama service is running"
echo ""

# Pull Qwen 2.5 models
echo "📥 Pulling Qwen 2.5 models..."
echo ""

# Main model (7B for balanced performance)
echo "Downloading qwen2.5:7b (3.3GB)..."
ollama pull qwen2.5:7b

# Optional: smaller model for quick responses
echo ""
echo "Downloading qwen2.5:3b (1.7GB) for faster responses..."
ollama pull qwen2.5:3b

# Test the installation
echo ""
echo "🧪 Testing Qwen 2.5..."
echo ""
echo "Testing qwen2.5:7b..."
ollama run qwen2.5:7b "What is TCNA tile installation?" 2>&1 | head -5

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete! ✅                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📌 USAGE:"
echo ""
echo "  1. Start Ollama in a separate terminal:"
echo "     ollama serve"
echo ""
echo "  2. Use Qwen in your scripts or terminal:"
echo "     ollama run qwen2.5:7b 'Your question here'"
echo ""
echo "  3. Use the default model (7B):"
echo "     ollama run qwen2.5:7b"
echo ""
echo "  4. Use the faster model (3B):"
echo "     ollama run qwen2.5:3b"
echo ""
echo "📚 Learn more:"
echo "   https://ollama.ai/library/qwen2.5"
echo ""
echo "🔗 API Usage (for integrations):"
echo "   curl http://localhost:11434/api/generate -d '{
echo "     \"model\": \"qwen2.5:7b\",
echo "     \"prompt\": \"Your prompt here\",
echo "     \"stream\": false
echo "   }'"
echo ""
