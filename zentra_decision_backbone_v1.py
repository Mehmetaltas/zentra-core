# ZENTRA Decision Backbone v1
# Block: ZDB-010
# Purpose: System Hardening / Stable Proof Output

from datetime import datetime
import json

VALID_DECISIONS = {"APPROVE", "REVIEW", "REJECT"}
VALID_RISK = {"LOW", "MEDIUM", "HIGH"}

def safe_number(value, default=0.0):
    try:
        return float(value)
    except Exception:
        return default

def normalize_decision(value):
    value = str(value or "REVIEW").upper()
    return value if value in VALID_DECISIONS else "REVIEW"

def normalize_risk(value):
    value = str(value or "MEDIUM").upper()
    return value if value in VALID_RISK else "MEDIUM"

def zentra_decision(real_power, illusion_power):
    real_power = safe_number(real_power)
    illusion_power = safe_number(illusion_power)

    if illusion_power > real_power:
        return "REJECT"

    if real_power >= 0.75 and illusion_power < 0.40:
        return "APPROVE"

    return "REVIEW"

def confidence(real_power, illusion_power, risk):
    real_power = safe_number(real_power)
    illusion_power = safe_number(illusion_power)
    risk = normalize_risk(risk)

    base = 0.50

    if real_power >= 0.75:
        base += 0.20

    if illusion_power >= 0.70:
        base -= 0.15

    if risk == "HIGH":
        base += 0.10

    return round(max(0.0, min(base, 0.95)), 3)

def loss_estimate(existing_decision, zentra_result, risk):
    existing_decision = normalize_decision(existing_decision)
    zentra_result = normalize_decision(zentra_result)
    risk = normalize_risk(risk)

    existing_loss = 0
    zentra_loss = 0
    notes = []

    if existing_decision == "APPROVE" and risk == "HIGH":
        existing_loss = 100
        notes.append("Existing system carries false approval exposure.")

    if existing_decision == "REJECT" and risk == "LOW":
        existing_loss = 40
        notes.append("Existing system may carry missed opportunity exposure.")

    if zentra_result == "APPROVE" and risk == "HIGH":
        zentra_loss = 100
        notes.append("ZENTRA carries approval exposure on high risk.")

    if zentra_result == "REJECT" and risk == "LOW":
        zentra_loss = 40
        notes.append("ZENTRA carries conservative rejection exposure.")

    avoided_loss = existing_loss - zentra_loss

    return {
        "existing_loss": existing_loss,
        "zentra_loss": zentra_loss,
        "avoided_loss": avoided_loss,
        "notes": notes
    }

def explain(scenario_name, existing_decision, zentra_result, real_power, illusion_power, risk, conf):
    explanation = []

    explanation.append(f"Scenario: {scenario_name}")
    explanation.append(f"Existing decision: {existing_decision}")
    explanation.append(f"ZENTRA decision: {zentra_result}")
    explanation.append(f"Risk level: {risk}")
    explanation.append(f"Real power score: {real_power}")
    explanation.append(f"Illusion score: {illusion_power}")
    explanation.append(f"Confidence: {conf}")

    if illusion_power > real_power:
        explanation.append("Illusion signals dominate real repayment power.")

    if real_power >= 0.75 and illusion_power < 0.40:
        explanation.append("Real repayment power is strong and misleading visibility is limited.")

    if zentra_result == "REVIEW":
        explanation.append("Uncertainty remains; case should not be blindly approved or rejected.")

    return explanation

def run_case(case):
    name = str(case.get("name", "Unnamed Case"))
    existing = normalize_decision(case.get("existing_decision"))
    risk = normalize_risk(case.get("risk_level"))
    real_power = safe_number(case.get("real_power"))
    illusion_power = safe_number(case.get("illusion_power"))

    z_result = zentra_decision(real_power, illusion_power)
    conf = confidence(real_power, illusion_power, risk)
    loss = loss_estimate(existing, z_result, risk)
    exp = explain(name, existing, z_result, real_power, illusion_power, risk, conf)

    return {
        "case": name,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "input": {
            "existing_decision": existing,
            "risk_level": risk,
            "real_power": real_power,
            "illusion_power": illusion_power
        },
        "zentra_output": {
            "decision": z_result,
            "confidence": conf,
            "explain": exp
        },
        "proof_metrics": {
            "decision_delta": existing != z_result,
            "loss": loss
        },
        "status": "PROOF_OUTPUT"
    }

if __name__ == "__main__":
    cases = [
        {
            "name": "Illusion Strength Case",
            "existing_decision": "APPROVE",
            "risk_level": "HIGH",
            "real_power": 0.40,
            "illusion_power": 0.90
        },
        {
            "name": "Strong Real Power Case",
            "existing_decision": "REVIEW",
            "risk_level": "LOW",
            "real_power": 0.90,
            "illusion_power": 0.20
        },
        {
            "name": "Borderline Uncertainty Case",
            "existing_decision": "APPROVE",
            "risk_level": "MEDIUM",
            "real_power": 0.60,
            "illusion_power": 0.50
        }
    ]

    outputs = [run_case(c) for c in cases]

    print(json.dumps({
        "zentra_block": "ZDB-010",
        "engine": "System Hardening",
        "outputs": outputs
    }, ensure_ascii=False, indent=2))
