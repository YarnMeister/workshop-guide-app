import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { participants } from '../drizzle/schema.js';
import { asc } from 'drizzle-orm';

// Load .env.local explicitly
config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function verifyCertIds() {
  console.log('🔍 Verifying cert_id column...\n');
  
  try {
    const allParticipants = await db
      .select({
        id: participants.id,
        name: participants.name,
        code: participants.code,
        certId: participants.certId,
      })
      .from(participants)
      .orderBy(asc(participants.id));
    
    console.log(`📊 Found ${allParticipants.length} participants:\n`);
    console.log('ID  | Name           | Code      | Cert ID');
    console.log('----+----------------+-----------+--------');
    
    allParticipants.forEach(p => {
      console.log(
        `${String(p.id).padEnd(3)} | ${p.name.padEnd(14)} | ${p.code.padEnd(9)} | ${p.certId}`
      );
    });
    
    // Check for duplicates
    const certIds = allParticipants.map(p => p.certId);
    const uniqueCertIds = new Set(certIds);
    
    console.log('\n✅ Verification Results:');
    console.log(`   - Total participants: ${allParticipants.length}`);
    console.log(`   - Unique cert_ids: ${uniqueCertIds.size}`);
    console.log(`   - Cert ID range: ${Math.min(...certIds)} - ${Math.max(...certIds)}`);
    
    if (certIds.length === uniqueCertIds.size) {
      console.log('   - ✅ All cert_ids are unique!');
    } else {
      console.log('   - ❌ WARNING: Duplicate cert_ids found!');
    }
    
    // Check for nulls
    const nullCertIds = allParticipants.filter(p => p.certId === null);
    if (nullCertIds.length === 0) {
      console.log('   - ✅ No null cert_ids found!');
    } else {
      console.log(`   - ❌ WARNING: ${nullCertIds.length} null cert_ids found!`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n👋 Database connection closed');
  }
}

verifyCertIds();

