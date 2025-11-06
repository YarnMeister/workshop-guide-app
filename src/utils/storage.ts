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
    localStorage.removeItem(STORAGE_KEY);
    // Clear all cached Lovable prompts
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('lovablePrompt_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};
