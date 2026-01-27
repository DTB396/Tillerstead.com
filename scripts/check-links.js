#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const siteDir = path.join(__dirname, '..', '_site');
if (!fs.existsSync(siteDir)) {
  console.error(
    'Error: _site directory missing. Run `npm run build` before link checking. (TCNA/New Jersey HIC compliance)',
  );
  process.exit(1);
}

// Allowlist for intentionally missing assets (e.g., favicon)
const allowMissing = new Set(['/favicon.ico']);

// Files to skip (contain embedded data URIs, generated reports, etc.)
const skipFiles = new Set([
  'lighthouse-report.html',
  'lighthouse-mobile-report.json'
]);

/**
 * Determines if a link is external or non-checkable.
 * @param {string} link
 * @returns {boolean}
 */
function isExternal(link) {
  return (
    /^(https?:)?\/\//i.test(link) ||
    /^mailto:/i.test(link) ||
    /^tel:/i.test(link) ||
    /^sms:/i.test(link) ||
    link.startsWith('#')
  );
}

/**
 * Removes fragments and query strings from a reference.
 * @param {string} ref
 * @returns {string}
 */
function stripFragmentsAndQuery(ref) {
  const [pathPart] = ref.split('#');
  return pathPart.split('?')[0];
}

/**
 * Normalizes a link or asset reference to an absolute file path in _site.
 * @param {string} href
 * @returns {string}
 */
function normalizeTarget(href) {
  const cleaned = stripFragmentsAndQuery(href);
  let target = cleaned;

  if (target.startsWith('/')) {
    target = target.slice(1);
  }

  const ext = path.extname(target);
  if (!ext) {
    target = path.join(target, 'index.html');
  }

  const primary = path.join(siteDir, target);
  if (fs.existsSync(primary)) return primary;

  if (ext === '.html') {
    const fallback = path.join(
      siteDir,
      target.replace(/\.html$/, '/index.html'),
    );
    if (fs.existsSync(fallback)) return fallback;
  }

  return primary;
}

/**
 * Recursively collects all HTML files in a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function collectHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectHtmlFiles(fullPath);
    }
    return entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

const missing = [];
for (const file of collectHtmlFiles(siteDir)) {
  // Skip files with embedded data URIs or generated reports
  const filename = path.basename(file);
  if (skipFiles.has(filename)) {
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html);
  const links = $('a[href], link[href]');
  const images = $(
    'img[src], source[src], video[src], audio[src], script[src]',
  );

  links.each((_, el) => {
    const href = $(el).attr('href');
    if (!href || isExternal(href)) return;
    const target = normalizeTarget(href);
    if (
      !fs.existsSync(target) &&
      !allowMissing.has(stripFragmentsAndQuery(href))
    ) {
      missing.push({ source: path.relative(siteDir, file), ref: href });
    }
  });

  images.each((_, el) => {
    const src = $(el).attr('src');
    if (!src || isExternal(src)) return;
    const target = normalizeTarget(src);
    if (
      !fs.existsSync(target) &&
      !allowMissing.has(stripFragmentsAndQuery(src))
    ) {
      missing.push({ source: path.relative(siteDir, file), ref: src });
    }
  });
}

if (missing.length) {
  console.error(
    'Broken internal links/assets detected (TCNA/New Jersey HIC compliance required):',
  );
  for (const issue of missing) {
    console.error(`- ${issue.source} → ${issue.ref}`);
  }
  process.exit(1);
}

console.log(
  'Link check passed: all internal references resolved to TCNA/New Jersey HIC standards.',
);
