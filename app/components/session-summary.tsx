import { sessionCounts, type PracticeSession } from "../lib/sessions";

export default function SessionSummary({ session }: { session: PracticeSession }) {
  const counts = sessionCounts(session);
  return <section className="panel session-summary">
    <h2>Resumen de la sesión</h2>
    <p>{counts.completed} de {session.scenarioIds.length} historias completadas · {counts.pending} pendientes · {counts.skipped} no disponibles</p>
    {session.endedEarly && <p>Sesión finalizada antes de completar todas las historias.</p>}
    <ol>{session.activities.map(a => <li key={a.id}><strong>{a.title} — {a.status === "interrupted" ? "Interrumpida" : "Completada"}</strong><p>Emoción elegida: {a.answer || "Sin respuesta"}</p><p>Causa elegida: {a.cause || "Sin respuesta"}</p></li>)}</ol>
  </section>;
}
