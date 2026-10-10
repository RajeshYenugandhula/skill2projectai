import { ROLE_FAMILY, ROLE_SKILLS } from "./catalog";
import { PROJECTS } from "./projects";
import type { AssessmentResult, Difficulty, Level, Profile, Project, SkillReq } from "./types";
import { DIFFICULTIES, LEVEL_LABEL } from "./types";

export const WEIGHTS = { role: 0.35, skill: 0.3, learning: 0.15, difficulty: 0.1, fit: 0.1 };

export interface Recommendation {
  project: Project;
  score: number;
  breakdown: { role: number; skill: number; learning: number; difficulty: number; fit: number };
  matched: SkillReq[];
  partial: { name: string; have: Level; need: Level }[];
  missing: SkillReq[];
  budgetMismatch: number; // INR over budget, 0 if fine
  timeMismatch: number; // hrs/week over availability
  reasons: string[];
  nextSteps: string[];
}

/** Effective skill level: verified assessment result wins over self-report. */
export function effectiveLevels(profile: Profile, assessments: AssessmentResult[] = []) {
  const map = new Map<string, Level>();
  profile.skills.forEach((s) => map.set(s.name, s.level));
  assessments.forEach((a) => map.set(a.skill, a.level));
  return map;
}

function roleScore(p: Project, role: string) {
  if (p.roles[0] === role) return 1;
  if (p.roles.includes(role)) return 0.8;
  const fam = ROLE_FAMILY[role] ?? [];
  if (p.roles.some((r) => fam.includes(r))) return 0.4;
  return 0;
}

export function recommend(profile: Profile, assessments: AssessmentResult[] = [], project: Project): Recommendation {
  const levels = effectiveLevels(profile, assessments);
  const matched: SkillReq[] = [];
  const partial: Recommendation["partial"] = [];
  const missing: SkillReq[] = [];
  let compat = 0;
  for (const req of project.skills) {
    const have = levels.get(req.name);
    if (!have) missing.push(req);
    else if (have >= req.level) { matched.push(req); compat += 1; }
    else { partial.push({ name: req.name, have, need: req.level }); compat += have / req.level; }
  }
  const skill = project.skills.length ? compat / project.skills.length : 1;
  const role = roleScore(project, profile.targetRole);
  const gaps = missing.length + partial.length;
  const learning = gaps === 0 ? 0.5 : gaps <= 2 ? 1 : gaps === 3 ? 0.6 : 0.3;
  const dd = Math.abs(DIFFICULTIES.indexOf(project.difficulty) - DIFFICULTIES.indexOf(profile.difficulty));
  const difficulty = dd === 0 ? 1 : dd === 1 ? 0.5 : 0;
  const budgetMismatch = Math.max(0, project.budget - profile.budget);
  const timeMismatch = Math.max(0, project.hoursPerWeek - profile.hours);
  const b = budgetMismatch === 0 ? 1 : Math.max(0, 1 - budgetMismatch / Math.max(profile.budget, 500));
  const t = timeMismatch === 0 ? 1 : profile.hours / project.hoursPerWeek;
  const fit = (b + t) / 2;

  const raw = WEIGHTS.role * role + WEIGHTS.skill * skill + WEIGHTS.learning * learning + WEIGHTS.difficulty * difficulty + WEIGHTS.fit * fit;
  const score = Math.round(raw * 100);

  const reasons: string[] = [];
  if (role === 1) reasons.push(`Core project for ${profile.targetRole}.`);
  else if (role >= 0.8) reasons.push(`Directly relevant to ${profile.targetRole}.`);
  else if (role > 0) reasons.push(`Adjacent to ${profile.targetRole} (${project.roles[0]}).`);
  else reasons.push(`Not targeted at ${profile.targetRole} — mainly for ${project.roles[0]}.`);
  if (matched.length) reasons.push(`You already have ${matched.map((m) => m.name).join(", ")}.`);
  if (gaps > 0 && gaps <= 2) reasons.push(`Stretches you on ${gaps} skill${gaps > 1 ? "s" : ""} — a good learning step.`);
  if (gaps === 0) reasons.push("You meet all requirements — good for a quick portfolio win.");
  if (gaps >= 4) reasons.push(`Large gap (${gaps} skills) — consider a beginner project first.`);
  if (difficulty === 1) reasons.push(`Matches your preferred ${profile.difficulty.toLowerCase()} difficulty.`);

  const nextSteps = [
    ...missing.map((m) => `Learn ${m.name} fundamentals to ${LEVEL_LABEL[m.level].toLowerCase()} level.`),
    ...partial.map((p) => `Level up ${p.name} from ${LEVEL_LABEL[p.have]} to ${LEVEL_LABEL[p.need]}.`),
  ];
  if (!nextSteps.length) nextSteps.push("Start the project and document progress for your portfolio.");

  return { project, score, breakdown: { role, skill, learning, difficulty, fit }, matched, partial, missing, budgetMismatch, timeMismatch, reasons, nextSteps };
}

export function recommendAll(profile: Profile, assessments: AssessmentResult[] = []) {
  return PROJECTS.map((p) => recommend(profile, assessments, p)).sort((a, b) => b.score - a.score || a.project.title.localeCompare(b.project.title));
}

/** Readiness indicator: role-skill coverage (60%) + completed relevant projects (40%). Not a hiring guarantee. */
export function readiness(profile: Profile, assessments: AssessmentResult[], completedIds: string[]) {
  const core = ROLE_SKILLS[profile.targetRole] ?? [];
  const levels = effectiveLevels(profile, assessments);
  const coverage = core.length ? core.reduce((a, s) => a + Math.min((levels.get(s) ?? 0) / 2, 1), 0) / core.length : 0;
  const relevant = completedIds.filter((id) => PROJECTS.find((p) => p.id === id)?.roles.includes(profile.targetRole)).length;
  return Math.round(100 * (0.6 * coverage + 0.4 * Math.min(relevant / 3, 1)));
}

export function roleGaps(profile: Profile, assessments: AssessmentResult[]) {
  const levels = effectiveLevels(profile, assessments);
  return (ROLE_SKILLS[profile.targetRole] ?? []).map((name) => ({ name, have: levels.get(name) ?? 0, target: 2 }));
}

export const difficultyOrder = (d: Difficulty) => DIFFICULTIES.indexOf(d);
