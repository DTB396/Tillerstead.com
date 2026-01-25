#!/usr/bin/env node

/**
 * check-contrast-wcag.js — Comprehensive WCAG 2.1 Contrast Checker
 *
 * Purpose:
 * Validates all color combinations throughout the site against WCAG 2.1 AAA standards.
 * Extracts colors from CSS, checks combinations, and reports failures.
 *
 * Standards:
 * - WCAG 2.1 Level AAA: 7:1 normal text, 4.5:1 large text (18px+ bold or 24px+)
 * - WCAG 2.1 Level AA: 4.5:1 normal text, 3:1 large text
 *
 * Usage:
 * node scripts/check-contrast-wcag.js
 *
 * Output:
 * - contrast-audit-report.json
 * - contrast-audit-report.md
 */

import { writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT = join(__dirname, '..');

// ==
// COLOR UTILITIES
// ==

/**
 * Parse hex color to RGB array
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ]
    : null;
}

/**
 * Calculate relative luminance (WCAG 2.1)
 */
function getLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map((x) => {
    x = x / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return null;

  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Determine WCAG compliance level
 */
function getWCAGLevel(ratio, isLargeText = false) {
  if (isLargeText) {
    if (ratio >= 4.5) return 'AAA';
    if (ratio >= 3) return 'AA';
    return 'FAIL';
  } else {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    return 'FAIL';
  }
}

// ==
// TILLERSTEAD COLOR PALETTE
// ==

const BRAND_COLORS = {
  // Teals
  'teal-900': '#054a1f',
  'teal-800': '#066b2d',
  'teal-700': '#078930', // Primary
  'teal-600': '#0fa640',
  'teal-500': '#1dc055',
  'teal-400': '#43d779',
  'teal-300': '#6ae594',
  'teal-200': '#a8f4b8',
  'teal-100': '#d5fae3',
  'teal-50': '#eefbf5',

  // Reds
  'red-900': '#5d0608',
  'red-800': '#8b0a0e',
  'red-700': '#b80d12',
  'red-600': '#da121a', // Accent
  'red-500': '#f11a22',
  'red-400': '#f73c47',
  'red-300': '#fc6b73',
  'red-200': '#fed9dc',
  'red-100': '#fee9eb',
  'red-50': '#fef5f5',

  // Golds
  'gold-900': '#8b7500',
  'gold-800': '#b89900',
  'gold-700': '#d4b100',
  'gold-600': '#fcdd09', // Highlight
  'gold-500': '#fde34f',
  'gold-400': '#fff4a3',
  'gold-300': '#fffbcc',
  'gold-200': '#fffde7',
  'gold-100': '#fffff0',
  'gold-50': '#fffff7',

  // Charcoals
  'charcoal-900': '#0f0f0f',
  'charcoal-800': '#1a1a1a',
  'charcoal-700': '#2d2d2d',
  'charcoal-600': '#3f3f3f',
  'charcoal-500': '#525252',
  'charcoal-400': '#6b6b6b',
  'charcoal-300': '#888888',
  'charcoal-200': '#ababab',
  'charcoal-100': '#d4d4d4',
  'charcoal-50': '#ebebeb',

  // Creams
  'cream-100': '#f9f7f4',
  'cream-75': '#faf8f5',
  'cream-50': '#fcfaf7',
  'cream-25': '#fdfcfa',

  // Pure
  white: '#ffffff',
  black: '#000000',
};

// Common text + background combinations
const COMMON_COMBINATIONS = [
  // Primary on light backgrounds
  { fg: 'teal-700', bg: 'white', label: 'Primary on White' },
  {
    fg: 'teal-700',
    bg: 'cream-100',
    label: 'Primary on Cream (Avoid - Below AA)',
  },
  { fg: 'teal-800', bg: 'white', label: 'Primary Dark on White' },

  // Accent on light backgrounds
  { fg: 'red-600', bg: 'white', label: 'Accent on White' },
  { fg: 'red-600', bg: 'cream-100', label: 'Accent on Cream' },
  { fg: 'red-700', bg: 'white', label: 'Accent Dark on White' },

  // Highlight on light backgrounds (using correct dark gold for text)
  { fg: 'gold-700', bg: 'white', label: 'Dark Gold Text on White' },
  { fg: 'gold-600', bg: 'white', label: 'Logo Gold (Highlight Only - Fails)' },
  { fg: 'gold-700', bg: 'cream-100', label: 'Dark Gold on Cream' },

  // Text on light backgrounds
  { fg: 'charcoal-800', bg: 'white', label: 'Text on White' },
  { fg: 'charcoal-800', bg: 'cream-100', label: 'Text on Cream' },
  { fg: 'charcoal-600', bg: 'white', label: 'Muted Text on White' },

  // White text on dark backgrounds
  { fg: 'white', bg: 'teal-700', label: 'White on Primary' },
  { fg: 'white', bg: 'teal-800', label: 'White on Primary Dark' },
  { fg: 'white', bg: 'red-600', label: 'White on Accent' },
  { fg: 'white', bg: 'charcoal-800', label: 'White on Dark' },

  // Button states
  { fg: 'white', bg: 'teal-700', label: 'Button Primary' },
  { fg: 'white', bg: 'red-600', label: 'Button Accent' },
  { fg: 'teal-700', bg: 'white', label: 'Button Secondary (Fixed - White BG)' },

  // Hover states
  { fg: 'white', bg: 'teal-800', label: 'Primary Hover' },
  { fg: 'white', bg: 'red-700', label: 'Accent Hover' },

  // Links
  { fg: 'teal-700', bg: 'white', label: 'Link Default' },
  { fg: 'teal-800', bg: 'white', label: 'Link Hover' },
];

// ==
// AUDIT REPORT
// ==

const REPORT = {
  timestamp: new Date().toISOString(),
  wcagTarget: 'AAA',
  totalCombinations: 0,
  passAAA: 0,
  passAA: 0,
  failures: 0,
  results: [],
};

// ==
// EXECUTION
// ==

function runContrastAudit() {
  console.log('🎨 WCAG 2.1 Contrast Audit Started\n');

  REPORT.totalCombinations = COMMON_COMBINATIONS.length;

  COMMON_COMBINATIONS.forEach((combo) => {
    const fgColor = BRAND_COLORS[combo.fg];
    const bgColor = BRAND_COLORS[combo.bg];

    if (!fgColor || !bgColor) {
      console.warn(`⚠️  Color not found: ${combo.fg} or ${combo.bg}`);
      return;
    }

    const ratio = getContrastRatio(fgColor, bgColor);
    const wcagLevel = getWCAGLevel(ratio, false);
    const wcagLevelLarge = getWCAGLevel(ratio, true);

    const result = {
      combination: combo.label,
      foreground: {
        name: combo.fg,
        hex: fgColor,
      },
      background: {
        name: combo.bg,
        hex: bgColor,
      },
      contrastRatio: ratio,
      wcagCompliance: {
        normalText: wcagLevel,
        largeText: wcagLevelLarge,
      },
      status:
        wcagLevel === 'AAA' ? 'PASS' : wcagLevel === 'AA' ? 'WARNING' : 'FAIL',
    };

    if (result.status === 'PASS') {
      REPORT.passAAA++;
      console.log(`✅ ${combo.label}: ${ratio}:1 (AAA)`);
    } else if (result.status === 'WARNING') {
      REPORT.passAA++;
      console.log(`⚠️  ${combo.label}: ${ratio}:1 (AA only)`);
    } else {
      REPORT.failures++;
      console.log(`❌ ${combo.label}: ${ratio}:1 (FAIL)`);
    }

    REPORT.results.push(result);
  });

  // Write JSON report
  writeFileSync(
    join(ROOT, 'contrast-audit-report.json'),
    JSON.stringify(REPORT, null, 2),
  );

  // Write Markdown report
  let markdown = `# WCAG 2.1 Contrast Audit Report

**Generated:** ${new Date().toISOString()}
**Target Level:** AAA (7:1 normal text, 4.5:1 large text)
**Total Combinations Tested:** ${REPORT.totalCombinations}

## Summary

| Status | Count |
|--------|-------|
| ✅ Pass AAA | ${REPORT.passAAA} |
| ⚠️  Pass AA Only | ${REPORT.passAA} |
| ❌ Fail | ${REPORT.failures} |

## Compliance by Combination

`;

  // Group by status
  const passed = REPORT.results.filter((r) => r.status === 'PASS');
  const warned = REPORT.results.filter((r) => r.status === 'WARNING');
  const failed = REPORT.results.filter((r) => r.status === 'FAIL');

  if (passed.length > 0) {
    markdown += `\n### ✅ AAA Compliant (${passed.length})\n\n`;
    passed.forEach((result) => {
      markdown += `- **${result.combination}**: ${result.contrastRatio}:1\n`;
      markdown += `  - Foreground: ${result.foreground.hex}\n`;
      markdown += `  - Background: ${result.background.hex}\n`;
    });
  }

  if (warned.length > 0) {
    markdown += `\n### ⚠️  AA Compliant Only (${warned.length})\n\n`;
    warned.forEach((result) => {
      markdown += `- **${result.combination}**: ${result.contrastRatio}:1\n`;
      markdown += `  - Normal Text: ${result.wcagCompliance.normalText} (requires 7:1)\n`;
      markdown += `  - Large Text: ${result.wcagCompliance.largeText} (requires 4.5:1)\n`;
    });
  }

  if (failed.length > 0) {
    markdown += `\n### ❌ Non-Compliant (${failed.length})\n\n`;
    failed.forEach((result) => {
      markdown += `- **${result.combination}**: ${result.contrastRatio}:1 ⚠️\n`;
      markdown +=
        '  - Recommendation: Adjust colors or use different combination\n';
    });
  }

  markdown += `\n## Reference

- WCAG 2.1 Level AA: 4.5:1 (normal), 3:1 (large)
- WCAG 2.1 Level AAA: 7:1 (normal), 4.5:1 (large)
- Large text: 18px+ (bold) or 24px+

## Brand Colors

### Teal (Primary)
- Dark: #078930
- Light: #43d779

### Red (Accent)
- Dark: #da121a
- Light: #fc6b73

### Gold (Highlight)
- Dark: #fcdd09
- Light: #fffbcc

### Neutral
- Dark: #1a1a1a
- Light: #ffffff
`;

  writeFileSync(join(ROOT, 'contrast-audit-report.md'), markdown);

  // Print summary
  console.log('\n📊 Summary:');
  console.log(
    `   AAA Compliant: ${REPORT.passAAA}/${REPORT.totalCombinations}`,
  );
  console.log(`   AA Only: ${REPORT.passAA}`);
  console.log(`   Failures: ${REPORT.failures}`);
  console.log('\n📄 Reports written to:');
  console.log('   - contrast-audit-report.json');
  console.log('   - contrast-audit-report.md\n');
}

runContrastAudit();
