# Tillerstead Stone - Scripts Reference Guide

## 🚀 Quick Start Commands

### **Intelligent Site Harmony (Recommended)**
🧠 **Audits FIRST**, then fixes only what's broken:
```powershell
cd tillerstead-stone
.\scripts\run-all-harmony.ps1
```

**What it does:**
1. ✅ Runs comprehensive audits (CSS, images, config, Jekyll, navigation)
2. 🔍 Detects specific issues in your site
3. 🔧 Applies fixes ONLY for detected issues
4. 🏗️ Builds optimized production site
5. ✅ Validates & tests everything
6. 📊 Shows detailed status report

### **Quick Build & Deploy**
```powershell
cd tillerstead-stone
npm run build
git add -A && git commit -m "Update site" && git push
```

---

## 📋 Individual Scripts Reference

### **BUILD SCRIPTS**

#### CSS Build
```powershell
# Build CSS from SCSS
node scripts\build-css.js
# OR
npm run build:css
```

#### Site Build
```powershell
# Complete Jekyll build
.\scripts\build-site.ps1
# OR
npm run build
```

#### Logo Generation
```powershell
# Generate PNG versions of SVG logos
node scripts\generate-png-logos.js
```

---

### **OPTIMIZATION SCRIPTS**

#### Image Optimization
```powershell
# Optimize all images
node scripts\optimize-images.js

# Convert images to WebP
node scripts\convert-images-to-webp.js

# Audit and fix image structure
.\scripts\audit-and-fix-images.ps1
```

#### CSS Optimization
```powershell
# Find unused CSS
node scripts\find-unused-css.js

# Analyze CSS structure
node scripts\analyze-css-structure.js

# Consolidate colors
node scripts\consolidate-colors.js

# Refactor CSS prefixes
node scripts\refactor-css-prefixes.js
```

---

### **DIAGNOSTIC SCRIPTS**

#### Site Health
```powershell
# Complete repo health check
node scripts\ts-90-repo-doctor.js

# Development audit
.\scripts\dev-audit.ps1

# Check all links
node scripts\check-links.js
```

#### GitHub Actions
```powershell
# Diagnose GitHub Actions issues
.\scripts\diagnose-gh-actions.ps1

# Debug GitHub Actions
bash scripts\github-actions-debug.sh
```

---

### **MAINTENANCE SCRIPTS**

#### Configuration & Repair
```powershell
# Bootstrap/initialize project
.\scripts\ts-00-bootstrap.ps1

# Repair config and package.json
.\scripts\ts-11-repair-config-and-package.ps1

# Fix Jekyll config
.\scripts\ts-20-fix-jekyll-config.ps1

# Fix asset links
.\scripts\ts-30-fix-asset-links.ps1

# Fix head and frontmatter
.\scripts\ts-15-fix-head-and-frontmatter.ps1
```

#### Cleanup
```powershell
# Cleanup old theme files
bash scripts\cleanup-old-theme.sh

# Fix Liquid template closers
bash scripts\fix-liquid-closers.sh
```

---

### **TESTING SCRIPTS**

```powershell
# Test navigation
node scripts\test-navigation.js
# OR
npm test

# Run Playwright tests with browser
npm run test:headed
```

---

### **DEPLOYMENT SCRIPTS**

```powershell
# Verify deployment readiness
node scripts\verify-deployment.js

# Deploy fixes
.\scripts\deploy-fixes.ps1

# Deploy to tillerstead-stone
.\scripts\deploy-to-tillerstead-stone.ps1
```

---

### **UTILITY SCRIPTS**

```powershell
# Activate Ruby environment
.\scripts\activate-ruby.ps1

# Post-build linking
node scripts\post-build-link.js

# Slugify text
node scripts\slugify.js

# Sync Thumbtack reviews
node scripts\sync_thumbtack_reviews.js
```

---

## 🔄 Common Workflows

### **1. Daily Development**
```powershell
cd tillerstead-stone

# Start dev server with live reload
npm run dev:watch

# Make changes, then rebuild
npm run build

# Commit and push
git add -A
git commit -m "Your changes"
git push
```

### **2. Fix Broken Site**
```powershell
cd tillerstead-stone

# Run diagnostics
node scripts\ts-90-repo-doctor.js

# Run complete harmony build
.\scripts\run-all-harmony.ps1

# Test locally
npm run serve

# Deploy
git add -A && git commit -m "Fix site issues" && git push
```

### **3. Performance Optimization**
```powershell
cd tillerstead-stone

# Optimize images
node scripts\optimize-images.js
node scripts\convert-images-to-webp.js

# Optimize CSS
node scripts\find-unused-css.js

# Rebuild
npm run build
```

### **4. Pre-Deployment Checklist**
```powershell
cd tillerstead-stone

# 1. Verify deployment
node scripts\verify-deployment.js

# 2. Check links
node scripts\check-links.js

# 3. Test navigation
npm test

# 4. Build and serve locally
npm run build && npm run serve

# 5. Deploy
git add -A && git commit -m "Deploy" && git push
```

---

## 🎯 Script Execution Order for Full Build

The `run-all-harmony.ps1` script executes in this order:

1. **Environment Setup**
   - Activate Ruby

2. **Auditing**
   - Analyze CSS structure
   - Find unused CSS
   - Run repo doctor

3. **Asset Optimization**
   - Generate PNG logos
   - Optimize images
   - Convert to WebP
   - Audit image structure

4. **Build**
   - Build CSS
   - Build Jekyll site

5. **Post-Build**
   - Post-build linking
   - Check links

6. **Verification**
   - Verify deployment
   - Test navigation

---

## 💡 Tips

- **Always run from project root**: `cd tillerstead-stone`
- **PowerShell scripts**: Use `.\scripts\script-name.ps1`
- **Node.js scripts**: Use `node scripts\script-name.js`
- **Bash scripts**: Use `bash scripts\script-name.sh` (Git Bash on Windows)
- **NPM scripts**: Use `npm run script-name` (fastest, recommended)

---

## 🆘 Troubleshooting

### Script Won't Run
```powershell
# Enable PowerShell script execution (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Ruby Not Found
```powershell
.\scripts\activate-ruby.ps1
```

### Node Modules Missing
```powershell
npm install
```

### Build Fails
```powershell
# Clean and rebuild
Remove-Item -Recurse -Force _site, assets\css\main.css -ErrorAction SilentlyContinue
npm run build
```

---

**Last Updated**: 2025-12-26
