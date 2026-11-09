export type NarrationPreferences = { voiceURI?: string; speechRate?: number };
type Voice = Pick<SpeechSynthesisVoice, "voiceURI" | "name" | "lang" | "default" | "localService">;
const latinAmericanRegions = new Set(["419", "mx", "ar", "bo", "cl", "co", "cr", "cu", "do", "ec", "gt", "hn", "ni", "pa", "py", "pr", "sv", "uy", "ve"]);
const language = (voice: Voice) => voice.lang.toLowerCase().replaceAll("_", "-");
export const spanishVoices = <T extends Voice>(voices: T[]): T[] => voices.filter(voice => /^es(?:-|$)/.test(language(voice)));
export const narrationRate = (rate?: number) => rate === 0.9 ? 0.9 : 1;
export function selectSpanishVoice<T extends Voice>(voices: T[], preferredURI?: string): T | undefined {
  const spanish = spanishVoices(voices);
  const preferred = spanish.find(voice => voice.voiceURI === preferredURI);
  if (preferred) return preferred;
  const score = (voice: T) => {
    const locale = language(voice);
    // Names are provider hints, not a guarantee of voice quality.
    return (locale === "es-pe" ? 100 : latinAmericanRegions.has(locale.split("-")[1]) ? 50 : 0)
      + (/natural|neural|premium|enhanced/i.test(voice.name) ? 10 : 0) + (voice.default ? 1 : 0);
  };
  return spanish.sort((a, b) => score(b) - score(a) || a.voiceURI.localeCompare(b.voiceURI))[0];
}

const initialSnapshot = { voices: [] as SpeechSynthesisVoice[], supported: false, speaking: false, message: "" };
export function createNarration() {
  let snapshot = initialSnapshot;
  let engine: SpeechSynthesis | undefined;
  let makeUtterance: ((text: string) => SpeechSynthesisUtterance) | undefined;
  let active: SpeechSynthesisUtterance | undefined;
  let generation = 0;
  const listeners = new Set<() => void>();
  const update = (value: Partial<typeof snapshot>) => { snapshot = { ...snapshot, ...value }; listeners.forEach(listener => listener()); };
  const refresh = () => update({ voices: spanishVoices(engine?.getVoices() ?? []) });
  const stop = () => {
    generation++;
    if (active) { active.onend = null; active.onerror = null; engine?.cancel(); }
    active = undefined;
    update({ speaking: false, message: "" });
  };
  return {
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initialSnapshot,
    connect(synthesis?: SpeechSynthesis, factory?: typeof makeUtterance) {
      engine = synthesis; makeUtterance = factory;
      update({ supported: Boolean(engine && makeUtterance) });
      refresh();
      engine?.addEventListener("voiceschanged", refresh);
      return () => { engine?.removeEventListener("voiceschanged", refresh); stop(); engine = undefined; makeUtterance = undefined; };
    },
    stop,
    speak(text: string, preferences: NarrationPreferences) {
      stop();
      if (!engine || !makeUtterance) { update({ message: "Este navegador no tiene audio disponible. Puedes leer con tu acompañante." }); return; }
      refresh();
      const voice = selectSpanishVoice(snapshot.voices, preferences.voiceURI);
      if (!voice) { update({ message: "No hay una voz en español disponible todavía. Vuelve a intentarlo o pide ayuda a tu acompañante." }); return; }
      const speech = makeUtterance(text);
      const current = generation;
      active = speech;
      speech.voice = voice; speech.lang = voice.lang; speech.rate = narrationRate(preferences.speechRate); speech.pitch = 1;
      speech.onend = () => { if (current === generation) { active = undefined; update({ speaking: false }); } };
      speech.onerror = event => {
        if (current !== generation) return;
        active = undefined;
        update({ speaking: false, message: ["canceled", "interrupted"].includes(event.error) ? "" : "No se pudo reproducir el audio. Vuelve a intentarlo o lee con tu acompañante." });
      };
      update({ speaking: true });
      try { engine.speak(speech); } catch { active = undefined; update({ speaking: false, message: "No se pudo reproducir el audio. Vuelve a intentarlo o lee con tu acompañante." }); }
    },
  };
}
