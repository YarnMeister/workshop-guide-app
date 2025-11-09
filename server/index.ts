import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { query, testConnection } from './database.js';
import { getParticipantByCode, getParticipantByApiKey, getAllParticipants, clearParticipantsCache, isDatabaseReady } from './participants.js';

// Load environment variables from .env.local (for local dev) or .env
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env if .env.local doesn't exist

// Special handling for PARTICIPANTS_JSON because it contains special characters (#) that break dotenv parsing
// Read it directly from the file to avoid comment parsing issues
if (!process.env.PARTICIPANTS_JSON || process.env.PARTICIPANTS_JSON.length < 10) {
  try {
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const envContent = fs.readFileSync(envLocalPath, 'utf-8');
      // Match PARTICIPANTS_JSON= followed by the JSON value (handle quoted and unquoted)
      const jsonMatch = envContent.match(/^PARTICIPANTS_JSON=(.+)$/m);
      if (jsonMatch && jsonMatch[1]) {
        let jsonValue = jsonMatch[1].trim();
        // Remove surrounding quotes if present
        if ((jsonValue.startsWith('"') && jsonValue.endsWith('"')) ||
            (jsonValue.startsWith("'") && jsonValue.endsWith("'"))) {
          jsonValue = jsonValue.slice(1, -1);
          // Unescape escaped quotes
          jsonValue = jsonValue.replace(/\\"/g, '"').replace(/\\'/g, "'");
        }
        process.env.PARTICIPANTS_JSON = jsonValue;
        console.log(`Loaded PARTICIPANTS_JSON directly from file (${jsonValue.length} chars)`);
      }
    }
  } catch (error) {
    console.error('Failed to read PARTICIPANTS_JSON from .env.local file:', error);
  }
}

const app = express();

// ============================================================================
// In-Memory Cache for Read-Heavy API Endpoints
// ============================================================================

interface CacheEntry {
  data: any;
  expires: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Get cached data or fetch fresh data if cache miss/expired
 * @param key - Unique cache key
 * @param ttlSeconds - Time to live in seconds
 * @param fetchFn - Function to fetch fresh data on cache miss
 */
async function getCached<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  // Return cached data if valid
  if (cached && cached.expires > now) {
    return cached.data as T;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Store in cache
  cache.set(key, {
    data,
    expires: now + (ttlSeconds * 1000),
  });

  return data;
}

/**
 * Clear all cached data (useful for testing or manual refresh)
 */
function clearCache() {
  cache.clear();
  console.log('🗑️  Cache cleared');
}

// Optional: Clear expired cache entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  let cleared = 0;

  for (const [key, entry] of cache.entries()) {
    if (entry.expires <= now) {
      cache.delete(key);
      cleared++;
    }
  }

  if (cleared > 0) {
    console.log(`🧹 Cleared ${cleared} expired cache entries`);
  }
}, 5 * 60 * 1000);

// ============================================================================
// Rate Limiting for API Key Authentication
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

/**
 * Check if a participant has exceeded their rate limit
 * @param participantId - Unique identifier for the participant
 * @param maxRequests - Maximum requests allowed per window (default: 100)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns true if within limit, false if exceeded
 */
