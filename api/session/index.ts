import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyCookie } from '../utils/cookies';

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

  // Only allow GET
  if (req.method !== 'GET') {
    res.status(405).json({ authenticated: false, error: 'Method not allowed' });
    return;
  }

  try {
    // Check environment variables
    if (!process.env.COOKIE_SECRET) {
      console.error('COOKIE_SECRET environment variable not set');
      res.status(200).json({ authenticated: false });
      return;
    }

    // Get cookie from request (Vercel parses cookies automatically)
    const cookieHeader = req.headers.cookie || '';
    const cookieMatch = cookieHeader.match(/participant_session=([^;]+)/);
    const cookie = cookieMatch ? cookieMatch[1] : null;

    if (!cookie) {
      res.status(200).json({ authenticated: false });
      return;
    }

    // Verify and decode cookie
    const payload = verifyCookie(cookie);

    if (!payload) {
      res.status(200).json({ authenticated: false });
      return;
    }

    // Return session info (no API key)
    res.status(200).json({
      authenticated: true,
      participantId: payload.participantId,
      name: payload.name,
    });
  } catch (error) {
    console.error('Session error:', error);
    res.status(200).json({ authenticated: false });
  }
}
