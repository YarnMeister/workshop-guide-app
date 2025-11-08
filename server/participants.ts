import { query } from './database.js';

/**
 * Participant data structure
 */
export interface Participant {
  code: string;
  name: string;
  apiKey: string;
  certId: number;
}

/**
 * In-memory cache for participants
 * Reduces database load for read-heavy operations
 */
let participantsCache: Record<string, Participant> | null = null;
let cacheExpiry: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get a single participant by their unique code
 * Used for authentication and session validation
 * 
 * @param code - Participant's unique code (e.g., "9fA#2")
 * @returns Participant data or null if not found/inactive
 */
export async function getParticipantByCode(code: string): Promise<Participant | null> {
  try {
    const result = await query(
      'SELECT code, name, api_key as "apiKey", cert_id as "certId" FROM participants WHERE code = $1 AND is_active = true',
      [code]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as Participant;
  } catch (error) {
    console.error('Failed to fetch participant by code:', error);
    return null;
  }
}

/**
 * Get all active participants
 * Uses in-memory cache to reduce database load
 * Cache expires after CACHE_TTL (5 minutes)
 * 
 * @returns Record of all active participants keyed by code
 */
export async function getAllParticipants(): Promise<Record<string, Participant>> {
  // Check cache first
  if (participantsCache && Date.now() < cacheExpiry) {
    return participantsCache;
  }
  
  try {
    const result = await query(
      'SELECT code, name, api_key as "apiKey", cert_id as "certId" FROM participants WHERE is_active = true ORDER BY name'
    );

    const participants: Record<string, Participant> = {};
    for (const row of result.rows) {
      participants[row.code] = {
        code: row.code,
        name: row.name,
        apiKey: row.apiKey,
        certId: row.certId,
      };
    }
    
    participantsCache = participants;
    cacheExpiry = Date.now() + CACHE_TTL;
    
    console.log(`✅ Loaded ${Object.keys(participants).length} participants from database`);
    return participants;
  } catch (error) {
    console.error('❌ Failed to load participants from database:', error);
    
    // Return empty object on error (fail gracefully)
    return {};
  }
}

/**
 * Clear the participants cache
 * Useful for testing or when participants are updated
 */
export function clearParticipantsCache(): void {
  participantsCache = null;
  cacheExpiry = 0;
  console.log('🗑️  Participants cache cleared');
}

/**
 * Get a single participant by their API key
 * Used for API key-based authentication (external clients)
 *
 * @param apiKey - Participant's API key (e.g., "sk-or-v1-...")
 * @returns Participant data or null if not found/inactive
 */
export async function getParticipantByApiKey(apiKey: string): Promise<Participant | null> {
  try {
    const result = await query(
      'SELECT code, name, api_key as "apiKey", cert_id as "certId" FROM participants WHERE api_key = $1 AND is_active = true',
      [apiKey]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as Participant;
  } catch (error) {
    console.error('Failed to fetch participant by API key:', error);
    return null;
  }
}

/**
 * Check if database-based participants are available
 * Falls back to environment variable if database is not ready
 *
 * @returns true if database has participants, false otherwise
 */
export async function isDatabaseReady(): Promise<boolean> {
  try {
    const result = await query('SELECT COUNT(*) as count FROM participants WHERE is_active = true');
    const count = parseInt(result.rows[0]?.count || '0', 10);
    return count > 0;
  } catch (error) {
    console.error('Database readiness check failed:', error);
    return false;
  }
}

