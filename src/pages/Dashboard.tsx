import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useParticipant } from "@/hooks/useParticipant";

const Dashboard = () => {
  const navigate = useNavigate();
  const { participantId, name } = useParticipant();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          {/* Success icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>

          {/* Heading */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Onboarding Complete!
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Great job{name ? `, ${name}` : participantId ? `, Participant ${participantId}` : ''}! You've successfully completed all onboarding steps and you're ready to start the workshop.
          </p>

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

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/insights")} className="gap-2">
              <BarChart3 className="h-4 w-4" />
              View Property Insights
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Return to Welcome
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
