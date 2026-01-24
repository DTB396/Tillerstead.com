# Migration Guide: Netlify → GitHub Pages + Railway

## Overview
This guide covers migrating Tillerstead.com from Netlify to:
- **GitHub Pages** (static site hosting - 100% FREE, unlimited)
- **Railway** (FastAPI backend hosting)

## Part 1: GitHub Pages Setup

### 1. Enable GitHub Pages
1. Go to your repo: `https://github.com/YOUR_USERNAME/Tillerstead.com`
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The workflow `.github/workflows/deploy-gh-pages.yml` will handle deployments

### 2. Configure Custom Domain (tillerstead.com)
1. In GitHub Pages settings, add your custom domain: `tillerstead.com`
2. Enable **Enforce HTTPS**
3. Update DNS records at your domain registrar:
   ```
   Type  Name  Value
   A     @     185.199.108.153
   A     @     185.199.109.153
   A     @     185.199.110.153
   A     @     185.199.111.153
   CNAME www   YOUR_USERNAME.github.io
   ```

### 3. Update _config.yml
The site is already configured for GitHub Pages with:
- `url: "https://tillerstead.com"`
- `baseurl: ""`
- Jekyll plugins compatible with GitHub Pages

### 4. Deploy
Simply push to the `main` branch:
```powershell
git add .
git commit -m "Migrate to GitHub Pages"
git push origin main
```

The GitHub Action will automatically build and deploy your site.

## Part 2: Railway Backend Setup

### 1. Sign Up for Railway
1. Go to https://railway.app
2. Sign in with GitHub
3. You get **$5 free credit/month** (enough for small APIs)

### 2. Create New Project
1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose `Tillerstead.com` repository
4. Railway will detect the FastAPI app automatically

### 3. Configure Root Directory
Since the backend is in `tillerstead-toolkit/backend`:
1. In Railway dashboard, go to **Settings**
2. Set **Root Directory**: `tillerstead-toolkit/backend`
3. Railway will use the `railway.json` config automatically

### 4. Add Environment Variables
In Railway dashboard → **Variables**, add:
```
DATABASE_URL=<Railway will provide if you add PostgreSQL service>
SECRET_KEY=<generate with: openssl rand -hex 32>
REDIS_URL=<Add Redis service or external provider>
ALLOWED_ORIGINS=https://tillerstead.com,https://www.tillerstead.com
```

### 5. Add Database (Optional)
If you need PostgreSQL:
1. Click **New** → **Database** → **PostgreSQL**
2. Railway auto-generates `DATABASE_URL`
3. Backend will use it automatically

### 6. Deploy
Railway deploys automatically on push to `main`. You'll get a URL like:
```
https://tillerstead-production.up.railway.app
```

### 7. Add Custom Domain (Optional)
1. In Railway → **Settings** → **Domains**
2. Add custom domain: `api.tillerstead.com`
3. Add CNAME record to DNS:
   ```
   CNAME  api  tillerstead-production.up.railway.app
   ```

## Part 3: Update Frontend API Calls

### Update API Configuration
The file `assets/js/api-config.js` has been created with centralized config.

After deploying to Railway, update the production URL:
```javascript
const API_CONFIG = {
  baseUrl: 'https://tillerstead-production.up.railway.app',
  // or with custom domain:
  // baseUrl: 'https://api.tillerstead.com',
  ...
};
```

### In HTML files that use the API
Include the config script:
```html
<script src="/assets/js/api-config.js"></script>
<script>
  // Use API_CONFIG.getUrl('calculators') instead of hardcoded URLs
  fetch(API_CONFIG.getUrl('calculators'))
    .then(response => response.json())
    .then(data => console.log(data));
</script>
```

## Part 4: Migration Checklist

### Before Migration
- [ ] Backup current Netlify deployment
- [ ] Test local build: `npm run build:site`
- [ ] Export any Netlify form submissions
- [ ] Note any Netlify environment variables

### GitHub Pages Migration
- [ ] Enable GitHub Pages in repo settings
- [ ] Configure custom domain
- [ ] Update DNS records
- [ ] Wait for DNS propagation (can take 24-48 hours)
- [ ] Verify HTTPS certificate
- [ ] Test site at tillerstead.com

### Railway Migration
- [ ] Create Railway account
- [ ] Deploy backend from GitHub
- [ ] Configure environment variables
- [ ] Add database service if needed
- [ ] Test API endpoints
- [ ] Update frontend API URLs
- [ ] Configure custom domain (optional)

### Post-Migration
- [ ] Monitor GitHub Actions builds
- [ ] Monitor Railway logs
- [ ] Test all forms and interactive features
- [ ] Update any external services pointing to old URLs
- [ ] Keep Netlify site for 30 days as backup
- [ ] Update documentation and README

## Cost Comparison

| Service | Netlify | GitHub Pages + Railway |
|---------|---------|------------------------|
| Static hosting | $0 (300 build min) | $0 (unlimited) |
| Build minutes | 300/month | Unlimited |
| Backend API | $25+/month | $5 credit/month |
| Database | Extra cost | Included in Railway |
| Bandwidth | 100GB/month | Unlimited (GH Pages) |
| **Total** | $0-25+/month | $0-5/month |

## Rollback Plan

If issues arise:
1. GitHub Pages: Update DNS back to Netlify
2. Railway: Keep running, update CORS to allow Netlify domain
3. Revert is just DNS changes - no code changes needed

## Support Resources

- **GitHub Pages**: https://docs.github.com/en/pages
- **Railway Docs**: https://docs.railway.app
- **Jekyll Deployment**: https://jekyllrb.com/docs/deployment/
- **Custom Domains**: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## Notes

- GitHub Pages builds are slower than Netlify (3-5 minutes vs 1-2 minutes)
- Railway free tier has usage limits - monitor in dashboard
- Both services support automatic deployments on git push
- HTTPS is automatic for both services
- Forms will need alternative solution (Formspree, Google Forms, or Railway endpoint)
