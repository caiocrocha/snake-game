import re
from gliner2 import GLiNER2

# GLiNER2 uses these strings directly as zero-shot entity type labels,
# so make them descriptive enough for the model to generalise.
LABELS = [
    "programming language like Python, JavaScript, TypeScript, Rust, Go, Java, SQL, Bash, HTML, CSS",
    "software framework or library like React, FastAPI, PyTorch, TensorFlow, LangChain, Django, Next.js, Pandas",
    "cloud or devops tool like AWS, GCP, Docker, Kubernetes, GitHub Actions, Terraform, Vercel",
    "AI or ML technique like RAG, fine-tuning, embeddings, vector search, LLM, GPT, BERT, transformer, diffusion",
    "database or storage like PostgreSQL, MongoDB, Redis, Pinecone, Elasticsearch, SQLite, Firebase",
    "domain or field like NLP, computer vision, robotics, bioinformatics, fintech, cybersecurity",
]

model = GLiNER2.from_pretrained("fastino/gliner2-base-v1")


def extract_keywords(text: str, top_n: int = 14) -> list[str]:
    text = re.sub(r"```.*?```|http\S+|[#*`_\[\]<>|\\]", " ", text, flags=re.DOTALL)
    text = re.sub(r"\s+", " ", text).strip()[:3000]

    try:
        entities = model.extract_entities(text, LABELS).get("entities", {})
        kws = [kw.strip() for matches in entities.values() for kw in matches]
        return list(dict.fromkeys(kw for kw in kws if 2 < len(kw) <= 50))[:top_n]
    except Exception as e:
        print(f"GLiNER2 error: {e}")
        return []
