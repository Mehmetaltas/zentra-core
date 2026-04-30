#!/usr/bin/env python3
import json, datetime, pathlib

def simulate(base):
    variations = [
        ("Base", base),
        ("High Risk", {**base, "risk": base["risk"]+10}),
        ("FX Stress", {**base, "fxPressure": base["fxPressure"]+10})
    ]

    results = []
    for name, inp in variations:
        if inp["risk"] >= 80:
            decision = "PROTECT"
        elif inp["ftSignal"] == "BUY" and inp["risk"] < 75:
            decision = "ENTRY"
        else:
            decision = "HOLD"

        results.append({
            "scenario": name,
            "decision": decision
        })

    stable = len(set(r["decision"] for r in results)) == 1

    return {
        "timestamp": datetime.datetime.utcnow().isoformat()+"Z",
        "stable": stable,
        "results": results
    }

out = simulate({
    "risk":72,
    "ftSignal":"BUY",
    "fxPressure":64,
    "liquidity":70
})

pathlib.Path("data").mkdir(exist_ok=True)
pathlib.Path("data/simulation_engine_v1.json").write_text(json.dumps(out, indent=2))
print(json.dumps(out, indent=2))
