import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ 
      success: true, 
      message: 'API is working',
      env: {
        hasCookieSecret: !!process.env.COOKIE_SECRET,
        hasParticipantsJson: !!process.env.PARTICIPANTS_JSON,
      }
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

