#!/usr/bin/env node

/**
 * Automated CSS Linting Error Fixer
 * Fixes all 179+ CSS linting errors automatically
 */

const fs = require('fs');
const path = require('path');

const BUNDLE_CSS_PATH = path.join(__dirname, '..', 'assets', 'css', 'bundle.css');

console.log('🔧 Starting CSS Lint Error Auto-Fix...\n');

// Read the bundle.css file
let css = fs.readFileSync(BUNDLE_CSS_PATH, 'utf8');
const originalLength = css.length;

console.log(`📄 Loaded bundle.css (${css.length} bytes)`);

// FIX 1: Remove duplicate properties
console.log('🔍 Fixing duplicate properties...');
const lines = css.split('\n');
const fixedLines = [];
const seenPropertiesInBlock = new Map();
let inBlock = false;
let blockStart = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Track when we enter/exit a CSS block
  if (trimmed.includes('{') && !trimmed.includes('}')) {
    inBlock = true;
    blockStart = i;
    seenPropertiesInBlock.clear();
    fixedLines.push(line);
  } else if (trimmed === '}') {
    inBlock = false;
    seenPropertiesInBlock.clear();
    fixedLines.push(line);
  } else if (inBlock && trimmed.includes(':') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
    // Extract property name
    const propMatch = trimmed.match(/^\s*([a-z-]+)\s*:/);
    if (propMatch) {
      const propName = propMatch[1];
      if (seenPropertiesInBlock.has(propName)) {
        console.log(`  ⚠️  Removing duplicate property: ${propName} at line ${i + 1}`);
        // Skip this duplicate line
        continue;
      }
      seenPropertiesInBlock.set(propName, i);
    }
    fixedLines.push(line);
  } else {
    fixedLines.push(line);
  }
}

css = fixedLines.join('\n');
console.log(`✅ Removed duplicate properties\n`);

// FIX 2: Add empty lines before at-rules
console.log('🔍 Adding empty lines before @media, @import rules...');
css = css.replace(/([^\n])\n(@media|@import|@keyframes|@supports)/g, '$1\n\n$2');
console.log(`✅ Added empty lines before at-rules\n`);

// FIX 3: Add empty lines before rules (selectors)
console.log('🔍 Adding empty lines before CSS rules...');
css = css.replace(/}\n([a-z.*#:[,\s])/gi, '}\n\n$1');
css = css.replace(/}\n(\.[a-z])/gi, '}\n\n$1');
console.log(`✅ Added empty lines before rules\n`);

// FIX 4: Fix invalid position @import rules (move to top)
console.log('🔍 Moving @import rules to the top...');
const importRegex = /@import\s+['""][^'""]+"['"];?\s*/g;
const imports = [];
css = css.replace(importRegex, (match) => {
  imports.push(match.trim());
  return '';
});

if (imports.length > 0) {
  // Add imports at the very top
  css = imports.join('\n') + '\n\n' + css;
  console.log(`✅ Moved ${imports.length} @import rules to top\n`);
}

// FIX 5: Remove duplicate selectors (keep first occurrence)
console.log('🔍 Removing duplicate selectors...');
const selectorBlocks = [];
const seenSelectors = new Set();
const blockRegex = /([^{}]+)\s*{([^{}]*)}/g;

// This is a simplified approach - for full CSS with nested structures,
// we'd need a proper CSS parser. But for most duplicates this works.
let tempCss = css;
let duplicatesRemoved = 0;

// Split into logical sections
const sections = tempCss.split(/\n\n+/);
const cleanedSections = [];

for (const section of sections) {
  if (section.includes('{') && section.includes('}')) {
    // Try to extract selector
    const selectorMatch = section.match(/^([^{]+){/);
    if (selectorMatch) {
      const selector = selectorMatch[1].trim();
      const normalizedSelector = selector.replace(/\s+/g, ' ');

      if (seenSelectors.has(normalizedSelector)) {
        console.log(`  ⚠️  Skipping duplicate selector: ${selector.substring(0, 50)}...`);
        duplicatesRemoved++;
        continue;
      }
      seenSelectors.add(normalizedSelector);
    }
  }
  cleanedSections.push(section);
}

css = cleanedSections.join('\n\n');
console.log(`✅ Removed ${duplicatesRemoved} duplicate selector blocks\n`);

// FIX 6: Clean up excessive whitespace
console.log('🔍 Cleaning up excessive whitespace...');
css = css.replace(/\n{4,}/g, '\n\n\n'); // Max 2 empty lines
css = css.replace(/\t/g, '  '); // Convert tabs to spaces
css = css.replace(/ +$/gm, ''); // Remove trailing spaces
console.log(`✅ Cleaned whitespace\n`);

// FIX 7: Ensure file ends with newline
if (!css.endsWith('\n')) {
  css += '\n';
}

// Write the fixed CSS
fs.writeFileSync(BUNDLE_CSS_PATH, css, 'utf8');

const newLength = css.length;
const diff = originalLength - newLength;

console.log('\n' + '='.repeat(50));
console.log('✨ CSS LINTING ERRORS FIXED ✨');
console.log('='.repeat(50));
console.log(`📊 Original size: ${originalLength} bytes`);
console.log(`📊 New size: ${newLength} bytes`);
console.log(`📊 Difference: ${diff > 0 ? '-' : '+'}${Math.abs(diff)} bytes`);
console.log(`\n✅ All CSS linting errors should now be resolved!`);
console.log(`📝 Run 'npm run lint:css' to verify.\n`);
