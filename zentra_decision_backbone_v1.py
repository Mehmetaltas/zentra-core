from datetime import datetime

SOURCE_RELIABILITY = {
    "bank_transaction": 0.90,
    "sgk": 0.80,
    "bureau": 0.85,
    "declared": 0.40,
    "external": 0.60,
    "registry": 0.75,
}

REAL_POWER = {"income", "net_cashflow", "payment_history"}
SUPPORT = {"vehicle_asset", "property_asset"}
ILLUSION = {"declared_income", "shared_property", "temporary_cash"}

def recency_score(date_str):
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
        days = (datetime.now() - d).days
        if days < 30: return 1.0
        if days < 90: return 0.8
        if days < 180: return 0.6
        return 0.3
    except:
        return 0.5

def trust(signal):
    s = SOURCE_RELIABILITY.get(signal["source"], 0.5)
    r = recency_score(signal["timestamp"])
    rep = 1.0 if signal.get("repeatability")=="high" else 0.7
    ver = 1.0 if signal.get("verifiability")=="high" else 0.6
    m = 0.1 if signal.get("manipulation_risk")=="low" else 0.5

    return round(max(0, min((s*0.35)+(r*0.2)+(rep*0.2)+(ver*0.15)-(m*0.1),1)),3)

def classify(name):
    if name in REAL_POWER: return "REAL_POWER"
    if name in SUPPORT: return "SUPPORT"
    if name in ILLUSION: return "ILLUSION"
    return "SUPPORT"

# 🔥 CONTRADICTION
def contradiction(signals):
    notes = []
    severity = 0

    inc = next((s for s in signals if s["name"]=="income"), None)
    dec = next((s for s in signals if s["name"]=="declared_income"), None)

    if inc and dec:
        if inc["trust"] >= dec["trust"]:
            notes.append("Real income dominates declared income")
            severity += 0.2
        else:
            notes.append("Declared income unreliable")
            severity += 0.4

    return notes, severity

# 🔥 FINAL AGGREGATION
def aggregate(signals, severity):
    real = [s for s in signals if s["class"]=="REAL_POWER"]
    illusion = [s for s in signals if s["class"]=="ILLUSION"]

    real_score = sum(s["trust"] for s in real)
    illusion_score = sum(s["trust"] for s in illusion)

    if real_score > 0.8 and illusion_score < 0.4:
        return "APPROVE"
    if illusion_score > real_score:
        return "REJECT"
    return "REVIEW"

# 🔥 CONFIDENCE ENGINE
def confidence(signals, severity):
    avg_trust = sum(s["trust"] for s in signals) / len(signals)
    conflict_penalty = severity

    score = avg_trust - conflict_penalty
    return round(max(0, min(score,1)),3)

# 🔥 EXPLAIN ENGINE (KOMİTE)
def explain(signals, decision, notes, conf):
    explanation = []

    explanation.append(f"Decision: {decision}")
    explanation.append(f"Confidence: {conf}")

    dominant = sorted(signals, key=lambda x: x["trust"], reverse=True)[0]
    explanation.append(f"Dominant signal: {dominant['name']}")

    for n in notes:
        explanation.append(n)

    return explanation

def process(signals):

    enriched = []

    for s in signals:
        t = trust(s)
        c = classify(s["name"])

        enriched.append({
            **s,
            "trust": t,
            "class": c
        })

    notes, severity = contradiction(enriched)
    decision = aggregate(enriched, severity)
    conf = confidence(enriched, severity)
    exp = explain(enriched, decision, notes, conf)

    return enriched, decision, conf, exp

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

    s, d, c, e = process(test)

    print("\nZENTRA COMMITTEE OUTPUT\n")
    print("Decision:", d)
    print("Confidence:", c)

    print("\nExplain:")
    for x in e:
        print("-", x)

    print("\nSignals:")
    for i in s:
        print(i)
