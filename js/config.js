// js/config.js — compile-time constants

export const GRID             = 30;   // px per grid cell
export const MOVE_INTERVAL_MS = 140;  // ms between snake moves
export const ANIM_LEN         = 50;   // death-animation frame count

export const FOOD_COLOR = "#a855f7";

// Pipeline cycling: 8 stages that repeat every CYCLE_LEN apples
export const CYCLE_LEN        = 8;
export const STAGE_STEP       = 1; // every N apples
export const STAGE_THRESHOLDS = Array.from({ length: Math.ceil(CYCLE_LEN / STAGE_STEP) }, (_, i) => i * STAGE_STEP);

export const ENCOURAGEMENTS = [
  "CONGRATS!", "BRAVO!", "GOOD ENOUGH!", "NOT BAD!",
  "NICE ONE!", "WELL DONE!", "KEEP IT UP!", "SOLID!",
  "IMPRESSIVE!", "YOU TRIED!", "RESPECT.", "AMAZING!",
];

export const UNLOCK_MSGS = [
  "Now check out an interesting project below",
  "You unlocked a new project!",
  "There's something worth seeing below ↓",
  "A project is waiting for you below",
  "Discover something cool below ↓",
  "Here's a project you might like",
  "Scroll down: a project just appeared",
];

export { GITHUB_PREFIX } from "./env.js";

// Project appearance weights on the game-over screen
export const WEIGHTS = {
  "wildlife_rescue_assistant":      6,
  "SkillsRadar":                    5,
  "arxhive_rag":                    4,
  "Brazilian_Portuguese_Quick_APT": 3,
  "SarsCov2DrugHunter":             2,
};