// game.js — orchestrator: loads data, wires up modules, starts the game.

import { state }      from "./state.js";
import { applyTheme } from "./ui/theme.js";
import { start }      from "./engine/loop.js";
import { init }       from "./engine/input.js";
import { init as initChatbot } from "./ui/chatbot.js";

init();        // keyboard, touch, d-pad, play-again button
initChatbot(); // keyword-matching bot search events

fetch("data/projects.json")
  .then(r => r.json())
  .then(data => {
    state.projects    = data;
    state.runThemeIdx = Math.floor(Math.random() * data.length);
    applyTheme(data[state.runThemeIdx]);
  })
  .catch(err => console.warn("[snake] projects.json failed to load:", err))
  .finally(() => start());