function checkRateLimit(
  participantId: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const limit = rateLimits.get(participantId);

  // No existing limit or window expired - create new window
  if (!limit || limit.resetAt < now) {
    rateLimits.set(participantId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  // Check if limit exceeded
  if (limit.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  // Increment counter
  limit.count++;
  return true;
}

/**
 * Clear expired rate limit entries every minute
 * Prevents memory leaks from inactive participants
 */
setInterval(() => {
  const now = Date.now();
  let cleared = 0;

  for (const [key, entry] of rateLimits.entries()) {
    if (entry.resetAt < now) {
      rateLimits.delete(key);
      cleared++;
    }
  }

  if (cleared > 0) {
    console.log(`🧹 Cleared ${cleared} expired rate limit entries`);
  }
}, 60 * 1000); // Every minute

// ============================================================================
// Input Validation Helpers
// ============================================================================

/**
 * Validate and sanitize limit parameter
 * @param value - Raw limit value from query params
 * @param defaultValue - Default value if invalid (default: 20)
 * @param maxValue - Maximum allowed value (default: 100)
 * @returns Validated limit value
 */
function validateLimit(value: any, defaultValue: number = 20, maxValue: number = 100): number {
  const parsed = parseInt(value);
  if (isNaN(parsed) || parsed < 1) {
    return defaultValue;
  }
  return Math.min(parsed, maxValue);
}

/**
 * Validate and sanitize state parameter
 * @param value - Raw state value from query params
 * @returns Validated state code or null if invalid
 */
function validateState(value: any): string | null {
  if (!value || typeof value !== 'string') {
    return null;
  }
  const upperState = value.toUpperCase().trim();
  // Australian states: NSW, VIC, QLD, SA, WA, TAS, NT, ACT
  if (/^(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)$/.test(upperState)) {
    return upperState;
  }
  return null;
}

/**
 * Validate and sanitize offset parameter
 * @param value - Raw offset value from query params
 * @param defaultValue - Default value if invalid (default: 0)
 * @returns Validated offset value
 */
function validateOffset(value: any, defaultValue: number = 0): number {
  const parsed = parseInt(value);
  if (isNaN(parsed) || parsed < 0) {
    return defaultValue;
  }
  return parsed;
}

/**
 * Validate and sanitize numeric parameter
 * @param value - Raw numeric value from query params
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Validated number or null if invalid
 */
function validateNumber(value: any, min?: number, max?: number): number | null {
  const parsed = parseInt(value);
  if (isNaN(parsed)) {
    return null;
  }
  if (min !== undefined && parsed < min) {
    return null;
  }
  if (max !== undefined && parsed > max) {
    return null;
  }
  return parsed;
}

/**
 * Mask sensitive data for logging (API keys, tokens, etc.)
 * @param value - Sensitive value to mask
 * @param visibleChars - Number of characters to show at start (default: 10)
 * @returns Masked string
 */
function maskSensitiveData(value: string, visibleChars: number = 10): string {
  if (!value || value.length <= visibleChars) {
    return '***';
  }
  return value.substring(0, visibleChars) + '...';
}

// ============================================================================
// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Add request size limits to prevent DoS attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Environment variables
const COOKIE_SECRET = process.env.COOKIE_SECRET || '';
const COOKIE_NAME = 'participant_session';
const COOKIE_MAX_AGE = 28800; // 8 hours in seconds

// Feature flag: Use database for participants (with fallback to env var)
const USE_DATABASE_PARTICIPANTS = process.env.USE_DATABASE_PARTICIPANTS !== 'false'; // Default: true

// Legacy participant data cache (for fallback only)
let participantsCache: Record<string, { name: string; apiKey: string }> | null = null;

/**
 * LEGACY: Load participants from PARTICIPANTS_JSON environment variable
 * This is kept as a fallback mechanism during migration
 * @deprecated Use getParticipantByCode() or getAllParticipants() from participants.ts instead
 */
function loadParticipants(): Record<string, { name: string; apiKey: string }> {
  if (participantsCache) {
    return participantsCache;
  }

  const participantsJson = process.env.PARTICIPANTS_JSON;
  if (!participantsJson) {
    console.error('PARTICIPANTS_JSON environment variable not set');
    participantsCache = {};
    return participantsCache;
  }

  // SECURITY: Log diagnostics without exposing API keys
  console.log(`PARTICIPANTS_JSON length: ${participantsJson.length} characters`);
  console.log(`PARTICIPANTS_JSON format check: ${participantsJson.trim().startsWith('{') ? 'JSON object' : 'unknown'}`);

  try {
    // Check if it's already a parsed object (shouldn't happen, but be safe)
    if (typeof participantsJson === 'object') {
      participantsCache = participantsJson as Record<string, { name: string; apiKey: string }>;
      return participantsCache;
    }

    // Remove any surrounding quotes if present
    let jsonString = participantsJson.trim();
    if ((jsonString.startsWith('"') && jsonString.endsWith('"')) ||
        (jsonString.startsWith("'") && jsonString.endsWith("'"))) {
      jsonString = jsonString.slice(1, -1);
      // Unescape any escaped quotes
      jsonString = jsonString.replace(/\\"/g, '"').replace(/\\'/g, "'");
    }

    // SECURITY: Check if the JSON appears truncated (doesn't end with } or }])
    // Do NOT log the actual content as it contains API keys
    const trimmed = jsonString.trim();
    if (!trimmed.endsWith('}') && !trimmed.endsWith('}]')) {
      console.error('PARTICIPANTS_JSON appears truncated - does not end with }');
      console.error(`PARTICIPANTS_JSON length: ${trimmed.length} characters`);

      // Try to find where it was truncated (look for incomplete JSON)
      const lastOpeningBrace = trimmed.lastIndexOf('{');
      const lastClosingBrace = trimmed.lastIndexOf('}');
      if (lastOpeningBrace > lastClosingBrace) {
        console.error('PARTICIPANTS_JSON is truncated - unclosed brace detected');
        console.error(`Last opening brace at position: ${lastOpeningBrace}, last closing brace at: ${lastClosingBrace}`);
      }

      participantsCache = {};
      return participantsCache;
    }

    // Parse the JSON string
    const parsed = JSON.parse(jsonString) as Record<string, { name: string; apiKey: string }>;
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Invalid PARTICIPANTS_JSON format');
    }

    // Validate structure
    for (const [code, participant] of Object.entries(parsed)) {
      if (!participant || typeof participant !== 'object') {
        console.error(`Invalid participant data for code: ${code}`);
        delete parsed[code];
        continue;
      }
      if (!participant.name || typeof participant.name !== 'string') {
        console.error(`Invalid participant name for code: ${code}`);
        delete parsed[code];
        continue;
      }
      if (!participant.apiKey || typeof participant.apiKey !== 'string') {
        console.error(`Invalid participant apiKey for code: ${code}`);
        delete parsed[code];
        continue;
      }
    }

    console.log(`Loaded ${Object.keys(parsed).length} participants`);
    participantsCache = parsed;
    return participantsCache;
  } catch (error) {
    // SECURITY: Do NOT log PARTICIPANTS_JSON content as it contains API keys
    console.error('Failed to parse PARTICIPANTS_JSON:', error instanceof Error ? error.message : String(error));
    if (error instanceof SyntaxError) {
      console.error('JSON parse error detected');
      console.error('PARTICIPANTS_JSON length:', participantsJson.length, 'characters');
      console.error('Starts with:', participantsJson.trim().startsWith('{') ? 'object' : participantsJson.trim().startsWith('[') ? 'array' : 'unknown');
      console.error('Ends with:', participantsJson.trim().endsWith('}') ? 'object' : participantsJson.trim().endsWith(']') ? 'array' : 'unknown');
      console.error('Please check PARTICIPANTS_JSON environment variable format');
    }
    participantsCache = {};
    return participantsCache;
  }
}

function maskApiKey(key: string): string {
  if (!key || key.length <= 8) {
    return '**********';
  }
  return key.substring(0, 8) + '*'.repeat(Math.max(8, key.length - 8));
}

function createCookie(payload: { code: string; name: string; participantId: string; certId?: number }): string {
  if (!COOKIE_SECRET) {
    throw new Error('COOKIE_SECRET not configured');
  }

  const data = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', COOKIE_SECRET)
    .update(data)
    .digest('hex');
  const encoded = Buffer.from(data).toString('base64url');
  const signedValue = `${encoded}.${signature}`;

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = [
    `${COOKIE_NAME}=${signedValue}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    `Path=/`,
    `SameSite=Lax`,
    ...(isProduction ? ['Secure'] : []),
    `HttpOnly`,
  ];

  return cookieOptions.join('; ');
}

function verifyCookie(cookieValue: string): { code: string; name: string; participantId: string; certId?: number } | null {
  if (!COOKIE_SECRET) {
    return null;
  }

  try {
    const [encoded, signature] = cookieValue.split('.');
    if (!encoded || !signature) {
      return null;
    }

    const data = Buffer.from(encoded, 'base64url').toString('utf-8');
    const expectedSignature = crypto
      .createHmac('sha256', COOKIE_SECRET)
      .update(data)
      .digest('hex');

    if (signature !== expectedSignature) {
      return null;
    }

    return JSON.parse(data) as { code: string; name: string; participantId: string };
  } catch (error) {
    console.error('Cookie verification error:', error);
    return null;
  }
}

// Routes
app.post('/api/claim', async (req, res) => {
  try {
    if (!COOKIE_SECRET) {
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid code' });
    }

    // Try database first, fallback to environment variable
    let participant: { name: string; apiKey: string; certId?: number } | null = null;

    if (USE_DATABASE_PARTICIPANTS) {
      participant = await getParticipantByCode(code.trim());

      // If database is empty, try fallback
      if (!participant && !(await isDatabaseReady())) {
        console.warn('⚠️  Database not ready, falling back to PARTICIPANTS_JSON');
        const participants = loadParticipants();
        participant = participants[code.trim()] || null;
      }
    } else {
      // Fallback mode: use environment variable
      const participants = loadParticipants();
      participant = participants[code.trim()] || null;
    }

    if (!participant) {
      return res.status(404).json({ success: false, error: 'Invalid code' });
    }

    const cookiePayload = {
      code: code.trim(),
      name: participant.name,
      participantId: code.trim(),
      certId: participant.certId,
    };

    const cookie = createCookie(cookiePayload);
    const maskedKey = maskApiKey(participant.apiKey);

    res.setHeader('Set-Cookie', cookie);
    res.status(200).json({
      success: true,
      participantId: code.trim(),
      name: participant.name,
      apiKeyMasked: maskedKey,
      certId: participant.certId,
    });
  } catch (error) {
    console.error('Claim error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/session', async (req, res) => {
  try {
    if (!COOKIE_SECRET) {
      return res.status(200).json({ authenticated: false });
    }

    const cookieHeader = req.headers.cookie || '';
    const cookieMatch = cookieHeader.match(/participant_session=([^;]+)/);
    const cookie = cookieMatch ? cookieMatch[1] : null;

    if (!cookie) {
      return res.status(200).json({ authenticated: false });
    }

    const payload = verifyCookie(cookie);
    if (!payload) {
      return res.status(200).json({ authenticated: false });
    }

    res.status(200).json({
      authenticated: true,
      participantId: payload.participantId,
      name: payload.name,
      certId: payload.certId,
    });
  } catch (error) {
    console.error('Session error:', error);
    res.status(200).json({ authenticated: false });
  }
});

app.post('/api/reveal-key', async (req, res) => {
  try {
    if (!COOKIE_SECRET) {
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const cookieHeader = req.headers.cookie || '';
    const cookieMatch = cookieHeader.match(/participant_session=([^;]+)/);
    const cookie = cookieMatch ? cookieMatch[1] : null;

    if (!cookie) {
      console.log('[reveal-key] No session cookie found');
      return res.status(401).json({ success: false, error: 'Session expired' });
    }

    const payload = verifyCookie(cookie);
    if (!payload) {
      console.log('[reveal-key] Invalid or expired session cookie');
      return res.status(401).json({ success: false, error: 'Session expired' });
    }

    console.log(`[reveal-key] Looking up participant with code: ${payload.code}`);
    console.log(`[reveal-key] USE_DATABASE_PARTICIPANTS: ${USE_DATABASE_PARTICIPANTS}`);

    // Try database first, fallback to environment variable
    let participant: { name: string; apiKey: string } | null = null;

    if (USE_DATABASE_PARTICIPANTS) {
      console.log('[reveal-key] Querying database for participant...');
      participant = await getParticipantByCode(payload.code);

      if (participant) {
        console.log(`[reveal-key] ✅ Found participant in database: ${participant.name}`);
      } else {
        console.log(`[reveal-key] ⚠️  Participant not found in database, checking if database is ready...`);
        const dbReady = await isDatabaseReady();
        if (!dbReady) {
          console.warn('⚠️  Database not ready, falling back to PARTICIPANTS_JSON');
          const participants = loadParticipants();
          participant = participants[payload.code] || null;
          if (participant) {
            console.log(`[reveal-key] ✅ Found participant in fallback: ${participant.name}`);
          }
        }
      }
    } else {
      // Fallback mode: use environment variable
      console.log('[reveal-key] Using fallback mode (PARTICIPANTS_JSON)');
      const participants = loadParticipants();
      participant = participants[payload.code] || null;
      if (participant) {
        console.log(`[reveal-key] ✅ Found participant in fallback: ${participant.name}`);
      }
    }

    if (!participant) {
      console.error(`[reveal-key] ❌ Participant not found for code: ${payload.code}`);
      return res.status(404).json({ success: false, error: 'Participant not found' });
    }

    const maskedKey = maskApiKey(participant.apiKey);
    // SECURITY: Never log the full API key - only log masked version
    console.log(`[reveal-key] ✅ Returning API key for participant: ${participant.name} (key: ${maskedKey})`);

    res.status(200).json({
      success: true,
      apiKey: participant.apiKey,
      apiKeyMasked: maskedKey,
    });
  } catch (error) {
    // SECURITY: Mask any API keys that might be in error messages
    const errorMessage = error instanceof Error ? error.message : String(error);
    const safeErrorMessage = errorMessage.replace(/sk-or-v1-[a-zA-Z0-9]+/g, '[API_KEY_REDACTED]');
    console.error('[reveal-key] ❌ Error:', safeErrorMessage);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  const dbReady = await isDatabaseReady();

  res.status(200).json({
    status: 'ok',
    env: {
      hasCookieSecret: !!COOKIE_SECRET,
      hasParticipantsJson: !!process.env.PARTICIPANTS_JSON,
      useDatabaseParticipants: USE_DATABASE_PARTICIPANTS,
      databaseReady: dbReady,
    }
  });
});

// Logout endpoint - clears session cookie
app.post('/api/logout', async (req, res) => {
  try {
    // Clear the session cookie by setting it to expire immediately
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax; HttpOnly`);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================================
// Authentication Middleware (Dual: Cookie + API Key)
// ============================================================================

/**
 * Middleware to check authentication for protected routes
 * Supports two authentication methods:
 * 1. Cookie-based (for web app) - existing behavior
 * 2. API Key-based (for external clients) - new behavior
 *
 * API Key format: Authorization: Bearer <api-key>
 * Rate limiting: 100 requests/minute per participant (API key auth only)
 */
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // ========================================================================
    // Method 1: Cookie-based authentication (existing behavior)
    // ========================================================================
    const cookieHeader = req.headers.cookie || '';
    const cookieMatch = cookieHeader.match(/participant_session=([^;]+)/);
    const cookie = cookieMatch ? cookieMatch[1] : null;

    if (cookie) {
      const payload = verifyCookie(cookie);
      if (payload) {
        // Valid cookie - add participant info to request
        (req as any).participant = payload;
        (req as any).authMethod = 'cookie';
        return next();
      }
    }

    // ========================================================================
    // Method 2: API Key-based authentication (new behavior)
    // ========================================================================
    const authHeader = req.headers.authorization || '';
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    const apiKey = bearerMatch ? bearerMatch[1] : null;

    if (apiKey) {
      // SECURITY: Mask API key for logging
      const maskedKey = maskSensitiveData(apiKey, 10);

      // Validate API key against database
      const participant = await getParticipantByApiKey(apiKey);

      if (!participant) {
        console.warn(`[auth] Invalid API key attempt: ${maskedKey}`);
        return res.status(401).json({
          error: 'Invalid API key',
          message: 'The provided API key is not valid or has been deactivated.'
        });
      }

      // Check rate limit (100 requests/minute per participant)
      const withinLimit = checkRateLimit(participant.code, 100, 60000);

      if (!withinLimit) {
        console.warn(`[auth] Rate limit exceeded for participant: ${participant.name} (${participant.code})`);
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'You have exceeded the rate limit of 100 requests per minute. Please try again later.',
          retryAfter: 60 // seconds
        });
      }

      // Valid API key and within rate limit - add participant info to request
      (req as any).participant = {
        code: participant.code,
        name: participant.name,
        participantId: participant.code,
        certId: participant.certId,
      };
      (req as any).authMethod = 'api-key';
      return next();
    }

    // ========================================================================
    // No valid authentication method found
    // ========================================================================
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide either a valid session cookie or API key in the Authorization header (Bearer token).'
    });

  } catch (error) {
    // SECURITY: Mask any API keys that might be in error messages
    const errorMessage = error instanceof Error ? error.message : String(error);
    const safeErrorMessage = errorMessage.replace(/sk-or-v1-[a-zA-Z0-9]+/g, '[API_KEY_REDACTED]');
    console.error('[auth] Middleware error:', safeErrorMessage);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Database insights endpoints

// Get suburb insights (cached for 5 minutes)
app.get('/api/insights/suburbs', requireAuth, async (req, res) => {
  try {
    // Validate and sanitize input parameters
    const validatedState = validateState(req.query.state);
    const validatedLimit = validateLimit(req.query.limit, 20, 100);

    const cacheKey = `suburbs:${validatedState || 'all'}:${validatedLimit}`;

    const data = await getCached(cacheKey, 300, async () => {
      let queryText = `
        SELECT
          suburb,
          ROUND(AVG(price_search_sold)::numeric, 0) as avg_price,
          ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price_search_sold)::numeric, 0) as median_price,
          COUNT(*) as total_sales
        FROM property_sales
        WHERE price_search_sold > 0
      `;

      const params: any[] = [];
      if (validatedState) {
        queryText += ` AND state = $${params.length + 1}`;
        params.push(validatedState);
      }

      queryText += `
        GROUP BY suburb
        HAVING COUNT(*) >= 5
        ORDER BY total_sales DESC
        LIMIT $${params.length + 1}
      `;
      params.push(validatedLimit);

      const result = await query(queryText, params);
      return result.rows;
    });

    res.json(data);
  } catch (error) {
    console.error('Suburb insights error:', error);
    res.status(500).json({ error: 'Failed to fetch suburb insights' });
  }
});

// Get property type insights (cached for 5 minutes)
app.get('/api/insights/property-types', requireAuth, async (req, res) => {
  try {
    // Validate and sanitize input parameters
    const validatedState = validateState(req.query.state);
    const cacheKey = `property-types:${validatedState || 'all'}`;

    const data = await getCached(cacheKey, 300, async () => {
      let queryText = `
        WITH total_sales AS (
          SELECT COUNT(*) as total_count
          FROM property_sales
          WHERE price_search_sold > 0
      `;

      const params: any[] = [];
      if (validatedState) {
        queryText += ` AND state = $${params.length + 1}`;
        params.push(validatedState);
      }

      queryText += `
        )
        SELECT
          property_type,
          ROUND(AVG(price_search_sold)::numeric, 0) as avg_price,
          COUNT(*) as total_sales,
          ROUND((COUNT(*)::float / total_sales.total_count * 100)::numeric, 1) as market_share_pct
        FROM property_sales, total_sales
        WHERE price_search_sold > 0
      `;

      if (validatedState) {
        queryText += ` AND state = $${params.length}`;
      }

      queryText += `
        GROUP BY property_type, total_sales.total_count
        ORDER BY total_sales DESC
      `;

      const result = await query(queryText, params);
      return result.rows;
    });

    res.json(data);
  } catch (error) {
    console.error('Property type insights error:', error);
    res.status(500).json({ error: 'Failed to fetch property type insights' });
  }
});

// Get price trends over time
app.get('/api/insights/price-trends', requireAuth, async (req, res) => {
  try {
    // Validate and sanitize input parameters
    const validatedState = validateState(req.query.state);
    const validatedMonths = validateLimit(req.query.months, 12, 60); // Max 60 months (5 years)

    let queryText = `
      WITH recent_data AS (
        SELECT
          TO_CHAR(active_month, 'YYYY-MM') as month,
          ROUND(AVG(price_search_sold)::numeric, 0) as avg_price,
          COUNT(*) as total_sales,
          active_month
        FROM property_sales
        WHERE price_search_sold > 0
    `;

    const params: any[] = [];
    if (validatedState) {
      queryText += ` AND state = $${params.length + 1}`;
      params.push(validatedState);
    }

    // Validate property_type (allow any string, but sanitize for SQL injection)
    if (req.query.property_type && typeof req.query.property_type === 'string') {
      queryText += ` AND property_type = $${params.length + 1}`;
      params.push(req.query.property_type);
    }

    queryText += `
        GROUP BY TO_CHAR(active_month, 'YYYY-MM'), active_month
        HAVING COUNT(*) >= 10
      )
      SELECT month, avg_price, total_sales
      FROM recent_data
      ORDER BY month DESC
      LIMIT $${params.length + 1}
    `;
    params.push(validatedMonths);

    const result = await query(queryText, params);
    console.log('Price trends query result:', result.rows.length, 'months found');
    res.json(result.rows);
  } catch (error) {
    console.error('Price trends error:', error);
    res.status(500).json({ error: 'Failed to fetch price trends' });
  }
});

// Get sale type insights
app.get('/api/insights/sale-types', requireAuth, async (req, res) => {
  try {
    // Validate and sanitize input parameters
    const validatedState = validateState(req.query.state);

    let queryText = `
      SELECT
        sale_type,
        ROUND(AVG(price_search_sold)::numeric, 0) as avg_price,
        COUNT(*) as total_sales,
        ROUND(AVG((price_search_sold - price_search)::float / price_search * 100)::numeric, 2) as avg_premium_pct
      FROM property_sales
      WHERE price_search_sold > 0 AND price_search > 0
    `;

    const params: any[] = [];
    if (validatedState) {
      queryText += ` AND state = $${params.length + 1}`;
      params.push(validatedState);
    }

    queryText += `
      GROUP BY sale_type
      ORDER BY total_sales DESC
    `;

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Sale type insights error:', error);
    res.status(500).json({ error: 'Failed to fetch sale type insights' });
  }
});

// Get market statistics (cached for 10 minutes - rarely changes)
app.get('/api/insights/market-stats', requireAuth, async (req, res) => {
  try {
    // Validate and sanitize input parameters
    const validatedState = validateState(req.query.state);
    const cacheKey = `market-stats:${validatedState || 'all'}`;

    const data = await getCached(cacheKey, 600, async () => {
      let queryText = `
        SELECT
          COUNT(*) as total_sales,
          ROUND(AVG(price_search_sold)::numeric, 0) as avg_price,
          ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price_search_sold)::numeric, 0) as median_price,
          COUNT(DISTINCT suburb) as total_suburbs,
          MIN(price_search_sold) as min_price,
          MAX(price_search_sold) as max_price,
          MODE() WITHIN GROUP (ORDER BY TO_CHAR(active_month, 'YYYY-MM')) as most_active_month
        FROM property_sales
        WHERE price_search_sold > 0
      `;

      const params: any[] = [];
      if (validatedState) {
        queryText += ` AND state = $${params.length + 1}`;
        params.push(validatedState);
      }

      const result = await query(queryText, params);
      const stats = result.rows[0];

      return {
        total_sales: parseInt(stats.total_sales),
        avg_price: parseInt(stats.avg_price),
        median_price: parseInt(stats.median_price),
        total_suburbs: parseInt(stats.total_suburbs),
        price_range: {
          min: parseInt(stats.min_price),
          max: parseInt(stats.max_price)
        },
        most_active_month: stats.most_active_month
      };
    });

    res.json(data);
  } catch (error) {
    console.error('Market stats error:', error);
    res.status(500).json({ error: 'Failed to fetch market stats' });
  }
});

// Search properties with filters
app.get('/api/properties/search', requireAuth, async (req, res) => {
  try {
    // Validate and sanitize input parameters
    const validatedState = validateState(req.query.state);
    const validatedLimit = validateLimit(req.query.limit, 50, 100);
    const validatedOffset = validateOffset(req.query.offset, 0);
    const validatedMinPrice = validateNumber(req.query.min_price, 0);
    const validatedMaxPrice = validateNumber(req.query.max_price, 0);
    const validatedBedrooms = validateNumber(req.query.bedrooms, 0, 20);
    const validatedBathrooms = validateNumber(req.query.bathrooms, 0, 20);
    const validatedYear = validateNumber(req.query.year, 2000, 2100);

    let queryText = `
      SELECT *
      FROM property_sales
      WHERE price_search_sold > 0
    `;

    const params: any[] = [];

    if (validatedState) {
      queryText += ` AND state = $${params.length + 1}`;
      params.push(validatedState);
    }

    // Validate suburb (allow any string, but sanitize for SQL injection via parameterized query)
    if (req.query.suburb && typeof req.query.suburb === 'string') {
      queryText += ` AND suburb ILIKE $${params.length + 1}`;
      params.push(`%${req.query.suburb}%`);
    }

    // Validate property_type (allow any string, but sanitize for SQL injection via parameterized query)
    if (req.query.property_type && typeof req.query.property_type === 'string') {
      queryText += ` AND property_type = $${params.length + 1}`;
      params.push(req.query.property_type);
    }

    if (validatedMinPrice !== null) {
      queryText += ` AND price_search_sold >= $${params.length + 1}`;
      params.push(validatedMinPrice);
    }

    if (validatedMaxPrice !== null) {
      queryText += ` AND price_search_sold <= $${params.length + 1}`;
      params.push(validatedMaxPrice);
    }

    if (validatedBedrooms !== null) {
      queryText += ` AND bedrooms = $${params.length + 1}`;
      params.push(validatedBedrooms);
    }

    if (validatedBathrooms !== null) {
      queryText += ` AND bathrooms = $${params.length + 1}`;
      params.push(validatedBathrooms);
    }

    // Validate sale_type (allow any string, but sanitize for SQL injection via parameterized query)
    if (req.query.sale_type && typeof req.query.sale_type === 'string') {
      queryText += ` AND sale_type = $${params.length + 1}`;
      params.push(req.query.sale_type);
    }

    if (validatedYear !== null) {
      queryText += ` AND financial_year = $${params.length + 1}`;
      params.push(validatedYear);
    }

    // Get total count for pagination
    const countQuery = queryText.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    queryText += ` ORDER BY active_month DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(validatedLimit);
    params.push(validatedOffset);

    const result = await query(queryText, params);

    res.json({
      data: result.rows,
      total,
      limit: validatedLimit,
      offset: validatedOffset
    });
  } catch (error) {
    console.error('Property search error:', error);
    res.status(500).json({ error: 'Failed to search properties' });
  }
});

// Test database connection endpoint
app.get('/api/database/test', requireAuth, async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({ connected: isConnected });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

/**
 * Middleware to require cookie-based authentication only (no API keys)
 * Used for admin/mutating endpoints that should not be accessible to external API clients
 */
const requireCookieAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const cookieHeader = req.headers.cookie || '';
    const cookieMatch = cookieHeader.match(/participant_session=([^;]+)/);
    const cookie = cookieMatch ? cookieMatch[1] : null;

    if (!cookie) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'This endpoint requires browser-based authentication. API key access is not permitted.'
      });
    }

    const payload = verifyCookie(cookie);
    if (!payload) {
      return res.status(401).json({
        error: 'Invalid session',
        message: 'Your session is invalid or has expired. Please log in again.'
      });
    }

    // Valid cookie - add participant info to request
    (req as any).participant = payload;
    (req as any).authMethod = 'cookie';
    return next();

  } catch (error) {
    console.error('[cookie-auth] Middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Clear cache endpoint (admin only - cookie auth required)
// SECURITY: API key clients cannot access this endpoint (read-only guarantee)
app.post('/api/cache/clear', requireCookieAuth, async (req, res) => {
  try {
    clearCache();
    clearParticipantsCache();
    res.json({ success: true, message: 'All caches cleared successfully' });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Export for Vercel serverless
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

