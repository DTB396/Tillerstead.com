#!/usr/bin/env node

/**
 * Comprehensive UX & Accessibility Audit
 * Checks all pages, posts, layouts for:
 * - Semantic HTML5
 * - Heading hierarchy
 * - Image alt text
 * - Form accessibility
 * - Responsive design markers
 * - CSS variable usage
 * - Performance indicators
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const results = {
  pages: [],
  posts: [],
  layouts: [],
  includes: [],
  issues: [],
  stats: {
    totalFiles: 0,
    filesWithIssues: 0,
    totalIssues: 0,
    byCategory: {},
  },
};

const SEMANTIC_TAGS = [
  'header',
  'nav',
  'main',
  'section',
  'article',
  'aside',
  'footer',
];
const ISSUE_CATEGORIES = {
  MISSING_ALT: 'Missing alt text',
  HEADING_HIERARCHY: 'Heading hierarchy issue',
  MISSING_LANG: 'Missing language attribute',
  FORM_LABEL: 'Form input without label',
  NO_VIEWPORT: 'Missing viewport meta',
  UNQUOTED_ATTR: 'Unquoted HTML attributes',
  MISSING_TITLE: 'Missing page title',
  NO_SEMANTIC: 'Missing semantic HTML',
  CONTRAST_RISK: 'Potential contrast issue',
  MOBILE_VIEWPORT: 'Missing mobile viewport markers',
  HARD_CODED_SIZE: 'Hard-coded pixel sizes (not responsive)',
  MISSING_ARIA: 'Missing ARIA attributes for interactive elements',
};

function scanFile(filePath, type) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative('.', filePath);
    const fileIssues = [];

    // 1. Check for semantic HTML (layouts only)
    if (type === 'layouts') {
      const hasSemanticTags = SEMANTIC_TAGS.some((tag) =>
        content.includes(`<${tag}`),
      );
      if (!hasSemanticTags) {
        fileIssues.push({
          category: 'NO_SEMANTIC',
          message:
            'Missing semantic HTML5 tags (header, nav, main, section, footer)',
          severity: 'warning',
        });
      }
    }

    // 2. Check for missing alt text on images
    const imgRegex = /<img[^>]*>/gi;
    const images = content.match(imgRegex) || [];
    images.forEach((img, idx) => {
      if (!img.includes('alt=') || img.includes('alt=""')) {
        fileIssues.push({
          category: 'MISSING_ALT',
          message: `Image ${idx + 1} missing or empty alt text`,
          severity: 'error',
          line: content.substring(0, content.indexOf(img)).split('\n').length,
        });
      }
    });

    // 3. Check heading hierarchy
    const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
    const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
    const h3Plus = (
      content.match(/<h3[^>]*>|<h4[^>]*>|<h5[^>]*>|<h6[^>]*>/gi) || []
    ).length;

    if (type === 'pages' && h1Count === 0) {
      fileIssues.push({
        category: 'HEADING_HIERARCHY',
        message: 'Page has no H1 tag',
        severity: 'error',
      });
    }
    if (h1Count > 1) {
      fileIssues.push({
        category: 'HEADING_HIERARCHY',
        message: `Multiple H1 tags found (${h1Count}) - should be one per page`,
        severity: 'warning',
      });
    }

    // 4. Check for form inputs without labels
    const inputRegex = /<input[^>]*>/gi;
    const inputs = content.match(inputRegex) || [];
    inputs.forEach((input, idx) => {
      if (!input.includes('aria-label') && !input.includes('id=')) {
        fileIssues.push({
          category: 'FORM_LABEL',
          message: `Input ${idx + 1} missing aria-label or id for label association`,
          severity: 'warning',
        });
      }
    });

    // 5. Check viewport meta (pages/layouts)
    if (
      (type === 'pages' || type === 'layouts') &&
      !content.includes('viewport')
    ) {
      fileIssues.push({
        category: 'NO_VIEWPORT',
        message: 'Missing viewport meta tag',
        severity: 'warning',
      });
    }

    // 6. Check for unquoted attributes
    const unquotedAttrRegex = /\s\w+=(?!["'])/g;
    if (content.match(unquotedAttrRegex)) {
      fileIssues.push({
        category: 'UNQUOTED_ATTR',
        message: 'HTML attributes with unquoted values found',
        severity: 'warning',
        count: content.match(unquotedAttrRegex).length,
      });
    }

    // 7. Check for responsive design classes/utilities
    const hasResponsive =
      /class="[^"]*(?:sm:|md:|lg:|xl:|max-|flex-|grid-)[^"]*"/i.test(content);

    if (!hasResponsive && type !== 'includes') {
      fileIssues.push({
        category: 'MOBILE_VIEWPORT',
        message: 'No responsive design classes detected',
        severity: 'info',
      });
    }

    // 8. Check for interactive elements with ARIA
    const clickableDiv = (content.match(/<div[^>]*onclick/gi) || []).length;
    if (clickableDiv > 0) {
      fileIssues.push({
        category: 'MISSING_ARIA',
        message: `${clickableDiv} div(s) with onclick - should use <button>`,
        severity: 'warning',
      });
    }

    // 9. Check for hard-coded pixel sizes
    const hardCodedPx =
      content.match(/(?:width|height|padding|margin):\s*\d+px/gi) || [];
    if (hardCodedPx.length > 3) {
      fileIssues.push({
        category: 'HARD_CODED_SIZE',
        message: `${hardCodedPx.length} hard-coded pixel values found (use CSS variables)`,
        severity: 'warning',
        count: hardCodedPx.length,
      });
    }

    // 10. Page-specific: Check for title tag
    if (type === 'pages' && !content.includes('<title>')) {
      fileIssues.push({
        category: 'MISSING_TITLE',
        message: 'Missing <title> tag',
        severity: 'error',
      });
    }

    return {
      file: relativePath,
      type: type,
      issueCount: fileIssues.length,
      issues: fileIssues,
      stats: {
        images: images.length,
        inputs: inputs.length,
        headings: h1Count + h2Count + h3Plus,
      },
    };
  } catch (err) {
    return {
      file: filePath,
      type: type,
      error: err.message,
      issueCount: 1,
    };
  }
}

function audit() {
  console.log('🔍 Starting comprehensive UX audit...\n');

  const patterns = {
    pages: 'pages/**/*.html',
    posts: '_posts/**/*.md',
    layouts: '_layouts/**/*.html',
    includes: '_includes/**/*.html',
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    const files = globSync(pattern);

    files.forEach((file) => {
      const result = scanFile(file, type);
      if (result.error) {
        console.error(`✗ Error scanning ${file}: ${result.error}`);
      } else {
        results[type].push(result);
        results.stats.totalFiles++;

        if (result.issueCount > 0) {
          results.stats.filesWithIssues++;
          results.stats.totalIssues += result.issueCount;

          result.issues.forEach((issue) => {
            if (!results.stats.byCategory[issue.category]) {
              results.stats.byCategory[issue.category] = 0;
            }
            results.stats.byCategory[issue.category]++;
            results.issues.push({
              file: result.file,
              type: result.type,
              ...issue,
            });
          });
        }
      }
    });
  }

  // Generate report
  generateReport();
  return results;
}

