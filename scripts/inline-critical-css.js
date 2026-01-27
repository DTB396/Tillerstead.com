#!/usr/bin/env node
/**
 * Critical CSS Inliner
 * Inline critical CSS in HTML head for faster First Contentful Paint
 * Google PageSpeed optimization
 */

const fs = require('fs');
const path = require('path');

const CRITICAL_CSS_PATH = path.join(__dirname, '../assets/css/critical.css');
const HEAD_TEMPLATE_PATH = path.join(__dirname, '../_includes/layout/head.html');

function inlineCriticalCSS() {
  try {
    // Read critical CSS
    const criticalCSS = fs.readFileSync(CRITICAL_CSS_PATH, 'utf8');
    
    // Minify CSS (basic)
    const minified = criticalCSS
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/\s*([{}:;,>])\s*/g, '$1') // Remove space around special chars
      .trim();
    
    console.log(`✓ Critical CSS minified: ${criticalCSS.length} → ${minified.length} bytes`);
    console.log(`✓ Savings: ${((1 - minified.length / criticalCSS.length) * 100).toFixed(1)}%`);
    
    // Create inline style tag
    const inlineStyle = `<style id="critical-css">${minified}</style>`;
    
    // Read head template
    let headContent = fs.readFileSync(HEAD_TEMPLATE_PATH, 'utf8');
    
    // Check if critical CSS already inlined
    if (headContent.includes('id="critical-css"')) {
      // Replace existing
      headContent = headContent.replace(
        /<style id="critical-css">[\s\S]*?<\/style>/,
        inlineStyle
      );
      console.log('✓ Updated existing inline critical CSS');
    } else {
      // Insert after charset meta
      headContent = headContent.replace(
        /(<meta charset="utf-8" \/>)/,
        `$1\n${inlineStyle}`
      );
      console.log('✓ Inserted new inline critical CSS');
    }
    
    // Write updated head template
    fs.writeFileSync(HEAD_TEMPLATE_PATH, headContent, 'utf8');
    
    console.log('✓ Critical CSS inlined successfully');
    console.log(`  Location: ${HEAD_TEMPLATE_PATH}`);
    console.log(`  Size: ${minified.length} bytes`);
    
    return true;
  } catch (error) {
    console.error('✗ Failed to inline critical CSS:', error.message);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  const success = inlineCriticalCSS();
  process.exit(success ? 0 : 1);
}

module.exports = inlineCriticalCSS;
