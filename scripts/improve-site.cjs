#!/usr/bin/env node

/**
 * Tillerstead Site Improvement Script
 * Comprehensive automation for functions, style, and structure optimization
 *
 * Usage: node scripts/improve-site.js [--check|--fix|--report]
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Color output helpers
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) =>
    console.log(
      `\n${colors.bright}${colors.cyan}━━━ ${msg} ━━━${colors.reset}\n`,
    ),
};

// Configuration
const config = {
  rootDir: process.cwd(),
  srcDirs: {
    sass: "_sass",
    includes: "_includes",
    layouts: "_layouts",
    pages: "pages",
    assets: "assets",
  },
  outputDir: "_site",
  reports: "reports",
};

// Issue tracking
const issues = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  fixed: [],
};

// ============================================================================
// STRUCTURE IMPROVEMENTS
// ============================================================================

async function checkStructure() {
  log.section("Checking Site Structure");

  const checks = [
    {
      name: "Required directories exist",
      check: () => {
        const requiredDirs = [
          "_sass",
          "_includes",
          "_layouts",
          "pages",
          "assets",
        ];
        const missing = requiredDirs.filter((dir) => !fs.existsSync(dir));
        if (missing.length > 0) {
          issues.high.push(`Missing directories: ${missing.join(", ")}`);
          return false;
        }
        return true;
      },
      fix: () => {
        const requiredDirs = [
          "_sass",
          "_includes",
          "_layouts",
          "pages",
          "assets",
          "reports",
        ];
        requiredDirs.forEach((dir) => {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            log.success(`Created directory: ${dir}`);
            issues.fixed.push(`Created missing directory: ${dir}`);
          }
        });
      },
    },
    {
      name: "No duplicate HTML/MD files in pages/",
      check: () => {
        if (!fs.existsSync("pages")) return true;

        const files = fs.readdirSync("pages");
        const basenames = new Map();
        const duplicates = [];

        files.forEach((file) => {
          const basename = path.parse(file).name;
          if (basenames.has(basename)) {
            duplicates.push(
              `${basename}: ${basenames.get(basename)} and ${file}`,
            );
          } else {
            basenames.set(basename, file);
          }
        });

        if (duplicates.length > 0) {
          issues.critical.push(
            `Duplicate page files found: ${duplicates.join("; ")}`,
          );
          return false;
        }
        return true;
      },
      fix: () => {
        // Manual intervention required - log for review
        log.warning("Duplicate files require manual review");
      },
    },
    {
      name: "Consistent file naming (kebab-case)",
      check: () => {
        const badNames = [];
        const checkDir = (dir) => {
          if (!fs.existsSync(dir)) return;
          fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
            const name = entry.name;
            if (name.startsWith(".") || name.startsWith("_")) return;

            // Check for non-kebab-case (camelCase, snake_case, spaces)
            if (/[A-Z]/.test(name) || /_/.test(name) || /\s/.test(name)) {
              badNames.push(`${dir}/${name}`);
            }

            if (entry.isDirectory()) {
              checkDir(path.join(dir, name));
            }
          });
        };

        ["_sass", "_includes", "pages"].forEach(checkDir);

        if (badNames.length > 0) {
          issues.low.push(`Non-kebab-case files: ${badNames.join(", ")}`);
          return false;
        }
        return true;
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  checks.forEach(({ name, check }) => {
    const result = check();
    if (result) {
      log.success(name);
      passed++;
    } else {
      log.error(name);
      failed++;
    }
  });

  log.info(`Structure checks: ${passed} passed, ${failed} failed`);
  return checks;
}

// ============================================================================
// STYLE IMPROVEMENTS
// ============================================================================

async function checkStyles() {
  log.section("Checking CSS/SCSS Quality");

  const checks = [
    {
      name: "All SCSS files compile without errors",
      check: () => {
        try {
          execSync("npm run build:css", { stdio: "pipe" });
          return true;
        } catch (e) {
          issues.critical.push("SCSS compilation failed");
          return false;
        }
      },
      fix: () => {
        log.warning("SCSS errors require manual fixing");
      },
    },
    {
      name: "No hardcoded colors (use design tokens)",
      check: () => {
        const hardcodedColors = [];
        const colorRegex = /#[0-9a-fA-F]{3,6}(?![^{]*})/g;

        const checkFile = (filePath) => {
          const content = fs.readFileSync(filePath, "utf8");
          const matches = content.match(colorRegex);
          if (matches && matches.length > 5) {
            // Allow few for gradients
            hardcodedColors.push(
              `${filePath}: ${matches.length} hardcoded colors`,
            );
          }
        };

        const walkDir = (dir) => {
          if (!fs.existsSync(dir)) return;
          fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              walkDir(fullPath);
            } else if (entry.name.endsWith(".scss")) {
              checkFile(fullPath);
            }
          });
        };

        walkDir("_sass");

        if (hardcodedColors.length > 0) {
          issues.medium.push(
            `Hardcoded colors found: ${hardcodedColors.join("; ")}`,
          );
          return false;
        }
        return true;
      },
    },
    {
      name: "Mobile breakpoints defined",
      check: () => {
        const mainCss = fs.existsSync("assets/css/style.css")
          ? fs.readFileSync("assets/css/style.css", "utf8")
          : "";

        const hasBreakpoints =
          mainCss.includes("@media") &&
          (mainCss.includes("max-width") || mainCss.includes("min-width"));

        if (!hasBreakpoints) {
          issues.high.push("No responsive breakpoints found in CSS");
          return false;
        }
        return true;
      },
    },
    {
      name: "Contrast ratios meet WCAG AA",
      check: () => {
        // Run contrast checker if available
        if (fs.existsSync("scripts/check-contrast.js")) {
          try {
            execSync("node scripts/check-contrast.js", { stdio: "pipe" });
            return true;
          } catch (e) {
            issues.high.push("Contrast ratio checks failed");
            return false;
          }
        }
        log.warning("Contrast checker script not found");
        return true; // Skip if script doesn't exist
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  checks.forEach(({ name, check }) => {
    const result = check();
    if (result) {
      log.success(name);
      passed++;
    } else {
      log.error(name);
      failed++;
    }
  });

  log.info(`Style checks: ${passed} passed, ${failed} failed`);
  return checks;
}

// ============================================================================
// FUNCTIONALITY IMPROVEMENTS
// ============================================================================

async function checkFunctionality() {
  log.section("Checking Site Functionality");

  const checks = [
    {
      name: "All forms have proper attributes",
      check: () => {
        const badForms = [];

        if (fs.existsSync("_site")) {
          const checkFile = (filePath) => {
            const content = fs.readFileSync(filePath, "utf8");
            const formMatches = content.match(/<form[^>]*>/g);

            if (formMatches) {
              formMatches.forEach((form) => {
                // Check for action="#" or missing method
                if (
                  form.includes('action="#"') &&
                  !form.includes("data-netlify")
                ) {
                  badForms.push(
                    `${filePath}: Form with action="#" and no Netlify`,
                  );
                }
                if (!form.includes("method=")) {
                  badForms.push(`${filePath}: Form missing method attribute`);
                }
              });
            }
          };

          const walkDir = (dir) => {
            fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
              const fullPath = path.join(dir, entry.name);
              if (entry.isDirectory() && !entry.name.startsWith(".")) {
                walkDir(fullPath);
              } else if (entry.name.endsWith(".html")) {
                checkFile(fullPath);
              }
            });
          };

          walkDir("_site");
        }

        if (badForms.length > 0) {
          issues.critical.push(`Form issues: ${badForms.join("; ")}`);
          return false;
        }
        return true;
      },
      fix: () => {
        log.warning("Form issues require manual review of form includes");
      },
    },
    {
      name: "Images have alt attributes",
      check: () => {
        const missingAlts = [];

        if (fs.existsSync("_site/index.html")) {
          const content = fs.readFileSync("_site/index.html", "utf8");
          const imgWithoutAlt = content.match(/<img(?![^>]*alt=)[^>]*>/g);

          if (imgWithoutAlt && imgWithoutAlt.length > 0) {
            issues.high.push(
              `${imgWithoutAlt.length} images missing alt attributes`,
            );
            return false;
          }
        }
        return true;
      },
    },
    {
      name: "No broken internal links",
      check: () => {
        // Basic check - could be enhanced
        if (fs.existsSync("_site")) {
          const brokenLinks = [];
          const checkFile = (filePath) => {
            const content = fs.readFileSync(filePath, "utf8");
            const links = content.match(/href="\/[^"]*"/g) || [];

            links.forEach((link) => {
              const url = link.match(/href="([^"]*)"/)[1];
              const targetPath = path.join("_site", url);

              if (
                !fs.existsSync(targetPath) &&
                !fs.existsSync(targetPath + ".html") &&
                !fs.existsSync(path.join(targetPath, "index.html"))
              ) {
                brokenLinks.push(`${filePath}: ${url}`);
              }
            });
          };

          if (fs.existsSync("_site/index.html")) {
            checkFile("_site/index.html");
          }

          if (brokenLinks.length > 0) {
            issues.medium.push(
              `Potential broken links: ${brokenLinks.slice(0, 3).join("; ")}`,
            );
            return false;
          }
        }
        return true;
      },
    },
    {
      name: "JavaScript loaded with defer/async",
      check: () => {
        const badScripts = [];

        if (fs.existsSync("_site/index.html")) {
          const content = fs.readFileSync("_site/index.html", "utf8");
          const scripts = content.match(/<script[^>]*src=[^>]*>/g) || [];

          scripts.forEach((script) => {
            if (
              !script.includes("defer") &&
              !script.includes("async") &&
              !script.includes('type="module"')
            ) {
              badScripts.push(script);
            }
          });

          if (badScripts.length > 0) {
            issues.medium.push(
              `${badScripts.length} scripts without defer/async`,
            );
            return false;
          }
        }
        return true;
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  checks.forEach(({ name, check }) => {
    const result = check();
    if (result) {
      log.success(name);
      passed++;
    } else {
      log.error(name);
      failed++;
    }
  });

  log.info(`Functionality checks: ${passed} passed, ${failed} failed`);
  return checks;
}

// ============================================================================
// PERFORMANCE IMPROVEMENTS
// ============================================================================

async function checkPerformance() {
  log.section("Checking Performance");

  const checks = [
    {
      name: "CSS file size < 100KB",
      check: () => {
        if (fs.existsSync("assets/css/style.css")) {
          const stats = fs.statSync("assets/css/style.css");
          const sizeKB = stats.size / 1024;

          if (sizeKB > 100) {
            issues.medium.push(`CSS file is ${sizeKB.toFixed(2)}KB (>100KB)`);
            return false;
          }
          log.info(`CSS size: ${sizeKB.toFixed(2)}KB`);
        }
        return true;
      },
    },
    {
      name: "Images optimized (WebP preferred)",
      check: () => {
        const imageDir = "assets/img";
        if (!fs.existsSync(imageDir)) return true;

        let totalImages = 0;
        let webpCount = 0;

        const walkDir = (dir) => {
          fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              walkDir(fullPath);
            } else if (/\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
              totalImages++;
              if (entry.name.endsWith(".webp")) webpCount++;
            }
          });
        };

        walkDir(imageDir);

        if (totalImages > 0 && webpCount / totalImages < 0.3) {
          issues.low.push(
            `Only ${((webpCount / totalImages) * 100).toFixed(0)}% of images are WebP`,
          );
          return false;
        }

        log.info(`Images: ${webpCount}/${totalImages} are WebP`);
        return true;
      },
    },
    {
      name: "Lazy loading implemented",
      check: () => {
        if (fs.existsSync("_site/index.html")) {
          const content = fs.readFileSync("_site/index.html", "utf8");
          const imgs = content.match(/<img[^>]*>/g) || [];
          const lazyImgs = imgs.filter((img) =>
            img.includes('loading="lazy"'),
          ).length;

          if (imgs.length > 3 && lazyImgs === 0) {
            issues.medium.push("No images use lazy loading");
            return false;
          }

          log.info(`Lazy loading: ${lazyImgs}/${imgs.length} images`);
        }
        return true;
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  checks.forEach(({ name, check }) => {
    const result = check();
    if (result) {
      log.success(name);
      passed++;
    } else {
      log.error(name);
      failed++;
    }
  });

  log.info(`Performance checks: ${passed} passed, ${failed} failed`);
  return checks;
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateReport() {
  log.section("Generating Improvement Report");

  const timestamp = new Date().toISOString().split("T")[0];
  const reportPath = path.join("reports", `site-improvement-${timestamp}.md`);

  const totalIssues =
    issues.critical.length +
    issues.high.length +
    issues.medium.length +
    issues.low.length;

  const report = `# Site Improvement Report

**Date:** ${new Date().toISOString()}  
**Total Issues:** ${totalIssues}  
**Fixed:** ${issues.fixed.length}

---

## Critical Issues (${issues.critical.length})

${issues.critical.length > 0 ? issues.critical.map((i) => `- ⛔ ${i}`).join("\n") : "_None_"}

## High Priority (${issues.high.length})

${issues.high.length > 0 ? issues.high.map((i) => `- 🔴 ${i}`).join("\n") : "_None_"}

## Medium Priority (${issues.medium.length})

${issues.medium.length > 0 ? issues.medium.map((i) => `- 🟡 ${i}`).join("\n") : "_None_"}

## Low Priority (${issues.low.length})

${issues.low.length > 0 ? issues.low.map((i) => `- 🔵 ${i}`).join("\n") : "_None_"}

## Fixed in This Run (${issues.fixed.length})

${issues.fixed.length > 0 ? issues.fixed.map((i) => `- ✅ ${i}`).join("\n") : "_None_"}

---

## Recommendations

### Immediate Actions
${issues.critical.length > 0 ? "- Fix all critical issues immediately\n" : ""}${issues.high.length > 0 ? "- Address high priority issues within 24 hours\n" : ""}

### Short-term (This Week)
- Review medium priority issues
- Plan fixes for next sprint

### Long-term (This Month)
- Address low priority issues as time permits
- Implement automated monitoring

---

**Generated by:** Tillerstead Site Improvement Script  
**Version:** 1.0.0
`;

  if (!fs.existsSync("reports")) {
    fs.mkdirSync("reports", { recursive: true });
  }

  fs.writeFileSync(reportPath, report);
  log.success(`Report saved to: ${reportPath}`);

  return reportPath;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || "--check";

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║          Tillerstead Site Improvement Script v1.0.0           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);

  log.info(`Mode: ${mode}`);
  log.info(`Working directory: ${config.rootDir}\n`);

  // Run all checks
  const structureChecks = await checkStructure();
  const styleChecks = await checkStyles();
  const functionalityChecks = await checkFunctionality();
  const performanceChecks = await checkPerformance();

  // Apply fixes if --fix mode
  if (mode === "--fix") {
    log.section("Applying Fixes");

    [
      ...structureChecks,
      ...styleChecks,
      ...functionalityChecks,
      ...performanceChecks,
    ].forEach(({ name, fix }) => {
      if (fix) {
        try {
          fix();
        } catch (e) {
          log.error(`Failed to fix: ${name}`);
        }
      }
    });
  }

  // Generate report
  const reportPath = generateReport();

  // Summary
  log.section("Summary");

  const totalIssues =
    issues.critical.length +
    issues.high.length +
    issues.medium.length +
    issues.low.length;

  console.log(`
  Critical: ${colors.red}${issues.critical.length}${colors.reset}
  High:     ${colors.yellow}${issues.high.length}${colors.reset}
  Medium:   ${colors.cyan}${issues.medium.length}${colors.reset}
  Low:      ${colors.green}${issues.low.length}${colors.reset}
  ──────────────────
  Total:    ${totalIssues}
  Fixed:    ${colors.green}${issues.fixed.length}${colors.reset}

  Report: ${reportPath}
  `);

  if (totalIssues === 0) {
    console.log(
      `${colors.green}${colors.bright}✨ Site is in excellent condition! ✨${colors.reset}\n`,
    );
    return 0;
  } else if (issues.critical.length > 0) {
    console.log(
      `${colors.red}${colors.bright}⚠️  Critical issues require immediate attention!${colors.reset}\n`,
    );
    return 1;
  } else {
    console.log(
      `${colors.yellow}${colors.bright}✓ Site is functional but has room for improvement${colors.reset}\n`,
    );
    return 0;
  }
}

// Run if called directly
if (require.main === module) {
  main().then(process.exit);
}

module.exports = {
  main,
  checkStructure,
  checkStyles,
  checkFunctionality,
  checkPerformance,
};
