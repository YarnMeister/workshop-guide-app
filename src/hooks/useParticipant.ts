import { useState, useEffect, useCallback } from 'react';
import { checkSession } from '@/services/participant';
import { useWorkshopProgress } from '@/hooks/useWorkshopProgress';

interface ParticipantState {
  participantId: string | null;
  name: string | null;
  apiKeyMasked: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  apiKey: string | null; // Store revealed key in memory
}

export function useParticipant() {
  const { progress, updateProgress } = useWorkshopProgress();
  const [state, setState] = useState<ParticipantState>({
    participantId: progress.participantId,
    name: progress.participantName,
    apiKeyMasked: progress.apiKeyMasked,
    isAuthenticated: !!progress.participantId && !!progress.participantName,
    isLoading: true,
    apiKey: null, // Never persisted, only in memory
  });

  // Check session on mount only
  useEffect(() => {
    const restoreSession = async () => {
      // If we have localStorage data, check if session is still valid
      if (progress.participantId && progress.participantName) {
        try {
          const session = await checkSession();
          if (session.authenticated && session.participantId === progress.participantId) {
            // Session is valid, use existing data
            setState({
              participantId: progress.participantId,
              name: progress.participantName,
              apiKeyMasked: progress.apiKeyMasked,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Session expired or invalid
            setState({
              participantId: null,
              name: null,
              apiKeyMasked: null,
              isAuthenticated: false,
              isLoading: false,
            });
            // Clear invalid localStorage data
            updateProgress({
              participantId: null,
              participantName: null,
              apiKeyMasked: null,
            });
          }
        } catch (error) {
          console.error('Session check failed:', error);
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        // No existing data, check for cookie anyway
        try {
          const session = await checkSession();
          if (session.authenticated && session.participantId && session.name) {
            // We have a valid session but no localStorage data
            // This shouldn't happen normally, but handle it gracefully
            setState({
              participantId: session.participantId,
              name: session.name,
              apiKeyMasked: null, // Will be set on next claim or reveal
              isAuthenticated: true,
              isLoading: false,
            });
            updateProgress({
              participantId: session.participantId,
              participantName: session.name,
            });
          } else {
            setState({
              participantId: null,
              name: null,
              apiKeyMasked: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Session check failed:', error);
          setState({
            participantId: null,
            name: null,
            apiKeyMasked: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    };

    restoreSession();
  }, []); // Empty deps - run once on mount only

  const setParticipant = useCallback((participantId: string, name: string, apiKeyMasked: string) => {
    setState({
      participantId,
      name,
      apiKeyMasked,
      isAuthenticated: true,
      isLoading: false,
      apiKey: null, // Reset on new participant
    });
    updateProgress({
      participantId,
      participantName: name,
      apiKeyMasked,
    });
  }, [updateProgress]);

  const clearParticipant = useCallback(() => {
    setState({
      participantId: null,
      name: null,
      apiKeyMasked: null,
      isAuthenticated: false,
      isLoading: false,
      apiKey: null,
    });
    updateProgress({
      participantId: null,
      participantName: null,
      apiKeyMasked: null,
    });
  }, [updateProgress]);

  const setApiKey = useCallback((apiKey: string) => {
    setState(prev => ({ ...prev, apiKey }));
  }, []);

  return {
    ...state,
    setParticipant,
    clearParticipant,
    setApiKey,
  };
}

