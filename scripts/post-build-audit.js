#!/usr/bin/env node

/**
 * Post-Build HTML Audit
 * Checks generated _site for real accessibility and performance issues
 * - H1 presence and hierarchy
 * - Alt text completeness
 * - Mobile viewport meta
 * - Image dimensions
 * - Form accessibility
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const results = {
  pages: [],
  stats: {
    totalPages: 0,
    totalIssues: 0,
    imageStats: { total: 0, withAlt: 0, withoutAlt: 0 },
    byType: {},
  },
};

function scanBuiltPage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative('_site', filePath);
    const issues = [];

    // 1. Check H1
    const h1s = content.match(/<h1[^>]*>/gi) || [];
    if (h1s.length === 0) {
      issues.push({ type: 'no-h1', severity: 'error' });
    } else if (h1s.length > 1) {
      issues.push({
        type: 'multiple-h1',
        severity: 'warning',
        count: h1s.length,
      });
    }

    // 2. Check heading order
    const headingOrder = [];
    const hRegex = /<h([1-6])[^>]*>/gi;
    let match;
    while ((match = hRegex.exec(content)) !== null) {
      headingOrder.push(parseInt(match[1]));
    }

    for (let i = 1; i < headingOrder.length; i++) {
      const diff = headingOrder[i] - headingOrder[i - 1];
      if (diff > 1) {
        issues.push({
          type: 'heading-skip',
          severity: 'warning',
          from: `h${headingOrder[i - 1]}`,
          to: `h${headingOrder[i]}`,
        });
        break; // Only report first skip
      }
    }

    // 3. Image alt text
    const imgRegex = /<img[^>]*>/gi;
    const images = content.match(imgRegex) || [];
    let withAlt = 0;
    images.forEach((img) => {
      if (img.includes('alt=') && !img.includes('alt=""')) {
        withAlt++;
      } else {
        issues.push({ type: 'missing-alt', severity: 'error' });
      }
    });

    results.stats.imageStats.total += images.length;
    results.stats.imageStats.withAlt += withAlt;
    results.stats.imageStats.withoutAlt += images.length - withAlt;

    // 4. Viewport meta
    if (!content.includes('name="viewport"')) {
      issues.push({ type: 'no-viewport', severity: 'error' });
    }

    // 5. Form inputs with labels
    const inputs = content.match(/<input[^>]*>/gi) || [];
    inputs.forEach((input) => {
      if (input.match(/type=['"](?:text|email|tel|password)/i)) {
        if (
          !input.includes('aria-label') &&
          !input.includes('aria-describedby')
        ) {
          // Check if there's an associated label
          const inputId = input.match(/id=['"]([^'"]+)/i);
          if (inputId) {
            const hasLabel = content.includes(`for="${inputId[1]}"`);
            if (!hasLabel) {
              issues.push({ type: 'unlabeled-input', severity: 'warning' });
            }
          } else {
            issues.push({ type: 'unlabeled-input', severity: 'warning' });
          }
        }
      }
    });

    // 6. Image dimensions
    const imgWithoutDimensions = (
      content.match(/<img(?!.*(?:width|height))[^>]*>/gi) || []
    ).length;
    if (imgWithoutDimensions > 0) {
      issues.push({
        type: 'img-no-dimensions',
        severity: 'info',
        count: imgWithoutDimensions,
      });
    }

    // 7. Lazy loading
    const imgWithoutLazy = (content.match(/<img(?!.*loading)[^>]*>/gi) || [])
      .length;
    if (imgWithoutLazy > 0 && images.length > 3) {
      issues.push({
        type: 'missing-lazy-load',
        severity: 'info',
        count: imgWithoutLazy,
      });
    }

    // 8. Color contrast candidates (inline styles with color)
    const styleWithColor = (content.match(/style="[^"]*color:/gi) || []).length;
    if (styleWithColor > 0) {
      issues.push({
        type: 'inline-color-styles',
        severity: 'info',
        count: styleWithColor,
      });
    }

    return {
      page: relativePath,
      h1Count: h1s.length,
      imageCount: images.length,
      imageWithAlt: withAlt,
      headingOrder: headingOrder.slice(0, 10),
      issueCount: issues.length,
      issues: issues,
    };
  } catch (err) {
    return {
      page: filePath,
      error: err.message,
    };
  }
}

function audit() {
  console.log('🔍 Scanning built HTML files in _site...\n');

  const pages = globSync('_site/**/*.html').filter(
    (f) => !f.includes('/assets/'),
  );

  pages.forEach((page) => {
    const result = scanBuiltPage(page);
    if (!result.error) {
      results.pages.push(result);
      results.stats.totalPages++;
      results.stats.totalIssues += result.issueCount;

      result.issues.forEach((issue) => {
        if (!results.stats.byType[issue.type]) {
          results.stats.byType[issue.type] = 0;
        }
        results.stats.byType[issue.type]++;
      });
    }
  });

  generateReport();
}

function generateReport() {
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = path.join('reports', `post-build-audit-${timestamp}.md`);

  let md = '# Post-Build HTML Audit Report\n\n';
  md += `**Date:** ${new Date().toLocaleDateString()}\n\n`;

  md += '## Summary\n\n';
  md += `- **Pages Scanned:** ${results.stats.totalPages}\n`;
  md += `- **Total Issues Found:** ${results.stats.totalIssues}\n`;
  md += `- **Images Total:** ${results.stats.imageStats.total}\n`;
  md += `- **Images with Alt Text:** ${results.stats.imageStats.withAlt} (${Math.round((results.stats.imageStats.withAlt / results.stats.imageStats.total) * 100)}%)\n`;
  md += `- **Images Missing Alt:** ${results.stats.imageStats.withoutAlt}\n\n`;

  md += '## Issues by Type\n\n';
  Object.entries(results.stats.byType).forEach(([type, count]) => {
    md += `- ${type}: ${count}\n`;
  });

  md += '\n## Pages with Critical Issues\n\n';
  const errors = results.pages.filter((p) =>
    p.issues?.some((i) => i.severity === 'error'),
  );
  if (errors.length === 0) {
    md += 'None! ✓\n\n';
  } else {
    errors.forEach((page) => {
      md += `### ${page.page}\n`;
      md += `- H1 Count: ${page.h1Count}\n`;
      page.issues
        .filter((i) => i.severity === 'error')
        .forEach((issue) => {
          md += `- ❌ ${issue.type}\n`;
        });
      md += '\n';
    });
  }

  md += '\n## Top Pages by Issue Count\n\n';
  const sorted = results.pages
    .filter((p) => p.issueCount > 0)
    .sort((a, b) => b.issueCount - a.issueCount);
  sorted.slice(0, 10).forEach((page) => {
    md += `- ${page.page}: ${page.issueCount} issue(s)\n`;
  });

  // Save report
  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports', { recursive: true });
  }
  fs.writeFileSync(reportPath, md);

  console.log('\n✅ Post-build audit complete!');
  console.log('📊 Results:');
  console.log(`   Pages: ${results.stats.totalPages}`);
  console.log(`   Total issues: ${results.stats.totalIssues}`);
  console.log(
    `   Alt text coverage: ${Math.round((results.stats.imageStats.withAlt / results.stats.imageStats.total) * 100)}%\n`,
  );
  console.log(`📄 Report: ${reportPath}`);
}

audit();
