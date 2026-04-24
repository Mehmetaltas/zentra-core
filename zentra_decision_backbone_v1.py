# ZDB-012 Proof Report Export

from datetime import datetime
import json

def export_report(case):

    report = {
        "case_id": case.get("name", "unknown"),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "input": case,
        "decision": case.get("decision"),
        "mode": case.get("mode"),
        "actions": case.get("actions", []),
        "confidence": case.get("confidence"),
        "explain": case.get("explain", []),
        "proof_metrics": case.get("proof_metrics", {}),
        "status": "OK"
    }

    return report

# TEST OUTPUT
if __name__ == "__main__":

    test_case = {
        "name": "Illusion Case",
        "decision": "RISK_SPLIT",
        "mode": "DEFENSIVE",
        "actions": ["LIMIT_REDUCE", "COLLATERAL_INCREASE"],
        "confidence": 0.62,
        "explain": [
            "Illusion dominates",
            "Real income suppressed"
        ],
        "proof_metrics": {
            "decision_delta": True,
            "loss": 100
        }
    }

    report = export_report(test_case)

    print("\nZENTRA REPORT OUTPUT\n")
    print(json.dumps(report, indent=2, ensure_ascii=False))
