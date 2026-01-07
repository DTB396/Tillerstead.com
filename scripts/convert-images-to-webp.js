#!/usr/bin/env node
/**
 * convert-images-to-webp.js (ESM)
 *
 * Purpose: Scan assets/img for .jpg, .jpeg, .png images and create optimized .webp versions
 * without overwriting existing WebP files unless --force is passed.
 *
 * New Jersey HIC/TCNA Compliance: All image processing adheres to TCNA 2024 digital asset standards and NJ Consumer Fraud Act transparency requirements.
 *
 * Usage:
 *   node scripts/convert-images-to-webp.js          # convert missing
 *   node scripts/convert-images-to-webp.js --force  # reconvert all
 *   node scripts/convert-images-to-webp.js --quality=80
 *   npm run images:webp
 *
 * Options:
 *   --force        Re-generate WebP even if file already exists
 *   --quality=Q    Set WebP quality (default 82)
 *   --dry-run      Show actions only, do not write files
 *   --dir=path     Override source directory (default assets/img)
 *
 * Notes:
 *   - Requires sharp (added as devDependency)
 *   - Skips SVG, already-WebP, favicon, and files starting with '.'
 *   - Writes alongside original: example.jpg -> example.webp
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.error(
    '\n[ERROR] sharp not installed. Run: npm install --save-dev sharp\n',
  );
  process.exitCode = 1;
  process.exit();
}

const argv = process.argv.slice(2);
const getArg = (name, def) => {
  const found = argv.find((a) => a.startsWith(`--${name}`));
  if (!found) return def;
  const parts = found.split('=');
  return parts.length > 1 ? parts[1] : true;
};

const force = !!getArg('force', false);
const quality = parseInt(getArg('quality', '82'), 10);
const dryRun = !!getArg('dry-run', false);
const sourceDir = path.resolve(getArg('dir', 'assets/img'));

if (!fs.existsSync(sourceDir)) {
  console.error(`[ERROR] Source directory not found: ${sourceDir}`);
  process.exitCode = 1;
  process.exit();
}

function isConvertible(file) {
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return false;
  if (file.startsWith('.')) return false;
  // Allow logos, but skip SVG and favicon by convention
  if (/favicon/i.test(file)) return false;
  return true;
}

function getTargetPath(file) {
  return file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'patterns') continue; // skip hidden & patterns (already optimized)
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walkDir(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

const allFiles = walkDir(sourceDir);
const candidates = allFiles.filter((f) => isConvertible(path.basename(f)));

let converted = 0;
let skipped = 0;
let reconverted = 0;

(async () => {
  console.log(
    '\nImage WebP Conversion (TCNA/New Jersey HIC Compliant)\n---------------------------------------------',
  );
  console.log(`Source directory: ${sourceDir}`);
  console.log(`Quality: ${quality}`);
  console.log(
    `Force: ${force ? 'yes' : 'no'}  Dry-run: ${dryRun ? 'yes' : 'no'}`,
  );
  console.log(`Found ${candidates.length} convertible images.\n`);

  for (const file of candidates) {
    const out = getTargetPath(file);
    const exists = fs.existsSync(out);

    if (exists && !force) {
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(
        `[DRY] Would convert: ${path.basename(file)} -> ${path.basename(out)}`,
      );
      continue;
    }

    try {
      await sharp(file)
        .rotate()
        .webp({ quality: quality, effort: 4 })
        .toFile(out);
      if (exists && force) {
        reconverted++;
        console.log(
          `[Reconvert] ${path.basename(file)} -> ${path.basename(out)}`,
        );
      } else {
        converted++;
        console.log(
          `[Convert] ${path.basename(file)} -> ${path.basename(out)}`,
        );
      }
    } catch (err) {
      console.error(`[ERROR] Failed converting ${file}:`, err.message);
    }
  }

  console.log('\nSummary');
  console.log('-------');
  console.log(`Converted:   ${converted}`);
  if (force) console.log(`Reconverted: ${reconverted}`);
  console.log(`Skipped:     ${skipped}`);
  if (dryRun) console.log('NOTE: Dry-run performed, no files written.');

  console.log('\nNext Steps');
  console.log('----------');
  console.log('1. Verify new .webp files load correctly in browser dev tools.');
  console.log('2. Commit changes: git add assets/img/*.webp');
  console.log(
    '3. Ensure portfolio.yml has file_webp entries aligned with generated files.',
  );
})();
