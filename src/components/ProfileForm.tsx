import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ROLES } from "@/lib/catalog";
import { CATEGORIES, DIFFICULTIES, type Profile } from "@/lib/types";

type P = Profile;
type Set = (patch: Partial<P>) => void;

export function AcademicFields({ p, set }: { p: P; set: Set }) {
  const f = (k: keyof P, label: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} value={String(p[k])} maxLength={80} onChange={(e) => set({ [k]: e.target.value } as Partial<P>)} />
    </div>
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {f("name", "Full name *")}
      {f("college", "College")}
      {f("degree", "Degree")}
      {f("branch", "Branch")}
      <div className="space-y-1.5">
        <Label>Academic year</Label>
        <Select value={p.year} onValueChange={(v) => set({ year: v })}>
          <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
          <SelectContent>{["First year", "Second year", "Third year", "Final year", "Postgraduate"].map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function RoleField({ p, set }: { p: P; set: Set }) {
  return (
    <div className="space-y-1.5">
      <Label>Target job role *</Label>
      <Select value={p.targetRole} onValueChange={(v) => set({ targetRole: v })}>
        <SelectTrigger aria-label="Target job role"><SelectValue placeholder="Choose a role" /></SelectTrigger>
        <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

export function PreferenceFields({ p, set }: { p: P; set: Set }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label>Preferred difficulty</Label>
        <Select value={p.difficulty} onValueChange={(v) => set({ difficulty: v as P["difficulty"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Preferred category</Label>
        <Select value={p.category} onValueChange={(v) => set({ category: v as P["category"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="Any">Any</SelectItem>{CATEGORIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <Label>Available hours per week: <span className="font-bold text-primary">{p.hours} h</span></Label>
        <Slider min={1} max={20} step={1} value={[p.hours]} onValueChange={([v]) => set({ hours: v ?? 1 })} aria-label="Hours per week" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="budget">Project budget (INR)</Label>
        <Input id="budget" type="number" min={0} max={100000} value={p.budget} onChange={(e) => set({ budget: Math.max(0, Math.min(100000, Number(e.target.value) || 0)) })} />
      </div>
    </div>
  );
}
