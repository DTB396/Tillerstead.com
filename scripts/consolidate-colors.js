#!/usr/bin/env node

/**
 * Color Consolidation Script
 * Finds all hardcoded hex colors and creates a mapping to CSS variables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color mapping - most frequently used colors to their CSS variables
const COLOR_MAP = {
  // Teals
  '#0f766e': 'var(--color-brand-teal-600)',
  '#0d9aaa': 'var(--color-brand-teal-500)',
  '#0b6b5c': 'var(--color-brand-teal-700)',
  '#16a384': 'var(--color-brand-teal-400)',
  '#1cb394': 'var(--color-brand-teal-400)',
  '#053a2e': 'var(--color-brand-teal-900)',
  '#0a7f8d': 'var(--color-brand-teal-600)',
  '#086470': 'var(--color-brand-teal-700)',
  '#053d45': 'var(--color-brand-teal-900)',
  '#022318': 'var(--color-brand-teal-950)',
  '#0d8066': 'var(--color-brand-teal-600)',
  '#084c3d': 'var(--color-brand-teal-800)',

  // Whites & Grays
  '#ffffff': 'var(--ts-white)',
  '#FFFFFF': 'var(--ts-white)',
  '#fff': 'var(--ts-white)',
  '#1A1A1A': 'var(--ts-color-heading)',
  '#000000': 'var(--ts-color-ink)',
  '#000': 'var(--ts-color-ink)',
  '#222222': 'var(--ts-color-text)',
  '#181818': 'var(--ts-color-heading)',

  // Slate/Stone
  '#e2e8f0': 'var(--color-slate-200)',
  '#E2E8F0': 'var(--color-slate-200)',
  '#64748b': 'var(--color-slate-500)',
  '#1e293b': 'var(--color-slate-800)',
  '#f8fafc': 'var(--color-slate-50)',
  '#f1f5f9': 'var(--color-slate-100)',
  '#334155': 'var(--color-slate-700)',
  '#475569': 'var(--color-slate-600)',
  '#94a3b8': 'var(--color-slate-400)',
  '#cbd5e1': 'var(--color-slate-300)',
  '#0f172a': 'var(--color-slate-900)',

  // Golden/Yellow
  '#c99a3f': 'var(--color-golden-500)',
  '#fbbf24': 'var(--color-golden-400)',
  '#f59e0b': 'var(--color-golden-500)',
  '#d97706': 'var(--color-golden-600)',
  '#b45309': 'var(--color-golden-700)',
  '#d6b45b': 'var(--color-golden-500)',

  // Error/Alert Red
  '#b00': 'var(--color-alert-600)',
  '#d32f2f': 'var(--color-alert-500)',
  '#dc2626': 'var(--color-alert-600)',
  '#b91c1c': 'var(--color-alert-700)',

  // Navy/Blue
  '#000080': 'var(--color-navy-800)',
  '#0057b8': 'var(--color-navy-600)',
  '#003a75': 'var(--color-navy-700)',

  // Success Green
  '#10b981': 'var(--color-success-500)',
  '#059669': 'var(--color-success-600)',
  '#047857': 'var(--color-success-700)',

  // Additional common colors
  '#666': 'var(--color-slate-500)',
  '#666666': 'var(--color-slate-500)',
  '#555555': 'var(--color-slate-600)',

  // Navy specific
  '#12212c': 'var(--color-navy-900)',
};

// Files to process (glob patterns)

// Directories to exclude
const EXCLUDE_DIRS = ['node_modules', '.git', '_site', 'dist', 'build'];

function findHexColors(content) {
  // Match hex colors: #fff, #ffffff, #FFF, #FFFFFF
  const hexPattern = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
  const matches = content.match(hexPattern) || [];
  return [...new Set(matches)]; // unique colors
}

function replaceColorsInFile(filePath, dryRun = false) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let replacements = 0;

  const colorsFound = findHexColors(content);

  colorsFound.forEach((color) => {
    const lowerColor = color.toLowerCase();
    if (COLOR_MAP[lowerColor]) {
      const regex = new RegExp(
        color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'gi',
      );
      newContent = newContent.replace(regex, COLOR_MAP[lowerColor]);
      replacements++;
    } else if (COLOR_MAP[color]) {
      const regex = new RegExp(
        color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'g',
      );
      newContent = newContent.replace(regex, COLOR_MAP[color]);
      replacements++;
    }
  });

  if (replacements > 0) {
    if (!dryRun) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
    return { file: filePath, replacements, colorsFound };
  }

  return null;
}

function processDirectory(dir, dryRun = false) {
  const results = [];

  function walk(directory) {
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      // Skip excluded directories
      if (stat.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(file)) {
          walk(filePath);
        }
        return;
      }

      // Process CSS, SCSS, HTML files
      if (/\.(css|scss|html)$/.test(file)) {
        const result = replaceColorsInFile(filePath, dryRun);
        if (result) {
          results.push(result);
        }
      }
    });
  }

  walk(dir);
  return results;
}

// Main execution
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const projectRoot = path.resolve(__dirname, '..');

console.log('🎨 CSS Color Consolidation Tool');
console.log('================================\n');

if (dryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n');
}

console.log(`📁 Processing directory: ${projectRoot}\n`);

const results = processDirectory(projectRoot, dryRun);

console.log('\n📊 Results:');
console.log('===========');
console.log(`Files processed: ${results.length}`);
console.log(
  `Total replacements: ${results.reduce((sum, r) => sum + r.replacements, 0)}\n`,
);

if (results.length > 0) {
  console.log('📝 Files modified:');
  results.forEach((r) => {
    console.log(
      `  ${r.file.replace(projectRoot, '')}: ${r.replacements} replacements`,
    );
  });
}

if (dryRun) {
  console.log('\n✅ To apply changes, run without --dry-run flag');
} else {
  console.log('\n✅ Color consolidation complete!');
}
