import json
import re
from datetime import datetime, timezone
from pathlib import Path

# ======================
# STORAGE
# ======================
ARCHIVE = Path("data/general_ai_archive.jsonl")
TASKS = Path("data/general_ai_tasks.jsonl")
USER_PREF = Path("data/general_ai_user_pref.json")
ARCHIVE.parent.mkdir(parents=True, exist_ok=True)
TASKS.parent.mkdir(parents=True, exist_ok=True)

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
# INPUT CLASSIFICATION
# ======================
def classify(text: str) -> dict:
    t = text.lower().strip()

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

    return {
        "domain": domain,
        "level": level,
        "assistant": ASSISTANTS[domain],
    }

# ======================
# MEMORY (USER PREF)
# ======================
def update_user_pref(meta):
    pref = load_json(USER_PREF, {"last_domain": None, "counts": {}})
    d = meta["domain"]
    pref["last_domain"] = d
    pref["counts"][d] = pref["counts"].get(d, 0) + 1
    save_json(USER_PREF, pref)
    return pref

def get_user_hint():
    pref = load_json(USER_PREF, {"last_domain": None, "counts": {}})
    return pref.get("last_domain")

# ======================
# GENERATORS
# ======================
def writing_output(text: str) -> str:
    subject = "Profesyonel Bilgilendirme"
    return f"""KONU: {subject}

Merhaba,

{text.strip().capitalize()} talebiniz doğrultusunda aşağıdaki bilgilendirmeyi paylaşıyorum.

Ana noktalar:
- Talep değerlendirmeye alınmıştır
- Süreç planlanmaktadır
- Gelişmeler tarafınıza iletilecektir

İhtiyaç halinde detaylı rapor veya teklif hazırlayabilirim.

Geri dönüşünüzü rica ederim.

Saygılarımla"""

def research_output(text: str) -> str:
    return f"""KONU:
{text}

ÖZET:
- Konu analiz edildi
- İlk yapı oluşturuldu

BULGULAR:
- Veri toplama gerekli
- Rakip analizi yapılmalı
- Trend incelemesi eksik

RİSKLER:
- Eksik veri
- Yanlış yönlendirme ihtimali

SONUÇ:
- Geniş araştırma önerilir

AKSİYON:
- Kaynak topla
- Karşılaştırma yap
- Rapor hazırla"""

def business_output(text: str) -> str:
    return f"""İŞ ÇIKTISI:
{text}

ÖZET:
- İş talebi alındı
- Değerlendirme yapıldı

AKSİYON:
- Rapor oluştur
- Mail hazırla
- Göreve çevir"""

def workflow_output(text: str) -> str:
    return f"""İŞ AKIŞI:
{text}

ADIMLAR:
1. Analiz
2. Planlama
3. Uygulama
4. Kontrol

SONUÇ:
- Süreç yönetilebilir"""

def code_output() -> str:
    return """AMAÇ:
Test kodu

KOD:
print("ZENTRA çalışıyor")

ÇALIŞTIR:
python3 dosya.py"""

def document_output(text: str) -> str:
    return f"""DOKÜMAN:
{text}

ÇIKTI:
- Özet
- Kritik noktalar
- Riskler"""

def translation_output(text: str) -> str:
    return f"""ÇEVİRİ:
{text}

MOD:
- Anlam korundu
- Ton korundu"""

def general_output(text: str) -> str:
    return f"""İSTEK:
{text}

YORUM:
General Assistant tarafından işlendi.

AKSİYON:
- Genişlet
- Rapor yap"""

# ======================
# DISPATCH
# ======================
def generate_output(text: str, meta: dict) -> str:
    domain = meta["domain"]

    if domain == "writing":
        return writing_output(text)
    if domain == "research":
        return research_output(text)
    if domain == "business":
        return business_output(text)
    if domain == "workflow":
        return workflow_output(text)
    if domain == "code":
        return code_output()
    if domain == "document":
        return document_output(text)
    if domain == "translation":
        return translation_output(text)

    return general_output(text)

# ======================
# ACTION ENGINE
# ======================
def extract_tasks(content: str):
    lines = [l.strip() for l in content.splitlines() if l.strip()]
    tasks = []
    for l in lines:
        if l.startswith("- ") or re.match(r"^\d+\.", l):
            tasks.append(l.replace("- ", "").strip())
    return tasks

def create_tasks(tasks_list):
    created = []
    for t in tasks_list:
        rec = {
            "timestamp": now_utc(),
            "task": t,
            "status": "open"
        }
        with TASKS.open("a", encoding="utf-8") as f:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
        created.append(t)
    return created

def export_txt(content: str, prefix="zentra_output"):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = Path(f"data/{prefix}_{ts}.txt")
    path.write_text(content, encoding="utf-8")
    return str(path)

# ======================
# OUTPUT FORMAT
# ======================
def build_output(text: str, meta: dict, hint: str) -> (str, dict):
    content = generate_output(text, meta)

    # ACTIONS
    tasks = extract_tasks(content)
    created = create_tasks(tasks) if tasks else []

    export_path = export_txt(content)

    out = f"""ZENTRA GENERAL AI OUTPUT

Assistant:
{meta["assistant"]}

Seviye:
{meta["level"]}

SONUÇ:
Çıktı üretildi.

AÇIKLAMA:
İstek sınıflandırıldı ve uygun assistant tarafından işlendi.
Önceki kullanım ipucu: {hint or "yok"}

KULLANILABİLİR ÇIKTI:
{content}

AKSİYONLAR:
- Görev oluşturuldu: {len(created)}
- Export: {export_path}
- Düzenle
- Rapor yap
- Kaydet"""

    actions_meta = {
        "tasks_created": created,
        "export_path": export_path
    }
    return out, actions_meta

# ======================
# ARCHIVE
# ======================
def archive(input_text: str, output: str, meta: dict, actions_meta: dict):
    record = {
        "timestamp": now_utc(),
        "input": input_text,
        "meta": meta,
        "actions": actions_meta,
        "output": output,
    }
    with ARCHIVE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")

# ======================
# CORE RUN
# ======================
def run(text: str) -> str:
    meta = classify(text)
    hint = get_user_hint()
    pref = update_user_pref(meta)
    out, actions_meta = build_output(text, meta, hint)
    archive(text, out, meta, actions_meta)
    return out

# ======================
# CLI LOOP
# ======================
if __name__ == "__main__":
    print("ZENTRA General AI Core v3 (Action + Memory)")
    print("Çıkmak için: exit")

    while True:
        user_input = input("\nZENTRA > ").strip()

        if user_input.lower() in {"exit", "quit", "q"}:
            print("ZENTRA kapatıldı.")
            break

        if not user_input:
            print("Boş giriş.")
            continue

        print("\n" + run(user_input))
