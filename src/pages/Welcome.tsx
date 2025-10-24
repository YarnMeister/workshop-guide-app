import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { ArrowRight, Users, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWorkshopProgress } from "@/hooks/useWorkshopProgress";

const Welcome = () => {
  const [participantId, setParticipantId] = useState("");
  const navigate = useNavigate();
  const { progress, updateProgress } = useWorkshopProgress();

  // Check for existing progress on mount
  useEffect(() => {
    console.log("Welcome page - checking progress:", progress);
    if (progress.participantId && progress.currentStepId) {
      // Restore session storage for backward compatibility
      sessionStorage.setItem("participantId", progress.participantId);
      
      toast({
        title: "Welcome back!",
        description: "Resuming where you left off...",
      });
      
      // Navigate to their last page
      navigate(`/onboarding/step/${progress.currentStepId}`);
    }
  }, [progress.participantId, progress.currentStepId, navigate]);

  const handleStart = () => {
    if (!participantId.trim()) {
      toast({
        title: "Participant Number Required",
        description: "Please enter your participant number to continue.",
        variant: "destructive",
      });
      return;
    }

    // Store participant ID in both session storage and localStorage
    sessionStorage.setItem("participantId", participantId);
    updateProgress({ 
      participantId, 
      currentStepId: 1 
    });
    
    toast({
      title: "Welcome!",
      description: `Participant ${participantId} - Let's get started!`,
    });

    navigate("/onboarding/step/1");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      
      {/* Floating sparkles background */}
      <div className="absolute inset-0 pointer-events-none">
        <Sparkles className="absolute top-20 left-10 h-6 w-6 text-yellow-400/30 animate-sparkle" />
        <Sparkles className="absolute top-40 right-20 h-8 w-8 text-yellow-500/20 animate-sparkle animation-delay-200" />
        <Sparkles className="absolute bottom-20 left-1/4 h-5 w-5 text-yellow-300/25 animate-sparkle animation-delay-400" />
        <Sparkles className="absolute top-1/2 right-10 h-7 w-7 text-yellow-400/20 animate-twinkle" />
        <Sparkles className="absolute bottom-40 right-1/3 h-6 w-6 text-yellow-500/30 animate-twinkle delay-150" />
        <Sparkles className="absolute top-1/3 left-20 h-4 w-4 text-yellow-300/40 animate-sparkle" />
      </div>
      
      <main className="container mx-auto px-6 py-16 relative z-10">
        <div className="mx-auto max-w-2xl">
          <div className="animate-fade-in text-center">
            {/* Icon */}
            <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <Users className="h-10 w-10 text-primary" />
              {/* Sparkle decorations */}
              <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-yellow-500 animate-pulse" />
              <Sparkles className="absolute -bottom-1 -left-2 h-4 w-4 text-yellow-400 animate-pulse delay-150" />
            </div>

            {/* Heading with sparkles */}
            <div className="relative">
              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Welcome to the Workshop
              </h1>
              <Sparkles className="absolute top-0 right-10 h-6 w-6 text-yellow-500 animate-sparkle" />
              <Sparkles className="absolute -top-2 left-8 h-4 w-4 text-yellow-400 animate-sparkle animation-delay-200" />
              <Sparkles className="absolute bottom-2 right-20 h-5 w-5 text-yellow-300 animate-sparkle animation-delay-400" />
            </div>
            <p className="mb-12 text-lg text-muted-foreground">
              Get ready for an interactive hands-on experience. Enter your participant number to begin your onboarding journey.
            </p>

            {/* Form */}
            <div className="mx-auto max-w-md space-y-6">
              <div className="space-y-2 text-left">
                <Label htmlFor="participantId" className="text-base font-medium">
                  Participant Number
                </Label>
                <Input
                  id="participantId"
                  type="text"
                  placeholder="e.g., WS2025-001"
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStart()}
                  className="h-12 text-base"
                  autoFocus
                />
                <p className="text-sm text-muted-foreground">
                  Your unique ID was provided in your welcome email
                </p>
              </div>

              <Button
                onClick={handleStart}
                size="lg"
                className="w-full h-12 text-base font-semibold gap-2 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Onboarding
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70 animate-pulse" />
              </Button>
            </div>

            {/* Additional info */}
            <div className="mt-16 rounded-lg border bg-muted/30 p-6 relative">
              <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-yellow-400 animate-twinkle" />
              <h2 className="mb-2 font-semibold">What to expect</h2>
              <p className="text-sm text-muted-foreground">
                You'll complete 4 simple steps to set up your environment, connect your accounts, and start your first task. The entire process takes about 10-15 minutes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Welcome;
