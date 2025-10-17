import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { ArrowRight, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Welcome = () => {
  const [participantId, setParticipantId] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (!participantId.trim()) {
      toast({
        title: "Participant Number Required",
        description: "Please enter your participant number to continue.",
        variant: "destructive",
      });
      return;
    }

    // Store participant ID in session storage
    sessionStorage.setItem("participantId", participantId);
    
    toast({
      title: "Welcome!",
      description: `Participant ${participantId} - Let's get started!`,
    });

    navigate("/onboarding/step/1");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="animate-fade-in text-center">
            {/* Icon */}
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <Users className="h-10 w-10 text-primary" />
            </div>

            {/* Heading */}
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Welcome to the Workshop
            </h1>
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
                className="w-full h-12 text-base font-semibold gap-2"
              >
                Start Onboarding
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Additional info */}
            <div className="mt-16 rounded-lg border bg-muted/30 p-6">
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
