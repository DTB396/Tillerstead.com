/**
 * Detect Unused CSS/JS Script
 * Scans _site HTML and finds CSS/JS files that aren't referenced
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const chalk = require('chalk');

async function detectUnused() {
  console.log(chalk.blue.bold('\n🔍 UNUSED FILE DETECTION\n'));
  
  const htmlFiles = await glob('_site/**/*.html');
  const cssFiles = await glob('assets/css/**/*.css');
  const jsFiles = await glob('assets/js/**/*.js');
  
  // Read all HTML content
  let allHTML = '';
  for (const file of htmlFiles) {
    allHTML += fs.readFileSync(file, 'utf-8');
  }
  
  // Check CSS files
  console.log(chalk.yellow.bold('📄 CSS Files:\n'));
  let unusedCSS = 0;
  for (const cssFile of cssFiles) {
    const fileName = path.basename(cssFile);
    const relativePath = path.relative('assets', cssFile);
    
    if (!allHTML.includes(fileName) && !allHTML.includes(relativePath)) {
      console.log(chalk.red(`  ✗ ${relativePath}`));
      unusedCSS++;
    }
  }
  if (unusedCSS === 0) {
    console.log(chalk.green('  ✓ All CSS files referenced'));
  }
  
  // Check JS files
  console.log(chalk.yellow.bold('\n📜 JavaScript Files:\n'));
  let unusedJS = 0;
  for (const jsFile of jsFiles) {
    const fileName = path.basename(jsFile);
    const relativePath = path.relative('assets', jsFile);
    
    if (!allHTML.includes(fileName) && !allHTML.includes(relativePath)) {
      console.log(chalk.red(`  ✗ ${relativePath}`));
      unusedJS++;
    }
  }
  if (unusedJS === 0) {
    console.log(chalk.green('  ✓ All JS files referenced'));
  }
  
  console.log(chalk.blue.bold('\n📊 SUMMARY:\n'));
  console.log(`Total CSS files: ${cssFiles.length}`);
  console.log(`Unused CSS: ${chalk.red(unusedCSS)}`);
  console.log(`Total JS files: ${jsFiles.length}`);
  console.log(`Unused JS: ${chalk.red(unusedJS)}\n`);
}

if (require.main === module) {
  if (!fs.existsSync('_site')) {
    console.error(chalk.red('Error: _site not found. Run `npm run build` first.'));
    process.exit(1);
  }
  detectUnused();
}

module.exports = { detectUnused };
