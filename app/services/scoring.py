def calculate_score(data):
    amount = float(data.get("amount", 0) or 0)
    delay = float(data.get("payment_delay_days", 0) or 0)
    sector = str(data.get("sector", "") or "").strip().lower()
    customer_score = float(data.get("customer_score", 50) or 50)
    exposure_ratio = float(data.get("exposure_ratio", 0.3) or 0.3)

    # ---------------------------
    # BASE RISK SCORE
    # high score = high risk
    # ---------------------------

    score = 0.0
    drivers = []
    flags = []

    # 1) Payment delay risk
    delay_risk = min(delay * 2.0, 35.0)
    score += delay_risk
    if delay_risk > 0:
        drivers.append({
            "driver": "payment_delay_days",
            "value": round(delay_risk, 2),
            "note": "delay increases behavioral repayment risk"
        })

    # 2) Customer quality risk
    # lower customer score => higher risk
    customer_risk = max(0.0, (100.0 - customer_score) * 0.30)
    customer_risk = min(customer_risk, 20.0)
    score += customer_risk
    drivers.append({
        "driver": "customer_score",
        "value": round(customer_risk, 2),
        "note": "weaker customer quality increases risk"
    })

    # 3) Exposure risk
    exposure_risk = min(max(exposure_ratio, 0.0) * 25.0, 20.0)
    score += exposure_risk
    if exposure_risk > 0:
        drivers.append({
            "driver": "exposure_ratio",
            "value": round(exposure_risk, 2),
            "note": "higher exposure concentration increases risk"
        })

    # 4) Amount risk
    amount_risk = 0.0
    if amount > 500000:
        amount_risk = 8.0
    elif amount > 250000:
        amount_risk = 4.0
    elif amount > 100000:
        amount_risk = 2.0

    score += amount_risk
    if amount_risk > 0:
        drivers.append({
            "driver": "amount",
            "value": round(amount_risk, 2),
            "note": "larger ticket size increases exposure risk"
        })

    # 5) Sector baseline risk
    sector_risk_map = {
        "logistics": 2.0,
        "construction": 4.0,
        "retail": 3.0,
        "manufacturing": 2.0,
        "finance": 1.0,
        "technology": 0.0,
        "healthcare": 1.0,
        "invoice": 2.0,
        "trade": 3.0,
        "compliance": 2.0,
        "sme": 3.0,
    }
    sector_risk = sector_risk_map.get(sector, 2.0)
    score += sector_risk
    drivers.append({
        "driver": "sector",
        "value": round(sector_risk, 2),
        "note": f"sector baseline risk for {sector or 'default'}"
    })

    # ---------------------------
    # FLAGS
    # ---------------------------

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

    # ---------------------------
    # FINAL BASE SCORE
    # ---------------------------

    score = round(max(0.0, min(100.0, score)), 2)

    if score >= 70:
        band = "HIGH"
    elif score >= 40:
        band = "MID"
    else:
        band = "LOW"

    return {
        "risk_score": score,
        "risk_band": band,
        "flags": flags,
        "drivers": drivers,
        "model": "zentra_v2_base_risk"
    }
