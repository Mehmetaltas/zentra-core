from fastapi import APIRouter, Request
from app.services.scoring import calculate_score
from app.services.stress import calculate_stress
from app.core.rate_limit import check_rate_limit
import math

router = APIRouter()

# ---------------------------
# SAFE GLOBAL (CRASH YOK)
# ---------------------------

def get_global_market():
    return {
        "usdtry": 30.0,
        "eurusd": 1.08,
        "live_sources": {"fx": False},
        "notes": ["static fallback mode"]
    }

def apply_global_adjustment(score: float, market: dict):
    usdtry = market["usdtry"]

    adjustment = 0
    reasons = []

    if usdtry >= 40:
        adjustment = 10
        reasons.append("high_usdtry")
    elif usdtry >= 35:
        adjustment = 6
        reasons.append("elevated_usdtry")
    elif usdtry >= 30:
        adjustment = 3
        reasons.append("moderate_usdtry")

    return score + adjustment, adjustment, reasons


# ---------------------------
# DEVIATION
# ---------------------------

def safe_ratio(actual, planned):
    if planned in [None, 0]:
        return None
    return (actual - planned) / planned

def deviation_block(planned, actual, name):
    if planned is None:
        return None

    ratio = safe_ratio(actual, planned)
    if ratio is None:
        return None

    impact = "low"
    if abs(ratio) > 0.15:
        impact = "high"
    elif abs(ratio) > 0.05:
        impact = "moderate"

    return {
        "metric": name,
        "planned": planned,
        "actual": actual,
        "ratio": round(ratio, 4),
        "impact": impact
    }

def calculate_deviation_context(p):
    metrics = []

    m1 = deviation_block(p["planned_amount"], p["amount"], "amount")
    m2 = deviation_block(p["planned_payment_delay_days"], p["payment_delay_days"], "delay")
    m3 = deviation_block(p["planned_customer_score"], p["customer_score"], "customer")
    m4 = deviation_block(p["planned_exposure_ratio"], p["exposure_ratio"], "exposure")

    for m in [m1, m2, m3, m4]:
        if m:
            metrics.append(m)

    level = "none"
    adj = 0

    if any(m["impact"] == "high" for m in metrics):
        level = "high"
        adj = 10
    elif any(m["impact"] == "moderate" for m in metrics):
        level = "moderate"
        adj = 5
    elif metrics:
        level = "low"
        adj = 2

    # STD sadece bilgi (skora etki yok)
    ratios = [abs(m["ratio"]) for m in metrics if m.get("ratio") is not None]
    std = round(math.sqrt(sum(x*x for x in ratios)/len(ratios)), 4) if ratios else 0

    return {
        "metrics": metrics,
        "level": level,
        "risk_adjustment": adj,
        "dispersion": {
            "std": std,
            "note": "informational_only"
        }
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
# SCORE
# ---------------------------

@router.get("/score")
def score(
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

    base = calculate_score({
        "amount": amount,
        "payment_delay_days": payment_delay_days,
        "sector": sector,
        "customer_score": customer_score,
        "exposure_ratio": exposure_ratio,
    })

    raw = float(base.get("risk_score", 0))

    market = get_global_market()
    g_score, g_adj, g_reasons = apply_global_adjustment(raw, market)

    dev = calculate_deviation_context({
        "amount": amount,
        "payment_delay_days": payment_delay_days,
        "customer_score": customer_score,
        "exposure_ratio": exposure_ratio,
        "planned_amount": planned_amount,
        "planned_payment_delay_days": planned_payment_delay_days,
        "planned_customer_score": planned_customer_score,
        "planned_exposure_ratio": planned_exposure_ratio,
    })

    d_adj = dev["risk_adjustment"]
    final = round(min(100, g_score + d_adj), 2)

    return {
        "raw_risk_score": raw,
        "global_adjustment": g_adj,
        "global_adjusted_risk_score": g_score,
        "deviation_adjustment": d_adj,
        "final_risk_score": final,
        "risk_band": band(final),
        "deviation": dev,
        "global": {
            "market": market,
            "reasons": g_reasons
        },
        "control": rl
    }


# ---------------------------
# STRESS
# ---------------------------

@router.get("/stress")
def stress(
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

    base = calculate_stress({
        "amount": amount,
        "payment_delay_days": payment_delay_days,
        "sector": sector,
        "customer_score": customer_score,
        "exposure_ratio": exposure_ratio,
    })

    raw = float(base.get("stress_score", 0))

    market = get_global_market()
    g_score, g_adj, _ = apply_global_adjustment(raw, market)

    dev = calculate_deviation_context({
        "amount": amount,
        "payment_delay_days": payment_delay_days,
        "customer_score": customer_score,
        "exposure_ratio": exposure_ratio,
        "planned_amount": planned_amount,
        "planned_payment_delay_days": planned_payment_delay_days,
        "planned_customer_score": planned_customer_score,
        "planned_exposure_ratio": planned_exposure_ratio,
    })

    d_adj = dev["risk_adjustment"]
    final = round(min(100, g_score + d_adj), 2)

    return {
        "raw_stress_score": raw,
        "global_adjustment": g_adj,
        "global_adjusted_stress_score": g_score,
        "deviation_adjustment": d_adj,
        "final_stress_score": final,
        "stress_band": band(final),
        "deviation": dev,
        "control": rl
    }
