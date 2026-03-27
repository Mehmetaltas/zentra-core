def calculate_stress(data):
    amount = float(data.get("amount", 0) or 0)
    delay = int(data.get("payment_delay_days", 0) or 0)
    exposure_ratio = float(data.get("exposure_ratio", 0.3) or 0.3)
    customer_score = float(data.get("customer_score", 50) or 50)

    stress_score = 0.0

    stress_score += min(delay * 1.5, 40)
    stress_score += min(exposure_ratio * 35, 35)

    if customer_score < 50:
        stress_score += min((50 - customer_score) * 0.8, 20)

    if amount > 500000:
        stress_score += 10
    elif amount > 250000:
        stress_score += 5

    stress_score = round(max(0, min(100, stress_score)), 2)

    if stress_score < 35:
        stress_band = "LOW"
    elif stress_score < 70:
        stress_band = "MID"
    else:
        stress_band = "HIGH"

    scenarios = {
        "base_case": round(stress_score, 2),
        "mild_shock": round(min(100, stress_score + 10), 2),
        "severe_shock": round(min(100, stress_score + 25), 2)
    }

    return {
        "stress_score": stress_score,
        "stress_band": stress_band,
        "scenarios": scenarios,
        "model": "zentra_stress_v1_phase1"
    }
