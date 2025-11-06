import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

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

  try {
    const parsed = JSON.parse(participantsJson) as Record<string, { name: string; apiKey: string }>;
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

    participantsCache = parsed;
    return participantsCache;
  } catch (error) {
    console.error('Failed to parse PARTICIPANTS_JSON:', error);
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

// Export for Vercel serverless
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

