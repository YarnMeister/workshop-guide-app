import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import OnboardingStep from "./pages/OnboardingStep";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import P01Welcome from "./pages/p01-welcome";
import P02Setup from "./pages/p02-setup";
import P03ConnectAccounts from "./pages/p03-connect-accounts";
import P04FirstTask from "./pages/p04-first-task";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          {/* New slug-based routes driven by content layer */}
          <Route path="/welcome" element={<P01Welcome />} />
          <Route path="/setup" element={<P02Setup />} />
          <Route path="/connect-accounts" element={<P03ConnectAccounts />} />
          <Route path="/first-task" element={<P04FirstTask />} />
          <Route path="/onboarding/step/:stepId" element={<OnboardingStep />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
