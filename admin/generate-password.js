#!/usr/bin/env node
/**
 * Password Hash Generator
 * Usage: node admin/generate-password.js
 */

import bcrypt from 'bcrypt';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔐 Tillerstead Admin - Password Hash Generator\n');

rl.question('Enter new password: ', async (password) => {
  if (!password || password.length < 8) {
    console.log('❌ Password must be at least 8 characters long');
    rl.close();
    return;
  }

  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);

  console.log('\n✅ Password hash generated successfully!\n');
  console.log('Copy this hash to admin/server.js:\n');
  console.log('─'.repeat(80));
  console.log(hash);
  console.log('─'.repeat(80));
  console.log('\nUpdate the ADMIN_USERS object in server.js:');
  console.log(`
const ADMIN_USERS = {
  admin: {
    username: 'admin',
    passwordHash: '${hash}'
  }
};
  `);

  rl.close();
});
