import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { AppShell, RequireProfile } from "@/components/AppShell";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { recommendAll } from "@/lib/recommend";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/saved")({
  head: () => meta("Saved Projects — Skill2Project AI", "Your bookmarked projects with up-to-date match scores."),
  component: () => <AppShell><RequireProfile><Saved /></RequireProfile></AppShell>,
});

function Saved() {
  const { profile, assessments, saved } = useStore();
  const recs = recommendAll(profile!, assessments).filter((r) => saved.includes(r.project.id));
  return (
    <div>
      <h1 className="text-3xl font-bold">Saved projects</h1>
      {recs.length === 0 ? (
        <div className="py-20 text-center"><Bookmark className="mx-auto size-10 text-muted-foreground" /><p className="mt-3 text-muted-foreground">You haven't saved any projects yet.</p><Button asChild className="mt-4" variant="hero"><Link to="/projects">Browse projects</Link></Button></div>
      ) : <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{recs.map((r) => <ProjectCard key={r.project.id} rec={r} />)}</div>}
    </div>
  );
}
