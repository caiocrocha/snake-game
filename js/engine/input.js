// engine/input.js — wires up all keyboard, touch, and button event listeners

import { GRID }                      from "../config.js";
import { state }                     from "../state.js";
import { reset, setPaused, togglePause } from "./loop.js";
import { canvas }                    from "./renderer.js";

function changeDirection(key) {
  if (state.paused || state.gameOver || state.animating) return;
  if      (key === "ArrowLeft"  && state.dx === 0) { state.dx = -GRID; state.dy =  0; }
  else if (key === "ArrowRight" && state.dx === 0) { state.dx =  GRID; state.dy =  0; }
  else if (key === "ArrowUp"    && state.dy === 0) { state.dy = -GRID; state.dx =  0; }
  else if (key === "ArrowDown"  && state.dy === 0) { state.dy =  GRID; state.dx =  0; }
}

export function init() {
  document.addEventListener("keydown", e => {
    if (e.code === "Space") { e.preventDefault(); togglePause(); return; }
    changeDirection(e.key);
  });

  canvas.addEventListener("click", togglePause);
  canvas.addEventListener("touchstart", e => { e.preventDefault(); togglePause(); }, { passive: false });

  document.addEventListener("visibilitychange", () => { if (document.hidden) setPaused(true); });
  window.addEventListener("blur", () => setPaused(true));

  document.querySelectorAll(".dpad-btn").forEach(btn =>
    btn.addEventListener("touchstart", e => {
      e.preventDefault();
      changeDirection(btn.dataset.dir);
    }, { passive: false })
  );

  document.getElementById("play-again").addEventListener("click", reset);
}
