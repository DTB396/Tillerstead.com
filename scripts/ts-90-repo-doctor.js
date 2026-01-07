#!/usr/bin/env node
/**
 * Tillerstead Repo Doctor (Phase-based)
 * - Runs local build commands (if present)
 * - Scans generated _site HTML for missing assets, missing logos, nav/drawer wiring
 * - Scans repo for missing referenced files (images/css/js)
 *
 * Usage:
 *   node scripts/ts-90-repo-doctor.js --phase=all
 *   node scripts/ts-90-repo-doctor.js --phase=build
 *   node scripts/ts-90-repo-doctor.js --phase=scan
 *
 * Notes:
 * - This does NOT “guess” CSS layout fixes (that needs your actual header/nav markup),
 *   but it will reliably detect the common breakpoints: missing CSS/JS, missing logo,
 *   missing drawer button, missing drawer container, empty src/href, broken asset refs.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CFG_PATH = 'scripts/ts-doctor.config.json';
const PHASE = (argValue('--phase') || 'all').toLowerCase();

function argValue(name) {
  const hit = process.argv.find((a) => a.startsWith(name + '='));
  return hit ? hit.split('=').slice(1).join('=') : null;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function logOk(msg) {
  console.log(`✓ ${msg}`);
}
function logWarn(msg) {
  console.warn(`⚠️ ${msg}`);
}
function logFail(msg) {
  console.error(`✗ ${msg}`);
}

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

function findAssetRefs(html) {
  // grab common asset refs: href/src, including CSS/JS/img/svg
  const refs = new Set();

  const attrRegex = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = attrRegex.exec(html)) !== null) {
    const v = m[1].trim();
    if (!v) continue;
    if (
      v.startsWith('http://') ||
      v.startsWith('https://') ||
      v.startsWith('data:')
    )
      continue;
    if (v.startsWith('#')) continue;
    refs.add(v);
  }

  return [...refs];
}

function normalizeRefToRepoPath(ref) {
  // convert /assets/... to assets/...
  if (ref.startsWith('/')) return ref.slice(1);
  return ref;
}

function selectorAnyPresent(html, selectors) {
  // lightweight: we can't fully parse CSS selectors without a DOM parser;
  // do substring heuristics that catch 95% of issues quickly
  // - ".class" => check 'class="...class..."'
  // - "#id" => check 'id="id"'
  // - raw tag name => check '<tag'
  // - attribute selectors => check 'aria-controls' etc
  for (const sel of selectors) {
    const s = sel.trim();
    if (!s) continue;

    if (s.startsWith('.')) {
      const cls = s.slice(1);
      const re = new RegExp(`class=["'][^"']*\\b${escapeRe(cls)}\\b`, 'i');
      if (re.test(html)) return true;
    } else if (s.startsWith('#')) {
      const id = s.slice(1);
      const re = new RegExp(`id=["']${escapeRe(id)}["']`, 'i');
      if (re.test(html)) return true;
    } else if (s.includes('[') && s.includes(']')) {
      // attribute-ish presence check
      const attr = s
        .replace(/.*\[(.+?)\].*/, '$1')
        .split('=')[0]
        .trim();
      if (attr && new RegExp(`\\b${escapeRe(attr)}\\b`, 'i').test(html))
        return true;
    } else if (/^[a-z]+$/i.test(s)) {
      const re = new RegExp(`<\\s*${escapeRe(s)}\\b`, 'i');
      if (re.test(html)) return true;
    } else {
      // fallback substring
      if (html.toLowerCase().includes(s.toLowerCase())) return true;
    }
  }
  return false;
}

function mustNotContain(html, needles) {
  for (const n of needles) {
    if (html.includes(n)) return false;
  }
  return true;
}

