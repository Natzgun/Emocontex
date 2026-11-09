"use client";

import { useState } from "react";
import { Modal, useStored } from "./shared";
import { downloadJson, type Feedback } from "../lib/evaluation";

export default function FeedbackForm({ screen, onClose }: { screen: string; onClose: () => void }) {
  const [entries, setEntries] = useStored<Feedback[]>("emocontex-feedback-v1", []);
  const [context, setContext] = useState(screen);
  const [observation, setObservation] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [message, setMessage] = useState("");
  const [invalid, setInvalid] = useState(false);
  return <Modal title="Comentarios para el equipo" onClose={onClose}>
    <form className="session-form" onSubmit={event => {
      event.preventDefault();
      if (!observation.trim()) { setInvalid(true); setMessage("Describe qué ocurrió antes de guardar."); return; }
      try {
        setEntries([...entries, { id: crypto.randomUUID(), date: new Date().toISOString(), screen: context, observation: observation.trim(), suggestion: suggestion.trim() }]);
        setObservation(""); setSuggestion(""); setInvalid(false); setMessage("Comentario guardado en este navegador. Puedes exportarlo para compartirlo con el equipo.");
      } catch { setMessage("No se pudo guardar. Revisa el almacenamiento del navegador y vuelve a intentarlo."); }
    }}>
      <p id="feedback-privacy">Describe la interfaz o la actividad, sin nombres ni datos personales de niños. Los comentarios no se envían automáticamente.</p>
      <label>Pantalla o actividad<select value={context} onChange={event => setContext(event.target.value)}>{["Resumen", "Acompañamiento", "Biblioteca", "Seguimiento", "Actividad infantil"].map(value => <option key={value}>{value}</option>)}</select></label>
      <label>¿Qué ocurrió?<textarea required maxLength={1200} rows={4} value={observation} aria-invalid={invalid} aria-describedby="feedback-privacy feedback-message" onChange={event => { setObservation(event.target.value); setInvalid(false); }}/></label>
      <label>¿Qué mejorarías? (opcional)<textarea maxLength={1200} rows={3} value={suggestion} onChange={event => setSuggestion(event.target.value)}/></label>
      <p id="feedback-message" role="status">{message}</p>
      <button className="button primary" type="submit">Guardar comentario</button>
    </form>
    <details className="evaluation-disclosure"><summary>Comentarios guardados ({entries.length})</summary>
      {entries.length ? <><ul className="feedback-list">{[...entries].reverse().map(entry => <li key={entry.id}><strong>{entry.screen}</strong><p>{entry.observation}</p>{entry.suggestion && <p>Sugerencia: {entry.suggestion}</p>}</li>)}</ul><button className="button secondary" onClick={() => { try { downloadJson("emocontex-comentarios.json", { version: 1, feedback: entries }); } catch { setMessage("No se pudo exportar. Vuelve a intentarlo."); } }}>Exportar comentarios</button></> : <p>Aún no hay comentarios guardados.</p>}
    </details>
  </Modal>;
}
