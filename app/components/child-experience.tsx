"use client";
import { useEffect, useRef, useState } from "react";
import { useNarration } from "./use-narration";
import Icon from "./app-icon";
import Scene from "./scene";
import { Logo, Modal, type Preferences } from "./shared";
import type { StoryProgress } from "../lib/sessions";
import { emotions, type Emotion, type Scenario } from "../lib/scenarios";
function Face({ emotion }: { emotion: Emotion }) {
  return <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="currentColor" opacity=".15"/><circle cx="32" cy="32" r="21" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="25" cy="28" r="2" fill="currentColor"/><circle cx="39" cy="28" r="2" fill="currentColor"/>{emotion === "Miedo" ? <ellipse cx="32" cy="40" rx="5" ry="6" fill="none" stroke="currentColor" strokeWidth="2"/> : <path d={emotion === "Alegría" ? "M23 37q9 12 18 0" : "M24 42q8-10 16 0"} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>}{emotion === "Enojo" && <path d="m21 21 8 3 m6 0 8-3" stroke="currentColor" strokeWidth="2"/>}</svg>;
}

export default function ChildExperience({ scenario, preferences, progress, position, total, onChange, onComplete, onInterrupt }: {
  scenario: Scenario; preferences: Preferences; progress: StoryProgress; position: number; total: number;
  onChange: (progress: StoryProgress) => void; onComplete: () => void; onInterrupt: () => void;
}) {
  const { step, answer, cause } = progress;
  const setStep = (step: number) => onChange({ ...progress, step });
  const setAnswer = (answer: string) => onChange({ ...progress, answer });
  const setCause = (cause: string) => onChange({ ...progress, cause });
  const [paused, setPaused] = useState(false);
  const narration = useNarration();
  const { speaking } = narration;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [step]);
  function listen() {
    if (speaking) narration.stop();
    else narration.speak(scenario.story, preferences);
  }
  function pause() { narration.stop(); setPaused(true); }
  return <div className={`child-app ${preferences.largeText ? "large-text" : ""} ${preferences.reducedMotion ? "reduce-motion" : ""}`}><a className="skip-link" href="#child-content">Saltar al contenido</a><header className="child-header"><Logo/><button className="button secondary" onClick={pause}>Hacer una pausa</button></header><main className="child-main" id="child-content"><p className="session-position">Historia {position} de {total}</p><nav className="child-steps" aria-label="Pasos de la actividad">{["La historia", "La emoción", "El porqué"].map((label, i) => <span className={step >= i ? "active" : ""} key={label} aria-current={step === i ? "step" : undefined}><b>{step > i ? <Icon name="check" size={15}/> : i + 1}</b>{label}</span>)}</nav><><div className="child-title"><h1 ref={heading} tabIndex={-1}>{step === 0 ? scenario.title : step === 1 ? "¿Cómo podría sentirse?" : "¿Por qué podría sentirse así?"}</h1><p>{step === 0 ? "Mira la imagen y lee o escucha la historia." : step === 1 ? "Elige una emoción. Podemos hablar sobre ella." : "Busca una pista en lo que pasó."}</p></div><div className={`child-content ${step === 0 ? "story-only" : ""}`}><section className="child-story"><Scene variant={scenario.scene} title={scenario.story} large/><p>{scenario.story}</p>{preferences.sound && <button className="button secondary" onClick={listen}><Icon name="sound" size={19}/>{speaking ? "Detener audio" : "Escuchar la historia"}</button>}</section>{step === 1 && <section className="child-answers" aria-label="Elige una emoción"><div className="emotion-choices">{emotions.map(item => <button key={item} className={`emotion-choice emotion-${item} ${answer === item ? "selected" : ""}`} aria-pressed={answer === item} onClick={() => setAnswer(item)}><Face emotion={item}/><strong>{item}</strong>{answer === item && <span className="choice-check"><Icon name="check" size={16}/></span>}</button>)}</div><div className="child-feedback" role="status">{answer && <><Icon name="leaf" size={22}/><p>{answer === scenario.emotion ? scenario.explanation : `Gracias por compartir tu idea. Podría haber distintas emociones. En esta historia también podemos pensar en ${scenario.emotion.toLowerCase()}. ${scenario.cause}`}</p></>}</div></section>}{step === 2 && <section className="cause-choices" aria-label="Elige una causa">{["Pasó algo diferente a lo que cuenta la historia.", scenario.cause, "Todavía no lo sé. Quiero hablarlo."].map(item => <button className={`cause-choice ${cause === item ? "selected" : ""}`} key={item} aria-pressed={cause === item} onClick={() => setCause(item)}><span className="radio-dot"/>{item}</button>)}{cause && <div className="child-feedback" role="status"><Icon name="leaf"/><p>{cause === scenario.cause ? "Esa es una pista de la historia. Nos ayuda a comprender la emoción." : `Podemos pensarlo juntos. La historia nos cuenta: ${scenario.cause}`}</p></div>}</section>}</div><div className="child-bottom"><button className="text-button" onClick={() => { narration.stop(); if (step) setStep(step - 1); else pause(); }}><Icon name="arrow" style={{ transform: "rotate(180deg)" }} size={17}/>{step ? "Volver" : "Salir de la actividad"}</button><button className="button primary" disabled={(step === 1 && !answer) || (step === 2 && !cause)} onClick={() => { narration.stop(); if (step === 2) onComplete(); else setStep(step + 1); }}> {step === 2 ? (position === total ? "Terminar sesión" : "Siguiente historia") : "Continuar"}<Icon name="arrow" size={20}/></button></div></><p role="status" className="audio-message">{narration.message}</p></main>{paused && <Modal title="Podemos descansar" onClose={() => setPaused(false)}><div className="pause-content"><span className="completion-icon"><Icon name="leaf" size={38}/></span><p>Tómate el tiempo que necesites.<br/>Tu historia te espera aquí.</p><button className="button primary full-width" onClick={() => setPaused(false)}>Continuar mi historia</button><button className="button secondary full-width" onClick={onInterrupt}>Terminar por hoy</button></div></Modal>}</div>;
}
