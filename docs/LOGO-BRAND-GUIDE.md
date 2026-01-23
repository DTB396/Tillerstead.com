# 🐺 Tillerstead Wolf Crest Logo & Brand Guide

> **Fortune 500-Level Brand Asset System**  
> Professional logo usage guidelines for Tillerstead LLC

---

## 📋 Quick Reference

**Primary Logo:** Wolf Crest (Option A)  
**Brand Colors:** Emerald Green (#10b981) & Slate Gray (#1f2937)  
**Tagline:** "Where Craft Meets Accountability"  
**File Location:** `assets/img/logo/` and `assets/icons/`

---

## 🎨 Logo Variations

### Primary Logos

| Variation | Use Case | Max Size | File Size |
|-----------|----------|----------|-----------|
| **Main Logo** | Hero sections, marketing | 1200px | 208 KB (PNG) / 134 KB (WebP) |
| **Header Logo** | Navigation, headers | 800px | 100 KB (PNG) / 65 KB (WebP) |
| **Compact Logo** | Mobile, small spaces | 400px | 26 KB (PNG) / 17 KB (WebP) |

### File Naming Convention

```
logo-wolf-crest.png          // Main logo (1x)
logo-wolf-crest@2x.png       // Main logo (retina)
logo-wolf-crest.webp         // Main logo (WebP)
logo-wolf-crest@2x.webp      // Main logo (WebP retina)

logo-wolf-crest-header.png   // Header logo (1x)
logo-wolf-crest-header@2x.png // Header logo (retina)
logo-wolf-crest-header.webp  // Header logo (WebP)
logo-wolf-crest-header@2x.webp // Header logo (WebP retina)

logo-wolf-crest-compact.png  // Compact logo (1x)
logo-wolf-crest-compact@2x.png // Compact logo (retina)
logo-wolf-crest-compact.webp // Compact logo (WebP)
logo-wolf-crest-compact@2x.webp // Compact logo (WebP retina)
```

---

## 📐 Usage Guidelines

### Clear Space

**Minimum clear space:** Equal to the height of the shield in the crest  
**Purpose:** Ensures logo visibility and prevents visual clutter

```
┌────────────────────────────────────┐
│                                    │
│    ┌──────────────────┐           │
│    │                  │           │
│    │   WOLF CREST     │ ← Clear   │
│    │      LOGO        │   Space   │
│    │                  │           │
│    └──────────────────┘           │
│                                    │
└────────────────────────────────────┘
```

### Minimum Sizes

- **Digital/Web:** 200px width minimum
- **Print:** 1.5 inches width minimum
- **Favicon/Icons:** Use dedicated icon files (see below)

### Backgrounds

✅ **Approved Backgrounds:**
- White
- Light gray (#f9fafb, #f3f4f6)
- Dark slate (#1f2937, #111827)
- Emerald green (#10b981) - use with caution

❌ **Avoid:**
- Busy patterns or textures
- Low contrast backgrounds
- Gradients that interfere with logo visibility
- Placing over tile photography without solid background

---

## 🎯 Color Specifications

### Primary Brand Colors

**Emerald Green (Primary)**
```
HEX:  #10b981
RGB:  16, 185, 129
CMYK: 87, 0, 56, 0
```

**Slate Gray (Secondary)**
```
HEX:  #1f2937
RGB:  31, 41, 55
CMYK: 81, 70, 54, 59
```

### Logo Color Modes

1. **Full Color** (Default)
   - Use on white or light backgrounds
   - Primary mode for all applications

2. **Monochrome Dark**
   - Single color: #1f2937
   - Use on white backgrounds when color isn't available

3. **Monochrome Light**
   - Single color: #ffffff
   - Use on dark backgrounds (#1f2937 or darker)

4. **Inverted**
   - Logo in white on emerald green background
   - Use sparingly for special applications

---

## 📱 Icon System

### Standard Favicons

```
favicon.ico                  // Multi-resolution (16x16, 32x32, 48x48)
favicon-16x16.png           // 16×16 - browser tabs
favicon-32x32.png           // 32×32 - browser tabs
favicon-48x48.png           // 48×48 - browser shortcuts
```

### Apple Touch Icons

```
apple-touch-icon.png                // 180×180 - iOS home screen
apple-touch-icon-precomposed.png    // 180×180 - iOS (no effects)
apple-touch-icon-120x120.png        // 120×120 - older iOS devices
apple-touch-icon-152x152.png        // 152×152 - iPad
```

### Android/Chrome Icons

```
android-chrome-192x192.png          // 192×192 - Android home screen
android-chrome-512x512.png          // 512×512 - Android splash screen
android-chrome-maskable-512x512.png // 512×512 - Maskable icon (safe zone)
```

### Microsoft Tiles

```
mstile-70x70.png            // 70×70 - Small tile
mstile-144x144.png          // 144×144 - Medium tile
mstile-150x150.png          // 150×150 - Medium tile
mstile-310x310.png          // 310×310 - Large tile
mstile-310x150.png          // 310×150 - Wide tile
```

### Social Media Images

```
og-image.png                // 1200×630 - Facebook, LinkedIn
twitter-card.png            // 1200×675 - Twitter/X
```

---

## 💻 Implementation

### HTML Include (Recommended)

```liquid
{% raw %}{% include components/logo-wolf-crest.html %}{% endraw %}
```

**Features:**
- Responsive (mobile vs desktop)
- WebP with PNG fallback
- Retina display support (@2x)
- Optimal file sizes for performance

### Manual HTML (Advanced)

```html
<picture class="site-logo">
  <!-- Mobile: compact version -->
  <source media="(max-width: 640px)" 
          srcset="/assets/img/logo/logo-wolf-crest-compact.webp 1x,
                  /assets/img/logo/logo-wolf-crest-compact@2x.webp 2x"
          type="image/webp">
  <source media="(max-width: 640px)" 
          srcset="/assets/img/logo/logo-wolf-crest-compact.png 1x,
                  /assets/img/logo/logo-wolf-crest-compact@2x.png 2x"
          type="image/png">
  
  <!-- Desktop: header version -->
  <source srcset="/assets/img/logo/logo-wolf-crest-header.webp 1x,
                  /assets/img/logo/logo-wolf-crest-header@2x.webp 2x"
          type="image/webp">
  <source srcset="/assets/img/logo/logo-wolf-crest-header.png 1x,
                  /assets/img/logo/logo-wolf-crest-header@2x.png 2x"
          type="image/png">
  
  <img src="/assets/img/logo/logo-wolf-crest-header.png"
       alt="Tillerstead LLC - Where Craft Meets Accountability"
       width="400"
       height="120"
       class="logo-image"
       loading="eager">
</picture>
```

### Favicon Meta Tags

Add to `<head>` section:

```liquid
{% include icons/favicon-meta.html %}
```

Or manually:

```html
<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png">
<link rel="shortcut icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="msapplication-config" content="/browserconfig.xml">
<meta name="msapplication-TileColor" content="#10b981">
<meta name="theme-color" content="#10b981">
```

---

## 🚫 Don'ts

❌ **Never:**
- Stretch, squish, or distort the logo
- Change logo colors (except approved variations)
- Add effects (drop shadows, glows, outlines)
- Place on busy backgrounds without solid overlay
- Use low-resolution versions at large sizes
- Rotate or tilt the logo
- Separate elements of the logo
- Recreate or redraw the logo
- Use outdated logo versions

---

## 📂 File Structure

```
Tillerstead.com/
├── assets/
│   ├── icons/                          # All icons & favicons
│   │   ├── favicon.ico                 # Multi-resolution favicon
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   ├── favicon-48x48.png
│   │   ├── apple-touch-icon.png
│   │   ├── apple-touch-icon-precomposed.png
│   │   ├── apple-touch-icon-120x120.png
│   │   ├── apple-touch-icon-152x152.png
│   │   ├── android-chrome-192x192.png
│   │   ├── android-chrome-512x512.png
│   │   ├── android-chrome-maskable-512x512.png
│   │   ├── mstile-70x70.png
│   │   ├── mstile-144x144.png
│   │   ├── mstile-150x150.png
│   │   ├── mstile-310x310.png
│   │   ├── mstile-310x150.png
│   │   ├── og-image.png                # 1200×630 social
│   │   └── twitter-card.png            # 1200×675 social
│   │
│   └── img/
│       └── logo/                       # Logo variations
│           ├── logo-wolf-crest.png     # Main logo (1x)
│           ├── logo-wolf-crest@2x.png  # Main logo (retina)
│           ├── logo-wolf-crest.webp
│           ├── logo-wolf-crest@2x.webp
│           ├── logo-wolf-crest-header.png
│           ├── logo-wolf-crest-header@2x.png
│           ├── logo-wolf-crest-header.webp
│           ├── logo-wolf-crest-header@2x.webp
│           ├── logo-wolf-crest-compact.png
│           ├── logo-wolf-crest-compact@2x.png
│           ├── logo-wolf-crest-compact.webp
│           └── logo-wolf-crest-compact@2x.webp
│
├── _includes/
│   ├── components/
│   │   └── logo-wolf-crest.html        # Responsive logo component
│   └── icons/
│       └── favicon-meta.html           # Favicon meta tags
│
├── manifest.webmanifest                # PWA manifest
├── browserconfig.xml                   # Microsoft tile config
└── favicon.ico                         # Root favicon
```

---

## 🎯 Performance Targets

**Achieved:**
- ✅ Main logo: 208 KB PNG / 134 KB WebP (98% smaller than original 4.45 MB)
- ✅ Header logo: 100 KB PNG / 65 KB WebP (under 50 KB WebP target)
- ✅ Compact logo: 26 KB PNG / 17 KB WebP (well under 30 KB target)
- ✅ All icons: <10 KB each
- ✅ Total icon suite: <500 KB
- ✅ WebP savings: 35-36% smaller than PNG
- ✅ Retina support: @2x versions for HiDPI displays

---

## 🔧 Regeneration

To regenerate all logo assets:

```bash
node scripts/optimize-logo-system.js
```

**Requirements:**
- Node.js 14+
- sharp npm package (`npm install sharp`)
- ImageMagick (for favicon.ico)

---

## 📞 Contact

**Questions about logo usage?**  
Contact: Tillerstead LLC Brand Team

**Technical implementation questions?**  
See: `scripts/optimize-logo-system.js`

---

## 📜 Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-01-19 | Wolf Crest system implementation |
| 1.0 | 2026-01-11 | Initial logo creation |

---

**© 2026 Tillerstead LLC. All rights reserved.**

This logo and all associated brand assets are proprietary to Tillerstead LLC. Unauthorized use, reproduction, or modification is prohibited.
