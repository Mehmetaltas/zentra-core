import json
import re
from datetime import datetime, timezone
from pathlib import Path

# ======================
# PATHS
# ======================
DATA_DIR = Path("data")
DATA_DIR.mkdir(parents=True, exist_ok=True)

ARCHIVE = DATA_DIR / "general_ai_archive.jsonl"
TASKS = DATA_DIR / "general_ai_tasks.jsonl"
USER_PREF = DATA_DIR / "general_ai_user_pref.json"

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
# UTIL
# ======================
def now_utc():
    return datetime.now(timezone.utc).isoformat()

def load_json(path, default):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except Exception:
        return default

def save_json(path, data):
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

# ======================
# FILE / CONTEXT
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
    t = text.lower().strip()

    if any(x in t for x in ["mail", "yaz", "metin", "teklif"]):
        domain = "writing"
    elif any(x in t for x in ["araştır", "kaynak", "rakip", "incele"]):
        domain = "research"
    elif any(x in t for x in ["pdf", "belge", "doküman", "dosya"]):
        domain = "document"
    elif any(x in t for x in ["çevir", "translate"]):
        domain = "translation"
    elif any(x in t for x in ["kod", "python", "bug"]):
        domain = "code"
    elif any(x in t for x in ["rapor", "iş", "müşteri"]):
        domain = "business"
    elif any(x in t for x in ["görev", "plan", "akış"]):
        domain = "workflow"
    else:
        domain = "general"

    return {
        "domain": domain,
        "assistant": ASSISTANTS[domain]
    }

# ======================
# MEMORY
# ======================
def update_memory(meta):
    pref = load_json(USER_PREF, {"last": None, "counts": {}})
    d = meta["domain"]
    pref["last"] = d
    pref["counts"][d] = pref["counts"].get(d, 0) + 1
    save_json(USER_PREF, pref)
    return pref

def get_last_domain():
    return load_json(USER_PREF, {"last": None}).get("last")

# ======================
# OUTPUT GENERATORS
# ======================
def writing(text):
    return f"""KONU: Profesyonel Mail

Merhaba,

{text}

Saygılarımla"""

def research(text, ctx):
    return f"""ARAŞTIRMA:

SORU:
{text}

KAYNAK:
{ctx[:500] if ctx else "yok"}

ANALİZ:
- veri incelendi

SONUÇ:
- genişletilebilir"""

def document(ctx):
    return f"""DOKÜMAN ANALİZİ:

{ctx[:500] if ctx else "dosya yok"}

SONUÇ:
- özet çıkarıldı"""

def workflow(text):
    return f"""PLAN:

{text}

ADIM:
1. analiz
2. plan
3. uygula"""

def general(text):
    return f"GENEL:\n{text}"

# ======================
# DISPATCH
# ======================
def generate(text, meta, ctx):
    d = meta["domain"]
    if d == "writing":
        return writing(text)
    if d == "research":
        return research(text, ctx)
    if d == "document":
        return document(ctx)
    if d == "workflow":
        return workflow(text)
    return general(text)

# ======================
# ACTION ENGINE
# ======================
def extract_tasks(content):
    lines = content.splitlines()
    return [l for l in lines if l.startswith("-") or l.startswith("1.")]

def create_tasks(tasks):
    for t in tasks:
        rec = {"time": now_utc(), "task": t}
        with TASKS.open("a", encoding="utf-8") as f:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

def export(content):
    name = f"data/out_{datetime.now().strftime('%H%M%S')}.txt"
    Path(name).write_text(content, encoding="utf-8")
    return name

# ======================
# OUTPUT
# ======================
def build(text, meta, ctx):
    content = generate(text, meta, ctx)
    tasks = extract_tasks(content)
    create_tasks(tasks)
    path = export(content)

    return f"""ZENTRA OUTPUT

Assistant: {meta["assistant"]}

SONUÇ:
Çıktı üretildi

KULLANILABİLİR:
{content}

AKSİYON:
- görev: {len(tasks)}
- export: {path}"""

# ======================
# ARCHIVE
# ======================
def archive(inp, out):
    with ARCHIVE.open("a", encoding="utf-8") as f:
        f.write(json.dumps({
            "time": now_utc(),
            "input": inp,
            "output": out
        }) + "\n")

# ======================
# RUN
# ======================
def run(text):
    ctx = load_file_content(text)
    meta = classify(text)
    update_memory(meta)
    out = build(text, meta, ctx)
    archive(text, out)
    return out

# ======================
# CLI
# ======================
if __name__ == "__main__":
    print("ZENTRA v5 Unified Core")
    print("Çıkmak için: exit")

    while True:
        q = input("\nZENTRA > ").strip()

        if q.lower() in {"exit","quit","q","çık","exıt"}:
            break

        if not q:
            print("Boş giriş")
            continue

        print(run(q))
