import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Brain, Cpu, Target, Route as RouteIcon, ShieldCheck, Gauge, Layers, CircuitBoard, Code2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AppShell } from "@/components/AppShell";
import { ProjectCard } from "@/components/ProjectCard";
import { DEMO_PROFILE, useStore } from "@/lib/store";
import { recommendAll } from "@/lib/recommend";
import { ROLES } from "@/lib/catalog";
import { meta } from "@/lib/meta";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => meta("Skill2Project AI — Build Projects That Build Your Career", "Discover projects tailored to your skills, target job role, budget and experience. Identify skill gaps and build a career-ready portfolio."),
  component: Landing,
});

const STEPS = [
  { icon: Target, t: "Tell us your goal", d: "Add your skills, target role, budget and weekly hours." },
  { icon: Brain, t: "Get scored matches", d: "A transparent 5-factor engine ranks 19 real projects for you." },
  { icon: RouteIcon, t: "Follow the roadmap", d: "Close skill gaps step by step with milestones and tasks." },
  { icon: Layers, t: "Build your portfolio", d: "Track progress, add GitHub links and document learnings." },
];
const BENEFITS = [
  { icon: Gauge, t: "Explainable scores", d: "See exactly why each project fits: role, skills, learning value, difficulty and budget/time." },
  { icon: ShieldCheck, t: "Honest mismatches", d: "Budget and time conflicts are flagged separately, never hidden behind a high score." },
  { icon: Cpu, t: "Hardware + software", d: "Embedded, IoT, VLSI, AI/ML, web and data projects with safety notes for hardware." },
];
const FAQ = [
  ["Is the recommendation random?", "No. Scores are deterministic: role relevance 35%, skill compatibility 30%, learning value 15%, difficulty 10%, budget & time 10%."],
  ["Do I need an account?", "No. Your profile is saved in this browser. Try Demo loads a sample ECE student instantly."],
  ["Does the assessment guarantee job readiness?", "No. It verifies skill levels to improve recommendations — the readiness value is an indicator, not a guarantee."],
  ["Which careers are supported?", `${ROLES.length} roles across embedded, VLSI, IoT, AI/ML, data, web and cloud.`],
];

function Landing() {
  const { startDemo } = useStore();
  const navigate = useNavigate();
  const sample = recommendAll(DEMO_PROFILE).slice(0, 3);
  const demo = () => { startDemo(); toast.success("Demo student loaded", { description: "B.Tech ECE · Embedded Systems Engineer" }); navigate({ to: "/dashboard" }); };

  return (
    <AppShell>
      <section className="relative -mx-4 -mt-8 overflow-hidden bg-gradient-soft px-4 pb-20 pt-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs font-semibold text-accent-foreground">For college students · India</span>
        <h1 className="mx-auto mt-6 max-w-3xl animate-fade-up text-4xl font-extrabold leading-tight sm:text-6xl">
          Build Projects That <span className="text-gradient-brand">Build Your Career.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Discover projects tailored to your skills, target job role, budget, and experience. Identify skill gaps and build a portfolio that supports your career goals.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="hero" size="lg"><Link to="/onboarding">Get Started <ArrowRight /></Link></Button>
          <Button variant="outline" size="lg" onClick={demo}>Try Demo</Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">No sign-up or API keys needed.</p>
      </section>

      <section className="py-16" aria-labelledby="how">
        <h2 id="how" className="text-center text-3xl font-bold">How it works</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.t} className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground"><s.icon className="size-5" /></span><span className="text-xs font-bold text-muted-foreground">STEP {i + 1}</span></div>
              <h3 className="mt-4 font-semibold">{s.t}</h3><p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10" aria-labelledby="roles">
        <h2 id="roles" className="text-center text-3xl font-bold">Supported career roles</h2>
        <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-2">
          {ROLES.map((r, i) => {
            const Icon = [CircuitBoard, Cpu, Brain, Code2, Database][i % 5] ?? Cpu;
            return <span key={r} className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium"><Icon className="size-4 text-primary" />{r}</span>;
          })}
        </div>
      </section>

      <section className="py-16" aria-labelledby="sample">
        <h2 id="sample" className="text-center text-3xl font-bold">Sample recommendations</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">Sample data: top matches for a 2nd-year ECE student targeting Embedded Systems.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">{sample.map((r) => <ProjectCard key={r.project.id} rec={r} />)}</div>
      </section>

      <section className="py-10" aria-labelledby="benefits">
        <h2 id="benefits" className="text-center text-3xl font-bold">Why students use it</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.t} className="rounded-2xl bg-gradient-brand p-px"><div className="h-full rounded-2xl bg-card p-6"><b.icon className="size-6 text-primary" /><h3 className="mt-3 font-semibold">{b.t}</h3><p className="mt-1 text-sm text-muted-foreground">{b.d}</p></div></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-2xl py-16" aria-labelledby="faq">
        <h2 id="faq" className="text-center text-3xl font-bold">FAQ</h2>
        <Accordion type="single" collapsible className="mt-6">
          {(FAQ as [string, string][]).map(([q, a]) => <AccordionItem key={q} value={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{a}</AccordionContent></AccordionItem>)}
        </Accordion>
      </section>
    </AppShell>
  );
}
