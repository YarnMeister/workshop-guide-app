import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyCookie } from '../utils/cookies';
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

    // Get cookie from request (Vercel parses cookies automatically)
    const cookieHeader = req.headers.cookie || '';
    const cookieMatch = cookieHeader.match(/participant_session=([^;]+)/);
    const cookie = cookieMatch ? cookieMatch[1] : null;

    if (!cookie) {
      res.status(401).json({ success: false, error: 'Session expired' });
      return;
    }

    // Verify and decode cookie
    const payload = verifyCookie(cookie);

    if (!payload) {
      res.status(401).json({ success: false, error: 'Session expired' });
      return;
    }

    // Lookup participant again to get API key
    const participant = getParticipantByCode(payload.code);

    if (!participant) {
      res.status(404).json({ success: false, error: 'Participant not found' });
      return;
    }

    // Mask API key
    const maskedKey = maskApiKey(participant.apiKey);

    // Return full API key (only this endpoint reveals it)
    res.status(200).json({
      success: true,
      apiKey: participant.apiKey,
      apiKeyMasked: maskedKey,
    });
  } catch (error) {
    console.error('Reveal key error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
