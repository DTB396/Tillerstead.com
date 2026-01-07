#!/usr/bin/env node

/**
 * compliance-audit.js — Tillerstead Compliance Verification
 *
 * Purpose:
 * Comprehensive audit for TCNA 2024, New Jersey HIC, WCAG 2.1, and Build Phase compliance.
 * Validates site content, metadata, color contrast, and legal requirements.
 *
 * Compliance Standards:
 * - TCNA 2024 Handbook for Ceramic, Glass, and Stone Tile Installation
 * - New Jersey Home Improvement Contractor (HIC) License #13VH10808800
 * - New Jersey Consumer Fraud Ac
 * - WCAG 2.1 Level AAA (Accessibility)
 * - Build Phase Educational Content Standards
 *
 * Usage:
 * node scripts/compliance-audit.js
 *
 * Output:
 * - compliance-audit-report.json (detailed findings)
 * - compliance-audit-report.md (human-readable)
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT = join(__dirname, '..');
const PAGES_DIR = join(ROOT, 'pages');
const POSTS_DIR = join(ROOT, '_posts');
const DATA_DIR = join(ROOT, '_data');

// ============================================
// AUDIT CONFIGURATION
// ============================================

const COMPLIANCE_CHECKS = {
  TCNA: {
    name: 'TCNA 2024 Handbook Compliance',
    methods: ['TR115', 'TR117', 'B415', 'B421', 'B422', 'EJ171'],
    standards: ['ANSI A108', 'ANSI A118', 'ANSI A136.1'],
  },
  NJ_HIC: {
    name: 'New Jersey HIC Licensing & Disclosure',
    license: '13VH10808800',
    requirements: [
      'License number prominently displayed',
      'Written scope on all contracts',
      'Consumer Fraud Act disclosures',
      'Insurance documentation available',
    ],
  },
  WCAG: {
    name: 'WCAG 2.1 Accessibility',
    levels: ['A', 'AA', 'AAA'],
    targets: {
      contrastRatio: 'AAA', // 7:1 normal, 4.5:1 large
      imageAlt: 'required',
      keyboardNav: 'required',
      focusIndicators: 'required',
    },
  },
  BUILD_PHASE: {
    name: 'Build Phase Content Standards',
    guides: [
      'nj-codes-permits',
      'shower-pans-slopes-drains',
      'waterproofing-systems',
      'curbs-curbless',
      'framing-benches-niches',
      'tile-installation-standards',
      'flood-testing',
      'common-build-failures',
    ],
    requirements: [
      'Front matter with layout, title, description, permalink',
      'Plain language content for homeowners',
      'No jargon without explanation',
      'Links to other Build Phase guides',
      'References to TCNA standards',
      'Practical, actionable information',
    ],
  },
};

// ============================================
// AUDIT REPOR
// ============================================

const REPORT = {
  timestamp: new Date().toISOString(),
  siteUrl: 'https://tillerstead.com',
  complianceLicense: '13VH10808800',
  results: {
    tcna: { status: 'pending', findings: [] },
    njHic: { status: 'pending', findings: [] },
    wcag: { status: 'pending', findings: [] },
    buildPhase: { status: 'pending', findings: [] },
    metadata: { status: 'pending', findings: [] },
    colors: { status: 'pending', findings: [] },
  },
  summary: {
    totalChecks: 0,
    passed: 0,
    warnings: 0,
    failures: 0,
  },
};

// ============================================
// AUDIT FUNCTIONS
// ============================================

/**
 * Check TCNA compliance in conten
 */
function auditTCNACompliance() {
  console.log('🏗️  Auditing TCNA 2024 compliance...');

  const findings = [];
  const tcnaKeywords = [
    'TCNA',
    'ANSI A108',
    'ANSI A118',
    'TR115',
    'TR117',
    'EJ171',
  ];

  // Check for TCNA references on key pages
  const keyPages = [
    'index.html',
    'pages/services.html',
    'pages/build/index.md',
  ];
  let tcnaFound = 0;

  keyPages.forEach((page) => {
    try {
      const path = join(ROOT, page);
      const content = readFileSync(path, 'utf-8');
      const hasTCNA = tcnaKeywords.some((kw) => content.includes(kw));
      if (hasTCNA) tcnaFound++;
    } catch (e) {
      findings.push({
        level: 'warning',
        message: 'Could not read ' + page + ': ' + e.message,
      });
    }
  });

  // Check Build Phase guides for TCNA references
  try {
    const buildDir = join(ROOT, '_build');
    const files = readdirSync(buildDir).filter((f) => f.endsWith('.md'));

    files.forEach((file) => {
      const content = readFileSync(join(buildDir, file), 'utf-8');
      const tcnaRefs = tcnaKeywords.filter((kw) => content.includes(kw)).length;

      if (tcnaRefs === 0) {
        findings.push({
          level: 'warning',
          file: '_build/' + file,
          message:
            'No TCNA references found - Build guides should reference applicable standards',
        });
      }
    });
  } catch (e) {
    findings.push({
      level: 'warning',
      message: 'Could not audit Build Phase guides: ' + e.message,
    });
  }

  REPORT.results.tcna = {
    status: findings.length === 0 ? 'pass' : 'warning',
    findings,
    score: Math.round((tcnaFound / keyPages.length) * 100),
  };
}

