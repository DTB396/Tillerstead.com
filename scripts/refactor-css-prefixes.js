// scripts/refactor-css-prefixes.js
// Tillerstead: Systematic CSS custom property prefix refactor
// Adds required prefixes (ts-, tiller-, color-, spacing-, font-) to all unprefixed variables

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sassDir = path.resolve(__dirname, '..', '_sass');

// Mapping of unprefixed properties to their prefixed versions
const propertyMap = {
  // Already refactored in tokens.scss
  '--stone-50': '--color-stone-50',
  '--stone-100': '--color-stone-100',
  '--stone-200': '--color-stone-200',
  '--ink-900': '--color-ink-900',
  '--ink-700': '--color-ink-700',
  '--emerald-600': '--color-emerald-600',
  '--emerald-700': '--color-emerald-700',
  '--shadow-soft': '--color-shadow-soft',
  '--shadow-deep': '--color-shadow-deep',
  '--container': '--spacing-container',
  '--section-pad-y': '--spacing-section-pad-y',
  '--card-pad': '--spacing-card-pad',
  '--gutter': '--spacing-gutter',
  '--grid-gap': '--spacing-grid-gap',
  '--footer-bg': '--tiller-footer-bg',
  '--footer-text': '--tiller-footer-text',
  '--footer-text-muted': '--tiller-footer-text-muted',
  '--footer-link': '--tiller-footer-link',
  '--footer-link-hover': '--tiller-footer-link-hover',
  '--footer-border': '--tiller-footer-border',
  '--hero-bg': '--tiller-hero-bg',
  '--hero-text': '--tiller-hero-text',
  '--hero-text-muted': '--tiller-hero-text-muted',
  '--heading-1': '--font-heading-1',
  '--heading-2': '--font-heading-2',
  '--heading-3': '--font-heading-3',
  '--heading-4': '--font-heading-4',
  '--heading-5': '--font-heading-5',
  '--heading-6': '--font-heading-6',
  '--line-height-base': '--font-line-height-base',
  '--line-height-tight': '--font-line-height-tight',
  '--line-height-relaxed': '--font-line-height-relaxed',
  '--hero-padding-mobile': '--spacing-hero-padding-mobile',
  '--hero-padding-desktop': '--spacing-hero-padding-desktop',
  '--section-spacing': '--spacing-section-spacing',
  '--card-spacing': '--spacing-card-spacing',
  '--radius-base': '--tiller-radius-base',
  '--radius-large': '--tiller-radius-large',
  '--focus-ring': '--tiller-focus-ring',
  '--transition-fast': '--tiller-transition-fast',
  '--transition-med': '--tiller-transition-med',
  '--layout-max': '--tiller-layout-max',
  '--layout-wide': '--tiller-layout-wide',
  '--layout-narrow': '--tiller-layout-narrow',
  '--shell-width': '--tiller-shell-width',
  '--container-gutter': '--tiller-container-gutter',
  '--section-padding-y': '--tiller-section-padding-y',
  '--section-gap': '--tiller-section-gap',
  '--header-height': '--tiller-header-height',
  '--header-bg': '--tiller-header-bg',
  '--header-border': '--tiller-header-border',
};

/**
 * Refactor a single SCSS file to use prefixed custom properties
 */
function refactorFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changesMade = 0;

    // Replace each unprefixed property with its prefixed version
    for (const [oldProp, newProp] of Object.entries(propertyMap)) {
      // Match both definitions (--prop:) and usages (var(--prop))
      const defRegex = new RegExp(
        `\\b${oldProp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:`,
        'g',
      );
      const varRegex = new RegExp(
        `var\\(${oldProp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`,
        'g',
      );

      if (defRegex.test(content) || varRegex.test(content)) {
        content = content.replace(defRegex, `${newProp}:`);
        content = content.replace(varRegex, `var(${newProp})`);
        changesMade++;
      }
    }

    if (changesMade > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(
        `✓ Refactored ${path.basename(filePath)} (${changesMade} properties updated)`,
      );
      return changesMade;
    }

    return 0;
  } catch (err) {
    console.error(`✗ Error refactoring ${filePath}:`, err.message);
    return 0;
  }
}

/**
 * Main refactoring process
 */
async function main() {
  console.log(
    'Tillerstead CSS Custom Property Refactor\n=====\n',
  );

  try {
    // Find all SCSS files
    const scssFiles = await glob('**/*.scss', { cwd: sassDir, absolute: true });

    console.log(`Found ${scssFiles.length} SCSS files\n`);

    let totalChanges = 0;
    let filesModified = 0;

    for (const file of scssFiles) {
      const changes = refactorFile(file);
      if (changes > 0) {
        totalChanges += changes;
        filesModified++;
      }
    }

    console.log('\n=====');
    console.log('✓ Refactor Complete');
    console.log(`  Files modified: ${filesModified}/${scssFiles.length}`);
    console.log(`  Total property updates: ${totalChanges}`);
  } catch (err) {
    console.error('✗ Refactor failed:', err.message);
    process.exit(1);
  }
}

main();
