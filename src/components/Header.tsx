import { useParticipant } from "@/hooks/useParticipant";

export const Header = () => {
  const { name } = useParticipant();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold">Prototyping with AI</h1>
        </div>

        <div className="flex items-center gap-4">
          {name && (
            <div className="text-right">
              <p className="text-sm font-medium text-red-600">Welcome {name}</p>
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
  );
};
