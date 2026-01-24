// scripts/minify-js.mjs
// Minifies each JS file in assets/js/ (except .min.js and bundle.min.js) using esbuild
import { build } from 'esbuild';
import { readdirSync } from 'fs';
import { join, extname, basename } from 'path';

const jsDir = 'assets/js';
const files = readdirSync(jsDir)
  .filter(f => f.endsWith('.js') && !f.endsWith('.min.js') && f !== 'bundle.min.js');

for (const file of files) {
  const input = join(jsDir, file);
  const out = join(jsDir, basename(file, '.js') + '.min.js');
  await build({
    entryPoints: [input],
    minify: true,
    bundle: false,
    outfile: out,
    sourcemap: false,
    target: ['es2018'],
    format: 'iife',
    legalComments: 'none',
  });
  console.log(`✓ Minified ${file} → ${out}`);
}
