#!/usr/bin/env node

/**
 * Phase 2: Image Alt Text Audit
 * Identifies images missing descriptive alt text
 */

import fs from 'fs';
import path from 'path';

const results = {
  files: [],
  images: [],
  stats: {
    total: 0,
    withAlt: 0,
    withoutAlt: 0,
  },
};

function getAllFiles(dir, ext, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.')) {
      getAllFiles(filePath, ext, fileList);
    } else if (file.endsWith(ext)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function auditImages() {
  console.log('🔍 Scanning for images without alt text...\n');

  const htmlFiles = getAllFiles('pages', '.html').filter(
    (f) => !f.includes('.bak'),
  );

  htmlFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative('.', file);

    // Find all img tags
    const imgRegex = /<img[^>]*>/gi;
    let match;
    const images = [];

    while ((match = imgRegex.exec(content)) !== null) {
      const img = match[0];
      const hasAlt = /alt=["']([^"']*)["']/i.test(img);
      const alt = hasAlt ? img.match(/alt=["']([^"']*)["']/i)[1] : '';
      const src = img.match(/src=["']([^"']*)["']/i)?.[1] || 'unknown';

      results.stats.total++;

      if (hasAlt && alt.trim()) {
        results.stats.withAlt++;
        images.push({ src, alt, status: 'OK' });
      } else {
        results.stats.withoutAlt++;
        images.push({
          src,
          alt: '',
          status: 'MISSING',
          fullTag: img.substring(0, 150),
        });
      }
    }

    if (images.some((i) => i.status === 'MISSING')) {
      results.files.push({
        file: relativePath,
        images,
        issueCount: images.filter((i) => i.status === 'MISSING').length,
      });
    }

    results.images.push(...images);
  });

  generateReport();
}

function generateReport() {
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = path.join('reports', `image-alt-audit-${timestamp}.md`);

  let md = '# Phase 2: Image Alt Text Audit Report\n\n';
  md += `**Date:** ${new Date().toLocaleDateString()}\n\n`;

  md += '## Summary\n\n';
  md += `- **Total Images Found:** ${results.stats.total}\n`;
  md += `- **With Alt Text:** ${results.stats.withAlt} (${Math.round((results.stats.withAlt / results.stats.total) * 100)}%)\n`;
  md += `- **Missing Alt Text:** ${results.stats.withoutAlt} (${Math.round((results.stats.withoutAlt / results.stats.total) * 100)}%)\n\n`;

  md += '## Files with Missing Alt Text\n\n';
  results.files.forEach((file) => {
    md += `### ${file.file}\n`;
    md += `**Issues: ${file.issueCount}**\n\n`;

    file.images
      .filter((i) => i.status === 'MISSING')
      .forEach((img, idx) => {
        md += `#### Image ${idx + 1}\n`;
        md += `- **Source:** ${img.src}\n`;
        md += '- **Status:** ❌ Missing alt text\n';
        md += `- **Tag:** \`${img.fullTag}...\`\n\n`;
      });
  });

  md += '## Recommendations\n\n';
  md += '### Alt Text Guidelines\n';
  md += '- **Be descriptive:** Not "image.jpg" but "Large format porcelain tile..."\n';
  md += '- **Include context:** What the image shows + why it matters\n';
  md += '- **TCNA specific:** Reference installation methods, standards when relevant\n';
  md += '- **Length:** 50-125 characters (for accessibility)\n\n';

  md += '### Example Alt Texts for Tile Work\n';
  md += '- "Large format porcelain shower tile installed with integrated waterproofing membrane"\n';
  md += '- "Natural stone bathroom floor with herringbone pattern and sealed substrate"\n';
  md += '- "Backsplash detail showing grout joint and mortar bed for kitchen installation"\n';
  md += '- "Before and after: bathroom remodeling with heated tile flooring system"\n\n';

  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports', { recursive: true });
  }
  fs.writeFileSync(reportPath, md);

  console.log('✅ Image audit complete!');
  console.log('📊 Results:');
  console.log(`   Total images: ${results.stats.total}`);
  console.log(`   Missing alt: ${results.stats.withoutAlt}`);
  console.log(
    `   Coverage: ${Math.round((results.stats.withAlt / results.stats.total) * 100)}%\n`,
  );
  console.log(`📄 Report: ${reportPath}`);
}

auditImages();
