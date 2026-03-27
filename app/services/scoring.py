def calculate_score(data):
    delay = data.get("payment_delay_days", 0)

    score = max(0, 100 - delay)

    return {
        "risk_score": score,
        "risk_band": "HIGH" if score < 40 else "MID" if score < 70 else "LOW",
        "flags": ["delay"] if delay > 10 else [],
        "model": "zentra_v1"
    }
