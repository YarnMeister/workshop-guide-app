export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <img 
            src="/proptechlogo.png" 
            alt="PropTech Logo" 
            className="h-10 w-auto"
          />
          <div>
            <h1 className="text-lg font-semibold">Workshop Portal</h1>
            <p className="text-xs text-muted-foreground">Participant Onboarding</p>
          </div>
        </div>
        <div className="flex items-center">
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
