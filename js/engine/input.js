// engine/input.js — wires up all keyboard, touch, and button event listeners

import { GRID }                      from "../config.js";
import { state }                     from "../state.js";
import { reset, setPaused, togglePause } from "./loop.js";
import { canvas }                    from "./renderer.js";

function changeDirection(key) {
  if (state.paused || state.gameOver || state.animating) return;

  const isLeft  = key === "ArrowLeft";
  const isRight = key === "ArrowRight";
  const isUp    = key === "ArrowUp";
  const isDown  = key === "ArrowDown";

  if (!isLeft && !isRight && !isUp && !isDown) return;

  if (state.waiting) {
    // First input: unlock movement in whichever direction the user chose.
    // All four directions are valid here — no reversal possible yet.
    state.waiting      = false;
    state.lastMoveTime = performance.now();
    if (isLeft)  { state.dx = -GRID; state.dy =  0; }
    if (isRight) { state.dx =  GRID; state.dy =  0; }
    if (isUp)    { state.dx =  0;    state.dy = -GRID; }
    if (isDown)  { state.dx =  0;    state.dy =  GRID; }
    return;
  }

  // Normal in-game direction change (no 180° reversal allowed).
  if      (isLeft  && state.dx === 0) { state.dx = -GRID; state.dy =  0; }
  else if (isRight && state.dx === 0) { state.dx =  GRID; state.dy =  0; }
  else if (isUp    && state.dy === 0) { state.dy = -GRID; state.dx =  0; }
  else if (isDown  && state.dy === 0) { state.dy =  GRID; state.dx =  0; }
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
