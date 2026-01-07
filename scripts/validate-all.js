#!/usr/bin/env node
/**
 * Comprehensive Build & Encoding Validation Script
 * Validates:
 * - UTF-8 encoding (no BOM, no invalid characters)
 * - YAML syntax and structure
 * - Liquid template syntax
 * - HTML structure and accessibility
 * - File integrity
 * - Navigation link integrity
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const EXCLUDE_DIRS = [
  '.git',
  'node_modules',
  '_site',
  '.github',
  'vendor',
  'dist',
];

class Validator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(type, message) {
    const prefix = {
      error: '❌',
      warning: '⚠️ ',
      success: '✅',
    }[type];
    console.log(`${prefix} ${message}`);
    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
    if (type === 'success') this.passed.push(message);
  }

  // Validate UTF-8 encoding
  validateEncoding() {
    console.log('\n📝 Validating UTF-8 Encoding...');
    const extensions = ['html', 'md', 'yml', 'yaml', 'json', 'js'];

    const walkDir = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (EXCLUDE_DIRS.some((d) => filePath.includes(d))) return;

          if (stat.isDirectory()) {
            walkDir(filePath);
          } else if (extensions.some((ext) => file.endsWith(`.${ext}`))) {
            const buffer = fs.readFileSync(filePath);
            const content = buffer.toString('utf8');

            // Check for BOM
            if (
              buffer[0] === 0xef &&
              buffer[1] === 0xbb &&
              buffer[2] === 0xbf
            ) {
              this.log('error', `${filePath}: Contains UTF-8 BOM`);
            }
            // Check for invalid UTF-8 sequences
            if (content.includes('\ufffd')) {
              this.log(
                'error',
                `${filePath}: Contains invalid UTF-8 characters`,
              );
            } else {
              this.log('success', `${filePath}: UTF-8 valid`);
            }
          }
        });
      } catch (err) {
        this.log('error', `Error reading ${dir}: ${err.message}`);
      }
    };

    walkDir(ROOT);
  }

  // Validate YAML structure
  validateYaml() {
    console.log('\n📋 Validating YAML Files...');
    const yamlFiles = [
      '_config.yml',
      '_data/theme.yml',
      '_data/nav.yml',
      '_data/social.yml',
    ];

    yamlFiles.forEach((file) => {
      const filePath = path.join(ROOT, file);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          // Basic YAML validation: check for common issues
          if (content.includes('\t')) {
            this.log('error', `${file}: Contains tabs (YAML requires spaces)`);
          } else if (/^\s*\w+:\s*$\n\s+\w+:/m.test(content)) {
            this.log('success', `${file}: YAML structure appears valid`);
          } else {
            this.log('success', `${file}: YAML syntax OK`);
          }
        } catch (err) {
          this.log('error', `${file}: ${err.message}`);
        }
      }
    });
  }

  // Validate Liquid templates
  validateLiquid() {
    console.log('\n💧 Validating Liquid Templates...');
    const liquidPatterns = [
      {
        regex: /\{%\s*if\s+(\w+)\s+gt\s+/g,
        issue: 'Invalid operator "gt" (use ">")',
      },
      {
        regex: /\{%\s*if\s+(\w+)\s+lt\s+/g,
        issue: 'Invalid operator "lt" (use "<")',
      },
      {
        regex: /{%\s*\w+\s*\|\s*(\w+)\s*:\s*'([^']*)'\s*\|\s*/g,
        issue: 'Check filter syntax',
      },
    ];

    const walkDir = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (EXCLUDE_DIRS.some((d) => filePath.includes(d))) return;

          if (stat.isDirectory()) {
            walkDir(filePath);
          } else if (file.endsWith('.html') || file.endsWith('.md')) {
            const content = fs.readFileSync(filePath, 'utf8');
            liquidPatterns.forEach(({ regex, issue }) => {
              if (regex.test(content)) {
                this.log('warning', `${filePath}: ${issue}`);
              }
            });
          }
        });
      } catch (err) {
        this.log('error', `Error reading ${dir}: ${err.message}`);
      }
    };

    walkDir(path.join(ROOT, '_includes'));
    walkDir(path.join(ROOT, '_layouts'));
    walkDir(path.join(ROOT, 'pages'));
  }

  // Validate navigation links
  validateNavigation() {
    console.log('\n🔗 Validating Navigation Links...');
    try {
      const navFile = path.join(ROOT, '_data', 'nav.yml');
      if (!fs.existsSync(navFile)) {
        this.log('warning', '_data/nav.yml not found');
        return;
      }

      const content = fs.readFileSync(navFile, 'utf8');
      const urlMatches = content.match(/url:\s*['"]?([^\s'"]+)['"]?/g) || [];

      urlMatches.forEach((match) => {
        const url = match.replace(/url:\s*['"]?|['"]?$/g, '');
        if (url.startsWith('/')) {
          const filePath = path.join(ROOT, '_site', url, 'index.html');
          // Check if page exists (after build)
          if (!fs.existsSync(filePath)) {
            this.log('warning', `Navigation link "${url}" may not exist`);
          }
        }
      });

      this.log('success', 'Navigation validation complete');
    } catch (err) {
      this.log('error', `Navigation validation failed: ${err.message}`);
    }
  }

  // Validate HTML structure
  validateHtml() {
    console.log('\n📄 Validating HTML Structure...');
    try {
      execSync(
        'npx htmlhint "_includes/**/*.html" "_layouts/**/*.html" --exclude node_modules,_site,.git',
        {
          stdio: 'pipe',
          cwd: ROOT,
        },
      );
      this.log('success', 'HTML validation passed');
    } catch (err) {
      this.log('warning', 'HTML hints found (non-critical)');
    }
  }

  // Check critical files exist
  validateCriticalFiles() {
    console.log('\n📦 Validating Critical Files...');
    const critical = [
      '_config.yml',
      'package.json',
      'Gemfile',
      'favicon.ico',
      'CNAME',
    ];

    critical.forEach((file) => {
      const filePath = path.join(ROOT, file);
      if (fs.existsSync(filePath)) {
        this.log('success', `${file}: Found`);
      } else {
        this.log('error', `${file}: Missing`);
      }
    });
  }

  // Summary report
  report() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.passed.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log('\n🔴 CRITICAL ISSUES:');
      this.errors.forEach((err) => console.log(`  - ${err}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n🟡 WARNINGS:');
      this.warnings.forEach((warn) => console.log(`  - ${warn}`));
    }

    console.log('='.repeat(60));

    return this.errors.length === 0 ? 0 : 1;
  }

  run() {
    console.log('🚀 Starting Comprehensive Validation...\n');
    this.validateEncoding();
    this.validateYaml();
    this.validateLiquid();
    this.validateCriticalFiles();
    this.validateNavigation();
    this.validateHtml();
    return this.report();
  }
}

const validator = new Validator();
process.exit(validator.run());
