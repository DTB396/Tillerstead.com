# 🚀 Tillerstead MCP Agents - Quick Reference

## ✅ System Status: FULLY OPERATIONAL

Both TypeScript MCP agents and PowerShell scripts are built and ready to use!

---

## 📦 What You Have

### TypeScript MCP Agents (4 agents)
- ✅ **Jekyll Specialist** - Manage includes, find duplicates, refactor
- ✅ **SEO Specialist** - Validate meta tags, generate schemas
- ✅ **Calculator Specialist** - Tile calculations
- ✅ **Orchestrator** - Coordinate all agents

**Status:** Built successfully (`npm run build` ✓)  
**Location:** `.mcp-agents/*/build/index.js`

### PowerShell Scripts (3 scripts)  
- ✅ **Audit-Includes.ps1** - Find duplicate/unused Jekyll includes
- ✅ **Validate-SEO.ps1** - Check meta tags for all pages
- ✅ **Calculate-Tile.ps1** - Calculate tile requirements

**Status:** Ready to run  
**Location:** `.mcp-agents/scripts/`

---

## 🎯 Quick Start Guide

### Method 1: PowerShell Scripts (Easiest - Works Now!)

```powershell
# Navigate to scripts
cd C:\web-dev\github-repos\Tillerstead.com\.mcp-agents\scripts

# Audit includes for duplicates
.\Audit-Includes.ps1 -RootPath "C:\web-dev\github-repos\Tillerstead.com"

# Validate SEO meta tags
.\Validate-SEO.ps1 -RootPath "C:\web-dev\github-repos\Tillerstead.com"

# Calculate tiles for a room
.\Calculate-Tile.ps1 -Length 10 -Width 12 -TileSize 12 -WasteFactor 10
```

**Outputs:** Color-coded console + JSON reports in `_reports/`

---

### Method 2: MCP Servers (GitHub Copilot Integration)

**Step 1:** Add to VS Code `settings.json`:

```json
{
  "mcpServers": {
    "tillerstead-jekyll": {
      "command": "node",
      "args": ["C:/web-dev/github-repos/Tillerstead.com/.mcp-agents/jekyll-specialist/build/index.js"]
    },
    "tillerstead-seo": {
      "command": "node",
      "args": ["C:/web-dev/github-repos/Tillerstead.com/.mcp-agents/seo-specialist/build/index.js"]
    },
    "tillerstead-calculator": {
      "command": "node",
      "args": ["C:/web-dev/github-repos/Tillerstead.com/.mcp-agents/calculator-specialist/build/index.js"]
    }
  }
}
```

**Step 2:** Restart VS Code

**Step 3:** Use with Copilot:

```
@tillerstead-jekyll audit includes in C:/web-dev/github-repos/Tillerstead.com
@tillerstead-seo validate meta tags for contact.html
@tillerstead-calculator calculate 10x12 room with 12 inch tiles
```

---

## 💡 Common Tasks

### Audit Jekyll Includes
```powershell
.\Audit-Includes.ps1 -RootPath "C:\web-dev\github-repos\Tillerstead.com"
```
**Finds:**
- Duplicate files (by content hash)
- Unused includes (no references)
- Suggests canonical versions

---

### Validate SEO
```powershell
# All pages
.\Validate-SEO.ps1 -RootPath "C:\web-dev\github-repos\Tillerstead.com"

# Single page
.\Validate-SEO.ps1 -RootPath "C:\web-dev\github-repos\Tillerstead.com" -Page "contact.html"
```
**Checks:**
- Title (50-60 chars)
- Description (150-160 chars)
- Open Graph tags
- Twitter Card
- Canonical URL

---

### Calculate Tiles
```powershell
.\Calculate-Tile.ps1 -Length 10 -Width 12 -TileSize 12
.\Calculate-Tile.ps1 -Length 15 -Width 18 -TileSize 6 -WasteFactor 15
```
**Calculates:**
- Area in sq ft
- Tiles needed (with waste)
- Boxes required
- Grout bags
- Cost estimate

---

## 📊 Sample Output

### Calculator Example
```
🧮 Tile Calculator
📏 Dimensions: 10ft x 12ft = 120 sq ft
🔲 Tile Requirements:
  • 12x12 inch tiles
  • 120 tiles (no waste)
  • 132 tiles total (10% waste)
  • 11 boxes needed
🪣 Grout: 2 bags
💰 Total: $360
```

### Includes Audit Example
```
📊 Audit Results
Total Includes: 45
Duplicates: 3 groups
Unused: 7 files

🔄 Duplicate: ts-services.html
  ✓ Canonical: components/c-services.html
  ✗ Redundant: sections/ts-services.html
  ✗ Redundant: ts-services-old.html
```

---

## 🛠️ Troubleshooting

### Scripts Won't Run
```powershell
# Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Path Errors
- Use **absolute paths** for `-RootPath`
- Ensure you're in `.mcp-agents\scripts` directory

### MCP Agents Not Found
```powershell
# Rebuild agents
cd C:\web-dev\github-repos\Tillerstead.com\.mcp-agents
npm run build
```

---

## 📁 File Locations

```
C:\web-dev\github-repos\Tillerstead.com\
└── .mcp-agents\
    ├── scripts\               ← PowerShell scripts
    │   ├── Audit-Includes.ps1
    │   ├── Validate-SEO.ps1
    │   └── Calculate-Tile.ps1
    ├── jekyll-specialist\     ← MCP agents
    │   └── build\index.js
    ├── seo-specialist\
    │   └── build\index.js
    └── calculator-specialist\
        └── build\index.js
```

---

## 🎓 Learning More

- **Full Documentation:** `.mcp-agents/README.md`
- **Script Details:** `.mcp-agents/scripts/README.md`  
- **Quick Start:** `.mcp-agents/QUICKSTART.md`
- **Build Status:** `.mcp-agents/BUILD-STATUS.md`

---

## ✨ Next Steps

1. **Try the calculator** (easiest):
   ```powershell
   cd .mcp-agents\scripts
   .\Calculate-Tile.ps1 -Length 10 -Width 12 -TileSize 12
   ```

2. **Run an audit**:
   ```powershell
   .\Audit-Includes.ps1 -RootPath "C:\web-dev\github-repos\Tillerstead.com"
   ```

3. **Check SEO**:
   ```powershell
   .\Validate-SEO.ps1 -RootPath "C:\web-dev\github-repos\Tillerstead.com"
   ```

4. **Set up MCP servers** (optional):
   - Add config to `settings.json`
   - Restart VS Code
   - Use with `@tillerstead-*` in Copilot

---

**Version:** 1.0.0  
**Built:** January 23, 2026  
**Status:** ✅ Production Ready
