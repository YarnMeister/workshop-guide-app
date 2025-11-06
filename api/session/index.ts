import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyCookie } from '../utils/cookies';

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

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ authenticated: false, error: 'Method not allowed' });
  }

  try {
    // Get cookie from request (Vercel parses cookies automatically)
    const cookieHeader = req.headers.cookie || '';
    const cookieMatch = cookieHeader.match(/participant_session=([^;]+)/);
    const cookie = cookieMatch ? cookieMatch[1] : null;

    if (!cookie) {
      return res.status(200).json({ authenticated: false });
    }

    // Verify and decode cookie
    const payload = verifyCookie(cookie);

    if (!payload) {
      return res.status(200).json({ authenticated: false });
    }

    // Return session info (no API key)
    return res.status(200).json({
      authenticated: true,
      participantId: payload.participantId,
      name: payload.name,
    });
  } catch (error) {
    console.error('Session error:', error);
    return res.status(200).json({ authenticated: false });
  }
}

