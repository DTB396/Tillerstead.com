/**
 * Link Validation Script
 * Scans all HTML files for broken internal links
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const cheerio = require('cheerio');
const chalk = require('chalk');

const SITE_DIR = '_site';
const broken = [];
const external = [];

async function validateLinks() {
  console.log(chalk.blue.bold('\n🔗 LINK VALIDATION\n'));
  
  const htmlFiles = await glob(`${SITE_DIR}/**/*.html`);
  const validPaths = new Set(htmlFiles.map(f => 
    '/' + path.relative(SITE_DIR, f).replace(/\\/g, '/')
  ));
  
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf-8');
    const $ = cheerio.load(html);
    const relPath = path.relative(SITE_DIR, file);
    
    $('a[href]').each((i, elem) => {
      const href = $(elem).attr('href');
      
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      
      // External links
      if (href.match(/^https?:\/\//)) {
        external.push({ file: relPath, href });
        return;
      }
      
      // Internal links
      let targetPath = href;
      if (href.includes('#')) {
        targetPath = href.split('#')[0];
      }
      if (href.includes('?')) {
        targetPath = href.split('?')[0];
      }
      
      if (!targetPath) return;
      
      // Resolve relative paths
      const fileDir = path.dirname('/' + relPath.replace(/\\/g, '/'));
      const absolutePath = path.posix.join(fileDir, targetPath);
      
      // Check if target exists
      if (!validPaths.has(absolutePath) && !validPaths.has(absolutePath + '/index.html')) {
        const fullPath = path.join(SITE_DIR, absolutePath);
        if (!fs.existsSync(fullPath)) {
          broken.push({
            source: relPath,
            href,
            target: absolutePath
          });
        }
      }
    });
  }
  
  printReport();
}

function printReport() {
  console.log(chalk.yellow.bold('📊 VALIDATION RESULTS\n'));
  
  if (broken.length > 0) {
    console.log(chalk.red.bold(`❌ Broken Internal Links: ${broken.length}\n`));
    const grouped = broken.reduce((acc, link) => {
      if (!acc[link.source]) acc[link.source] = [];
      acc[link.source].push(link.href);
      return acc;
    }, {});
    
    Object.entries(grouped).slice(0, 20).forEach(([source, links]) => {
      console.log(`  ${chalk.cyan(source)}`);
      links.forEach(link => console.log(chalk.gray(`    → ${link}`)));
    });
    
    if (Object.keys(grouped).length > 20) {
      console.log(chalk.gray(`  ... and ${Object.keys(grouped).length - 20} more files`));
    }
  } else {
    console.log(chalk.green('✓ No broken internal links found'));
  }
  
  console.log(chalk.blue(`\nℹ️  Found ${external.length} external links (not validated)\n`));
}

if (require.main === module) {
  if (!fs.existsSync(SITE_DIR)) {
    console.error(chalk.red('Error: _site not found. Run `npm run build` first.'));
    process.exit(1);
  }
  validateLinks();
}

module.exports = { validateLinks };
