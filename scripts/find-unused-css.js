import fs from 'fs';

import _path from 'path';
import { glob } from 'glob';

async function findUnusedCSS() {
  // Extract classes from CSS files
  const cssFiles = await glob('assets/css/**/*.{css,scss}', {
    cwd: process.cwd(),
  });
  const cssClasses = new Set();

  for (const file of cssFiles) {
    const content = fs.readFileSync(file, 'utf8');
    // Match CSS class selectors
    const matches = content.matchAll(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g);
    for (const match of matches) {
      cssClasses.add(match[1]);
    }
  }

  // Extract classes used in HTML/MD files
  const htmlFiles = await glob(
    '{_includes,_layouts,pages,*.html,*.md}/**/*.{html,md}',
    { cwd: process.cwd() },
  );
  const usedClasses = new Set();

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    // Match class attributes
    const matches = content.matchAll(/class="([^"]*)"/g);
    for (const match of matches) {
      const classes = match[1].split(/\s+/);
      classes.forEach((cls) => usedClasses.add(cls));
    }
  }

  // Find unused classes
  const unused = [...cssClasses].filter((cls) => !usedClasses.has(cls));

  console.log(`Total CSS classes: ${cssClasses.size}`);
  console.log(`Used classes: ${usedClasses.size}`);
  console.log(`Unused classes: ${unused.length}\n`);

  if (unused.length > 0) {
    console.log('Unused CSS classes:');
    unused.slice(0, 50).forEach((cls) => console.log(`  .${cls}`));
    if (unused.length > 50) {
      console.log(`  ... and ${unused.length - 50} more`);
    }
  }
}

findUnusedCSS().catch(console.error);
