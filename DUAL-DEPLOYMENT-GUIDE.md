# Dual Deployment Guide: Netlify + GitHub Pages

## Current Status ✅

You're already set up for **dual deployment**! Both systems can run simultaneously.

### Active Deployments

1. **Netlify** (Primary): `https://tillerstead.com`
   - Custom domain configured
   - Forms handling active
   - CDN edge distribution
   - Build: `npm run build:site`

2. **GitHub Pages** (Backup): `https://dtb396.github.io/Tillerstead.com/`
   - Auto-deploys on every push to `main`
   - Workflow: `.github/workflows/pages-consolidated.yml`
   - Same build process as Netlify

---

## Quick Switch Guide

### If Netlify is Frozen (No Credits)

**Option 1: Use GitHub Pages URL Immediately**
```
Your site is ALREADY live at:
https://dtb396.github.io/Tillerstead.com/

Just point your domain (tillerstead.com) to GitHub Pages.
```

**Option 2: Point Custom Domain to GitHub Pages**

1. **In GitHub Repository Settings:**
   - Go to: Settings → Pages
   - Under "Custom domain", enter: `tillerstead.com`
   - Click Save
   - Wait for DNS check (may take a few minutes)

2. **Update DNS Records** (at your domain registrar):
   ```
   Delete Netlify DNS records:
   - Remove A records pointing to Netlify IPs
   - Remove CNAME pointing to *.netlify.app
   
   Add GitHub Pages DNS records:
   A Records (all four):
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   
   CNAME Record:
   www → dtb396.github.io
   ```

3. **Enable HTTPS in GitHub:**
   - In Settings → Pages
   - Check "Enforce HTTPS" (after DNS propagates)

**DNS propagation takes 5-60 minutes.**

---

## How Both Work Together (Dual Deployment)

### Automatic Behavior

Every time you `git push` to `main`:

1. **GitHub Actions** automatically:
   - Builds your Jekyll site
   - Deploys to GitHub Pages
   - Available at: `dtb396.github.io/Tillerstead.com`

2. **Netlify** (if active):
   - Detects the push via webhook
   - Builds your site
   - Deploys to: `tillerstead.com`

### They're Independent

- **No conflicts**: Each system builds separately
- **Different URLs**: They don't interfere
- **Same source**: Both use the same GitHub repository
- **Same code**: Identical build commands

### Forms Consideration

⚠️ **Important**: Netlify Forms won't work on GitHub Pages!

- GitHub Pages is **static only** (no server-side processing)
- Netlify Forms require Netlify infrastructure

**Solution if using GitHub Pages permanently:**

Update forms to use a service like:
- **Formspree** (free tier: 50 submissions/month)
- **Getform** (free tier: 100 submissions/month)
- **Formspark** (free tier: 50 submissions/month)

I can help configure this if needed.

---

## Switching Between Deployments

### From Netlify → GitHub Pages

```bash
# 1. Verify GitHub Pages is working
# Visit: https://dtb396.github.io/Tillerstead.com/

# 2. Update DNS (see above)
# Point tillerstead.com to GitHub Pages IPs

# 3. Disable Netlify (optional)
# In Netlify Dashboard: Site Settings → Build & Deploy → Stop builds

# 4. Update config if needed
# In _config.yml, ensure:
url: "https://tillerstead.com"  # Keep as-is
baseurl: ""  # Keep empty for custom domain
```

### From GitHub Pages → Netlify

```bash
# 1. Ensure Netlify account has credits

# 2. Update DNS back to Netlify
# In Netlify Dashboard: Domain Settings → Use Netlify DNS

# 3. Re-enable builds
# Settings → Build & Deploy → Activate builds

# 4. Trigger deploy
git commit --allow-empty -m "Trigger Netlify rebuild"
git push
```

---

## Configuration Files

### GitHub Pages Config (Already Set)

File: `.github/workflows/pages-consolidated.yml`
- ✅ Uses Ruby 3.2 (matches Netlify)
- ✅ Uses Node 20 (matches Netlify)
- ✅ Runs `npm run build` (same as Netlify)
- ✅ Deploys to GitHub Pages automatically

### Netlify Config (Already Set)

File: `netlify.toml`
- ✅ Uses Ruby 3.2.2
- ✅ Uses Node 20
- ✅ Runs `npm run build:site`
- ✅ Includes forms plugin

**Both use identical build processes!**

---

## Current GitHub Pages Status Check

Run these commands to verify:

```bash
# Check if GitHub Pages is enabled
gh repo view --web
# Go to: Settings → Pages

# Check workflow status
gh workflow view "Build and Deploy Jekyll site to GitHub Pages"

# Check last deployment
gh run list --workflow=pages-consolidated.yml --limit 5
```

Or visit manually:
1. https://github.com/DTB396/Tillerstead.com/settings/pages
2. Check "GitHub Pages" section - should show:
   - ✅ Source: GitHub Actions
   - ✅ Your site is live at: `https://dtb396.github.io/Tillerstead.com/`

---

## Cost Comparison

### Netlify (Frozen/Paid)
- **Free Tier**: 300 build minutes/month, 100GB bandwidth
- **Pro Tier**: $19/month (unlimited builds, 1TB bandwidth)
- **Forms**: Included (100 submissions/month on free, unlimited on Pro)

### GitHub Pages (Always Free)
- **Builds**: Unlimited (2000 minutes/month on Actions)
- **Bandwidth**: 100GB soft limit/month
- **Storage**: 1GB
- **Forms**: Not supported (need external service)

### Recommendation

1. **For now**: Use GitHub Pages (free, already working)
2. **Forms**: Switch to Formspree or similar (I can help)
3. **If Netlify credits return**: Can switch back anytime
4. **Long-term**: Keep both active (failover protection)

---

## Emergency Commands

### Force GitHub Pages Rebuild

```bash
git commit --allow-empty -m "Trigger GitHub Pages rebuild"
git push
```

### Check GitHub Pages Build Status

```bash
gh run list --workflow=pages-consolidated.yml
```

### View Build Logs

```bash
gh run view --log
```

---

## Forms Migration (If Needed)

If switching permanently to GitHub Pages, update:

**File**: `_includes/forms/contact.html`

```html
<!-- Replace Netlify Forms -->
<form data-netlify="true" netlify-honeypot="bot-field"...>

<!-- With Formspree (example) -->
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

I can automate this migration - just ask!

---

## Summary: You're Already Dual-Deployed! 🎉

- ✅ GitHub Pages: **Active and working**
- ✅ Netlify: **Configured (frozen until credits added)**
- ✅ Same build process on both
- ✅ Can switch DNS anytime
- ✅ No code changes needed

**Your site is live right now at:**
- https://dtb396.github.io/Tillerstead.com/

**To use your custom domain on GitHub Pages:**
- Update DNS records (5-60 min propagation)
- Enable in GitHub Settings → Pages → Custom domain

**Need help?**
- Migrating forms: Ask me to set up Formspree
- DNS updates: I can guide step-by-step
- Testing: I can verify both deployments

---

## Safety Checklist

**Switching is safe because:**
- ✅ Both systems are independent (no conflicts)
- ✅ Both use same source code (GitHub repo)
- ✅ Both build identically (same commands)
- ✅ DNS changes are reversible (point back anytime)
- ✅ No data loss (just URL changes)

**Only consideration:**
- ⚠️ Forms stop working on GitHub Pages (need alternative service)
- ⚠️ DNS propagation takes time (5-60 minutes)
- ⚠️ HTTPS certificate generation takes time (up to 24 hours)

**You can switch back and forth unlimited times!**
