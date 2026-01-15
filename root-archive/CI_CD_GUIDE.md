{% raw %}
# CI/CD & Quality Assurance Guide

## Overview

Tillerstead uses a comprehensive CI/CD pipeline to maintain code quality, prevent encoding issues, and ensure reliable deployments. This system validates every change before it reaches production.

---

## Scripts & Tools

### Validation Scripts

#### 1. **Comprehensive Validation** (`npm run validate`)

Validates the entire repository for encoding, YAML syntax, Liquid templates, and file integrity.

**Checks:**

- UTF-8 encoding (no BOM, no invalid characters)
- YAML file structure (no tabs, valid syntax)
- Liquid template syntax (valid operators, filter syntax)
- Critical files exist (index.html, CNAME, etc.)
- Navigation links resolve
- HTML structure validation

**Usage:**

```bash
npm run validate
```

#### 2. **Automatic Encoding Fix** (`npm run fix:encoding`)

Automatically fixes common encoding issues:

- Removes UTF-8 BOM
- Converts YAML tabs to spaces
- Normalizes line endings (CRLF → LF)
- Fixes Liquid operators (`gt` → `>`, `lt` → `<`)

**Usage:**

```bash
npm run fix:encoding
```

---

## GitHub Actions Workflows

### 1. **CI/CD Pipeline** (`.github/workflows/ci.yml`)

**Triggers:** Push to `main` or `develop`, Pull requests to `main`

**Jobs:**

#### Validate & Lint

- Runs comprehensive validation script
- ESLint (JavaScript)
- stylelint (CSS/SCSS)
- HTMLHint (HTML structure)

#### Build Site

- Installs dependencies (Ruby, Node.js)
- Builds CSS assets
- Generates static site with Jekyll
- Verifies build artifacts
- Ensures CNAME is configured for GitHub Pages

#### Test Built Site

- Verifies critical pages exist
- Validates generated HTML
- Checks for broken links

#### Deploy to GitHub Pages

- **Only runs on `main` branch**
- Uploads to GitHub Pages with custom domain
- Generates production environment

### 2. **Encoding & Quality Validation** (`.github/workflows/encoding-validation.yml`)

**Triggers:** Push, Pull requests, Weekly schedule (Sunday 00:00 UTC)

**Jobs:**

- **Encoding Validation:** Checks for UTF-8 BOM, invalid characters, YAML tabs
- **HTML Validation:** HTMLHint analysis
- **YAML Validation:** yamllint checks
- **Jekyll Build:** Dry-run build with trace
- **JavaScript Lint:** ESLint
- **Summary:** Final report with pass/fail status

---

## Pre-Commit Workflow

Before pushing changes:

```bash
# 1. Validate everything
npm run validate

# 2. Fix any encoding issues
npm run fix:encoding

# 3. Run linters
npm run lint

# 4. Build locally
npm run build

# 5. Run tests (optional)
npm test
```

---

## Common Issues & Solutions

### Issue: UTF-8 BOM in Files

**Problem:** Windows text editors may add UTF-8 BOM when saving files.

**Solution:**

```bash
npm run fix:encoding
```

Or manually save as UTF-8 without BOM in your editor.

### Issue: YAML Tabs Instead of Spaces

**Problem:** Jekyll/YAML requires spaces, not tabs.

**Solution:**

```bash
npm run fix:encoding
```

### Issue: Invalid Liquid Operators

**Problem:** Using `gt` or `lt` instead of `>` or `<`.

**Example (wrong):**

```liquid
{% if items.size gt 0 %}
```

**Example (correct):**

```liquid
{% if items.size > 0 %}
```

**Solution:**

```bash
npm run fix:encoding
```

### Issue: Build Fails on GitHub Actions

**Steps to debug:**

1. Check the workflow log in GitHub Actions tab
2. Look for encoding, YAML, or Liquid syntax errors
3. Run locally: `npm run validate && npm run build`
4. If encoding issues: `npm run fix:encoding`
5. Commit fixes and push again

---

## Quality Gates

The CI/CD pipeline enforces these quality gates:

| Gate       | Tool             | Requirement                           |
| ---------- | ---------------- | ------------------------------------- |
| Encoding   | Custom validator | UTF-8 only, no BOM, valid syntax      |
| YAML       | yamllint         | Valid structure, spaces not tabs      |
| JavaScript | ESLint           | No critical errors (warnings allowed) |
| CSS        | stylelint        | No critical errors (warnings allowed) |
| HTML       | HTMLHint         | Valid structure, accessibility        |
| Build      | Jekyll           | Successful site generation            |
| Artifacts  | Custom validator | index.html, CNAME, critical pages     |

---

## Deployment Process

### Automatic Deployment (Main Branch)

1. **Code pushed to `main`**
   ↓
2. **CI/CD runs validation & build**
   ↓
3. **Tests pass** → Builds site artifacts
   ↓
4. **Deploy job uploads to GitHub Pages**
   ↓
5. **Site live at tillerstead.com**

Typical deployment time: **2-3 minutes**

### Manual Deployment (If Needed)

```bash
# Build locally
npm run build

# The _site directory is ready for deployment
# Deploy to your hosting provider as needed
```

---

## Monitoring & Maintenance

### Weekly Validation

The `encoding-validation.yml` workflow runs automatically every Sunday at 00:00 UTC to catch any encoding drift.

### Build Logs

- Check GitHub Actions tab for workflow logs
- Look for warnings that might become errors
- Address deprecated syntax early

### Dependencies

Keep dependencies updated:

```bash
npm update
bundle update
```

---

## Best Practices

1. **Always validate locally before pushing:**

   ```bash
   npm run validate && npm run build
   ```

2. **Use consistent editors:** Configure your editor to save as UTF-8 without BOM

3. **Check YAML files:** No tabs, use 2-space indentation

4. **Test Liquid templates:** Use `{% if condition > 0 %}` not `gt`

5. **Commit fixes together:** If validation finds issues, commit the fixes with the feature

6. **Review workflow logs:** Check GitHub Actions for warnings even if builds pass

7. **Document encoding issues:** If you encounter them, document the solution

---

## Troubleshooting Checklist

- [ ] Run `npm run validate` locally
- [ ] Run `npm run fix:encoding` to auto-fix issues
- [ ] Check `.github/workflows/ci.yml` for recent changes
- [ ] Review GitHub Actions logs for specific errors
- [ ] Check file encoding in your editor
- [ ] Verify YAML syntax (no tabs)
- [ ] Ensure all Liquid operators are valid
- [ ] Run `npm run build` to test locally
- [ ] Check CNAME file exists
- [ ] Verify critical pages build correctly

---

## Contact & Support

For CI/CD issues:

1. Check the GitHub Actions logs
2. Review this guide
3. Run local validation: `npm run validate`
4. Review recent commits for encoding/syntax changes

{% endraw %}


