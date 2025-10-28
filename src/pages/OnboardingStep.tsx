import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Copy, Check, Info } from "lucide-react";
import { ONBOARDING_STEPS } from "@/data/steps";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useWorkshopProgress } from "@/hooks/useWorkshopProgress";

const OnboardingStep = () => {
  const { stepId } = useParams();
  const navigate = useNavigate();
  const currentStepNumber = parseInt(stepId || "1");
  const [copiedCommands, setCopiedCommands] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [templateText, setTemplateText] = useState<string>("");
  const { progress, updateProgress, updateTodoStatus } = useWorkshopProgress();
  
  const currentStep = ONBOARDING_STEPS.find(step => step.id === currentStepNumber);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommands(prev => new Set(prev).add(text));
      toast({
        title: "Copied!",
        description: "Command copied to clipboard",
      });
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedCommands(prev => {
          const newSet = new Set(prev);
          newSet.delete(text);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const toggleStepCompletion = (stepIndex: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      
      // Save to localStorage for Setup page
      if (currentStepNumber === 1) {
        updateTodoStatus(stepIndex, newSet.has(stepIndex));
      }
      
      return newSet;
    });
  };

  // Component for copyable commands
  const CopyableCommand = ({ command }: { command: string }) => {
    const isCopied = copiedCommands.has(command);
    
    return (
      <div className="flex items-center justify-between rounded-md bg-muted p-3 text-sm">
        <code className="flex-1 font-mono">{command}</code>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(command)}
          className="ml-2 h-8 w-8 p-0"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  };

  // Function to render text with clickable links
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              window.open(part, '_blank', 'noopener,noreferrer');
            }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    // Check if participant ID exists
    const participantId = sessionStorage.getItem("participantId");
    if (!participantId) {
      toast({
        title: "Access Denied",
        description: "Please enter your participant number first.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Update current step in progress
    updateProgress({ currentStepId: currentStepNumber });
  }, [currentStepNumber, navigate, updateProgress]);

  // Separate effect for loading saved data
  useEffect(() => {
    // Load saved data based on current step
    if (currentStepNumber === 1) {
      // Load saved todo states for Setup page
      const savedTodos = new Set<number>();
      Object.entries(progress.setupPageTodos).forEach(([index, completed]) => {
        if (completed) {
          savedTodos.add(parseInt(index));
        }
      });
      setCompletedSteps(savedTodos);
    } else if (currentStepNumber === 2) {
      // Load saved template text for Write Specs page
      if (progress.writeSpecsTemplate) {
        setTemplateText(progress.writeSpecsTemplate);
      } else if (currentStep?.detailedContent?.sections?.[0]?.templateContent) {
        setTemplateText(currentStep.detailedContent.sections[0].templateContent);
      }
    }
  }, [currentStepNumber, progress.setupPageTodos, progress.writeSpecsTemplate, currentStep]);

  if (!currentStep) {
    navigate("/");
    return null;
  }

  // Check if all steps are completed - only for Setup Tools page (step 1)
  const allStepsCompleted = currentStepNumber === 1 
    ? (currentStep.detailedContent?.sections.length 
        ? completedSteps.size === currentStep.detailedContent.sections.length
        : true)
    : true; // For all other steps, always allow proceeding

  const handleCTA = () => {
    // Only check completion for Setup Tools page (step 1)
    if (currentStepNumber === 1 && !allStepsCompleted) {
      toast({
        title: "Complete All Steps",
        description: "Please mark all steps as complete before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    // Mark current page as completed
    const completedPages = [...progress.completedPages];
    if (!completedPages.includes(currentStepNumber)) {
      completedPages.push(currentStepNumber);
      updateProgress({ completedPages });
    }
    
    if (currentStep.ctaAction === "/dashboard") {
      toast({
        title: "Onboarding Complete!",
        description: "You're ready to start the workshop. Great job!",
      });
    }
    navigate(currentStep.ctaAction);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Breadcrumb steps={ONBOARDING_STEPS} currentStep={currentStepNumber} />
        
        <main className="ml-64 flex-1 p-8">
          <div className="mx-auto max-w-3xl animate-fade-in">
            {/* Step header */}
            <div className="mb-8">
              <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                {currentStep.heading}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {currentStep.content}
              </p>
            </div>


            {/* Detailed content or default information card */}
            {currentStep.detailedContent ? (
              <div className="mb-8 space-y-6">
                {currentStep.detailedContent.sections.map((section, index) => (
                  <div key={index} className="rounded-lg border bg-card p-6">
                            <div className="mb-3 flex items-center gap-3">
                              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                Step {index + 1}
                              </div>
                              <h2 className="font-semibold text-lg">{section.title}</h2>
                            </div>
                    {section.description && (
                      <p className="mb-4 text-sm text-muted-foreground">{renderTextWithLinks(section.description)}</p>
                    )}
                    {section.templateTextbox && (
                      <div className="mb-4">
                        <Textarea
                          value={templateText}
                          onChange={(e) => {
                            setTemplateText(e.target.value);
                            updateProgress({ writeSpecsTemplate: e.target.value });
                          }}
                          placeholder="Enter your project description here..."
                          className="min-h-[200px] resize-none"
                        />
                      </div>
                    )}
                    {section.codeBlock && (
                      <div className="mb-4">
                        <div className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
                          <div className="whitespace-pre-wrap">{renderTextWithLinks(section.codeBlock)}</div>
                        </div>
                      </div>
                    )}
                    {section.additionalInstructions && (
                      <p className="mb-4 text-sm text-muted-foreground">{renderTextWithLinks(section.additionalInstructions)}</p>
                    )}
                    {section.bulletPoints && (
                      <div className="mb-4">
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {section.bulletPoints.map((point, pointIndex) => (
                            <li key={pointIndex} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {section.commands && (
                      <div className="mb-4 space-y-2">
                        {section.commands.map((command, cmdIndex) => (
                          <CopyableCommand key={cmdIndex} command={command} />
                        ))}
                      </div>
                    )}
                    {section.screenshot && (
                      <div className="mb-4">
                        <img 
                          src={`/${section.screenshot}`} 
                          alt={`Screenshot for ${section.title}`}
                          className="rounded-lg border shadow-sm max-w-full h-auto"
                        />
                      </div>
                    )}
                    {section.exampleCode && (
                      <div className="mb-4">
                        <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
                          <code>{section.exampleCode}</code>
                        </pre>
                      </div>
                    )}
                    {section.tabs && (
                      <div className="mb-4">
                        {/* Tab Headers */}
                        <div className="flex border-b border-muted mb-4">
                          {section.tabs.map((tab, tabIndex) => (
                            <button
                              key={tabIndex}
                              onClick={() => setActiveTab(tabIndex)}
                              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tabIndex
                                  ? 'border-primary text-primary'
                                  : 'border-transparent text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {tab.title}
                            </button>
                          ))}
                        </div>
                        
                        {/* Tab Content */}
                        {section.tabs[activeTab] && section.tabs[activeTab].content.subsections && (
                          <div className="space-y-4">
                            {section.tabs[activeTab].content.subsections.map((subsection, subIndex) => (
                              <div key={subIndex} className="border-l-2 border-muted pl-4">
                                <h3 className="mb-2 font-medium text-sm">{subsection.title}</h3>
                                {subsection.description && (
                                  <p className="mb-3 text-sm text-muted-foreground whitespace-pre-line">{renderTextWithLinks(subsection.description)}</p>
                                )}
                                {subsection.codeBlock && (
                                  <div className="overflow-x-auto rounded-md bg-muted p-3 text-sm">
                                    <div className="whitespace-pre-wrap">{renderTextWithLinks(subsection.codeBlock)}</div>
                                  </div>
                                )}
                                {subsection.commands && (
                                  <div className="space-y-2">
                                    {subsection.commands.map((command, cmdIndex) => (
                                      <CopyableCommand key={cmdIndex} command={command} />
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {section.subsections && (
                      <div className="space-y-4">
                        {section.subsections.map((subsection, subIndex) => (
                          <div key={subIndex} className="border-l-2 border-muted pl-4">
                            <h3 className="mb-2 font-medium text-sm">{subsection.title}</h3>
                            {subsection.description && (
                              <p className="mb-3 text-sm text-muted-foreground whitespace-pre-line">{renderTextWithLinks(subsection.description)}</p>
                            )}
                            {subsection.codeBlock && (
                              <div className="overflow-x-auto rounded-md bg-muted p-3 text-sm">
                                <div className="whitespace-pre-wrap">{renderTextWithLinks(subsection.codeBlock)}</div>
                              </div>
                            )}
                            {subsection.commands && (
                              <div className="space-y-2">
                                {subsection.commands.map((command, cmdIndex) => (
                                  <CopyableCommand key={cmdIndex} command={command} />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Step completion toggle at bottom right - Only show on Setup Tools page (step 1) */}
                    {currentStepNumber === 1 && (
                      <div className="mt-6 flex justify-end">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Todo</span>
                          <button
                            onClick={() => toggleStepCompletion(index)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                              completedSteps.has(index) ? 'bg-primary' : 'bg-gray-400'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                completedSteps.has(index) ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className="text-xs text-muted-foreground">Done</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {currentStep.detailedContent.troubleshooting && (
                  <div className="rounded-lg border bg-orange-50 p-6">
                    <h2 className="mb-3 font-semibold text-lg text-orange-800">{currentStep.detailedContent.troubleshooting.title}</h2>
                    <div className="space-y-4">
                      {currentStep.detailedContent.troubleshooting.items.map((item, index) => (
                        <div key={index} className="border-l-2 border-orange-200 pl-4">
                          <h3 className="mb-2 font-medium text-sm text-orange-700">{item.title}</h3>
                          <pre className="overflow-x-auto rounded-md bg-orange-100 p-3 text-sm">
                            <code>{item.codeBlock}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep.detailedContent.infoPanel && (
                  <div className="rounded-lg border bg-blue-50 p-6">
                    <div className="flex items-start gap-3">
                      <Info className="h-6 w-6 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-700">{currentStep.detailedContent.infoPanel.content}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : currentStepNumber !== 2 && (
              <div className="mb-8 rounded-lg border bg-card p-6">
                <h2 className="mb-3 font-medium text-sm">What you'll accomplish:</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Complete the necessary setup for this step</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Verify everything is working correctly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Move forward to the next step</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Summary Section - Only show on Setup Tools page (step 1) */}
            {currentStepNumber === 1 && (
              <div className="mb-8 rounded-lg border bg-card p-6">
                <h2 className="mb-4 font-semibold text-lg">Progress Summary</h2>
                <div className="space-y-2">
                  {currentStep.detailedContent?.sections.map((section, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Step {index + 1}: {section.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Todo</span>
                        <div className={`relative inline-flex h-5 w-9 items-center rounded-full ${
                          completedSteps.has(index) ? 'bg-primary' : 'bg-gray-400'
                        }`}>
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              completedSteps.has(index) ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">Done</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Progress: {completedSteps.size} of {currentStep.detailedContent?.sections.length || 0} steps completed
                    </span>
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${currentStep.detailedContent?.sections.length ? (completedSteps.size / currentStep.detailedContent.sections.length) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => currentStepNumber > 1 && navigate(`/onboarding/step/${currentStepNumber - 1}`)}
                disabled={currentStepNumber === 1}
              >
                Previous
              </Button>
              
              <div className="flex flex-col items-end">
                {currentStepNumber === 1 && !allStepsCompleted && (
                  <p className="mb-2 text-xs text-muted-foreground">
                    Mark all steps complete to proceed
                  </p>
                )}
                <Button
                  onClick={handleCTA}
                  size="lg"
                  className="gap-2 font-semibold"
                  disabled={currentStepNumber === 1 && !allStepsCompleted}
                >
                  {currentStep.ctaText}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OnboardingStep;
