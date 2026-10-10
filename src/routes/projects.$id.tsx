import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Bookmark, BookmarkCheck, CheckCircle2, Clock, IndianRupee, Rocket, ShieldAlert, Wrench, XCircle, CircleDashed } from "lucide-react";
import { AppShell, RequireProfile } from "@/components/AppShell";
import { ScoreRing, inr } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getProject } from "@/lib/projects";
import { recommend, WEIGHTS } from "@/lib/recommend";
import { useStore } from "@/lib/store";
import { LEVEL_LABEL } from "@/lib/types";
import { meta } from "@/lib/meta";
import { toast } from "sonner";
import type { ReactNode } from "react";

export const Route = createFileRoute("/projects/$id")({
  loader: ({ params }) => { const p = getProject(params.id); if (!p) throw notFound(); return { title: p.title, description: p.description }; },
  head: ({ loaderData }) => loaderData ? meta(`${loaderData.title} — Skill2Project AI`, loaderData.description) : { meta: [{ title: "Project not found" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: () => <AppShell><div className="py-20 text-center"><h1 className="text-2xl font-bold">Project not found</h1><Button asChild className="mt-4"><Link to="/projects">Back to projects</Link></Button></div></AppShell>,
  component: () => <AppShell><RequireProfile><Detail /></RequireProfile></AppShell>,
});

function Card({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return <section className="rounded-2xl border bg-card p-5 shadow-card"><h2 className="mb-3 flex items-center gap-2 font-semibold">{icon}{title}</h2>{children}</section>;
}
const Bullets = ({ items }: { items: string[] }) => <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{items.map((i) => <li key={i}>{i}</li>)}</ul>;

function Detail() {
  const { id } = Route.useParams();
  const { profile, assessments, saved, toggleSave, startProject, userProjects } = useStore();
  const navigate = useNavigate();
  const p = getProject(id)!;
  const r = recommend(profile!, assessments, p);
  const started = userProjects.find((u) => u.projectId === id);
  const isSaved = saved.includes(id);
  const factors = [["Role relevance", r.breakdown.role, WEIGHTS.role], ["Skill compatibility", r.breakdown.skill, WEIGHTS.skill], ["Learning value", r.breakdown.learning, WEIGHTS.learning], ["Difficulty fit", r.breakdown.difficulty, WEIGHTS.difficulty], ["Budget & time", r.breakdown.fit, WEIGHTS.fit]] as const;

  const start = () => { startProject(id); toast.success("Project started", { description: "Added to your portfolio with a task checklist." }); navigate({ to: "/portfolio" }); };

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" />All projects</Link>
      <header className="flex flex-col gap-6 rounded-3xl bg-gradient-soft p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5"><Badge variant="secondary">{p.category}</Badge><Badge variant="outline">{p.difficulty}</Badge>{p.roles.map((x) => <Badge key={x} variant="outline">{x}</Badge>)}</div>
          <h1 className="mt-3 text-3xl font-bold">{p.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{p.description}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm"><span className="flex items-center gap-1"><IndianRupee className="size-4" />{inr(p.budget)}</span><span className="flex items-center gap-1"><Clock className="size-4" />{p.weeks} weeks · {p.hoursPerWeek} h/week</span></div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <ScoreRing score={r.score} size={96} /><span className="text-xs text-muted-foreground">personal match</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.success(toggleSave(id) ? "Project saved" : "Removed from saved")}>{isSaved ? <BookmarkCheck /> : <Bookmark />}{isSaved ? "Saved" : "Save"}</Button>
            {started ? <Button asChild variant="hero"><Link to="/portfolio">Continue</Link></Button> : <Button variant="hero" onClick={start}><Rocket />Start Project</Button>}
          </div>
        </div>
      </header>

      {(r.budgetMismatch > 0 || r.timeMismatch > 0) && (
        <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm" role="alert">
          <AlertTriangle className="size-5 shrink-0 text-destructive" />
          <div>{r.budgetMismatch > 0 && <p>Costs <b>₹{r.budgetMismatch.toLocaleString("en-IN")}</b> more than your ₹{profile!.budget.toLocaleString("en-IN")} budget.</p>}{r.timeMismatch > 0 && <p>Needs <b>{r.timeMismatch} more h/week</b> than your {profile!.hours} h availability.</p>}</div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Why this fits you">
          <Bullets items={r.reasons} />
          <div className="mt-4 space-y-2">{factors.map(([l, v, w]) => <div key={l}><div className="flex justify-between text-xs"><span>{l} ({w * 100}%)</span><span>{Math.round(v * 100)}%</span></div><Progress value={v * 100} className="h-1.5" /></div>)}</div>
        </Card>
        <Card title="Required skills">
          <ul className="space-y-2 text-sm">
            {p.skills.map((s) => { const m = r.matched.find((x) => x.name === s.name), pt = r.partial.find((x) => x.name === s.name); return (
              <li key={s.name} className="flex items-center gap-2">{m ? <CheckCircle2 className="size-4 text-success" /> : pt ? <CircleDashed className="size-4 text-warning" /> : <XCircle className="size-4 text-destructive" />}<span className="flex-1">{s.name}</span><span className="text-xs text-muted-foreground">{pt ? `${LEVEL_LABEL[pt.have]} → ` : ""}{LEVEL_LABEL[s.level]}</span></li>
            ); })}
          </ul>
          <h3 className="mt-4 text-sm font-semibold">Next steps</h3><Bullets items={r.nextSteps} />
        </Card>
        <Card title="Tools & components" icon={<Wrench className="size-4 text-primary" />}><Bullets items={p.tools} /><h3 className="mt-4 text-sm font-semibold">Learning outcomes</h3><Bullets items={p.outcomes} /></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Implementation plan"><ol className="space-y-2 text-sm">{p.steps.map((s, i) => <li key={s} className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">{i + 1}</span>{s}</li>)}</ol></Card>
        <div className="space-y-4">
          <Card title="Testing checklist"><Bullets items={p.testing} /></Card>
          <Card title="Expected outputs"><Bullets items={p.outputs} /></Card>
          <Card title="Future enhancements"><Bullets items={p.enhancements} /></Card>
          {p.safety && <Card title="Safety precautions" icon={<ShieldAlert className="size-4 text-destructive" />}><Bullets items={p.safety} /></Card>}
        </div>
      </div>
    </div>
  );
}
