import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Pool } = pg;

async function exploreDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔗 Connecting to database...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    // Get database info
    const dbInfoQuery = `
      SELECT current_database() as database_name, 
             current_user as user_name,
             version() as version;
    `;
    const dbInfo = await client.query(dbInfoQuery);
    console.log('\n📊 Database Info:');
    console.log(dbInfo.rows[0]);
    
    // List all tables
    const tablesQuery = `
      SELECT table_schema, table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema, table_name;
    `;
    const tables = await client.query(tablesQuery);
    console.log('\n📋 Tables in database:');
    if (tables.rows.length === 0) {
      console.log('No user tables found.');
    } else {
      tables.rows.forEach(table => {
        console.log(`  - ${table.table_schema}.${table.table_name} (${table.table_type})`);
      });
    }
    
    // If there are tables, show their structure
    if (tables.rows.length > 0) {
      console.log('\n🏗️  Table Structures:');
      
      for (const table of tables.rows) {
        const columnsQuery = `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = $1 AND table_name = $2
          ORDER BY ordinal_position;
        `;
        const columns = await client.query(columnsQuery, [table.table_schema, table.table_name]);
        
        console.log(`\n  📊 ${table.table_schema}.${table.table_name}:`);
        columns.rows.forEach(col => {
          console.log(`    - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
        });
        
        // Show row count
        const countQuery = `SELECT COUNT(*) as count FROM "${table.table_schema}"."${table.table_name}";`;
        const count = await client.query(countQuery);
        console.log(`    📊 Row count: ${count.rows[0].count}`);
        
        // Show sample data (first 3 rows)
        const sampleQuery = `SELECT * FROM "${table.table_schema}"."${table.table_name}" LIMIT 3;`;
        const sample = await client.query(sampleQuery);
        if (sample.rows.length > 0) {
          console.log('    📄 Sample data:');
          sample.rows.forEach((row, index) => {
            console.log(`      Row ${index + 1}:`, JSON.stringify(row, null, 2));
          });
        }
      }
    }
    
    client.release();
    console.log('\n✅ Database exploration complete!');
    
  } catch (error) {
    console.error('❌ Error exploring database:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await pool.end();
  }
}

// Run the exploration
exploreDatabase().catch(console.error);
