// ui/pipelineBar.js — NLP pipeline stage indicator: stage tracking + scroll animation

import { CYCLE_LEN, STAGE_THRESHOLDS } from "../config.js";
import { state }                        from "../state.js";
import { applyTheme }                   from "./theme.js";

const stages = document.querySelectorAll("#pipeline-bar .stage");
const inner  = document.getElementById("pipeline-inner");
const bar    = document.getElementById("pipeline-bar");

function currentStage(snakeLen) {
  const pos = (snakeLen - 1) % CYCLE_LEN;
  let s = 0;
  for (let i = 0; i < STAGE_THRESHOLDS.length; i++) {
    if (pos >= STAGE_THRESHOLDS[i]) s = i;
  }
  return s;
}

function scroll(stageIndex, mode) {
  const el = stages[stageIndex];
  if (!el || !inner) return;

  if (mode === "smooth") {
    const w     = bar ? bar.clientWidth : 376;
    const m     = inner.style.transform.match(/translateX\(-?([\d.]+)px\)/);
    const cx    = m ? parseFloat(m[1]) : 0;
    const right = el.offsetLeft + el.offsetWidth;
    const last  = stages[stages.length - 1];
    const max   = last ? Math.max(0, last.offsetLeft + last.offsetWidth - w + 10) : 0;
    if (right - cx > w) inner.style.transform = `translateX(-${Math.min(right - w + 10, max)}px)`;

  } else if (mode === "fast") {
    // .pipeline-fast overrides the default transition to 0.2s (defined in style.css)
    inner.classList.add("pipeline-fast");
    inner.style.transform = "translateX(0)";
    setTimeout(() => { inner.classList.remove("pipeline-fast"); }, 220);

  } else { // "instant"
    // .pipeline-instant suppresses all transition (defined in style.css)
    inner.classList.add("pipeline-instant");
    inner.style.transform = "translateX(0)";
    inner.getBoundingClientRect(); // force reflow so the class takes effect before removal
    inner.classList.remove("pipeline-instant");
  }
}

// update() is called by loop.js on every game tick and on reset
export function update() {
  const len   = state.snake ? state.snake.length : 1;
  const stage = currentStage(len);
  if (stage === state.lastPipelineStage) return;

  const isInit    = state.lastPipelineStage === -1;
  const isRestart = !isInit && stage < state.lastPipelineStage;

  if (!isInit) {
    state.runThemeIdx = (state.runThemeIdx + 1) % state.projects.length;
    if (state.projects.length) applyTheme(state.projects[state.runThemeIdx]);
  }

  stages.forEach((el, i) => {
    el.classList.toggle("active",  i <= stage);
    el.classList.toggle("current", i === stage);
  });

  scroll(stage, isInit ? "instant" : isRestart ? "fast" : "smooth");
  state.lastPipelineStage = stage;
}
