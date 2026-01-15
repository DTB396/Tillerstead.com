# Ollama Qwen 2.5 Local LLM Setup

This guide explains how to set up and use **Ollama with Qwen 2.5** for local AI-powered development on the Tillerstead project.

## What is Ollama?

**Ollama** is a tool that lets you run large language models (LLMs) locally on your machine without cloud services. **Qwen 2.5** is Alibaba's high-performance open-source language model.

**Benefits:**

- 🔒 Privacy: Your data stays on your machine
- ⚡ Speed: No network latency
- 💰 Free: No API costs
- 🔧 Offline: Works without internet
- 🎯 Optimized: Models run efficiently even on consumer hardware

## Installation

### 1. Download & Install Ollama

**macOS/Linux/Windows:**

- Visit https://ollama.ai
- Download the installer for your OS
- Follow the installation wizard

**Verify installation:**

```bash
ollama --version
```

### 2. Start Ollama Service

**macOS:**

```bash
# Ollama runs as a background service
# Check System Preferences > General > Login Items to verify it's set to start on boot
```

**Linux:**

```bash
# Start the service
systemctl start ollama

# Enable auto-start
systemctl enable ollama
```

**Windows:**

- Open Ollama from your Start Menu
- It runs in the system tray
- Check that it shows a green dot (running)

### 3. Pull Qwen Models

```bash
# Main model (recommended for most tasks)
ollama pull qwen2.5:7b

# Faster model (for quick responses)
ollama pull qwen2.5:3b

# Largest model (for complex reasoning)
ollama pull qwen2.5:14b
```

**Download Sizes:**

- `qwen2.5:3b` = 1.7 GB (fast, basic tasks)
- `qwen2.5:7b` = 3.3 GB (recommended, balanced)
- `qwen2.5:14b` = 8.4 GB (best quality, slower)

## Quick Start

### Basic Usage

```bash
# Run a model (returns result and exits)
ollama run qwen2.5:7b "What is TCNA tile installation?"

# Interactive mode (keeps running)
ollama run qwen2.5:7b
```

### Using Smaller/Faster Model

```bash
# For quick responses
ollama run qwen2.5:3b "Explain curbs vs curbless showers briefly"
```

## API Integration

Ollama provides a REST API on `http://localhost:11434`:

### Generate Completions

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:7b",
  "prompt": "What are TCNA standards for tile installation?",
  "stream": false
}'
```

### Streaming Responses

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:7b",
  "prompt": "Explain waterproofing systems",
  "stream": true
}'
```

### JavaScript/Node.js Integration

```javascript
async function queryQwen(prompt) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "qwen2.5:7b",
      prompt: prompt,
      stream: false,
    }),
  });

  const data = await response.json();
  return data.response;
}

// Usage
const answer = await queryQwen("What is the Build Phase?");
console.log(answer);
```

## Tillerstead Automation Scripts

### Bash Setup Script

```bash
bash scripts/setup-ollama-qwen.sh
```

This script:

- ✅ Checks if Ollama is installed
- ✅ Verifies Ollama is running
- ✅ Pulls both qwen2.5:7b and qwen2.5:3b
- ✅ Tests the installation

### PowerShell Setup Script

```powershell
.\scripts\setup-ollama-qwen.ps1
```

**Options:**

```powershell
# Skip downloading models (if already installed)
.\scripts\setup-ollama-qwen.ps1 -SkipPull

# Test specific model
.\scripts\setup-ollama-qwen.ps1 -Model "qwen2.5:3b"
```

## Use Cases for Tillerstead

### 1. Content Generation

```bash
ollama run qwen2.5:7b \
  "Write a concise explanation of waterproofing systems for homeowners. \
   Keep it under 200 words and use plain language."
```

### 2. FAQ Answers

```bash
ollama run qwen2.5:7b \
  "Create an FAQ about tile installation based on TCNA standards. \
   Focus on common homeowner questions."
```

### 3. Build Phase Guides

```bash
ollama run qwen2.5:7b \
  "Write a New Jersey HIC compliance checklist for bathroom remodels. \
   Include codes, permits, and inspection points."
```

