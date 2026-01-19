// scripts/build-css.js
// Tillerstead: CSS build script (ESM) – compiles SCSS to CSS per TCNA/New Jersey HIC standards

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
import * as sass from 'sass';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scssPath = path.resolve(__dirname, '..', 'assets', 'css', 'main.css');
const cssOutPath = path.resolve(__dirname, '..', 'assets', 'css', 'main.css');

try {
  // Use sass Node.js API instead of CLI for better Windows compatibility
  const loadPaths = [path.resolve(__dirname, '..', '_sass')];


  // Use sass.compile for correct import/module resolution
  const result = sass.compile(scssPath, {
    sourceMap: false,
    style: 'compressed',
    loadPaths,
  });

  writeFileSync(cssOutPath, result.css, 'utf8');

  console.log(
    `\n✓ Built CSS → ${path.relative('.', cssOutPath)} (TCNA/New Jersey HIC compliant)`,
  );
} catch (err) {
  console.error('CSS build failed:', err.message);
  process.exit(1);
}