function escapeRe(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function phaseBuild(_cfg) {
  // Build CSS if scripts exist; then Jekyll build if available.
  // We keep it tolerant: won't hard-fail if you don't have Ruby set up, but will report it.
  const pkg = exists('package.json') ? readJson('package.json') : null;
  const scripts = pkg?.scripts || {};

  const hasNpm = exists('package-lock.json') || exists('package.json');
  if (!hasNpm)
    logWarn('No package.json found; skipping npm-based build steps.');

  // prefer explicit scripts if present
  if (scripts['build:css']) {
    run('npm run build:css');
    logOk('CSS build completed (npm run build:css).');
  } else if (scripts['build']) {
    run('npm run build');
    logOk('npm run build completed.');
  } else {
    logWarn(
      'No npm build scripts found (build:css/build). Skipping npm build.',
    );
  }

  // Jekyll build
  // Try bundle exec if Gemfile exists
  if (exists('Gemfile')) {
    try {
      run('bundle exec jekyll build');
      logOk('Jekyll build completed (bundle exec jekyll build).');
    } catch (e) {
      logFail('Jekyll build failed. Fix Ruby/Bundler/Jekyll errors above.');
      throw e;
    }
  } else {
    logWarn('No Gemfile found; skipping Jekyll build.');
  }
}

function phaseScan(cfg) {
  // Ensure _site exists
  if (!exists(cfg.siteBuildDir)) {
    logFail(
      `Missing build output: ${cfg.siteBuildDir}. Run --phase=build first.`,
    );
    process.exit(2);
  }

  // Check required assets exist
  for (const rel of cfg.requiredAssets || []) {
    const p = path.join('.', rel);
    if (exists(p)) logOk(`Required asset present: ${rel}`);
    else logFail(`Required asset missing: ${rel}`);
  }

  // Check pages exist and scan them
  let totalMissingRefs = 0;
  for (const page of cfg.pagesToCheck || []) {
    if (!exists(page)) {
      logFail(`Page not found: ${page}`);
      continue;
    }

    const html = readText(page);
    console.log(`\n--- Scanning ${page} ---`);

    // Basic structure checks
    const mustSel = cfg.homeChecks?.mustContainAnySelectors || [];
    if (!selectorAnyPresent(html, mustSel)) {
      logFail(
        `Homepage structure check failed: none of ${mustSel.join(', ')} detected.`,
      );
    } else {
      logOk('Homepage structure selectors detected.');
    }

    // Nav toggle button check
    const navMust = cfg.homeChecks?.navChecks?.mustHaveAny || [];
    if (!selectorAnyPresent(html, navMust)) {
      logFail(
        `Nav toggle check failed: none of ${navMust.join(', ')} detected.`,
      );
    } else {
      logOk('Nav toggle / drawer trigger detected.');
    }

    // Drawer container check
    const drawerMust = cfg.homeChecks?.navChecks?.drawerMustHaveAny || [];
    if (!selectorAnyPresent(html, drawerMust)) {
      logFail(
        `Drawer container check failed: none of ${drawerMust.join(', ')} detected.`,
      );
    } else {
      logOk('Drawer container detected.');
    }

    // Logo presence check
    const logoMust = cfg.homeChecks?.logoChecks?.mustHaveAny || [];
    if (!selectorAnyPresent(html, logoMust)) {
      logFail(`Logo check failed: none of ${logoMust.join(', ')} detected.`);
    } else {
      logOk('Logo markup detected.');
    }

    // “empty src/href” check
    const mustNot = cfg.homeChecks?.logoChecks?.mustNotContain || [];
    if (!mustNotContain(html, mustNot)) {
      logFail('Empty attribute check failed (found empty src/href).');
    } else {
      logOk('No obvious empty src/href found.');
    }

    // Missing asset references
    const refs = findAssetRefs(html)
      .map(normalizeRefToRepoPath)
      .filter((r) => !r.startsWith('?') && !r.startsWith('#'));

    const missing = [];
    for (const r of refs) {
      // allow querystrings
      const clean = r.split('?')[0].split('#')[0];
      if (!clean) continue;

      // If it points into _site, check there first
      const sitePath = path.join(cfg.siteBuildDir, clean);
      const repoPath = path.join('.', clean);

      if (exists(sitePath) || exists(repoPath)) continue;
      missing.push(clean);
    }

    if (missing.length) {
      totalMissingRefs += missing.length;
      logFail(`Missing referenced assets (${missing.length}):`);
      for (const m of missing.slice(0, 40)) console.error(`  - ${m}`);
      if (missing.length > 40)
        console.error(`  ... plus ${missing.length - 40} more`);
    } else {
      logOk('No missing referenced assets detected on this page.');
    }
  }

  // Logo candidates existence check
  let anyLogoExists = false;
  for (const rel of cfg.logoCandidates || []) {
    if (exists(rel)) {
      anyLogoExists = true;
      logOk(`Logo candidate exists: ${rel}`);
    }
  }
  if (!anyLogoExists) {
    logFail(
      `No logo candidates found. Add at least one of: ${(cfg.logoCandidates || []).join(', ')}`,
    );
  }

  if (totalMissingRefs > 0) {
    logFail(
      `Scan completed with missing asset references: ${totalMissingRefs}`,
    );
    process.exit(3);
  } else {
    logOk('Scan completed clean (no missing asset references).');
  }
}

function phaseFixes(_cfg) {
  // Safe, minimal auto-fixes for common problems.
  // This phase intentionally avoids “guessing” layout CSS.
  // It DOES create a default .vscode launch config and adds a helpful docs note.

  // Ensure .vscode/launch.json exists with Jekyll + Node targets
  const vscodeDir = '.vscode';
  if (!exists(vscodeDir)) fs.mkdirSync(vscodeDir, { recursive: true });

  const launchPath = path.join(vscodeDir, 'launch.json');
  if (!exists(launchPath)) {
    const launch = {
      version: '0.2.0',
      configurations: [
        {
          type: 'node',
          request: 'launch',
          name: 'Debug: build-css.js',
          program: '${workspaceFolder}/scripts/build-css.js',
          cwd: '${workspaceFolder}',
          console: 'integratedTerminal',
          skipFiles: ['<node_internals>/**'],
        },
        {
          type: 'node',
          request: 'launch',
          name: 'Debug: link checker',
          program: '${workspaceFolder}/scripts/check-links.js',
          cwd: '${workspaceFolder}',
          console: 'integratedTerminal',
          skipFiles: ['<node_internals>/**'],
        },
        {
          type: 'node',
          request: 'launch',
          name: 'Debug: repo doctor (scan)',
          program: '${workspaceFolder}/scripts/ts-90-repo-doctor.js',
          args: ['--phase=scan'],
          cwd: '${workspaceFolder}',
          console: 'integratedTerminal',
          skipFiles: ['<node_internals>/**'],
        },
      ],
    };
    fs.writeFileSync(
      launchPath,
      JSON.stringify(launch, null, 2) + '\n',
      'utf8',
    );
    logOk('Created .vscode/launch.json with debugging targets.');
  } else {
    logOk('.vscode/launch.json already exists (not overwritten).');
  }

  // Add a short doc note about Node versions if missing
  const readme = exists('README.md') ? readText('README.md') : '';
  if (exists('README.md') && !/Node\s+(18|20)/i.test(readme)) {
    const note =
      '\n\n## Dev Requirements\n- Node.js 20 (preferred) or Node.js 18+\n- Ruby/Bundler (for Jekyll)\n';
    fs.writeFileSync('README.md', readme + note, 'utf8');
    logOk('Updated README.md with dev requirements note.');
  }
}

function main() {
  if (!exists(CFG_PATH)) {
    logFail(`Missing config: ${CFG_PATH}`);
    process.exit(1);
  }
  const cfg = readJson(CFG_PATH);

  if (PHASE === 'all' || PHASE === 'build') phaseBuild(cfg);
  if (PHASE === 'all' || PHASE === 'fixes') phaseFixes(cfg);
  if (PHASE === 'all' || PHASE === 'scan') phaseScan(cfg);

  logOk(`Done. Phase=${PHASE}`);
}

main();
