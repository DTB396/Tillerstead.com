# Jekyll Includes Auditor

## Overview

Automated tool to audit, analyze, and clean up redundant Jekyll `_includes` files. Identifies duplicates, finds references, and safely archives unnecessary files while updating all references automatically.

## Features

- **🔍 Comprehensive Scanning**: Recursively scans all files in `_includes` directory
- **🎯 Duplicate Detection**: 
  - Exact duplicates (byte-for-byte identical via SHA256)
  - Normalized duplicates (same content, different whitespace/line endings)
  - Same-name conflicts (same filename, different locations)
- **📊 Reference Tracking**: Finds all Liquid `{% include %}` and `{% include_relative %}` usage across the repository
- **🧠 Smart Canonical Selection**: Scores files based on folder structure, naming conventions, and path depth to recommend the best version to keep
- **🗄️ Safe Archiving**: Archives redundant files with full folder structure preservation and manifest tracking
- **🔧 Automatic Reference Fixing**: Updates all `{% include %}` statements to point to canonical files
- **✅ Safety First**: Report-only by default; all destructive actions require explicit confirmation

## Requirements

- **PowerShell 7.0+** (not Windows PowerShell 5.1)
- Jekyll repository with `_includes` directory

## Usage

### 1. Run Audit (Report Only)

```powershell
# Generate reports without making any changes
.\tools\includes-audit.ps1
```

**Outputs:**
- `_reports/includes-inventory.csv` - Complete file inventory with hashes
- `_reports/includes-duplicates.json` - Structured duplicate data
- `_reports/includes-cleanup-plan.md` - Human-readable cleanup recommendations

### 2. Preview Cleanup Actions

```powershell
# See what would happen without making changes
.\tools\includes-audit.ps1 -ArchiveRedundant -FixReferences -WhatIf
```

### 3. Execute Cleanup

```powershell
# Archive redundant files and update references
.\tools\includes-audit.ps1 -ArchiveRedundant -FixReferences
```

### 4. Delete After Verification

```powershell
# ONLY after testing: permanently delete archived files
.\tools\includes-audit.ps1 -ArchiveRedundant -DeleteAfterArchive
```

## Complete Workflow

```powershell
# Step 1: Audit
.\tools\includes-audit.ps1

# Step 2: Review the cleanup plan
code _reports\includes-cleanup-plan.md

# Step 3: Preview actions (dry run)
.\tools\includes-audit.ps1 -ArchiveRedundant -FixReferences -WhatIf

# Step 4: Execute cleanup
.\tools\includes-audit.ps1 -ArchiveRedundant -FixReferences

# Step 5: Rebuild and test site
bundle exec jekyll build
bundle exec jekyll serve

# Step 6: Manual testing
# - Check all pages render correctly
# - Verify navigation works
# - Test forms, modals, etc.

# Step 7: (Optional) Delete archived files if everything works
.\tools\includes-audit.ps1 -ArchiveRedundant -DeleteAfterArchive
```

## Canonical Scoring System

The tool automatically determines the "best" file to keep using this scoring system:

| Criterion | Score |
|-----------|-------|
| **Preferred Folders** | |
| `components/` | +50 |
| `sections/`, `layout/` | +40 |
| `navigation/` | +35 |
| `forms/`, `schema/` | +30 |
| Shorter path depth | +10 per level |
| **Penalized Patterns** | |
| `backup/`, `old/`, `temp/`, `archive/` | -100 |
| `deprecated/` | -90 |
| `legacy/` | -85 |
| Contains "copy" | -80 |
| Contains dates (YYYY-MM) | -70 |
| Version numbers (v1, v2) | -60 |
| Leading underscore | -20 |

## Parameters

- `-RepoRoot` - Path to repository root (default: current directory)
- `-ArchiveRedundant` - Archive redundant files to `archive/includes-redundant/<timestamp>/`
- `-FixReferences` - Rewrite `{% include %}` references to use canonical paths
- `-DeleteAfterArchive` - Delete redundant files after archiving (requires `-ArchiveRedundant`)
- `-WhatIf` - Preview actions without making changes

## Safety Features

- **Report-only by default**: No changes unless explicitly requested
- **WhatIf support**: Preview all actions before execution
- **Archive before delete**: Redundant files are copied to `archive/` before deletion
- **Manifest tracking**: JSON manifest created with every archive operation
- **Confirmation prompts**: PowerShell's `ShouldProcess` for all destructive operations
- **Reference validation**: Verifies all include references before updating

## Archive Structure

```
archive/
└── includes-redundant/
    └── 20260118-153000/
        ├── _manifest.json
        └── [original folder structure]
            ├── components/
            ├── sections/
            └── ...
```

## Example Output

```
🔍 Jekyll Includes Auditor v1.0
====

📋 Phase 1: Scanning _includes directory...
  Analyzing: components/card.html
  Analyzing: components/button.html
  ...
✓ Found 127 files in _includes

📊 Phase 2: Identifying duplicates...
✓ Exact duplicates: 5 groups
✓ Normalized duplicates: 2 groups
✓ Same name conflicts: 3 groups

🔎 Phase 3: Finding references...
  Searching references to: card.html
  ...
✓ Found 23 total references to redundant files

📝 Phase 4: Generating cleanup plan...
✓ Saved cleanup plan: _reports\includes-cleanup-plan.md

📖 Next steps:
  1. Review cleanup plan: _reports\includes-cleanup-plan.md
  2. Preview actions: .\tools\includes-audit.ps1 -ArchiveRedundant -WhatIf
  3. Execute cleanup: .\tools\includes-audit.ps1 -ArchiveRedundant -FixReferences
```

## Troubleshooting

### "Includes directory not found"
Ensure you're running the script from the repository root where `_includes/` exists.

### "Requires PowerShell 7.0+"
Install PowerShell 7:
```powershell
winget install Microsoft.PowerShell
```

### References not found correctly
The tool searches for:
- `{% include "file.html" %}`
- `{% include 'file.html' %}`
- `{% include file.html %}`
- `{% include folder/file.html %}`
- `{% include_relative file.html %}`

If using custom include patterns, you may need to update manually.

## Best Practices

1. **Always review the cleanup plan** before executing actions
2. **Use -WhatIf** to preview changes
3. **Test thoroughly** after cleanup before deleting archives
4. **Keep archives** for at least one release cycle
5. **Commit reports** to version control for audit trail
6. **Run regularly** (monthly/quarterly) to prevent accumulation

## Related Tools

- `tools/seo-audit.ps1` - SEO metadata validation
- `scripts/seo-audit.js` - JavaScript-based SEO checker

---

**Version:** 1.0  
**Last Updated:** 2026-01-18  
**Author:** Tillerstead.com DevOps
