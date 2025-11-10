// Storage key for workshop progress
export const STORAGE_KEY = 'workshop_progress';

// PRD Template structure
export interface PRDAnswers {
  projectOverview: {
    whatBuilding: string;
    whoFor: string;
    problemSolves: string;
  };
  successCriteria: {
    primaryGoal: string;
    howWillKnow: string;
    keyUserActions: string;
  };
  coreFeatures: {
    essential: string;
    niceToHave: string;
  };
  aiComponents: {
    role: string;
    whatShouldDo: string;
    specificBehaviours: string;
  };
  userExperience: {
    keyJourneys: string;
    userInteractions: string;
  };
  uiDesign: {
    visualMood: string;
    designReferences: string;
    keyUIElements: string;
  };
  technicalConsiderations: {
    platform: string;
    integrationNeeds: string;
    dataContent: string;
  };
  constraints: {
    boundaries: string;
  };
  additionalContext: {
    otherDetails: string;
  };
}

// Type definitions
export interface WorkshopProgress {
  participantId: string | null;
  participantName: string | null; // NEW: Participant's name from code lookup
  apiKeyMasked: string | null; // NEW: Masked API key for display (never store full key)
  certId: number | null; // NEW: Certificate ID for participant
  role?: 'participant' | 'facilitator'; // NEW: Role for access control
  currentStepId: number;
  completedPages: number[];
  setupPageTodos: {
    [sectionIndex: number]: boolean;
  };
  writeSpecsTemplate: string;
  writeSpecsOriginal: string; // Store original user input
  prdAnswers: PRDAnswers; // Structured PRD answers
  prototypeTemplate: string;
  aiEnhancementError?: string; // Store any AI error for display
  willUsePropertyData?: boolean | null; // Whether user will use property data in their app
}

// Default PRD answers
const defaultPRDAnswers: PRDAnswers = {
  projectOverview: {
    whatBuilding: '',
    whoFor: '',
    problemSolves: '',
  },
  successCriteria: {
    primaryGoal: '',
    howWillKnow: '',
    keyUserActions: '',
  },
  coreFeatures: {
    essential: '',
    niceToHave: '',
  },
  aiComponents: {
    role: '',
    whatShouldDo: '',
    specificBehaviours: '',
  },
  userExperience: {
    keyJourneys: '',
    userInteractions: '',
  },
  uiDesign: {
    visualMood: '',
    designReferences: '',
    keyUIElements: '',
  },
  technicalConsiderations: {
    platform: '',
    integrationNeeds: '',
    dataContent: '',
  },
  constraints: {
    boundaries: '',
  },
  additionalContext: {
    otherDetails: '',
  },
};

// Default progress state
export const defaultProgress: WorkshopProgress = {
  participantId: null,
  participantName: null,
  apiKeyMasked: null,
  certId: null,
  currentStepId: 1,
  completedPages: [],
  setupPageTodos: {},
  writeSpecsTemplate: '',
  writeSpecsOriginal: '',
  prdAnswers: defaultPRDAnswers,
  prototypeTemplate: '',
  aiEnhancementError: undefined,
};

// Helper functions
export const getStoredProgress = (): WorkshopProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old data structure - ensure prdAnswers exists
      if (!parsed.prdAnswers) {
        parsed.prdAnswers = {
          projectOverview: { whatBuilding: '', whoFor: '', problemSolves: '' },
          successCriteria: { primaryGoal: '', howWillKnow: '', keyUserActions: '' },
          coreFeatures: { essential: '', niceToHave: '' },
          aiComponents: { role: '', whatShouldDo: '', specificBehaviours: '' },
          userExperience: { keyJourneys: '', userInteractions: '' },
          uiDesign: { visualMood: '', designReferences: '', keyUIElements: '' },
          technicalConsiderations: { platform: '', integrationNeeds: '', dataContent: '' },
          constraints: { boundaries: '' },
          additionalContext: { otherDetails: '' },
        };
      }
      // Ensure new fields exist (migration from old storage)
      if (parsed.participantName === undefined) {
        parsed.participantName = null;
      }
      if (parsed.apiKeyMasked === undefined) {
        parsed.apiKeyMasked = null;
      }
      if (parsed.certId === undefined) {
        parsed.certId = null;
      }
      if (parsed.role === undefined) {
        parsed.role = 'participant';
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return defaultProgress;
};

export const saveProgress = (progress: WorkshopProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    console.log('Progress saved:', progress);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const clearProgress = (): void => {
  try {
    // Clear all localStorage keys - comprehensive reset for workshop app
    // This ensures no cached values remain (toggles, PRD inputs, templates, etc.)
    
    // Method 1: Collect all keys first, then remove them
    // This avoids issues with length changing during iteration
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all collected keys
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        console.warn(`[clearProgress] Failed to remove key "${key}":`, err);
      }
    });
    
    // Method 2: Double-check and remove any remaining keys
    // This handles edge cases where keys might have been added during clearing
    const remainingKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        remainingKeys.push(key);
      }
    }
    
    if (remainingKeys.length > 0) {
      console.warn(`[clearProgress] Found ${remainingKeys.length} remaining keys, clearing them:`, remainingKeys);
      remainingKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (err) {
          console.warn(`[clearProgress] Failed to remove remaining key "${key}":`, err);
        }
      });
    }
    
    console.log(`[clearProgress] Successfully cleared localStorage. Initial keys removed: ${keysToRemove.length}, Remaining cleared: ${remainingKeys.length}`);
  } catch (error) {
    console.error('[clearProgress] Error clearing localStorage:', error);
    // Fallback: try to clear known keys even if iteration fails
    try {
      localStorage.removeItem(STORAGE_KEY);
      // Try to clear any remaining keys
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (err) {
          console.warn(`[clearProgress] Fallback failed to remove key "${key}":`, err);
        }
      });
    } catch (fallbackError) {
      console.error('[clearProgress] Error in fallback localStorage clear:', fallbackError);
    }
  }
};
