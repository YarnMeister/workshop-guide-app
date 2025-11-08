import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { CheckCircle2 } from "lucide-react";
import { useParticipant } from "@/hooks/useParticipant";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Declare VANTA global type
declare global {
  interface Window {
    VANTA: any;
  }
}

/**
 * Congrats Page - Shown after completing the "Extend Your App" step
 * Displays congratulations message and next steps for participants
 */
const Congrats = () => {
  const { participantId, name, certId } = useParticipant();
  const vantaRef = useRef<any>(null);
  const vantaContainerRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  // Debug logging
  useEffect(() => {
    console.log('[Congrats] certId:', certId);
    console.log('[Congrats] participantId:', participantId);
    console.log('[Congrats] name:', name);
  }, [certId, participantId, name]);

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

  const handleOpenModal = (title: string) => {
    console.log('[Congrats] Opening modal:', title);
    console.log('[Congrats] certId at modal open:', certId);
    setModalTitle(title);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Vanta.js animated background - 25% of viewport height */}
      <div className="relative w-full" style={{ height: '25vh' }}>
        <div
          ref={vantaContainerRef}
          className="absolute inset-0 vanta-loading-bg"
          style={{ zIndex: 0 }}
        />
        {/* Congratulations text - bottom aligned with padding */}
        <div className="relative z-10 h-full flex items-end justify-center pb-4">
          <h1 className="text-6xl font-bold text-white">
            Congratulations, you made it!
          </h1>
        </div>
      </div>

      <main className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-4xl animate-fade-in">
          {/* Three panels */}
          <div className="space-y-6">
            {/* Panel 1: Keep playing at home */}
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-3 flex items-center gap-3">
                <h2 className="font-semibold text-lg">Keep playing at home</h2>
              </div>
              <div className="mb-4 flex items-start justify-between gap-4">
                <p className="flex-1 text-sm text-muted-foreground">
                  Continue your learning journey and explore more features at your own pace.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal("Keep playing at home")}
                  className="shrink-0"
                >
                  See more
                </Button>
              </div>
            </div>

            {/* Panel 2: Make some noise online */}
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-3 flex items-center gap-3">
                <h2 className="font-semibold text-lg">Make some noise online</h2>
              </div>
              <div className="mb-4 flex items-start justify-between gap-4">
                <p className="flex-1 text-sm text-muted-foreground">
                  Share your experience and connect with the community on social media.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal("Make some noise online")}
                  className="shrink-0"
                >
                  See more
                </Button>
              </div>
            </div>

            {/* Panel 3: Give us a call */}
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-3 flex items-center gap-3">
                <h2 className="font-semibold text-lg">Give us a call</h2>
              </div>
              <div className="mb-4 flex items-start justify-between gap-4">
                <p className="flex-1 text-sm text-muted-foreground">
                  Have questions or feedback? We'd love to hear from you.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal("Give us a call")}
                  className="shrink-0"
                >
                  See more
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {(() => {
              console.log('[Congrats Modal] Rendering content');
              console.log('[Congrats Modal] modalTitle:', modalTitle);
              console.log('[Congrats Modal] certId:', certId);
              console.log('[Congrats Modal] Condition check:', modalTitle === "Make some noise online" && certId);
              return null;
            })()}
            {modalTitle === "Make some noise online" && certId ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Share your workshop completion certificate on social media!
                </p>
                <div className="rounded-lg border overflow-hidden">
                  <img
                    src={`/${certId}.png`}
                    alt={`Certificate ${certId}`}
                    className="w-full h-auto"
                    onError={(e) => {
                      console.error(`Failed to load certificate image: ${certId}.png`);
                      e.currentTarget.src = '/placeholder-certificate.png';
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Content for "{modalTitle}" will be added here.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setModalOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Congrats;

