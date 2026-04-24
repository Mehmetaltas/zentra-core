# ZDB-009 Multi Scenario Proof

def zentra_decision(real, illusion):
    if illusion > real:
        return "REJECT"
    if real > 0.7:
        return "APPROVE"
    return "REVIEW"

def loss(existing, zentra, risk):
    if existing == "APPROVE" and risk == "HIGH":
        return 100
    if zentra == "REJECT" and risk == "HIGH":
        return 0
    return 20

scenarios = [
    {
        "name": "Illusion Case",
        "real": 0.4,
        "illusion": 0.9,
        "existing": "APPROVE",
        "risk": "HIGH"
    },
    {
        "name": "Strong Customer",
        "real": 0.9,
        "illusion": 0.2,
        "existing": "REVIEW",
        "risk": "LOW"
    },
    {
        "name": "Borderline",
        "real": 0.6,
        "illusion": 0.5,
        "existing": "APPROVE",
        "risk": "MEDIUM"
    }
]

print("\nZENTRA MULTI SCENARIO PROOF\n")

for s in scenarios:
    z = zentra_decision(s["real"], s["illusion"])
    l = loss(s["existing"], z, s["risk"])

    print("\n---")
    print("Scenario:", s["name"])
    print("Existing:", s["existing"])
    print("ZENTRA :", z)
    print("Risk:", s["risk"])
    print("Loss:", l)
