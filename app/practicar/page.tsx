"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ChildExperience from "../components/child-experience";
import SessionSummary from "../components/session-summary";
import { defaults, useStored, type Preferences } from "../components/shared";
import { initialScenarios, type Activity, type Scenario } from "../lib/scenarios";
import { downloadJson } from "../lib/evaluation";
import { activeSessionKey, sessionsKey, restoreSession, upsertSession, currentScenario, completeStory, skipUnavailable, interruptSession, type PracticeSession } from "../lib/sessions";

export default function PracticePage() {
  const [prepared] = useStored<unknown>(activeSessionKey, null, "sessionStorage");
  const [sessions, setSessions] = useStored<PracticeSession[]>(sessionsKey, []);
  const [legacy] = useStored<Activity[]>("emocontex-activities-v1", []);
  const [scenarios] = useStored<Scenario[]>("emocontex-scenarios-v1", initialScenarios);
  const [preferences] = useStored<Preferences>("emocontex-preferences-v1", defaults);
  const [unsaved, setUnsaved] = useState<PracticeSession | null>(null);
  const [warning, setWarning] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const initial = restoreSession(prepared, legacy);
  const session = unsaved ?? (initial && restoreSession(sessions.find(s => s.id === initial.id) ?? initial, legacy));
  const scenario = session && currentScenario(session, scenarios);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [session?.phase, showSummary, scenario?.id]);

  useEffect(() => {
    if (!unsaved) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [unsaved]);

  function persist(next: PracticeSession) {
    try {
      setSessions(upsertSession(sessions, next));
      setUnsaved(null);
      setWarning("");
    } catch {
      setUnsaved(next);
      setWarning("No se pudo guardar el progreso. Pide ayuda a tu acompañante. No cierres esta página: puedes reintentar o descargar el registro al terminar.");
    }
  }
  function stop() {
    if (session) persist(interruptSession(session, scenario ?? undefined, new Date().toISOString()));
  }
  const warningPanel = <div role="status">{warning && <div className="info-box"><p>{warning}</p>{session && <button className="button secondary" onClick={() => persist(session)}>Reintentar guardado</button>}</div>}</div>;
  if (!session) return <main className="practice-wait"><h1>Preparemos una historia juntos.</h1><p>Pide a tu acompañante que elija las historias antes de comenzar.</p><Link className="button primary" href="/adultos">Ir con mi acompañante</Link></main>;
  if (session.phase === "activity" && scenario) return <>{warningPanel}<ChildExperience key={`${session.id}:${session.cursor}`} scenario={scenario} preferences={preferences} progress={session.progress} position={session.cursor + 1} total={session.scenarioIds.length} onChange={progress => persist({ ...session, progress })} onInterrupt={stop} onComplete={() => persist(completeStory(session, scenario, new Date().toISOString()))}/></>;
  return <main className={`practice-wait ${preferences.largeText ? "large-text" : ""}`}>
    {session.phase === "introduction" ? <>
      <h1 ref={heading} tabIndex={-1}>Vamos a explorar {session.scenarioIds.length === 1 ? "1 historia" : `${session.scenarioIds.length} historias`}.</h1>
      <p>Después, le darás el dispositivo a tu acompañante.</p>
      <div className="completion-actions"><button className="button primary" onClick={() => persist({ ...session, phase: "activity" })}>Empezar</button><button className="button secondary" onClick={stop}>Terminar por hoy</button></div>
    </> : session.phase === "activity" ? <>
      <h1 ref={heading} tabIndex={-1}>Esta historia no está disponible.</h1><p>Pide ayuda a tu acompañante.</p>
      <div className="completion-actions"><button className="button primary" onClick={() => persist(skipUnavailable(session, scenarios, new Date().toISOString()))}>Continuar sin esta historia</button><button className="button secondary" onClick={stop}>Terminar por hoy</button></div>
    </> : !showSummary ? <>
      <h1 ref={heading} tabIndex={-1}>Terminamos por hoy.</h1><p>Dale el dispositivo a tu acompañante.</p>
      <button className="button primary" onClick={() => setShowSummary(true)}>Ver resumen</button>
    </> : <>
      <h1 ref={heading} tabIndex={-1}>Espacio adulto</h1>
      <SessionSummary session={session}/>
      <div className="completion-actions"><button className="button secondary" onClick={() => { try { downloadJson("emocontex-sesion.json", session); } catch { setWarning("No se pudo descargar el registro. Reintenta el guardado antes de salir."); } }}>Descargar sesión</button><Link className="button primary" href="/adultos" onClick={() => {
        try { sessionStorage.removeItem(activeSessionKey); } catch { /* Returning to the adult remains available. */ }
      }}>Volver al espacio adulto</Link></div>
      {unsaved && <p role="alert">Esta sesión no está guardada. Descarga el registro antes de salir.</p>}
    </>}
    {warningPanel}
  </main>;
}
