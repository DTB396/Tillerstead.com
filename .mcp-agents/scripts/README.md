# Tillerstead MCP Agents - PowerShell Automation Scripts

Quick-use PowerShell scripts for immediate integration with GitHub Copilot.

## Available Scripts

### 1. Audit-Includes.ps1
**Purpose:** Audit Jekyll includes for duplicates and unused files

**Usage:**
```powershell
.\Audit-Includes.ps1 -RootPath "C:\web-dev\github-repos\Tillerstead.com"
.\Audit-Includes.ps1 -RootPath "C:\web-dev\github-repos\Tillerstead.com" -Detailed
```

**Features:**
- Scans all `_includes/*.html` files
- Finds duplicates by content hash
- Identifies unused includes (no references)
- Suggests canonical version for duplicates
- Exports JSON report to `_reports/`

**Output:**
- Console summary with color coding
- JSON report: `_reports/includes-audit-YYYYMMDD-HHMMSS.json`

---

### 2. Validate-SEO.ps1
**Purpose:** Validate SEO meta tags for all pages

**Usage:**
```powershell
.\Validate-SEO.ps1 -RootPath "C:\web-dev\github-repos\Tillerstead.com"
.\Validate-SEO.ps1 -RootPath "C:\web-dev\github-repos\Tillerstead.com" -Page "contact.html"
```

**Checks:**
- ✓ Title tag (50-60 chars)
- ✓ Meta description (150-160 chars)
- ✓ Open Graph tags (og:title, og:description, og:image, og:url)
- ✓ Twitter Card tags
- ✓ Canonical URL

**Output:**
- Per-page validation with issues
- Summary statistics
- JSON report: `_reports/seo-audit-YYYYMMDD-HHMMSS.json`

---

### 3. Calculate-Tile.ps1
**Purpose:** Calculate tile requirements for a project

**Usage:**
```powershell
.\Calculate-Tile.ps1 -Length 10 -Width 12 -TileSize 12
.\Calculate-Tile.ps1 -Length 15 -Width 18 -TileSize 6 -WasteFactor 15
```

**Calculates:**
- Area in square feet
- Number of tiles required
- Waste factor adjustment
- Boxes needed (12 tiles/box standard)
- Grout bags (1 bag per 100 sq ft)
- Cost estimate

**Output:**
- Formatted calculation summary
- JSON export for integration

---

## Using with GitHub Copilot

### Option 1: Direct Execution
Ask Copilot to run scripts:
```
@workspace run the includes audit script
@workspace validate SEO for all pages
@workspace calculate tiles for 10x12 room with 12 inch tiles
```

### Option 2: Integrated Workflows
```
@workspace audit includes, then merge duplicates
@workspace check SEO and generate missing meta tags
@workspace calculate tiles and update pricing page
```

## Script Features

### Error Handling
- `$ErrorActionPreference = "Stop"` - Fail fast on errors
- Validation of required paths
- Clear error messages

### Reporting
- Color-coded console output
- JSON exports for automation
- Timestamps on all reports

### Performance
- Efficient file scanning
- Parallel-ready (can be enhanced)
- Minimal memory footprint

## Future Enhancements

### Planned Scripts
- `Optimize-Images.ps1` - WebP conversion, compression
- `Check-Accessibility.ps1` - WCAG compliance
- `Run-Tests.ps1` - Execute Playwright tests
- `Deploy-Feature.ps1` - Full deployment workflow

### Enhancements
- Add `-WhatIf` and `-Confirm` support
- Pipeline input support
- Progress bars for long operations
- Email/Slack notifications

## Integration with TypeScript Agents

These PowerShell scripts complement the TypeScript MCP agents:
- **Immediate use:** Scripts work now
- **Future:** TypeScript agents provide richer integration
- **Hybrid:** Use both - scripts for quick tasks, agents for complex workflows

## Troubleshooting

### "Execution Policy" Error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Permission Denied
Run PowerShell as Administrator or check file permissions.

### Path Not Found
Ensure `$RootPath` points to Tillerstead.com root directory.

---

**Created:** January 23, 2026  
**Version:** 1.0.0  
**Author:** Tillerstead Development Team
