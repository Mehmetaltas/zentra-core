#!/usr/bin/env python3
import json, datetime, pathlib

def resolve_conflict(scenarios):
    recommended = max(scenarios, key=lambda x: x["confidence"])

    final = recommended["decision"]
    reason = "Recommended scenario applied."

    for s in scenarios:
        if s["name"] == "Risk-First Protection" and s["risk"] >= 75:
            return "PROTECT / REDUCE", "High risk overrides all scenarios."
        if s["name"] == "FX / Credit Pressure" and s["decision"] == "CREDIT REVIEW":
            return "HOLD / REVIEW", "Credit / FX pressure requires review."

    return final, reason

scenarios = [
    {"name":"Controlled Entry","decision":"LIMITED ENTRY","confidence":75,"risk":72},
    {"name":"Risk-First Protection","decision":"HEDGE / REDUCE","confidence":82,"risk":78},
    {"name":"FX / Credit Pressure","decision":"CREDIT REVIEW","confidence":80,"risk":68}
]

decision, reason = resolve_conflict(scenarios)

out = {
    "timestamp": datetime.datetime.utcnow().isoformat()+"Z",
    "finalDecision": decision,
    "reason": reason
}

pathlib.Path("data").mkdir(exist_ok=True)
pathlib.Path("data/conflict_resolver_v1.json").write_text(json.dumps(out, indent=2))
print(json.dumps(out, indent=2))