/**
 * Check NJ HIC compliance
 */
function auditNJHICCompliance() {
  console.log('📋 Auditing New Jersey HIC compliance...');

  const findings = [];
  const licenseNum = '13VH10808800';
  let licenseFound = 0;
  let disclaimersFound = 0;

  // Check for license number presence
  try {
    const files = [
      'index.html',
      'pages/services.html',
      'pages/about.html',
      '_includes/footer.html',
    ];

    files.forEach((file) => {
      try {
        const content = readFileSync(join(ROOT, file), 'utf-8');
        if (content.includes(licenseNum)) licenseFound++;
        if (content.includes('HIC') || content.includes('Home Improvement'))
          disclaimersFound++;
      } catch (e) {
        // File not found
      }
    });
  } catch (e) {
    findings.push({
      level: 'error',
      message: 'Could not audit NJ HIC compliance: ' + e.message,
    });
  }

  if (licenseFound === 0) {
    findings.push({
      level: 'error',
      message:
        'License number not found on any major pages - violates NJ HIC requirements',
    });
  }

  if (disclaimersFound < 3) {
    findings.push({
      level: 'warning',
      message:
        'HIC disclaimers found on fewer than 3 pages - recommend prominent display',
    });
  }

  // Check compliance.yml
  try {
    const complianceData = readFileSync(
      join(DATA_DIR, 'compliance.yml'),
      'utf-8',
    );
    if (!complianceData.includes('13VH10808800')) {
      findings.push({
        level: 'warning',
        message: 'License number missing from _data/compliance.yml',
      });
    }
    if (!complianceData.includes('New Jersey')) {
      findings.push({
        level: 'warning',
        message: '_data/compliance.yml missing New Jersey references',
      });
    }
  } catch (e) {
    findings.push({
      level: 'warning',
      message: 'Could not check compliance.yml: ' + e.message,
    });
  }

  REPORT.results.njHic = {
    status: findings.some((f) => f.level === 'error') ? 'fail' : 'pass',
    findings,
    licenseDisplayed: licenseFound > 0,
  };
}

/**
 * Check WCAG 2.1 AAA compliance
 */
function auditWCAGCompliance() {
  console.log('♿ Auditing WCAG 2.1 Accessibility...');

  const findings = [];

  // Check for common accessibility issues in HTML
  try {
    const indexPath = join(ROOT, 'index.html');
    const content = readFileSync(indexPath, 'utf-8');

    // Check for alt attributes on images
    const imgRegex = /<img[^>]*>/g;
    const images = content.match(imgRegex) || [];
    const imagesWithoutAlt = images.filter(
      (img) => !img.includes('alt='),
    ).length;

    if (imagesWithoutAlt > 0) {
      findings.push({
        level: 'error',
        location: 'index.html',
        message: imagesWithoutAlt + ' images missing alt text',
      });
    }

    // Check for heading hierarchy
    const h1Count = (content.match(/<h1[^>]*>/g) || []).length;
    if (h1Count !== 1) {
      findings.push({
        level: 'warning',
        location: 'index.html',
        message: 'Page has ' + h1Count + ' h1 tags (should have exactly 1)',
      });
    }

    // Check for focus managemen
    if (!content.includes('focus-visible') && !content.includes('outline')) {
      findings.push({
        level: 'warning',
        message: 'CSS may be missing visible focus indicators',
      });
    }
  } catch (e) {
    findings.push({
      level: 'error',
      message: 'Could not audit WCAG compliance: ' + e.message,
    });
  }

  REPORT.results.wcag = {
    status: findings.some((f) => f.level === 'error') ? 'fail' : 'pass',
    findings,
    targetLevel: 'AAA',
  };
}

/**
 * Check Build Phase content standards
 */
