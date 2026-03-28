from fastapi import APIRouter, Request
from app.services.scoring import calculate_score
from app.services.stress import calculate_stress
from app.core.rate_limit import check_rate_limit

router = APIRouter()

# ---------------------------
# GLOBAL (SAFE)
# ---------------------------

def get_global_market():
    return {
        "usdtry": 30.0,
        "eurusd": 1.08,
        "notes": ["static fallback"]
    }

def apply_macro_overlay(score: float, market: dict):
    usdtry = market["usdtry"]

    adjustment = 0
    reasons = []

    if usdtry >= 40:
        adjustment = 10
        reasons.append("high_fx_pressure")
    elif usdtry >= 35:
        adjustment = 6
        reasons.append("elevated_fx_pressure")
    elif usdtry >= 30:
        adjustment = 3
        reasons.append("moderate_fx_pressure")

    return score + adjustment, adjustment, reasons


# ---------------------------
# DEVIATION
# ---------------------------

def safe_ratio(actual, planned):
    if planned in [None, 0]:
        return None
    return (actual - planned) / planned

def calculate_deviation(p):
    metrics = []

    def build(name, planned, actual):
        r = safe_ratio(actual, planned)
        if r is None:
            return None

        impact = "low"
        if abs(r) > 0.15:
            impact = "high"
        elif abs(r) > 0.05:
            impact = "moderate"

        return {
            "metric": name,
            "ratio": round(r, 4),
            "impact": impact
        }

    for m in [
        build("amount", p["planned_amount"], p["amount"]),
        build("delay", p["planned_delay"], p["delay"]),
        build("customer", p["planned_customer"], p["customer"]),
        build("exposure", p["planned_exposure"], p["exposure"]),
    ]:
        if m:
            metrics.append(m)

    adj = 0
    level = "none"

    if any(m["impact"] == "high" for m in metrics):
        adj = 10
        level = "high"
    elif any(m["impact"] == "moderate" for m in metrics):
        adj = 5
        level = "moderate"
    elif metrics:
        adj = 2
        level = "low"

    return {
        "metrics": metrics,
        "level": level,
        "adjustment": adj
    }


# ---------------------------
# BAND
# ---------------------------

def band(score):
    if score >= 70:
        return "HIGH"
    if score >= 40:
        return "MID"
    return "LOW"


# ---------------------------
# SCORE ROUTE
# ---------------------------

@router.get("/score")
def score(
    request: Request,
    amount: float = 0,
    payment_delay_days: float = 0,
    sector: str = "",
    customer_score: float = 50,
    exposure_ratio: float = 0.3,
    planned_amount: float = None,
    planned_payment_delay_days: float = None,
    planned_customer_score: float = None,
    planned_exposure_ratio: float = None,
):
    rl = check_rate_limit(request)

    # BASE
    base = calculate_score({
        "amount": amount,
        "payment_delay_days": payment_delay_days,
        "sector": sector,
        "customer_score": customer_score,
        "exposure_ratio": exposure_ratio
    })

    base_score = base["risk_score"]

    # MACRO
    market = get_global_market()
    macro_score, macro_adj, macro_reasons = apply_macro_overlay(base_score, market)

    # DEVIATION
    dev = calculate_deviation({
        "amount": amount,
        "delay": payment_delay_days,
        "customer": customer_score,
        "exposure": exposure_ratio,
        "planned_amount": planned_amount,
        "planned_delay": planned_payment_delay_days,
        "planned_customer": planned_customer_score,
        "planned_exposure": planned_exposure_ratio,
    })

    final_score = min(100, macro_score + dev["adjustment"])

    return {
        "base_risk_score": base_score,
        "macro_adjustment": macro_adj,
        "macro_adjusted_risk_score": macro_score,
        "deviation_adjustment": dev["adjustment"],
        "final_risk_score": final_score,
        "risk_band": band(final_score),
        "drivers": base.get("drivers", []),
        "deviation": dev,
        "macro": {
            "market": market,
            "reasons": macro_reasons
        },
        "control": rl
    }


# ---------------------------
# STRESS ROUTE
# ---------------------------

@router.get("/stress")
def stress(
    request: Request,
    amount: float = 0,
    payment_delay_days: float = 0,
    sector: str = "",
    customer_score: float = 50,
    exposure_ratio: float = 0.3,
    planned_amount: float = None,
    planned_payment_delay_days: float = None,
    planned_customer_score: float = None,
    planned_exposure_ratio: float = None,
):
    rl = check_rate_limit(request)

    base = calculate_stress({
        "amount": amount,
        "payment_delay_days": payment_delay_days,
        "sector": sector,
        "customer_score": customer_score,
        "exposure_ratio": exposure_ratio
    })

    base_score = base["stress_score"]

    market = get_global_market()
    macro_score, macro_adj, macro_reasons = apply_macro_overlay(base_score, market)

    dev = calculate_deviation({
        "amount": amount,
        "delay": payment_delay_days,
        "customer": customer_score,
        "exposure": exposure_ratio,
        "planned_amount": planned_amount,
        "planned_delay": planned_payment_delay_days,
        "planned_customer": planned_customer_score,
        "planned_exposure": planned_exposure_ratio,
    })

    final_score = min(100, macro_score + dev["adjustment"])

    return {
        "base_stress_score": base_score,
        "macro_adjustment": macro_adj,
        "macro_adjusted_stress_score": macro_score,
        "deviation_adjustment": dev["adjustment"],
        "final_stress_score": final_score,
        "stress_band": band(final_score),
        "scenarios": base.get("scenarios", {}),
        "drivers": base.get("drivers", []),
        "deviation": dev,
        "macro": {
            "market": market,
            "reasons": macro_reasons
        },
        "control": rl
    }
