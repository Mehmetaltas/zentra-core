def calculate_score(data):
    amount = float(data.get("amount", 0) or 0)
    delay = int(data.get("payment_delay_days", 0) or 0)
    sector = str(data.get("sector", "") or "").strip().lower()
    customer_score = float(data.get("customer_score", 50) or 50)
    exposure_ratio = float(data.get("exposure_ratio", 0.3) or 0.3)

    score = 100.0

    score -= min(delay * 2.0, 35)
    score += (customer_score - 50) * 0.5
    score -= min(exposure_ratio * 25, 20)

    if amount > 500000:
        score -= 8
    elif amount > 250000:
        score -= 4

    sector_penalties = {
        "logistics": 2,
        "construction": 4,
        "retail": 3,
        "manufacturing": 2,
        "finance": 1,
        "technology": 0,
        "healthcare": 1
    }
    score -= sector_penalties.get(sector, 2)

    score = round(max(0, min(100, score)), 2)

    flags = []

    if delay > 10:
        flags.append("delay")
    if delay > 30:
        flags.append("severe_delay")
    if exposure_ratio > 0.60:
        flags.append("high_exposure")
    if customer_score < 45:
        flags.append("weak_customer_profile")
    if amount > 500000:
        flags.append("large_ticket")

    if score < 40:
        band = "HIGH"
    elif score < 70:
        band = "MID"
    else:
        band = "LOW"

    return {
        "risk_score": score,
        "risk_band": band,
        "flags": flags,
        "model": "zentra_v1_phase1"
    }