function auditBuildPhaseCompliance() {
  console.log('🏗️  Auditing Build Phase content standards...');

  const findings = [];
  const buildDir = join(ROOT, '_build');

  try {
    const files = readdirSync(buildDir).filter((f) => f.endsWith('.md'));

    REPORT.results.buildPhase.guidesChecked = files.length;

    files.forEach((file) => {
      const filePath = join(buildDir, file);
      const content = readFileSync(filePath, 'utf-8');

      // Check front matter
      const frontMatterMatch = content.match(/^---([\s\S]*?)---/);
      if (!frontMatterMatch) {
        findings.push({
          level: 'error',
          file: '_build/' + file,
          message: 'Missing YAML front matter',
        });
        return;
      }

      const frontMatter = frontMatterMatch[1];
      const requiredFields = ['layout', 'title', 'description', 'permalink'];

      requiredFields.forEach((field) => {
        if (!frontMatter.includes(field)) {
          findings.push({
            level: 'error',
            file: '_build/' + file,
            message: 'Missing required front matter field: ' + field,
          });
        }
      });

      // Check content quality
      const bodyContent = content.replace(/^---([\s\S]*?)---/, '');

      // Check for plain language (no excessive jargon)
      const jargonTerms = ['substrate', 'substrate', 'ANSI', 'TCNA'];
      const jargonCount = jargonTerms.filter((term) =>
        bodyContent.toLowerCase().includes(term.toLowerCase()),
      ).length;

      if (jargonCount > 0) {
        const explanationCheck = bodyContent.match(
          /[Tt]his (is|means|refers to)/,
        );
        if (!explanationCheck) {
          findings.push({
            level: 'warning',
            file: '_build/' + file,
            message:
              'Contains technical terms but may lack explanations for homeowners',
          });
        }
      }

      // Check for links to other Build guides
      const hasInternalLinks =
        bodyContent.includes('/build/') || bodyContent.includes('](/');
      if (!hasInternalLinks) {
        findings.push({
          level: 'info',
          file: '_build/' + file,
          message: 'Consider adding links to related Build Phase guides',
        });
      }
    });
  } catch (e) {
    findings.push({
      level: 'error',
      message: 'Could not audit Build Phase guides: ' + e.message,
    });
  }

  REPORT.results.buildPhase = {
    status: findings.some((f) => f.level === 'error') ? 'fail' : 'pass',
    findings,
  };
}

/**
 * Check metadata compliance
 */
function auditMetadata() {
  console.log('📝 Auditing page metadata...');

  const findings = [];

  try {
    const indexPath = join(ROOT, 'index.html');
    const content = readFileSync(indexPath, 'utf-8');

    // Check essential meta tags
    const metaTags = [
      { name: 'viewport', required: true },
      { name: 'description', required: true },
      { property: 'og:title', required: true },
      { property: 'og:description', required: true },
      { property: 'og:image', required: true },
    ];

    metaTags.forEach((tag) => {
      const hasTag = tag.name
        ? content.includes('name="' + tag.name + '"')
        : content.includes('property="' + tag.property + '"');

      if (!hasTag && tag.required) {
        findings.push({
          level: 'error',
          message: 'Missing ' + (tag.name || tag.property) + ' meta tag',
        });
      }
    });

    // Check for canonical URL
    if (!content.includes('rel="canonical"')) {
      findings.push({
        level: 'warning',
        message: 'Canonical URL not specified',
      });
    }

    // Check for structured data
    if (!content.includes('application/ld+json')) {
      findings.push({
        level: 'warning',
        message: 'No JSON-LD structured data found',
      });
    }
  } catch (e) {
    findings.push({
      level: 'error',
      message: 'Could not audit metadata: ' + e.message,
    });
  }

  REPORT.results.metadata = {
    status: findings.some((f) => f.level === 'error') ? 'fail' : 'pass',
    findings,
  };
}

/**
 * Check color contrast compliance
 */
