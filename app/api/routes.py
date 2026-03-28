from fastapi import APIRouter, Depends, Request
from app.services.scoring import calculate_score
from app.services.stress import calculate_stress
from app.services.lens import get_lens_catalog, get_lens_detail
from app.core.security import verify_founder_key
from app.core.rate_limit import check_rate_limit
from app.core.config import get_public_routes, get_protected_routes, get_rate_limit_per_minute
from app.core.usage_log import log_usage, get_usage_summary, get_recent_usage
import json
import urllib.request
import math

router = APIRouter()

# ---------------------------
# GLOBAL
# ---------------------------

def get_global_market():
    market = {
        "usdtry": 30.0,
        "eurusd": 1.08,
        "oil": None,
        "gold": None,
        "live_sources": {"fx": False, "oil": False, "gold": False},
        "notes": ["FX live connection started"]
    }

    try:
        with urllib.request.urlopen(
            "https://api.exchangerate.host/latest?base=USD&symbols=TRY,EUR",
            timeout=8
        ) as response:
            data = json.loads(response.read().decode("utf-8"))
            rates = data.get("rates", {})

            usdtry = rates.get("TRY")
            usdeur = rates.get("EUR")

            if isinstance(usdtry, (int, float)):
                market["usdtry"] = float(usdtry)

            if isinstance(usdeur, (int, float)) and usdeur != 0:
                market["eurusd"] = round(1 / float(usdeur), 6)

            market["live_sources"]["fx"] = True
    except Exception:
        pass

    return market


def get_global_pressure_context(market):
    usdtry = float(market.get("usdtry", 30))
    level = "stable"
    reasons = []

    if usdtry >= 40:
        level = "high"
        reasons.append("high_usdtry_pressure")
    elif usdtry >= 30:
        level = "moderate"
        reasons.append("moderate_usdtry_pressure")

    return {"level": level, "reasons": reasons}


def apply_global_adjustment(score, market):
    adjusted = score
    reasons = []

    if market["usdtry"] >= 30:
        adjusted += 3
        reasons.append("moderate_usdtry_pressure")

    return min(100, adjusted), reasons


# ---------------------------
# STD DEV (YENİ)
# ---------------------------

def calculate_std(values):
    if not values:
        return 0
    mean = sum(values) / len(values)
    var = sum((x - mean) ** 2 for x in values) / len(values)
    return math.sqrt(var)


def classify_std(std):
    if std < 0.05:
        return "stable"
    if std < 0.15:
        return "elevated"
    return "volatile"


# ---------------------------
# DEVIATION
# ---------------------------

def deviation_context(planned, actual):
    ratio = 0 if planned == 0 else (actual - planned) / planned
    return ratio


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
# LENS PROFILE (YENİ)
# ---------------------------

def lens_profile(lens):
    profiles = {
        "logistics": (40, 70),
        "invoice": (38, 68),
        "trade": (42, 72),
        "compliance": (35, 65),
        "sme": (40, 70)
    }
    return profiles.get(lens, (40, 70))


# ---------------------------
# SCORE
# ---------------------------

@router.get("/score")
def score(request: Request, amount: float = 0, payment_delay_days: int = 0,
          sector: str = "", customer_score: float = 0, exposure_ratio: float = 0,
          planned_amount: float = None):

    rl = check_rate_limit(request)

    base = calculate_score({
        "amount": amount,
        "payment_delay_days": payment_delay_days,
        "sector": sector,
        "customer_score": customer_score,
        "exposure_ratio": exposure_ratio
    })

    market = get_global_market()
    pressure = get_global_pressure_context(market)

    score = float(base["risk_score"])
    score, reasons = apply_global_adjustment(score, market)

    ratios = []
    if planned_amount:
        ratios.append(abs(deviation_context(planned_amount, amount)))

    std = calculate_std(ratios)
    std_type = classify_std(std)

    if std_type == "volatile":
        score += 4
    elif std_type == "elevated":
        score += 2

    score = min(100, score)

    monitor, restrict = lens_profile(sector)

    action = "Proceed"
    if score >= restrict:
        action = "Restrict"
    elif score >= monitor:
        action = "Monitor"

    return {
        "risk_score": round(score, 1),
        "risk_band": band(score),
        "dispersion": {"std": std, "level": std_type},
        "decision": action
    }


# ---------------------------
# STRESS
# ---------------------------

@router.get("/stress")
def stress(request: Request, amount: float = 0, payment_delay_days: int = 0,
           sector: str = "", customer_score: float = 0, exposure_ratio: float = 0):

    rl = check_rate_limit(request)

    result = calculate_stress({
        "amount": amount,
        "payment_delay_days": payment_delay_days,
        "sector": sector,
        "customer_score": customer_score,
        "exposure_ratio": exposure_ratio
    })

    market = get_global_market()
    pressure = get_global_pressure_context(market)

    score = float(result["stress_score"])

    monitor, restrict = lens_profile(sector)

    action = "Proceed"
    if score >= restrict:
        action = "Restrict"
    elif score >= monitor:
        action = "Monitor"

    return {
        "stress_score": score,
        "stress_band": band(score),
        "decision": action
               }
