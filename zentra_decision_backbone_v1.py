from datetime import datetime

# -------------------------
# TEST SCENARIO
# -------------------------
scenario = {
    "existing_decision": "APPROVE",
    "risk_level": "HIGH",
    "signals": [
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
            "value": 150000,
            "source": "declared",
            "timestamp": "2026-04-01",
            "repeatability": "low",
            "verifiability": "low",
            "manipulation_risk": "high"
        },
        {
            "name": "vehicle_asset",
            "value": 1000000,
            "source": "registry",
            "timestamp": "2026-03-01",
            "repeatability": "medium",
            "verifiability": "high",
            "manipulation_risk": "medium"
        }
    ]
}

# -------------------------
# SIMPLE TRUST
# -------------------------
def trust(s):
    base = 0.5
    if s["source"] == "bank_transaction": base = 0.9
    if s["source"] == "declared": base = 0.4

    return base

# -------------------------
# CLASSIFICATION
# -------------------------
def classify(name):
    if name == "income": return "REAL_POWER"
    if name == "declared_income": return "ILLUSION"
    return "SUPPORT"

# -------------------------
# ZENTRA DECISION
# -------------------------
def zentra_decision(signals):
    real = 0
    illusion = 0

    for s in signals:
        t = trust(s)
        c = classify(s["name"])

        if c == "REAL_POWER":
            real += t
        elif c == "ILLUSION":
            illusion += t

    if illusion > real:
        return "REJECT"
    if real > 0.7:
        return "APPROVE"
    return "REVIEW"

# -------------------------
# LOSS
# -------------------------
def loss(existing, zentra, risk):
    if existing == "APPROVE" and risk == "HIGH":
        return 100
    if zentra == "REJECT" and risk == "HIGH":
        return 0
    return 20

# -------------------------
# RUN
# -------------------------
signals = scenario["signals"]

zentra = zentra_decision(signals)
existing = scenario["existing_decision"]
risk = scenario["risk_level"]

loss_val = loss(existing, zentra, risk)

print("\nZENTRA REAL TEST\n")
print("Existing:", existing)
print("ZENTRA :", zentra)
print("Risk:", risk)
print("Loss:", loss_val)

print("\nSignals:")
for s in signals:
    print(s)
