from datetime import datetime

SOURCE_RELIABILITY = {
    "bank_transaction": 0.90,
    "sgk": 0.80,
    "bureau": 0.85,
    "declared": 0.40,
    "external": 0.60,
    "registry": 0.75,
}

REAL_POWER_SIGNALS = {
    "income",
    "net_cashflow",
    "payment_history",
}

SUPPORT_SIGNALS = {
    "vehicle_asset",
    "property_asset",
}

ILLUSION_SIGNALS = {
    "declared_income",
    "shared_property",
    "temporary_cash",
}

def get_recency_score(date_str):
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d")
        days = (datetime.now() - date).days
        if days < 30: return 1.0
        if days < 90: return 0.8
        if days < 180: return 0.6
        return 0.3
    except:
        return 0.5

def calculate_trust(signal):
    source = SOURCE_RELIABILITY.get(signal["source"], 0.5)
    recency = get_recency_score(signal["timestamp"])
    repeat = 1.0 if signal.get("repeatability") == "high" else 0.7
    verify = 1.0 if signal.get("verifiability") == "high" else 0.6
    manip = 0.1 if signal.get("manipulation_risk") == "low" else 0.5

    trust = (source*0.35)+(recency*0.2)+(repeat*0.2)+(verify*0.15)-(manip*0.1)
    return round(max(0, min(trust,1)),3)

def classify(signal):
    name = signal["name"]

    if name in REAL_POWER_SIGNALS:
        return "REAL_POWER"
    if name in SUPPORT_SIGNALS:
        return "SUPPORT"
    if name in ILLUSION_SIGNALS:
        return "ILLUSION"

    return "SUPPORT"

# 🔥 CONTRADICTION RESOLVER
def resolve(signals):

    income_real = None
    income_declared = None

    for s in signals:
        if s["name"] == "income":
            income_real = s
        if s["name"] == "declared_income":
            income_declared = s

    decision_notes = []

    # ÇELİŞKİ 1: GELİR
    if income_real and income_declared:
        if income_real["trust"] > income_declared["trust"]:
            decision_notes.append("Real income dominates declared income")
        else:
            decision_notes.append("Declared income suspicious")

    # sonucu basitçe dön
    return decision_notes

def process(signals):

    enriched = []

    for s in signals:
        trust = calculate_trust(s)
        cls = classify(s)

        enriched.append({
            **s,
            "trust": trust,
            "class": cls
        })

    notes = resolve(enriched)

    return enriched, notes


if __name__ == "__main__":

    test = [
        {
            "name": "income",
            "value": 20000,
            "source": "bank_transaction",
            "timestamp": "2026-04-01",
            "repeatability": "high",
            "verifiability": "high",
            "manipulation_risk": "low"
        },
        {
            "name": "declared_income",
            "value": 50000,
            "source": "declared",
            "timestamp": "2026-04-01",
            "repeatability": "low",
            "verifiability": "low",
            "manipulation_risk": "high"
        }
    ]

    result, notes = process(test)

    print("\nZENTRA OUTPUT\n")
    for r in result:
        print(r)

    print("\nCONTRADICTION NOTES\n")
    for n in notes:
        print("-", n)
