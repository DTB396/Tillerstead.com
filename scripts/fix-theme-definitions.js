// scripts/fix-theme-definitions.js
// Tillerstead: Fix remaining theme file property definitions
// Direct line-by-line processing

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sassDir = path.resolve(__dirname, '..', '_sass');

const themeFiles = [
  path.join(sassDir, '00-settings', '_tokens.scss'),
  path.join(sassDir, '00-settings', '_tokens-90s.scss'),
  path.join(sassDir, '00-settings', '_tokens-cartoon.scss'),
  path.join(sassDir, '00-settings', '_tokens-hybrid.scss'),
  path.join(sassDir, '30-components', '_home.scss'),
];

/**
 * Determine prefix for a property
 */
function getPrefix(propName) {
  const prop = propName.replace(/^--/, '');

  // Skip if already prefixed
  if (prop.match(/^(ts-|tiller-|color-|spacing-|font-|z-|breakpoint-)/)) {
    return null;
  }

  // Typography (including text size scale)
  if (prop.match(/^(text-|heading|line|letter|weight|family)/)) {
    return 'font-';
  }

  // Color-like properties (comprehensive)
  if (
    prop.match(
      /^(neon|sunset|hot|lime|electric|cyber|cool|brand|warm|navy|cartoon|comic|bubble|golden|success|attention|warning|danger|error|info|retro|pow|boom|zap|shadow-|gradient|bg-|pattern|surface-|alert|slate)/,
    )
  ) {
    return 'color-';
  }

  // Layout
  if (prop.match(/^(layout|container-|shell)/)) {
    return 'tiller-';
  }

  // Effects and outlines
  if (prop.match(/^(shadow-|radius|ease|duration|outline)/)) {
    return 'tiller-';
  }

  // Spacing (including hero, section, card)
  if (
    prop.match(
      /^(space-|container|gap|flow|stack|cluster|hero-|section-|card-)/,
    )
  ) {
    return 'spacing-';
  }

  // Transitions
  if (prop.match(/^transition/)) {
    return 'tiller-';
  }

  return null;
}

/**
 * Fix a theme file line by line
 */
function fixThemeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let changed = 0;

    const newLines = lines.map((line) => {
      // Match property definition
      const match = line.match(/^(\s*)(--[a-z][a-z0-9-]*)(\s*:)/);
      if (match) {
        const propName = match[2];
        const prefix = getPrefix(propName);

        if (prefix) {
          const newPropName = `--${prefix}${propName.substring(2)}`;
          changed++;
          return line.replace(propName, newPropName);
        }
      }
      return line;
    });

    if (changed > 0) {
      fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    }

    return changed;
  } catch (err) {
    console.error(`Error fixing ${filePath}:`, err.message);
    return 0;
  }
}

/**
 * Main
 */
function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  Tillerstead: Fix Theme Definitions               ║');
  console.log('║  Line-by-line property prefix correction          ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  let total = 0;

  for (const file of themeFiles) {
    if (fs.existsSync(file)) {
      const fixed = fixThemeFile(file);
      if (fixed > 0) {
        const relativePath = path.relative(sassDir, file);
        console.log(`✓ ${relativePath.padEnd(45)} (${fixed} definitions)`);
        total += fixed;
      }
    }
  }

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║  Fix Complete                                      ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log(`  Total definitions fixed: ${total}\n`);
  console.log('Next: npm run lint:css');
}

main();
