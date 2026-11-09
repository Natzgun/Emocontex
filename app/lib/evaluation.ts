import type { Activity, Scenario } from "./scenarios";

export type Feedback = { id: string; date: string; screen: string; observation: string; suggestion: string };

export function completedActivities(activities: Activity[]) {
  return activities.filter(activity => activity.status !== "interrupted");
}

export function recordActivity(activities: Activity[], activity: Activity) {
  if (activities.some(item => item.id === activity.id)) return activities;
  return [...activities, activity];
}

export function hasScenarioContent(scenario: Pick<Scenario, "title" | "story" | "cause" | "explanation">) {
  return [scenario.title, scenario.story, scenario.cause, scenario.explanation].every(value => value.trim().length > 0);
}

export function downloadJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
