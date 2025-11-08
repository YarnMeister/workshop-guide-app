#!/usr/bin/env node
/**
 * Migration Linter for Workshop Guide App
 * 
 * Validates SQL migration files to prevent destructive operations
 * and ensure migration safety before deployment.
 * 
 * Adapted from new-app-template for workshop-specific needs.
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'drizzle', 'migrations');

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(color, prefix, message) {
  console.log(`${colors[color]}${prefix}${colors.reset} ${message}`);
}

function error(message) {
  log('red', '❌ ERROR:', message);
}

function warn(message) {
  log('yellow', '⚠️  WARNING:', message);
}

function success(message) {
  log('green', '✅ SUCCESS:', message);
}

function info(message) {
  log('blue', 'ℹ️  INFO:', message);
}

/**
 * Check if migrations directory exists
 */
function checkMigrationsDir() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    warn('No migrations directory found. Skipping lint.');
    return false;
  }
  return true;
}

/**
 * Get all SQL migration files
 */
function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR);
  return files
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ensure consistent ordering
}

/**
 * Check for destructive operations
 */
function checkDestructiveOperations(content, filename) {
  const destructivePatterns = [
    { pattern: /DROP\s+TABLE/i, name: 'DROP TABLE' },
    { pattern: /DROP\s+COLUMN/i, name: 'DROP COLUMN' },
    { pattern: /TRUNCATE/i, name: 'TRUNCATE' },
    { pattern: /DELETE\s+FROM/i, name: 'DELETE FROM' },
  ];

  const errors = [];

  // Check if file has explicit allow-destructive comment
  const hasAllowDestructive = /--\s*allow-destructive/i.test(content);

  if (hasAllowDestructive) {
    info(`${filename}: Destructive operations explicitly allowed`);
    return errors;
  }

  // Check for destructive patterns
  for (const { pattern, name } of destructivePatterns) {
    if (pattern.test(content)) {
      errors.push(
        `${filename}: Contains ${name} without '-- allow-destructive' comment`
      );
    }
  }

  return errors;
}

/**
 * Check for manual transaction statements
 * Drizzle migrator wraps migrations in transactions automatically
 */
function checkManualTransactions(content, filename) {
  const transactionPatterns = [
    { pattern: /^\s*BEGIN/im, name: 'BEGIN' },
    { pattern: /^\s*COMMIT/im, name: 'COMMIT' },
    { pattern: /^\s*ROLLBACK/im, name: 'ROLLBACK' },
  ];

  const errors = [];

  for (const { pattern, name } of transactionPatterns) {
    if (pattern.test(content)) {
      errors.push(
        `${filename}: Contains manual ${name} statement. Drizzle migrator handles transactions automatically.`
      );
    }
  }

  return errors;
}

/**
 * Check for empty migrations
 */
function checkEmptyMigration(content, filename) {
  // Remove comments and whitespace
  const sqlContent = content
    .replace(/--.*$/gm, '') // Remove SQL comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .trim();

  if (!sqlContent) {
    return [`${filename}: Migration file is empty or contains only comments`];
  }

  return [];
}

/**
 * Check for TODO/FIXME comments
 */
function checkTodoComments(content, filename) {
  const warnings = [];

  if (/TODO|FIXME/i.test(content)) {
    warnings.push(`${filename}: Contains TODO/FIXME comments`);
  }

  return warnings;
}

/**
 * Check for DDL statements (basic validation)
 */
function checkHasDDL(content, filename) {
  const ddlPatterns = [
    /CREATE\s+(TABLE|INDEX|UNIQUE\s+INDEX)/i,
    /ALTER\s+TABLE/i,
    /DROP\s+(TABLE|INDEX)/i,
  ];

  const hasDDL = ddlPatterns.some(pattern => pattern.test(content));

  if (!hasDDL) {
    return [`${filename}: No DDL statements found. Is this migration intentional?`];
  }

  return [];
}

/**
 * Main linting function
 */
function lintMigrations() {
  console.log('\n🔍 Linting database migrations...\n');

  if (!checkMigrationsDir()) {
    return 0; // Exit successfully if no migrations yet
  }

  const migrationFiles = getMigrationFiles();

  if (migrationFiles.length === 0) {
    info('No migration files found. Skipping lint.');
    return 0;
  }

  info(`Found ${migrationFiles.length} migration file(s)`);

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const filename of migrationFiles) {
    const filepath = path.join(MIGRATIONS_DIR, filename);
    const content = fs.readFileSync(filepath, 'utf-8');

    const errors = [
      ...checkDestructiveOperations(content, filename),
      ...checkManualTransactions(content, filename),
      ...checkEmptyMigration(content, filename),
      ...checkHasDDL(content, filename),
    ];

    const warnings = [
      ...checkTodoComments(content, filename),
    ];

    if (errors.length > 0) {
      errors.forEach(err => error(err));
      totalErrors += errors.length;
    }

    if (warnings.length > 0) {
      warnings.forEach(wrn => warn(wrn));
      totalWarnings += warnings.length;
    }

    if (errors.length === 0 && warnings.length === 0) {
      success(`${filename}: Passed all checks`);
    }
  }

  console.log('');

  if (totalErrors > 0) {
    error(`Migration linting failed with ${totalErrors} error(s)`);
    console.log('');
    return 1; // Exit with error code
  }

  if (totalWarnings > 0) {
    warn(`Migration linting passed with ${totalWarnings} warning(s)`);
  } else {
    success('All migrations passed linting checks!');
  }

  console.log('');
  return 0;
}

// Run the linter
const exitCode = lintMigrations();
process.exit(exitCode);

