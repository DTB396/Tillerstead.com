# CI/CD Quick Start

## For Developers

### Before Every Commit

```bash
npm run validate        # Validate everything
npm run fix:encoding   # Auto-fix any encoding issues
npm run build          # Test build locally
git add .
git commit -m "your message"
git push
```

### If Something Breaks

```bash
npm run validate       # Identify the issue
npm run fix:encoding  # Try auto-fixing
npm run build         # Test again
```

---

## What Gets Checked

✅ UTF-8 encoding (no BOM)
✅ YAML syntax (spaces, no tabs)
✅ Liquid templates (valid operators)
✅ JavaScript code (ESLint)
✅ CSS/SCSS code (stylelint)
✅ HTML structure (HTMLHint)
✅ Critical files exist
✅ Site builds successfully

---

## GitHub Actions

When you push to `main`:

1. Validation runs automatically
2. Site builds automatically
3. Tests run automatically
4. If all pass → **deploys automatically**

Time: ~2-3 minutes

---

## Common Commands

```bash
npm run validate              # Full validation
npm run fix:encoding         # Auto-fix encoding
npm run lint                 # Check code quality
npm run build                # Build site
npm run build:full          # Full clean build
npm test                     # Run tests
npm run verify              # Lint + build + test (full check)
```

---

## Encoding Issues?

The most common issue is files saved with UTF-8 BOM. Fix it:

```bash
npm run fix:encoding
```

This automatically:

- Removes UTF-8 BOM
- Fixes YAML tabs
- Fixes Liquid operators (`gt` → `>`)
- Normalizes line endings

---

## Need Help?

1. **See what's failing:** `npm run validate`
2. **Try to fix automatically:** `npm run fix:encoding`
3. **Test locally:** `npm run build`
4. **Check GitHub Actions logs** for details if push fails
5. **Read:** `docs/CI_CD_GUIDE.md` for detailed info

---

## That's It!

You have a production-ready CI/CD system that handles most issues automatically. Push with confidence! 🚀

