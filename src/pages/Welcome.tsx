import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWorkshopProgress } from "@/hooks/useWorkshopProgress";
import { useParticipant } from "@/hooks/useParticipant";
import { claimParticipantCode } from "@/services/participant";

// Declare VANTA global type
declare global {
  interface Window {
    VANTA: any;
  }
}

const Welcome = () => {
  const [code, setCode] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const navigate = useNavigate();
  const { progress, updateProgress } = useWorkshopProgress();
  const { isAuthenticated, isLoading, participantId, name, setParticipant } = useParticipant();
  const vantaRef = useRef<any>(null);
  const vantaContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Vanta.js effect
  useEffect(() => {
    if (!vantaContainerRef.current || vantaRef.current) return;

    // Wait for VANTA to be available
    const initVanta = () => {
      if (window.VANTA && vantaContainerRef.current) {
        vantaRef.current = window.VANTA.WAVES({
          el: vantaContainerRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0xd92525,
          shininess: 98.00,
          waveHeight: 31.00,
          waveSpeed: 0.40,
          zoom: 1.17
        });
      }
    };

    // Try to initialize immediately, or wait for scripts to load
    if (window.VANTA) {
      initVanta();
    } else {
      // Poll for VANTA availability
      const checkInterval = setInterval(() => {
        if (window.VANTA) {
          initVanta();
          clearInterval(checkInterval);
        }
      }, 100);

      // Cleanup interval after 5 seconds
      setTimeout(() => clearInterval(checkInterval), 5000);
    }

    // Cleanup function
    return () => {
      if (vantaRef.current) {
        vantaRef.current.destroy();
        vantaRef.current = null;
      }
    };
  }, []);

  // Check for existing progress on mount
  useEffect(() => {
    console.log('[Welcome] useEffect triggered', { 
      isAuthenticated, 
      participantId, 
      isLoading, 
      currentStepId: progress.currentStepId,
      pathname: window.location.pathname
    });
    
    // Don't navigate if we're not on the welcome page
    if (window.location.pathname !== '/') {
      return;
    }
    
    // Migration: If old participantId exists but no name, prompt to re-enter code
    if (progress.participantId && !progress.participantName && !isLoading) {
      console.log('[Welcome] Old participantId detected, prompting re-entry');
      toast({
        title: "Please re-enter your participant code",
        description: "We've updated our system. Please enter your participant code to continue.",
        variant: "default",
      });
      // Clear old participantId
      updateProgress({ participantId: null });
      return; // Don't navigate
    }

    // If authenticated and has progress, navigate to current step
    // Only navigate if we're still on the welcome page and loading is complete
    if (isAuthenticated && participantId && progress.currentStepId && !isLoading) {
      console.log('[Welcome] Authenticated user detected, navigating to step', progress.currentStepId);
      
      // Navigate to their last page
      navigate(`/onboarding/step/${progress.currentStepId}`);
    }
  }, [isAuthenticated, participantId, name, progress.currentStepId, navigate, isLoading, progress.participantId, progress.participantName, updateProgress]);

  const handleStart = async () => {
    if (!code.trim()) {
      toast({
        title: "Participant Code Required",
        description: "Please enter your participant code to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsClaiming(true);

    try {
      const result = await claimParticipantCode(code.trim());
      console.log('[Welcome] Claim result:', result);
      console.log('[Welcome] certId from claim:', result.certId);

      if (result.success && result.participantId && result.name && result.apiKeyMasked) {
        // Store participant data
        console.log('[Welcome] Setting participant with certId:', result.certId);
        setParticipant(result.participantId, result.name, result.apiKeyMasked, result.certId);

        // Update progress
        updateProgress({
          participantId: result.participantId,
          currentStepId: 1,
          certId: result.certId
        });

        navigate("/onboarding/step/1");
      } else {
        // Handle error
        const errorMessage = result.error || "We can't find that code. Please check your code or ask a facilitator.";
        toast({
          title: "Invalid Code",
          description: errorMessage,
          variant: "destructive",
        });
        setCode(""); // Clear input on error
      }
    } catch (error) {
      console.error("Claim error:", error);
      toast({
        title: "Error",
        description: "Connection error. Please check your internet and try again.",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Vanta.js animated background */}
      <div
        ref={vantaContainerRef}
        className="fixed inset-0 vanta-loading-bg"
        style={{ zIndex: 0 }}
      />

      {/* Header */}
      <Header />

      {/* Main content - hero section at bottom-left */}
      <main className="relative z-10 min-h-[calc(100vh-4rem)] flex items-end pl-24 pb-24 pt-12 pr-12">
        <div className="w-full max-w-2xl space-y-8 animate-fade-in">
          {/* Form card positioned above heading */}
          <div className="w-full max-w-md">
            {/* Glassmorphism form card */}
            <div className="rounded-2xl border border-white/20 bg-white/80 backdrop-blur-md p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-base font-medium text-foreground">
                    Participant Code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter your code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !isClaiming && handleStart()}
                    className="h-12 text-base bg-white/90"
                    autoFocus
                    disabled={isClaiming}
                  />
                </div>

                <Button
                  onClick={handleStart}
                  size="lg"
                  className="w-full h-12 text-base font-semibold gap-2 group"
                  disabled={isClaiming}
                >
                  {isClaiming ? "Verifying..." : "Get Started"}
                  {!isClaiming && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Hero section with heading and logos */}
          <div>
            <h1 className="text-6xl font-bold text-white mb-8">
              Prototyping with AI
            </h1>

            {/* Logos horizontally aligned */}
            <div className="flex items-center gap-8">
              <img
                src="/rea-group-logo-white.png"
                alt="REA Group"
                className="h-16 w-auto"
              />
              <img
                src="/proptechlogo.png"
                alt="PropTech"
                className="h-16 w-auto"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Welcome;
