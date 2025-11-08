import { useState, useEffect, useCallback } from 'react';
import { checkSession } from '@/services/participant';
import { useWorkshopProgress } from '@/hooks/useWorkshopProgress';

interface ParticipantState {
  participantId: string | null;
  name: string | null;
  apiKeyMasked: string | null;
  certId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  apiKey: string | null; // Store revealed key in memory
}

// Module-level flag to prevent multiple simultaneous session checks
let sessionCheckInProgress = false;

export function useParticipant() {
  const { progress, updateProgress } = useWorkshopProgress();
  
  const [state, setState] = useState<ParticipantState>({
    participantId: progress.participantId,
    name: progress.participantName,
    apiKeyMasked: progress.apiKeyMasked,
    certId: progress.certId,
    isAuthenticated: !!progress.participantId && !!progress.participantName,
    isLoading: true,
    apiKey: null, // Never persisted, only in memory
  });

  // Check session on mount only
  useEffect(() => {
    // Prevent multiple simultaneous session checks across all hook instances
    if (sessionCheckInProgress) {
      console.log('[useParticipant] Session check already in progress, skipping');
      return;
    }
    
    sessionCheckInProgress = true;
    console.log('[useParticipant] Starting session check...');
    
    const restoreSession = async () => {
      try {
        // If we have localStorage data, check if session is still valid
        if (progress.participantId && progress.participantName) {
          console.log('[useParticipant] Found localStorage data, checking session...');
          const session = await checkSession();
          console.log('[useParticipant] Session check result:', session);
          if (session.authenticated && session.participantId === progress.participantId) {
            // Session is valid, use existing data
            console.log('[useParticipant] Session valid, restoring from localStorage');
            setState({
              participantId: progress.participantId,
              name: progress.participantName,
              apiKeyMasked: progress.apiKeyMasked,
              certId: session.certId ?? progress.certId,
              isAuthenticated: true,
              isLoading: false,
              apiKey: null,
            });
            // Update progress with certId from session if available
            if (session.certId && session.certId !== progress.certId) {
              updateProgress({ certId: session.certId });
            }
          } else {
            // Session expired or invalid
            console.log('[useParticipant] Session expired or invalid, clearing data');
            setState({
              participantId: null,
              name: null,
              apiKeyMasked: null,
              certId: null,
              isAuthenticated: false,
              isLoading: false,
              apiKey: null,
            });
            // Clear invalid localStorage data
            updateProgress({
              participantId: null,
              participantName: null,
              apiKeyMasked: null,
            });
          }
        } else {
          // No existing data, check for cookie anyway
          console.log('[useParticipant] No localStorage data, checking cookie...');
          const session = await checkSession();
          console.log('[useParticipant] Cookie check result:', session);
          if (session.authenticated && session.participantId && session.name) {
            // We have a valid session but no localStorage data
            console.log('[useParticipant] Cookie valid, restoring from session');
            setState({
              participantId: session.participantId,
              name: session.name,
              apiKeyMasked: null, // Will be set on next claim or reveal
              certId: session.certId ?? null,
              isAuthenticated: true,
              isLoading: false,
              apiKey: null,
            });
            updateProgress({
              participantId: session.participantId,
              participantName: session.name,
              certId: session.certId,
            });
          } else {
            console.log('[useParticipant] No valid session found');
            setState({
              participantId: null,
              name: null,
              apiKeyMasked: null,
              certId: null,
              isAuthenticated: false,
              isLoading: false,
              apiKey: null,
            });
          }
        }
      } catch (error) {
        console.error('[useParticipant] Session check failed:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      } finally {
        sessionCheckInProgress = false;
      }
    };

    restoreSession();
  }, []); // Empty deps - run once on mount only

  const setParticipant = useCallback((participantId: string, name: string, apiKeyMasked: string, certId?: number) => {
    console.log('[useParticipant] Setting participant:', { participantId, name, certId });
    setState({
      participantId,
      name,
      apiKeyMasked,
      certId: certId ?? null,
      isAuthenticated: true,
      isLoading: false,
      apiKey: null, // Reset on new participant
    });
    updateProgress({
      participantId,
      participantName: name,
      apiKeyMasked,
      certId,
    });
  }, [updateProgress]);

  const clearParticipant = useCallback(() => {
    console.log('[useParticipant] Clearing participant');
    setState({
      participantId: null,
      name: null,
      apiKeyMasked: null,
      certId: null,
      isAuthenticated: false,
      isLoading: false,
      apiKey: null,
    });
    updateProgress({
      participantId: null,
      participantName: null,
      apiKeyMasked: null,
      certId: null,
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

