import { useState, useEffect, useCallback } from 'react';
import { checkSession } from '@/services/participant';
import { useWorkshopProgress } from '@/hooks/useWorkshopProgress';
import type { UserRole } from '@/utils/featureFlags';

interface ParticipantState {
  participantId: string | null;
  name: string | null;
  apiKeyMasked: string | null;
  certId: number | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  apiKey: string | null; // Store revealed key in memory
}

// Module-level flag to prevent multiple simultaneous session checks
let sessionCheckInProgress = false;

export function useParticipant() {
  const { progress, updateProgress } = useWorkshopProgress();

  const [state, setState] = useState<ParticipantState>({
    participantId: null,
    name: null,
    apiKeyMasked: null,
    certId: null,
    role: null,
    isAuthenticated: false,
    isLoading: true,
    apiKey: null, // Never persisted, only in memory
  });

  // Sync state with progress changes
  useEffect(() => {
    console.log('[useParticipant] Progress changed:', progress);
    if (progress.participantId && progress.participantName) {
      console.log('[useParticipant] Updating state from progress, role:', progress.role);
      setState(prev => ({
        ...prev,
        participantId: progress.participantId,
        name: progress.participantName,
        apiKeyMasked: progress.apiKeyMasked,
        certId: progress.certId,
        role: progress.role || null,
        isAuthenticated: true,
      }));
    } else {
      console.log('[useParticipant] Progress has no participant data, skipping state update');
    }
  }, [progress.participantId, progress.participantName, progress.apiKeyMasked, progress.certId, progress.role]);

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
          console.log('[useParticipant] Session certId:', session.certId);
          console.log('[useParticipant] Progress certId:', progress.certId);
          if (session.authenticated && session.participantId === progress.participantId) {
            // Session is valid, use existing data
            console.log('[useParticipant] Session valid, restoring from localStorage');
            const finalCertId = session.certId ?? progress.certId;
            console.log('[useParticipant] Final certId to use:', finalCertId);
            setState({
              participantId: progress.participantId,
              name: progress.participantName,
              apiKeyMasked: progress.apiKeyMasked,
              certId: finalCertId,
              role: session.role || progress.role || 'participant',
              isAuthenticated: true,
              isLoading: false,
              apiKey: null,
            });
            // Update progress with certId and role from session if available
            if (session.certId && session.certId !== progress.certId) {
              console.log('[useParticipant] Updating progress with certId from session:', session.certId);
              updateProgress({ certId: session.certId });
            }
            if (session.role && session.role !== progress.role) {
              console.log('[useParticipant] Updating progress with role from session:', session.role);
              updateProgress({ role: session.role });
            }
          } else {
            // Session expired or invalid
            console.log('[useParticipant] Session expired or invalid, clearing data');
            setState({
              participantId: null,
              name: null,
              apiKeyMasked: null,
              certId: null,
              role: null,
              isAuthenticated: false,
              isLoading: false,
              apiKey: null,
            });
            // Clear invalid localStorage data
            updateProgress({
              participantId: null,
              participantName: null,
              apiKeyMasked: null,
              role: null,
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
              role: session.role || 'participant',
              isAuthenticated: true,
              isLoading: false,
              apiKey: null,
            });
            updateProgress({
              participantId: session.participantId,
              participantName: session.name,
              certId: session.certId,
              role: session.role,
            });
          } else {
            console.log('[useParticipant] No valid session found');
            setState({
              participantId: null,
              name: null,
              apiKeyMasked: null,
              certId: null,
              role: null,
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

  const setParticipant = useCallback((participantId: string, name: string, apiKeyMasked: string, certId?: number, role?: UserRole) => {
    console.log('[useParticipant] Setting participant:', { participantId, name, certId, role });
    setState({
      participantId,
      name,
      apiKeyMasked,
      certId: certId ?? null,
      role: role || 'participant',
      isAuthenticated: true,
      isLoading: false,
      apiKey: null, // Reset on new participant
    });
    updateProgress({
      participantId,
      participantName: name,
      apiKeyMasked,
      certId,
      role: role || 'participant',
    });
  }, [updateProgress]);

  const clearParticipant = useCallback(() => {
    console.log('[useParticipant] Clearing participant');
    setState({
      participantId: null,
      name: null,
      apiKeyMasked: null,
      certId: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      apiKey: null,
    });
    updateProgress({
      participantId: null,
      participantName: null,
      apiKeyMasked: null,
      certId: null,
      role: null,
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

