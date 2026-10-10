export type Level = 1 | 2 | 3; // 1 Beginner, 2 Intermediate, 3 Advanced
export const LEVEL_LABEL: Record<Level, string> = { 1: "Beginner", 2: "Intermediate", 3: "Advanced" };

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

export type Category = "Software" | "AI/ML" | "Electronics" | "IoT" | "VLSI" | "Hybrid";
export const CATEGORIES: Category[] = ["Software", "AI/ML", "Electronics", "IoT", "VLSI", "Hybrid"];

export interface SkillReq {
  name: string;
  level: Level;
}

export interface Profile {
  name: string;
  college: string;
  degree: string;
  branch: string;
  year: string;
  skills: SkillReq[];
  targetRole: string;
  difficulty: Difficulty;
  hours: number;
  budget: number;
  category: Category | "Any";
  isDemo: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  roles: string[]; // first = primary role
  skills: SkillReq[];
  budget: number; // INR
  weeks: number;
  hoursPerWeek: number;
  tools: string[];
  outcomes: string[];
  steps: string[];
  testing: string[];
  outputs: string[];
  enhancements: string[];
  safety?: string[];
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  doneAt?: string | undefined;
}

export interface UserProject {
  id: string;
  projectId: string;
  status: "in_progress" | "completed";
  startedAt: string;
  completedAt?: string | undefined;
  tasks: Task[];
  github: string;
  demo: string;
  technologies: string;
  challenges: string;
  learnings: string;
}

export interface AssessmentResult {
  skill: string;
  correct: number;
  total: number;
  level: Level;
  date: string;
}
