"""
scrape_projects.py — generates data/projects.json from GitHub repo metadata.

Usage:
    python scrape_projects.py               # GLiNER2 with spaCy fallback
    python scrape_projects.py --spacy-only  # spaCy only (no heavy model)
"""

import argparse
import base64
import json
import os
import re
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

GITHUB_USER = os.environ.get("GITHUB_USER")
HIDE_URL_IN_JSON = os.environ.get("HIDE_URL_IN_JSON", "false").lower() == "true"
API      = "https://api.github.com"
HEADERS  = {"Accept": "application/vnd.github+json"}
BASE_DIR = Path(__file__).parent
OUT_FILE = BASE_DIR.parent / "data" / "projects.json"

cfg = json.loads((BASE_DIR / "config.json").read_text())
SKIP, THEMES, TAGS, DISPLAY_NAMES = (
    set(cfg["skip"]), cfg["themes"], cfg["tags"], cfg["displayNames"]
)
SKIP.add("snake-game")
SKIP.add(GITHUB_USER)


def fetch_readme(repo: str) -> str:
    r = requests.get(f"{API}/repos/{GITHUB_USER}/{repo}/readme", headers=HEADERS)
    if not r.ok:
        return ""
    text = base64.b64decode(r.json().get("content", "")).decode("utf-8", errors="ignore")
    text = re.sub(r"```.*?```", " ", text, flags=re.DOTALL)
    text = re.sub(r"http\S+|[#*`_\[\]<>|\\]", " ", text)
    return re.sub(r"\s+", " ", text).strip()[:2000]


def fetch_topics(repo: str) -> list[str]:
    r = requests.get(
        f"{API}/repos/{GITHUB_USER}/{repo}/topics",
        headers={**HEADERS, "Accept": "application/vnd.github.mercy-preview+json"},
    )
    return r.json().get("names", []) if r.ok else []


def get_keywords(text: str, spacy_only: bool = False) -> list[str]:
    from ner.spacy_extractor import extract_keywords as spacy_kw
    if spacy_only:
        return spacy_kw(text)
    from ner.gliner_extractor import extract_keywords as gliner_kw
    return gliner_kw(text) or spacy_kw(text)


def main(spacy_only: bool = False) -> None:
    print(f"Fetching repos for {GITHUB_USER}…")
    all_repos = requests.get(
        f"{API}/users/{GITHUB_USER}/repos?per_page=100&sort=updated", headers=HEADERS
    ).json()
    repos = [r for r in all_repos if r["name"] not in SKIP]
    print(f"  {len(repos)} repos found\n")

    results = []
    for i, r in enumerate(repos):
        name        = r["name"]
        description = r.get("description") or ""
        language    = r.get("language") or ""
        print(f"  [{i+1}/{len(repos)}] {name}")

        topics   = fetch_topics(name)
        readme   = fetch_readme(name)
        text     = " ".join(filter(None, [description, language, " ".join(topics), readme]))
        keywords = list(dict.fromkeys(topics + get_keywords(text, spacy_only)))[:16]

        results.append({
            "id":             i,
            "name":           name,
            "displayName":    DISPLAY_NAMES.get(name, name.replace("_", " ")),
            "tag":            TAGS.get(name, name[:3].upper()),
            "description":    description,
            "url":            r["html_url"] if not HIDE_URL_IN_JSON else "",
            "keywords":       keywords,
            "theme":          THEMES.get(name, {"snake": "#39ff14", "food": "#ff4444", "accent": "#39ff14"}),
        })

    results.sort(key=lambda p: p["scoreThreshold"])
    OUT_FILE.write_text(json.dumps(results, indent=2))
    print(f"\n✓ {len(results)} projects → {OUT_FILE}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--spacy-only", action="store_true",
                        help="Use spaCy only (skip GLiNER2)")
    args = parser.parse_args()
    main(spacy_only=args.spacy_only)
