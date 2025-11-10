import { useState, useEffect, useCallback } from 'react';
import { WorkshopProgress, getStoredProgress, saveProgress, clearProgress, defaultProgress } from '@/utils/storage';

export const useWorkshopProgress = () => {
  // Initialize with stored progress immediately to avoid race conditions
  const [progress, setProgress] = useState<WorkshopProgress>(() => getStoredProgress());

  // Update progress and save to localStorage
  const updateProgress = useCallback((updates: Partial<WorkshopProgress>) => {
    setProgress(current => {
      const newProgress = { ...current, ...updates };
      saveProgress(newProgress);
      return newProgress;
    });
  }, []);

  // Update a specific todo item
  const updateTodoStatus = useCallback((sectionIndex: number, completed: boolean) => {
    setProgress(current => {
      const newProgress = {
        ...current,
        setupPageTodos: {
          ...current.setupPageTodos,
          [sectionIndex]: completed,
        },
      };
      saveProgress(newProgress);
      return newProgress;
    });
  }, []);

  // Clear all progress
  const resetProgress = useCallback(() => {
    clearProgress();
    setProgress(defaultProgress);
  }, []);

  return {
    progress,
    updateProgress,
    updateTodoStatus,
    resetProgress,
  };
};
