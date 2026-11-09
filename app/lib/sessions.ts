import type { Activity, Scenario } from "./scenarios";

export type StoryProgress = { step: number; answer: string; cause: string };
export type PracticeSession = {
  version: 2; id: string; startedAt: string; scenarioIds: string[]; cursor: number;
  phase: "introduction" | "activity" | "handoff"; progress: StoryProgress;
  activities: Activity[]; skipped: string[]; endedAt?: string; endedEarly?: boolean;
};
export const emptyProgress: StoryProgress = { step: 0, answer: "", cause: "" };
export const sessionsKey = "emocontex-sessions-v2";
export const activeSessionKey = "emocontex-session-v1";

export function createSession(ids: string[], scenarios: Scenario[], id: string, date: string): PracticeSession {
  if (!ids.length || new Set(ids).size !== ids.length || ids.some(key => !scenarios.some(s => s.id === key && s.status === "published"))) throw new Error("Select published stories only");
  return { version: 2, id, startedAt: date, scenarioIds: [...ids], cursor: 0, phase: "introduction", progress: { ...emptyProgress }, activities: [], skipped: [] };
}

export function restoreSession(value: unknown, legacy: Activity[]): PracticeSession | null {
  if (!value || typeof value !== "object") return null;
  const s = value as Partial<PracticeSession> & { scenarioId?: string };
  if (typeof s.id !== "string" || !s.id) return null;
  if (s.version === 2) {
    if (!Array.isArray(s.scenarioIds) || !s.scenarioIds.length || !s.scenarioIds.every(id => typeof id === "string") || new Set(s.scenarioIds).size !== s.scenarioIds.length || !Number.isInteger(s.cursor) || s.cursor! < 0 || s.cursor! >= s.scenarioIds.length || !["introduction", "activity", "handoff"].includes(s.phase!) || !Array.isArray(s.activities) || !Array.isArray(s.skipped) || !s.progress || ![0, 1, 2].includes(s.progress.step) || typeof s.progress.answer !== "string" || typeof s.progress.cause !== "string") return null;
    return s as PracticeSession;
  }
  if (typeof s.scenarioId !== "string") return null;
  const recorded = legacy.find(a => a.id === s.id);
  return { version: 2, id: s.id, startedAt: recorded?.date ?? "", scenarioIds: [s.scenarioId], cursor: 0, phase: recorded ? "handoff" : "introduction", progress: { ...emptyProgress }, activities: recorded ? [recorded] : [], skipped: [], ...(recorded ? { endedAt: recorded.date, endedEarly: recorded.status === "interrupted" } : {}) };
}

export function currentScenario(session: PracticeSession, scenarios: Scenario[]) {
  return scenarios.find(s => s.id === session.scenarioIds[session.cursor] && s.status === "published");
}
export function upsertSession(sessions: PracticeSession[], session: PracticeSession) {
  return [...sessions.filter(s => s.id !== session.id), session];
}
export function sessionActivities(legacy: Activity[], sessions: PracticeSession[]) {
  const records = new Map(legacy.map(a => [a.id, a]));
  for (const s of sessions) for (const a of s.activities) records.set(a.id, a);
  return [...records.values()];
}
export function sessionCounts(s: PracticeSession) {
  const completed = s.activities.filter(a => a.status !== "interrupted").length;
  return { completed, skipped: s.skipped.length, pending: s.scenarioIds.length - completed - s.skipped.length };
}
export function finishSession(s: PracticeSession, date: string): PracticeSession {
  if (s.phase === "handoff") return s;
  return { ...s, phase: "handoff", endedAt: date, endedEarly: sessionCounts(s).completed !== s.scenarioIds.length };
}
export function advanceSession(s: PracticeSession, date: string): PracticeSession {
  if (s.cursor === s.scenarioIds.length - 1) return finishSession(s, date);
  return { ...s, cursor: s.cursor + 1, progress: { ...emptyProgress } };
}
export function completeStory(s: PracticeSession, scenario: Scenario, date: string): PracticeSession {
  if (s.phase !== "activity" || scenario.id !== s.scenarioIds[s.cursor] || scenario.status !== "published" || !s.progress.answer || !s.progress.cause) return s;
  const id = `${s.id}:${s.cursor}`;
  if (s.activities.some(a => a.id === id)) return s;
  const activity: Activity = { id, scenarioId: scenario.id, title: scenario.title, emotion: scenario.emotion, answer: s.progress.answer, cause: s.progress.cause, status: "completed", date };
  return advanceSession({ ...s, activities: [...s.activities, activity] }, date);
}
export function skipUnavailable(s: PracticeSession, scenarios: Scenario[], date: string) {
  if (s.phase !== "activity" || currentScenario(s, scenarios)) return s;
  return advanceSession({ ...s, skipped: [...new Set([...s.skipped, s.scenarioIds[s.cursor]])] }, date);
}
export function interruptSession(s: PracticeSession, scenario: Scenario | undefined, date: string) {
  if (s.phase === "handoff") return s;
  const id = `${s.id}:${s.cursor}`;
  const activity: Activity | null = s.phase === "activity" && scenario && !s.activities.some(a => a.id === id) ? { id, scenarioId: scenario.id, title: scenario.title, emotion: scenario.emotion, answer: s.progress.answer, cause: s.progress.cause, status: "interrupted", date } : null;
  return finishSession({ ...s, activities: activity ? [...s.activities, activity] : s.activities }, date);
}
