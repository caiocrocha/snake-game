// engine/renderer.js — draws every visual element onto the canvas

import { GRID, ANIM_LEN, FOOD_COLOR } from "../config.js";
import { state }                       from "../state.js";
import { getNextTag }                  from "../ui/projectPanel.js";

export const canvas = document.getElementById("game");
export const ctx    = canvas.getContext("2d", { alpha: false });

export function drawApple() {
  ctx.fillStyle = FOOD_COLOR;
  ctx.fillRect(state.apple.x, state.apple.y, GRID - 1, GRID - 1);
  const tag = state.projects.length ? getNextTag() : "";
  if (tag) {
    ctx.fillStyle = "#000";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tag.slice(0, 3), state.apple.x + GRID / 2, state.apple.y + GRID / 2);
  }
}

export function drawSnake() {
  ctx.fillStyle = state.theme.snake;
  state.snake.forEach(c => ctx.fillRect(c.x, c.y, GRID - 1, GRID - 1));
}

// Drawn every frame while state.waiting === true.
// Shows the instruction text, a large live countdown, and a dim pause hint.
export function drawWaitingOverlay(timestamp) {
  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  // Countdown maths: 3 → 2 → 1, one second each
  const elapsed      = timestamp - state.waitStart;
  const remaining    = Math.max(1, Math.ceil((3000 - elapsed) / 1000));
  const secProgress  = (elapsed % 1000) / 1000; // 0→1 within the current second

  // Instruction text pulses gently to feel alive
  const pulse = 0.75 + 0.25 * Math.sin(timestamp / 500);

  // Countdown digit pops at the start of each second and settles (slightly smaller than before)
  const numSize = Math.round(58 + 10 * (1 - secProgress)); // 68px → 58px per second

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.60)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";

  // ── Instruction line — centred above the countdown digit ──────
  ctx.globalAlpha = pulse;
  ctx.font        = "bold 20px monospace";
  ctx.fillStyle   = state.theme.accent;
  ctx.fillText(
    isTouch ? "TAP A DIRECTION TO START" : "PRESS  ←  →  ↑  ↓  TO START",
    canvas.width / 2,
    canvas.height / 2 - 55       // groups with the digit in the vertical centre
  );

  // ── Countdown digit — centred, just below the instruction ─────
  ctx.globalAlpha = 1;
  ctx.font        = `bold ${numSize}px monospace`;
  ctx.fillStyle   = "#fff";
  ctx.fillText(String(remaining), canvas.width / 2, canvas.height / 2 + 10);

  // ── Pause hint (dim) — below the digit ───────────────────────
  ctx.globalAlpha = 0.40;
  ctx.font        = "13px monospace";
  ctx.fillStyle   = "#aaa";
  ctx.fillText(
    isTouch ? "tap canvas to pause mid-game" : "SPACE or click canvas to pause",
    canvas.width / 2,
    canvas.height / 2 + 65
  );

  ctx.restore();
}

// Sets state.animDone = true on the final frame — loop.js watches for this.
export function drawDeathAnimation() {
  const t = state.animFrame / ANIM_LEN;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawApple();

  ctx.save();
  ctx.globalAlpha = 1 - t * 0.65;
  ctx.fillStyle   = Math.floor(state.animFrame / 4) % 2 ? "#ff9900" : "#ff3333";
  state.snake.forEach(c => ctx.fillRect(c.x, c.y, GRID - 1, GRID - 1));
  ctx.restore();

  ctx.save();
  ctx.globalAlpha   = Math.min(1, t * 2);
  ctx.fillStyle     = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign     = "center";
  ctx.textBaseline  = "middle";

  ctx.font      = "bold 36px monospace";
  ctx.fillStyle = state.theme.accent;
  ctx.fillText(state.deathMsg, canvas.width / 2, canvas.height / 2 - 46);

  ctx.font      = "22px monospace";
  ctx.fillStyle = "#fff";
  ctx.fillText("Score: " + state.score, canvas.width / 2, canvas.height / 2 - 4);

  ctx.font      = "16px monospace";
  ctx.fillStyle = "#bbb";
  ctx.fillText(state.deathSub, canvas.width / 2, canvas.height / 2 + 34);

  // Scroll hint fades in during the last 40 % of the animation
  if (t > 0.60) {
    const hintAlpha = Math.min(1, (t - 0.60) / 0.30);
    ctx.font      = "12px monospace";
    ctx.fillStyle = `rgba(100, 100, 100, ${hintAlpha})`;
    ctx.fillText("↓  scroll for more  ↓", canvas.width / 2, canvas.height / 2 + 70);
  }

  ctx.restore();

  if (++state.animFrame >= ANIM_LEN) {
    state.animating = false;
    state.animDone  = true;
  }
}
