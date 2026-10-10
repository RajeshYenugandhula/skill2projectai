import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SKILLS } from "@/lib/catalog";
import { LEVEL_LABEL, type Level, type SkillReq } from "@/lib/types";

export function SkillEditor({ value, onChange }: { value: SkillReq[]; onChange: (v: SkillReq[]) => void }) {
  const [custom, setCustom] = useState("");
  const has = (n: string) => value.some((s) => s.name.toLowerCase() === n.toLowerCase());
  const add = (name: string) => { const n = name.trim(); if (n && !has(n)) onChange([...value, { name: n, level: 1 }]); };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {SKILLS.filter((s) => !has(s)).map((s) => (
          <button type="button" key={s} onClick={() => add(s)} className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">+ {s}</button>
        ))}
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); add(custom); setCustom(""); }}>
        <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Add a custom skill" aria-label="Custom skill" maxLength={40} />
        <Button type="submit" variant="outline" disabled={!custom.trim()}><Plus />Add</Button>
      </form>
      {value.length === 0 ? <p className="text-sm text-muted-foreground">No skills added yet.</p> : (
        <ul className="space-y-2">
          {value.map((s, i) => (
            <li key={s.name} className="flex items-center gap-2 rounded-lg border bg-card p-2 pl-3">
              <span className="flex-1 truncate text-sm font-medium">{s.name}</span>
              <Select value={String(s.level)} onValueChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, level: Number(v) as Level } : x)))}>
                <SelectTrigger className="w-36" aria-label={`${s.name} proficiency`}><SelectValue /></SelectTrigger>
                <SelectContent>{([1, 2, 3] as Level[]).map((l) => <SelectItem key={l} value={String(l)}>{LEVEL_LABEL[l]}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${s.name}`} onClick={() => onChange(value.filter((_, j) => j !== i))}><X /></Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
