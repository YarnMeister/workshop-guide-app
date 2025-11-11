import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useParticipant } from "@/hooks/useParticipant";
import { CredentialsPanel } from "./CredentialsPanel";

export const Header = () => {
  const { name, role } = useParticipant();
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const isFacilitator = role === 'facilitator';
  const welcomeButtonRef = useRef<HTMLButtonElement>(null);
  
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-semibold">Prototyping with AI</h1>
          </div>

          <div className="flex items-center gap-4">
            {name && (
              <div className="text-right">
                {isFacilitator ? (
                  <button
                    ref={welcomeButtonRef}
                    onClick={() => setIsCredentialsOpen(true)}
                    className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 cursor-pointer transition-colors"
                  >
                    Welcome {name}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isCredentialsOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <p className="text-sm font-medium text-red-600">Welcome {name}</p>
                )}
              </div>
            )}
            
            <img 
              src="/reagrouplogo.png" 
              alt="Reagroup Logo" 
              className="h-10 w-auto"
            />
          </div>
        </div>
      </header>
      
      {isFacilitator && (
        <CredentialsPanel 
          isOpen={isCredentialsOpen} 
          onClose={() => setIsCredentialsOpen(false)}
          anchorRef={welcomeButtonRef}
        />
      )}
    </>
  );
};
