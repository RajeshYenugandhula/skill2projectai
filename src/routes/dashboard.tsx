import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Compass, FolderKanban, GraduationCap, Rocket, Trophy, ListChecks } from "lucide-react";
import { AppShell, RequireProfile } from "@/components/AppShell";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { readiness, recommendAll, roleGaps } from "@/lib/recommend";
import { LEVEL_LABEL } from "@/lib/types";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/dashboard")({
  head: () => meta("Dashboard — Skill2Project AI", "Your skills, recommended projects, skill gaps, weekly progress and roadmap at a glance."),
  component: () => <AppShell><RequireProfile><Dashboard /></RequireProfile></AppShell>,
});

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Rocket; label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between text-sm text-muted-foreground">{label}<Icon className="size-4 text-primary" /></div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Dashboard() {
  const { profile, assessments, userProjects } = useStore();
  const p = profile!;
  const recs = useMemo(() => recommendAll(p, assessments), [p, assessments]);
  const strong = recs.filter((r) => r.score >= 60);
  const completed = userProjects.filter((u) => u.status === "completed");
  const ready = readiness(p, assessments, completed.map((c) => c.projectId));
  const gaps = roleGaps(p, assessments).map((g) => ({ skill: g.name, You: g.have, Target: g.target }));

  const weekly = useMemo(() => {
    const now = Date.now(), wk = 7 * 864e5;
    return Array.from({ length: 6 }, (_, i) => {
      const end = now - (5 - i) * wk, start = end - wk;
      const n = userProjects.flatMap((u) => u.tasks).filter((t) => t.doneAt && +new Date(t.doneAt) > start && +new Date(t.doneAt) <= end).length;
      return { week: i === 5 ? "This wk" : `-${5 - i}w`, Tasks: n };
    });
  }, [userProjects]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{p.degree} {p.branch} · {p.year}</p>
          <h1 className="text-3xl font-bold">Welcome back, {p.name.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-muted-foreground">Targeting <span className="font-semibold text-foreground">{p.targetRole}</span> · ₹{p.budget.toLocaleString("en-IN")} budget · {p.hours} h/week</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="hero"><Link to="/projects"><Compass />Explore projects</Link></Button>
          <Button asChild variant="outline"><Link to="/assessment"><GraduationCap />Take assessment</Link></Button>
          <Button asChild variant="outline"><Link to="/settings">Edit skills</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Compass} label="Strong matches" value={strong.length} hint={`Score ≥ 60 of ${recs.length} projects`} />
        <Stat icon={Rocket} label="Projects started" value={userProjects.length} />
        <Stat icon={Trophy} label="Completed" value={completed.length} />
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between text-sm text-muted-foreground">Career readiness<Badge variant="secondary">indicator</Badge></div>
          <div className="mt-2 font-display text-3xl font-bold">{ready}%</div>
          <Progress value={ready} className="mt-2 h-2" />
          <p className="mt-1 text-xs text-muted-foreground">Role-skill coverage + relevant completed projects. Not a hiring guarantee.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border bg-card p-5 shadow-card">
          <h2 className="font-semibold">Your skills</h2>
          <ul className="mt-3 space-y-2">
            {p.skills.map((s) => {
              const a = assessments.find((x) => x.skill === s.name);
              return <li key={s.name} className="flex items-center justify-between gap-2 text-sm"><span className="truncate">{s.name}</span><span className="flex gap-1"><Badge variant="outline">{LEVEL_LABEL[s.level]} (self)</Badge>{a && <Badge>{LEVEL_LABEL[a.level]} ✓</Badge>}</span></li>;
            })}
          </ul>
        </section>
        <section className="rounded-2xl border bg-card p-5 shadow-card lg:col-span-2">
          <h2 className="font-semibold">Skill-gap analysis · {p.targetRole}</h2>
          <p className="text-xs text-muted-foreground">0 none · 1 beginner · 2 intermediate (target) · 3 advanced</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer>
              <BarChart data={gaps}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="skill" tick={{ fontSize: 11 }} interval={0} angle={-15} height={50} /><YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} /><Tooltip /><Legend /><Bar dataKey="You" fill="var(--chart-1)" radius={[6, 6, 0, 0]} /><Bar dataKey="Target" fill="var(--chart-3)" radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border bg-card p-5 shadow-card lg:col-span-2">
          <h2 className="font-semibold">Weekly progress</h2>
          <p className="text-xs text-muted-foreground">Tasks you've completed per week{userProjects.length === 0 && " — start a project to see data"}</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer><LineChart data={weekly}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="week" /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="Tasks" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl border bg-card p-5 shadow-card">
          <h2 className="font-semibold">Active projects</h2>
          {userProjects.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No projects started yet.</p> : (
            <ul className="mt-3 space-y-3">
              {userProjects.map((u) => { const d = u.tasks.filter((t) => t.done).length; return (
                <li key={u.id}><Link to="/portfolio" className="text-sm font-medium hover:text-primary">{recs.find((r) => r.project.id === u.projectId)?.project.title}</Link><Progress value={(100 * d) / u.tasks.length} className="mt-1 h-1.5" /><span className="text-xs text-muted-foreground">{d}/{u.tasks.length} tasks</span></li>
              ); })}
            </ul>
          )}
          <div className="mt-4 flex gap-2"><Button asChild size="sm" variant="outline"><Link to="/roadmap"><ListChecks />Roadmap</Link></Button><Button asChild size="sm" variant="outline"><Link to="/portfolio"><FolderKanban />Portfolio</Link></Button></div>
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Top recommendations</h2><Link to="/projects" className="text-sm font-medium text-primary">View all →</Link></div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{recs.slice(0, 6).map((r) => <ProjectCard key={r.project.id} rec={r} />)}</div>
      </section>
    </div>
  );
}
