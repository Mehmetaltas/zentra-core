# ZDB-011 Decision Brake / Release + Risk Split Engine
from datetime import datetime
import json

VALID_DECISIONS = {"APPROVE","REVIEW","REJECT"}

def clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))

def normalize_decision(d):
    d = str(d or "REVIEW").upper()
    return d if d in VALID_DECISIONS else "REVIEW"

# --- mevcut basit çekirdek (kısa) ---
def core_decision(real_power, illusion_power):
    real_power = float(real_power)
    illusion_power = float(illusion_power)
    if illusion_power > real_power: return "REJECT"
    if real_power >= 0.75 and illusion_power < 0.40: return "APPROVE"
    return "REVIEW"

def core_confidence(real_power, illusion_power, contradiction_severity):
    base = 0.5 + (real_power-illusion_power)*0.3 - contradiction_severity*0.2
    return round(clamp(base, 0.0, 0.95), 3)

# --- ZDB-011: Brake / Release + Risk Split ---
def brake_release_engine(base_decision, real_power, illusion_power, contradiction_severity):
    """
    Output:
      final_decision, mode, actions(list), rationale(list)
    """
    base_decision = normalize_decision(base_decision)
    real_power = float(real_power)
    illusion_power = float(illusion_power)
    contradiction_severity = float(contradiction_severity)

    actions = []
    rationale = []

    # MODE SEÇİMİ
    if contradiction_severity >= 0.35 or illusion_power >= 0.70:
        mode = "DEFENSIVE"   # el freni çekili
    elif real_power >= 0.80 and illusion_power <= 0.30 and contradiction_severity < 0.20:
        mode = "OFFENSIVE"   # el freni bırak
    else:
        mode = "NEUTRAL"

    final_decision = base_decision

    # DEFENSIVE
    if mode == "DEFENSIVE":
        rationale.append("High contradiction or illusion pressure.")
        # aşağı çek
        if base_decision == "APPROVE":
            final_decision = "CONDITIONAL_APPROVE"
        elif base_decision == "REVIEW":
            final_decision = "REVIEW"
        elif base_decision == "REJECT":
            final_decision = "REJECT"

        # risk azaltıcı aksiyonlar
        actions += [
            "LIMIT_REDUCE",
            "TENOR_SHORTEN",
            "COLLATERAL_INCREASE",
            "ENHANCED_MONITORING"
        ]

        # çok riskliyse parçala
        if illusion_power > real_power:
            final_decision = "RISK_SPLIT"
            actions.append("PARTIAL_APPROVAL")

    # OFFENSIVE
    elif mode == "OFFENSIVE":
        rationale.append("Strong real power with low contradiction.")
        if base_decision == "REVIEW":
            final_decision = "APPROVE"
            actions += ["LIMITED_APPROVAL", "MONITORING"]
        elif base_decision == "REJECT":
            final_decision = "REVIEW"
            actions += ["RECHECK_DATA", "SECONDARY_VALIDATION"]
        else:
            final_decision = "APPROVE"
            actions += ["STANDARD_APPROVAL", "MONITORING"]

    # NEUTRAL
    else:
        rationale.append("Mixed signals; keep controlled stance.")
        if base_decision == "APPROVE":
            final_decision = "CONDITIONAL_APPROVE"
            actions += ["LIMIT_REDUCE", "MONITORING"]
        elif base_decision == "REVIEW":
            final_decision = "REVIEW"
            actions += ["REQUEST_ADDITIONAL_DATA"]
        else:
            final_decision = "REJECT"

    return final_decision, mode, actions, rationale

def run_case(case):
    name = case.get("name","case")
    real_power = float(case.get("real_power",0.0))
    illusion_power = float(case.get("illusion_power",0.0))
    contradiction_severity = float(case.get("contradiction_severity",0.0))

    base = core_decision(real_power, illusion_power)
    conf = core_confidence(real_power, illusion_power, contradiction_severity)

    final_decision, mode, actions, rationale = brake_release_engine(
        base, real_power, illusion_power, contradiction_severity
    )

    return {
        "case": name,
        "timestamp": datetime.utcnow().isoformat()+"Z",
        "input": {
            "real_power": real_power,
            "illusion_power": illusion_power,
            "contradiction_severity": contradiction_severity
        },
        "base_output": {
            "decision": base,
            "confidence": conf
        },
        "final_output": {
            "decision": final_decision,
            "mode": mode,
            "actions": actions,
            "rationale": rationale
        }
    }

if __name__ == "__main__":
    cases = [
        # yüksek yanıltıcı güç → freni çek + böl
        {"name":"Illusion High","real_power":0.4,"illusion_power":0.9,"contradiction_severity":0.5},
        # güçlü gerçek güç → freni bırak
        {"name":"Strong Real","real_power":0.9,"illusion_power":0.2,"contradiction_severity":0.1},
        # karışık → nötr + kontrollü
        {"name":"Mixed","real_power":0.6,"illusion_power":0.5,"contradiction_severity":0.25},
    ]

    outputs = [run_case(c) for c in cases]
    print(json.dumps({"zentra_block":"ZDB-011","outputs":outputs}, ensure_ascii=False, indent=2))
