def calculate_score(data):
    amount = data.get("amount", 0)
    delay = data.get("payment_delay_days", 0)

    risk_score = max(0, 100 - delay)

    return {
        "risk_score": risk_score,
        "risk_band": "HIGH" if risk_score < 40 else "MID" if risk_score < 70 else "LOW",
        "early_warning_flags": ["delay_dynamics"] if delay > 10 else [],
        "model": "zentra_v1"
    }
