/**
 * Feature flag utilities for role-based access control
 * 
 * Enables splitting the workshop experience into:
 * 1. Pre-workshop access (participants) - limited to Setup Tools page only
 * 2. Full E2E access (facilitators) - complete workshop experience for testing
 */

export type UserRole = 'participant' | 'facilitator';

/**
 * Check if user has access to full workshop experience
 * Facilitators can access all pages for testing and polishing
 */
export function hasFullAccess(role: UserRole | null | undefined): boolean {
  return role === 'facilitator';
}

/**
 * Check if user is limited to pre-workshop setup only
 * Participants can only access Setup Tools page before the workshop
 */
export function isPreWorkshopOnly(role: UserRole | null | undefined): boolean {
  return role === 'participant' || !role;
}

/**
 * Get allowed step IDs for a given role
 * - Participants: Step 1 only (Setup Tools)
 * - Facilitators: All steps (1-8)
 */
export function getAllowedSteps(role: UserRole | null | undefined): number[] {
  if (hasFullAccess(role)) {
    return [1, 2, 3, 4, 5, 6, 7, 8]; // All steps
  }
  return [1]; // Setup Tools only
}

/**
 * Check if a specific step is accessible for a role
 */
export function canAccessStep(stepId: number, role: UserRole | null | undefined): boolean {
  return getAllowedSteps(role).includes(stepId);
}

/**
 * Get the maximum allowed step for a role
 */
export function getMaxAllowedStep(role: UserRole | null | undefined): number {
  const allowedSteps = getAllowedSteps(role);
  return Math.max(...allowedSteps);
}

/**
 * Check if a route is accessible for a role
 * Routes that require full access:
 * - /congrats
 * - /insights
 * - /extend/:optionId
 * - /onboarding/step/2 through /onboarding/step/8
 */
export function canAccessRoute(path: string, role: UserRole | null | undefined): boolean {
  // Always allow welcome page
  if (path === '/' || path === '') {
    return true;
  }

  // Check onboarding steps
  const stepMatch = path.match(/^\/onboarding\/step\/(\d+)/);
  if (stepMatch) {
    const stepId = parseInt(stepMatch[1], 10);
    return canAccessStep(stepId, role);
  }

  // Restricted routes that require full access
  const restrictedRoutes = ['/congrats', '/insights', '/extend'];
  const isRestricted = restrictedRoutes.some(route => path.startsWith(route));
  
  if (isRestricted) {
    return hasFullAccess(role);
  }

  // Allow all other routes by default
  return true;
}

/**
 * Get the redirect path for a restricted route
 * Participants are redirected to Step 1 (Setup Tools)
 */
export function getRedirectPath(role: UserRole | null | undefined): string {
  if (isPreWorkshopOnly(role)) {
    return '/onboarding/step/1';
  }
  return '/';
}

/**
 * Get the appropriate error message for restricted access
 */
export function getAccessDeniedMessage(role: UserRole | null | undefined): string {
  if (isPreWorkshopOnly(role)) {
    return 'This step will be available during the workshop. Please complete the Setup Tools for now.';
  }
  return 'You do not have access to this page.';
}

/**
 * Get the completion message for participants after finishing Step 1
 */
export function getCompletionMessage(role: UserRole | null | undefined): string {
  if (isPreWorkshopOnly(role)) {
    return "Setup Complete! 🎉 You're all set for the workshop. See you on November 13th!";
  }
  return "Step completed! Continue to the next step.";
}

