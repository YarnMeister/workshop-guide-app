import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyCookie } from '../utils/cookies';
import { getParticipantByCode } from '../utils/participants';
import { maskApiKey } from '../utils/maskApiKey';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get cookie from request (Vercel parses cookies automatically)
    const cookieHeader = req.headers.cookie || '';
    const cookieMatch = cookieHeader.match(/participant_session=([^;]+)/);
    const cookie = cookieMatch ? cookieMatch[1] : null;

    if (!cookie) {
      return res.status(401).json({ success: false, error: 'Session expired' });
    }

    // Verify and decode cookie
    const payload = verifyCookie(cookie);

    if (!payload) {
      return res.status(401).json({ success: false, error: 'Session expired' });
    }

    // Lookup participant again to get API key
    const participant = getParticipantByCode(payload.code);

    if (!participant) {
      return res.status(404).json({ success: false, error: 'Participant not found' });
    }

    // Mask API key
    const maskedKey = maskApiKey(participant.apiKey);

    // Return full API key (only this endpoint reveals it)
    return res.status(200).json({
      success: true,
      apiKey: participant.apiKey,
      apiKeyMasked: maskedKey,
    });
  } catch (error) {
    console.error('Reveal key error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

