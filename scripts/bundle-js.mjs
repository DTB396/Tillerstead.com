// scripts/bundle-js.mjs
// Bundles and minifies all JS in assets/js/ into assets/js/bundle.min.js using esbuild
import { build } from 'esbuild';
import { readdirSync } from 'fs';
import { join } from 'path';

const jsDir = 'assets/js';
const files = readdirSync(jsDir)
  .filter(f => f.endsWith('.js') && !f.endsWith('.min.js'))
  .map(f => join(jsDir, f));

await build({
  entryPoints: files,
  bundle: true,
  minify: true,
  outfile: 'assets/js/bundle.min.js',
  sourcemap: false,
  target: ['es2018'],
  format: 'iife',
  legalComments: 'none',
});

console.log('✓ JS bundled and minified → assets/js/bundle.min.js');
