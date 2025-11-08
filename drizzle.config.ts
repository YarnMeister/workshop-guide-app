import fs from 'fs';
import dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

// Load environment variables from .env.local if it exists
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

const url = process.env.DATABASE_URL || '';

if (!url) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Prevent running migrations against mock/placeholder URLs
if (url.includes('mock') || url.includes('placeholder')) {
  throw new Error('Cannot run migrations against mock database URL');
}

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
} satisfies Config;

