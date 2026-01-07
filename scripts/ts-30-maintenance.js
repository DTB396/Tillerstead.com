#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// ===== Phase 1: Configuration & Environment Fixes =====

// 1.A Remove duplicate 'url' and 'baseurl' entries in _config.yml
const configPath = '_config.yml';
if (fs.existsSync(configPath)) {
  const configText = fs.readFileSync(configPath, 'utf8');
  const lines = configText.split(/\r?\n/);
  let seenUrl = false,
    seenBase = false;
  const newLines = [];
  for (let line of lines) {
    if (/^\s*url\s*:/i.test(line)) {
      if (!seenUrl) {
        seenUrl = true;
        newLines.push(line);
      } else continue; // skip duplicate url
    } else if (/^\s*baseurl\s*:/i.test(line)) {
      if (!seenBase) {
        seenBase = true;
        newLines.push(line);
      } else continue; // skip duplicate baseurl
    } else {
      newLines.push(line);
    }
  }
  const newConfigText = newLines.join('\n') + '\n';
  if (newConfigText !== configText) {
    fs.writeFileSync(configPath, newConfigText, 'utf8');
    console.log(`✓ Removed duplicate url/baseurl entries in ${configPath}`);
  }
}

// 1.B Enforce Node version requirements in package.json ("engines" field)
const pkgPath = 'package.json';
let pkgData = null;
if (fs.existsSync(pkgPath)) {
  try {
    const pkgText = fs.readFileSync(pkgPath, 'utf8');
    pkgData = JSON.parse(pkgText);
  } catch (err) {
    console.error(`⚠️ Unable to parse package.json: ${err.message}`);
    pkgData = null;
  }
  if (pkgData) {
    pkgData.engines = pkgData.engines || {};
    // Standardize on Node 18+ (update to Node 20 if desired)
    pkgData.engines.node = '>=18.0.0';
  }
}

// 1.C Synchronize Node version across environments (Netlify config to Node 20)
const netlifyPath = 'netlify.toml';
if (fs.existsSync(netlifyPath)) {
  const netlifyConf = fs.readFileSync(netlifyPath, 'utf8');
  const updatedConf = netlifyConf.replace(
    /NODE_VERSION\s*=\s*"?18"?/,
    'NODE_VERSION = "20"',
  );
  if (updatedConf !== netlifyConf) {
    fs.writeFileSync(netlifyPath, updatedConf, 'utf8');
    console.log('✓ Updated Netlify Node version to 20 in netlify.toml');
  }
}

// 1.D Ensure .gitignore has all important build artifacts ignored
const gitignorePath = '.gitignore';
const commonPatterns = [
  'node_modules/',
  '_site/',
  '.sass-cache/',
  '.jekyll-cache/',
  '.bundle/',
  'Gemfile.lock',
];
let gitignoreContent = '';
if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
}
let addedPatterns = [];
for (const pat of commonPatterns) {
  // Add pattern if not already present (ignoring trailing slashes in comparison)
  const patternNormalized = pat.replace(/\/$/, '');
  if (
    !gitignoreContent
      .split(/\r?\n/)
      .some((line) => line.replace(/\/$/, '') === patternNormalized)
  ) {
    addedPatterns.push(pat);
    gitignoreContent +=
      (gitignoreContent.endsWith('\n') ? '' : '\n') + pat + '\n';
  }
}
if (addedPatterns.length > 0) {
  fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
  console.log(`✓ Updated .gitignore to include: ${addedPatterns.join(', ')}`);
}

// ===== Phase 2: Remove Placeholder and Redundant Code =====

// 2.A Remove trivial placeholder test (hello_world_test.rb)
const testFile = path.join('test', 'hello_world_test.rb');
if (fs.existsSync(testFile)) {
  fs.unlinkSync(testFile);
  console.log(`✓ Removed placeholder test file ${testFile}`);
}

