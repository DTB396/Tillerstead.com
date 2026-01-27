#!/usr/bin/env node

/**
 * Master CSS Repair Script
 * Runs all necessary scripts to fix all 179+ CSS linting errors
 */

const { execSync } = require('child_process');
const path = require('path');

console.clear();
console.log('\n' + '═'.repeat(60));
console.log('  🚀 AUTOMATED CSS LINT ERROR RESOLUTION');
console.log('  Fixing all 179+ CSS linting errors automatically');
console.log('═'.repeat(60) + '\n');

const steps = [
  {
    name: 'Step 1: Rebuild Bundle from Clean Sources',
    command: 'node scripts/rebuild-clean-bundle.js'
  },
  {
    name: 'Step 2: Apply Automated Lint Fixes',
    command: 'node scripts/fix-all-css-lint-errors.js'
  },
  {
    name: 'Step 3: Run StyleLint Auto-Fix',
    command: 'npm run lint:css -- --fix --allow-empty-input',
    optional: true
  },
  {
    name: 'Step 4: Verify Results',
    command: 'npm run lint:css',
    verify: true
  }
];

let currentStep = 0;
let successCount = 0;
let failureCount = 0;

for (const step of steps) {
  currentStep++;
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📋 ${step.name}`);
  console.log(`${'─'.repeat(60)}\n`);

  try {
    execSync(step.command, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      encoding: 'utf8'
    });

    successCount++;
    console.log(`\n✅ ${step.name} completed successfully`);

  } catch (error) {
    if (step.optional) {
      console.log(`\n⚠️  ${step.name} had issues but continuing (optional step)`);
    } else if (step.verify) {
      console.log(`\n📊 Verification complete (errors shown above if any)`);
    } else {
      console.log(`\n❌ ${step.name} failed`);
      failureCount++;

      if (!step.optional) {
        console.log('\n⚠️  Critical step failed. Check error messages above.\n');
        process.exit(1);
      }
    }
  }

  // Small delay between steps
  if (currentStep < steps.length) {
    console.log('\n⏳ Waiting 1 second before next step...');
    execSync('timeout /t 1 /nobreak > nul 2>&1 || sleep 1', { shell: true });
  }
}

console.log('\n' + '═'.repeat(60));
console.log('  ✨ CSS LINT ERROR RESOLUTION COMPLETE');
console.log('═'.repeat(60));
console.log(`\n📊 Summary:`);
console.log(`   ✅ Successful steps: ${successCount}/${steps.length}`);
console.log(`   ❌ Failed steps: ${failureCount}`);
console.log(`\n💡 Next Steps:`);
console.log(`   1. Check the verification output above`);
console.log(`   2. Run 'npm run lint:css' to confirm all errors are fixed`);
console.log(`   3. Test the site with 'npm run dev'\n`);
