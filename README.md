# Snake Game for Interactive Portfolio

I built this Snake game as an interactive GitHub profile intro using Vanilla JS/HTML/CSS. Eat apples to unlock projects, discover them by keyword, or just keep playing.

**Play live:** https://caiocrocha.github.io/snake-game

The project also includes a GitHub projects scraper that uses Python, requests, and Named Entitity Recognition with GLiNER + spacy to extract keywords, skills, and tech stack from the project descriptions.

## Local Setup

Configure your GitHub username:

```bash
cp js/env.example.js js/env.js
# Edit js/env.js and set GITHUB_PREFIX to your GitHub URL
```

To generate project metadata from your GitHub repos:

```bash
cd scripts
cp .env.example .env   # set GITHUB_USER
```

Install dependencies:

```bash
pip install requests python-dotenv spacy gliner2
python -m spacy download en_core_web_sm
python scrape_projects.py
```

The script extracts project keywords using GLiNER2 (default) or spaCy (lighter, run with `--spacy-only`). 

Commit the updated `data/projects.json`. GitHub Pages serves it statically.