// 2.B Clean up redundant data entries in _data/portfolio.yml (commented file_webp lines)
const portfolioDataPath = path.join('_data', 'portfolio.yml');
if (fs.existsSync(portfolioDataPath)) {
  const portfolioText = fs.readFileSync(portfolioDataPath, 'utf8');
  const cleanedPortfolio = portfolioText.replace(
    /^\s*#\s*file_webp:.*\r?\n/gm,
    '',
  );
  if (cleanedPortfolio !== portfolioText) {
    fs.writeFileSync(portfolioDataPath, cleanedPortfolio, 'utf8');
    console.log(
      '✓ Removed commented-out file_webp lines in _data/portfolio.yml',
    );
  }
}

// 2.C Remove unused constant definitions in scripts (e.g., _FILE_PATTERNS in consolidate-colors.js)
const consolidatePath = path.join('scripts', 'consolidate-colors.js');
if (fs.existsSync(consolidatePath)) {
  const consolidateText = fs.readFileSync(consolidatePath, 'utf8');
  const cleanedConsolidate = consolidateText.replace(
    /const _FILE_PATTERNS\s*=\s*\[[\s\S]*?\];\r?\n/,
    '',
  );
  if (cleanedConsolidate !== consolidateText) {
    fs.writeFileSync(consolidatePath, cleanedConsolidate, 'utf8');
    console.log(
      '✓ Removed unused _FILE_PATTERNS constant in consolidate-colors.js',
    );
  }
}

// 2.D Remove one-off fix scripts no longer needed
const oneTimeScripts = [
  'fix-undefined-css-vars.js',
  'refactor-all-css-prefixes.js',
  'fix-all-property-usages.js',
  'scan-and-fix-all-violations.js',
  'final-mega-fix.js',
  'phase4-final-cleanup.js',
];
for (const scriptName of oneTimeScripts) {
  const scriptPath = path.join('scripts', scriptName);
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
    console.log(`✓ Removed one-time script ${scriptPath}`);
  }
}
// Also remove their npm script references in package.json
if (pkgData && pkgData.scripts) {
  for (const key of Object.keys(pkgData.scripts)) {
    if (key.startsWith('fix:phase') || key === 'fix:all') {
      delete pkgData.scripts[key];
    }
  }
}

// ===== Phase 3: Simplify Build Logic & Improve Maintainability =====

