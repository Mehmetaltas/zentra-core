# SADELEŞTİRİLMİŞ ANA AKIŞ — SADECE SCORE/ STRESS KISMI GÖSTERİLİYOR

def calculate_risk_band(score: float):
    if score >= 70:
        return "HIGH"
    if score >= 40:
        return "MID"
    return "LOW"


@router.get("/score")
def score_get(
    request: Request,
    amount: float = 0,
    payment_delay_days: int = 0,
    sector: str = "",
    customer_score: float = 0,
    exposure_ratio: float = 0,
    planned_amount: float = None,
    planned_payment_delay_days: float = None,
    planned_customer_score: float = None,
    planned_exposure_ratio: float = None,
):
    rl = check_rate_limit(request)

    data = {
        "amount": amount,
        "payment_delay_days": payment_delay_days,
        "sector": sector,
        "customer_score": customer_score,
        "exposure_ratio": exposure_ratio,
    }

    # ---------------------------
    # 1. RAW SCORE (SAPMASIZ)
    # ---------------------------
    base_result = calculate_score(data)
    raw_score = float(base_result.get("risk_score", 0))

    # ---------------------------
    # 2. GLOBAL
    # ---------------------------
    market = get_global_market()
    global_score, global_reasons = apply_global_adjustment(raw_score, market)

    # ---------------------------
    # 3. DEVIATION
    # ---------------------------
    deviation_context = aggregate_deviation_context(
        planned_amount,
        planned_payment_delay_days,
        planned_customer_score,
        planned_exposure_ratio,
        amount,
        payment_delay_days,
        customer_score,
        exposure_ratio
    )

    deviation_adj = deviation_context.get("risk_adjustment", 0)
    deviation_score = round(global_score + deviation_adj, 2)

    # ---------------------------
    # 4. FINAL (LENS + STD MINOR)
    # ---------------------------
    std_severity = deviation_context.get("dispersion", {}).get("std_severity", "stable")

    lens_adj = 0
    if std_severity == "volatile":
        lens_adj = 2
    elif std_severity == "elevated":
        lens_adj = 1

    final_score = round(min(100, deviation_score + lens_adj), 2)

    # ---------------------------
    # BAND
    # ---------------------------
    risk_band = calculate_risk_band(final_score)

    # ---------------------------
    # RESPONSE
    # ---------------------------
    return {
        "raw_risk_score": raw_score,
        "global_adjustment": round(global_score - raw_score, 2),
        "global_adjusted_risk_score": global_score,
        "deviation_adjustment": deviation_adj,
        "deviation_adjusted_risk_score": deviation_score,
        "final_adjustment": lens_adj,
        "final_risk_score": final_score,
        "risk_band": risk_band,
        "deviation": deviation_context,
        "global": {
            "market": market,
            "adjustment_reasons": global_reasons
        },
        "control": rl
    }


# ---------------------------
# STRESS
# ---------------------------

def calculate_stress_band(score: float):
    if score >= 70:
        return "HIGH"
    if score >= 40:
        return "MID"
    return "LOW"


@router.get("/stress")
def stress_get(
    request: Request,
    amount: float = 0,
    payment_delay_days: int = 0,
    sector: str = "",
    customer_score: float = 0,
    exposure_ratio: float = 0,
    planned_amount: float = None,
    planned_payment_delay_days: float = None,
    planned_customer_score: float = None,
    planned_exposure_ratio: float = None,
):
    rl = check_rate_limit(request)

    data = {
        "amount": amount,
        "payment_delay_days": payment_delay_days,
        "sector": sector,
        "customer_score": customer_score,
        "exposure_ratio": exposure_ratio,
    }

    # RAW
    base_result = calculate_stress(data)
    raw_score = float(base_result.get("stress_score", 0))

    # GLOBAL
    market = get_global_market()
    result, _ = apply_stress_global_adjustment(base_result, market)
    global_score = float(result.get("stress_score", raw_score))

    # DEVIATION
    deviation_context = aggregate_deviation_context(
        planned_amount,
        planned_payment_delay_days,
        planned_customer_score,
        planned_exposure_ratio,
        amount,
        payment_delay_days,
        customer_score,
        exposure_ratio
    )

    deviation_adj = deviation_context.get("risk_adjustment", 0)
    deviation_score = round(global_score + deviation_adj, 2)

    # FINAL (çok hafif)
    final_score = round(min(100, deviation_score + 1), 2)

    stress_band = calculate_stress_band(final_score)

    return {
        "raw_stress_score": raw_score,
        "global_adjustment": round(global_score - raw_score, 2),
        "global_adjusted_stress_score": global_score,
        "deviation_adjustment": deviation_adj,
        "deviation_adjusted_stress_score": deviation_score,
        "final_adjustment": 1,
        "final_stress_score": final_score,
        "stress_band": stress_band,
        "deviation": deviation_context,
        "global": result.get("global", {}),
        "control": rl
    }
