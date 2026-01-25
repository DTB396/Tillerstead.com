# TILLERSTEAD OPTIMIZATION SUITE

Automated repository improvement tools that run overnight to continuously enhance code quality, performance, and structure.

## 🌙 DEEP OVERNIGHT OPTIMIZER (Recommended)

**The heavy-duty, multi-hour optimization engine.**

### Quick Start
```powershell
cd C:\web-dev\github-repos\Tillerstead.com
.\scripts\deep-overnight.ps1
```

### What It Does
Runs for **8 hours by default**, continuously improving:
- ✅ CSS optimization (deduplication, cleanup, whitespace)
- ✅ JavaScript optimization (console log removal, debugger cleanup)
- ✅ HTML fixes (alt tags, self-closing tags, validation)
- ✅ Directory structure improvements
- ✅ Performance tracking per iteration
- ✅ Auto-commits every iteration
- ✅ Detailed reports for each pass

### Parameters
```powershell
# Run for 4 hours instead of 8
.\scripts\deep-overnight.ps1 -MaxHours 4

# Change iteration delay (default 5 minutes)
.\scripts\deep-overnight.ps1 -IterationDelay 600

# Aggressive mode (more risky optimizations)
.\scripts\deep-overnight.ps1 -Aggressive

# Don't auto-commit (testing mode)
.\scripts\deep-overnight.ps1 -SkipCommits
```

### Example Output
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 ITERATION #15 - 03:45:12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 Optimizing CSS files...
  ✅ header-nav-fixed.css: 12 optimizations
  ✅ navigation.css: 8 optimizations
⚡ Optimizing JavaScript files...
  ✅ nav.js: 3 optimizations
📄 Optimizing HTML files...
  ✅ unified-hero-home.html: 5 optimizations

📊 Iteration Summary:
  • Optimizations: 28
  • Total so far: 420
  • CSS size change: -2.4KB

📦 Committing iteration #15...
  ✅ Changes committed

⏰ Next iteration in 300 seconds...
⏳ Time remaining: 4.25 hours
```

---

## 📋 STANDARD OVERNIGHT SUITE

**Quick analysis and automated fixes (runs once).**

### Quick Start
```powershell
.\scripts\run-overnight.ps1
```

### What It Does (One-Time)
1. Analyzes entire codebase
2. Generates detailed reports
3. Applies safe fixes
4. Tests build
5. Commits and pushes

### Reports Generated
- `optimization-reports/MASTER-REPORT.md` - Executive summary
- `optimization-reports/css-analysis.json` - CSS metrics
- `optimization-reports/js-analysis.json` - JavaScript metrics
- `optimization-reports/html-validation.json` - HTML issues
- `COMPONENT-INVENTORY.md` - File structure
- `OPTIMIZATION-CHECKLIST.md` - Action items
- `RECOMMENDATIONS.md` - Improvement suggestions

---

## 🎯 WHICH ONE TO USE?

### Use `deep-overnight.ps1` when:
- ✅ You want hours of continuous improvement
- ✅ You can let it run overnight (8 hours)
- ✅ You want iterative, aggressive optimization
- ✅ You want detailed per-iteration tracking
- ✅ You want auto-commits after each pass

### Use `run-overnight.ps1` when:
- ✅ You want a quick analysis (< 1 minute)
- ✅ You want reports to review manually
- ✅ You want to see what *could* be fixed
- ✅ You want to decide what to apply

---

## 📊 OPTIMIZATION TYPES

### CSS Optimization
- Remove duplicate properties
- Strip comments (preserves licenses)
- Combine duplicate selectors
- Remove extra whitespace
- Normalize line endings

### JavaScript Optimization
- Comment out console.log statements
- Disable debugger statements
- Remove trailing whitespace
- Extract TODO comments to issues

### HTML Optimization
- Add missing alt tags
- Fix empty href attributes
- Add trailing slashes to self-closing tags
- Validate liquid syntax
- Fix accessibility issues

### Performance
- Track file size changes
- Monitor bundle sizes
- Measure optimization impact
- Generate performance reports

---

## ⚙️ CONFIGURATION

### Deep Overnight Settings
```powershell
# In scripts/deep-overnight.ps1
$MaxHours = 8           # Maximum hours to run
$IterationDelay = 300   # Seconds between passes (5 minutes)
```

### What Gets Committed
- All CSS changes
- All JavaScript changes
- All HTML fixes
- New directories created
- Configuration files (.editorconfig)

### What Doesn't Get Changed
- Minified files (*.min.js, *.min.css)
- License headers in CSS
- Liquid template syntax
- Image files (requires external tools)

---

## 🚀 RECOMMENDED WORKFLOW

### Before Bed
```powershell
# Start the deep optimizer
cd C:\web-dev\github-repos\Tillerstead.com
.\scripts\deep-overnight.ps1

# It will run for 8 hours, auto-committing
```

### Next Morning
```powershell
# Review what happened
cat optimization-reports\iterations\iteration-*.md

# Push all commits to GitHub
git push origin main

# Check the live site
start https://tillerstead.com
```

---

## 📈 TRACKING PROGRESS

### Iteration Reports
Each iteration creates a report:
```
optimization-reports/iterations/
  ├── iteration-1.md
  ├── iteration-2.md
  ├── iteration-3.md
  └── ...
```

### Metrics Tracked
- Optimizations applied per file
- CSS size changes (bytes)
- JavaScript size changes
- HTML fixes count
- Cumulative totals
- Performance deltas

---

## 🔒 SAFETY FEATURES

### Auto-Backup
- Every change is committed
- Easy to revert with `git reset`
- Each iteration is a checkpoint

### Non-Destructive
- Comments out code (doesn't delete)
- Adds attributes (doesn't remove)
- Creates files (doesn't delete)

### Validation
- Tests Jekyll build after changes
- Aborts if build fails
- Logs all errors

---

## 🐛 TROUBLESHOOTING

### "Regex error"
Fixed in latest version - update your scripts.

### "Cannot find path optimization-reports"
The directory is created automatically now.

### "Build failed"
Check `optimization-reports/build-output.log` for details.

### "Push failed"
Normal if no commits were made. Check git status.

---

## 📚 FILES OVERVIEW

```
scripts/
  ├── deep-overnight.ps1        ← Main optimizer (hours)
  ├── run-overnight.ps1         ← Quick analyzer (minutes)
  ├── overnight-optimization.ps1 ← Analysis engine
  └── apply-fixes.ps1           ← Fix applicator

optimization-reports/
  ├── iterations/               ← Per-iteration reports
  ├── MASTER-REPORT.md          ← Summary
  ├── css-analysis.json         ← CSS metrics
  ├── js-analysis.json          ← JS metrics
  └── html-validation.json      ← HTML issues

COMPONENT-INVENTORY.md          ← File structure map
OPTIMIZATION-CHECKLIST.md       ← Action items
RECOMMENDATIONS.md              ← Improvement ideas
```

---

## 🎓 EXAMPLES

### Run for 2 hours, aggressive mode
```powershell
.\scripts\deep-overnight.ps1 -MaxHours 2 -Aggressive
```

### Test mode (no commits)
```powershell
.\scripts\deep-overnight.ps1 -MaxHours 1 -SkipCommits
```

### Quick pass every minute (fast testing)
```powershell
.\scripts\deep-overnight.ps1 -MaxHours 0.5 -IterationDelay 60
```

---

**Let it run overnight, wake up to a better codebase!** 🌙✨
