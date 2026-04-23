# ZENTRA Decision Backbone v1
# Block: ZDB-002
# Date: 2026-04-23
# Path: /data/data/com.termux/files/home/ZENTRA_MASTER/zentra-final/zentra_decision_backbone_v1.py

from datetime import datetime

SOURCE_RELIABILITY = {
    "bank_transaction": 0.90,
    "sgk": 0.80,
    "bureau": 0.85,
    "declared": 0.40,
    "external": 0.60,
}

def get_recency_score(date_str: str) -> float:
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d")
        days = (datetime.now() - date).days
        if days < 30:
            return 1.0
        if days < 90:
            return 0.8
        if days < 180:
            return 0.6
        return 0.3
    except Exception:
        return 0.5

def get_repeatability_score(flag: str) -> float:
    return {
        "high": 1.0,
        "medium": 0.7,
        "low": 0.3,
    }.get(flag, 0.5)

def get_verifiability_score(flag: str) -> float:
    return {
        "high": 1.0,
        "medium": 0.6,
        "low": 0.2,
    }.get(flag, 0.5)

def get_manipulation_risk(flag: str) -> float:
    return {
        "low": 0.1,
        "medium": 0.5,
        "high": 0.9,
    }.get(flag, 0.5)

def calculate_trust(signal: dict) -> float:
    source_rel = SOURCE_RELIABILITY.get(signal.get("source", ""), 0.5)
    recency = get_recency_score(signal.get("timestamp", ""))
    repeat = get_repeatability_score(signal.get("repeatability", "medium"))
    verify = get_verifiability_score(signal.get("verifiability", "medium"))
    manip = get_manipulation_risk(signal.get("manipulation_risk", "medium"))

    trust_score = (
        (source_rel * 0.35) +
        (recency * 0.20) +
        (repeat * 0.20) +
        (verify * 0.15) -
        (manip * 0.10)
    )
    return round(max(0.0, min(trust_score, 1.0)), 3)

def process_signals(signals: list[dict]) -> list[dict]:
    processed = []
    for s in signals:
        processed.append({
            "name": s.get("name"),
            "value": s.get("value"),
            "source": s.get("source"),
            "trust_score": calculate_trust(s),
        })
    return processed

if __name__ == "__main__":
    test_signals = [
        {
            "name": "income",
            "value": 20000,
            "source": "bank_transaction",
            "timestamp": "2026-04-01",
            "repeatability": "high",
            "verifiability": "high",
            "manipulation_risk": "low",
        },
        {
            "name": "declared_income",
            "value": 50000,
            "source": "declared",
            "timestamp": "2026-04-01",
            "repeatability": "low",
            "verifiability": "low",
            "manipulation_risk": "high",
        },
    ]

    result = process_signals(test_signals)

    print("\nZENTRA SIGNAL OUTPUT\n")
    for row in result:
        print(row)
