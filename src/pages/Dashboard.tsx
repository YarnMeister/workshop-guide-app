import { useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { CheckCircle2 } from "lucide-react";
import { useParticipant } from "@/hooks/useParticipant";

// Declare VANTA global type
declare global {
  interface Window {
    VANTA: any;
  }
}

const Dashboard = () => {
  const { participantId, name } = useParticipant();
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
        {/* Congratulations text in left bottom quadrant */}
        <div className="relative z-10 h-full flex items-end pl-6 pb-6">
          <h1 className="text-4xl font-bold text-white">
            Congratulations, you made it!
          </h1>
        </div>
      </div>
      
      <main className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          {/* Success card */}
          <div className="mb-8 rounded-xl border bg-card p-8 text-left">
            <h2 className="mb-4 text-xl font-semibold">What's Next?</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>Join the live workshop session at the scheduled time</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>Access your workshop materials and resources</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>Connect with fellow participants in the community</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>Start working on your first project</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
