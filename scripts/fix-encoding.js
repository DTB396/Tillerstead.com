#!/usr/bin/env node
/**
 * Automatic Encoding Fix Script
 * - Removes UTF-8 BOM
 * - Converts tabs to spaces in YAML
 * - Ensures consistent line endings
 * - Validates and fixes Liquid syntax
 */

import fs from 'fs';
import path from 'path';
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

class EncodingFixer {
  constructor() {
    this.fixed = [];
    this.errors = [];
  }

  shouldExclude(filePath) {
    return EXCLUDE_DIRS.some((dir) => filePath.includes(dir));
  }

  removeBOM(content) {
    if (content.charCodeAt(0) === 0xfeff) {
      return content.slice(1);
    }
    return content;
  }

  normalizeLineEndings(content) {
    // Convert CRLF to LF
    return content.replace(/\r\n/g, '\n');
  }

  fixYamlTabs(filePath, content) {
    if (!filePath.endsWith('.yml') && !filePath.endsWith('.yaml')) {
      return { content, modified: false };
    }

    const lines = content.split('\n');
    let modified = false;
    const fixed = lines.map((line) => {
      if (line.includes('\t')) {
        modified = true;
        return line.replace(/\t/g, '  ');
      }
      return line;
    });

    return { content: fixed.join('\n'), modified };
  }

  fixLiquidOperators(content) {
    let modified = false;

    // Replace 'gt' with '>'
    if (content.includes(' gt ')) {
      content = content.replace(/\s+gt\s+/g, ' > ');
      modified = true;
    }

    // Replace 'lt' with '<'
    if (content.includes(' lt ')) {
      content = content.replace(/\s+lt\s+/g, ' < ');
      modified = true;
    }

    return { content, modified };
  }

  processFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let isModified = false;

      // Remove BOM
      const noBom = this.removeBOM(content);
      if (noBom !== content) {
        content = noBom;
        isModified = true;
      }

      // Normalize line endings
      const normalized = this.normalizeLineEndings(content);
      if (normalized !== content) {
        content = normalized;
        isModified = true;
      }

      // Fix YAML tabs
      const yamlFix = this.fixYamlTabs(filePath, content);
      if (yamlFix.modified) {
        content = yamlFix.content;
        isModified = true;
      }

      // Fix Liquid operators
      const liquidFix = this.fixLiquidOperators(content);
      if (liquidFix.modified) {
        content = liquidFix.content;
        isModified = true;
      }

      // Write back if modified
      if (isModified) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixed.push(filePath);
        console.log(`✅ Fixed: ${filePath}`);
      }
    } catch (err) {
      this.errors.push(`${filePath}: ${err.message}`);
      console.log(`❌ Error: ${filePath}: ${err.message}`);
    }
  }

  walkDir(dir) {
    try {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (this.shouldExclude(filePath)) return;

        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          this.walkDir(filePath);
        } else if (
          file.endsWith('.html') ||
          file.endsWith('.md') ||
          file.endsWith('.yml') ||
          file.endsWith('.yaml') ||
          file.endsWith('.json') ||
          file.endsWith('.js')
        ) {
          this.processFile(filePath);
        }
      });
    } catch (err) {
      console.error(`Error reading ${dir}: ${err.message}`);
    }
  }

  run() {
    console.log('🔧 Starting Encoding Fix Process...\n');
    this.walkDir(ROOT);

    console.log('\n' + '='.repeat(60));
    console.log('📊 FIX SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Files fixed: ${this.fixed.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log('\n🔴 ERRORS:');
      this.errors.forEach((err) => console.log(`  - ${err}`));
    }

    console.log('='.repeat(60));
    return this.errors.length === 0 ? 0 : 1;
  }
}

const fixer = new EncodingFixer();
process.exit(fixer.run());
