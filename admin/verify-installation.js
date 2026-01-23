#!/usr/bin/env node
/**
 * Admin Panel Installation Verification
 * Checks that all components are properly installed and configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 Tillerstead Admin Panel - Installation Verification\n');

const checks = [];

// Check 1: Node.js version
function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.split('.')[0].substring(1));
  const pass = major >= 18;
  checks.push({
    name: 'Node.js version',
    pass,
    message: pass ? `✓ ${version} (>= 18.0.0 required)` : `✗ ${version} (>= 18.0.0 required)`
  });
}

// Check 2: Required files exist
function checkFiles() {
  const requiredFiles = [
    'admin/server.js',
    'admin/public/login.html',
    'admin/public/dashboard.html',
    'admin/public/admin-styles.css',
    'admin/public/admin-app.js',
    'admin/README.md',
    'admin/generate-password.js'
  ];

  requiredFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(fullPath);
    checks.push({
      name: `File: ${file}`,
      pass: exists,
      message: exists ? `✓ Found` : `✗ Missing`
    });
  });
}

// Check 3: Dependencies installed
function checkDependencies() {
  const requiredDeps = [
    'express',
    'express-session',
    'bcrypt',
    'js-yaml'
  ];

  requiredDeps.forEach(dep => {
    try {
      const pkgPath = path.join(__dirname, '..', 'node_modules', dep, 'package.json');
      const exists = fs.existsSync(pkgPath);
      checks.push({
        name: `Dependency: ${dep}`,
        pass: exists,
        message: exists ? `✓ Installed` : `✗ Not installed (run npm install)`
      });
    } catch (error) {
      checks.push({
        name: `Dependency: ${dep}`,
        pass: false,
        message: `✗ Not installed`
      });
    }
  });
}

// Check 4: package.json scripts
function checkScripts() {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const hasAdminScript = pkg.scripts && pkg.scripts.admin;
    const hasAdminDevScript = pkg.scripts && pkg.scripts['admin:dev'];
    
    checks.push({
      name: 'npm run admin script',
      pass: hasAdminScript,
      message: hasAdminScript ? '✓ Configured' : '✗ Missing'
    });
    
    checks.push({
      name: 'npm run admin:dev script',
      pass: hasAdminDevScript,
      message: hasAdminDevScript ? '✓ Configured' : '✗ Missing'
    });
  }
}

// Check 5: Port availability (basic check)
function checkPort() {
  const port = 3001;
  checks.push({
    name: `Port ${port} check`,
    pass: true,
    message: `ℹ Run 'npm run admin' to verify port availability`
  });
}

// Run all checks
checkNodeVersion();
checkFiles();
checkDependencies();
checkScripts();
checkPort();

// Display results
console.log('═'.repeat(70));
checks.forEach(check => {
  const icon = check.pass ? '✅' : '❌';
  console.log(`${icon} ${check.name.padEnd(40)} ${check.message}`);
});
console.log('═'.repeat(70));

const passed = checks.filter(c => c.pass).length;
const total = checks.length;
const allPassed = passed === total;

console.log(`\n${passed}/${total} checks passed\n`);

if (allPassed) {
  console.log('✅ All checks passed! Your admin panel is ready to use.\n');
  console.log('Next steps:');
  console.log('  1. npm run admin          # Start the admin server');
  console.log('  2. Open http://localhost:3001/login');
  console.log('  3. Login with admin / tillerstead2026');
  console.log('  4. CHANGE THE DEFAULT PASSWORD!\n');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.\n');
  console.log('Common fixes:');
  console.log('  • Run: npm install');
  console.log('  • Check Node.js version: node --version');
  console.log('  • Verify all files were created correctly\n');
}

process.exit(allPassed ? 0 : 1);
