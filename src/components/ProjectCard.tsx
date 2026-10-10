import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Clock, IndianRupee, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Recommendation } from "@/lib/recommend";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-label={`Match score ${score} of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-muted" strokeWidth={6} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} className={score >= 70 ? "stroke-primary" : score >= 45 ? "stroke-chart-2" : "stroke-warning"} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-sm font-bold">{score}</span>
    </div>
  );
}

export const inr = (n: number) => (n === 0 ? "Free" : `₹${n.toLocaleString("en-IN")}`);

export function ProjectCard({ rec, list }: { rec: Recommendation; list?: boolean }) {
  const { saved, toggleSave } = useStore();
  const p = rec.project;
  const isSaved = saved.includes(p.id);
  return (
    <article className={cn("group flex gap-4 rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40", list ? "flex-col sm:flex-row sm:items-center" : "flex-col")}>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap gap-1.5">
              <Badge variant="secondary">{p.category}</Badge>
              <Badge variant="outline">{p.difficulty}</Badge>
            </div>
            <h3 className="font-display text-base font-semibold leading-snug">
              <Link to="/projects/$id" params={{ id: p.id }} className="hover:text-primary">{p.title}</Link>
            </h3>
          </div>
          <ScoreRing score={rec.score} />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {p.skills.map((s) => {
            const st = rec.matched.some((m) => m.name === s.name) ? "have" : rec.partial.some((m) => m.name === s.name) ? "partial" : "missing";
            return <span key={s.name} className={cn("rounded-full px-2 py-0.5 text-xs font-medium", st === "have" && "bg-success/15 text-success", st === "partial" && "bg-warning/20 text-warning-foreground", st === "missing" && "bg-muted text-muted-foreground line-through decoration-destructive/60")}>{s.name}</span>;
          })}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><IndianRupee className="size-3.5" />{inr(p.budget)}</span>
          <span className="flex items-center gap-1"><Clock className="size-3.5" />{p.weeks} wks · {p.hoursPerWeek} h/wk</span>
          {rec.budgetMismatch > 0 && <span className="flex items-center gap-1 text-destructive"><AlertTriangle className="size-3.5" />₹{rec.budgetMismatch} over budget</span>}
          {rec.timeMismatch > 0 && <span className="flex items-center gap-1 text-destructive"><AlertTriangle className="size-3.5" />+{rec.timeMismatch} h/wk</span>}
        </div>
      </div>
      <div className="flex gap-2">
        <Button asChild size="sm" className="flex-1"><Link to="/projects/$id" params={{ id: p.id }}>View details</Link></Button>
        <Button size="sm" variant="outline" aria-label={isSaved ? "Remove bookmark" : "Bookmark project"} onClick={() => toast.success(toggleSave(p.id) ? "Project saved" : "Removed from saved")}>
          {isSaved ? <BookmarkCheck className="text-primary" /> : <Bookmark />}
        </Button>
      </div>
    </article>
  );
}
