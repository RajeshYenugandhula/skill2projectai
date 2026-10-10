import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle } from "lucide-react";
import { AppShell, RequireProfile } from "@/components/AppShell";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useStore } from "@/lib/store";
import { recommendAll, roleGaps } from "@/lib/recommend";
import { getProject } from "@/lib/projects";
import { meta } from "@/lib/meta";
import type { ReactNode } from "react";

export const Route = createFileRoute("/roadmap")({
  head: () => meta("Career Roadmap — Skill2Project AI", "Personalized milestones from skill assessment to capstone and portfolio for your target role."),
  component: () => <AppShell><RequireProfile><Roadmap /></RequireProfile></AppShell>,
});

function Roadmap() {
  const { profile, assessments, userProjects, milestones, toggleMilestone } = useStore();
  const p = profile!;
  const recs = recommendAll(p, assessments).filter((r) => r.project.roles.includes(p.targetRole) || r.breakdown.role > 0);
  const pick = (d: string) => recs.find((r) => r.project.difficulty === d)?.project;
  const gaps = roleGaps(p, assessments).filter((g) => g.have < g.target);
  const relevantIds = new Set(recs.map((r) => r.project.id));
  const done = (d: string) => userProjects.some((u) => u.status === "completed" && relevantIds.has(u.projectId) && getProject(u.projectId)?.difficulty === d);
  const beg = pick("Beginner"), mid = pick("Intermediate"), adv = pick("Advanced");
  const documented = userProjects.some((u) => u.github.trim());

  const ms: { key: string; title: string; auto: boolean; body: ReactNode }[] = [
    { key: "assess", title: "Assess current skills", auto: assessments.length > 0, body: <p>Take at least one <Link to="/assessment" className="text-primary underline">skill assessment</Link> to verify your self-reported levels.</p> },
    { key: "fund", title: "Learn missing fundamentals", auto: gaps.length === 0, body: gaps.length ? <ul className="list-disc pl-5">{gaps.map((g) => <li key={g.name}>{g.name} → intermediate</li>)}</ul> : <p>All core {p.targetRole} skills are at intermediate or above.</p> },
    { key: "beg", title: "Complete a beginner project", auto: done("Beginner"), body: beg ? <p>Suggested: <Link to="/projects/$id" params={{ id: beg.id }} className="text-primary underline">{beg.title}</Link></p> : null },
    { key: "mid", title: "Build an intermediate role-specific project", auto: done("Intermediate"), body: mid ? <p>Suggested: <Link to="/projects/$id" params={{ id: mid.id }} className="text-primary underline">{mid.title}</Link></p> : null },
    { key: "cap", title: "Complete a capstone project", auto: done("Advanced"), body: adv ? <p>Suggested: <Link to="/projects/$id" params={{ id: adv.id }} className="text-primary underline">{adv.title}</Link></p> : null },
    { key: "doc", title: "Document projects and create a portfolio", auto: documented, body: <p>Add GitHub links, challenges and learnings in your <Link to="/portfolio" className="text-primary underline">portfolio</Link>.</p> },
  ];
  const isDone = (m: (typeof ms)[number]) => m.auto || !!milestones[m.key];
  const pct = Math.round((100 * ms.filter(isDone).length) / ms.length);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Your {p.targetRole} roadmap</h1>
      <div className="mt-4 flex items-center gap-3"><Progress value={pct} className="h-2" /><span className="text-sm font-semibold">{pct}%</span></div>
      <ol className="mt-8 space-y-4">
        {ms.map((m, i) => (
          <li key={m.key} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-card">
            {isDone(m) ? <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-success" /> : <Circle className="mt-0.5 size-6 shrink-0 text-muted-foreground" />}
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{i + 1}. {m.title}</h2>
                {m.auto ? <span className="text-xs font-medium text-success">Auto-completed</span> : (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground"><Checkbox checked={!!milestones[m.key]} onCheckedChange={() => toggleMilestone(m.key)} />Mark complete</label>
                )}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{m.body}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
