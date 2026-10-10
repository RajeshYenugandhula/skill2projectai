import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LayoutGrid, List, Search, X } from "lucide-react";
import { AppShell, RequireProfile } from "@/components/AppShell";
import { ProjectCard } from "@/components/ProjectCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { recommendAll, difficultyOrder } from "@/lib/recommend";
import { ROLES, SKILLS } from "@/lib/catalog";
import { CATEGORIES, DIFFICULTIES } from "@/lib/types";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/projects/")({
  head: () => meta("Project Discovery — Skill2Project AI", "Search and filter projects by role, skills, difficulty, budget, duration and category with personalized match scores."),
  component: () => <AppShell><RequireProfile><Projects /></RequireProfile></AppShell>,
});

const ANY = "any";
function F({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="w-full"><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent><SelectItem value={ANY}>Any {label.toLowerCase()}</SelectItem>{options.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function Projects() {
  const { profile, assessments } = useStore();
  const recs = useMemo(() => recommendAll(profile!, assessments), [profile, assessments]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState(ANY), [skill, setSkill] = useState(ANY), [diff, setDiff] = useState(ANY);
  const [budget, setBudget] = useState(ANY), [dur, setDur] = useState(ANY);
  const [cat, setCat] = useState(profile!.category === "Any" ? ANY : profile!.category);
  const [sort, setSort] = useState("match"), [view, setView] = useState<"grid" | "list">("grid");

  const list = useMemo(() => {
    const out = recs.filter(({ project: p }) =>
      (!q || `${p.title} ${p.description} ${p.tools.join(" ")}`.toLowerCase().includes(q.toLowerCase())) &&
      (role === ANY || p.roles.includes(role)) && (skill === ANY || p.skills.some((s) => s.name === skill)) &&
      (diff === ANY || p.difficulty === diff) && (cat === ANY || p.category === cat) &&
      (budget === ANY || (budget === "mine" ? p.budget <= profile!.budget : p.budget <= Number(budget))) &&
      (dur === ANY || p.weeks <= Number(dur)));
    const s = [...out];
    if (sort === "budget") s.sort((a, b) => a.project.budget - b.project.budget);
    if (sort === "duration") s.sort((a, b) => a.project.weeks - b.project.weeks);
    if (sort === "difficulty") s.sort((a, b) => difficultyOrder(a.project.difficulty) - difficultyOrder(b.project.difficulty));
    return s;
  }, [recs, q, role, skill, diff, cat, budget, dur, sort, profile]);

  const clear = () => { setQ(""); setRole(ANY); setSkill(ANY); setDiff(ANY); setCat(ANY); setBudget(ANY); setDur(ANY); };

  return (
    <div>
      <h1 className="text-3xl font-bold">Discover projects</h1>
      <p className="mt-1 text-muted-foreground">Scores are personalized for {profile!.targetRole} and update as you edit your skills.</p>
      <div className="mt-6 space-y-3 rounded-2xl border bg-card p-4 shadow-card">
        <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search projects, tools…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search projects" /></div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          <F label="Role" value={role} onChange={setRole} options={ROLES.map((r) => ({ v: r, l: r }))} />
          <F label="Skill" value={skill} onChange={setSkill} options={SKILLS.map((r) => ({ v: r, l: r }))} />
          <F label="Difficulty" value={diff} onChange={setDiff} options={DIFFICULTIES.map((r) => ({ v: r, l: r }))} />
          <F label="Budget" value={budget} onChange={setBudget} options={[{ v: "mine", l: `Within my ₹${profile!.budget}` }, { v: "0", l: "Free only" }, { v: "1000", l: "≤ ₹1,000" }, { v: "2500", l: "≤ ₹2,500" }]} />
          <F label="Duration" value={dur} onChange={setDur} options={[{ v: "3", l: "≤ 3 weeks" }, { v: "5", l: "≤ 5 weeks" }, { v: "8", l: "≤ 8 weeks" }]} />
          <F label="Category" value={cat} onChange={setCat} options={CATEGORIES.map((r) => ({ v: r, l: r }))} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">{list.length} project{list.length !== 1 && "s"}</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clear}><X />Clear</Button>
            <Select value={sort} onValueChange={setSort}><SelectTrigger className="w-40" aria-label="Sort"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="match">Best match</SelectItem><SelectItem value="budget">Lowest cost</SelectItem><SelectItem value="duration">Shortest</SelectItem><SelectItem value="difficulty">Easiest first</SelectItem></SelectContent></Select>
            <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" aria-label="Grid view" onClick={() => setView("grid")}><LayoutGrid /></Button>
            <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" aria-label="List view" onClick={() => setView("list")}><List /></Button>
          </div>
        </div>
      </div>
      {list.length === 0 ? (
        <div className="py-20 text-center"><p className="text-muted-foreground">No projects match these filters.</p><Button className="mt-4" variant="outline" onClick={clear}>Clear filters</Button></div>
      ) : (
        <div className={view === "grid" ? "mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "mt-6 flex flex-col gap-3"}>{list.map((r) => <ProjectCard key={r.project.id} rec={r} list={view === "list"} />)}</div>
      )}
    </div>
  );
}
