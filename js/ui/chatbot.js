// ui/chatbot.js — keyword-matching project discovery bot

import { state } from "../state.js";
import { GITHUB_PREFIX } from "../config.js";

const input      = document.getElementById("keyword-input");
const btn        = document.getElementById("keyword-btn");
const results    = document.getElementById("keyword-results");
const noMatchMsg = document.getElementById("no-match-msg");
const tpl        = document.getElementById("result-item-tpl");

function projectUrl(p) {
  return (p.repo && GITHUB_PREFIX) ? GITHUB_PREFIX + p.repo : "";
}

function match(query) {
  const terms = query.toLowerCase().split(/[\s,;|]+/).map(t => t.trim()).filter(t => t.length > 1);
  if (!terms.length) return [];

  return state.projects
    .map(p => {
      const hay = [...p.keywords, p.displayName, p.description, p.tag].join(" ").toLowerCase();
      let hits = 0;
      terms.forEach(t => {
        if      (p.keywords.some(k => k.toLowerCase() === t))                                      hits += 4;
        else if (p.keywords.some(k => k.toLowerCase().includes(t) || t.includes(k.toLowerCase()))) hits += 2;
        else if (hay.includes(t))                                                                  hits += 1;
      });
      return { p, hits };
    })
    .filter(r => r.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .map(r => r.p);
}

function render(projects) {
  // Remove previously appended result cards (leaves #no-match-msg in place)
  results.querySelectorAll(".result-item").forEach(el => el.remove());

  noMatchMsg.classList.toggle("hidden", projects.length > 0);
  if (!projects.length) return;

  projects.forEach(p => {
    const url  = projectUrl(p);
    const item = tpl.content.cloneNode(true).firstElementChild;

    item.querySelector(".result-tag").textContent  = p.tag;
    item.querySelector(".result-name").textContent = p.displayName;
    item.querySelector(".result-desc").textContent = p.description.slice(0, 120) + "…";

    const link = item.querySelector(".result-link");
    if (url) {
      link.href = url;
    } else {
      link.remove();
    }

    results.appendChild(item);
  });
}

function search() {
  const q = input.value.trim();
  if (q) render(match(q));
}

export function clear() {
  input.value = "";
  results.querySelectorAll(".result-item").forEach(el => el.remove());
  noMatchMsg.classList.add("hidden");
}

export function init() {
  btn.addEventListener("click", search);
  input.addEventListener("keydown", e => { if (e.key === "Enter") search(); });
}
