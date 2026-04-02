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
  ctx.restore();

  if (++state.animFrame >= ANIM_LEN) {
    state.animating = false;
    state.animDone  = true;
  }
}
