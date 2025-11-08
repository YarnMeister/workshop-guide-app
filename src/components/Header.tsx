import { Presentation, BarChart3, Home } from "lucide-react";
import { useParticipant } from "@/hooks/useParticipant";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export const Header = () => {
  const { name, isAuthenticated } = useParticipant();
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold">Prototyping with AI</h1>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <nav className="flex items-center gap-2">
              <Button
                variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={location.pathname === '/insights' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/insights')}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Insights
              </Button>
            </nav>
          )}
          
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
