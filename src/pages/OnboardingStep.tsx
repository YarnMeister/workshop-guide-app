import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowRight, ImageIcon, Copy, Check } from "lucide-react";
import { ONBOARDING_STEPS } from "@/data/steps";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const OnboardingStep = () => {
  const { stepId } = useParams();
  const navigate = useNavigate();
  const currentStepNumber = parseInt(stepId || "1");
  const [copiedCommands, setCopiedCommands] = useState<Set<string>>(new Set());
  
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
    }
  }, [navigate]);

  if (!currentStep) {
    navigate("/");
    return null;
  }

  const handleCTA = () => {
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

            {/* Visual placeholder */}
            <div className="mb-8 overflow-hidden rounded-xl border bg-muted/30">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Instructional Screenshot
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Visual guide for {currentStep.title}
                  </p>
                </div>
              </div>
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
                      <p className="mb-4 text-sm text-muted-foreground">{section.description}</p>
                    )}
                    {section.codeBlock && (
                      <div className="mb-4">
                        <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
                          <code>{section.codeBlock}</code>
                        </pre>
                      </div>
                    )}
                    {section.commands && (
                      <div className="mb-4 space-y-2">
                        {section.commands.map((command, cmdIndex) => (
                          <CopyableCommand key={cmdIndex} command={command} />
                        ))}
                      </div>
                    )}
                    {section.subsections && (
                      <div className="space-y-4">
                        {section.subsections.map((subsection, subIndex) => (
                          <div key={subIndex} className="border-l-2 border-muted pl-4">
                            <h3 className="mb-2 font-medium text-sm">{subsection.title}</h3>
                            {subsection.description && (
                              <p className="mb-3 text-sm text-muted-foreground whitespace-pre-line">{subsection.description}</p>
                            )}
                            {subsection.codeBlock && (
                              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-sm">
                                <code>{subsection.codeBlock}</code>
                              </pre>
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
              </div>
            ) : (
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

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => currentStepNumber > 1 && navigate(`/onboarding/step/${currentStepNumber - 1}`)}
                disabled={currentStepNumber === 1}
              >
                Previous
              </Button>
              
              <Button
                onClick={handleCTA}
                size="lg"
                className="gap-2 font-semibold"
              >
                {currentStep.ctaText}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OnboardingStep;
