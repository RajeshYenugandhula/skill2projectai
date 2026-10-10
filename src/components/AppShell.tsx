import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Sparkles, FlaskConical, LogOut } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/projects", label: "Projects" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/assessment", label: "Assessment" },
  { to: "/saved", label: "Saved" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/settings", label: "Settings" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-brand text-primary-foreground shadow-glow"><Sparkles className="size-4" /></span>
      Skill2Project <span className="text-gradient-brand">AI</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, reset } = useStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const exit = () => { reset(); toast.success("Profile cleared"); navigate({ to: "/" }); };

  const links = (onClick?: () => void) => NAV.map((n) => (
    <Link key={n.to} to={n.to} onClick={onClick} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" activeProps={{ className: "bg-accent text-accent-foreground" }}>
      {n.label}
    </Link>
  ));

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <Logo />
          {profile && <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">{links()}</nav>}
          <div className="flex items-center gap-2">
            {profile ? (
              <Button variant="ghost" size="sm" onClick={exit} className="hidden sm:inline-flex"><LogOut />{profile.isDemo ? "Exit demo" : "Reset"}</Button>
            ) : (
              <Button asChild variant="hero" size="sm"><Link to="/onboarding">Get Started</Link></Button>
            )}
            {profile && (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild><Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu"><Menu /></Button></SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <nav className="mt-8 flex flex-col gap-1">{links(() => setOpen(false))}
                    <Button variant="ghost" className="justify-start" onClick={exit}><LogOut />{profile.isDemo ? "Exit demo" : "Reset profile"}</Button>
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
        {profile?.isDemo && (
          <div className="border-t bg-accent/60 px-4 py-1.5 text-center text-xs text-accent-foreground">
            <FlaskConical className="mr-1 inline size-3.5" /> Demo mode — sample student data stored only in this browser. Edit skills in <Link to="/settings" className="font-semibold underline">Settings</Link>.
          </div>
        )}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © 2026 Skill2Project AI · Explainable project recommendations for students
      </footer>
    </div>
  );
}

export function RequireProfile({ children }: { children: ReactNode }) {
  const { profile, hydrated, startDemo } = useStore();
  if (!hydrated) return <div className="py-24 text-center text-muted-foreground" role="status">Loading…</div>;
  if (!profile)
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-2xl font-bold">Set up your profile first</h1>
        <p className="mt-2 text-muted-foreground">Create a profile or explore with a sample student.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="hero"><Link to="/onboarding">Get Started</Link></Button>
          <Button variant="outline" onClick={() => { startDemo(); toast.success("Demo student loaded"); }}>Try Demo</Button>
        </div>
      </div>
    );
  return <>{children}</>;
}