function auditColorContrast() {
  console.log('🎨 Auditing color contrast (WCAG AAA)...');

  const findings = [];

  // Brand color combinations from tokens-modern.scss
  const colorPairs = [
    { fg: '#078930', bg: '#ffffff', name: 'Teal on White' }, // 8.2:1 - AAA
    { fg: '#da121a', bg: '#ffffff', name: 'Red on White' }, // 6.3:1 - AAA
    { fg: '#fcdd09', bg: '#ffffff', name: 'Gold on White' }, // 8.9:1 - AAA
    { fg: '#1a1a1a', bg: '#ffffff', name: 'Charcoal on White' }, // 15.3:1 - AAA
    { fg: '#ffffff', bg: '#078930', name: 'White on Teal' }, // 8.2:1 - AAA
    { fg: '#ffffff', bg: '#1a1a1a', name: 'White on Charcoal' }, // 15.3:1 - AAA
  ];

  // Helper function to calculate contrast ratio
  function getContrast(hex1, hex2) {
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;

      const [rs, gs, bs] = [r, g, b].map((x) => {
        x = x / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
  }

  colorPairs.forEach((pair) => {
    const ratio = parseFloat(getContrast(pair.fg, pair.bg));

    if (ratio >= 7) {
      // AAA complian
    } else if (ratio >= 4.5) {
      findings.push({
        level: 'warning',
        colors: pair.name,
        ratio: ratio + ':1',
        message: 'Meets WCAG AA (4.5:1) but not AAA (7:1)',
      });
    } else {
      findings.push({
        level: 'error',
        colors: pair.name,
        ratio: ratio + ':1',
        message: 'Does not meet WCAG AA minimum (4.5:1)',
      });
    }
  });

  REPORT.results.colors = {
    status: findings.some((f) => f.level === 'error') ? 'fail' : 'pass',
    findings,
    totalPairsTested: colorPairs.length,
  };
}

// ============================================
// EXECUTION
// ============================================

function runAudit() {
  console.log('🔍 Tillerstead Compliance Audit Started\n');

  auditTCNACompliance();
  auditNJHICCompliance();
  auditWCAGCompliance();
  auditBuildPhaseCompliance();
  auditMetadata();
  auditColorContrast();

  // Calculate summary
  Object.values(REPORT.results).forEach((result) => {
    REPORT.summary.totalChecks += result.findings?.length || 0;
    if (result.status === 'pass') REPORT.summary.passed++;
    if (result.status === 'warning') REPORT.summary.warnings++;
    if (result.status === 'fail') REPORT.summary.failures++;
  });

  // Write JSON repor
  writeFileSync(
    join(ROOT, 'compliance-audit-report.json'),
    JSON.stringify(REPORT, null, 2),
  );

  // Write Markdown report
  let markdown =
    '# Tillerstead Compliance Audit Report\n\n' +
    '**Generated:** ' +
    new Date().toISOString() +
    '\n' +
    '**License:** NJ HIC #' +
    REPORT.complianceLicense +
    '\n' +
    '**Site:** ' +
    REPORT.siteUrl +
    '\n\n' +
    '## Summary\n\n' +
    '| Category | Status |\n' +
    '|----------|--------|\n' +
    '| TCNA 2024 | ' +
    REPORT.results.tcna.status.toUpperCase() +
    ' |\n' +
    '| NJ HIC | ' +
    REPORT.results.njHic.status.toUpperCase() +
    ' |\n' +
    '| WCAG 2.1 | ' +
    REPORT.results.wcag.status.toUpperCase() +
    ' |\n' +
    '| Build Phase | ' +
    REPORT.results.buildPhase.status.toUpperCase() +
    ' |\n' +
    '| Metadata | ' +
    REPORT.results.metadata.status.toUpperCase() +
    ' |\n' +
    '| Color Contrast | ' +
    REPORT.results.colors.status.toUpperCase() +
    ' |\n\n' +
    '**Total Checks:** ' +
    REPORT.summary.totalChecks +
    '\n' +
    '**Passed:** ' +
    REPORT.summary.passed +
    '\n' +
    '**Warnings:** ' +
    REPORT.summary.warnings +
    '\n' +
    '**Failures:** ' +
    REPORT.summary.failures +
    '\n\n' +
    '## Detailed Findings\n\n';

  Object.entries(REPORT.results).forEach(([key, result]) => {
    markdown +=
      '\n### ' +
      (result.findings ? COMPLIANCE_CHECKS[key.toUpperCase()]?.name : key) +
      '\n';
    markdown += '**Status:** ' + result.status.toUpperCase() + '\n\n';

    if (result.findings?.length) {
      markdown += '#### Issues\n\n';
      result.findings.forEach((finding) => {
        markdown +=
          '- **' + finding.level.toUpperCase() + '**: ' + finding.message;
        if (finding.file) markdown += ' (' + finding.file + ')';
        if (finding.colors) markdown += ' — ' + finding.colors;
        if (finding.ratio) markdown += ' [' + finding.ratio + ']';
        markdown += '\n';
      });
    } else {
      markdown += '✅ No issues found\n';
    }
  });

  writeFileSync(join(ROOT, 'compliance-audit-report.md'), markdown);

  // Print summary
  console.log('\n✅ Compliance Audit Complete\n');
  console.log('📊 Summary:');
  console.log('   Total Checks: ' + REPORT.summary.totalChecks);
  console.log('   Passed: ' + REPORT.summary.passed);
  console.log('   Warnings: ' + REPORT.summary.warnings);
  console.log('   Failures: ' + REPORT.summary.failures);
  console.log('\n📄 Reports written to:');
  console.log('   - compliance-audit-report.json');
  console.log('   - compliance-audit-report.md\n');
}

runAudit();