// 3.A Use Sharp for SVG-to-PNG conversion in generate-png-logos.js (remove external tool dependency)
const logosPath = path.join('scripts', 'generate-png-logos.js');
if (fs.existsSync(logosPath)) {
  let logosText = fs.readFileSync(logosPath, 'utf8');
  // Inject sharp import if not present
  if (!logosText.includes("import sharp from 'sharp'")) {
    logosText = logosText.replace(
      "import { exec } from 'child_process';",
      "import { exec } from 'child_process';\nimport sharp from 'sharp';",
    );
  }
  // Remove the tool-checking and external conversion functions
  logosText = logosText.replace(
    /async function checkTools\([\s\S]*?process\.exit\(1\);\s*}\s*/m,
    '',
  );
  logosText = logosText.replace(
    /const tool = await checkTools\(\);\s*[\s\S]*?console\.log\(`Using: .*?\n/,
    '',
  );
  logosText = logosText.replace(
    /async function convertWithImageMagick[\s\S]*?async function convertSvgToPng[\s\S]*?\}\s*}/,
    '',
  );
  // Replace conversion loop to use sharp
  logosText = logosText.replace(
    /try\s*{\s*await convertSvgToPng\(.*?}\s*catch\s*\(error\)\s*{\s*console\.error\([\s\S]*?failed\+\+;/m,
    `try {
            await sharp(inputPath, { density: 300 })
              .resize(output.width, output.height)
              .png()
              .toFile(outputPath);
            console.log(\`  ✓ \${output.name} (\${output.width}×\${output.height})\`);
            converted++;
          } catch (error) {
            console.error(\`  ✗ Failed: \${output.name}\`);
            console.error(\`    \${error.message}\`);
            failed++;
          }`,
  );
  fs.writeFileSync(logosPath, logosText, 'utf8');
  console.log(
    '✓ Refactored generate-png-logos.js to use Sharp for SVG conversion',
  );
}

// 3.B Enhance regex in find-unused-css.js to catch single-quoted and multi-line class attributes
const unusedCSSPath = path.join('scripts', 'find-unused-css.js');
if (fs.existsSync(unusedCSSPath)) {
  const unusedText = fs.readFileSync(unusedCSSPath, 'utf8');
  const improvedRegexText = unusedText.replace(
    /matchAll\(\s*\/class="([^"]*)"\/g\)/,
    "matchAll(/class=\"([^\"]*)\"|class='([^']*)'/g)",
  );
  if (improvedRegexText !== unusedText) {
    fs.writeFileSync(unusedCSSPath, improvedRegexText, 'utf8');
    console.log(
      '✓ Updated find-unused-css.js to capture single-quoted and multi-line classes',
    );
  }
}

// ===== Phase 4: Dependency & Version Alignment =====

// 4.A Pin all devDependencies to exact versions (remove ^ carets)
if (pkgData && pkgData.devDependencies) {
  for (const [dep, version] of Object.entries(pkgData.devDependencies)) {
    if (typeof version === 'string' && version.startsWith('^')) {
      pkgData.devDependencies[dep] = version.replace(/^\^/, '');
      console.log(`✓ Pinned ${dep} version to ${pkgData.devDependencies[dep]}`);
    }
  }
}

// 4.B Write back package.json changes (scripts removed, engines added, versions pinned)
if (pkgData) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkgData, null, 2) + '\n', 'utf8');
  console.log(
    '✓ Updated package.json (engines field, removed old scripts, pinned versions)',
  );
}

// ===== Phase 5: Project Cleanup (Dead Code & Assets Removal) =====

// 5.A Remove legacy report files and logs (e.g., TILLERSTEAD_*.txt, FINAL_REPORT.txt)
const rootFiles = fs.readdirSync('.').filter((f) => fs.statSync(f).isFile());
const legacyPatterns = [
  /^TILLERSTEAD.*\.txt$/i,
  /^FINAL_REPORT\.txt$/i,
  /PHASE\d+_COMPLETE.*\.txt$/i,
  /REPORT\.txt$/i,
  /_COMPLETE\.txt$/i,
];
for (const file of rootFiles) {
  if (legacyPatterns.some((regex) => regex.test(file))) {
    fs.unlinkSync(file);
    console.log(`✓ Removed legacy file ${file}`);
  }
}

// 5.B Remove unused SCSS partials in _sass (not imported in style.scss)
const sassDir = '_sass';
if (fs.existsSync(sassDir)) {
  // Collect all .scss files under _sass (relative paths without extension)
  const allScssFiles = [];
  const walkDir = (dir) => {
    fs.readdirSync(dir).forEach((name) => {
      const fullPath = path.join(dir, name);
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath);
      } else if (name.endsWith('.scss')) {
        // relative path from _sass without extension
        const relPath = path
          .relative(sassDir, fullPath)
          .replace(/\\/g, '/')
          .replace(/\.scss$/, '');
        allScssFiles.push(relPath);
      }
    });
  };
  walkDir(sassDir);
  // Get imports from style.scss
  const mainScssPath = path.join('assets', 'css', 'style.scss');
  const importedPaths = new Set();
  if (fs.existsSync(mainScssPath)) {
    const mainContent = fs.readFileSync(mainScssPath, 'utf8');
    const importRegex = /@import\s+["']([^"']+)["']/g;
    let match;
    while ((match = importRegex.exec(mainContent)) !== null) {
      // Imported path as in SCSS (e.g., "10-base/typography")
      importedPaths.add(match[1]);
    }
  }
  // Determine unused partials: those not listed in importedPaths (accounting for underscore naming)
  for (const relPath of allScssFiles) {
    // Normalize by removing leading underscore from filename
    const segments = relPath.split('/');
    const fileName = segments.pop() || '';
    const baseName = fileName.startsWith('_')
      ? fileName.substring(1)
      : fileName;
    segments.push(baseName);
    const normPath = segments.join('/');
    if (!importedPaths.has(normPath)) {
      const fileToRemove = path.join(sassDir, relPath + '.scss');
      fs.unlinkSync(fileToRemove);
      console.log(`✓ Removed unused SCSS file ${fileToRemove}`);
    }
  }
}

