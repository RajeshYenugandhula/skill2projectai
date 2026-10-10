import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AssessmentResult, Profile, UserProject } from "./types";
import { getProject } from "./projects";

const KEY = "skill2project:v1";

export interface AppState {
  profile: Profile | null;
  saved: string[];
  userProjects: UserProject[];
  milestones: Record<string, boolean>;
  assessments: AssessmentResult[];
}

const EMPTY: AppState = { profile: null, saved: [], userProjects: [], milestones: {}, assessments: [] };

export const DEMO_PROFILE: Profile = {
  name: "Aarav (Demo)", college: "Demo Institute of Technology", degree: "B.Tech", branch: "ECE", year: "Second year",
  skills: [{ name: "C Programming", level: 2 }, { name: "Python", level: 1 }, { name: "Digital Electronics", level: 2 }],
  targetRole: "Embedded Systems Engineer", difficulty: "Beginner", hours: 6, budget: 2000, category: "Any", isDemo: true,
};

const uid = () => Math.random().toString(36).slice(2, 10);

interface Ctx extends AppState {
  hydrated: boolean;
  setProfile: (p: Profile) => void;
  startDemo: () => void;
  reset: () => void;
  toggleSave: (id: string) => boolean;
  startProject: (id: string) => UserProject;
  updateUserProject: (id: string, patch: Partial<UserProject>) => void;
  toggleTask: (upId: string, taskId: string) => void;
  addTask: (upId: string, title: string) => void;
  deleteUserProject: (id: string) => void;
  toggleMilestone: (key: string) => void;
  addAssessment: (r: AssessmentResult) => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch { /* ignore corrupt storage */ }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), []);

  const startProjectImpl = useCallback((id: string): UserProject => {
    const existing = state.userProjects.find((u) => u.projectId === id);
    if (existing) return existing;
    const p = getProject(id)!;
    const up: UserProject = {
      id: uid(), projectId: id, status: "in_progress", startedAt: new Date().toISOString(),
      tasks: [...p.steps, ...p.testing.map((t) => `Test: ${t}`), "Write README and push to GitHub"].map((title) => ({ id: uid(), title, done: false })),
      github: "", demo: "", technologies: p.tools.join(", "), challenges: "", learnings: "",
    };
    setState((s) => ({ ...s, userProjects: [...s.userProjects, up], saved: s.saved.includes(id) ? s.saved : [...s.saved, id] }));
    return up;
  }, [state.userProjects]);

  const value = useMemo<Ctx>(() => ({
    ...state,
    hydrated,
    setProfile: (p) => update((s) => ({ ...s, profile: p })),
    startDemo: () => setState({ ...EMPTY, profile: DEMO_PROFILE }),
    reset: () => setState(EMPTY),
    toggleSave: (id) => {
      const willSave = !state.saved.includes(id);
      update((s) => ({ ...s, saved: willSave ? [...s.saved, id] : s.saved.filter((x) => x !== id) }));
      return willSave;
    },
    startProject: startProjectImpl,
    updateUserProject: (id, patch) => update((s) => ({ ...s, userProjects: s.userProjects.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),
    toggleTask: (upId, taskId) => update((s) => ({
      ...s,
      userProjects: s.userProjects.map((u) => {
        if (u.id !== upId) return u;
        const tasks = u.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done, doneAt: !t.done ? new Date().toISOString() : undefined } : t));
        const all = tasks.every((t) => t.done);
        return { ...u, tasks, status: all ? "completed" : "in_progress", completedAt: all ? new Date().toISOString() : undefined };
      }),
    })),
    addTask: (upId, title) => update((s) => ({ ...s, userProjects: s.userProjects.map((u) => (u.id === upId ? { ...u, status: "in_progress", completedAt: undefined, tasks: [...u.tasks, { id: uid(), title, done: false }] } : u)) })),
    deleteUserProject: (id) => update((s) => ({ ...s, userProjects: s.userProjects.filter((u) => u.id !== id) })),
    toggleMilestone: (key) => update((s) => ({ ...s, milestones: { ...s.milestones, [key]: !s.milestones[key] } })),
    addAssessment: (r) => update((s) => ({ ...s, assessments: [...s.assessments.filter((a) => a.skill !== r.skill), r] })),
  }), [state, hydrated, update, startProjectImpl]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}
