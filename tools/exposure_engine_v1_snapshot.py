#!/usr/bin/env python3
import json, datetime, pathlib

def optimize(risk, confidence, stability):
    exposure = 0.5

    if risk >= 80:
        exposure -= 0.3
    elif risk >= 70:
        exposure -= 0.15

    if confidence >= 80:
        exposure += 0.2
    elif confidence >= 70:
        exposure += 0.1

    if not stability:
        exposure -= 0.15

    exposure = max(0.1, min(1, exposure))

    if exposure >= 0.7:
        action = "STRONG ENTRY"
    elif exposure >= 0.5:
        action = "CONTROLLED ENTRY"
    elif exposure >= 0.3:
        action = "LIMITED ENTRY"
    else:
        action = "MINIMAL / HEDGE"

    return {
        "timestamp": datetime.datetime.utcnow().isoformat()+"Z",
        "exposure": int(exposure*100),
        "action": action
    }

out = optimize(72, 78, True)

pathlib.Path("data").mkdir(exist_ok=True)
pathlib.Path("data/exposure_engine_v1.json").write_text(json.dumps(out, indent=2))
print(json.dumps(out, indent=2))
