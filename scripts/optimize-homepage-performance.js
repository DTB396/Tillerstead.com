#!/usr/bin/env node

/**
 * Homepage Performance Optimizer
 * Reduces animation durations and optimizes loading speed
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Optimizing homepage performance...\n');

// Optimize CSS animations
const cssFiles = [
  'assets/css/visual-enhancements.css',
  'assets/css/ux-enhancements.css',
  'assets/css/pages/home.css'
];

cssFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let css = fs.readFileSync(filePath, 'utf8');

    // Speed up slow animations (500ms+ → 300ms)
    css = css.replace(/transition:([^;]*)\s+0\.5s/g, 'transition:$1 0.3s');
    css = css.replace(/animation-duration:\s*0\.5s/g, 'animation-duration: 0.3s');

    // Speed up very slow animations (800ms+ → 400ms)
    css = css.replace(/transition:([^;]*)\s+0\.[8-9]s/g, 'transition:$1 0.4s');
    css = css.replace(/animation-duration:\s*0\.[8-9]s/g, 'animation-duration: 0.4s');

    fs.writeFileSync(filePath, css, 'utf8');
    console.log(`✅ Optimized: ${file}`);
  }
});

console.log('\n✨ Performance optimization complete!\n');
