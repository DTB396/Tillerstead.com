# Netlify PowerShell Automation Quick Reference

## 🔐 Setup (One Time)

### 1. Get Your Netlify API Token
1. Go to https://app.netlify.com/user/applications#personal-access-tokens
2. Click "New access token"
3. Name it: "Tillerstead PowerShell Automation"
4. Copy the token (you'll only see it once!)

### 2. Configure Environment Variables
```powershell
# Copy template
Copy-Item .env.example .env

# Edit .env and add:
NETLIFY_AUTH_TOKEN=your_actual_token_here
NETLIFY_SITE_ID=your_site_id_here  # Get this after connecting GitHub
NETLIFY_DOMAIN=tillerstead.com
```

**⚠️ NEVER commit .env to git! It's already in .gitignore.**

---

## 🚀 Usage

### Show All Your Netlify Sites
```powershell
.\scripts\Configure-Netlify.ps1 -ShowStatus
```
**Use this to find your Site ID!**

### Enable Everything (Recommended First Run)
```powershell
.\scripts\Configure-Netlify.ps1 -EnableAllFeatures
```
**Enables:**
- ✅ Jekyll build settings
- ✅ Force HTTPS
- ✅ Asset optimization (CSS/JS/Images)
- ✅ Pretty URLs
- ✅ Form submissions

### Individual Commands

**Update Build Settings:**
```powershell
.\scripts\Configure-Netlify.ps1 -UpdateBuildSettings
```
Sets: `bundle exec jekyll build` → `_site`

**Enable Forms:**
```powershell
.\scripts\Configure-Netlify.ps1 -EnableForms
```
Then add `data-netlify="true"` to your HTML forms

**Configure Custom Domain:**
```powershell
.\scripts\Configure-Netlify.ps1 -ConfigureDomain
```
Uses domain from .env file

---

## 📋 Complete Workflow

### First Time Setup
1. ✅ Sign up at Netlify
2. ✅ Get API token
3. ✅ Create .env file
4. ✅ Connect GitHub repo in Netlify UI
5. ✅ Get Site ID from dashboard
6. ✅ Add Site ID to .env
7. Run: `.\scripts\Configure-Netlify.ps1 -EnableAllFeatures`

### Regular Use
```powershell
# Check status
.\scripts\Configure-Netlify.ps1 -ShowStatus

# Deploy (git push triggers automatic build)
git add .
git commit -m "Your changes"
git push origin main
# Netlify auto-deploys!
```

---

## 🔍 What Gets Configured

### Build Settings
```
Command:    bundle exec jekyll build
Publish:    _site
Ruby:       3.4.0
Node:       20
Jekyll:     production mode
```

### Optimizations
- **CSS**: Bundled & minified
- **JavaScript**: Bundled & minified  
- **Images**: Compressed
- **HTML**: Pretty URLs (no .html extensions)

### Security
- **HTTPS**: Forced on all pages
- **Forms**: Spam filtering enabled
- **Headers**: Security headers in netlify.toml

---

## ⚠️ Troubleshooting

### "NETLIFY_AUTH_TOKEN not set"
- Check .env file exists in project root
- Verify token is not still set to `your_netlify_auth_token_here`
- Token must be from: https://app.netlify.com/user/applications

### "NETLIFY_SITE_ID required"
- Run `-ShowStatus` to find your Site ID
- Copy the ID from your site
- Add to .env: `NETLIFY_SITE_ID=abc123...`

### API Errors
- Check token hasn't expired
- Verify token has correct permissions
- Try regenerating token in Netlify dashboard

---

## 🆘 Manual Alternative

If PowerShell automation doesn't work, configure manually:

1. **Site Settings** → **Build & deploy** → **Build settings**
   - Build command: `bundle exec jekyll build`
   - Publish directory: `_site`

2. **Site Settings** → **Build & deploy** → **Environment**
   - Add: `RUBY_VERSION = 3.4.0`
   - Add: `JEKYLL_ENV = production`

3. **Site Settings** → **Domain management**
   - Add custom domain: `tillerstead.com`
   - Set up DNS

4. **Site Settings** → **Build & deploy** → **Post processing**
   - Enable: Asset optimization
   - Enable: Pretty URLs
   - Enable: Form detection

---

## 📚 Resources

- **Netlify API Docs**: https://docs.netlify.com/api/get-started/
- **CLI Alternative**: `npm install -g netlify-cli` (if you prefer CLI)
- **Netlify Forms**: https://docs.netlify.com/forms/setup/
- **Environment Variables**: https://docs.netlify.com/configure-builds/environment-variables/

---

**Your files are protected!**
- ✅ `.env` in .gitignore (secrets never committed)
- ✅ `.env.example` committed (safe template)
- ✅ `Configure-Netlify.ps1` committed (automation tool)
