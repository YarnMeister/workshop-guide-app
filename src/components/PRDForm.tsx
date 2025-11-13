import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import { PRDAnswers } from "@/utils/storage";
import { sanitizeInput, checkSanitizationImpact } from "@/utils/textSanitizer";
import { useToast } from "@/hooks/use-toast";

interface PRDFormProps {
  answers: PRDAnswers;
  onUpdate: (answers: PRDAnswers) => void;
}

export const PRDForm = ({ answers, onUpdate }: PRDFormProps) => {
  const [localAnswers, setLocalAnswers] = useState<PRDAnswers>(answers);
  const { toast } = useToast();

  // Update local state when answers prop changes
  useEffect(() => {
    setLocalAnswers(answers);
  }, [answers]);

  const updateAnswer = (section: keyof PRDAnswers, field: string, value: string) => {
    // Sanitize input to remove markdown formatting from pasted content
    const sanitizedValue = sanitizeInput(value);

    // Check if significant content was removed during sanitization
    const { shouldWarn, percentRemoved } = checkSanitizationImpact(value, sanitizedValue);

    // Show warning if mostly formatting was pasted with little actual content
    if (shouldWarn && value.length > 20) {
      toast({
        title: "Formatting Removed",
        description: `Cleaned ${percentRemoved}% formatting from pasted text. Please ensure your answer contains meaningful content.`,
        variant: "default",
      });
    }

    const newAnswers = {
      ...localAnswers,
      [section]: {
        ...localAnswers[section],
        [field]: sanitizedValue,
      },
    };
    setLocalAnswers(newAnswers);
    onUpdate(newAnswers);
  };

  // Check if a section is complete (has at least one field filled)
  const isSectionComplete = (section: keyof PRDAnswers): boolean => {
    const sectionData = localAnswers[section];
    return Object.values(sectionData).some((value) => value.trim().length > 0);
  };

  return (
    <div className="mb-8 space-y-6">
      {/* PRD Form Accordion */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-6 text-2xl font-bold">Define Prototype requirements</h2>
        <Accordion type="multiple" className="w-full">
          {/* Project Overview */}
          <AccordionItem value="project-overview">
            <AccordionTrigger className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Project Overview</span>
                {isSectionComplete("projectOverview") && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4 pb-2">
              <div className="space-y-2 p-1">
                <Label htmlFor="what-building" className="font-medium text-sm">
                  What are you building?
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Brief description of your prototype idea
                </p>
                <Textarea
                  id="what-building"
                  value={localAnswers.projectOverview.whatBuilding}
                  onChange={(e) =>
                    updateAnswer("projectOverview", "whatBuilding", e.target.value)
                  }
                  placeholder="E.g., A task management app for remote teams..."
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="space-y-2 p-1">
                <Label htmlFor="who-for" className="font-medium text-sm">
                  Who is this for?
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Your target user or audience
                </p>
                <Textarea
                  id="who-for"
                  value={localAnswers.projectOverview.whoFor}
                  onChange={(e) =>
                    updateAnswer("projectOverview", "whoFor", e.target.value)
                  }
                  placeholder="E.g., Small business owners, remote teams..."
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="space-y-2 p-1">
                <Label htmlFor="problem-solves" className="font-medium text-sm">
                  What problem does it solve?
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  The core need or pain point this addresses
                </p>
                <Textarea
                  id="problem-solves"
                  value={localAnswers.projectOverview.problemSolves}
                  onChange={(e) =>
                    updateAnswer("projectOverview", "problemSolves", e.target.value)
                  }
                  placeholder="E.g., Teams struggle to track tasks across time zones..."
                  className="min-h-[80px] resize-none"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Success Criteria */}
          <AccordionItem value="success-criteria">
            <AccordionTrigger className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Success Criteria</span>
                {isSectionComplete("successCriteria") && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4 pb-2">
              <div className="space-y-2 p-1">
                <Label htmlFor="primary-goal" className="font-medium text-sm">
                  What does success look like?
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Primary goal or outcome you're aiming for
                </p>
                <Textarea
                  id="primary-goal"
                  value={localAnswers.successCriteria.primaryGoal}
                  onChange={(e) =>
                    updateAnswer("successCriteria", "primaryGoal", e.target.value)
                  }
                  placeholder="E.g., Users can create and track tasks in under 30 seconds..."
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="space-y-2 p-1">
                <Label htmlFor="how-will-know" className="font-medium text-sm">
                  How will you know this prototype is working well?
                </Label>
                <Textarea
                  id="how-will-know"
                  value={localAnswers.successCriteria.howWillKnow}
                  onChange={(e) =>
                    updateAnswer("successCriteria", "howWillKnow", e.target.value)
                  }
                  placeholder="E.g., Users complete onboarding without help..."
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="space-y-2 p-1">
                <Label htmlFor="key-user-actions" className="font-medium text-sm">
                  Key user actions or behaviours you want to enable
                </Label>
                <Textarea
                  id="key-user-actions"
                  value={localAnswers.successCriteria.keyUserActions}
                  onChange={(e) =>
                    updateAnswer("successCriteria", "keyUserActions", e.target.value)
                  }
                  placeholder="E.g., Create tasks, assign team members, set deadlines..."
                  className="min-h-[120px] resize-none"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Core Features */}
          <AccordionItem value="core-features">
            <AccordionTrigger className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Core Features & Functionality</span>
                {isSectionComplete("coreFeatures") && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4 pb-2">
              <div className="space-y-2 p-1">
                <Label htmlFor="essential-features" className="font-medium text-sm">
                  Essential features needed for this prototype to work
                </Label>
                <Textarea
                  id="essential-features"
                  value={localAnswers.coreFeatures.essential}
                  onChange={(e) =>
                    updateAnswer("coreFeatures", "essential", e.target.value)
                  }
                  placeholder="E.g., Task creation, user authentication, task list view..."
                  className="min-h-[120px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nice-to-have" className="font-medium text-sm">
                  Nice-to-have features
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Features that could enhance the experience but aren't critical for v1
                </p>
                <Textarea
                  id="nice-to-have"
                  value={localAnswers.coreFeatures.niceToHave}
                  onChange={(e) =>
                    updateAnswer("coreFeatures", "niceToHave", e.target.value)
                  }
                  placeholder="E.g., Dark mode, keyboard shortcuts, mobile app..."
                  className="min-h-[120px] resize-none"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* AI Components */}
          <AccordionItem value="ai-components">
            <AccordionTrigger className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>AI/Intelligence Components</span>
                {isSectionComplete("aiComponents") && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4 pb-2">
              <div className="space-y-2 p-1">
                <Label htmlFor="ai-role" className="font-medium text-sm">
                  What role does AI play in the user experience?
                </Label>
                <Textarea
                  id="ai-role"
                  value={localAnswers.aiComponents.role}
                  onChange={(e) =>
                    updateAnswer("aiComponents", "role", e.target.value)
                  }
                  placeholder="E.g., AI suggests task priorities based on deadlines..."
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-should-do" className="font-medium text-sm">
                  What should the AI do or help users accomplish?
                </Label>
                <Textarea
                  id="ai-should-do"
                  value={localAnswers.aiComponents.whatShouldDo}
                  onChange={(e) =>
                    updateAnswer("aiComponents", "whatShouldDo", e.target.value)
                  }
                  placeholder="E.g., Automatically categorize tasks, suggest deadlines..."
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-behaviours" className="font-medium text-sm">
                  Any specific AI behaviours or capabilities needed?
                </Label>
                <Textarea
                  id="ai-behaviours"
                  value={localAnswers.aiComponents.specificBehaviours}
                  onChange={(e) =>
                    updateAnswer("aiComponents", "specificBehaviours", e.target.value)
                  }
                  placeholder="E.g., Natural language understanding, pattern recognition..."
                  className="min-h-[80px] resize-none"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* User Experience */}
          <AccordionItem value="user-experience">
            <AccordionTrigger className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>User Experience & Flow</span>
                {isSectionComplete("userExperience") && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4 pb-2">
              <div className="space-y-2 p-1">
                <Label htmlFor="key-journeys" className="font-medium text-sm">
                  Key user journeys
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Describe the main path users will take through your prototype
                </p>
                <Textarea
                  id="key-journeys"
                  value={localAnswers.userExperience.keyJourneys}
                  onChange={(e) =>
                    updateAnswer("userExperience", "keyJourneys", e.target.value)
                  }
                  placeholder="E.g., User signs up → Creates first task → Invites team member → Views dashboard..."
                  className="min-h-[120px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-interactions" className="font-medium text-sm">
                  User interactions
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  How do users interact with the prototype?
                </p>
                <Textarea
                  id="user-interactions"
                  value={localAnswers.userExperience.userInteractions}
                  onChange={(e) =>
                    updateAnswer("userExperience", "userInteractions", e.target.value)
                  }
                  placeholder="E.g., Click buttons, drag and drop tasks, type in forms..."
                  className="min-h-[120px] resize-none"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* UI Design */}
          <AccordionItem value="ui-design">
            <AccordionTrigger className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>UI/Design Direction</span>
                {isSectionComplete("uiDesign") && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4 pb-2">
              <div className="space-y-2 p-1">
                <Label htmlFor="visual-mood" className="font-medium text-sm">
                  Visual mood & style
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  e.g., minimal, playful, professional, bold, clean, futuristic
                </p>
                <Textarea
                  id="visual-mood"
                  value={localAnswers.uiDesign.visualMood}
                  onChange={(e) =>
                    updateAnswer("uiDesign", "visualMood", e.target.value)
                  }
                  placeholder="E.g., Clean and minimal with vibrant accent colors..."
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="design-references" className="font-medium text-sm">
                  Design references or inspiration
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Any apps, websites, or styles that capture the vibe you're going for
                </p>
                <Textarea
                  id="design-references"
                  value={localAnswers.uiDesign.designReferences}
                  onChange={(e) =>
                    updateAnswer("uiDesign", "designReferences", e.target.value)
                  }
                  placeholder="E.g., Notion's clean interface, Linear's speed..."
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key-ui-elements" className="font-medium text-sm">
                  Key UI elements
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Specific components or interface patterns you envision - cards, sidebars, modals, etc.
                </p>
                <Textarea
                  id="key-ui-elements"
                  value={localAnswers.uiDesign.keyUIElements}
                  onChange={(e) =>
                    updateAnswer("uiDesign", "keyUIElements", e.target.value)
                  }
                  placeholder="E.g., Card-based task list, sidebar navigation, modal dialogs..."
                  className="min-h-[80px] resize-none"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Technical Considerations */}
          <AccordionItem value="technical-considerations">
            <AccordionTrigger className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Technical Considerations</span>
                {isSectionComplete("technicalConsiderations") && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4 pb-2">
              <div className="space-y-2 p-1">
                <Label htmlFor="platform" className="font-medium text-sm">
                  Platform/Format
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  e.g., web app, mobile, desktop, responsive
                </p>
                <Textarea
                  id="platform"
                  value={localAnswers.technicalConsiderations.platform}
                  onChange={(e) =>
                    updateAnswer("technicalConsiderations", "platform", e.target.value)
                  }
                  placeholder="E.g., Responsive web app that works on desktop and mobile..."
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="integration-needs" className="font-medium text-sm">
                  Integration needs
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Any specific APIs, services, or tools that you'd like to be connected
                </p>
                <Textarea
                  id="integration-needs"
                  value={localAnswers.technicalConsiderations.integrationNeeds}
                  onChange={(e) =>
                    updateAnswer("technicalConsiderations", "integrationNeeds", e.target.value)
                  }
                  placeholder="E.g., GitHub API, Slack integration, email service..."
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data-content" className="font-medium text-sm">
                  Data/Content
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  What information does the app need to store, display, or process?
                </p>
                <Textarea
                  id="data-content"
                  value={localAnswers.technicalConsiderations.dataContent}
                  onChange={(e) =>
                    updateAnswer("technicalConsiderations", "dataContent", e.target.value)
                  }
                  placeholder="E.g., User profiles, task data, team memberships..."
                  className="min-h-[80px] resize-none"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Constraints */}
          <AccordionItem value="constraints">
            <AccordionTrigger className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Constraints & Assumptions</span>
                {isSectionComplete("constraints") && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4 pb-2">
              <div className="space-y-2 p-1">
                <Label htmlFor="boundaries" className="font-medium text-sm">
                  Are there any boundaries that you think would be useful to note?
                </Label>
                <Textarea
                  id="boundaries"
                  value={localAnswers.constraints.boundaries}
                  onChange={(e) =>
                    updateAnswer("constraints", "boundaries", e.target.value)
                  }
                  placeholder="E.g., Must work offline, no external dependencies..."
                  className="min-h-[120px] resize-none"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Additional Context */}
          <AccordionItem value="additional-context">
            <AccordionTrigger className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Additional Context</span>
                {isSectionComplete("additionalContext") && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4 pb-2">
              <div className="space-y-2 p-1">
                <Label htmlFor="other-details" className="font-medium text-sm">
                  Any other details, background, or considerations that would help someone understand what you're building
                </Label>
                <Textarea
                  id="other-details"
                  value={localAnswers.additionalContext.otherDetails}
                  onChange={(e) =>
                    updateAnswer("additionalContext", "otherDetails", e.target.value)
                  }
                  placeholder="E.g., This is a proof of concept for a larger platform..."
                  className="min-h-[120px] resize-none"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