### 4. Service Area Descriptions

```bash
ollama run qwen2.5:7b \
  "Write a service area page for Tillerstead describing Atlantic County, NJ. \
   Include local demographics, common bathroom issues, and why they should choose Tillerstead."
```

### 5. Blog Post Ideas

```bash
ollama run qwen2.5:7b \
  "Generate 5 blog post ideas for a TCNA-compliant tile contractor. \
   Focus on homeowner education about tile installation, waterproofing, and shower design."
```

## Performance Tips

### Memory & Speed

**Qwen 2.5 System Requirements:**

| Model | VRAM     | RAM    | Speed     |
| ----- | -------- | ------ | --------- |
| 3b    | 2 GB     | 4 GB   | Very Fast |
| 7b    | 4-6 GB   | 8 GB   | Fast      |
| 14b   | 10-12 GB | 16+ GB | Moderate  |

### Optimization

```bash
# Run with GPU acceleration (NVIDIA)
export OLLAMA_CUDA_COMPUTE_CAPABILITY=8.0
ollama run qwen2.5:7b

# Run with reduced memory usage
ollama run qwen2.5:3b  # Use smaller model

# Load model into memory first
ollama run qwen2.5:7b "warm up"
```

### Temperature (Creativity vs Determinism)

```bash
# More creative/varied responses
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:7b",
  "prompt": "Write a creative description of tile installation",
  "temperature": 0.8,
  "stream": false
}'

# More factual/consistent responses
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:7b",
  "prompt": "List TCNA standards for tile installation",
  "temperature": 0.1,
  "stream": false
}'
```

## Troubleshooting

### "Connection refused" when running ollama commands

**Solution:** Start Ollama service

```bash
# macOS/Linux: Ensure service is running
systemctl status ollama

# Windows: Open Ollama from Start Menu (should show green indicator)
```

### Model runs very slowly

**Solution:** Use smaller model or check system resources

```bash
# Use 3B model instead of 7B
ollama run qwen2.5:3b

# Check available memory
# macOS/Linux: free -h or top
# Windows: Task Manager > Performance
```

### Model produces low-quality output

**Solution:** Improve the prompt

```bash
# Bad: "Tell me about tile"
# Good: "Explain ANSI A118.10 waterproofing standards for tile installation"

# Bad: "What's wrong?"
# Good: "List common causes of shower tile failures and how to prevent them"
```

### GPU not being used

**Solution:** Install GPU drivers

- NVIDIA: https://www.nvidia.com/Download/index.aspx
- AMD: https://www.amd.com/en/support
- After installation, Ollama will auto-detect

## Advanced: Custom Prompts

Create a file `prompts/tillerstead-guide.txt`:

```
You are a TCNA-compliant tile installation expert for Tillerstead LLC,
a licensed New Jersey HIC contractor. You have deep knowledge of:
- TCNA 2024 Handbook standards
- ANSI A108/A118/A136.1 specifications
- New Jersey building codes and HIC requirements
- Waterproofing systems and flood testing
- Shower pan slopes, thresholds, and tile installation

When answering, always:
1. Cite relevant standards (TCNA, ANSI, NJ codes)
2. Explain "why" not just "how"
3. Highlight common mistakes
4. Be transparent about costs/complexity
5. Use plain language for homeowners
```

Then use:

```bash
ollama run qwen2.5:7b < prompts/tillerstead-guide.txt
```

## Learning Resources

- **Ollama Docs:** https://github.com/ollama/ollama
- **Qwen Model:** https://ollama.ai/library/qwen2.5
- **LLM Prompting:** https://platform.openai.com/docs/guides/prompt-engineering

## Next Steps

1. ✅ Install Ollama from https://ollama.ai
2. ✅ Run setup script: `bash scripts/setup-ollama-qwen.sh`
3. ✅ Test with: `ollama run qwen2.5:7b "Hello, Qwen!"`
4. ✅ Integrate into your workflow as needed
5. ✅ Refer to use cases above for Tillerstead-specific tasks

---

**Questions?** Check Ollama documentation or this guide's troubleshooting section.

