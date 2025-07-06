#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🌱 Running database seeds...');

try {
  // Run the seeds using ts-node
  execSync('npx ts-node src/database/seeds/run-seeds.ts', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
  });
  
  console.log('✅ Seeds completed successfully!');
} catch (error) {
  console.error('❌ Error running seeds:', error.message);
  process.exit(1);
} 