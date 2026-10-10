import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { AppShell, RequireProfile } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ProjectCard } from "@/components/ProjectCard";
import { QUESTIONS, ASSESSABLE } from "@/lib/questions";
import { useStore } from "@/lib/store";
import { recommendAll } from "@/lib/recommend";
import { LEVEL_LABEL, type Level } from "@/lib/types";
import { meta } from "@/lib/meta";
import { toast } from "sonner";

export const Route = createFileRoute("/assessment")({
  head: () => meta("Skill Assessment — Skill2Project AI", "Verify your skill levels with short multiple-choice quizzes and get projects matched to your results."),
  component: () => <AppShell><RequireProfile><Assessment /></RequireProfile></AppShell>,
});

function Assessment() {
  const { profile, assessments, addAssessment } = useStore();
  const [skill, setSkill] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const mine = profile!.skills.map((s) => s.name);
  const ordered = [...ASSESSABLE].sort((a, b) => Number(mine.includes(b)) - Number(mine.includes(a)));

  if (!skill)
    return (
      <div>
        <h1 className="text-3xl font-bold">Skill assessment</h1>
        <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground"><Info className="mt-0.5 size-4 shrink-0" />Results verify your level and override self-reported levels in recommendations. They don't guarantee job readiness.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((s) => { const r = assessments.find((a) => a.skill === s); const self = profile!.skills.find((x) => x.name === s); return (
            <button key={s} onClick={() => { setSkill(s); setAnswers({}); setSubmitted(false); }} className="rounded-2xl border bg-card p-5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/50">
              <h2 className="font-semibold">{s}</h2>
              <p className="text-xs text-muted-foreground">{QUESTIONS[s].length} questions</p>
              <div className="mt-3 flex flex-wrap gap-1">{self && <Badge variant="outline">Self: {LEVEL_LABEL[self.level]}</Badge>}{r ? <Badge>Verified: {LEVEL_LABEL[r.level]} ({r.correct}/{r.total})</Badge> : <Badge variant="secondary">Not taken</Badge>}</div>
            </button>
          ); })}
        </div>
      </div>
    );

  const qs = QUESTIONS[skill];
  const correct = qs.filter((q, i) => answers[i] === q.answer).length;
  const ratio = correct / qs.length;
  const level: Level = ratio >= 0.85 ? 3 : ratio >= 0.5 ? 2 : 1;
  const submit = () => {
    if (Object.keys(answers).length < qs.length) return toast.error("Please answer all questions.");
    setSubmitted(true);
    addAssessment({ skill, correct, total: qs.length, level, date: new Date().toISOString() });
    toast.success(`${skill}: ${LEVEL_LABEL[level]} level verified`);
  };
  const recs = submitted ? recommendAll(profile!, [...assessments.filter((a) => a.skill !== skill), { skill, correct, total: qs.length, level, date: "" }]).filter((r) => r.project.skills.some((s) => s.name === skill)).slice(0, 3) : [];

  return (
    <div className="mx-auto max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => setSkill(null)}>← All assessments</Button>
      <h1 className="mt-2 text-3xl font-bold">{skill}</h1>
      <div className="mt-6 space-y-4">
        {qs.map((q, i) => (
          <fieldset key={i} className="rounded-2xl border bg-card p-5 shadow-card" disabled={submitted}>
            <legend className="sr-only">Question {i + 1}</legend>
            <p className="font-medium">{i + 1}. {q.q}</p>
            <RadioGroup className="mt-3" value={answers[i] !== undefined ? String(answers[i]) : ""} onValueChange={(v) => setAnswers({ ...answers, [i]: Number(v) })}>
              {q.options.map((o, j) => (
                <div key={j} className={`flex items-center gap-2 rounded-lg p-2 ${submitted && j === q.answer ? "bg-success/10" : submitted && answers[i] === j ? "bg-destructive/10" : ""}`}>
                  <RadioGroupItem value={String(j)} id={`q${i}o${j}`} /><Label htmlFor={`q${i}o${j}`} className="font-normal">{o}</Label>
                </div>
              ))}
            </RadioGroup>
            {submitted && <p className="mt-3 flex gap-2 text-sm text-muted-foreground">{answers[i] === q.answer ? <CheckCircle2 className="size-4 shrink-0 text-success" /> : <XCircle className="size-4 shrink-0 text-destructive" />}{q.why}</p>}
          </fieldset>
        ))}
      </div>
      {!submitted ? <Button variant="hero" className="mt-6" onClick={submit}>Submit answers</Button> : (
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl bg-gradient-soft p-6"><h2 className="text-xl font-bold">Result: {correct}/{qs.length} · {LEVEL_LABEL[level]}</h2><p className="text-sm text-muted-foreground">This verified level now feeds your match scores. <Link to="/dashboard" className="text-primary underline">View dashboard</Link></p></div>
          {recs.length > 0 && <><h3 className="font-semibold">Projects using {skill}</h3><div className="grid gap-4 md:grid-cols-3">{recs.map((r) => <ProjectCard key={r.project.id} rec={r} />)}</div></>}
          <Button variant="outline" onClick={() => { setAnswers({}); setSubmitted(false); }}>Retake</Button>
        </div>
      )}
    </div>
  );
}
