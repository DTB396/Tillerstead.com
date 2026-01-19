#!/usr/bin/env node

/**
 * Tillerstead Logo System Generator
 * Fortune 500-level logo and icon optimization
 *
 * Creates optimized logos, favicons, and icons from source assets
 * Implements responsive loading, WebP support, and PWA compliance
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  sourceImage: 'assets/img/logo/4k-logo.png',
  alternateImage: 'assets/img/logo/tillerstead_wolf_crest_refined_1080p.png',
  outputDirs: {
    logos: 'assets/img/logo',
    icons: 'assets/icons'
  },
  brand: {
    name: 'Tillerstead LLC',
    shortName: 'Tillerstead',
    description: 'Where Craft Meets Accountability - TCNA-compliant tile installation in South Jersey',
    themeColor: '#10b981',
    backgroundColor: '#1f2937'
  }
};

// Logo specifications
const LOGOS = [
  { name: 'logo-wolf-crest', width: 1200, quality: 85, maxSize: 100 * 1024 },
  { name: 'logo-wolf-crest-header', width: 800, quality: 85, maxSize: 50 * 1024 },
  { name: 'logo-wolf-crest-compact', width: 400, quality: 80, maxSize: 30 * 1024 }
];

// Icon specifications
const ICONS = {
  favicons: [
    { name: 'favicon-16x16', size: 16 },
    { name: 'favicon-32x32', size: 32 },
    { name: 'favicon-48x48', size: 48 }
  ],
  appleTouchIcons: [
    { name: 'apple-touch-icon', size: 180 },
    { name: 'apple-touch-icon-precomposed', size: 180 },
    { name: 'apple-touch-icon-120x120', size: 120 },
    { name: 'apple-touch-icon-152x152', size: 152 }
  ],
  androidChrome: [
    { name: 'android-chrome-192x192', size: 192 },
    { name: 'android-chrome-512x512', size: 512 },
    { name: 'android-chrome-maskable-512x512', size: 512, maskable: true }
  ],
  msTiles: [
    { name: 'mstile-70x70', size: 70 },
    { name: 'mstile-144x144', size: 144 },
    { name: 'mstile-150x150', size: 150 },
    { name: 'mstile-310x310', size: 310 },
    { name: 'mstile-310x150', width: 310, height: 150 }
  ],
  social: [
    { name: 'og-image', width: 1200, height: 630 },
    { name: 'twitter-card', width: 1200, height: 675 }
  ]
};

// Utility functions
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function optimizeLogo(sourcePath, outputPath, width, quality) {
  const image = sharp(sourcePath);
  const metadata = await image.metadata();

  // Maintain aspect ratio
  const height = Math.round((width / metadata.width) * metadata.height);

  return image
    .resize(width, height, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ quality, compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function createWebP(pngBuffer, quality = 80) {
  return sharp(pngBuffer)
    .webp({ quality, effort: 6 })
    .toBuffer();
}

async function createIcon(sourcePath, size, outputPath, options = {}) {
  const image = sharp(sourcePath);

  let pipeline = image.resize(size, size, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  });

  // Add safe zone for maskable icons (20% padding)
  if (options.maskable) {
    const safeSize = Math.round(size * 0.8);
    const padding = Math.round((size - safeSize) / 2);
    pipeline = pipeline.extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: CONFIG.brand.themeColor
    });
  }

  return pipeline.png({ quality: 90, compressionLevel: 9 }).toBuffer();
}

async function createRectangularIcon(sourcePath, width, height, _outputPath) {
  return sharp(sourcePath)
    .resize(width, height, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ quality: 90, compressionLevel: 9 })
    .toBuffer();
}

async function createFavicon() {
  // Multi-resolution favicon.ico requires external tool
  console.log('⚠️  Note: favicon.ico should be generated separately using all favicon PNGs');
}

// Main optimization functions
async function optimizeLogos() {
  console.log('\n🎨 Optimizing Logo Variations...\n');

  for (const logo of LOGOS) {
    const baseName = logo.name;
    const pngPath = path.join(CONFIG.outputDirs.logos, `${baseName}.png`);
    const webpPath = path.join(CONFIG.outputDirs.logos, `${baseName}.webp`);
    const png2xPath = path.join(CONFIG.outputDirs.logos, `${baseName}@2x.png`);
    const webp2xPath = path.join(CONFIG.outputDirs.logos, `${baseName}@2x.webp`);

    // 1x PNG
    const pngBuffer = await optimizeLogo(CONFIG.sourceImage, pngPath, logo.width, logo.quality);
    await fs.writeFile(pngPath, pngBuffer);
    const pngSize = pngBuffer.length;
    console.log(`✓ ${baseName}.png - ${formatBytes(pngSize)} ${pngSize <= logo.maxSize ? '✓' : '⚠️ over target'}`);

    // 1x WebP
    const webpBuffer = await createWebP(pngBuffer, 80);
    await fs.writeFile(webpPath, webpBuffer);
    const webpSize = webpBuffer.length;
    const savings = Math.round((1 - webpSize / pngSize) * 100);
    console.log(`✓ ${baseName}.webp - ${formatBytes(webpSize)} (${savings}% smaller)`);

    // 2x PNG (Retina)
    const png2xBuffer = await optimizeLogo(CONFIG.sourceImage, png2xPath, logo.width * 2, logo.quality);
    await fs.writeFile(png2xPath, png2xBuffer);
    console.log(`✓ ${baseName}@2x.png - ${formatBytes(png2xBuffer.length)}`);

    // 2x WebP
    const webp2xBuffer = await createWebP(png2xBuffer, 80);
    await fs.writeFile(webp2xPath, webp2xBuffer);
    console.log(`✓ ${baseName}@2x.webp - ${formatBytes(webp2xBuffer.length)}\n`);
  }
}

async function generateFavicons() {
  console.log('🔖 Generating Favicons...\n');

  for (const icon of ICONS.favicons) {
    const outputPath = path.join(CONFIG.outputDirs.icons, `${icon.name}.png`);
    const buffer = await createIcon(CONFIG.sourceImage, icon.size, outputPath);
    await fs.writeFile(outputPath, buffer);
    console.log(`✓ ${icon.name}.png - ${formatBytes(buffer.length)}`);
  }
}

async function generateAppleIcons() {
  console.log('\n🍎 Generating Apple Touch Icons...\n');

  for (const icon of ICONS.appleTouchIcons) {
    const outputPath = path.join(CONFIG.outputDirs.icons, `${icon.name}.png`);
    const buffer = await createIcon(CONFIG.sourceImage, icon.size, outputPath);
    await fs.writeFile(outputPath, buffer);
    console.log(`✓ ${icon.name}.png - ${formatBytes(buffer.length)}`);
  }
}

async function generateAndroidIcons() {
  console.log('\n🤖 Generating Android/Chrome Icons...\n');

  for (const icon of ICONS.androidChrome) {
    const outputPath = path.join(CONFIG.outputDirs.icons, `${icon.name}.png`);
    const buffer = await createIcon(CONFIG.sourceImage, icon.size, outputPath, { maskable: icon.maskable });
    await fs.writeFile(outputPath, buffer);
    console.log(`✓ ${icon.name}.png - ${formatBytes(buffer.length)}`);
  }
}

async function generateMSTiles() {
  console.log('\n🪟 Generating Microsoft Tiles...\n');

  for (const tile of ICONS.msTiles) {
    const outputPath = path.join(CONFIG.outputDirs.icons, `${tile.name}.png`);
    let buffer;

    if (tile.width && tile.height) {
      buffer = await createRectangularIcon(CONFIG.sourceImage, tile.width, tile.height, outputPath);
    } else {
      buffer = await createIcon(CONFIG.sourceImage, tile.size, outputPath);
    }

    await fs.writeFile(outputPath, buffer);
    console.log(`✓ ${tile.name}.png - ${formatBytes(buffer.length)}`);
  }
}

async function generateSocialImages() {
  console.log('\n📱 Generating Social Media Images...\n');

  for (const social of ICONS.social) {
    const outputPath = path.join(CONFIG.outputDirs.icons, `${social.name}.png`);
    const buffer = await createRectangularIcon(CONFIG.sourceImage, social.width, social.height, outputPath);
    await fs.writeFile(outputPath, buffer);
    console.log(`✓ ${social.name}.png - ${formatBytes(buffer.length)}`);
  }
}

async function generateSafariPinnedTab() {
  console.log('\n🧭 Safari Pinned Tab SVG...\n');
  console.log('⚠️  Note: Safari pinned tab SVG should be created manually as a monochrome silhouette');
  console.log('   Recommendation: Use vector editing tool to create simplified wolf outline');
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🐺 TILLERSTEAD LOGO SYSTEM GENERATOR');
  console.log('  Fortune 500-Level Brand Asset Optimization');
  console.log('═══════════════════════════════════════════════════════');

  try {
    // Ensure output directories exist
    await ensureDir(CONFIG.outputDirs.logos);
    await ensureDir(CONFIG.outputDirs.icons);

    // Generate all assets
    await optimizeLogos();
    await generateFavicons();
    await generateAppleIcons();
    await generateAndroidIcons();
    await generateMSTiles();
    await generateSocialImages();
    await generateSafariPinnedTab();
    await createFavicon();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  ✅ LOGO SYSTEM GENERATION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════\n');

    // Summary
    const logoFiles = await fs.readdir(CONFIG.outputDirs.logos);
    const iconFiles = await fs.readdir(CONFIG.outputDirs.icons);
    console.log(`📊 Summary:`);
    console.log(`   Logos: ${logoFiles.length} files`);
    console.log(`   Icons: ${iconFiles.length} files`);
    console.log(`\n📝 Next Steps:`);
    console.log(`   1. Create favicon.ico from PNGs using online tool or ImageMagick`);
    console.log(`   2. Create safari-pinned-tab.svg manually`);
    console.log(`   3. Update _includes with new logo components`);
    console.log(`   4. Update manifest.webmanifest and browserconfig.xml`);
    console.log(`   5. Test on all devices and browsers\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
