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

router = APIRouter()


# ---------------------------
# GLOBAL DATA LAYER (Phase 2 Start)
# ---------------------------

def get_global_market():
    market = {
        "usdtry": 30.0,
        "eurusd": 1.08,
        "oil": None,
        "gold": None,
        "live_sources": {
            "fx": False,
            "oil": False,
            "gold": False
        },
        "notes": [
            "FX live connection started",
            "Oil and gold placeholders remain until dedicated sources are attached"
        ]
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


def apply_global_adjustment(base_score: float, market: dict):
    adjusted = float(base_score)
    reasons = []

    usdtry = float(market.get("usdtry", 30.0))
    eurusd = float(market.get("eurusd", 1.08))

    if usdtry >= 40:
        adjusted += 10
        reasons.append("high_usdtry_pressure")
    elif usdtry >= 35:
        adjusted += 6
        reasons.append("elevated_usdtry_pressure")
    elif usdtry >= 30:
        adjusted += 3
        reasons.append("moderate_usdtry_pressure")

    if eurusd <= 1.03:
        adjusted += 3
        reasons.append("eurusd_compression")

    adjusted = max(0.0, min(100.0, round(adjusted, 2)))
    return adjusted, reasons


# ---------------------------
# CORE ROUTES
# ---------------------------

@router.get("/health")
def health():
    return {
        "status": "ok",
        "system": "zentra-core",
        "phase": "phase1",
        "phase2_global_layer": "started"
    }


@router.get("/")
def api_root():
    return {"api": "ZENTRA CORE ROUTES ACTIVE"}


@router.get("/version")
def version():
    return {
        "product": "ZENTRA Risk Core",
        "system": "zentra-core",
        "phase": "phase1",
        "version": "0.1.0",
        "score_model": "zentra_v1_phase1",
        "stress_model": "zentra_stress_v1_phase1",
        "global_layer": "phase2_fx_started"
    }


@router.get("/global/market")
def global_market():
    market = get_global_market()
    return {
        "phase": "phase2",
        "layer": "global_data",
        "market": market
    }


@router.get("/score")
def score_get(
    request: Request,
    amount: float = 0,
    payment_delay_days: int = 0,
    sector: str = "",
    customer_score: float = 0,
    exposure_ratio: float = 0,
):
    rl = check_rate_limit(request)

    data = {
        "amount": amount,
        "payment_delay_days": payment_delay_days,
        "sector": sector,
        "customer_score": customer_score,
        "exposure_ratio": exposure_ratio,
    }

    result = calculate_score(data)

    market = get_global_market()
    base_score = float(result.get("risk_score", 0))
    adjusted_score, adjustment_reasons = apply_global_adjustment(base_score, market)

    result["base_risk_score"] = base_score
    result["risk_score"] = adjusted_score
    result["global"] = {
        "market": market,
        "adjustment_reasons": adjustment_reasons
    }
    result["control"] = {
        "rate_limit_checked": True,
        "client_ip": rl["client_ip"],
        "limit_per_minute": rl["limit_per_minute"]
    }

    log_usage(
        endpoint="/score",
        client_ip=rl["client_ip"],
        payload=data,
        result_summary={
            "base_risk_score": base_score,
            "risk_score": result.get("risk_score"),
            "risk_band": result.get("risk_band"),
            "model": result.get("model"),
            "global_adjustments": adjustment_reasons
        }
    )

    return result


@router.get("/stress")
def stress_get(
    request: Request,
    amount: float = 0,
    payment_delay_days: int = 0,
    sector: str = "",
    customer_score: float = 0,
    exposure_ratio: float = 0,
):
    rl = check_rate_limit(request)

    data = {
        "amount": amount,
        "payment_delay_days": payment_delay_days,
        "sector": sector,
        "customer_score": customer_score,
        "exposure_ratio": exposure_ratio,
    }

    result = calculate_stress(data)
    result["control"] = {
        "rate_limit_checked": True,
        "client_ip": rl["client_ip"],
        "limit_per_minute": rl["limit_per_minute"]
    }

    log_usage(
        endpoint="/stress",
        client_ip=rl["client_ip"],
        payload=data,
        result_summary={
            "stress_score": result.get("stress_score"),
            "stress_band": result.get("stress_band"),
            "model": result.get("model")
        }
    )

    return result


# ---------------------------
# LENS ROUTES
# ---------------------------

@router.get("/lens/list")
def lens_list():
    return {
        "phase": "phase1",
        "lens_count": 5,
        "lenses": get_lens_catalog()
    }


@router.get("/lens/{lens_id}")
def lens_detail(lens_id: str):
    return get_lens_detail(lens_id)


# ---------------------------
# FOUNDER ROUTES
# ---------------------------

@router.get("/founder/status", dependencies=[Depends(verify_founder_key)])
def founder_status():
    return {
        "system": "online",
        "phase": "phase1",
        "public_frontend": "zentra-v2",
        "core_backend": "zentra-core",
        "active_endpoints": [
            "/",
            "/health",
            "/version",
            "/global/market",
            "/score",
            "/stress",
            "/lens/list",
            "/lens/{lens_id}",
            "/founder/status",
            "/founder/config",
            "/founder/healthcheck",
            "/founder/usage/summary",
            "/founder/usage/recent"
        ],
        "score_model": "zentra_v1_phase1",
        "stress_model": "zentra_stress_v1_phase1",
        "control_layer": "active",
        "lens_layer": "active_skeleton",
        "global_layer": "phase2_fx_started"
    }


@router.get("/founder/config", dependencies=[Depends(verify_founder_key)])
def founder_config():
    return {
        "public_routes": get_public_routes() + [
            "/global/market",
            "/lens/list",
            "/lens/{lens_id}"
        ],
        "protected_routes": get_protected_routes() + [
            "/founder/usage/summary",
            "/founder/usage/recent"
        ],
        "rate_limit_per_minute": get_rate_limit_per_minute(),
        "auth_mode": "x-api-key-or-query-api_key"
    }


@router.get("/founder/healthcheck", dependencies=[Depends(verify_founder_key)])
def founder_healthcheck():
    return {
        "founder_access": "ok",
        "system": "zentra-core",
        "control_layer": "ok",
        "lens_layer": "ok",
        "global_layer": "ok_started"
    }


@router.get("/founder/usage/summary", dependencies=[Depends(verify_founder_key)])
def founder_usage_summary():
    return get_usage_summary()


@router.get("/founder/usage/recent", dependencies=[Depends(verify_founder_key)])
def founder_usage_recent(limit: int = 20):
    return {
        "limit": limit,
        "events": get_recent_usage(limit=limit)
    }
