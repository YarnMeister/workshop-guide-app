import { Presentation } from "lucide-react";
import { useParticipant } from "@/hooks/useParticipant";

export const Header = () => {
  const { name } = useParticipant();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Presentation className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Workshop Portal</h1>
            <p className="text-xs text-muted-foreground">Participant Onboarding</p>
          </div>
        </div>
        {name && (
          <div className="text-right">
            <p className="text-sm font-medium text-red-600">Welcome {name}</p>
          </div>
        )}
      </div>
    </header>
  );
};
