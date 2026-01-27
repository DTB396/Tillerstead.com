#!/usr/bin/env node

/**
 * Rebuild bundle.css from source files with proper formatting
 * This ensures no duplicates and proper CSS structure
 */

const fs = require('fs');
const path = require('path');

console.log('🔨 Rebuilding bundle.css from source files...\n');

// Source files in order
const sourceFiles = [
  'assets/css/root-vars.css',
  'assets/css/modern/modern.css',
  'assets/css/ux-enhancements.css'
];

const outputFile = 'assets/css/bundle.css';
const rootDir = path.join(__dirname, '..');

// Read all source files
const contents = [];
const imports = [];

console.log('📖 Reading source files:');
for (const file of sourceFiles) {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${file}`);
    let content = fs.readFileSync(filePath, 'utf8');

    // Extract @import statements and remove them from content
    const importMatches = content.match(/@import\s+['""][^'""]+['"];?\s*/g);
    if (importMatches) {
      imports.push(...importMatches);
      content = content.replace(/@import\s+['""][^'""]+['"];?\s*/g, '');
    }

    // Clean up the content
    content = content.trim();
    contents.push(content);
  } else {
    console.log(`  ✗ ${file} (not found)`);
  }
}

// Build final bundle
let bundle = '';

// Add header comment
bundle += `/**\n`;
bundle += ` * Tillerstead.com - CSS Bundle\n`;
bundle += ` * Generated: ${new Date().toISOString()}\n`;
bundle += ` * \n`;
bundle += ` * This file is auto-generated. Do not edit directly.\n`;
bundle += ` * Source files:\n`;
sourceFiles.forEach(f => {
  bundle += ` *   - ${f}\n`;
});
bundle += ` */\n\n`;

// Add unique imports at the top
if (imports.length > 0) {
  const uniqueImports = [...new Set(imports)];
  bundle += uniqueImports.map(i => i.trim()).join('\n') + '\n\n';
  console.log(`\n📦 Added ${uniqueImports.length} unique @import statements`);
}

// Add contents with proper spacing
bundle += contents.join('\n\n');

// Clean up excessive spacing
bundle = bundle.replace(/\n{4,}/g, '\n\n\n');

// Ensure file ends with newline
if (!bundle.endsWith('\n')) {
  bundle += '\n';
}

// Write to output
const outputPath = path.join(rootDir, outputFile);
fs.writeFileSync(outputPath, bundle, 'utf8');

console.log(`\n✅ Bundle created: ${outputFile}`);
console.log(`📊 Total size: ${bundle.length} bytes\n`);
console.log('💡 Run the CSS fix script next to clean up any remaining issues.\n');
