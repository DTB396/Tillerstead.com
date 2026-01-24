# Netlify Setup Guide for Tillerstead.com

## 🚀 Initial Setup (Do This First)

### Step 1: Connect GitHub Repository

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select the **`Tillerstead.com`** repository

### Step 2: Configure Build Settings

**CRITICAL:** Use these exact settings:

```
Base directory:     (leave empty)
Build command:      bundle exec jekyll build
Publish directory:  _site
```

**Environment Variables to Add:**
- Click **"Show advanced"** → **"New variable"**
- Add these:

```
RUBY_VERSION = 3.4.0
JEKYLL_ENV = production
```

### Step 3: Deploy

1. Click **"Deploy site"**
2. Netlify will assign a random URL like `random-name-123456.netlify.app`
3. Wait 2-3 minutes for first build to complete
4. Check build logs if errors occur

---

## 🌐 Custom Domain Setup

### Step 4: Add tillerstead.com Domain

1. In Netlify dashboard, go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter: `tillerstead.com`
4. Click **"Verify"** → **"Add domain"**

### Step 5: Configure DNS

**Option A: Netlify DNS (RECOMMENDED - Easiest)**
1. Netlify will offer to manage DNS - click **"Set up Netlify DNS"**
2. Follow wizard to get nameservers (usually 4 nameservers)
3. Go to your domain registrar (GoDaddy, Namecheap, etc.)
4. Update nameservers to Netlify's nameservers
5. Wait 24-48 hours for DNS propagation

**Option B: External DNS (if you want to keep current DNS provider)**
1. In your DNS provider, add these records:

```
Type    Name    Value
A       @       75.2.60.5
CNAME   www     your-site-name.netlify.app
```

2. In Netlify, click **"Verify DNS configuration"**

### Step 6: Enable HTTPS

1. Once domain is verified, go to **Domain settings** → **HTTPS**
2. Click **"Verify DNS configuration"**
3. Click **"Provision certificate"** (free Let's Encrypt SSL)
4. Wait 1-2 minutes for certificate activation
5. Enable **"Force HTTPS"** toggle

---

## ✅ Verify Deployment

### Step 7: Test Your Site

**Homepage:**
- Visit https://tillerstead.com
- Should load WITHOUT 404 error
- Check console for errors (F12)

**Test Redirects:**
```
https://tillerstead.com/contact.html  →  should redirect to /contact/
https://tillerstead.com/build/nj-codes-permits  →  should redirect to /build/
https://tillerstead.com/not-a-real-page  →  should show custom 404 page
```

**Check Build Output:**
1. In Netlify dashboard, click **"Deploys"**
2. Click latest deploy → **"Deploy log"**
3. Verify you see:
```
✓ _redirects file found
✓ Processing 13 redirect rules
✓ Jekyll build successful
```

---

## 🔧 Advanced Configuration

### Automatic Deploys (Already Active)

Netlify automatically deploys when you push to `main` branch:
```bash
git add .
git commit -m "Your changes"
git push origin main
# Netlify builds & deploys automatically in ~2 minutes
```

### Deploy Previews (Branch Deploys)

1. Go to **Site settings** → **Build & deploy** → **Continuous deployment**
2. Under **"Deploy previews"**, select:
   - ✅ **"Any pull request against your production branch"**
3. Now every PR gets a preview URL to test before merging

### Build Notifications

1. Go to **Site settings** → **Build & deploy** → **Deploy notifications**
2. Add notifications for:
   - ✅ Deploy started
   - ✅ Deploy succeeded  
   - ✅ Deploy failed
3. Choose Email, Slack, or webhook

---

## 🐛 Troubleshooting

### Build Fails with Ruby Errors
**Fix:** Add `RUBY_VERSION=3.4.0` environment variable (see Step 2)

### 404 on Homepage
**Fix:** Check `_redirects` file is in `_site/` directory
```bash
bundle exec jekyll build
ls _site/_redirects  # Should exist
```

### Redirects Not Working
**Fix:** Ensure `netlify.toml` is in root directory (already done ✓)

### Build Takes Too Long (>5 minutes)
**Fix:** Jekyll cache issue
1. In Netlify dashboard → **Deploys**
2. Click **"Trigger deploy"** → **"Clear cache and deploy"**

### SSL Certificate Won't Provision
**Fix:** DNS propagation incomplete
- Wait 24-48 hours after changing nameservers
- Verify DNS with: https://www.whatsmydns.net (enter tillerstead.com)

---

## 📊 Monitoring & Analytics

### Netlify Analytics (Optional - Paid)
- Server-side analytics (no cookies, GDPR-friendly)
- Cost: $9/month
- Enable in **Site settings** → **Analytics**

### Build Minutes
- Free tier: 300 minutes/month
- Your builds: ~2-3 minutes each
- ~100-150 deploys/month on free tier

---

## 🎯 Next Steps After Setup

1. ✅ Verify tillerstead.com loads correctly
2. ✅ Test all redirect rules
3. ✅ Enable HTTPS and force redirect
4. Set up deploy notifications
5. Configure deploy previews for PRs
6. Add Netlify badge to README:
```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)
```

---

## 🆘 Need Help?

**Netlify Support:**
- Docs: https://docs.netlify.com
- Community: https://answers.netlify.com
- Status: https://www.netlifystatus.com

**Common Issues:**
- Build logs: https://app.netlify.com/sites/YOUR-SITE/deploys
- DNS checker: https://www.whatsmydns.net
- SSL checker: https://www.ssllabs.com/ssltest/

**Your Config Files (Already Set Up):**
- ✅ `netlify.toml` - Build settings & redirects
- ✅ `_redirects` - 13 redirect rules
- ✅ `_config.yml` - Jekyll configuration
- ✅ `.ruby-version` - Ruby version lock (if needed)

---

**All configuration files are ready! Just follow Steps 1-6 above.** 🚀
