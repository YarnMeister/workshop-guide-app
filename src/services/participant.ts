interface ClaimResponse {
  success: boolean;
  participantId?: string;
  name?: string;
  apiKeyMasked?: string;
  certId?: number;
  error?: string;
}

interface SessionResponse {
  authenticated: boolean;
  participantId?: string;
  name?: string;
  certId?: number;
  error?: string;
}

interface RevealKeyResponse {
  success: boolean;
  apiKey?: string;
  apiKeyMasked?: string;
  error?: string;
}

/**
 * Claim a participant code and establish session
 */
export async function claimParticipantCode(code: string): Promise<ClaimResponse> {
  try {
    const response = await fetch('/api/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
      credentials: 'include', // Important: include cookies
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Claim error:', error);
    return {
      success: false,
      error: 'Connection error. Please check your internet and try again.',
    };
  }
}

/**
 * Check current session status
 */
export async function checkSession(): Promise<SessionResponse> {
  try {
    const response = await fetch('/api/session', {
      method: 'GET',
      credentials: 'include', // Important: include cookies
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Session check error:', error);
    return { authenticated: false };
  }
}

/**
 * Reveal full API key (requires valid session)
 */
export async function revealApiKey(): Promise<RevealKeyResponse> {
  try {
    const response = await fetch('/api/reveal-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: include cookies
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Reveal key error:', error);
    return {
      success: false,
      error: 'Failed to retrieve key. Please try again.',
    };
  }
}

/**
 * Logout - clears session cookie
 */
export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: 'Failed to logout. Please try again.',
    };
  }
}

