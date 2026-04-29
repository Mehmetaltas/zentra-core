import json
from datetime import datetime
from pathlib import Path

ARCHIVE = Path("data/general_ai_archive.jsonl")
ARCHIVE.parent.mkdir(parents=True, exist_ok=True)

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

def classify(text: str) -> dict:
    t = text.lower()
    if any(x in t for x in ["mail", "yaz", "metin", "teklif"]):
        domain = "writing"
    elif any(x in t for x in ["araştır", "kaynak", "rakip", "incele"]):
        domain = "research"
    elif any(x in t for x in ["pdf", "belge", "doküman", "dosya"]):
        domain = "document"
    elif any(x in t for x in ["çevir", "translate", "arapça", "ingilizce"]):
        domain = "translation"
    elif any(x in t for x in ["kod", "python", "html", "bug", "hata"]):
        domain = "code"
    elif any(x in t for x in ["rapor", "iş", "müşteri", "şirket"]):
        domain = "business"
    elif any(x in t for x in ["görev", "workflow", "akış", "plan"]):
        domain = "workflow"
    else:
        domain = "general"

    level = "deep" if any(x in t for x in ["derin", "profesyonel", "strateji"]) else "standard"
    return {"domain": domain, "level": level, "assistant": ASSISTANTS[domain]}

def output_standard(text: str, meta: dict) -> str:
    return f"""
ZENTRA GENERAL AI OUTPUT

Assistant:
{meta["assistant"]}

Seviye:
{meta["level"]}

SONUÇ:
İstek sınıflandırıldı ve uygun assistant akışına bağlandı.

AÇIKLAMA:
Bu bootstrap sürümü; input classification, assistant routing, output standard ve archive kaydını test eder.

KULLANILABİLİR ÇIKTI:
Kullanıcı isteği:
{text}

Alan:
{meta["domain"]}

AKSİYONLAR:
- Düzenle
- Rapor yap
- Göreve çevir
- Kaydet
""".strip()

def archive(input_text: str, output: str, meta: dict) -> None:
    record = {
        "timestamp": datetime.utcnow().isoformat(),
        "input": input_text,
        "meta": meta,
        "output": output,
    }
    with ARCHIVE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")

def run(text: str) -> str:
    meta = classify(text)
    out = output_standard(text, meta)
    archive(text, out, meta)
    return out

if __name__ == "__main__":
    print("ZENTRA General AI Core Bootstrap")
    print("Çıkmak için: exit")
    while True:
        user_input = input("\nZENTRA > ").strip()
        if user_input.lower() in {"exit", "quit"}:
            break
        print("\n" + run(user_input))