// 5.C Remove unused Jekyll layouts (no pages reference them)
const layoutsDir = '_layouts';
if (fs.existsSync(layoutsDir)) {
  const layouts = fs.readdirSync(layoutsDir).filter((f) => f.endsWith('.html'));
  const usedLayouts = new Set();
  // Search through all pages/posts for "layout: <name>"
  const contentDirs = ['pages', '_posts'];
  for (const layoutFile of layouts) {
    const layoutName = path.parse(layoutFile).name; // layout name without extension
    const layoutPattern = new RegExp(`^layout:\\s*${layoutName}\\b`, 'm');
    let found = false;
    for (const dir of contentDirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
          // check all files in subdirectory (e.g., _posts/year)
          fs.readdirSync(filePath).forEach((innerFile) => {
            const innerPath = path.join(filePath, innerFile);
            if (/\.(md|html)$/.test(innerFile)) {
              const text = fs.readFileSync(innerPath, 'utf8');
              if (layoutPattern.test(text)) {
                usedLayouts.add(layoutName);
                found = true;
              }
            }
          });
        } else if (/\.(md|html)$/.test(file.name)) {
          const text = fs.readFileSync(filePath, 'utf8');
          if (layoutPattern.test(text)) {
            usedLayouts.add(layoutName);
            found = true;
          }
        }
        if (found) break;
      }
      if (found) break;
    }
  }
  // Delete layout files not found in use
  for (const layoutFile of layouts) {
    const layoutName = path.parse(layoutFile).name;
    if (!usedLayouts.has(layoutName)) {
      const layoutPath = path.join(layoutsDir, layoutFile);
      fs.unlinkSync(layoutPath);
      console.log(`✓ Removed unused layout ${layoutPath}`);
    }
  }
}

// 5.D Remove unused include files (not referenced via {% include %} in the project)
const includesDir = '_includes';
if (fs.existsSync(includesDir)) {
  // Gather all include files (including those in subdirectories)
  const includeFiles = [];
  const gatherIncludes = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        gatherIncludes(entryPath);
      } else if (entry.isFile()) {
        const relPath = path
          .relative(includesDir, entryPath)
          .replace(/\\/g, '/');
        includeFiles.push(relPath);
      }
    });
  };
  gatherIncludes(includesDir);
  const usedIncludes = new Set();
  // Search in all templates (layouts, includes, pages, posts) for include usage
  const searchDirs = ['_layouts', '_includes', 'pages', '_posts'];
  for (const incFile of includeFiles) {
    const incName = path.parse(incFile).name; // name without extension
    const includePattern = new RegExp(
      `{%-?\\s*include\\s+${incName}(?:\\.html)?\\s`,
      'i',
    );
    let found = false;
    for (const dir of searchDirs) {
      if (!fs.existsSync(dir)) continue;
      const scanDir = (d) => {
        fs.readdirSync(d, { withFileTypes: true }).forEach((entry) => {
          const entryPath = path.join(d, entry.name);
          if (entry.isDirectory()) {
            scanDir(entryPath);
          } else if (entry.isFile() && /\.(html|md)$/.test(entry.name)) {
            const content = fs.readFileSync(entryPath, 'utf8');
            if (includePattern.test(content)) {
              usedIncludes.add(incFile);
              found = true;
            }
          }
        });
      };
      scanDir(dir);
      if (found) break;
    }
  }
  // Delete includes not used
  for (const incFile of includeFiles) {
    if (!usedIncludes.has(incFile)) {
      const incPath = path.join(includesDir, incFile);
      fs.unlinkSync(incPath);
      console.log(`✓ Removed unused include ${incPath}`);
    }
  }
}

