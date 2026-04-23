# ZENTRA Decision Backbone v1
# Block: ZDB-003
# Date: 2026-04-23
# Path: /data/data/com.termux/files/home/ZENTRA_MASTER/zentra-final/zentra_decision_backbone_v1.py

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
    "verified_income",
    "net_cashflow",
    "regular_payment_history",
    "loan_payment_discipline",
    "credit_card_payment_discipline",
    "utility_payment_discipline",
    "tax_payment_discipline",
    "sgk_consistent_income",
}

SUPPORT_SIGNALS = {
    "vehicle_asset",
    "property_asset",
    "guarantor",
    "collateral",
    "business_history",
    "registered_assets",
    "bureau_score",
}

ILLUSION_SIGNALS = {
    "declared_income",
    "shared_property",
    "illiquid_asset",
    "cyclical_check_flow",
    "temporary_cash_spike",
    "rotating_debt_payment",
    "nominal_asset_value",
    "unverified_income",
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

def classify_signal(signal: dict) -> str:
    name = str(signal.get("name", "")).strip()

    if name in REAL_POWER_SIGNALS:
        return "REAL_POWER"
    if name in SUPPORT_SIGNALS:
        return "SUPPORT"
    if name in ILLUSION_SIGNALS:
        return "ILLUSION"

    trust_score = signal.get("trust_score", 0.0)
    manipulation = signal.get("manipulation_risk", "medium")
    verifiability = signal.get("verifiability", "medium")

    if trust_score >= 0.75 and manipulation == "low" and verifiability in ("high", "medium"):
        return "REAL_POWER"

    if manipulation == "high" or verifiability == "low":
        return "ILLUSION"

    return "SUPPORT"

def process_signals(signals: list[dict]) -> list[dict]:
    processed = []

    for s in signals:
        trust = calculate_trust(s)

        enriched = {
            "name": s.get("name"),
            "value": s.get("value"),
            "source": s.get("source"),
            "timestamp": s.get("timestamp"),
            "repeatability": s.get("repeatability", "medium"),
            "verifiability": s.get("verifiability", "medium"),
            "manipulation_risk": s.get("manipulation_risk", "medium"),
            "trust_score": trust,
        }

        enriched["classification"] = classify_signal(enriched)
        processed.append(enriched)

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
        {
            "name": "vehicle_asset",
            "value": 900000,
            "source": "registry",
            "timestamp": "2026-03-15",
            "repeatability": "medium",
            "verifiability": "high",
            "manipulation_risk": "medium",
        },
    ]

    result = process_signals(test_signals)

    print("\nZENTRA SIGNAL OUTPUT\n")
    for row in result:
        print(row)
