import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, RequireProfile } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { AcademicFields, PreferenceFields, RoleField } from "@/components/ProfileForm";
import { SkillEditor } from "@/components/SkillEditor";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useStore } from "@/lib/store";
import type { Profile } from "@/lib/types";
import { meta } from "@/lib/meta";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => meta("Profile & Settings — Skill2Project AI", "Edit your academic details, skills, target role, budget and weekly availability."),
  component: () => <AppShell><RequireProfile><Settings /></RequireProfile></AppShell>,
});

function Settings() {
  const { profile, setProfile, reset } = useStore();
  const [p, setP] = useState<Profile>(profile!);
  useEffect(() => setP(profile!), [profile]);
  const navigate = useNavigate();
  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }));
  const dirty = JSON.stringify(p) !== JSON.stringify(profile);
  const save = () => {
    if (!p.name.trim()) { toast.error("Name is required."); return; }
    if (!p.skills.length) { toast.error("Add at least one skill."); return; }
    setProfile(p); toast.success("Profile updated — scores recalculated");
  };
  const sec = (t: string, c: React.ReactNode) => <section className="rounded-2xl border bg-card p-6 shadow-card"><h2 className="mb-4 text-lg font-semibold">{t}</h2>{c}</section>;

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-24">
      <h1 className="text-3xl font-bold">Profile & settings</h1>
      {sec("Academic details", <AcademicFields p={p} set={set} />)}
      {sec("Skills & proficiency", <SkillEditor value={p.skills} onChange={(skills) => set({ skills })} />)}
      {sec("Career goal", <RoleField p={p} set={set} />)}
      {sec("Project preferences", <PreferenceFields p={p} set={set} />)}
      {sec("Data", (
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="destructive">Reset all data</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Reset everything?</AlertDialogTitle><AlertDialogDescription>Your profile, saved projects, portfolio and assessment results in this browser will be deleted.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { reset(); toast.success("All data cleared"); navigate({ to: "/" }); }}>Reset</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl justify-end gap-2">
          <Button variant="outline" disabled={!dirty} onClick={() => setP(profile!)}>Discard</Button>
          <Button variant="hero" disabled={!dirty} onClick={save}>Save & recalculate</Button>
        </div>
      </div>
    </div>
  );
}
