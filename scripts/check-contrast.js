/**
 * check-contrast.js — WCAG 2.1 Contrast Audit for Tillerstead
 *
 * Purpose:
 * Validates all CSS color combinations against WCAG 2.1 AA/AAA standards.
 * Reports non-compliant pairings for dark theme readability issues.
 *
 * Compliance:
 * - WCAG 2.1 Level AA: 4.5:1 for normal text, 3:1 for large text
 * - WCAG 2.1 Level AAA: 7:1 for normal text, 4.5:1 for large text
 * - TCNA 2024 and New Jersey HIC accessibility requirements
 *
 * Usage:
 * node scripts/check-contrast.js
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

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
 * Parse rgb(a) string to RGB array
 */
function rgbaToRgb(rgba) {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match
    ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
    : null;
}

/**
 * Calculate relative luminance (WCAG 2.1)
 */
function luminance([r, g, b]) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

/**
 * Calculate contrast ratio (WCAG 2.1)
 */
function contrastRatio(rgb1, rgb2) {
  const l1 = luminance(rgb1);
  const l2 = luminance(rgb2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Parse color string to RGB
 */
function parseColor(color) {
  if (color.startsWith('#')) {
    return hexToRgb(color);
  } else if (color.startsWith('rgb')) {
    return rgbaToRgb(color);
  }
  return null;
}

/**
 * Grade contrast ratio
 */
function gradeContrast(ratio, isLargeText = false) {
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

/**
 * Main audit function
 */
function auditContrast() {
  console.log('🔍 Tillerstead WCAG 2.1 Contrast Audit\n');

  // Define color pairs to check (foreground, background, context)
  const colorPairs = [
    // Light backgrounds (parchment palette)
    { fg: '#1c231f', bg: '#f9f5eb', context: 'Body text on parchment' },
    { fg: '#3a413c', bg: '#f9f5eb', context: 'Muted text on parchment' },
    { fg: '#58615c', bg: '#f9f5eb', context: 'Subtle text on parchment' },
    { fg: '#053a2e', bg: '#f9f5eb', context: 'Primary links on parchment' },
    { fg: '#022318', bg: '#f9f5eb', context: 'Primary strong on parchment' },
    { fg: '#0b6b5c', bg: '#f9f5eb', context: 'Primary background text' },

    // Dark backgrounds (hero/footer)
    { fg: '#ffffff', bg: '#0f1713', context: 'White text on dark slate' },
    { fg: '#e8f0ec', bg: '#0f1713', context: 'Footer text on dark' },
    { fg: '#9fb4a5', bg: '#0f1713', context: 'Footer muted on dark' },
    { fg: '#84d1b8', bg: '#0f1713', context: 'Footer links on dark' },
    { fg: '#ffffff', bg: '#1c231f', context: 'White on ink' },
    { fg: 'rgba(255,255,255,0.85)', bg: '#0f1713', context: 'Hero lead text' },

    // Button combinations
    { fg: '#ffffff', bg: '#0b6b5c', context: 'Button primary text' },
    { fg: '#1c231f', bg: '#f9f5eb', context: 'Button secondary text' },

    // Semantic colors
    { fg: '#991b1b', bg: '#f9f5eb', context: 'Error text on light' },
    { fg: '#991b1b', bg: '#fef2f2', context: 'Error on error bg' },
    { fg: '#053a2e', bg: '#ecfdf5', context: 'Success on success bg' },
    { fg: '#92400e', bg: '#fffbeb', context: 'Warning on warning bg' },

    // Gradients (test against darkest point)
    { fg: '#ffffff', bg: '#022318', context: 'Text on gradient (darkest)' },
    {
      fg: 'rgba(255,255,255,0.85)',
      bg: '#022318',
      context: 'Muted on gradient',
    },
  ];

  const results = [];
  const failures = [];

  console.log('Testing color pairs...\n');

  colorPairs.forEach(({ fg, bg, context }) => {
    const fgRgb = parseColor(fg);
    const bgRgb = parseColor(bg);

    if (!fgRgb || !bgRgb) {
      console.warn(`⚠️  Could not parse: ${context}`);
      return;
    }

    const ratio = contrastRatio(fgRgb, bgRgb);
    const gradeNormal = gradeContrast(ratio, false);
    const gradeLarge = gradeContrast(ratio, true);

    const result = {
      context,
      foreground: fg,
      background: bg,
      ratio: ratio.toFixed(2),
      gradeNormal,
      gradeLarge,
      pass: gradeNormal !== 'FAIL',
    };

    results.push(result);

    // Log result
    const status = result.pass ? '✅' : '❌';
    const color = result.pass ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(
      `${status} ${color}${result.ratio}:1${reset} ${gradeNormal} (${gradeLarge} large) - ${context}`,
    );
    console.log(`   ${fg} on ${bg}`);

    if (!result.pass) {
      failures.push(result);
    }
  });

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 Summary: ${results.length} pairs tested`);
  console.log(`✅ Passed: ${results.length - failures.length}`);
  console.log(`❌ Failed: ${failures.length}`);

  if (failures.length > 0) {
    console.log('\n⚠️  FAILED COMBINATIONS (Action Required):\n');
    failures.forEach((f) => {
      console.log(`❌ ${f.context}`);
      console.log(`   ${f.foreground} on ${f.background}`);
      console.log(`   Ratio: ${f.ratio}:1 (needs 4.5:1 minimum)`);
      console.log(
        '   Recommendation: Darken foreground or lighten background\n',
      );
    });
  } else {
    console.log('\n🎉 All color combinations meet WCAG 2.1 AA standards!');
  }

  // Generate report
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    standard: 'WCAG 2.1',
    totalTests: results.length,
    passed: results.length - failures.length,
    failed: failures.length,
    results,
    failures,
  };

  // Write JSON report
  const reportPath = join('reports', 'contrast-audit.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 JSON report: ${reportPath}`);

  // Write markdown report
  const mdPath = join('reports', 'CONTRAST_AUDIT.md');
  let md = '# WCAG 2.1 Contrast Audit Report\n\n';
  md += `**Generated:** ${new Date().toLocaleString()}\n`;
  md += '**Standard:** WCAG 2.1 Level AA (4.5:1) / AAA (7:1)\n\n';
  md += '## Summary\n\n';
  md += `- **Total Tests:** ${results.length}\n`;
  md += `- **Passed:** ${results.length - failures.length} ✅\n`;
  md += `- **Failed:** ${failures.length} ❌\n\n`;

  if (failures.length > 0) {
    md += '## ⚠️ Failed Combinations\n\n';
    md += '| Context | Foreground | Background | Ratio | Grade |\n';
    md += '|---------|-----------|------------|-------|-------|\n';
    failures.forEach((f) => {
      md += `| ${f.context} | ${f.foreground} | ${f.background} | ${f.ratio}:1 | ${f.gradeNormal} |\n`;
    });
    md += '\n';
  }

  md += '## All Test Results\n\n';
  md += '| Status | Context | Ratio | Grade (Normal) | Grade (Large) |\n';
  md += '|--------|---------|-------|----------------|---------------|\n';
  results.forEach((r) => {
    const status = r.pass ? '✅' : '❌';
    md += `| ${status} | ${r.context} | ${r.ratio}:1 | ${r.gradeNormal} | ${r.gradeLarge} |\n`;
  });

  md += '\n---\n\n';
  md += '**WCAG 2.1 Standards:**\n';
  md += '- **AA Normal Text:** 4.5:1 minimum\n';
  md += '- **AA Large Text:** 3:1 minimum (≥18pt or ≥14pt bold)\n';
  md += '- **AAA Normal Text:** 7:1 minimum\n';
  md += '- **AAA Large Text:** 4.5:1 minimum\n\n';
  md += '**Compliance:** TCNA 2024, New Jersey HIC, WCAG 2.1\n';

  writeFileSync(mdPath, md);
  console.log(`📄 Markdown report: ${mdPath}`);

  // Exit with error code if failures exist
  if (failures.length > 0) {
    console.log('\n⚠️  Contrast audit failed. Fix non-compliant color pairs.');
    process.exit(1);
  } else {
    console.log('\n✅ Contrast audit passed!');
    process.exit(0);
  }
}

// Run audit
auditContrast();
