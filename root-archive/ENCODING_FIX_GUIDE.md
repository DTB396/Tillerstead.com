# Encoding Fix & CI/CD Validation Guide

## Overview

The Tillerstead repository now includes automated encoding validation and CI/CD checks to prevent issues like:

- UTF-8 BOM (Byte Order Mark) corruption
- Tab characters in YAML files
- Broken HTML entities
- Invalid JSON syntax
- Jekyll build failures

---

## Quick Start

### 1. **Run Validation Only** (Check for issues)

```powershell
./scripts/encoding-fix.ps1 -Validate
```

Output:

```
✅ All files validated successfully!
```

Or lists specific issues:

```
⚠️  Found 3 files with issues:
  📄 C:\...\pages\index.html
     Encoding: UTF-8-BOM (with BOM)
     ⚠️  Missing proper meta charset declaration
```

### 2. **Auto-Fix Encoding Issues**

```powershell
./scripts/encoding-fix.ps1 -Fix
```

This will:

- Remove UTF-8 BOMs from all files
- Normalize all files to UTF-8 without BOM
- Preserve content integrity

### 3. **Generate Detailed Report**

```powershell
./scripts/encoding-fix.ps1 -Report
```

Saves JSON report to `reports/encoding-audit-YYYYMMDD-HHMMSS.json`

### 4. **Combined (Validate + Fix + Report)**

```powershell
./scripts/encoding-fix.ps1 -Validate -Fix -Report
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/encoding-validation.yml`

Runs automatically on:

- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Weekly schedule (Sundays at 00:00 UTC)

### Jobs Executed

| Job                   | Purpose                          | Trigger    |
| --------------------- | -------------------------------- | ---------- |
| `encoding-validation` | Check UTF-8 encoding, tabs, BOMs | Every push |
| `html-validation`     | Run HTMLHint on all HTML files   | Every push |
| `yaml-validation`     | Validate YAML syntax             | Every push |
| `jekyll-build`        | Full Jekyll site build           | Every push |
| `lint-js`             | ESLint JavaScript validation     | Every push |
| `summary`             | Report overall status            | Every push |

### Viewing Results

1. Go to **Actions** tab in GitHub repo
2. Click on **Encoding & Quality Validation**
3. Select a workflow run
4. Expand each job to see results
5. Download artifacts (e.g., `jekyll-build-log.txt`)

---

## Pre-Commit Hook

### Automatic Validation Before Commit

**File:** `.githooks/pre-commit`

When you run `git commit`, this hook:

1. Validates all staged files for encoding issues
2. Checks HTML meta tags and DOCTYPE
3. Validates YAML indentation
4. Checks JSON syntax
5. Runs site audit

### Bypassing Validation

If you need to bypass validation:

```bash
git commit --no-verify
```

⚠️ **Note:** Not recommended—use only for emergency fixes.

---

## Common Issues & Fixes

### Issue: UTF-8 BOM Detected

**Problem:** File was saved with UTF-8 BOM by an editor (e.g., Notepad, older VS Code settings)

**Fix:**

```powershell
./scripts/encoding-fix.ps1 -Fix
```

**Prevention:** In VS Code, set `"files.encoding": "utf8"` in `.vscode/settings.json`

---

### Issue: Tab Characters in YAML

**Problem:** YAML files have tabs instead of spaces (YAML spec requires spaces)

**Symptoms:**

```
Jekyll build fails with: "mapping values are not allowed here"
```

**Fix:**

```powershell
./scripts/encoding-fix.ps1 -Fix
```

**Prevention:** In VS Code, set `"editor.insertSpaces": true` and `"editor.tabSize": 2`

---

### Issue: Broken HTML Entities

**Problem:** Unclosed or malformed HTML entities (e.g., `&nbsp` without semicolon)

**Symptoms:**

```
HTMLHint warning: "Bad entity" or characters render incorrectly
```

**Fix:** Manually correct in the HTML file or use editor find/replace

**Prevention:** Use proper entity references: `&nbsp;`, `&mdash;`, `&copy;`

---

### Issue: Jekyll Build Failure

**Problem:** Liquid syntax errors or YAML front matter issues

**Symptoms:**

```
jekyll build fails with: "Liquid syntax error" or "mapping values not allowed"
```

**Fix:**

1. Check the build log:

```powershell
bundle exec jekyll build --trace
```

2. Look for line numbers and fix Liquid/YAML syntax
3. Run validation again

---

## Manual Encoding Fix (Alternative)

If PowerShell scripts aren't available:

### Using VS Code

1. Open file
2. Click encoding indicator (bottom right): `UTF-8`
3. Select **Reopen with Encoding** → **UTF-8**
4. Save file

### Using Command Line (Git Bash)

```bash
# Remove BOM from a file
sed -i '1s/^\xEF\xBB\xBF//' filename.html

# Convert tabs to spaces (2 spaces)
sed -i 's/\t/  /g' filename.yml
```

---

## Workflow Configuration

### Customizing Validation Rules

**File:** `.github/workflows/encoding-validation.yml`

To skip certain checks or modify triggers:

```yaml
on:
  push:
    branches: [main, develop]
    # Add to skip certain paths:
    paths-ignore:
      - "docs/**"
      - ".github/**"
```

---

## Dashboard: Monitoring Encoding Health

### Weekly Report

Automatically runs every Sunday. Check:

1. GitHub Actions → **Encoding & Quality Validation**
2. Look for ✅ or ❌ status
3. Review any failed jobs

### Local Dashboard

```powershell
# Get summary of all encoding issues
./scripts/encoding-fix.ps1 -Validate -Report

# View recent report
Get-ChildItem reports/encoding-audit-*.json | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content | ConvertFrom-Json
```

---

## Best Practices

### For Developers

1. **Before Committing:**

   ```powershell
   ./scripts/encoding-fix.ps1 -Validate
   ```

2. **Configure Your Editor:**
   - Set encoding to UTF-8 (no BOM)
   - Use spaces, not tabs
   - End file with newline

3. **When Creating Files:**
   - Use editor defaults or template
   - Run pre-commit hook automatically (`git commit`)

### For Team

1. **Weekly Review:** Check GitHub Actions workflow runs
2. **Address Issues:** Fix encoding problems before merging
3. **Document Changes:** Note why encoding was corrected (if unusual)

---

## Troubleshooting

### Script Won't Run (PowerShell)

**Error:** `PowerShell is disabled`

**Fix:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Hook Not Triggering

**Error:** `pre-commit hook not running`

**Fix:**

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit  # On Unix/Linux/Mac
```

### Build Passes Locally but Fails in CI

**Cause:** Different file encodings on local machine vs. CI runner

**Fix:**

1. Run `./scripts/encoding-fix.ps1 -Fix` locally
2. Commit changes
3. Push to trigger CI

---

## References

- [Jekyll Encoding](https://jekyllrb.com/docs/liquid/filters/)
- [YAML Specification](https://yaml.org/spec/1.2/spec.html)
- [HTML5 Charset](https://html.spec.whatwg.org/multipage/semantics.html#character-encoding-declaration)
- [GitHub Actions Documentation](https://docs.github.com/actions)

---

## Questions?

Check:

1. This guide (you're reading it!)
2. GitHub Actions logs
3. `.github/workflows/encoding-validation.yml`
4. `scripts/encoding-fix.ps1`

---

**Last Updated:** 2026-01-02  
**Maintained By:** Tillerstead Automation System  
**Status:** Active

