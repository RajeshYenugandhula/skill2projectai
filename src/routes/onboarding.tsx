import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AcademicFields, PreferenceFields, RoleField } from "@/components/ProfileForm";
import { SkillEditor } from "@/components/SkillEditor";
import { useStore } from "@/lib/store";
import type { Profile } from "@/lib/types";
import { meta } from "@/lib/meta";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => meta("Create your profile — Skill2Project AI", "Tell us your skills, target role, budget and availability to get personalized project recommendations."),
  component: Onboarding,
});

const BLANK: Profile = { name: "", college: "", degree: "B.Tech", branch: "", year: "Second year", skills: [], targetRole: "", difficulty: "Beginner", hours: 6, budget: 2000, category: "Any", isDemo: false };
const TITLES = ["Academic details", "Skills & proficiency", "Target role", "Preferences"];

function Onboarding() {
  const { setProfile, profile } = useStore();
  const [p, setP] = useState<Profile>(profile && !profile.isDemo ? profile : BLANK);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }));

  const error = step === 0 && !p.name.trim() ? "Please enter your name." : step === 1 && p.skills.length === 0 ? "Add at least one skill." : step === 2 && !p.targetRole ? "Choose a target role." : null;
  const next = () => {
    if (error) return toast.error(error);
    if (step < 3) return setStep(step + 1);
    setProfile({ ...p, name: p.name.trim(), isDemo: false });
    toast.success("Profile created — here are your matches");
    navigate({ to: "/dashboard" });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Let's personalize your projects</h1>
        <ol className="mt-6 flex gap-2" aria-label="Steps">
          {TITLES.map((t, i) => (
            <li key={t} className="flex flex-1 flex-col gap-1">
              <Progress value={i <= step ? 100 : 0} className="h-1.5" />
              <span className={`hidden text-xs sm:block ${i === step ? "font-semibold text-primary" : "text-muted-foreground"}`}>{i < step && <Check className="mr-1 inline size-3" />}{t}</span>
            </li>
          ))}
        </ol>
        <section className="mt-6 rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="mb-5 text-xl font-semibold">{TITLES[step]}</h2>
          {step === 0 && <AcademicFields p={p} set={set} />}
          {step === 1 && <SkillEditor value={p.skills} onChange={(skills) => set({ skills })} />}
          {step === 2 && <RoleField p={p} set={set} />}
          {step === 3 && <PreferenceFields p={p} set={set} />}
          {error && <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>}
        </section>
        <div className="mt-6 flex justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
          <Button variant="hero" onClick={next}>{step === 3 ? "See my recommendations" : "Continue"}</Button>
        </div>
      </div>
    </AppShell>
  );
}
