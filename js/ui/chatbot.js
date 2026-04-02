// ui/chatbot.js — keyword-matching project discovery bot

import { state } from "../state.js";
import { GITHUB_PREFIX } from "../config.js";

const input   = document.getElementById("keyword-input");
const btn     = document.getElementById("keyword-btn");
const results = document.getElementById("keyword-results");

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
        else if (hay.includes(t))                                                                   hits += 1;
      });
      return { p, hits };
    })
    .filter(r => r.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .map(r => r.p);
}

function render(projects) {
  results.textContent = ""; // safe clear — no innerHTML

  if (!projects.length) {
    const msg = document.createElement("p");
    msg.className   = "no-match";
    msg.textContent = 'No match — try "RAG", "NLP", "LLM", "ASR" or "bioinformatics".';
    results.appendChild(msg);
    return;
  }

  projects.forEach(p => {
    const url = projectUrl(p);

    const item = document.createElement("div");
    item.className = "result-item";

    const header = document.createElement("div");
    header.className = "result-item-header";

    const tagEl = document.createElement("span");
    tagEl.className   = "result-tag";
    tagEl.textContent = p.tag;

    const nameEl = document.createElement("span");
    nameEl.className   = "result-name";
    nameEl.textContent = p.displayName;

    header.appendChild(tagEl);
    header.appendChild(nameEl);

    const desc = document.createElement("p");
    desc.className   = "result-desc";
    desc.textContent = p.description.slice(0, 120) + "…";

    item.appendChild(header);
    item.appendChild(desc);

    if (url) {
      const link = document.createElement("a");
      link.className = "result-link";
      link.href      = url;
      link.target    = "_blank";
      link.rel       = "noopener noreferrer";
      link.textContent = "View on GitHub →";
      item.appendChild(link);
    }

    results.appendChild(item);
  });
}

function search() {
  const q = input.value.trim();
  if (q) render(match(q));
}

export function clear() {
  input.value     = "";
  results.textContent = "";
}

export function init() {
  btn.addEventListener("click", search);
  input.addEventListener("keydown", e => { if (e.key === "Enter") search(); });
}
