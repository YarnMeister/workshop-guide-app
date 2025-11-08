import pg from 'pg';

const { Pool } = pg;

// Create a connection pool
let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      // Connection pool settings optimized for serverless (Vercel)
      max: 10,  // Reduced for serverless - Vercel runs multiple instances
      min: 0,   // Allow pool to scale to zero when idle
      idleTimeoutMillis: 10000,  // Faster cleanup for serverless (10s)
      connectionTimeoutMillis: 3000,  // Slightly longer timeout for reliability
      allowExitOnIdle: true,  // Important: allows process to exit when idle
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

/**
 * Execute a query with parameters
 * Includes performance monitoring for slow queries
 */
export async function query(text: string, params?: any[]): Promise<pg.QueryResult> {
  const start = Date.now();
  const pool = getPool();
  const client = await pool.connect();

  try {
    const result = await client.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries (>1 second)
    if (duration > 1000) {
      console.warn(`⚠️  Slow query (${duration}ms):`, text.substring(0, 100) + '...');
    }

    return result;
  } finally {
    client.release();
  }
}

/**
 * Execute multiple queries in a transaction
 */
export async function transaction(queries: Array<{ text: string; params?: any[] }>): Promise<pg.QueryResult[]> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const results: pg.QueryResult[] = [];
    for (const { text, params } of queries) {
      const result = await client.query(text, params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close all connections (for cleanup)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as test');
    return result.rows[0].test === 1;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Get basic table info
 */
export async function getTableInfo(tableName: string) {
  const result = await query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = $1
    ORDER BY ordinal_position;
  `, [tableName]);
  
  return result.rows;
}

/**
 * Get row count for a table
 */
export async function getTableRowCount(tableName: string): Promise<number> {
  const result = await query(`SELECT COUNT(*) as count FROM "${tableName}"`);
  return parseInt(result.rows[0].count);
}
