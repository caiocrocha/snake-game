"use strict";

const canvas  = document.getElementById("game");
const ctx     = canvas.getContext("2d");
const scoreEl = document.getElementById("score-value");
const pauseEl = document.getElementById("pause-overlay");

const GRID     = 20;   // cell size in pixels
const SPEED    = 6;    // loop ticks to skip between moves (lower = faster)
const ANIM_LEN = 75;   // frames for the death animation

let snake, dx, dy, score, apple, tick;
let gameOver  = false;
let paused    = false;
let animating = false;
let animFrame = 0;

/* ── Helpers ──────────────────────────────────────────────── */

function rnd() {
  return Math.floor(Math.random() * (canvas.width / GRID)) * GRID;
}

function setScore(v) {
  score = v;
  scoreEl.textContent = v;
}

/**
 * Set paused state. Ignored mid-animation or after game over.
 */
function setPaused(val) {
  if (gameOver || animating) return;
  paused = val;
  pauseEl.classList.toggle("hidden", !paused);
}

function togglePause() {
  setPaused(!paused);
}

/* ── Lifecycle ────────────────────────────────────────────── */

function resetGame() {
  snake     = [{ x: 160, y: 160 }];
  dx        = GRID;
  dy        = 0;
  tick      = 0;
  apple     = { x: 320, y: 320 };
  gameOver  = false;
  animating = false;
  animFrame = 0;
  setScore(0);
  setPaused(false);
  // Clear canvas so stale frame doesn't flash during reset
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function triggerDeath() {
  gameOver  = true;
  animating = true;
  animFrame = 0;
  pauseEl.classList.add("hidden");
}

/* ── Drawing helpers ──────────────────────────────────────── */

function drawApple() {
  ctx.fillStyle = "red";
  ctx.fillRect(apple.x, apple.y, GRID - 1, GRID - 1);
}

function drawSnake() {
  ctx.fillStyle = "lime";
  snake.forEach(cell => {
    ctx.fillRect(cell.x, cell.y, GRID - 1, GRID - 1);
  });
}

/* ── Death animation ──────────────────────────────────────── */

function drawDeathAnimation() {
  const progress = animFrame / ANIM_LEN;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apple stays visible throughout
  drawApple();

  // Snake flashes red ↔ orange, fading out
  const flash = Math.floor(animFrame / 4) % 2;
  ctx.save();
  ctx.globalAlpha = 1 - progress * 0.65;
  ctx.fillStyle   = flash === 0 ? "#ff3333" : "#ff9900";
  snake.forEach(c => ctx.fillRect(c.x + 1, c.y + 1, GRID - 2, GRID - 2));
  ctx.restore();

  // Dark overlay + "GAME OVER" text fade in
  ctx.save();
  ctx.globalAlpha = Math.min(1, progress * 2);

  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";

  ctx.font      = "bold 40px monospace";
  ctx.fillStyle = "#ff3333";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 26);

  ctx.font      = "20px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 18);

  ctx.restore();

  if (++animFrame >= ANIM_LEN) {
    animating = false;
    setTimeout(resetGame, 420);
  }
}

/* ── Main loop ────────────────────────────────────────────── */

function loop() {
  requestAnimationFrame(loop);

  if (animating)          { drawDeathAnimation(); return; }
  if (gameOver || paused) return;
  if (++tick < SPEED)     return;
  tick = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Border collision → instant death
  if (head.x < 0 || head.x >= canvas.width ||
      head.y < 0 || head.y >= canvas.height) {
    triggerDeath();
    return;
  }

  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    setScore(score + 1);
    apple.x = rnd();
    apple.y = rnd();
  } else {
    snake.pop();
  }

  drawApple();
  drawSnake();

  // Self-collision: check head vs every body segment
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      triggerDeath();
      return;
    }
  }
}

/* ── Direction input ──────────────────────────────────────── */

function changeDirection(key) {
  if (paused || gameOver || animating) return;
  if      (key === "ArrowLeft"  && dx === 0) { dx = -GRID; dy =  0; }
  else if (key === "ArrowRight" && dx === 0) { dx =  GRID; dy =  0; }
  else if (key === "ArrowUp"    && dy === 0) { dy = -GRID; dx =  0; }
  else if (key === "ArrowDown"  && dy === 0) { dy =  GRID; dx =  0; }
}

/* ── Keyboard ─────────────────────────────────────────────── */

document.addEventListener("keydown", e => {
  // Space → toggle pause
  if (e.code === "Space") {
    e.preventDefault();
    togglePause();
    return;
  }
  changeDirection(e.key);
});

/* ── Canvas click / tap → toggle pause ───────────────────── */

canvas.addEventListener("click", togglePause);

// touchstart on the canvas also toggles pause.
// e.preventDefault() suppresses the synthetic click that follows on mobile,
// so the handler doesn't fire twice.
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  togglePause();
}, { passive: false });

/* ── Auto-pause on focus loss ─────────────────────────────── */

// Switching browser tabs
document.addEventListener("visibilitychange", () => {
  if (document.hidden) setPaused(true);
});

// Alt-tabbing or switching apps
window.addEventListener("blur", () => setPaused(true));

/* ── D-pad (mobile only, shown via CSS @media pointer: coarse) */

document.querySelectorAll(".dpad-btn").forEach(btn => {
  btn.addEventListener("touchstart", e => {
    e.preventDefault();               // no scroll, no ghost click
    changeDirection(btn.dataset.dir);
  }, { passive: false });
});

/* ── Boot ─────────────────────────────────────────────────── */

resetGame();
requestAnimationFrame(loop);