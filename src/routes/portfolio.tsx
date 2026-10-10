import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FolderKanban, Github, Globe, Pencil, Plus, Trash2, Trophy } from "lucide-react";
import { AppShell, RequireProfile } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useStore } from "@/lib/store";
import { getProject } from "@/lib/projects";
import type { UserProject } from "@/lib/types";
import { meta } from "@/lib/meta";
import { toast } from "sonner";

export const Route = createFileRoute("/portfolio")({
  head: () => meta("Portfolio — Skill2Project AI", "Track your started and completed projects, tasks, GitHub links, demos and learnings."),
  component: () => <AppShell><RequireProfile><Portfolio /></RequireProfile></AppShell>,
});

const isUrl = (s: string) => !s || /^https?:\/\/\S+\.\S+/.test(s);

function EditDialog({ up, onClose }: { up: UserProject; onClose: () => void }) {
  const { updateUserProject } = useStore();
  const [f, setF] = useState(up);
  const save = () => {
    if (!isUrl(f.github) || !isUrl(f.demo)) return toast.error("Links must start with http:// or https://");
    updateUserProject(up.id, { github: f.github.trim(), demo: f.demo.trim(), technologies: f.technologies, challenges: f.challenges, learnings: f.learnings });
    toast.success("Portfolio entry updated"); onClose();
  };
  const field = (k: "github" | "demo", l: string) => <div className="space-y-1.5"><Label htmlFor={k}>{l}</Label><Input id={k} value={f[k]} placeholder="https://" onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>;
  const area = (k: "technologies" | "challenges" | "learnings", l: string) => <div className="space-y-1.5"><Label htmlFor={k}>{l}</Label><Textarea id={k} rows={2} maxLength={1000} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit {getProject(up.projectId)?.title}</DialogTitle></DialogHeader>
        <div className="space-y-3">{field("github", "GitHub repository")}{field("demo", "Demo URL")}{area("technologies", "Technologies used")}{area("challenges", "Challenges")}{area("learnings", "Learning outcomes")}</div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Entry({ up }: { up: UserProject }) {
  const { toggleTask, addTask, deleteUserProject } = useStore();
  const [edit, setEdit] = useState(false);
  const [t, setT] = useState("");
  const p = getProject(up.projectId)!;
  const done = up.tasks.filter((x) => x.done).length;
  return (
    <article className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge variant={up.status === "completed" ? "default" : "secondary"}>{up.status === "completed" ? "Completed" : "In progress"}</Badge>
          <h2 className="mt-2 text-lg font-semibold"><Link to="/projects/$id" params={{ id: p.id }} className="hover:text-primary">{p.title}</Link></h2>
          <p className="text-xs text-muted-foreground">Started {new Date(up.startedAt).toLocaleDateString("en-IN")}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEdit(true)}><Pencil />Edit</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button size="sm" variant="ghost" aria-label="Delete entry"><Trash2 /></Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Delete this portfolio entry?</AlertDialogTitle><AlertDialogDescription>Tasks and notes for "{p.title}" will be removed. This can't be undone.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteUserProject(up.id); toast.success("Entry deleted"); }}>Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3"><Progress value={(100 * done) / up.tasks.length} className="h-2" /><span className="text-xs font-semibold">{done}/{up.tasks.length}</span></div>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Tasks</h3>
          <ul className="mt-2 space-y-1.5">
            {up.tasks.map((x) => <li key={x.id}><label className="flex items-start gap-2 text-sm"><Checkbox className="mt-0.5" checked={x.done} onCheckedChange={() => { toggleTask(up.id, x.id); if (!x.done && done + 1 === up.tasks.length) toast.success("🎉 Project completed!"); }} /><span className={x.done ? "text-muted-foreground line-through" : ""}>{x.title}</span></label></li>)}
          </ul>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (t.trim()) { addTask(up.id, t.trim()); setT(""); } }}>
            <Input value={t} onChange={(e) => setT(e.target.value)} placeholder="Add a task" aria-label="New task" maxLength={120} /><Button type="submit" size="icon" variant="outline" aria-label="Add task" disabled={!t.trim()}><Plus /></Button>
          </form>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-3">{up.github ? <a href={up.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Github className="size-4" />Repository</a> : <span className="flex items-center gap-1 text-muted-foreground"><Github className="size-4" />No repo yet</span>}{up.demo && <a href={up.demo} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Globe className="size-4" />Demo</a>}</div>
          {(["technologies", "challenges", "learnings"] as const).map((k) => <div key={k}><dt className="font-semibold capitalize">{k}</dt><dd className="text-muted-foreground">{up[k] || "—"}</dd></div>)}
        </dl>
      </div>
      {edit && <EditDialog up={up} onClose={() => setEdit(false)} />}
    </article>
  );
}

function Portfolio() {
  const { userProjects } = useStore();
  const completed = userProjects.filter((u) => u.status === "completed").length;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl font-bold">Portfolio</h1><p className="text-muted-foreground">{userProjects.length} projects · <Trophy className="inline size-4 text-primary" /> {completed} completed</p></div>
        <Button asChild variant="outline"><Link to="/projects">Find another project</Link></Button>
      </div>
      {userProjects.length === 0 ? (
        <div className="py-20 text-center"><FolderKanban className="mx-auto size-10 text-muted-foreground" /><p className="mt-3 text-muted-foreground">Start a project to create your first portfolio entry.</p><Button asChild className="mt-4" variant="hero"><Link to="/projects">Browse projects</Link></Button></div>
      ) : <div className="mt-6 space-y-4">{userProjects.map((u) => <Entry key={u.id} up={u} />)}</div>}
    </div>
  );
}
