// ui/theme.js — applies a project's colour palette as CSS custom properties

import { state } from "../state.js";

export function applyTheme(project) {
  state.theme = { ...project.theme };
  const s = document.documentElement.style;
  s.setProperty("--accent", state.theme.accent);
  s.setProperty("--snake",  state.theme.snake);
  s.setProperty("--food",   state.theme.food);
  s.setProperty("--border", "#333");
}
