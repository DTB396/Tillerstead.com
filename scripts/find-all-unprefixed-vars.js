// scripts/find-all-unprefixed-vars.js
// Tillerstead: Comprehensive scanner to find ALL remaining unprefixed CSS variables
// Both definitions and usages

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sassDir = path.resolve(__dirname, '..', '_sass');

// Valid prefixes
const validPrefixes = [
  'ts-',
  'tiller-',
  'color-',
  'spacing-',
  'font-',
  'z-',
  'breakpoint-',
];

/**
 * Check if a property has a valid prefix
 */
function hasValidPrefix(propName) {
  const prop = propName.replace(/^--/, '');
  return validPrefixes.some((prefix) => prop.startsWith(prefix));
}

/**
 * Scan a file for all unprefixed properties (both definitions and usages)
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const results = {
      definitions: [],
      usages: [],
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Find definitions: --prop:
      const defMatch = line.match(/^\s*(--[a-z][a-z0-9-]*)\s*:/);
      if (defMatch) {
        const propName = defMatch[1];
        if (!hasValidPrefix(propName)) {
          results.definitions.push({
            line: lineNum,
            prop: propName,
            text: line.trim(),
          });
        }
      }

      // Find usages: var(--prop)
      const varMatches = line.matchAll(/var\((--[a-z][a-z0-9-]*)[,)]/g);
      for (const match of varMatches) {
        const propName = match[1];
        if (!hasValidPrefix(propName)) {
          results.usages.push({
            line: lineNum,
            prop: propName,
            text: line.trim(),
          });
        }
      }
    }

    return results;
  } catch (err) {
    console.error(`Error scanning ${filePath}:`, err.message);
    return { definitions: [], usages: [] };
  }
}

/**
 * Main process
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  Tillerstead: Find All Unprefixed Variables       ║');
  console.log('║  Phase 3 - Complete Inventory                      ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  try {
    const scssFiles = await glob('**/*.scss', { cwd: sassDir, absolute: true });

    console.log(`Scanning ${scssFiles.length} SCSS files...\n`);

    const allDefinitions = new Map();
    const allUsages = new Map();
    const fileResults = [];

    for (const file of scssFiles) {
      const results = scanFile(file);
      const relativePath = path.relative(sassDir, file);

      if (results.definitions.length > 0 || results.usages.length > 0) {
        fileResults.push({ file: relativePath, ...results });

        // Collect unique properties
        results.definitions.forEach((d) => {
          if (!allDefinitions.has(d.prop)) {
            allDefinitions.set(d.prop, []);
          }
          allDefinitions.get(d.prop).push({ file: relativePath, line: d.line });
        });

        results.usages.forEach((u) => {
          if (!allUsages.has(u.prop)) {
            allUsages.set(u.prop, []);
          }
          allUsages.get(u.prop).push({ file: relativePath, line: u.line });
        });
      }
    }

    // Report
    console.log('═══════════════════════════════════════════════════\n');
    console.log('📊 SUMMARY:');
    console.log(`   Files with issues: ${fileResults.length}`);
    console.log(`   Unique unprefixed definitions: ${allDefinitions.size}`);
    console.log(`   Unique unprefixed usages: ${allUsages.size}`);
    console.log(
      `   Total violations: ${[...allDefinitions.values()].flat().length + [...allUsages.values()].flat().length}\n`,
    );

    // Top offenders
    console.log('🔥 TOP UNPREFIXED PROPERTIES:\n');
    const sortedDefs = [...allDefinitions.entries()].sort(
      (a, b) => b[1].length - a[1].length,
    );
    sortedDefs.slice(0, 20).forEach(([prop, locations]) => {
      console.log(`   ${prop.padEnd(35)} (${locations.length} occurrences)`);
    });

    // Detailed file report
    console.log('\n\n📁 DETAILED FILE REPORT:\n');
    fileResults.slice(0, 15).forEach(({ file, definitions, usages }) => {
      const total = definitions.length + usages.length;
      console.log(`\n${file} (${total} violations)`);

      if (definitions.length > 0) {
        console.log(`  Definitions (${definitions.length}):`);
        definitions.slice(0, 5).forEach((d) => {
          console.log(`    Line ${d.line}: ${d.prop}`);
        });
        if (definitions.length > 5)
          console.log(`    ... and ${definitions.length - 5} more`);
      }

      if (usages.length > 0) {
        console.log(`  Usages (${usages.length}):`);
        const uniqueUsages = [...new Set(usages.map((u) => u.prop))];
        uniqueUsages.slice(0, 5).forEach((prop) => {
          const count = usages.filter((u) => u.prop === prop).length;
          console.log(`    ${prop} (${count}×)`);
        });
        if (uniqueUsages.length > 5)
          console.log(`    ... and ${uniqueUsages.length - 5} more`);
      }
    });

    if (fileResults.length > 15) {
      console.log(`\n  ... and ${fileResults.length - 15} more files`);
    }

    console.log('\n\n═══════════════════════════════════════════════════');
    console.log('Run: npm run lint:css for full stylelint report');
  } catch (err) {
    console.error('✗ Scan failed:', err.message);
    process.exit(1);
  }
}

main();
