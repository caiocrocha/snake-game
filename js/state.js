// js/state.js — single shared mutable state object
// All modules import this and read/write state.xxx directly.
// No logic lives here — just the data shape and default values.

export const state = {
  // ── Project data (populated on boot) ──────────────────────
  projects:    [],
  runThemeIdx: 0,
  theme:       { snake: "#39ff14", food: "#ff4444", accent: "#39ff14" },

  // ── Snake ──────────────────────────────────────────────────
  snake: null,  // array of {x, y} grid cells
  dx:    25,    // horizontal velocity (px per move)
  dy:    0,     // vertical velocity
  score: 0,
  apple: null,  // {x, y}
  tick:  0,     // frame counter between moves

  // ── Control flags ──────────────────────────────────────────
  gameOver:          false,
  paused:            false,
  animating:         false,
  animDone:          false,  // set by drawDeathAnimation when it finishes
  animFrame:         0,
  deathMsg:          "",
  deathSub:          "",
  lastPipelineStage: -1,     // -1 forces updatePipeline to init on first call

  // ── Loop handles ───────────────────────────────────────────
  rafId:        null,  // requestAnimationFrame ID; null = loop is stopped
  panelTimeout: null,  // setTimeout ID for the showProjectPanel delay
};
