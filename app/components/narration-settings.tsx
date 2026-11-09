"use client";
import { useNarration } from "./use-narration";
import { narrationRate, selectSpanishVoice } from "../lib/narration";
import type { Preferences } from "./shared";

export default function NarrationSettings({ preferences, onChange }: { preferences: Preferences; onChange: (next: Preferences) => void }) {
  const narration = useNarration();
  const selected = selectSpanishVoice(narration.voices, preferences.voiceURI);
  const savedAvailable = narration.voices.some(voice => voice.voiceURI === preferences.voiceURI);
  return <section className="narration-settings" aria-label="Voz de las historias">
    <label>Voz en español<select value={savedAvailable ? preferences.voiceURI : ""} disabled={!narration.voices.length} onChange={event => { narration.stop(); onChange({ ...preferences, voiceURI: event.target.value || undefined }); }}>
      <option value="">Automática{selected ? ` · ${selected.name}` : ""}</option>
      {narration.voices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} · {voice.lang}{voice.localService ? "" : " · En línea"}</option>)}
    </select></label>
    <label>Velocidad<select value={narrationRate(preferences.speechRate)} onChange={event => { narration.stop(); onChange({ ...preferences, speechRate: Number(event.target.value) }); }}><option value={1}>Normal</option><option value={0.9}>Más pausada</option></select></label>
    <button type="button" className="button secondary" disabled={!narration.supported || !selected} onClick={() => narration.speaking ? narration.stop() : narration.speak("Hola. Vamos a escuchar una historia. Puedes hacer una pausa cuando quieras.", preferences)}>{narration.speaking ? "Detener prueba" : "Probar voz"}</button>
    <p className="muted">{!narration.supported ? "Este navegador no permite reproducir voz." : !selected ? "No hay voces en español disponibles. Instala una voz en español en el dispositivo o prueba otro navegador." : "Las voces dependen del dispositivo. Las voces en línea pueden enviar el texto al servicio de voz del navegador."}</p>
    {preferences.voiceURI && !savedAvailable && selected && <p className="muted">La voz guardada no está disponible aquí. Se usará la selección automática.</p>}
    <p role="status" className="audio-message">{narration.message}</p>
  </section>;
}
