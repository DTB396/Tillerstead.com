# Tillerstead Cleanup & Modernization Checklist

## 1. Remove Remote Theme (done)
- [x] Remove `remote_theme` from _config.yml

## 2. Use Custom Layouts
- [x] Ensure _layouts/default.html and others are fully custom and include {{ content }}

## 3. Modular Includes
- [x] Use _includes/sections for homepage and other modular content

## 4. Modern SCSS Structure
- [x] Organize _sass as described in style-system.md
- [x] Use root-vars.css for tokens

## 5. Asset Pipeline
- [ ] Ensure all images, CSS, and JS are in assets/ and referenced with relative_url

## 6. Accessibility & SEO
- [ ] Use semantic HTML, alt text, and meta tags
- [ ] Add aria-labels and roles where needed

## 7. Performance
- [ ] Optimize images and minify CSS/JS

## 8. Testing
- [ ] Use Playwright or similar for end-to-end checks

## 9. Deployment
- [x] Use GitHub Actions to build from main and deploy to gh-pages

---

For any unchecked item, request a specific implementation or audit!
