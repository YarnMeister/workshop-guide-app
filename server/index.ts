import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { query, testConnection } from './database.js';

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

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());

// Environment variables
const COOKIE_SECRET = process.env.COOKIE_SECRET || '';
const COOKIE_NAME = 'participant_session';
const COOKIE_MAX_AGE = 28800; // 8 hours in seconds

// Participant data cache
let participantsCache: Record<string, { name: string; apiKey: string }> | null = null;

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

  // Log diagnostics for production debugging
  console.log(`PARTICIPANTS_JSON length: ${participantsJson.length}`);
  console.log(`PARTICIPANTS_JSON first 50 chars: ${participantsJson.substring(0, 50)}`);
  console.log(`PARTICIPANTS_JSON last 50 chars: ${participantsJson.substring(Math.max(0, participantsJson.length - 50))}`);

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

    // Check if the JSON appears truncated (doesn't end with } or }])
    const trimmed = jsonString.trim();
    if (!trimmed.endsWith('}') && !trimmed.endsWith('}]')) {
      console.error('PARTICIPANTS_JSON appears truncated - does not end with }');
      console.error(`Last 100 chars: ${trimmed.substring(Math.max(0, trimmed.length - 100))}`);
      
      // Try to find where it was truncated (look for incomplete JSON)
      const lastOpeningBrace = trimmed.lastIndexOf('{');
      const lastClosingBrace = trimmed.lastIndexOf('}');
      if (lastOpeningBrace > lastClosingBrace) {
        console.error('PARTICIPANTS_JSON is truncated - unclosed brace detected');
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
    console.error('Failed to parse PARTICIPANTS_JSON:', error);
    if (error instanceof SyntaxError) {
      console.error('JSON parse error. PARTICIPANTS_JSON length:', participantsJson.length);
      console.error('First 200 chars:', participantsJson.substring(0, 200));
      console.error('Last 100 chars:', participantsJson.substring(Math.max(0, participantsJson.length - 100)));
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

function createCookie(payload: { code: string; name: string; participantId: string }): string {
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

function verifyCookie(cookieValue: string): { code: string; name: string; participantId: string } | null {
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

    if (!process.env.PARTICIPANTS_JSON) {
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid code' });
    }

    const participants = loadParticipants();
    const participant = participants[code.trim()];

    if (!participant) {
      return res.status(404).json({ success: false, error: 'Invalid code' });
    }

    const cookiePayload = {
      code: code.trim(),
      name: participant.name,
      participantId: code.trim(),
    };

    const cookie = createCookie(cookiePayload);
    const maskedKey = maskApiKey(participant.apiKey);

    res.setHeader('Set-Cookie', cookie);
    res.status(200).json({
      success: true,
      participantId: code.trim(),
      name: participant.name,
      apiKeyMasked: maskedKey,
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

    if (!process.env.PARTICIPANTS_JSON) {
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const cookieHeader = req.headers.cookie || '';
    const cookieMatch = cookieHeader.match(/participant_session=([^;]+)/);
    const cookie = cookieMatch ? cookieMatch[1] : null;

    if (!cookie) {
      return res.status(401).json({ success: false, error: 'Session expired' });
    }

    const payload = verifyCookie(cookie);
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Session expired' });
    }

    const participants = loadParticipants();
    const participant = participants[payload.code];

    if (!participant) {
      return res.status(404).json({ success: false, error: 'Participant not found' });
    }

    const maskedKey = maskApiKey(participant.apiKey);

    res.status(200).json({
      success: true,
      apiKey: participant.apiKey,
      apiKeyMasked: maskedKey,
    });
  } catch (error) {
    console.error('Reveal key error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    env: {
      hasCookieSecret: !!COOKIE_SECRET,
      hasParticipantsJson: !!process.env.PARTICIPANTS_JSON,
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

// Middleware to check authentication for protected routes
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const cookieHeader = req.headers.cookie || '';
    const cookieMatch = cookieHeader.match(/participant_session=([^;]+)/);
    const cookie = cookieMatch ? cookieMatch[1] : null;

    if (!cookie) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = verifyCookie(cookie);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Add participant info to request for use in handlers
    (req as any).participant = payload;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Database insights endpoints

// Get suburb insights
app.get('/api/insights/suburbs', requireAuth, async (req, res) => {
  try {
    const { state, limit = 20 } = req.query;
    
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
    if (state) {
      queryText += ` AND state = $${params.length + 1}`;
      params.push(state);
    }
    
    queryText += `
      GROUP BY suburb 
      HAVING COUNT(*) >= 5
      ORDER BY total_sales DESC 
      LIMIT $${params.length + 1}
    `;
    params.push(parseInt(limit as string));

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Suburb insights error:', error);
    res.status(500).json({ error: 'Failed to fetch suburb insights' });
  }
});

// Get property type insights
app.get('/api/insights/property-types', requireAuth, async (req, res) => {
  try {
    const { state } = req.query;
    
    let queryText = `
      WITH total_sales AS (
        SELECT COUNT(*) as total_count 
        FROM property_sales 
        WHERE price_search_sold > 0
    `;
    
    const params: any[] = [];
    if (state) {
      queryText += ` AND state = $${params.length + 1}`;
      params.push(state);
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
    
    if (state) {
      queryText += ` AND state = $${params.length}`;
    }
    
    queryText += `
      GROUP BY property_type, total_sales.total_count
      ORDER BY total_sales DESC
    `;

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Property type insights error:', error);
    res.status(500).json({ error: 'Failed to fetch property type insights' });
  }
});

// Get price trends over time
app.get('/api/insights/price-trends', requireAuth, async (req, res) => {
  try {
    const { state, property_type, months = 12 } = req.query;
    
    let queryText = `
      SELECT 
        TO_CHAR(active_month, 'YYYY-MM') as month,
        ROUND(AVG(price_search_sold)::numeric, 0) as avg_price,
        COUNT(*) as total_sales
      FROM property_sales 
      WHERE price_search_sold > 0 
        AND active_month >= NOW() - INTERVAL '${parseInt(months as string)} months'
    `;
    
    const params: any[] = [];
    if (state) {
      queryText += ` AND state = $${params.length + 1}`;
      params.push(state);
    }
    
    if (property_type) {
      queryText += ` AND property_type = $${params.length + 1}`;
      params.push(property_type);
    }
    
    queryText += `
      GROUP BY TO_CHAR(active_month, 'YYYY-MM')
      ORDER BY month DESC
    `;

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Price trends error:', error);
    res.status(500).json({ error: 'Failed to fetch price trends' });
  }
});

// Get sale type insights
app.get('/api/insights/sale-types', requireAuth, async (req, res) => {
  try {
    const { state } = req.query;
    
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
    if (state) {
      queryText += ` AND state = $${params.length + 1}`;
      params.push(state);
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

// Get market statistics
app.get('/api/insights/market-stats', requireAuth, async (req, res) => {
  try {
    const { state } = req.query;
    
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
    if (state) {
      queryText += ` AND state = $${params.length + 1}`;
      params.push(state);
    }

    const result = await query(queryText, params);
    const stats = result.rows[0];
    
    res.json({
      total_sales: parseInt(stats.total_sales),
      avg_price: parseInt(stats.avg_price),
      median_price: parseInt(stats.median_price),
      total_suburbs: parseInt(stats.total_suburbs),
      price_range: {
        min: parseInt(stats.min_price),
        max: parseInt(stats.max_price)
      },
      most_active_month: stats.most_active_month
    });
  } catch (error) {
    console.error('Market stats error:', error);
    res.status(500).json({ error: 'Failed to fetch market stats' });
  }
});

// Search properties with filters
app.get('/api/properties/search', requireAuth, async (req, res) => {
  try {
    const {
      state,
      suburb,
      property_type,
      min_price,
      max_price,
      bedrooms,
      bathrooms,
      sale_type,
      year,
      limit = 50,
      offset = 0
    } = req.query;

    let queryText = `
      SELECT *
      FROM property_sales 
      WHERE price_search_sold > 0
    `;
    
    const params: any[] = [];
    
    if (state) {
      queryText += ` AND state = $${params.length + 1}`;
      params.push(state);
    }
    
    if (suburb) {
      queryText += ` AND suburb ILIKE $${params.length + 1}`;
      params.push(`%${suburb}%`);
    }
    
    if (property_type) {
      queryText += ` AND property_type = $${params.length + 1}`;
      params.push(property_type);
    }
    
    if (min_price) {
      queryText += ` AND price_search_sold >= $${params.length + 1}`;
      params.push(parseInt(min_price as string));
    }
    
    if (max_price) {
      queryText += ` AND price_search_sold <= $${params.length + 1}`;
      params.push(parseInt(max_price as string));
    }
    
    if (bedrooms) {
      queryText += ` AND bedrooms = $${params.length + 1}`;
      params.push(parseInt(bedrooms as string));
    }
    
    if (bathrooms) {
      queryText += ` AND bathrooms = $${params.length + 1}`;
      params.push(parseInt(bathrooms as string));
    }
    
    if (sale_type) {
      queryText += ` AND sale_type = $${params.length + 1}`;
      params.push(sale_type);
    }
    
    if (year) {
      queryText += ` AND financial_year = $${params.length + 1}`;
      params.push(parseInt(year as string));
    }

    // Get total count for pagination
    const countQuery = queryText.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    queryText += ` ORDER BY active_month DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit as string));
    params.push(parseInt(offset as string));

    const result = await query(queryText, params);
    
    res.json({
      data: result.rows,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
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

// Export for Vercel serverless
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

