"use client";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import Icon from "./app-icon";
export type Preferences = { sound: boolean; largeText: boolean; reducedMotion: boolean; voiceURI?: string; speechRate?: number };
export const defaults: Preferences = { sound: true, largeText: false, reducedMotion: true };
const storageEvent = "emocontex-storage";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(storageEvent, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(storageEvent, callback); };
}
export function useStored<T,>(key: string, fallback: T, area: "localStorage" | "sessionStorage" = "localStorage"): [T, (value: T) => void] {
  const raw = useSyncExternalStore(subscribe, () => { try { return window[area].getItem(key); } catch { return null; } }, () => null);
  let value = fallback;
  try { if (raw) value = JSON.parse(raw) as T; } catch { /* Invalid browser storage falls back to the demo dataset. */ }
  return [value, (next: T) => { window[area].setItem(key, JSON.stringify(next)); window.dispatchEvent(new Event(storageEvent)); }];
}
export function Logo() {
  return <div className="brand"><span className="brand-mark"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 20c-6-6-1-14 5-10 4-8 13-4 10 3 6 7-3 15-9 10-4 3-8 0-6-3Z" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M13 16h.1m6-1h.1m-6 4q3 3 6-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span><span>emocontex<span className="brand-dot">.</span></span></div>;
}
export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className={`modal ${wide ? "modal-wide" : ""}`} onCancel={onClose} aria-labelledby="modal-title"><div className="modal-heading"><h2 id="modal-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="Cerrar ventana"><Icon name="close"/></button></div>{children}</dialog>;
}
