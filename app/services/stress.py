def calculate_stress(data):
    amount = float(data.get("amount", 0) or 0)
    delay = float(data.get("payment_delay_days", 0) or 0)
    sector = str(data.get("sector", "") or "").strip().lower()
    customer_score = float(data.get("customer_score", 50) or 50)
    exposure_ratio = float(data.get("exposure_ratio", 0.3) or 0.3)

    # ---------------------------
    # BASE STRESS SCORE
    # high score = high fragility
    # ---------------------------

    base_stress = 0.0
    drivers = []

    # 1) Delay fragility
    delay_stress = min(delay * 1.5, 25.0)
    base_stress += delay_stress
    if delay_stress > 0:
        drivers.append({
            "driver": "payment_delay_days",
            "value": round(delay_stress, 2),
            "note": "delay increases repayment fragility under stress"
        })

    # 2) Customer resilience weakness
    customer_stress = min(max(100.0 - customer_score, 0.0) * 0.22, 18.0)
    base_stress += customer_stress
    drivers.append({
        "driver": "customer_score",
        "value": round(customer_stress, 2),
        "note": "weaker customer profile reduces stress resilience"
    })

    # 3) Exposure fragility
    exposure_stress = min(max(exposure_ratio, 0.0) * 22.0, 18.0)
    base_stress += exposure_stress
    if exposure_stress > 0:
        drivers.append({
            "driver": "exposure_ratio",
            "value": round(exposure_stress, 2),
            "note": "higher exposure concentration increases stress sensitivity"
        })

    # 4) Amount pressure
    amount_stress = 0.0
    if amount > 500000:
        amount_stress = 7.0
    elif amount > 250000:
        amount_stress = 4.0
    elif amount > 100000:
        amount_stress = 2.0

    base_stress += amount_stress
    if amount_stress > 0:
        drivers.append({
            "driver": "amount",
            "value": round(amount_stress, 2),
            "note": "larger size increases stress burden"
        })

    # 5) Sector fragility baseline
    sector_stress_map = {
        "logistics": 3.0,
        "construction": 5.0,
        "retail": 4.0,
        "manufacturing": 3.0,
        "finance": 1.5,
        "technology": 1.0,
        "healthcare": 1.5,
        "invoice": 3.0,
        "trade": 4.0,
        "compliance": 2.0,
        "sme": 4.0,
    }
    sector_stress = sector_stress_map.get(sector, 3.0)
    base_stress += sector_stress
    drivers.append({
        "driver": "sector",
        "value": round(sector_stress, 2),
        "note": f"sector baseline fragility for {sector or 'default'}"
    })

    # ---------------------------
    # BASE SCORE CLAMP
    # ---------------------------

    base_stress = round(max(0.0, min(100.0, base_stress)), 2)

    # ---------------------------
    # SCENARIOS
    # ---------------------------

    mild_shock = round(min(100.0, base_stress + 8.0), 2)
    severe_shock = round(min(100.0, base_stress + 20.0), 2)

    if base_stress >= 70:
        band = "HIGH"
    elif base_stress >= 40:
        band = "MID"
    else:
        band = "LOW"

    return {
        "stress_score": base_stress,
        "stress_band": band,
        "scenarios": {
            "base_case": base_stress,
            "mild_shock": mild_shock,
            "severe_shock": severe_shock
        },
        "drivers": drivers,
        "model": "zentra_v2_base_stress"
    }
