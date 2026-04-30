import json
import re
from datetime import datetime, timezone
from pathlib import Path

ARCHIVE = Path("data/general_ai_archive.jsonl")
ARCHIVE.parent.mkdir(parents=True, exist_ok=True)

# ======================
# ASSISTANTS
# ======================
ASSISTANTS = {
    "writing": "Writing Assistant",
    "research": "Research Assistant",
    "document": "Document Assistant",
    "translation": "Translation Assistant",
    "code": "Code Assistant",
    "business": "Business Assistant",
    "workflow": "Workflow Assistant",
    "general": "General Assistant",
}

# ======================
# FILE / CONTEXT LOADER
# ======================
def load_file_content(text):
    words = text.split()

    for w in words:
        if w.endswith(".txt") or w.endswith(".md"):
            try:
                return Path(w).read_text(encoding="utf-8")
            except:
                return "Dosya okunamadı."

    return None

# ======================
# CLASSIFY
# ======================
def classify(text):
    t = text.lower()

    if "mail" in t or "yaz" in t:
        domain = "writing"
    elif "araştır" in t or "incele" in t:
        domain = "research"
    elif "pdf" in t or "dosya" in t:
        domain = "document"
    else:
        domain = "general"

    return {
        "domain": domain,
        "assistant": ASSISTANTS[domain]
    }

# ======================
# OUTPUT GENERATORS
# ======================
def writing(text):
    return f"MAIL:\n{text}"

def research(text, context):
    return f"""ARAŞTIRMA:

SORU:
{text}

KAYNAK:
{context[:500] if context else "yok"}

ANALİZ:
- temel analiz yapıldı

SONUÇ:
- genişletilebilir"""

def document(text, context):
    return f"""DOKÜMAN ANALİZİ:

{context[:500] if context else "dosya yok"}

SONUÇ:
- özet çıkarıldı"""

def general(text):
    return f"GENEL:\n{text}"

# ======================
# ROUTE
# ======================
def generate(text, meta, context):
    if meta["domain"] == "writing":
        return writing(text)
    if meta["domain"] == "research":
        return research(text, context)
    if meta["domain"] == "document":
        return document(text, context)
    return general(text)

# ======================
# OUTPUT FORMAT
# ======================
def build(text, meta, content):
    return f"""ZENTRA OUTPUT

Assistant:
{meta["assistant"]}

ÇIKTI:
{content}
"""

# ======================
# ARCHIVE
# ======================
def archive(input_text, output):
    with ARCHIVE.open("a") as f:
        f.write(json.dumps({
            "time": datetime.now(timezone.utc).isoformat(),
            "input": input_text,
            "output": output
        }) + "\n")

# ======================
# RUN
# ======================
def run(text):
    context = load_file_content(text)
    meta = classify(text)
    content = generate(text, meta, context)
    out = build(text, meta, content)
    archive(text, out)
    return out

# ======================
# CLI
# ======================
if __name__ == "__main__":
    print("ZENTRA v4 (Context Enabled)")
    print("Çıkmak için: exit")

    while True:
        q = input("\nZENTRA > ").strip()

        if q == "exit":
            break

        print(run(q))
