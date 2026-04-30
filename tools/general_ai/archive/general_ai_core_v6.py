import json
from datetime import datetime, timezone
from pathlib import Path

DATA = Path("data")
DATA.mkdir(exist_ok=True)

ARCHIVE = DATA / "general_ai_archive.jsonl"

ASSISTANTS = {
    "writing": "Writing Assistant",
    "research": "Research Assistant",
    "workflow": "Workflow Assistant",
    "business": "Business Assistant",
    "general": "General Assistant",
}

def now():
    return datetime.now(timezone.utc).isoformat()

# ======================
# CLASSIFY (FIXED)
# ======================
def classify(text):
    t = text.lower()

    if any(x in t for x in ["mail", "yaz", "metin"]):
        domain = "writing"
    elif any(x in t for x in ["araştır", "incele", ".txt"]):
        domain = "research"
    elif any(x in t for x in ["plan", "akış", "görev"]):
        domain = "workflow"
    elif any(x in t for x in ["iş", "müşteri", "rapor"]):
        domain = "business"
    else:
        domain = "general"

    return {
        "domain": domain,
        "assistant": ASSISTANTS[domain]
    }

# ======================
# OUTPUTS (UPGRADED)
# ======================
def writing(text):
    return f"""KONU: Profesyonel İletişim

Merhaba,

{text.strip().capitalize()} talebiniz doğrultusunda süreci başlattık.

Ana başlıklar:
- Talep alındı ve değerlendirildi
- Süreç planlandı
- Gelişmeler paylaşılacak

Geri dönüşünüzü rica ederim.

Saygılarımla"""

def research(text, ctx):
    return f"""ARAŞTIRMA RAPORU

KONU:
{text}

VERİ:
{ctx if ctx else "veri yok"}

ANALİZ:
- içerik incelendi
- risk ve fırsat noktaları belirlendi

SONUÇ:
- geniş analiz önerilir"""

def workflow(text):
    return f"""İŞ PLANI

AMAÇ:
{text}

ADIMLAR:
1. Analiz
2. Planlama
3. Uygulama
4. Kontrol

SONUÇ:
- uygulanabilir plan hazır"""

def business(text):
    return f"""İŞ RAPORU

KONU:
{text}

ÖZET:
- iş talebi alındı
- değerlendirme yapıldı

AKSİYON:
- rapor hazırla
- iletişim kur
- takip et"""

def general(text):
    return f"""GENEL ÇIKTI

{text}

- genişletilebilir"""

# ======================
# FILE LOAD
# ======================
def load_file(text):
    for w in text.split():
        if w.endswith(".txt"):
            try:
                return Path(w).read_text()
            except:
                return "dosya okunamadı"
    return None

# ======================
# BUILD
# ======================
def generate(text, meta):
    ctx = load_file(text)
    d = meta["domain"]

    if d == "writing":
        return writing(text)
    if d == "research":
        return research(text, ctx)
    if d == "workflow":
        return workflow(text)
    if d == "business":
        return business(text)

    return general(text)

# ======================
# OUTPUT FORMAT
# ======================
def build(text):
    meta = classify(text)
    content = generate(text, meta)

    out = f"""ZENTRA OUTPUT

Assistant: {meta["assistant"]}

SONUÇ:
Çıktı üretildi

DETAY:
{content}
"""

    with ARCHIVE.open("a") as f:
        f.write(json.dumps({
            "time": now(),
            "input": text,
            "assistant": meta["assistant"]
        }) + "\n")

    return out

# ======================
# RUN
# ======================
if __name__ == "__main__":
    print("ZENTRA v6")
    print("exit ile çık")

    while True:
        q = input("\nZENTRA > ").strip()

        if q.lower() in ["exit","quit","q","çık"]:
            break

        if not q:
            print("boş giriş")
            continue

        print(build(q))
