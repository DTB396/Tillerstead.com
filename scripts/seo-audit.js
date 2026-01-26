/**
 * SEO Audit Script
 * Checks for missing meta descriptions, alt text, structured data
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const cheerio = require('cheerio');
const chalk = require('chalk');

const SITE_DIR = '_site';
const issues = {
  missingMetaDesc: [],
  missingAlt: [],
  missingSchema: [],
  missingOG: [],
  longTitle: [],
  duplicateMeta: new Map()
};

async function auditHTML() {
  console.log(chalk.blue.bold('\n🔍 SEO AUDIT - Starting...\n'));
  
  const htmlFiles = await glob(`${SITE_DIR}/**/*.html`);
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf-8');
    const $ = cheerio.load(html);
    const relPath = path.relative(SITE_DIR, file);
    
    // Check meta description
    const metaDesc = $('meta[name="description"]').attr('content');
    if (!metaDesc || metaDesc.length < 50) {
      issues.missingMetaDesc.push({
        file: relPath,
        length: metaDesc ? metaDesc.length : 0
      });
    }
    
    // Track duplicate descriptions
    if (metaDesc) {
      if (!issues.duplicateMeta.has(metaDesc)) {
        issues.duplicateMeta.set(metaDesc, []);
      }
      issues.duplicateMeta.get(metaDesc).push(relPath);
    }
    
    // Check title length
    const title = $('title').text();
    if (title.length > 60) {
      issues.longTitle.push({
        file: relPath,
        title,
        length: title.length
      });
    }
    
    // Check images for alt text
    $('img').each((i, elem) => {
      const alt = $(elem).attr('alt');
      const src = $(elem).attr('src');
      if (!alt && src && !src.includes('data:')) {
        issues.missingAlt.push({
          file: relPath,
          src
        });
      }
    });
    
    // Check for Open Graph tags
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (!ogTitle || !ogImage) {
      issues.missingOG.push(relPath);
    }
    
    // Check for schema.org structured data
    const hasSchema = $('script[type="application/ld+json"]').length > 0;
    if (!hasSchema && !relPath.includes('404')) {
      issues.missingSchema.push(relPath);
    }
  }
  
  printReport();
}

function printReport() {
  console.log(chalk.yellow.bold('\n📊 SEO AUDIT RESULTS\n'));
  console.log('='.repeat(60));
  
  // Missing meta descriptions
  if (issues.missingMetaDesc.length > 0) {
    console.log(chalk.red.bold(`\n❌ Missing/Short Meta Descriptions: ${issues.missingMetaDesc.length}`));
    issues.missingMetaDesc.slice(0, 10).forEach(({ file, length }) => {
      console.log(`  ${file} ${chalk.gray(`(${length} chars)`)}`);
    });
    if (issues.missingMetaDesc.length > 10) {
      console.log(chalk.gray(`  ... and ${issues.missingMetaDesc.length - 10} more`));
    }
  } else {
    console.log(chalk.green('✓ All pages have meta descriptions'));
  }
  
  // Duplicate meta descriptions
  const duplicates = Array.from(issues.duplicateMeta.entries())
    .filter(([_, files]) => files.length > 1);
  if (duplicates.length > 0) {
    console.log(chalk.yellow.bold(`\n⚠️  Duplicate Meta Descriptions: ${duplicates.length}`));
    duplicates.slice(0, 5).forEach(([desc, files]) => {
      console.log(`  "${desc.substring(0, 50)}..." used in:`);
      files.forEach(f => console.log(chalk.gray(`    - ${f}`)));
    });
  }
  
  // Missing alt text
  if (issues.missingAlt.length > 0) {
    console.log(chalk.red.bold(`\n❌ Missing Alt Text: ${issues.missingAlt.length} images`));
    issues.missingAlt.slice(0, 10).forEach(({ file, src }) => {
      console.log(`  ${file}: ${chalk.gray(src)}`);
    });
    if (issues.missingAlt.length > 10) {
      console.log(chalk.gray(`  ... and ${issues.missingAlt.length - 10} more`));
    }
  } else {
    console.log(chalk.green('✓ All images have alt text'));
  }
  
  // Missing schema
  if (issues.missingSchema.length > 0) {
    console.log(chalk.yellow.bold(`\n⚠️  Missing Schema.org JSON-LD: ${issues.missingSchema.length}`));
    issues.missingSchema.slice(0, 10).forEach(file => {
      console.log(`  ${file}`);
    });
  }
  
  // Missing OG tags
  if (issues.missingOG.length > 0) {
    console.log(chalk.yellow.bold(`\n⚠️  Missing Open Graph Tags: ${issues.missingOG.length}`));
    issues.missingOG.slice(0, 10).forEach(file => {
      console.log(`  ${file}`);
    });
  }
  
  // Long titles
  if (issues.longTitle.length > 0) {
    console.log(chalk.yellow.bold(`\n⚠️  Titles Over 60 Characters: ${issues.longTitle.length}`));
    issues.longTitle.slice(0, 5).forEach(({ file, title, length }) => {
      console.log(`  ${file} ${chalk.gray(`(${length} chars)`)}`);
      console.log(chalk.gray(`    "${title}"`));
    });
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(chalk.blue.bold('\n📈 SUMMARY\n'));
  console.log(`Total Issues: ${chalk.yellow(
    issues.missingMetaDesc.length +
    issues.missingAlt.length +
    issues.missingSchema.length +
    issues.missingOG.length +
    issues.longTitle.length
  )}`);
  console.log(`\nPriority Fixes:`);
  console.log(`  1. Add meta descriptions to ${issues.missingMetaDesc.length} pages`);
  console.log(`  2. Add alt text to ${issues.missingAlt.length} images`);
  console.log(`  3. Add Schema.org to ${issues.missingSchema.length} pages`);
  console.log(`  4. Add Open Graph to ${issues.missingOG.length} pages\n`);
}

// Run audit
if (require.main === module) {
  if (!fs.existsSync(SITE_DIR)) {
    console.error(chalk.red('Error: _site directory not found. Run `npm run build` first.'));
    process.exit(1);
  }
  auditHTML();
}

module.exports = { auditHTML };
