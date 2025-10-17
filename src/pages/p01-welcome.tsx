import { Header } from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import Step from "@/components/Step";
import { PAGES, STEPS } from "@/content";

export default function P01Welcome() {
  const page = PAGES.find(p => p.id === "P01")!;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Breadcrumbs />
        <main className="ml-64 flex-1 p-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-3xl font-bold tracking-tight">{page.title}</h1>
            {page.steps.map(stepId => (
              <Step key={stepId} {...STEPS[stepId]} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}


