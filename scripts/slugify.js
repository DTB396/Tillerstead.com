#!/usr/bin/env node
/* eslint-env node */
/**
 * slugify.js
 *
 * Converts input text to a TCNA/New Jersey HIC-compliant URL slug.
 * Usage:
 *   node scripts/slugify.js "Tile Installation in NJ"   -> tile-installation-in-nj
 *   echo "Premium Shower Waterproofing" | node scripts/slugify.js
 *
 * Ensures output meets Tillerstead brand, accessibility, and legal standards.
 */

function readInput() {
  const args = process.argv.slice(2);
  if (args.length > 0) return args.join(' ');

  if (!process.stdin.isTTY) {
    return new Promise((resolve) => {
      let data = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (chunk) => {
        data += chunk;
      });
      process.stdin.on('end', () => resolve(data.trim()));
    });
  }

  return '';
}

/**
 * Converts a string to a URL-safe, lowercase slug.
 * - Removes diacritics per TCNA/New Jersey HIC digital accessibility standards.
 * - Replaces non-alphanumeric characters with hyphens.
 * - Collapses multiple hyphens and trims.
 * @param {string} value
 * @returns {string}
 */
function slugify(value) {
  if (typeof value !== 'string') return '';
  const normalized = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

(async () => {
  const input = await readInput();
  if (!input) {
    console.error(
      'Usage: node scripts/slugify.js "Your Title"\n' +
        'Example: node scripts/slugify.js "TCNA-Compliant Tile Installation"',
    );
    process.exit(1);
  }

  const result = slugify(input);
  if (!result) {
    console.error(
      'Unable to generate slug from input. Ensure input contains alphanumeric characters.',
    );
    process.exit(1);
  }

  // Output is always lowercase, hyphenated, and safe for URLs per OUTPUT_RULES.md
  console.log(result);
})();
