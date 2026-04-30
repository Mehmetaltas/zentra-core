#!/usr/bin/env python3
from pathlib import Path
import json, datetime, re

ROOT = Path(".")
DATE = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M")
OUT = Path(f"docs/improvement/AUTONOMOUS_IMPROVEMENT_{DATE}.md")
OUT.parent.mkdir(parents=True, exist_ok=True)

checks = []

def exists(label, path, severity="high"):
    p = Path(path)
    ok = p.exists()
    checks.append({
        "label": label,
        "path": path,
        "ok": ok,
        "severity": severity,
        "type": "existence"
    })

def contains(label, path, pattern, severity="medium"):
    p = Path(path)
    ok = p.exists() and re.search(pattern, p.read_text(errors="ignore"), re.I | re.S) is not None
    checks.append({
        "label": label,
        "path": path,
        "ok": ok,
        "severity": severity,
        "type": "content"
    })

# Core / intelligence
exists("Decision Core V3", "app/intelligence/decision-core-v3.js")
exists("Engine Binding V1", "app/intelligence/engine-binding-v1.js")
exists("Quality Engine V1", "app/quality/quality-engine-v1.js")
exists("Depth Engine V2", "app/intelligence/depth-engine-v2.js")
exists("Report Intelligence V2", "app/intelligence/report-intelligence-v2.js")
exists("Assistant Operator V2", "app/assistant-operator-v2.js")

# Commercial / trust
exists("Packages page", "app/packages/index.html")
exists("Pricing page", "app/pricing/index.html")
exists("Legal center", "app/legal/index.html")
exists("Support center", "app/support/index.html")
exists("Proof standard", "docs/proof/PROOF_FLOW_STANDARD.md")

# Depth checks
contains("Decision has IF/THEN-like rule logic", "app/intelligence/decision-core-v3.js", r"risk.*80|confidence|credit|signal")
contains("Assistant handles support/legal/commercial/product routing", "app/assistant-operator-v2.js", r"support|legal|pricing|financial|portfolio|academia|general")
contains("Pricing contains plan ladder", "app/pricing/index.html", r"Free|Core|Expert|Institutional")
contains("Proof is not detached demo", "docs/proof/PROOF_FLOW_STANDARD.md", r"not.*demo|live-system|Assistant.*Cockpit")

missing = [c for c in checks if not c["ok"]]
score = max(0, 100 - sum(15 if c["severity"] == "high" else 8 for c in missing))
status = "READY" if score >= 90 and not any(c["severity"] == "high" for c in missing) else "FIX REQUIRED"

recommendations = []
if any(not c["ok"] and "Decision" in c["label"] for c in checks):
    recommendations.append("Decision core must be restored before launch.")
if any(not c["ok"] and "Quality" in c["label"] for c in checks):
    recommendations.append("Quality engine must be restored to keep self-evaluation active.")
if any(not c["ok"] and "Assistant" in c["label"] for c in checks):
    recommendations.append("Assistant operator routing must be strengthened.")
if any(not c["ok"] and "Pricing" in c["label"] for c in checks):
    recommendations.append("Pricing/package commercial layer must be completed.")
if any(not c["ok"] and "Proof" in c["label"] for c in checks):
    recommendations.append("Proof standard must be restored and kept live-flow based.")

if not recommendations:
    recommendations = [
        "Next improvement: make decision rules more data-specific.",
        "Next improvement: strengthen report outputs with asset-specific reasoning.",
        "Next improvement: connect real data feeds where licensing and reliability allow.",
        "Next improvement: add quality score visibility to internal/operator surfaces."
    ]

report = []
report.append(f"# ZENTRA Autonomous Improvement Report — {DATE}\n")
report.append(f"## Status\n- Score: {score}/100\n- Final: {status}\n")
report.append("## Checks\n")
for c in checks:
    mark = "✔" if c["ok"] else "❗"
    report.append(f"- {mark} {c['label']} — `{c['path']}` ({c['severity']})")
report.append("\n## Improvement Backlog\n")
for i, r in enumerate(recommendations, 1):
    report.append(f"{i}. {r}")
report.append("\n## Rule\nAutonomous improvement may diagnose, document and create backlog. Structural code changes still require controlled execution and audit.\n")

OUT.write_text("\n".join(report))

Path("data/autonomous_improvement_latest.json").write_text(json.dumps({
    "date": DATE,
    "score": score,
    "status": status,
    "missing": missing,
    "recommendations": recommendations
}, indent=2, ensure_ascii=False))

print("\n".join(report))
