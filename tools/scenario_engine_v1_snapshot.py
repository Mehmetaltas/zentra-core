#!/usr/bin/env python3
import json, datetime, pathlib

def clamp(n, a, b):
    return max(a, min(b, n))

def build_scenario(input_data):
    risk = input_data.get("risk", 72)
    credit = input_data.get("credit", "REVIEW")
    ft = input_data.get("ftSignal", "BUY")
    fx = input_data.get("fxPressure", 64)

    scenarios = [
        {
            "id": "A",
            "name": "Controlled Entry",
            "decision": "LIMITED ENTRY" if ft == "BUY" and risk < 78 else "WAIT",
            "confidence": clamp(78 - max(0, risk - 72), 45, 88),
            "risk": risk,
            "action": "Use Financial Trade for timing; cap exposure through RiskLens.",
            "warning": "Do not enter with full exposure."
        },
        {
            "id": "B",
            "name": "Risk-First Protection",
            "decision": "HEDGE / REDUCE" if risk >= 70 else "MONITOR",
            "confidence": clamp(70 + max(0, risk - 70), 55, 90),
            "risk": clamp(risk + 6, 0, 100),
            "action": "Reduce vulnerable exposure and open RiskLens report.",
            "warning": "Risk layer is active."
        },
        {
            "id": "C",
            "name": "FX / Credit Pressure",
            "decision": "CREDIT REVIEW" if fx > 60 or credit == "REVIEW" else "CLEAR",
            "confidence": clamp(68 + max(0, fx - 60), 50, 86),
            "risk": clamp((risk + fx) / 2, 0, 100),
            "action": "Check Credit Intelligence before execution.",
            "warning": "FX and credit pressure may change the final action."
        }
    ]

    best = sorted(scenarios, key=lambda x: x["confidence"], reverse=True)[0]
    conflict = any(s["decision"] != best["decision"] for s in scenarios)

    return {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "input": input_data,
        "scenarios": scenarios,
        "recommended": best,
        "conflict": conflict,
        "summary": "Multiple scenario outputs detected. Use controlled decision route." if conflict else "Scenario outputs aligned."
    }

out = build_scenario({
    "risk": 72,
    "credit": "REVIEW",
    "ftSignal": "BUY",
    "fxPressure": 64,
    "liquidity": 70
})

pathlib.Path("data").mkdir(exist_ok=True)
pathlib.Path("data/scenario_engine_v1_snapshot.json").write_text(json.dumps(out, indent=2, ensure_ascii=False))
print(json.dumps(out, indent=2, ensure_ascii=False))
