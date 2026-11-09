import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../app/lib/evaluation.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { completedActivities, recordActivity, hasScenarioContent } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const activity = { id: "session-1", title: "Historia", emotion: "Alegría", answer: "Alegría", cause: "Una visita", date: "2026-10-06" };

test("records completion once and preserves the original response on replay", () => {
  const recorded = recordActivity([], { ...activity, status: "completed" });
  assert.equal(recorded.length, 1);
  assert.equal(recordActivity(recorded, { ...activity, answer: "Miedo" }), recorded);
  assert.equal(recorded[0].answer, "Alegría");
});

test("interrupted sessions remain visible but do not inflate completion counts", () => {
  const records = [activity, { ...activity, id: "session-2", status: "completed" }, { ...activity, id: "session-3", status: "interrupted", answer: "", cause: "" }];
  assert.equal(completedActivities(records).length, 2);
  assert.equal(records.length, 3);
});

test("scenario review cannot save whitespace-only required content", () => {
  const scenario = { title: "Título", story: "Historia", cause: "Causa", explanation: "Explicación" };
  assert.equal(hasScenarioContent(scenario), true);
  for (const field of Object.keys(scenario)) assert.equal(hasScenarioContent({ ...scenario, [field]: "  \n " }), false);
});
