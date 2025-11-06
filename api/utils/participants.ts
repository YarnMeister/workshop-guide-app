interface Participant {
  name: string;
  apiKey: string;
}

interface ParticipantsMap {
  [code: string]: Participant;
}

let participantsCache: ParticipantsMap | null = null;

/**
 * Load and parse PARTICIPANTS_JSON from environment variable
 */
function loadParticipants(): ParticipantsMap {
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
    // Parse single-line JSON string
    const parsed = JSON.parse(participantsJson) as ParticipantsMap;
    
    // Validate structure
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Invalid PARTICIPANTS_JSON format');
    }

    // Validate participant data structure
    for (const [code, participant] of Object.entries(parsed)) {
      if (!participant || typeof participant !== 'object') {
        console.error(`Invalid participant data for code: ${code} - not an object`);
        delete parsed[code];
        continue;
      }
      
      if (!participant.name || typeof participant.name !== 'string') {
        console.error(`Invalid participant data for code: ${code} - missing or invalid name`);
        delete parsed[code];
        continue;
      }
      
      if (!participant.apiKey || typeof participant.apiKey !== 'string') {
        console.error(`Invalid participant data for code: ${code} - missing or invalid apiKey`);
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

/**
 * Get participant by code (case-sensitive, exact match)
 */
export function getParticipantByCode(code: string): Participant | null {
  const participants = loadParticipants();
  
  // Case-sensitive exact match
  if (participants[code]) {
    return participants[code];
  }

  return null;
}

/**
 * Clear participants cache (useful for testing)
 */
export function clearParticipantsCache(): void {
  participantsCache = null;
}

