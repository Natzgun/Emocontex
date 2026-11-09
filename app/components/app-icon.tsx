import type { CSSProperties } from "react";

export type IconName = "grid" | "people" | "book" | "sparkles" | "chart" | "settings" | "arrow" | "chevron" | "plus" | "search" | "bell" | "check" | "shield" | "leaf" | "sound" | "edit" | "eye" | "close" | "clock" | "home" | "pin" | "help" | "logout" | "download";
const paths: Record<IconName, string> = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  people: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M18 8a3 3 0 0 1 0 6 M22 21v-2a4 4 0 0 0-3-3.87",
  book: "M4 3h6v18H4z M14 4l5-1 3 17-5 1z M1 21h22 M4 7h6",
  sparkles: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z M21 2v4 M19 4h4",
  chart: "M4 3v18h17 M8 16v-4 M13 16V7 M18 16v-7",
  settings: "M4 7h16 M4 17h16 M8 4v6 M16 14v6",
  arrow: "M4 12h16 m-6-6 6 6-6 6", chevron: "m9 5 7 7-7 7", plus: "M12 5v14 M5 12h14",
  search: "M21 21l-5-5 M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4",
  check: "m5 12 4 4L19 6", shield: "m12 3 8 3v6c0 5-8 9-8 9S4 17 4 12V6z m-4 9 3 3 5-6",
  leaf: "M20 3C8 2 3 7 5 14s13 6 15-11z M3 21 15 9",
  sound: "M11 4 5 9H2v6h3l6 5z M15 8a6 6 0 0 1 0 8 M18 4a11 11 0 0 1 0 16",
  edit: "m16 3 5 5L8 21H3v-5z M13 6l5 5", eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  close: "m6 6 12 12 M6 18 18 6", clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 6v6l4 2",
  home: "m3 10 9-7 9 7v11h-6v-7H9v7H3z", pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  help: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 3 M12 17h.01",
  logout: "M9 3H3v18h6 M8 12h14 m-5-5 5 5-5 5", download: "M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5",
};
export default function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]} /></svg>;
}
