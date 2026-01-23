# 🐺 Wolf Crest Logo - Quick Start

## 🚀 5-Minute Integration

### 1. Add Favicon Meta Tags
In `_layouts/default.html` or `_includes/head.html`:

```liquid
{% include icons/favicon-meta.html %}
```

### 2. Use Logo Component
In `_includes/header.html` or `_includes/navigation/main-nav.html`:

```liquid
<a href="/" class="logo-link" aria-label="Tillerstead Home">
  {% include components/logo-wolf-crest.html %}
</a>
```

### 3. Optional: Custom Class
Pass a custom class to the logo component:

```liquid
{% include components/logo-wolf-crest.html class="my-custom-class" %}
```

---

## 📂 File Locations

```
Logo Files:        assets/img/logo/logo-wolf-crest*.{png,webp}
Icon Files:        assets/icons/*.png
Favicon:           favicon.ico (root)
Manifest:          manifest.webmanifest (root)
Browser Config:    browserconfig.xml (root)
```

---

## 🎨 Usage Examples

### Example 1: Header Logo
```html
<header class="site-header">
  <div class="container">
    <a href="/" class="logo-link">
      {% include components/logo-wolf-crest.html %}
    </a>
    <nav>...</nav>
  </div>
</header>
```

### Example 2: Footer Logo
```html
<footer class="site-footer">
  <div class="footer-logo">
    {% include components/logo-wolf-crest.html class="footer-logo-img" %}
  </div>
</footer>
```

### Example 3: Manual Implementation
```html
<picture class="site-logo">
  <source media="(max-width: 640px)" 
          srcset="/assets/img/logo/logo-wolf-crest-compact.webp"
          type="image/webp">
  <img src="/assets/img/logo/logo-wolf-crest-header.png"
       alt="Tillerstead LLC - Where Craft Meets Accountability"
       width="400"
       height="120">
</picture>
```

---

## 🎯 Performance Tips

✅ **DO:**
- Use the include component (handles responsive + WebP)
- Add `loading="lazy"` for logos below the fold
- Specify width/height to prevent layout shift
- Use compact version for mobile

❌ **DON'T:**
- Use the 4k-logo.png directly (4.45 MB!)
- Resize logos with CSS (use proper size)
- Forget alt text for accessibility
- Skip retina versions (@2x)

---

## 📱 Responsive Behavior

| Screen Size | Logo Used | File Size |
|-------------|-----------|-----------|
| 0-640px | Compact | 17 KB WebP |
| 641px+ | Header | 65 KB WebP |
| Retina | @2x versions | Auto-selected |

---

## 🔍 Testing Checklist

- [ ] Logo displays on homepage
- [ ] Logo displays in navigation
- [ ] Mobile shows compact version
- [ ] Desktop shows header version
- [ ] Retina displays use @2x
- [ ] WebP loads on Chrome/Edge/Firefox
- [ ] PNG fallback works on older browsers
- [ ] Favicon appears in browser tab
- [ ] Apple touch icon works on iOS
- [ ] Android add-to-home works
- [ ] PWA manifest valid

---

## 📊 File Sizes

| Logo | PNG | WebP | Savings |
|------|-----|------|---------|
| Main (1200px) | 209 KB | 134 KB | 36% |
| Header (800px) | 100 KB | 65 KB | 35% |
| Compact (400px) | 26 KB | 17 KB | 35% |

**Original:** 4.45 MB  
**Optimized:** 134 KB WebP (95% reduction)

---

## 🛠️ Regenerate Assets

If you update the source logo:

```bash
node scripts/optimize-logo-system.js
```

---

## 📚 Full Documentation

- **Brand Guidelines:** `LOGO-BRAND-GUIDE.md`
- **Implementation:** `LOGO-IMPLEMENTATION.md`
- **This Guide:** `LOGO-QUICKSTART.md`

---

## 🎨 Brand Colors

```css
--brand-primary: #10b981;    /* Emerald Green */
--brand-secondary: #1f2937;  /* Slate Gray */
```

---

## ✨ Features

✅ Responsive (mobile vs desktop)  
✅ WebP with PNG fallback  
✅ Retina display support (@2x)  
✅ PWA ready (manifest + maskable icon)  
✅ Cross-platform icons (iOS, Android, Windows)  
✅ Social media images (OG, Twitter)  
✅ Optimized performance (<100 KB WebP)  
✅ Accessibility compliant  

---

**Need help?** See `LOGO-BRAND-GUIDE.md` for detailed usage guidelines.
