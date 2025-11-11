#!/usr/bin/env tsx
/**
 * Apply Database Migrations
 * 
 * Reads migration files from drizzle/migrations and applies them to the database.
 * Uses drizzle-orm's migrate function to handle migration execution.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

const { Pool } = pg;

// Load environment variables
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}
dotenv.config();

const url = process.env.DATABASE_URL || '';

if (!url) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Prevent running migrations against mock/placeholder URLs
if (url.includes('mock') || url.includes('placeholder')) {
  console.error('❌ Cannot run migrations against mock database URL');
  process.exit(1);
}

async function applyMigrations() {
  const pool = new Pool({
    connectionString: url,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Connecting to database...');
    const db = drizzle(pool);

    console.log('📦 Applying migrations...');
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    
    console.log('✅ Migrations applied successfully!');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

applyMigrations();

