#!/usr/bin/env node
/**
 * Tillerstead Modernization Script
 * Upgrades Sass imports, NPM dependencies, build scripts, and config for Node.js 24 compatibility.
 * Usage: node upgrade-project.js [--dry-run] [--commit]
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

// Determine project root directory (where package.json resides)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function findProjectRoot() {
  let projectRoot = __dirname;
  // If the script is in a subdirectory, find the package.json up the tree:
  try {
    while (!(await fs.stat(path.join(projectRoot, 'package.json'))).isFile()) {
      projectRoot = path.dirname(projectRoot);
      if (projectRoot === path.dirname(projectRoot)) break;
    }
  } catch {
    // If fs.stat threw, likely package.json not found in current or parent dirs
  }
  return projectRoot;
}

const projectRoot = await findProjectRoot();
// Change working directory to project root for relative path consistency
process.chdir(projectRoot);

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const AUTO_COMMIT = args.includes('--commit');

// Summary data to output at end
const summary = {
  sassFilesConverted: [], // list of {file, importsReplacedCount, issues: [warnings]}
  mainFileRenamed: null, // { oldName, newName } if done
  depsUpdated: [], // list of {name, oldVer, newVer}
  depsRemoved: [], // list of {name, version}
  depsAdded: [], // list of {name, version}
  enginesUpdated: null, // new engine string if set
  scriptsModified: [], // list of {file, requireCount, execCount}
  launchConfigUpdated: false,
  netlifyUpdated: false,
  rubyVersionUpdated: false,
  errors: [], // collect errors (if any) to report
};

// Helper: Write backup of a file (if not dry run)
async function backupFile(filePath) {
  if (DRY_RUN) return;
  try {
    const data = await fs.readFile(filePath);
    await fs.writeFile(filePath + '.backup', data);
  } catch (err) {
    console.error(
      `(!) Could not create backup for ${filePath}: ${err.message}`,
    );
    summary.errors.push(`Backup failed for ${filePath}: ${err.message}`);
  }
}

// 1. Sass Modernization
async function upgradeSass() {
  let sassFiles = [];
  // Find all .scss files under _sass and assets (and any others)
  // We use a manual directory crawl to avoid external deps for globbing
  async function crawl(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
            continue; // skip node_modules and hidden dirs
          }
          await crawl(fullPath);
        } else if (entry.isFile()) {
          if (entry.name.endsWith('.scss')) {
            sassFiles.push(fullPath);
          } else if (
            entry.name.endsWith('.css') &&
            entry.name.toLowerCase().includes('main')
          ) {
            // Potential main Sass file with .css extension
            // Read to check if it contains Sass import syntax
            const content = await fs.readFile(fullPath, 'utf8');
            if (/@import\s.+?["']/.test(content)) {
              sassFiles.push(fullPath);
            }
          }
        }
      }
    } catch (err) {
      // Directory might not exist or other error
    }
  }
  await crawl(path.join(projectRoot, '_sass'));
  await crawl(path.join(projectRoot, 'assets'));
  // Also check root in case style.scss is there (some Jekyll setups)
  try {
    const rootFiles = await fs.readdir(projectRoot, { withFileTypes: true });
    for (const f of rootFiles) {
      if (f.isFile() && f.name.endsWith('.scss')) {
        sassFiles.push(path.join(projectRoot, f.name));
      }
      // (We handle .css main in above crawl already)
    }
  } catch {
    /* ignore */
  }

  // Remove duplicates
  sassFiles = [...new Set(sassFiles)];

  // Check if main file with .css needs renaming to .scss
  for (const filePath of sassFiles) {
    const baseName = path.basename(filePath);
    if (baseName.endsWith('.css')) {
      // We'll rename this to .scss
      const newName = baseName.replace(/\.css$/, '.scss');
      const newPath = path.join(path.dirname(filePath), newName);
      try {
        if (!DRY_RUN) {
          // Backup original (will be renamed, so backup current content)
          await backupFile(filePath);
          await fs.rename(filePath, newPath);
        }
        summary.mainFileRenamed = { oldName: baseName, newName: newName };
        console.log(`- Renamed ${baseName} -> ${newName}`);
        // Update in list
        sassFiles = sassFiles.filter((f) => f !== filePath);
        sassFiles.push(newPath);
        // Also update any references in build scripts to the old file name:
        await updateBuildScriptReferences(baseName, newName);
      } catch (err) {
        console.error(
          `Error renaming ${baseName} to ${newName}: ${err.message}`,
        );
        summary.errors.push(
          `Failed to rename ${baseName} to ${newName}: ${err.message}`,
        );
      }
      break; // assume only one main file to rename
    }
  }

  // Function to update references in build scripts (like build-css.js or others) from old to new filename
  async function updateBuildScriptReferences(oldName, newName) {
    const scriptsDir = path.join(projectRoot, 'scripts');
    try {
      const files = await fs.readdir(scriptsDir);
      for (const fname of files) {
        if (fname.endsWith('.js')) {
          const scriptPath = path.join(scriptsDir, fname);
          let content = await fs.readFile(scriptPath, 'utf8');
          if (content.includes(oldName)) {
            const updatedContent = content.split(oldName).join(newName);
            if (updatedContent !== content) {
              if (!DRY_RUN) {
                await backupFile(scriptPath);
                await fs.writeFile(scriptPath, updatedContent);
              }
              console.log(`  Updated ${fname}: "${oldName}" → "${newName}"`);
            }
          }
        }
      }
    } catch {
      /* scripts directory may not exist or read error; ignore */
    }
  }

  // Prepare patterns for Sass import conversion
  const _importPattern = /@import\s+([^;]+);/g; // matches '@import "file";' (capturing "file")
  const _importSplitPattern = /['"][^'"]+['"]/g; // matches each quoted import inside an import statement

  for (const filePath of sassFiles) {
    let content = await fs.readFile(filePath, 'utf8');
    const _origContent = content;
    const fileRelPath = path
      .relative(projectRoot, filePath)
      .replace(/\\/g, '/');
    let importCount = 0;
    let issues = [];

    // Remove any Jekyll front-matter from Sass files (if present)
    if (content.startsWith('---')) {
      const idx = content.indexOf('---', 3);
      if (idx !== -1) {
        content = content.slice(idx + 3); // drop the front matter section
      }
    }

    // Find all @import statements and process them async
    const importPattern = /@import\s+([^;]+);/g;
    const importSplitPattern = /['"][^'"]+['"]/g;
    const matches = [...content.matchAll(importPattern)];

    for (const match of matches) {
      const [fullMatch, importList] = match;
      let resultLines = '';
      const imports = importList.match(importSplitPattern);
      if (!imports) continue;

      for (const imp of imports) {
        let importPath = imp.replace(/^['"]|['"]$/g, '');
        const originalPath = importPath;
        const isCSSImport =
          importPath.endsWith('.css') ||
          importPath.startsWith('http') ||
          importPath.startsWith('url(');
        if (isCSSImport) {
          resultLines += `@import "${importPath}";`;
        } else {
          let resolvedPath = null;
          const tryPaths = [];
          if (path.isAbsolute(importPath)) {
            tryPaths.push(path.join(projectRoot, importPath));
          } else {
            tryPaths.push(path.join(path.dirname(filePath), importPath));
            tryPaths.push(path.join(projectRoot, '_sass', importPath));
          }
          if (!importPath.endsWith('.scss')) {
            tryPaths.push(...tryPaths.map((p) => p + '.scss'));
            tryPaths.push(...tryPaths.map((p) => path.join(p, '_index.scss')));
            tryPaths.push(
              ...tryPaths.map((p) =>
                path.join(path.dirname(p), '_' + path.basename(p)),
              ),
            );
          }
          for (const p of tryPaths) {
            try {
              const stat = await fs.stat(p);
              if (stat.isFile()) {
                resolvedPath = p;
                break;
              }
            } catch (_err) {
              /* not found, continue */
            }
          }
          if (!resolvedPath) {
            issues.push(`Import "${originalPath}" not found`);
            resultLines += `// @import "${originalPath}" (file not found)`;
          } else {
            resultLines += `@use "${importPath}" as *`;
          }
        }
        importCount++;
      }
      content = content.replace(fullMatch, resultLines);
    }

    if (importCount > 0) {
      // Write changes if any import was replaced
      if (!DRY_RUN) {
        await backupFile(filePath);
        await fs.writeFile(filePath, content, 'utf8');
      }
      summary.sassFilesConverted.push({
        file: fileRelPath,
        importsReplaced: importCount,
        issues,
      });
      console.log(
        `✓ Converted ${fileRelPath} (${importCount} import statement${importCount > 1 ? 's' : ''} updated)`,
      );
      if (issues.length) {
        console.log(`   Issues: ${issues.join('; ')}`);
      }
    }
  }
}

// 2. Dependency and Package Updates
async function upgradeDependencies() {
  const pkgPath = path.join(projectRoot, 'package.json');
  let pkgData;
  try {
    pkgData = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
  } catch (err) {
    console.error(
      "Failed to read package.json. Ensure you're running in the project root.",
    );
    summary.errors.push('package.json not found or invalid JSON.');
    return;
  }
  const originalPkg = JSON.parse(JSON.stringify(pkgData)); // clone for diff
  let deps = pkgData.dependencies || {};
  let devDeps = pkgData.devDependencies || {};

  // Function to update a dependency set (deps or devDeps)
  async function updateDepSet(depSet, _depType) {
    for (const [name, currVersion] of Object.entries(depSet)) {
      let latestVersion = null;
      // Skip local file references or git links (version starting with file:, git+, etc.)
      if (currVersion.startsWith('file:') || currVersion.startsWith('git+')) {
        continue;
      }
      // Determine if this package is deprecated or needs removal
      if (name === 'node-sass') {
        // Remove node-sass
        delete depSet[name];
        summary.depsRemoved.push({ name, version: currVersion });
        // Ensure 'sass' (dart-sass) is present
        if (!deps['sass'] && !devDeps['sass']) {
          try {
            // Fetch latest sass version
            const res = await fetch('https://registry.npmjs.org/sass');
            if (res.ok) {
              const data = await res.json();
              latestVersion = data['dist-tags']?.latest;
            }
          } catch (error) {
            // Ignore fetch errors
          }
          if (!latestVersion) latestVersion = '1.68.0'; // fallback to a known recent version if fetch fails
          // Add to devDependencies by default
          devDeps['sass'] = latestVersion;
          summary.depsAdded.push({ name: 'sass', version: latestVersion });
        }
        continue;
      }
      if (name === 'bower') {
        // Remove bower (deprecated)
        delete depSet[name];
        summary.depsRemoved.push({ name, version: currVersion });
        continue;
      }
      // Fetch latest version from npm registry
      try {
        const urlName = encodeURIComponent(name);
        const res = await fetch(`https://registry.npmjs.org/${urlName}`);
        if (res.ok) {
          const data = await res.json();
          latestVersion = data['dist-tags']?.latest;
        } else {
          console.warn(
            `Warning: npm registry query for "${name}" failed (status ${res.status})`,
          );
        }
      } catch (err) {
        console.warn(
          `Warning: Could not fetch latest version for "${name}": ${err.message}`,
        );
      }
      if (!latestVersion) {
        // If fetch failed, skip updating this dependency
        continue;
      }
      // If current version (without ^/~) is the same as latest, skip
      const currClean = currVersion.replace(/^[^0-9]+/, ''); // remove ^, ~ or other prefix
      if (currClean === latestVersion) {
        // Already up-to-date (or maybe using a pre-release), skip
        continue;
      }
      // Update to latest exact version
      depSet[name] = latestVersion;
      summary.depsUpdated.push({
        name,
        oldVersion: currVersion,
        newVersion: latestVersion,
      });
    }
  }

  // Update dependencies and devDependencies
  await updateDepSet(deps, 'dependencies');
  await updateDepSet(devDeps, 'devDependencies');

  // Write back changes to package.json if any
  pkgData.dependencies = deps;
  pkgData.devDependencies = devDeps;

  // Update engines.node
  const desiredEngine = '>=24.0.0';
  if (!pkgData.engines) {
    pkgData.engines = { node: desiredEngine };
    summary.enginesUpdated = desiredEngine;
  } else {
    if (pkgData.engines.node !== undefined) {
      if (pkgData.engines.node !== desiredEngine) {
        pkgData.engines.node = desiredEngine;
        summary.enginesUpdated = desiredEngine;
      }
    } else {
      pkgData.engines.node = desiredEngine;
      summary.enginesUpdated = desiredEngine;
    }
  }

  // Ensure type: module is present
  if (pkgData.type !== 'module') {
    pkgData.type = 'module';
    // Noting this in summary is optional; it's more of a fix to ensure consistency
  }

  // If any changes, write them out
  const pkgChanged =
    JSON.stringify(pkgData, null, 2) !== JSON.stringify(originalPkg, null, 2);
  if (pkgChanged) {
    if (!DRY_RUN) {
      await backupFile(pkgPath);
      await fs.writeFile(
        pkgPath,
        JSON.stringify(pkgData, null, 2) + '\n',
        'utf8',
      );
    }
    console.log(
      `✓ Updated package.json dependencies and engines${DRY_RUN ? ' (dry-run)' : ''}`,
    );
  } else {
    console.log('ℹ️ No dependency changes needed (already up-to-date)');
  }
}

// 3. Static Build System Refactor (scripts and image conversion)
async function upgradeBuildScripts() {
  const scriptsDir = path.join(projectRoot, 'scripts');
  try {
    const files = await fs.readdir(scriptsDir);
    for (const fname of files) {
      if (!fname.endsWith('.js')) continue;
      const filePath = path.join(scriptsDir, fname);
      let content = await fs.readFile(filePath, 'utf8');
      const origContent = content;
      const relPath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
      let requireReplacements = 0;
      let execReplacements = 0;
      // Replace CommonJS require() with ESM import (only top-level simple cases)
      // Pattern 1: const X = require('foo');
      content = content.replace(
        /^(\s*)(?:var|let|const)\s+([\w$]+)\s*=\s*require\(['"]([^'"]+)['"]\);/gm,
        (_, indent, varName, reqPath) => {
          requireReplacements++;
          // Use default import syntax
          return `${indent}import ${varName} from '${reqPath}';`;
        },
      );
      // Pattern 2: const { A, B } = require('foo');
      content = content.replace(
        /^(\s*)(?:var|let|const)\s+\{\s*([^}]+)\s*\}\s*=\s*require\(['"]([^'"]+)['"]\);/gm,
        (_, indent, imports, reqPath) => {
          requireReplacements++;
          return `${indent}import { ${imports.trim()} } from '${reqPath}';`;
        },
      );
      // Pattern 3: standalone require('foo');
      content = content.replace(
        /^(\s*)require\(['"]([^'"]+)['"]\);\s*$/gm,
        (_, indent, reqPath) => {
          requireReplacements++;
          return `${indent}import '${reqPath}';`;
        },
      );
      // Replace image conversion exec calls with Sharp
      // We'll look for exec( or execSync( usage with common image tools
      const execPattern = /(execSync?|spawnSync?)\(['"]([^'"]+)['"]/g;
      let newSharpCode = '';
      let match;
      while ((match = execPattern.exec(content)) !== null) {
        const fullMatch = match[0];
        const commandStr = match[2]; // the command string inside exec(...)
        const lowerCmd = commandStr.toLowerCase();
        if (
          lowerCmd.includes('convert') ||
          lowerCmd.includes('magick') ||
          lowerCmd.includes('mogrify') ||
          lowerCmd.includes('cwebp')
        ) {
          // Attempt to parse the command for input/output files and options
          let inputFile = null,
            outputFile = null;
          let width = null,
            height = null,
            quality = null;
          // Find file names in the command (simple approach: first and last file with image extensions)
          const fileRegex = /([\w\-.]+\.(png|jpg|jpeg|gif|webp|svg))/gi;
          const files = [...commandStr.matchAll(fileRegex)].map((m) => m[1]);
          if (files.length >= 1) inputFile = files[0];
          if (files.length >= 2) outputFile = files[files.length - 1];
          // Check for -resize WxH
          const resizeMatch = commandStr.match(/-resize\s+(\d+)?x(\d+)?/);
          if (resizeMatch) {
            width = resizeMatch[1] ? parseInt(resizeMatch[1]) : null;
            height = resizeMatch[2] ? parseInt(resizeMatch[2]) : null;
          }
          // Check for -quality N
          const qualityMatch = commandStr.match(/-quality\s+(\d+)/);
          if (qualityMatch) {
            quality = parseInt(qualityMatch[1]);
          }
          if (inputFile && outputFile) {
            execReplacements++;
            // Build Sharp conversion code
            newSharpCode += `\n// Image conversion: ${commandStr}\n`;
            newSharpCode += `await import('sharp').then(({ default: sharp }) => sharp('${inputFile}')`;
            if (width !== null || height !== null) {
              if (width !== null && height !== null) {
                newSharpCode += `.resize(${width}, ${height})`;
              } else if (width !== null) {
                newSharpCode += `.resize(${width})`;
              } else if (height !== null) {
                newSharpCode += `.resize(null, ${height})`;
              }
            }
            if (outputFile.toLowerCase().endsWith('.png')) {
              newSharpCode +=
                quality !== null ? `.png({ quality: ${quality} })` : '.png()';
            } else if (
              outputFile.toLowerCase().endsWith('.jpg') ||
              outputFile.toLowerCase().endsWith('.jpeg')
            ) {
              newSharpCode +=
                quality !== null ? `.jpeg({ quality: ${quality} })` : '.jpeg()';
            } else if (outputFile.toLowerCase().endsWith('.webp')) {
              newSharpCode +=
                quality !== null ? `.webp({ quality: ${quality} })` : '.webp()';
            }
            newSharpCode += `.toFile('${outputFile}') });\n`;
            // Comment out the original exec call in content
            content = content.replace(
              fullMatch,
              `/* exec call replaced with Sharp: ${commandStr} */`,
            );
          }
        }
      }
      if (execReplacements > 0) {
        // Prepend an import of sharp at top if not present in the newSharpCode (we use dynamic import in code above to avoid top-of-file import issues)
        // Actually, we did dynamic import within the code snippet to allow top-level await usage easily.
        // So we just need to inject newSharpCode in content.
        content += `\n${newSharpCode}\n`;
      }
      if (
        (requireReplacements > 0 || execReplacements > 0) &&
        content !== origContent
      ) {
        if (!DRY_RUN) {
          await backupFile(filePath);
          await fs.writeFile(filePath, content, 'utf8');
        }
        summary.scriptsModified.push({
          file: relPath,
          requiresFixed: requireReplacements,
          execReplaced: execReplacements,
        });
        console.log(
          `✓ Refactored ${relPath} (require→import: ${requireReplacements}, exec→sharp: ${execReplacements})`,
        );
      }
    }
  } catch {
    // No scripts directory or read error; not critical if none exist
  }
}

// 4. VSCode launch.json and Netlify config updates
async function updateConfigs() {
  // VSCode launch.json
  const launchPath = path.join(projectRoot, '.vscode', 'launch.json');
  try {
    const launchContent = await fs.readFile(launchPath, 'utf8');
    let json = JSON.parse(launchContent);
    let changed = false;
    if (json.configurations && Array.isArray(json.configurations)) {
      for (const config of json.configurations) {
        if (config.type === 'node') {
          // Update runtimeVersion
          if (config.runtimeVersion && config.runtimeVersion !== '24') {
            config.runtimeVersion = '24';
            changed = true;
          } else if (!config.runtimeVersion) {
            config.runtimeVersion = '24';
            changed = true;
          }
          // If program path has old file names (just in case main file name changed)
          if (config.program && summary.mainFileRenamed) {
            if (config.program.includes(summary.mainFileRenamed.oldName)) {
              config.program = config.program.replace(
                summary.mainFileRenamed.oldName,
                summary.mainFileRenamed.newName,
              );
              changed = true;
            }
          }
        }
      }
    }
    if (changed) {
      if (!DRY_RUN) {
        await backupFile(launchPath);
        await fs.writeFile(launchPath, JSON.stringify(json, null, 2), 'utf8');
      }
      summary.launchConfigUpdated = true;
      console.log('✓ Updated .vscode/launch.json for Node 24');
    }
  } catch {
    // launch.json not present or not JSON – ignore if not found
  }

  // Netlify config (netlify.toml)
  const netlifyPath = path.join(projectRoot, 'netlify.toml');
  try {
    let netlifyContent = await fs.readFile(netlifyPath, 'utf8');
    const originalContent = netlifyContent;
    const lines = netlifyContent.split(/\r?\n/);
    let inBuildEnv = false;
    let nodeSet = false;
    let rubySet = false;
    const outputLines = [];
    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^\[build\.environment\]$/)) {
        inBuildEnv = true;
        outputLines.push(line);
        continue;
      }
      if (inBuildEnv) {
        if (trimmed.startsWith('[') && trimmed.includes(']')) {
          // leaving build.environment section
          inBuildEnv = false;
        }
      }
      if (inBuildEnv) {
        // Inside [build.environment]
        if (trimmed.startsWith('NODE_VERSION')) {
          // Update Node version
          line = line.replace(
            /NODE_VERSION\s*=\s*".*?"/,
            'NODE_VERSION = "24"',
          );
          nodeSet = true;
        }
        if (trimmed.startsWith('RUBY_VERSION')) {
          // Optionally update Ruby (set to 3.2 latest stable)
          line = line.replace(
            /RUBY_VERSION\s*=\s*".*?"/,
            'RUBY_VERSION = "3.2.0"',
          );
          rubySet = true;
          summary.rubyVersionUpdated = true;
        }
      }
      outputLines.push(line);
    }
    if (!nodeSet) {
      // If [build.environment] existed but had no NODE_VERSION, add it
      if (inBuildEnv) {
        outputLines.push('NODE_VERSION = "24"');
        nodeSet = true;
      } else {
        // If no [build.environment] section at all, add one at end
        outputLines.push('', '[build.environment]', 'NODE_VERSION = "24"');
        nodeSet = true;
      }
    }
    // If no RUBY_VERSION present and we want to enforce it, we can add (optional).
    // For now, only add if user had one before or specifically requested. We'll not add if it wasn't present.
    if (!rubySet && summary.rubyVersionUpdated) {
      // Add Ruby version in build.env section
      const insertIndex = outputLines.findIndex((line) =>
        line.trim().startsWith('NODE_VERSION'),
      );
      outputLines.splice(insertIndex + 1, 0, 'RUBY_VERSION = "3.2.0"');
      rubySet = true;
    }
    const newNetlifyContent = outputLines.join('\n');
    if (newNetlifyContent !== originalContent) {
      if (!DRY_RUN) {
        await backupFile(netlifyPath);
        await fs.writeFile(netlifyPath, newNetlifyContent, 'utf8');
      }
      summary.netlifyUpdated = true;
      if (nodeSet) console.log('✓ Updated Node version in netlify.toml to 24');
      if (rubySet)
        console.log('✓ Updated Ruby version in netlify.toml to 3.2.0');
    }
  } catch {
    // netlify.toml not found or unreadable
  }
}

