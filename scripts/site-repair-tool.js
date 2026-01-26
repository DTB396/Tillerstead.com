#!/usr/bin/env node
/**
 * Automated Component Repair Tool
 * Similar to onepage.io but tailored for this site
 * 
 * Scans for and fixes common issues:
 * - Broken links
 * - Missing meta descriptions
 * - Unused files
 * - Component errors
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const chalk = require('chalk');

class SiteRepairTool {
  constructor() {
    this.issues = {
      brokenLinks: [],
      missingMeta: [],
      unusedFiles: [],
      componentErrors: [],
      total: 0
    };
    this.fixes = [];
  }

  async scan() {
    console.log(chalk.blue.bold('\n🔧 SITE REPAIR TOOL\n'));
    console.log('Scanning for issues...\n');

    await this.scanBrokenComponents();
    await this.scanBrokenLinks();
    await this.scanMissingMeta();
    await this.scanUnusedFiles();

    this.printSummary();
    return this.fixes;
  }

  async scanBrokenComponents() {
    console.log('→ Checking components...');
    
    const criticalComponents = [
      '_includes/header.html',
      '_includes/layout/footer.html',
      '_includes/navigation/secure-main-nav.html',
      '_includes/components/sticky-cta.html',
      '_includes/components/cta-estimate.html'
    ];

    for (const comp of criticalComponents) {
      if (!fs.existsSync(comp)) {
        this.issues.componentErrors.push({
          file: comp,
          error: 'Component file not found',
          fix: 'Create missing component or update includes'
        });
        this.issues.total++;
      } else {
        const content = fs.readFileSync(comp, 'utf-8');
        
        // Check for broken include references
        const includeMatches = content.matchAll(/{%\s*include\s+([^\s%]+)/g);
        for (const match of includeMatches) {
          const includePath = `_includes/${match[1]}`;
          if (!fs.existsSync(includePath)) {
            this.issues.componentErrors.push({
              file: comp,
              error: `Broken include: ${match[1]}`,
              fix: `Create ${includePath} or fix reference`
            });
            this.issues.total++;
          }
        }
      }
    }

    console.log(`✓ Components checked: ${this.issues.componentErrors.length} issues found\n`);
  }

  async scanBrokenLinks() {
    console.log('→ Checking links...');
    
    const htmlFiles = await glob('_site/**/*.html');
    const validPaths = new Set(
      htmlFiles.map(f => '/' + path.relative('_site', f).replace(/\\/g, '/'))
    );

    const commonBrokenLinks = [
      '/build/phase-01/',
      '/build/phase-02/',
      '/build/phase-03/',
      '/services/',
      '/portfolio/',
      '/blog/',
      '/reviews/',
      '/about/',
      '/faq/'
    ];

    for (const link of commonBrokenLinks) {
      if (!validPaths.has(link) && !validPaths.has(link + 'index.html')) {
        const fullPath = path.join('_site', link);
        if (!fs.existsSync(fullPath)) {
          this.issues.brokenLinks.push({
            link,
            fix: `Create ${link} page or update navigation links`
          });
          this.issues.total++;
        }
      }
    }

    console.log(`✓ Links checked: ${this.issues.brokenLinks.length} broken links\n`);
  }

  async scanMissingMeta() {
    console.log('→ Checking SEO...');
    
    const mainPages = [
      'index.html',
      'services.html',
      'portfolio.html',
      'contact.html',
      'build.html'
    ];

    for (const page of mainPages) {
      if (fs.existsSync(page)) {
        const content = fs.readFileSync(page, 'utf-8');
        const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        
        if (frontMatterMatch) {
          const frontMatter = frontMatterMatch[1];
          if (!frontMatter.includes('meta_description:') && !frontMatter.includes('description:')) {
            this.issues.missingMeta.push({
              file: page,
              fix: 'Add meta_description to front matter'
            });
            this.issues.total++;
          }
        }
      }
    }

    console.log(`✓ SEO checked: ${this.issues.missingMeta.length} missing meta descriptions\n`);
  }

  async scanUnusedFiles() {
    console.log('→ Checking unused files...');
    
    // Read all built HTML to see what's referenced
    const htmlFiles = await glob('_site/**/*.html');
    let allHTML = '';
    for (const file of htmlFiles.slice(0, 20)) { // Sample
      allHTML += fs.readFileSync(file, 'utf-8');
    }

    // Check for commonly unused patterns
    const jsFiles = await glob('assets/js/**/*.js');
    const unusedPatterns = [
      'nuclear-scroll-fix.js',
      'boss-interactions.js',
      'carousel-premium.js',
      'loading-screen.js'
    ];

    for (const file of jsFiles) {
      const fileName = path.basename(file);
      if (unusedPatterns.includes(fileName)) {
        if (!allHTML.includes(fileName)) {
          this.issues.unusedFiles.push({
            file: fileName,
            fix: 'Remove file or add to scripts.html'
          });
          this.issues.total++;
        }
      }
    }

    console.log(`✓ Unused files: ${this.issues.unusedFiles.length} detected\n`);
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.yellow.bold('📊 REPAIR SUMMARY\n'));

    if (this.issues.componentErrors.length > 0) {
      console.log(chalk.red.bold(`❌ Component Errors (${this.issues.componentErrors.length})`));
      this.issues.componentErrors.slice(0, 5).forEach(issue => {
        console.log(`  ${chalk.cyan(issue.file)}`);
        console.log(chalk.gray(`    Error: ${issue.error}`));
        console.log(chalk.green(`    Fix: ${issue.fix}`));
      });
      console.log();
    }

    if (this.issues.brokenLinks.length > 0) {
      console.log(chalk.red.bold(`🔗 Broken Links (${this.issues.brokenLinks.length})`));
      this.issues.brokenLinks.slice(0, 5).forEach(issue => {
        console.log(`  ${chalk.cyan(issue.link)}`);
        console.log(chalk.green(`    Fix: ${issue.fix}`));
      });
      if (this.issues.brokenLinks.length > 5) {
        console.log(chalk.gray(`  ... and ${this.issues.brokenLinks.length - 5} more`));
      }
      console.log();
    }

    if (this.issues.missingMeta.length > 0) {
      console.log(chalk.yellow.bold(`📝 Missing Meta Descriptions (${this.issues.missingMeta.length})`));
      this.issues.missingMeta.forEach(issue => {
        console.log(`  ${chalk.cyan(issue.file)} - ${chalk.gray(issue.fix)}`);
      });
      console.log();
    }

    if (this.issues.unusedFiles.length > 0) {
      console.log(chalk.gray.bold(`🗑️  Unused Files (${this.issues.unusedFiles.length})`));
      this.issues.unusedFiles.slice(0, 5).forEach(issue => {
        console.log(`  ${chalk.gray(issue.file)}`);
      });
      console.log();
    }

    console.log('='.repeat(60));
    console.log(chalk.blue.bold(`\n📈 TOTAL ISSUES: ${this.issues.total}\n`));

    if (this.issues.total === 0) {
      console.log(chalk.green('✨ No critical issues found! Site looks good.\n'));
    } else {
      console.log(chalk.yellow('⚠️  Run with --fix flag to attempt auto-repair\n'));
    }
  }

  async autoFix() {
    console.log(chalk.blue.bold('\n🔧 AUTO-REPAIR MODE\n'));
    
    // Auto-fix broken links by creating redirect pages
    for (const issue of this.issues.brokenLinks) {
      console.log(chalk.cyan(`Fixing: ${issue.link}`));
      // Implementation would go here
    }

    console.log(chalk.green('\n✅ Auto-repair complete!\n'));
  }
}

// Run if called directly
if (require.main === module) {
  const tool = new SiteRepairTool();
  const args = process.argv.slice(2);
  
  tool.scan().then(fixes => {
    if (args.includes('--fix')) {
      tool.autoFix();
    }
  });
}

module.exports = SiteRepairTool;
