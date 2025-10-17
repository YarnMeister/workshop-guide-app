import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowRight, ImageIcon } from "lucide-react";
import { ONBOARDING_STEPS } from "@/data/steps";
import { toast } from "@/hooks/use-toast";

const OnboardingStep = () => {
  const { stepId } = useParams();
  const navigate = useNavigate();
  const currentStepNumber = parseInt(stepId || "1");
  
  const currentStep = ONBOARDING_STEPS.find(step => step.id === currentStepNumber);

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
              <div className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Step {currentStep.id} of {ONBOARDING_STEPS.length}
              </div>
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

            {/* Additional information card */}
            <div className="mb-8 rounded-lg border bg-card p-6">
              <h2 className="mb-3 font-semibold">What you'll accomplish:</h2>
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

            {/* CTA Button */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => currentStepNumber > 1 && navigate(`/onboarding/step/${currentStepNumber - 1}`)}
                disabled={currentStepNumber === 1}
              >
                Previous Step
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
