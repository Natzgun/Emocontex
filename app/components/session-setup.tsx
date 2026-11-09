"use client";

import { useState } from "react";
import { Modal } from "./shared";
import type { Scenario } from "../lib/scenarios";

export default function SessionSetup({ scenarios, initial, onClose, onLaunch }: {
  scenarios: Scenario[]; initial: string; onClose: () => void; onLaunch: (ids: string[]) => void;
}) {
  const published = scenarios.filter(s => s.status === "published");
  const [selected, setSelected] = useState<string[]>(published.some(s => s.id === initial) ? [initial] : []);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  function change(ids: string[]) { setSelected(ids); setReady(false); }
  function move(index: number, direction: number) {
    const next = [...selected];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    change(next);
  }
  return <Modal title="Preparar la sesión" onClose={onClose}>
    <form className="session-form" onSubmit={event => {
      event.preventDefault();
      if (!ready || !selected.length || selected.some(id => !published.some(s => s.id === id))) { setError("Confirma el acompañamiento y selecciona historias publicadas."); return; }
      onLaunch(selected);
    }}>
      <p>Elige las historias y su orden según lo acordado con el profesional. Acompaña al niño durante toda la sesión.</p>
      <label>Añadir historia<select value="" onChange={event => event.target.value && change([...selected, event.target.value])}><option value="">Selecciona una historia</option>{published.filter(s => !selected.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
      <h3>{selected.length === 1 ? "1 historia seleccionada" : `${selected.length} historias seleccionadas`}</h3>
      <ol className="session-selection">{selected.map((id, index) => {
        const s = published.find(item => item.id === id);
        return <li key={id}><strong>{s?.title ?? "Historia no disponible"}</strong>{s && <details><summary>Revisar historia</summary><p>{s.story}</p><p>{s.explanation}</p></details>}<div className="session-order"><button type="button" className="button secondary" disabled={!index} aria-label={`Subir ${s?.title}`} onClick={() => move(index, -1)}>Subir</button><button type="button" className="button secondary" disabled={index === selected.length - 1} aria-label={`Bajar ${s?.title}`} onClick={() => move(index, 1)}>Bajar</button><button type="button" className="button secondary" aria-label={`Quitar ${s?.title}`} onClick={() => change(selected.filter(key => key !== id))}>Quitar</button></div></li>;
      })}</ol>
      <label className="approval-check"><input type="checkbox" checked={ready} onChange={event => setReady(event.target.checked)}/><span>He revisado estas historias y acompañaré la sesión. Podemos detenernos cuando el niño lo desee.</span></label>
      <p role="alert">{error}</p>
      <button className="button primary full-width" type="submit">Abrir espacio infantil</button>
    </form>
  </Modal>;
}
