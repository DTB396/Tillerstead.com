/**
 * Image Optimization Script
 * Converts images to WebP format with responsive sizes
 * Run: node scripts/optimize-images.js
 */

import sharp from 'sharp';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';

const INPUT_DIR = 'assets/img/';
const OUTPUT_DIR = 'assets/img/optimized/';
const SIZES = {
  small: 400,
  medium: 800,
  large: 1200,
  xlarge: 1920,
};

async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function optimizeImage(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
    return;
  }

  const filename = path.basename(imagePath, ext);
  const relativePath = path.dirname(imagePath).replace(INPUT_DIR, '');
  const outputPath = path.join(OUTPUT_DIR, relativePath);

  await ensureDir(outputPath);

  // Get image metadata
  const image = sharp(imagePath);
  const metadata = await image.metadata();

  console.log(
    `Processing: ${filename}${ext} (${metadata.width}x${metadata.height})`,
  );

  // Generate WebP versions at different sizes
  for (const [sizeName, width] of Object.entries(SIZES)) {
    if (metadata.width >= width) {
      const outputFile = path.join(outputPath, `${filename}-${sizeName}.webp`);

      await sharp(imagePath)
        .resize(width, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .webp({
          quality: sizeName === 'small' ? 75 : 85,
          effort: 6,
        })
        .toFile(outputFile);

      console.log(`  ✓ ${sizeName}: ${width}w → WebP`);
    }
  }

  // Generate original size WebP
  const originalWebP = path.join(outputPath, `${filename}.webp`);
  await sharp(imagePath).webp({ quality: 90, effort: 6 }).toFile(originalWebP);

  console.log(`  ✓ Original: ${metadata.width}w → WebP`);
}

async function main() {
  console.log('🎨 Tillerstead Image Optimization');
  console.log('====\n');

  const images = await glob(`${INPUT_DIR}**/*.{jpg,jpeg,png}`, {
    ignore: ['**/node_modules/**', '**/optimized/**'],
  });

  console.log(`Found ${images.length} images to optimize\n`);

  for (const imagePath of images) {
    try {
      await optimizeImage(imagePath);
    } catch (error) {
      console.error(`  ✗ Error processing ${imagePath}:`, error.message);
    }
  }

  console.log('\n✅ Image optimization complete!');
  console.log('\nNext steps:');
  console.log('1. Update image references to use WebP format');
  console.log('2. Add <picture> elements with fallbacks');
  console.log('3. Test image loading on slow connections');
}

main().catch(console.error);
