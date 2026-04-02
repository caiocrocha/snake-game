import re
import spacy

KNOWN_SKILLS = frozenset({
    # Languages
    "python", "javascript", "typescript", "rust", "go", "java", "c++", "c#",
    "ruby", "swift", "kotlin", "scala", "sql", "bash", "html", "css", "php", "lua",
    # Frontend
    "react", "vue", "angular", "next.js", "svelte", "tailwind",
    # Backend
    "fastapi", "django", "flask", "express", "spring", "rails", "nestjs",
    # ML / AI
    "pytorch", "tensorflow", "keras", "scikit-learn", "xgboost", "langchain",
    "transformers", "diffusers", "pandas", "numpy", "openai", "anthropic", "ollama",
    # Cloud / DevOps
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "github actions",
    "vercel", "netlify", "heroku",
    # Databases
    "postgresql", "mysql", "sqlite", "mongodb", "redis", "elasticsearch",
    "pinecone", "weaviate", "chroma", "supabase", "firebase",
    # AI/ML concepts
    "rag", "fine-tuning", "embeddings", "vector search", "llm", "gpt", "bert",
    "transformer", "reinforcement learning", "semantic search", "object detection",
    # Protocols
    "rest", "graphql", "grpc", "websocket", "oauth",
})

STOP = frozenset({
    "use", "using", "used", "run", "make", "build", "create", "get", "set",
    "new", "old", "data", "project", "based", "github", "file", "repo",
    "app", "install", "local", "link", "description", "click", "feel", "free",
    "also", "like", "just", "well", "way", "need", "want", "good", "help",
})

# Longer skills first so "next.js" matches before "js", "scikit-learn" before "learn", etc.
_SKILLS_RE = re.compile(
    r'(?<!\w)(' + '|'.join(re.escape(s) for s in sorted(KNOWN_SKILLS, key=len, reverse=True)) + r')(?!\w)',
    re.IGNORECASE
)

try:
    nlp = spacy.load("en_core_web_sm", disable=["senter"])
except OSError:
    raise SystemExit("Run: python -m spacy download en_core_web_sm")


def extract_keywords(text: str, top_n: int = 14) -> list[str]:
    text = re.sub(r"```.*?```|http\S+|[#*`_\[\]<>|\\]", " ", text, flags=re.DOTALL)
    text = re.sub(r"\s+", " ", text).strip()

    # Fast path: regex match against curated skills, no NLP needed
    skills = list(dict.fromkeys(m.lower() for m in _SKILLS_RE.findall(text)))
    if len(skills) >= top_n:
        return skills[:top_n]

    # NER fills remaining slots with tools/products not in the curated list
    seen = set(skills)
    for ent in nlp(text[:50_000]).ents:
        kw = ent.text.strip().lower()
        if ent.label_ in {"ORG", "PRODUCT", "WORK_OF_ART"} and len(kw) > 2 and kw not in STOP and kw not in seen:
            skills.append(kw)
            seen.add(kw)
            if len(skills) >= top_n:
                break

    return skills
