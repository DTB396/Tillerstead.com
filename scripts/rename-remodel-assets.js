#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const RENAMES = [
  {
    from: 'bathroom-remodel-progress-shot-1.webp',
    to: 'bathroom-remodel-progress-1.webp',
  },
  {
    from: 'bathroom-remodel-progress-shot-2.webp',
    to: 'bathroom-remodel-progress-2.webp',
  },
  { from: 'bathroom-remodel-final.webp', to: 'bathroom-remodel-finished.webp' },
];

const BASE_DIR = path.join('assets', 'img', 'tillerstead-work', 'bathrooms');

console.log('Standardizing remodel asset filenames...');
for (const { from, to } of RENAMES) {
  const src = path.join(BASE_DIR, from);
  const dest = path.join(BASE_DIR, to);

  if (!fs.existsSync(src)) {
    console.log(`  SKIP: ${from} (already renamed or missing)`);
    continue;
  }

  if (fs.existsSync(dest)) {
    console.log(`  OVERWRITE: ${to} already exists, removing before rename`);
    fs.unlinkSync(dest);
  }

  fs.renameSync(src, dest);
  console.log(`  RENAMED: ${from} → ${to}`);
}

console.log('Rename script complete.');
