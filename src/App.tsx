import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Welcome from "./pages/Welcome";
import OnboardingStep from "./pages/OnboardingStep";
import Congrats from "./pages/Congrats";
import Insights from "./pages/Insights";
import Inspiration from "./pages/Inspiration";
import ExtendOption from "./pages/ExtendOption";
import NotFound from "./pages/NotFound";
import ErrorBoundary, { ErrorFallback } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary fallback={ErrorFallback}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/onboarding/step/:stepId" element={<OnboardingStep />} />
            <Route path="/congrats" element={<Congrats />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/inspiration" element={<Inspiration />} />
            <Route path="/extend/:optionId" element={<ExtendOption />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Analytics />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