// 5.E Remove unused image assets in assets/img (not referenced in site content)
const assetsImgDir = path.join('assets', 'img');
if (fs.existsSync(assetsImgDir)) {
  // Collect all references to images in the repository
  const usedImages = new Set();
  const textFilePatterns = /\.(?:html|md|yml|yaml|css|js)$/;
  const dirsToScan = [
    '_config.yml',
    '_data',
    '_includes',
    '_layouts',
    'pages',
    '_posts',
    path.join('assets', 'css'),
  ];
  for (const source of dirsToScan) {
    if (!fs.existsSync(source)) continue;
    const scan = (item) => {
      if (fs.statSync(item).isDirectory()) {
        fs.readdirSync(item).forEach((child) => scan(path.join(item, child)));
      } else if (textFilePatterns.test(item)) {
        const content = fs.readFileSync(item, 'utf8');
        // Match /assets/img/... paths
        const regex1 = /\/assets\/img\/([^"')\s]+)/g;
        let match;
        while ((match = regex1.exec(content)) !== null) {
          usedImages.add(match[1]);
        }
        // Match strings that look like image filenames without explicit "/assets/img"
        const regex2 = /([^"'\s:]+\.(?:png|jpg|jpeg|webp|svg))/g;
        while ((match = regex2.exec(content)) !== null) {
          const token = match[1];
          if (token.includes('://') || token.startsWith('data:')) continue; // skip external or data URIs
          // If it's an image file name not already captured, assume it's under assets/img
          if (!usedImages.has(token) && !token.startsWith('assets/img/')) {
            usedImages.add(token);
          }
        }
      }
    };
    scan(source);
  }
  // Remove any image files that are not in usedImages set
  const removeUnusedImages = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        removeUnusedImages(entryPath);
        // Remove directory if empty after removals
        try {
          fs.rmdirSync(entryPath);
        } catch (_err) {
          /* ignore */
        }
      } else if (entry.isFile()) {
        const relPath = path
          .relative(assetsImgDir, entryPath)
          .replace(/\\/g, '/');
        // Consider both exact file name and path as recorded in usedImages (since usedImages might store just filename or subpath)
        const isUsed = usedImages.has(relPath) || usedImages.has(entry.name);
        if (!isUsed) {
          fs.unlinkSync(entryPath);
          console.log(`✓ Removed unused image assets/img/${relPath}`);
        }
      }
    });
  };
  removeUnusedImages(assetsImgDir);
}

// ===== Phase 6: Developer Workflow Enhancements =====

// 6.A Add VS Code launch configuration for debugging build/test scripts
const vscodeDir = '.vscode';
if (!fs.existsSync(vscodeDir)) {
  fs.mkdirSync(vscodeDir);
}
const launchConfigPath = path.join(vscodeDir, 'launch.json');
const launchConfig = {
  version: '0.2.0',
  configurations: [
    {
      type: 'node',
      request: 'launch',
      name: 'Debug Build CSS',
      program: '${workspaceFolder}/scripts/build-css.js',
    },
    {
      type: 'node',
      request: 'launch',
      name: 'Debug Link Checker',
      program: '${workspaceFolder}/scripts/check-links.js',
    },
  ],
};
fs.writeFileSync(
  launchConfigPath,
  JSON.stringify(launchConfig, null, 2) + '\n',
  'utf8',
);
console.log(
  '✓ Added VS Code launch configurations for build CSS and link checker debugging',
);
