// engine/loop.js — game lifecycle (reset, death) and the RAF main loop

import { GRID, MOVE_INTERVAL_MS, ENCOURAGEMENTS, UNLOCK_MSGS } from "../config.js";
import { state }          from "../state.js";
import { update as updatePipelineBar } from "../ui/pipelineBar.js";
import { show as showPanel, hide as hidePanel } from "../ui/projectPanel.js";
import { canvas, ctx, drawApple, drawSnake, drawDeathAnimation, drawWaitingOverlay } from "./renderer.js";

const scoreEl = document.getElementById("score-value");
const pauseEl = document.getElementById("pause-overlay");
const dpadEl  = document.getElementById("dpad");

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const rnd  = ()  => Math.floor(Math.random() * Math.floor(canvas.width / GRID)) * GRID;

function setScore(v) {
  state.score = v;
  scoreEl.textContent = v;
  updatePipelineBar();
}

export function setPaused(val) {
  if (state.gameOver || state.animating || state.waiting) return;
  state.paused = val;
  pauseEl.classList.toggle("hidden", !val);
}

export function togglePause() { setPaused(!state.paused); }

export function reset() {
  if (state.panelTimeout) { clearTimeout(state.panelTimeout); state.panelTimeout = null; }
  hidePanel();
  if (dpadEl) dpadEl.classList.remove("hidden");

  Object.assign(state, {
    snake: [{ x: 150, y: 150 }], dx: GRID, dy: 0,
    waiting: true, waitStart: performance.now(), lastMoveTime: 0,
    apple: { x: 300, y: 300 },
    gameOver: false, paused: false, animating: false, animDone: false, animFrame: 0,
    lastPipelineStage: -1,
  });
  pauseEl.classList.add("hidden"); // clear any lingering pause overlay

  setScore(0);
  updatePipelineBar();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  _startLoop();
}

function _triggerDeath() {
  Object.assign(state, {
    gameOver: true, animating: true, animFrame: 0,
    deathMsg: pick(ENCOURAGEMENTS),
    deathSub: pick(UNLOCK_MSGS),
  });
  pauseEl.classList.add("hidden");
}

function _loop(timestamp) {
  // ── Death animation phase ────────────────────────────────────
  if (state.animating) {
    state.rafId = requestAnimationFrame(_loop);
    drawDeathAnimation();
    if (state.animDone) {
      state.animDone     = false;
      state.panelTimeout = setTimeout(showPanel, 300);
    }
    return;
  }

  if (state.gameOver) { state.rafId = null; return; }

  // ── Waiting / 3-second countdown ────────────────────────────
  // Auto-starts when 3 000 ms elapse; the player can skip by pressing a direction.
  if (state.waiting) {
    const elapsed = timestamp - state.waitStart;
    if (elapsed >= 3000) {
      // Countdown finished — start moving in the default direction (right)
      state.waiting      = false;
      state.lastMoveTime = timestamp;
      // fall through to the normal game-tick code below
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawApple();
      drawSnake();
      drawWaitingOverlay(timestamp);
      state.rafId = requestAnimationFrame(_loop);
      return;
    }
  }

  if (state.paused) { state.rafId = requestAnimationFrame(_loop); return; }

  // ── Timestamp-based movement (device/refresh-rate independent) ─
  // lastMoveTime is set to performance.now() the moment the first key is pressed.
  if (timestamp - state.lastMoveTime < MOVE_INTERVAL_MS) {
    state.rafId = requestAnimationFrame(_loop);
    return;
  }
  state.lastMoveTime = timestamp;

  // ── Game tick ────────────────────────────────────────────────
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const head = { x: state.snake[0].x + state.dx, y: state.snake[0].y + state.dy };

  // Check the trailing edge of the cell, not just its top-left corner.
  // This is correct for any GRID size, including ones that don't divide canvas.width evenly.
  if (head.x < 0 || head.x + GRID > canvas.width || head.y < 0 || head.y + GRID > canvas.height) {
    _triggerDeath(); state.rafId = requestAnimationFrame(_loop); return;
  }

  state.snake.unshift(head);

  if (head.x === state.apple.x && head.y === state.apple.y) {
    setScore(state.score + 1);
    state.apple.x = rnd();
    state.apple.y = rnd();
  } else {
    state.snake.pop();
  }

  drawApple();
  drawSnake();
  updatePipelineBar();

  for (let i = 1; i < state.snake.length; i++) {
    if (head.x === state.snake[i].x && head.y === state.snake[i].y) {
      _triggerDeath(); state.rafId = requestAnimationFrame(_loop); return;
    }
  }

  state.rafId = requestAnimationFrame(_loop);
}

function _startLoop() {
  if (!state.rafId) state.rafId = requestAnimationFrame(_loop);
}

// start() is the single public entry point — called once by game.js
export function start() { reset(); }
