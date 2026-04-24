from datetime import datetime

SOURCE_RELIABILITY = {
    "bank_transaction": 0.90,
    "sgk": 0.80,
    "bureau": 0.85,
    "declared": 0.40,
    "external": 0.60,
    "registry": 0.75,
}

REAL_POWER_SIGNALS = {"income", "net_cashflow", "payment_history"}
SUPPORT_SIGNALS = {"vehicle_asset", "property_asset"}
ILLUSION_SIGNALS = {"declared_income", "shared_property", "temporary_cash"}

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

def classify(name):
    if name in REAL_POWER_SIGNALS: return "REAL_POWER"
    if name in SUPPORT_SIGNALS: return "SUPPORT"
    if name in ILLUSION_SIGNALS: return "ILLUSION"
    return "SUPPORT"

def contradiction(signals):
    notes = []
    inc = next((s for s in signals if s["name"]=="income"), None)
    dec = next((s for s in signals if s["name"]=="declared_income"), None)

    if inc and dec:
        if inc["trust"] >= dec["trust"]:
            notes.append("Real income dominates")
        else:
            notes.append("Declared income suspicious")

    return notes

# 🔥 FINAL AGGREGATION
def aggregate(signals, notes):

    real = [s for s in signals if s["class"]=="REAL_POWER"]
    support = [s for s in signals if s["class"]=="SUPPORT"]
    illusion = [s for s in signals if s["class"]=="ILLUSION"]

    real_score = sum(s["trust"] for s in real)
    illusion_score = sum(s["trust"] for s in illusion)

    decision = "REVIEW"
    confidence = 0.5
    explain = []

    if real_score > 0.8 and illusion_score < 0.4:
        decision = "APPROVE"
        confidence = 0.8
        explain.append("Strong real power signals")

    elif illusion_score > real_score:
        decision = "REJECT"
        confidence = 0.7
        explain.append("Illusion signals dominate")

    else:
        decision = "REVIEW"
        confidence = 0.6
        explain.append("Conflicting signals")

    explain.extend(notes)

    return decision, confidence, explain

def process(signals):

    enriched = []

    for s in signals:
        trust = calculate_trust(s)
        cls = classify(s["name"])

        enriched.append({
            **s,
            "trust": trust,
            "class": cls
        })

    notes = contradiction(enriched)
    decision, confidence, explain = aggregate(enriched, notes)

    return enriched, decision, confidence, explain

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

    signals, decision, confidence, explain = process(test)

    print("\nZENTRA FINAL OUTPUT\n")
    print("Decision:", decision)
    print("Confidence:", confidence)
    print("Explain:")
    for e in explain:
        print("-", e)

    print("\nSIGNALS\n")
    for s in signals:
        print(s)
