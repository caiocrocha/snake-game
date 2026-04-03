// ui/projectPanel.js — post-game project card: weighted selection, show/hide

import { WEIGHTS, GITHUB_PREFIX } from "../config.js";
import { state }   from "../state.js";
import { clear as clearChatbot } from "./chatbot.js";

const panel    = document.getElementById("project-panel");
const tagEl    = document.getElementById("project-tag");
const nameEl   = document.getElementById("project-name");
const descEl   = document.getElementById("project-desc");
const linkEl   = document.getElementById("project-link");
const dpadEl   = document.getElementById("dpad");

function projectUrl(p) {
  return (p.repo && GITHUB_PREFIX) ? GITHUB_PREFIX + p.repo : "";
}

function weightedPick() {
  const pool = state.projects.flatMap(p => Array(WEIGHTS[p.name] ?? 1).fill(p));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// getNextTag is exported so renderer.js can label the food item
export function getNextTag() {
  if (!state.projects.length) return "";
  return state.projects[state.score % state.projects.length].tag;
}

export function show() {
  const p = weightedPick();
  if (!p) return;                          // no projects loaded
  tagEl.textContent  = p.tag;
  nameEl.textContent = p.displayName;
  descEl.textContent = p.description;
  const url = projectUrl(p);
  linkEl.href = url;
  linkEl.classList.toggle("hidden", !url);
  clearChatbot();
  panel.classList.remove("hidden");
  if (dpadEl) dpadEl.classList.add("hidden");

  setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
}

export function hide() {
  panel.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
