import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
const source = readFileSync(new URL("../app/lib/narration.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { selectSpanishVoice, narrationRate, createNarration } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const voice = (lang, name = lang) => ({ lang, name, voiceURI: name, default: false, localService: true });

test("selection respects Spanish saved voice, then Peru, Latin America and other Spanish", () => {
  const voices = [voice("en-US"), voice("es-ES", "Natural"), voice("es-MX"), voice("es-PE")];
  assert.equal(selectSpanishVoice(voices).lang, "es-PE");
  assert.equal(selectSpanishVoice(voices, "Natural").lang, "es-ES");
  assert.equal(selectSpanishVoice(voices, "en-US").lang, "es-PE");
  assert.equal(selectSpanishVoice(voices.slice(0, 3), "missing").lang, "es-MX");
  assert.equal(selectSpanishVoice(voices.slice(0, 2)).lang, "es-ES");
  assert.equal(selectSpanishVoice([voice("en-US")]), undefined);
  assert.equal(selectSpanishVoice([voice("ES_pe")]).lang, "ES_pe");
});
test("voice-name hints only rank within locale tier; ordering is deterministic", () => {
  const voices = [voice("es-MX", "Z"), voice("es-MX", "A"), voice("es-ES", "Neural")];
  assert.equal(selectSpanishVoice(voices).name, "A");
  assert.equal(selectSpanishVoice([...voices].reverse()).name, "A");
  assert.equal(selectSpanishVoice([...voices, voice("es-MX", "Natural")]).name, "Natural");
});
test("old, invalid and arbitrary rates default to normal; optional slower rate is preserved", () => {
  for (const input of [undefined, null, NaN, Infinity, -1, 0.85, "0.9", 10]) assert.equal(narrationRate(input), 1);
  assert.equal(narrationRate(0.9), 0.9);
});
function harness() {
  const synth = new EventTarget();
  let voices = [];
  const spoken = [];
  let cancellations = 0;
  synth.getVoices = () => voices;
  synth.speak = speech => spoken.push(speech);
  synth.cancel = () => { cancellations++; };
  const controller = createNarration();
  const disconnect = controller.connect(synth, text => ({ text }));
  return { synth, controller, spoken, disconnect, get cancellations() { return cancellations; }, load(next) { voices = next; synth.dispatchEvent(new Event("voiceschanged")); } };
}
test("asynchronous voice loading updates choices without automatically speaking", () => {
  const h = harness();
  h.controller.speak("Historia", {});
  assert.match(h.controller.getSnapshot().message, /español/);
  h.load([voice("en-US"), voice("es-PE")]);
  assert.equal(h.controller.getSnapshot().voices.length, 1);
  assert.equal(h.spoken.length, 0);
  h.controller.speak("Historia", {});
  assert.equal(h.spoken[0].rate, 1);
  assert.equal(h.spoken[0].pitch, 1);
  assert.equal(h.spoken[0].lang, "es-PE");
  h.disconnect();
});
test("stop suppresses stale callbacks and replacing playback cannot clear the new state", () => {
  const h = harness(); h.load([voice("es-MX")]);
  h.controller.speak("Uno", {});
  const oldError = h.spoken[0].onerror;
  const oldEnd = h.spoken[0].onend;
  h.controller.speak("Dos", {});
  oldError({ error: "synthesis-failed" }); oldEnd();
  assert.equal(h.controller.getSnapshot().speaking, true);
  assert.equal(h.controller.getSnapshot().message, "");
  h.spoken[1].onerror({ error: "canceled" });
  assert.equal(h.controller.getSnapshot().speaking, false);
  assert.equal(h.controller.getSnapshot().message, "");
  h.controller.speak("Tres", {});
  h.controller.stop();
  assert.equal(h.spoken[2].onerror, null);
  assert.equal(h.controller.getSnapshot().speaking, false);
  assert.equal(h.cancellations, 2);
  h.disconnect();
});
test("disconnect cancels narration and unsubscribes voiceschanged", () => {
  const h = harness(); h.load([voice("es-PE")]); h.controller.speak("Historia", {});
  h.disconnect();
  const snapshot = h.controller.getSnapshot();
  h.load([voice("es-ES")]);
  assert.equal(h.controller.getSnapshot(), snapshot);
  assert.equal(h.cancellations, 1);
});
test("unsupported speech and engine errors show recoverable messages", () => {
  const controller = createNarration(); controller.connect(); controller.speak("Historia", {});
  assert.match(controller.getSnapshot().message, /navegador/);
  const h = harness(); h.load([voice("es")]); h.synth.speak = () => { throw new Error("engine"); };
  h.controller.speak("Historia", {});
  assert.equal(h.controller.getSnapshot().speaking, false);
  assert.match(h.controller.getSnapshot().message, /Vuelve a intentarlo/);
  h.disconnect();
});
