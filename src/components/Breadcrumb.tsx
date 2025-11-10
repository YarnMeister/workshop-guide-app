import { Check, RotateCcw, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkshopProgress } from "@/hooks/useWorkshopProgress";
import { useParticipant } from "@/hooks/useParticipant";
import { logout } from "@/services/participant";
import { toast } from "@/hooks/use-toast";
import { clearProgress } from "@/utils/storage";
import { canAccessStep, isPreWorkshopOnly } from "@/utils/featureFlags";

export interface Step {
  id: number;
  title: string;
  description: string;
}

interface BreadcrumbProps {
  steps: Step[];
  currentStep: number;
}

export const Breadcrumb = ({ steps, currentStep }: BreadcrumbProps) => {
  const { resetProgress } = useWorkshopProgress();
  const { clearParticipant, role } = useParticipant();

  // Filter steps based on role
  const visibleSteps = steps.filter(step => canAccessStep(step.id, role));

  const handleClearProgress = async () => {
    if (confirm("Are you sure you want to clear all progress and start over?")) {
      console.log('[Breadcrumb] Clearing all progress...');
      
      try {
        // Clear session cookie on server
        await logout();
        console.log('[Breadcrumb] Session cookie cleared');
      } catch (error) {
        console.error('[Breadcrumb] Error clearing session:', error);
      }
      
      // Clear ALL localStorage keys - do this directly to ensure it happens
      // We don't need to update React state since we're reloading anyway
      clearProgress();
      console.log('[Breadcrumb] localStorage cleared, reloading...');
      
      // Verify localStorage is empty before reloading
      const remainingKeys = Object.keys(localStorage);
      if (remainingKeys.length > 0) {
        console.warn('[Breadcrumb] Warning: Some localStorage keys remain:', remainingKeys);
        // Force clear again
        remainingKeys.forEach(key => localStorage.removeItem(key));
      }
      
      // Force a hard reload immediately - this will reset all React state
      // Use replace instead of href to avoid adding to browser history
      window.location.replace('/');
    }
  };

  return (
    <nav className="fixed left-0 top-16 bottom-0 w-64 border-r bg-background p-6 overflow-y-auto">
      <div className="flex flex-col h-full">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">
            ONBOARDING PROGRESS
          </h2>
          <ol className="relative">
          {visibleSteps.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isUpcoming = step.id > currentStep;

            return (
              <li key={step.id} className="relative animate-slide-in-left mb-5" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-start gap-4">
                  {/* Step indicator */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-semibold transition-all relative z-10",
                      isCompleted && "border-primary bg-primary text-primary-foreground",
                      isCurrent && "border-primary bg-background text-primary shadow-lg shadow-primary/20",
                      isUpcoming && "border-muted bg-background text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm">{step.id}</span>
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pt-1 min-h-[2.5rem]">
                    <h3
                      className={cn(
                        "font-semibold text-sm leading-tight transition-colors",
                        isCurrent && "text-foreground",
                        (isCompleted || isUpcoming) && "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-tight">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connecting line - extends from bottom of circle to top of next circle */}
                {index < visibleSteps.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-5 top-10 w-0.5 transition-colors",
                      isCompleted ? "bg-primary" : "bg-border"
                    )}
                    style={{ height: 'calc(3rem + 2.4px)' }}
                  />
                )}
              </li>
            );
          })}
          </ol>

          {/* Show "Coming Soon" indicator for participants */}
          {isPreWorkshopOnly(role) && (
            <div className="mt-6 text-muted-foreground text-sm p-4 bg-muted/50 rounded-lg">
              <Info className="h-4 w-4 inline mr-2" />
              More steps coming soon! Complete the setup to be ready for the workshop.
            </div>
          )}
        </div>
        
        {/* Clear progress link at the bottom */}
        <div className="mt-auto pt-8">
          <button
            onClick={handleClearProgress}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Clear progress
          </button>
        </div>
      </div>
    </nav>
  );
};
