from datetime import datetime

def loss_analysis(existing_decision, zentra_decision, risk_level):

    loss = 0
    notes = []

    # yanlış onay
    if existing_decision == "APPROVE" and risk_level == "HIGH":
        loss += 100
        notes.append("Existing system false approval risk")

    if zentra_decision == "APPROVE" and risk_level == "HIGH":
        loss += 50
        notes.append("ZENTRA approval risk (reduced)")

    # yanlış red
    if existing_decision == "REJECT" and risk_level == "LOW":
        loss += 30
        notes.append("Existing system missed opportunity")

    if zentra_decision == "REJECT" and risk_level == "LOW":
        loss += 10
        notes.append("ZENTRA conservative miss")

    return loss, notes

def compare(existing, zentra, risk):

    delta = existing != zentra

    loss, notes = loss_analysis(existing, zentra, risk)

    return {
        "delta": delta,
        "existing": existing,
        "zentra": zentra,
        "risk": risk,
        "loss": loss,
        "notes": notes
    }

if __name__ == "__main__":

    test = compare(
        existing="APPROVE",
        zentra="REVIEW",
        risk="HIGH"
    )

    print("\nZENTRA PROOF METRICS\n")
    print(test)