function generateReport() {
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = path.join('reports', `ux-audit-${timestamp}.json`);
  const mdPath = path.join('reports', `ux-audit-${timestamp}.md`);

  // Ensure reports dir exists
  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports', { recursive: true });
  }

  // JSON report
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  // Markdown report
  let md = '# UX & Accessibility Audit Report\n\n';
  md += `**Date:** ${new Date().toLocaleDateString()}\n\n`;

  md += '## Summary\n\n';
  md += `- **Total Files Scanned:** ${results.stats.totalFiles}\n`;
  md += `- **Files with Issues:** ${results.stats.filesWithIssues}\n`;
  md += `- **Total Issues:** ${results.stats.totalIssues}\n\n`;

  md += '## Issues by Category\n\n';
  Object.entries(results.stats.byCategory).forEach(([cat, count]) => {
    md += `- ${ISSUE_CATEGORIES[cat] || cat}: ${count}\n`;
  });

  md += '\n## Critical Issues (Errors)\n\n';
  const errors = results.issues.filter((i) => i.severity === 'error');
  if (errors.length === 0) {
    md += 'None found! ✓\n\n';
  } else {
    errors.forEach((issue) => {
      md += `### ${issue.file}\n`;
      md += `- **${issue.category}**: ${issue.message}\n`;
    });
    md += '\n';
  }

  md += '## Warnings\n\n';
  const warnings = results.issues.filter((i) => i.severity === 'warning');
  warnings.slice(0, 20).forEach((issue) => {
    md += `- ${issue.file}: ${issue.message}\n`;
  });
  if (warnings.length > 20) {
    md += `\n... and ${warnings.length - 20} more warnings\n`;
  }

  fs.writeFileSync(mdPath, md);

  console.log('\n✅ Audit complete!');
  console.log('📊 Summary:');
  console.log(`   Files scanned: ${results.stats.totalFiles}`);
  console.log(`   Files with issues: ${results.stats.filesWithIssues}`);
  console.log(`   Total issues: ${results.stats.totalIssues}`);
  console.log('\n📄 Reports generated:');
  console.log(`   - ${reportPath}`);
  console.log(`   - ${mdPath}`);
}

// Run audit
audit();