// 5. Optional: Git auto-commit
function gitCommitAll() {
  try {
    execSync('git add -A', { stdio: 'ignore' });
    const msgLines = [];
    msgLines.push('Upgrade project tooling for Node 24 compatibility');
    if (summary.sassFilesConverted.length)
      msgLines.push(' - Migrate Sass @import to @use');
    if (
      summary.depsUpdated.length ||
      summary.depsRemoved.length ||
      summary.depsAdded.length
    )
      msgLines.push(' - Update NPM dependencies');
    if (summary.scriptsModified.length)
      msgLines.push(' - Refactor build scripts (ESM & Sharp)');
    if (summary.launchConfigUpdated || summary.netlifyUpdated)
      msgLines.push(' - Update config files (VSCode/Netlify)');
    const commitMsg = msgLines.join('\n');
    execSync(`git commit -m "${commitMsg}"`);
    console.log('✅ Auto-committed changes to Git.');
  } catch (err) {
    console.error(`⚠️ Git commit failed: ${err.message}`);
    summary.errors.push('Git commit failed: ' + err.message);
  }
}

// Run all upgrade phases
async function main() {
  console.log(`Starting upgrade${DRY_RUN ? ' (dry-run mode)' : ''}...`);
  await upgradeSass();
  await upgradeDependencies();
  await upgradeBuildScripts();
  await updateConfigs();
  if (!DRY_RUN && AUTO_COMMIT) {
    gitCommitAll();
  }

  // Create markdown summary
  let report = '# Upgrade Summary\n\n';
  if (summary.mainFileRenamed) {
    report += `- **Renamed Sass entry**: \`${summary.mainFileRenamed.oldName}\` → \`${summary.mainFileRenamed.newName}\`\n`;
  }
  if (summary.sassFilesConverted.length) {
    report += `- **Sass Imports Converted**: ${summary.sassFilesConverted.length} files updated to \`@use\` syntax (deprecated \`@import\` removed):contentReference[oaicite:7]{index=7}.`;
    // List each file and any issues
    report += '\n  - Files: \n';
    for (const entry of summary.sassFilesConverted) {
      report += `    - \`${entry.file}\`${entry.importsReplaced ? ` (${entry.importsReplaced} imports)` : ''}`;
      if (entry.issues && entry.issues.length) {
        report += ` – **Note:** ${entry.issues.join(', ')}`;
      }
      report += '\n';
    }
  } else {
    report +=
      '- **Sass Imports Converted**: No changes (no @import statements found or already migrated).\n';
  }
  // Dependency updates
  if (
    summary.depsUpdated.length ||
    summary.depsAdded.length ||
    summary.depsRemoved.length
  ) {
    report +=
      '- **Dependencies Updated**: package versions refreshed to latest stable.';
    report += '\n  - Changes in `package.json`:\n';
    for (const dep of summary.depsUpdated) {
      report += `    - \`${dep.name}\`: ${dep.oldVersion} → ${dep.newVersion}\n`;
    }
    for (const dep of summary.depsAdded) {
      report += `    - Added \`${dep.name}@${dep.version}\`\n`;
    }
    for (const dep of summary.depsRemoved) {
      report += `    - Removed \`${dep.name}\` (was ${dep.version})\n`;
    }
    if (summary.enginesUpdated) {
      report += `    - Set \`engines.node\` to "${summary.enginesUpdated}" (require Node 24+)\n`;
    }
  } else {
    report +=
      '- **Dependencies Updated**: All dependencies were already up-to-date.\n';
  }
  // Scripts modified
  if (summary.scriptsModified.length) {
    report +=
      '- **Build Scripts Refactored**: Modernized Node scripts (ESM imports, replaced image conversion with Sharp).';
    report += '\n  - Files:\n';
    for (const s of summary.scriptsModified) {
      report += `    - \`${s.file}\`: require→import (${s.requiresFixed} instances), exec→sharp (${s.execReplaced} instances)\n`;
    }
  } else {
    report += '- **Build Scripts Refactored**: No script changes needed.\n';
  }
  // Config updates
  if (
    summary.launchConfigUpdated ||
    summary.netlifyUpdated ||
    summary.rubyVersionUpdated
  ) {
    report += '- **Config Updates**:\n';
    if (summary.launchConfigUpdated) {
      report += '    - VSCode `launch.json` adjusted for Node 24 runtime.\n';
    }
    if (summary.netlifyUpdated) {
      report += '    - Netlify configuration updated to Node 24';
      report += summary.rubyVersionUpdated ? ' and Ruby 3.2' : '';
      report += '.\n';
    }
  } else {
    report += '- **Config Updates**: No VSCode/Netlify config changes.\n';
  }
  if (summary.errors.length) {
    report += '- **Errors/Warnings**: \n';
    summary.errors.forEach((err) => {
      report += `    - ⚠️ ${err}\n`;
    });
  }
  report += `\n*Generated by upgrade-project.js on ${new Date().toLocaleString()}*`;

  // Output summary to console and file
  console.log('\n--- Upgrade Summary ---\n');
  console.log(report);
  if (!DRY_RUN) {
    try {
      await fs.writeFile(
        path.join(projectRoot, 'UPGRADE_SUMMARY.md'),
        report,
        'utf8',
      );
    } catch (err) {
      console.error(`Could not write UPGRADE_SUMMARY.md: ${err.message}`);
    }
  }

  console.log(
    `\nUpgrade script completed.${DRY_RUN ? ' (Dry-run mode: no files were modified.)' : ''}`,
  );
  if (!DRY_RUN) {
    console.log(
      'Please review the changes above and test your project (run build, etc.).',
    );
    if (!AUTO_COMMIT) {
      console.log(
        'Remember to commit the changes to version control when you are satisfied.',
      );
    }
  }
}

main().catch((err) => {
  console.error(`\n❌ Upgrade script failed: ${err.stack || err}`);
  process.exit(1);
});
