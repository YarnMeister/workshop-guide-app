#!/usr/bin/env node
/**
 * Prebuild Migration Script for Workshop Guide App
 * 
 * Automatically runs database migrations during Vercel production builds.
 * Skips migrations in preview/development environments.
 * 
 * This script is called via the "prebuild" npm script hook.
 */

const { execSync } = require('node:child_process');

const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';

console.log(`\n🔧 Prebuild: Environment detected as "${env}"\n`);

if (env === 'production') {
  console.log('🛠️  Production build detected. Running migration checks...\n');
  
  try {
    // Lint migrations first
    console.log('📋 Step 1: Linting migrations...');
    execSync('npm run db:lint:migrations', { stdio: 'inherit' });
    console.log('');
    
    // Apply migrations
    console.log('🗄️  Step 2: Applying migrations...');
    execSync('npm run db:migrate', { stdio: 'inherit' });
    console.log('');
    
    console.log('✅ Migrations completed successfully. Proceeding to app build...\n');
  } catch (error) {
    console.error('\n❌ Migration failed! Build aborted.\n');
    process.exit(1);
  }
} else {
  console.log(`ℹ️  ${env} build detected. Skipping database migrations.\n`);
  console.log('💡 Tip: Run migrations manually with "npm run db:migrate"\n');
}

