import crypto from 'crypto';

interface CookiePayload {
  code: string;
  name: string;
  participantId: string;
}

const COOKIE_SECRET = process.env.COOKIE_SECRET || '';
const COOKIE_NAME = 'participant_session';
const COOKIE_MAX_AGE = 28800; // 8 hours in seconds

if (!COOKIE_SECRET) {
  console.warn('COOKIE_SECRET not set. Cookie signing will fail.');
}

/**
 * Create a signed cookie with participant data
 */
export function createCookie(payload: CookiePayload): string {
  if (!COOKIE_SECRET) {
    throw new Error('COOKIE_SECRET not configured');
  }

  // Create a JSON string of the payload
  const data = JSON.stringify(payload);
  
  // Create HMAC signature
  const signature = crypto
    .createHmac('sha256', COOKIE_SECRET)
    .update(data)
    .digest('hex');

  // Encode payload and signature
  const encoded = Buffer.from(data).toString('base64url');
  const signedValue = `${encoded}.${signature}`;

  // Build cookie string
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

/**
 * Verify and decode a signed cookie
 */
export function verifyCookie(cookieValue: string): CookiePayload | null {
  if (!COOKIE_SECRET) {
    return null;
  }

  try {
    // Parse cookie value (format: encoded.signature)
    const [encoded, signature] = cookieValue.split('.');

    if (!encoded || !signature) {
      return null;
    }

    // Decode payload
    const data = Buffer.from(encoded, 'base64url').toString('utf-8');

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', COOKIE_SECRET)
      .update(data)
      .digest('hex');

    if (signature !== expectedSignature) {
      return null; // Signature mismatch
    }

    // Parse and return payload
    return JSON.parse(data) as CookiePayload;
  } catch (error) {
    console.error('Cookie verification error:', error);
    return null;
  }
}

