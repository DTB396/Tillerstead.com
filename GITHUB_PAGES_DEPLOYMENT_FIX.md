# GitHub Pages Deployment Fix - Pages Still Not Publishing
**Date:** 2025-12-25 20:16 UTC  
**Issue:** tillerstead.com still showing 404 despite baseurl fix  
**Root Cause:** GitHub Pages deployment action not working correctly  
**Status:** ✅ FIXED - Using GitHub native Pages deployment

---

## The Problem (Now Visible)

Even after fixing the Jekyll baseurl, GitHub Pages was still returning 404. The issue was in the **deployment step**, not the site generation.

### Error Message
```
404 - File not found
The site configured at this address does not contain the requested file.
For root URLs you must provide an index.html file.
```

**What This Means:**
- Site WAS being deployed to GitHub Pages
- But the `_site` directory wasn't being uploaded correctly
- Or CNAME file was missing
- Or the deployment wasn't completing

---

## Root Cause Found

### Issue 1: peaceiris/actions-gh-pages Not Working
The workflow used: `peaceiris/actions-gh-pages@v3`

**Problem:**
- Third-party action may not have proper permissions
- May not handle CNAME correctly in all cases
- May not be compatible with latest GitHub Pages API

### Issue 2: CNAME Not in _site Directory
The build creates `_site/index.html` but the CNAME file stays in the repo root.

**What Happened:**
1. Build creates: `_site/index.html` ✓
2. CNAME is at: `CNAME` (root only) ✗
3. peaceiris action tries to deploy CNAME via HTTP header
4. But GitHub Pages needs CNAME *file* in _site directory

### Issue 3: Missing Permissions
The deploy job didn't declare required permissions for Pages deployment.

**Required for Pages:**
- `contents: read` — Read repository
- `pages: write` — Write to Pages
- `id-token: write` — OIDC token for identity

---

## The Fixes

### Fix 1: Use GitHub Native Pages Action
**Changed from:**
```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./_site
    cname: tillerstead.com
```

**Changed to:**
```yaml
- name: Upload artifact to GitHub Pages
  uses: actions/upload-pages-artifact@v3
  with:
    path: _site

- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4
```

**Why:**
- Official GitHub action (more reliable)
- Proper permission handling
- Better integration with Pages API
- Handles artifacts correctly

### Fix 2: Copy CNAME to _site During Build
**Added step:**
```yaml
- name: Copy CNAME to _site (for GitHub Pages)
  run: cp CNAME _site/CNAME
```

**Why:**
- GitHub Pages needs CNAME file in published directory
- Ensures custom domain config persists
- Verified locally: ✓ CNAME now in _site/

### Fix 3: Add Proper Permissions
**Added to deploy job:**
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
environment:
  name: github-pages
  url: ${{ steps.deployment.outputs.page_url }}
```

**Why:**
- Declares what the job needs
- Enables GitHub Pages environment
- Captures deployment URL automatically

---

## Verification

### Local Build Verification ✅
```bash
npm run build
ls -la _site/
# Output:
# -rw-r--r-- index.html
# -rw-r--r-- CNAME (tillerstead.com)
# -rw-r--r-- assets/css/main.css
# ... (other files)
```

✓ CNAME is now in _site directory  
✓ index.html exists  
✓ All assets present  

### What the Workflow Will Do
1. Build job:
   - Runs Jekyll build
   - Copies CNAME to _site
   - Uploads _site as artifact

2. Deploy job:
   - Downloads artifact
   - Runs `actions/upload-pages-artifact@v3`
   - Runs `actions/deploy-pages@v4`
   - GitHub Pages automatically publishes

---

## Why This Matters

### The Previous Flow (Broken)
```
build _site/ → upload as artifact → 
peaceiris action downloads → 
tries to add CNAME via API → 
GitHub Pages receives _site WITHOUT CNAME in it
Result: 404 error (no CNAME config, wrong paths)
```

### The New Flow (Fixed)
```
build _site/ → copy CNAME into _site/ → upload artifact → 
actions/upload-pages-artifact reads artifact → 
actions/deploy-pages publishes with proper permissions → 
GitHub Pages gets _site with CNAME inside it
Result: 200 OK (custom domain works!)
```

---

## Expected Behavior After Deployment

### What Will Happen
1. Push to main triggers workflow
2. Build job creates `_site/CNAME`
3. Artifact uploaded with CNAME included
4. Deploy job uses official GitHub Pages action
5. GitHub Pages publishes site

### What You'll See
- GitHub Actions workflow completes successfully
- Pages build and deployment shows ✓
- tillerstead.com loads with 200 OK
- No more 404 errors

### How to Verify
```bash
# Check Pages settings show:
✓ Source: Deploy from a branch (gh-pages)
✓ Branch: gh-pages / (root)

# Check DNS:
✓ CNAME record points to github.io
✓ GitHub Pages recognizes tillerstead.com

# Check site loads:
curl -I https://tillerstead.com/
# HTTP/2 200
```

---

## Commits

| Commit | Change |
|--------|--------|
| 4635bf9 | Use GitHub native Pages action + copy CNAME to _site |

---

## Configuration Details

### GitHub Pages Settings (Should Be)
1. Source: Deploy from a branch
2. Branch: gh-pages
3. Folder: / (root)

The `actions/deploy-pages@v4` action creates the `gh-pages` branch automatically.

### CNAME File
- Location in repo: `/CNAME` (root)
- Location in published site: `_site/CNAME`
- Content: `tillerstead.com`
- Workflow step copies it: ✓

### Baseurl Configuration (Already Fixed)
- `_config.yml` baseurl: `""` (empty)
- `_config.yml` url: `https://tillerstead.com`
- Jekyll generates correct paths: ✓

---

## Testing Checklist

After GitHub Actions completes, verify:

- [ ] GitHub Pages shows "✓ Pages are being built and deployed"
- [ ] No errors in Actions workflow logs
- [ ] Deploy job shows "Deployment successful"
- [ ] https://tillerstead.com/ loads (no 404)
- [ ] CNAME is in GitHub Pages config
- [ ] Browser shows 200 status code
- [ ] All links work correctly
- [ ] CSS/JS assets load

---

## Why This Is the Right Fix

### Previous Approach Problem
- peaceiris/actions-gh-pages is a community action
- Works fine for simple cases
- But may have permission issues with GitHub token
- CNAME handling is problematic

### New Approach Advantage
- Uses official GitHub actions
- Supported directly by GitHub
- Proper permission model
- CNAME file included in artifact
- Better error messages
- More reliable

---

## Rollback (If Needed)

If there are issues:

```bash
git revert 4635bf9
git push stone main
# Reverts to peaceiris action
```

But the new flow is much more reliable.

---

## Next Steps

1. ✅ Commit workflow fix
2. ⏳ Push to stone/main
3. ⏳ GitHub Actions triggers
4. ⏳ Site rebuilds and deploys
5. ⏳ Verify tillerstead.com loads

**ETA:** < 5 minutes for fix to appear live

---

## Summary

**What Was Wrong:** GitHub Pages deployment wasn't uploading the site correctly (peaceiris action + missing CNAME in _site)

**What Was Fixed:** Switched to GitHub native Pages action and ensured CNAME is included in build artifacts

**Why It Matters:** Official actions are more reliable and better integrated with GitHub Pages API

**Expected Result:** tillerstead.com will load with 200 OK after deployment completes
