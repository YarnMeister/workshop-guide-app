// Storage key for workshop progress
export const STORAGE_KEY = 'workshop_progress';

// Type definitions
export interface WorkshopProgress {
  participantId: string | null;
  currentStepId: number;
  completedPages: number[];
  setupPageTodos: {
    [sectionIndex: number]: boolean;
  };
  writeSpecsTemplate: string;
  writeSpecsOriginal: string; // Store original user input
  prototypeTemplate: string;
  aiEnhancementError?: string; // Store any AI error for display
}

// Default progress state
export const defaultProgress: WorkshopProgress = {
  participantId: null,
  currentStepId: 1,
  completedPages: [],
  setupPageTodos: {},
  writeSpecsTemplate: '',
  writeSpecsOriginal: '',
  prototypeTemplate: '',
  aiEnhancementError: undefined,
};

// Helper functions
export const getStoredProgress = (): WorkshopProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
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
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};
