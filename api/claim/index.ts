import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createCookie, verifyCookie } from '../utils/cookies';
import { getParticipantByCode } from '../utils/participants';
import { maskApiKey } from '../utils/maskApiKey';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    // Check environment variables
    if (!process.env.COOKIE_SECRET) {
      console.error('COOKIE_SECRET environment variable not set');
      res.status(500).json({ success: false, error: 'Server configuration error' });
      return;
    }

    if (!process.env.PARTICIPANTS_JSON) {
      console.error('PARTICIPANTS_JSON environment variable not set');
      res.status(500).json({ success: false, error: 'Server configuration error' });
      return;
    }

    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, error: 'Invalid code' });
      return;
    }

    // Lookup participant (case-sensitive, exact match)
    const participant = getParticipantByCode(code.trim());

    if (!participant) {
      res.status(404).json({ success: false, error: 'Invalid code' });
      return;
    }

    // Create signed cookie with minimal data
    const cookiePayload = {
      code: code.trim(),
      name: participant.name,
      participantId: code.trim(), // Use code as participantId
    };

    const cookie = createCookie(cookiePayload);

    // Mask API key (show first 8 chars)
    const maskedKey = maskApiKey(participant.apiKey);

    // Set cookie
    res.setHeader('Set-Cookie', cookie);

    // Return success response (never return full API key)
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
}
