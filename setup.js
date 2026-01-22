#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up KAMPALO B2B SaaS Dashboard...\n');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Install dependencies
const dependencies = [
  'recharts',
  'framer-motion',
  '@heroicons/react'
];

console.log('📦 Installing dependencies...');

try {
  // Check if pnpm is available
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    console.log('Using pnpm...');
    execSync(`pnpm add ${dependencies.join(' ')}`, { stdio: 'inherit' });
  } catch {
    // Fallback to npm
    try {
      execSync('npm --version', { stdio: 'ignore' });
      console.log('Using npm...');
      execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
    } catch {
      // Fallback to yarn
      try {
        execSync('yarn --version', { stdio: 'ignore' });
        console.log('Using yarn...');
        execSync(`yarn add ${dependencies.join(' ')}`, { stdio: 'inherit' });
      } catch {
        console.error('❌ No package manager found. Please install pnpm, npm, or yarn.');
        process.exit(1);
      }
    }
  }

  console.log('\n✅ Dependencies installed successfully!');
  console.log('\n🎉 Setup complete! You can now run:');
  console.log('   pnpm dev    # Start development server');
  console.log('   pnpm build  # Build for production');
  console.log('\n📖 Check README.md for more information.');

} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
} 