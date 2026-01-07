#!/usr/bin/env node

/**
 * Ensures the built site is reachable at /tillerstead-sandbox/*
 * when served from the _site directory during local Playwright runs.
 * Creates a directory junction (or symlink) so requests to
 * /tillerstead-sandbox resolve to the same files as /.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteDir = path.resolve(__dirname, '..', '_site');
const linkDir = path.join(siteDir, 'tillerstead-sandbox');

function ensureSiteDir() {
  if (!fs.existsSync(siteDir)) {
    throw new Error(
      `_site directory not found at ${siteDir}. Run "npm run build" first.`,
    );
  }
}

function removeExistingLink() {
  try {
    const stat = fs.lstatSync(linkDir);
    if (stat.isSymbolicLink() || stat.isDirectory()) {
      fs.rmSync(linkDir, { recursive: true, force: true });
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

function createJunction() {
  fs.symlinkSync(siteDir, linkDir, 'junction');
  console.log(`Linked ${linkDir} -> ${siteDir}`);
}

function main() {
  ensureSiteDir();
  removeExistingLink();
  createJunction();
}

main();
