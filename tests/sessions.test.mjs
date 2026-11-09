import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
const source = readFileSync(new URL("../app/lib/sessions.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { createSession, restoreSession, completeStory, currentScenario, skipUnavailable, interruptSession, sessionCounts, sessionActivities, upsertSession } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const stories = ["a", "b", "c"].map(id => ({ id, title: id, emotion: "Alegría", status: id === "c" ? "draft" : "published" }));
const date = "2026-10-06T12:00:00.000Z";
const start = () => createSession(["b", "a"], stories, "session", date);
const ready = s => ({ ...s, phase: "activity", progress: { step: 2, answer: "Miedo", cause: "Otra idea" } });

test("adult-selected order and count persist, without an eight-story limit", () => {
  const s = start();
  assert.deepEqual(s.scenarioIds, ["b", "a"]);
  assert.equal(s.phase, "introduction");
  const many = Array.from({ length: 10 }, (_, i) => ({ ...stories[0], id: String(i) }));
  assert.equal(createSession(many.map(s => s.id), many, "long", date).scenarioIds.length, 10);
  assert.equal(currentScenario(s, stories).id, "b");
  assert.throws(() => createSession([], stories, "id", date));
  assert.throws(() => createSession(["a", "a"], stories, "id", date));
  assert.throws(() => createSession(["c"], stories, "id", date));
  assert.throws(() => createSession(["missing"], stories, "id", date));
});

test("complete every story in order regardless of answer, handoff only after last", () => {
  const s = ready(start());
  const first = completeStory(s, stories[1], date);
  assert.equal(first.cursor, 1);
  assert.equal(first.phase, "activity");
  assert.equal(first.progress.answer, "");
  assert.equal(first.activities[0].answer, "Miedo");
  const final = completeStory(ready(first), stories[0], date);
  assert.equal(final.phase, "handoff");
  assert.equal(final.endedEarly, false);
  assert.deepEqual(sessionCounts(final), { completed: 2, pending: 0, skipped: 0 });
  assert.equal(completeStory(final, stories[0], date), final);
  assert.equal(completeStory(s, stories[0], date), s);
  assert.equal(completeStory({ ...s, progress: { ...s.progress, cause: "" } }, stories[1], date).activities.length, 0);
});

test("serialized mid-story and final progress resumes with idempotent activity IDs", () => {
  const partial = { ...ready(start()), progress: { step: 1, answer: "Miedo", cause: "" } };
  assert.deepEqual(restoreSession(JSON.parse(JSON.stringify(partial)), []), partial);
  const first = completeStory(ready(start()), stories[1], date);
  const replay = completeStory(ready(start()), stories[1], date);
  const records = upsertSession(upsertSession([], first), replay);
  assert.equal(records.length, 1);
  assert.equal(sessionActivities([], records).length, 1);
  assert.equal(records[0].activities[0].id, "session:0");
});

test("early finish records partial answers and distinguishes pending from completed", () => {
  const first = completeStory(ready(start()), stories[1], date);
  const interrupted = interruptSession({ ...first, progress: { step: 1, answer: "Enojo", cause: "" } }, stories[0], date);
  assert.equal(interrupted.phase, "handoff");
  assert.equal(interrupted.endedEarly, true);
  assert.deepEqual(sessionCounts(interrupted), { completed: 1, pending: 1, skipped: 0 });
  assert.equal(interrupted.activities[1].status, "interrupted");
  assert.equal(interrupted.activities[1].answer, "Enojo");
  assert.equal(interruptSession(interrupted, stories[0], date), interrupted);
  assert.equal(interruptSession(start(), stories[1], date).activities.length, 0);
});

test("unpublished or deleted stories are inaccessible and skipped, never completed", () => {
  const s = ready(start());
  const changed = stories.map(story => ({ ...story, status: "draft" }));
  assert.equal(currentScenario(s, changed), undefined);
  assert.equal(completeStory(s, changed[1], date), s);
  const skipped = skipUnavailable(s, changed, date);
  assert.equal(skipped.cursor, 1);
  const final = skipUnavailable(skipped, [], date);
  assert.equal(final.phase, "handoff");
  assert.deepEqual(sessionCounts(final), { completed: 0, pending: 0, skipped: 2 });
  assert.equal(final.endedEarly, true);
});

test("legacy single-story sessions and records stay readable without duplicates", () => {
  const legacy = { id: "old", scenarioId: "a", title: "Anterior", date, emotion: "Alegría", answer: "Alegría", cause: "Visita" };
  const restored = restoreSession({ id: "old", scenarioId: "a" }, [legacy]);
  assert.equal(restored.phase, "handoff");
  assert.deepEqual(restored.scenarioIds, ["a"]);
  assert.deepEqual(sessionActivities([legacy], [restored]), [legacy]);
  assert.equal(restoreSession({ id: "new", scenarioId: "a" }, []).phase, "introduction");
  assert.equal(restoreSession(null, []), null);
  assert.equal(restoreSession({ ...start(), cursor: 9 }, []), null);
  assert.equal(restoreSession({ ...start(), scenarioIds: ["a", "a"] }, []), null);
});
