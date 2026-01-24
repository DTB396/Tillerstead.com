# Deployment Optimization: Tillerstead.com (GitHub Pages)

## 1. Use GitHub Actions for CI/CD
- Ensure `.github/workflows/gh-pages.yml` exists for automated builds.
- Use Jekyll’s default build or custom build if you have plugins.

## 2. Keep `_config.yml` GitHub Pages compatible
- Avoid unsupported plugins.
- Use `remote_theme` if needed.

## 3. Asset Optimization
- Minify CSS/JS before commit (use npm scripts or GitHub Actions).
- Use compressed images (WebP, optimized PNG/JPG).

## 4. Custom Domain
- Set `CNAME` file and configure DNS for tillerstead.com.

## 5. Test Locally
- Run `bundle exec jekyll serve` before pushing.

---

# Deployment Optimization: BarberX.info (Netlify)

## 1. Use Netlify Build Settings
- Set build command: `npm run build` or `python app.py` (for Flask).
- Set publish directory: `dist/` or `build/` (for static), or root for Flask.

## 2. Environment Variables
- Store API keys, secrets, and config in Netlify dashboard.

## 3. Netlify Functions
- Use for serverless endpoints (AI chat, PDF processing, etc.).

## 4. Redirects & Headers
- Use `_redirects` and `_headers` files for SPA routing, security, and caching.

## 5. Asset Optimization
- Enable Netlify’s asset optimization (minification, image compression).

## 6. Branch Deploys & Previews
- Use Netlify’s branch deploys for staging/testing.

---

**Summary:**
- Tillerstead.com: Keep it simple, static, and GitHub Pages compatible.
- BarberX.info: Use Netlify’s advanced features for dynamic, premium, or serverless needs.
