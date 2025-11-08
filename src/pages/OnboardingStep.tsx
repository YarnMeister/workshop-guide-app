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
import { useParticipant } from "@/hooks/useParticipant";
import { enhancePromptWithAI } from "@/services/openrouter";
import { revealApiKey } from "@/services/participant";
import { PRDForm } from "@/components/PRDForm";
import { PRDAnswers } from "@/utils/storage";
import { formatPRDForAI } from "@/utils/prdFormatter";

const OnboardingStep = () => {
  const { stepId } = useParams();
  const navigate = useNavigate();
  const currentStepNumber = parseInt(stepId || "1");
  const [copiedCommands, setCopiedCommands] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [templateText, setTemplateText] = useState<string>("");
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [isRevealingKey, setIsRevealingKey] = useState<boolean>(false);
  const { progress, updateProgress, updateTodoStatus } = useWorkshopProgress();
  const { name, apiKeyMasked, apiKey, setApiKey, isAuthenticated, isLoading: participantLoading, participantId } = useParticipant();
  
  const currentStep = ONBOARDING_STEPS.find(step => step.id === currentStepNumber);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stepId]);

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

  const handleRevealAndCopyKey = async () => {
    // If we already have the key in memory, use it
    if (apiKey) {
      await copyToClipboard(apiKey);
      toast({
        title: "Key copied!",
        description: "Full API key copied to clipboard",
      });
      return;
    }

    setIsRevealingKey(true);
    try {
      const result = await revealApiKey();
      if (result.success && result.apiKey) {
        // Store in memory for future use
        setApiKey(result.apiKey);
        await copyToClipboard(result.apiKey);
        toast({
          title: "Key copied!",
          description: "Full API key copied to clipboard",
        });
      } else {
        toast({
          title: "Failed to retrieve key",
          description: result.error || "Please try again or re-enter your participant code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Reveal key error:", error);
      toast({
        title: "Error",
        description: "Failed to retrieve key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRevealingKey(false);
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
    const parts: Array<{ type: 'text' | 'markdown-link' | 'url'; content: string; url?: string }> = [];
    
    // First, find all markdown-style links [text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;
    
    while ((match = markdownLinkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      
      // Add the markdown link
      parts.push({
        type: 'markdown-link',
        content: match[1],
        url: match[2]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after last markdown link
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }
    
    // If no markdown links found, process the whole text
    if (parts.length === 0) {
      parts.push({ type: 'text', content: text });
    }
    
    // Now process each part for plain URLs
    const result: React.ReactNode[] = [];
    
    parts.forEach((part, partIndex) => {
      if (part.type === 'markdown-link') {
        // Render markdown link
        result.push(
          <a
            key={`link-${partIndex}`}
            href={part.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              window.open(part.url, '_blank', 'noopener,noreferrer');
            }}
          >
            {part.content}
          </a>
        );
      } else {
        // Process text for plain URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const textParts = part.content.split(urlRegex);
        
        textParts.forEach((textPart, textIndex) => {
          if (urlRegex.test(textPart)) {
            result.push(
              <a
                key={`url-${partIndex}-${textIndex}`}
                href={textPart}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(textPart, '_blank', 'noopener,noreferrer');
                }}
              >
                {textPart}
              </a>
            );
          } else if (textPart) {
            result.push(textPart);
          }
        });
      }
    });
    
    return result;
  };

  useEffect(() => {
    console.log('[OnboardingStep] useEffect triggered', { 
      currentStepNumber, 
      isAuthenticated, 
      participantLoading,
      participantId: participantId || progress.participantId 
    });
    
    // Wait for participant loading to complete
    if (participantLoading) {
      console.log('[OnboardingStep] Participant still loading, skipping check');
      return;
    }

    // Check if participant is authenticated - use hook's participantId, not progress.participantId
    // The hook's state is the source of truth
    if (!isAuthenticated || !participantId) {
      console.log('[OnboardingStep] No authenticated participant, redirecting to welcome', {
        isAuthenticated,
        participantId,
        progressParticipantId: progress.participantId
      });
      toast({
        title: "Access Denied",
        description: "Please enter your participant code first.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Update current step in progress
    console.log('[OnboardingStep] Updating current step to', currentStepNumber);
    updateProgress({ currentStepId: currentStepNumber });
  }, [currentStepNumber, navigate, updateProgress, isAuthenticated, participantLoading, participantId, progress.participantId]);

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
      // PRD form handles its own state via progress.prdAnswers
      // No need to load templateText for step 2 anymore
    } else if (currentStepNumber === 3) {
      // Load saved template text for Prototype page
      // First check if we have it in progress
      if (progress.prototypeTemplate) {
        setTemplateText(progress.prototypeTemplate);
      } else {
        // Check cache for this PRD content
        const prdFormatted = formatPRDForAI(progress.prdAnswers);
        if (prdFormatted.trim() && prdFormatted !== "# Mini PRD\n\n") {
          const prdHash = btoa(prdFormatted).slice(0, 50);
          const cacheKey = `lovablePrompt_${prdHash}`;
          const cachedPrompt = localStorage.getItem(cacheKey);
          
          if (cachedPrompt) {
            // Load from cache and update progress
            setTemplateText(cachedPrompt);
            updateProgress({ prototypeTemplate: cachedPrompt });
          } else {
            // Fallback to formatted PRD if no cache exists
            setTemplateText(prdFormatted || '');
          }
        } else {
          setTemplateText('');
        }
      }
      
      // Show AI enhancement error if any
      if (progress.aiEnhancementError) {
        setTimeout(() => {
          toast({
            title: "AI Enhancement Notice",
            description: progress.aiEnhancementError + " You can retry by going back to Write Specs.",
            variant: "destructive",
          });
        }, 500);
      }
    }
  }, [currentStepNumber, progress.setupPageTodos, progress.writeSpecsTemplate, progress.prototypeTemplate, progress.prdAnswers, currentStep]);

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

  const handleCTA = async () => {
    // Only check completion for Setup Tools page (step 1)
    if (currentStepNumber === 1 && !allStepsCompleted) {
      toast({
        title: "Complete All Steps",
        description: "Please mark all steps as complete before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    // Process AI enhancement when moving from Write Specs to Prototype
    if (currentStepNumber === 2) {
      // Format PRD answers for AI processing
      const prdFormatted = formatPRDForAI(progress.prdAnswers);
      
      // Check if there's any content to process
      if (!prdFormatted.trim() || prdFormatted === "# Mini PRD\n\n") {
        toast({
          title: "No Content",
          description: "Please fill out at least one section before proceeding.",
          variant: "destructive",
        });
        return;
      }

      // Generate a simple hash of the PRD content to use as cache key
      const prdHash = btoa(prdFormatted).slice(0, 50);
      const cacheKey = `lovablePrompt_${prdHash}`;
      
      // Check if we already have a cached prompt for this PRD content
      const cachedPrompt = localStorage.getItem(cacheKey);
      
      if (cachedPrompt) {
        // Use cached prompt
        updateProgress({ 
          prototypeTemplate: cachedPrompt,
          aiEnhancementError: undefined
        });
        
        toast({
          title: "Using cached prompt",
          description: "Loading your previously generated prompt",
        });
      } else {
        // Only call AI if we don't have a cached version
        setIsProcessingAI(true);
        
        toast({
          title: "Enhancing with AI...",
          description: "Creating a well-structured Lovable prompt",
        });
        
        try {
          // Create getApiKey function that checks memory first, then calls API
          const getApiKey = async (): Promise<string | null> => {
            if (apiKey) {
              return apiKey;
            }
            const result = await revealApiKey();
            if (result.success && result.apiKey) {
              setApiKey(result.apiKey);
              return result.apiKey;
            }
            return null;
          };

          const result = await enhancePromptWithAI(prdFormatted, getApiKey);
          
          if (result.success) {
            // Save the enhanced prompt and cache it
            updateProgress({ 
              prototypeTemplate: result.content,
              aiEnhancementError: undefined
            });
            
            // Cache the result in localStorage with PRD hash as key
            localStorage.setItem(cacheKey, result.content);
            
            toast({
              title: "AI Enhancement Complete",
              description: "Your prompt has been enhanced and is ready on the next page",
            });
          } else {
            // Save error - show message but still allow proceeding
            updateProgress({ 
              prototypeTemplate: prdFormatted,
              aiEnhancementError: result.error
            });
            
            toast({
              title: "AI Enhancement Failed",
              description: result.error || "Using your PRD content instead",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('AI enhancement error:', error);
          const prdFormatted = formatPRDForAI(progress.prdAnswers);
          updateProgress({ 
            prototypeTemplate: prdFormatted,
            aiEnhancementError: 'Unexpected error during AI enhancement'
          });
          
          toast({
            title: "Error",
            description: "Something went wrong. Using your PRD content.",
            variant: "destructive",
          });
        } finally {
          setIsProcessingAI(false);
        }
      }
    }
    
    // Mark current page as completed
    const completedPages = [...progress.completedPages];
    if (!completedPages.includes(currentStepNumber)) {
      completedPages.push(currentStepNumber);
      updateProgress({ completedPages });
    }
    
    // Scroll to top before navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
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
                {/* Info Panel - Show at top for step 1 and step 2 */}
                {currentStep.detailedContent.infoPanel && (currentStepNumber === 1 || currentStepNumber === 2) && (
                  <div className="rounded-lg border bg-blue-50 p-6">
                    <div className="flex items-start gap-3">
                      <Info className="h-6 w-6 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="mb-2 font-semibold text-base text-blue-900">{currentStep.detailedContent.infoPanel.title}</h3>
                        <p className="text-sm text-blue-700">{renderTextWithLinks(currentStep.detailedContent.infoPanel.content)}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Inspiration Panel - Show on step 2 after info panel */}
                {currentStep.detailedContent.inspirationPanel && currentStepNumber === 2 && (
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-3 font-semibold text-base">{currentStep.detailedContent.inspirationPanel.title}</h3>
                    <div className="flex items-center gap-3">
                      <p className="flex-1 text-sm text-muted-foreground">{currentStep.detailedContent.inspirationPanel.content}</p>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'instant' });
                          navigate(currentStep.detailedContent.inspirationPanel.buttonAction);
                        }}
                        className="shrink-0"
                      >
                        {currentStep.detailedContent.inspirationPanel.buttonText}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* PRD Form for step 2 */}
                {currentStep.detailedContent.prdTemplate && currentStepNumber === 2 && (
                  <PRDForm
                    answers={progress.prdAnswers}
                    onUpdate={(answers: PRDAnswers) => {
                      updateProgress({ prdAnswers: answers });
                    }}
                  />
                )}
                
                {/* Regular sections (for non-PRD pages) */}
                {!currentStep.detailedContent.prdTemplate && currentStep.detailedContent.sections && currentStep.detailedContent.sections.map((section, index) => {
                  // Insert info panel for step 5 after first section (Void Editor Overview)
                  const shouldInsertInfoPanel = currentStepNumber === 5 && index === 1 && currentStep.detailedContent?.infoPanel;
                  
                  // Define context panels that shouldn't have step numbers
                  const contextPanels = ['Void Editor Overview', 'Coding Mindset', 'Vibe Coding Lifecycle', 'Success Patterns - Best Practices', 'Vibe Coder\'s Glossary'];
                  const isContextPanel = contextPanels.includes(section.title);
                  
                  // Calculate step number: count only workflow steps (skip context panels)
                  let stepNumber = 0;
                  if (!isContextPanel) {
                    let workflowStepCount = 0;
                    for (let i = 0; i <= index; i++) {
                      if (!contextPanels.includes(currentStep.detailedContent.sections[i].title)) {
                        workflowStepCount++;
                      }
                      if (i === index) {
                        stepNumber = workflowStepCount;
                      }
                    }
                  }
                  
                  return (
                    <div key={index}>
                      {/* Info Panel for step 5 - positioned after Void Editor Overview */}
                      {shouldInsertInfoPanel && (
                        <div className="rounded-lg border bg-blue-50 p-6 mb-6">
                          <div className="flex items-start gap-3">
                            <Info className="h-6 w-6 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                              <h3 className="mb-2 font-semibold text-base text-blue-900">{currentStep.detailedContent.infoPanel.title}</h3>
                              <p className="text-sm text-blue-700">{renderTextWithLinks(currentStep.detailedContent.infoPanel.content)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="rounded-lg border bg-card p-6">
                            <div className="mb-3 flex items-center gap-3">
                              {!isContextPanel && (
                                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                  {currentStepNumber === 8 ? `Option ${stepNumber}` : `Step ${stepNumber}`}
                                </div>
                              )}
                              <h2 className="font-semibold text-lg">{section.title}</h2>
                            </div>
                    {section.description && (
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <p className="flex-1 text-sm text-muted-foreground">{renderTextWithLinks(section.description)}</p>
                        {section.seeMoreRoute && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              window.scrollTo({ top: 0, behavior: 'instant' });
                              navigate(section.seeMoreRoute);
                            }}
                            className="shrink-0"
                          >
                            See more
                          </Button>
                        )}
                      </div>
                    )}
                    {!section.description && section.seeMoreRoute && (
                      <div className="mb-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'instant' });
                            navigate(section.seeMoreRoute);
                          }}
                        >
                          See more
                        </Button>
                      </div>
                    )}
                    {section.templateTextbox && (
                      <div className="mb-4">
                        <Textarea
                          value={templateText}
                          onChange={(e) => {
                            setTemplateText(e.target.value);
                            if (currentStepNumber === 2) {
                              updateProgress({ 
                                writeSpecsTemplate: e.target.value,
                                writeSpecsOriginal: e.target.value 
                              });
                            } else if (currentStepNumber === 3) {
                              updateProgress({ prototypeTemplate: e.target.value });
                            }
                          }}
                          placeholder="Enter your project description here..."
                          className={`${currentStepNumber === 3 ? 'min-h-[600px]' : 'min-h-[200px]'} resize-none`}
                        />
                      </div>
                    )}
                    {section.copyPromptButton && (
                      <div className="mb-4 p-4">
                        <div className="flex items-center gap-3">
                          <p className="flex-1 text-sm text-muted-foreground">Once you are happy with the prompt above, copy the prompt to paste it in the Lovable page below</p>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => copyToClipboard(templateText)}
                            className="shrink-0"
                          >
                            {copiedCommands.has(templateText) ? (
                              <>
                                <Check className="h-4 w-4 mr-2 text-white" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy prompt
                              </>
                            )}
                          </Button>
                        </div>
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
                        {section.commands.map((command, cmdIndex) => {
                          // Special handling for Void Editor key on step 1
                          if (currentStepNumber === 1 && section.title === "Install Void Editor" && command === "sk-ar3x-pkxX8c-erCr9-cvD-rr4R") {
                            // Replace with masked key from participant state
                            const displayKey = apiKeyMasked || "sk-or-v1-**********";
                            return (
                              <div key={cmdIndex} className="flex items-center justify-between rounded-md bg-muted p-3 text-sm">
                                <code className="flex-1 font-mono">{displayKey}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleRevealAndCopyKey}
                                  className="ml-2 h-8 w-8 p-0"
                                  disabled={isRevealingKey}
                                >
                                  {isRevealingKey ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            );
                          }
                          // Regular command display
                          return <CopyableCommand key={cmdIndex} command={command} />;
                        })}
                      </div>
                    )}
                    {section.screenshot && (
                      <div className={`mb-4 ${
                        currentStepNumber === 4 && index === 1 ? 'max-w-[50%]' : 
                        section.title === 'Vibe Coding Lifecycle' ? 'max-w-[70%]' : ''
                      }`}>
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
                        {section.subsections.map((subsection, subIndex) => {
                          const isWarning = subsection.title?.includes('⚠️');
                          return (
                            <div key={subIndex} className={`border-l-2 pl-4 ${isWarning ? 'border-red-300 bg-red-50 rounded-r-md p-4' : 'border-muted'}`}>
                              <h3 className={`mb-2 font-medium text-sm ${isWarning ? 'text-red-900' : ''}`}>{subsection.title}</h3>
                              {subsection.description && (
                                <p className={`mb-3 text-sm whitespace-pre-line ${isWarning ? 'text-red-800' : 'text-muted-foreground'}`}>{renderTextWithLinks(subsection.description)}</p>
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
                              {subsection.screenshot && (
                                <div className="mb-4 mt-3">
                                  <img 
                                    src={`/${subsection.screenshot}`} 
                                    alt={`Screenshot for ${subsection.title}`}
                                    className="rounded-lg border shadow-sm max-w-full h-auto"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
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
                </div>
                );
                })}
                
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

                {/* Info Panel - Show at bottom for steps other than step 1, step 2, and step 5 */}
                {currentStep.detailedContent.infoPanel && currentStepNumber !== 1 && currentStepNumber !== 2 && currentStepNumber !== 5 && (
                  <div className="rounded-lg border bg-blue-50 p-6">
                    <div className="flex items-start gap-3">
                      <Info className="h-6 w-6 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="mb-2 font-semibold text-base text-blue-900">{currentStep.detailedContent.infoPanel.title}</h3>
                        <p className="text-sm text-blue-700">{renderTextWithLinks(currentStep.detailedContent.infoPanel.content)}</p>
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
                onClick={() => {
                  if (currentStepNumber > 1) {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    navigate(`/onboarding/step/${currentStepNumber - 1}`);
                  }
                }}
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
                  disabled={(currentStepNumber === 1 && !allStepsCompleted) || isProcessingAI}
                >
                  {isProcessingAI ? (
                    <>
                      <span className="animate-pulse">Enhancing with AI...</span>
                    </>
                  ) : (
                    <>
                      {currentStep.ctaText}
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
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
