#!/usr/bin/env node

/**
 * Phase 2: Heading Hierarchy Audit & Fixer
 * Identifies logical heading flow issues (h1 → h2 → h3, not h1 → h4)
 */

import fs from 'fs';
import path from 'path';

const results = {
  pages: [],
  issues: [],
  stats: {
    totalPages: 0,
    pagesWithIssues: 0,
    headingSkips: 0,
    multipleH1s: 0,
    noH1: 0,
  },
};

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function analyzeHeadingHierarchy(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative('.', filePath);

    // Extract heading levels
    const headingRegex = /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/g;
    const headings = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      const text = match[3].substring(0, 100).trim();
      headings.push({ level, text, index: match.index });
    }

    const issues = [];
    const h1Count = headings.filter((h) => h.level === 1).length;

    // Check for multiple H1s
    if (h1Count > 1) {
      issues.push({
        type: 'multiple-h1',
        severity: 'error',
        count: h1Count,
      });
      results.stats.multipleH1s++;
    }

    // Check for no H1 (skip includes)
    if (h1Count === 0 && !filePath.includes('_includes')) {
      issues.push({
        type: 'no-h1',
        severity: 'error',
      });
      results.stats.noH1++;
    }

    // Check heading order
    for (let i = 1; i < headings.length; i++) {
      const prev = headings[i - 1].level;
      const curr = headings[i].level;
      const diff = curr - prev;

      // Skip more than 1 level (except h2 after h1, h3 after h2, etc.)
      if (diff > 1 && prev !== 0) {
        issues.push({
          type: 'heading-skip',
          severity: 'warning',
          from: `h${prev}`,
          to: `h${curr}`,
          text: `${headings[i - 1].text} → ${headings[i].text}`,
          index: i,
        });
        results.stats.headingSkips++;
      }
    }

    return {
      file: relativePath,
      h1Count,
      headingCount: headings.length,
      headings: headings.slice(0, 10),
      issues,
      issueCount: issues.length,
    };
  } catch (err) {
    return {
      file: filePath,
      error: err.message,
    };
  }
}

function audit() {
  console.log('🔍 Analyzing heading hierarchy...\n');

  const pages = getAllHtmlFiles('pages').filter((f) => !f.includes('.bak'));

  pages.forEach((page) => {
    const result = analyzeHeadingHierarchy(page);
    if (!result.error) {
      results.pages.push(result);
      results.stats.totalPages++;

      if (result.issueCount > 0) {
        results.stats.pagesWithIssues++;
        result.issues.forEach((issue) => {
          results.issues.push({
            file: result.file,
            ...issue,
          });
        });
      }
    }
  });

  generateReport();
}

function generateReport() {
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = path.join('reports', `heading-audit-${timestamp}.md`);

  let md = '# Phase 2: Heading Hierarchy Audit Report\n\n';
  md += `**Date:** ${new Date().toLocaleDateString()}\n\n`;

  md += '## Summary\n\n';
  md += `- **Pages Audited:** ${results.stats.totalPages}\n`;
  md += `- **Pages with Issues:** ${results.stats.pagesWithIssues}\n`;
  md += `- **Multiple H1s Found:** ${results.stats.multipleH1s}\n`;
  md += `- **Missing H1s:** ${results.stats.noH1}\n`;
  md += `- **Heading Skips:** ${results.stats.headingSkips}\n\n`;

  md += '## Pages with Issues\n\n';
  results.pages
    .filter((p) => p.issueCount > 0)
    .forEach((page) => {
      md += `### ${page.file}\n`;
      md += `- H1 Count: ${page.h1Count}\n`;
      md += `- Total Headings: ${page.headingCount}\n`;
      md += `- Issues: ${page.issueCount}\n\n`;

      page.issues.forEach((issue) => {
        if (issue.type === 'heading-skip') {
          md += `- ⚠️ **Skip**: ${issue.from} → ${issue.to}\n`;
          const parts = issue.text.split(' → ');
          if (parts[0]) md += `  - Before: "${parts[0].substring(0, 60)}"\n`;
          if (parts[1]) md += `  - After: "${parts[1].substring(0, 60)}"\n`;
        } else {
          md += `- ❌ **${issue.type}**: ${issue.count ? `found ${issue.count}` : 'not found'}\n`;
        }
      });
      md += '\n';
    });

  md += '## All Pages with Heading Structure\n\n';
  results.pages.forEach((page) => {
    if (page.headings && page.headings.length > 0) {
      md += `### ${page.file}\n`;
      page.headings.forEach((h) => {
        const indent = '  '.repeat(h.level - 1);
        md += `${indent}- H${h.level}: ${h.text}\n`;
      });
      md += '\n';
    }
  });

  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports', { recursive: true });
  }
  fs.writeFileSync(reportPath, md);

  console.log('✅ Heading audit complete!');
  console.log('📊 Results:');
  console.log(`   Pages: ${results.stats.totalPages}`);
  console.log(`   Issues: ${results.stats.pagesWithIssues}`);
  console.log(`   Heading skips: ${results.stats.headingSkips}\n`);
  console.log(`📄 Report: ${reportPath}`);
}

audit();
