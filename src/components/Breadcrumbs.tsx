import { PAGES } from "@/content";
import { Link, useLocation } from "react-router-dom";

export default function Breadcrumbs() {
  const location = useLocation();
  const currentSlug = location.pathname.replace(/^\//, "");
  return (
    <nav aria-label="progress" className="fixed left-0 top-16 bottom-0 w-64 border-r bg-background p-6 overflow-y-auto">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">ONBOARDING PROGRESS</h2>
        <ol className="relative space-y-6">
          {PAGES.map((p, idx) => (
            <li key={p.id} className="relative">
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-semibold ${p.slug === currentSlug ? "border-primary bg-background text-primary shadow-lg shadow-primary/20" : "border-muted bg-background text-muted-foreground"}`}>
                  <span className="text-sm">{idx + 1}</span>
                </div>
                <div className="flex-1 pt-1">
                  <Link to={`/${p.slug}`} className={`font-semibold ${p.slug === currentSlug ? "text-foreground" : "text-muted-foreground"}`}>
                    {`Step ${idx + 1}: ${p.title}`}
                  </Link>
                </div>
              </div>
              {idx < PAGES.length - 1 && (
                <div className={`absolute left-5 top-10 h-6 w-0.5 ${idx + 1 <= PAGES.findIndex(x => x.slug === currentSlug) ? "bg-primary" : "bg-border"}`} />
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}


