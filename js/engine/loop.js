// engine/loop.js — game lifecycle (reset, death) and the RAF main loop

import { GRID, SPEED, ENCOURAGEMENTS, UNLOCK_MSGS } from "../config.js";
import { state }          from "../state.js";
import { update as updatePipelineBar } from "../ui/pipelineBar.js";
import { show as showPanel, hide as hidePanel } from "../ui/projectPanel.js";
import { canvas, ctx, drawApple, drawSnake, drawDeathAnimation } from "./renderer.js";

const scoreEl = document.getElementById("score-value");
const pauseEl = document.getElementById("pause-overlay");
const dpadEl  = document.getElementById("dpad");

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const rnd  = ()  => Math.floor(Math.random() * (canvas.width / GRID)) * GRID;

function setScore(v) {
  state.score = v;
  scoreEl.textContent = v;
  updatePipelineBar();
}

export function setPaused(val) {
  if (state.gameOver || state.animating) return;
  state.paused = val;
  pauseEl.classList.toggle("hidden", !val);
}

export function togglePause() { setPaused(!state.paused); }

export function reset() {
  if (state.panelTimeout) { clearTimeout(state.panelTimeout); state.panelTimeout = null; }
  hidePanel();
  if (dpadEl) dpadEl.classList.remove("hidden");

  Object.assign(state, {
    snake: [{ x: 150, y: 150 }], dx: GRID, dy: 0, tick: 0,
    apple: { x: 300, y: 300 },
    gameOver: false, animating: false, animDone: false, animFrame: 0,
    lastPipelineStage: -1,
  });

  setScore(0);
  setPaused(false);
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

function _loop() {
  if (state.animating) {
    state.rafId = requestAnimationFrame(_loop);
    drawDeathAnimation();
    if (state.animDone) {
      state.animDone     = false;
      state.panelTimeout = setTimeout(showPanel, 300);
    }
    return;
  }

  if (state.gameOver)                  { state.rafId = null; return; }
  if (state.paused || ++state.tick < SPEED) { state.rafId = requestAnimationFrame(_loop); return; }
  state.tick = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const head = { x: state.snake[0].x + state.dx, y: state.snake[0].y + state.dy };

  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
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
