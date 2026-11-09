"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createNarration } from "../lib/narration";

export function useNarration() {
  const [controller] = useState(createNarration);
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);
  useEffect(() => {
    const disconnect = controller.connect(
      "speechSynthesis" in window ? window.speechSynthesis : undefined,
      "SpeechSynthesisUtterance" in window ? text => new SpeechSynthesisUtterance(text) : undefined,
    );
    window.addEventListener("pagehide", controller.stop);
    return () => { window.removeEventListener("pagehide", controller.stop); disconnect(); };
  }, [controller]);
  return { ...state, stop: controller.stop, speak: controller.speak };
}
