import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EXTEND_OPTIONS = {
  "integrate-api": {
    title: "Integrate real data using an API",
    content: "Detailed instructions for integrating real data using an API will be added here."
  },
  "add-ai-assistant": {
    title: "Add an AI Assistant in your app workflow",
    content: "Detailed instructions for adding an AI Assistant to your app workflow will be added here."
  },
  "add-database": {
    title: "Add a full Database",
    content: "Detailed instructions for adding a full database to your application will be added here."
  }
};

const ExtendOption = () => {
  const { optionId } = useParams();
  const navigate = useNavigate();
  
  const option = optionId ? EXTEND_OPTIONS[optionId as keyof typeof EXTEND_OPTIONS] : null;

  if (!option) {
    navigate("/onboarding/step/8");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back button */}
      <div className="border-b bg-background px-6 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            navigate('/onboarding/step/8');
          }}
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{option.title}</h1>
          <p className="text-lg text-muted-foreground">{option.content}</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <p className="text-muted-foreground">Content for this option will be added here.</p>
        </div>
      </div>
    </div>
  );
};

export default ExtendOption;

