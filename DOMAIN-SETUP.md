# Domain Setup Guide - tillerstead.com → xtx396.com
# Two options for handling your domain situation

## 🎯 RECOMMENDED: Use tillerstead.com as Primary Domain

This is the cleanest, most professional approach.

### Step 1: Deploy to Netlify with xtx396.com
```
1. Go to https://app.netlify.com
2. Import your GitHub repo
3. Deploy (you'll get: random-name-123.netlify.app)
```

### Step 2: Add BOTH Domains to Netlify
```
1. Site settings → Domain management
2. Add custom domain: tillerstead.com (PRIMARY)
3. Add custom domain: xtx396.com (SECONDARY)
4. Set tillerstead.com as primary domain
```

### Step 3: Configure DNS for tillerstead.com
**At your tillerstead.com registrar (GoDaddy, Namecheap, etc.):**

```dns
Type    Name    Value
A       @       75.2.60.5
CNAME   www     apex-loadbalancer.netlify.com
```

### Step 4: Configure DNS for xtx396.com
**At your xtx396.com registrar:**

```dns
Type    Name    Value
A       @       75.2.60.5
CNAME   www     apex-loadbalancer.netlify.com
```

### Step 5: Enable Redirects in Netlify
The netlify.toml file now includes:
- ✅ xtx396.com → tillerstead.com (301 permanent)
- ✅ www.xtx396.com → tillerstead.com (301 permanent)
- ✅ www.tillerstead.com → tillerstead.com (301 permanent)

**Result:**
- User types: `xtx396.com` → Browser shows: `tillerstead.com` ✅
- User types: `www.tillerstead.com` → Browser shows: `tillerstead.com` ✅
- All URLs canonicalize to: `https://tillerstead.com`

---

## 🔄 ALTERNATIVE: Domain Masking (NOT Recommended)

If you can't add tillerstead.com to Netlify, use domain masking at your registrar.

### Problems with this approach:
- ❌ SEO issues (duplicate content)
- ❌ HTTPS certificate problems
- ❌ Social media sharing breaks
- ❌ Analytics get confused
- ❌ Looks unprofessional

### If you must use masking:
1. Deploy to xtx396.com on Netlify
2. At tillerstead.com registrar:
   - Find "Domain Forwarding" or "URL Masking"
   - Set: Forward tillerstead.com → xtx396.com
   - Enable: "Mask URL" or "Frame Forwarding"
3. User types tillerstead.com → sees tillerstead.com but actually on xtx396.com

**Note:** This is a hack and will cause SEO/HTTPS issues.

---

## ✅ BEST PRACTICE: Recommended Setup

**Deploy to Netlify:**
1. ✅ Primary domain: tillerstead.com
2. ✅ Redirect: xtx396.com → tillerstead.com
3. ✅ HTTPS on both domains
4. ✅ 301 redirects preserve SEO

**DNS Configuration:**

**tillerstead.com (at your registrar):**
```
A       @       75.2.60.5
CNAME   www     apex-loadbalancer.netlify.com
```

**xtx396.com (at your registrar):**
```
A       @       75.2.60.5
CNAME   www     apex-loadbalancer.netlify.com
```

**Netlify Configuration:**
```
1. Add both domains to your Netlify site
2. Set tillerstead.com as primary
3. Enable "Force HTTPS" for both
4. Netlify automatically handles redirects via netlify.toml
```

**What happens:**
- xtx396.com → **301 redirect** → tillerstead.com ✅
- www.xtx396.com → **301 redirect** → tillerstead.com ✅
- www.tillerstead.com → **301 redirect** → tillerstead.com ✅
- tillerstead.com → **serves site** ✅

**Result:**
- Users always see: `https://tillerstead.com` in their browser
- Google indexes only: `https://tillerstead.com`
- All social shares use: `https://tillerstead.com`
- Clean, professional, SEO-friendly ✅

---

## 🚀 Quick Setup Commands

### Update your .env file:
```env
NETLIFY_DOMAIN=tillerstead.com
NETLIFY_SITE_DOMAIN=xtx396.com
```

### Test locally:
```powershell
bundle exec jekyll build
```

### Deploy:
```powershell
git add .
git commit -m "Add domain redirects: xtx396.com → tillerstead.com"
git push origin main
```

### After Netlify build completes:
1. Add tillerstead.com as custom domain
2. Add xtx396.com as custom domain  
3. Set tillerstead.com as primary
4. Configure DNS at both registrars
5. Wait 24-48 hours for DNS propagation
6. Provision SSL certificates
7. Test: visit xtx396.com → should redirect to tillerstead.com

---

## 🔍 Verification Checklist

After DNS propagates (24-48 hours):

- [ ] https://tillerstead.com loads correctly
- [ ] https://www.tillerstead.com redirects to https://tillerstead.com
- [ ] https://xtx396.com redirects to https://tillerstead.com
- [ ] https://www.xtx396.com redirects to https://tillerstead.com
- [ ] All URLs show green lock (HTTPS)
- [ ] Browser shows "tillerstead.com" in address bar
- [ ] No mixed content warnings

---

## 💡 Why This Approach?

**SEO Benefits:**
- Single canonical domain (tillerstead.com)
- No duplicate content penalties
- All backlinks consolidated to one domain

**User Experience:**
- Always see your brand (tillerstead.com)
- HTTPS everywhere
- Fast redirects (301 status)

**Technical Benefits:**
- Proper SSL certificates
- Works with analytics
- Social media shares correctly
- Password managers work
- No iframe issues

**This is how professional sites handle multiple domains!** 🎯
