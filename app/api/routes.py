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
# GLOBAL DATA LAYER (Phase 2)
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


def get_global_pressure_context(market: dict):
    usdtry = float(market.get("usdtry", 30.0))
    eurusd = float(market.get("eurusd", 1.08))

    level = "stable"
    reasons = []

    if usdtry >= 40:
        level = "high"
        reasons.append("high_usdtry_pressure")
    elif usdtry >= 35:
        level = "elevated"
        reasons.append("elevated_usdtry_pressure")
    elif usdtry >= 30:
        level = "moderate"
        reasons.append("moderate_usdtry_pressure")

    if eurusd <= 1.03:
        reasons.append("eurusd_compression")
        if level == "stable":
            level = "moderate"

    return {
        "level": level,
        "reasons": reasons
    }


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


def apply_stress_global_adjustment(result: dict, market: dict):
    reasons = []
    pressure = get_global_pressure_context(market)
    level = pressure["level"]

    base_case = float(result.get("scenarios", {}).get("base_case", result.get("stress_score", 0)))
    mild_shock = float(result.get("scenarios", {}).get("mild_shock", base_case))
    severe_shock = float(result.get("scenarios", {}).get("severe_shock", base_case))

    if level == "high":
        base_case += 8
        mild_shock += 10
        severe_shock += 12
        reasons.append("high_global_pressure")
    elif level == "elevated":
        base_case += 5
        mild_shock += 7
        severe_shock += 9
        reasons.append("elevated_global_pressure")
    elif level == "moderate":
        base_case += 2
        mild_shock += 3
        severe_shock += 4
        reasons.append("moderate_global_pressure")

    base_case = round(min(100.0, base_case), 2)
    mild_shock = round(min(100.0, mild_shock), 2)
    severe_shock = round(min(100.0, severe_shock), 2)

    result["stress_score"] = base_case
    result["scenarios"] = {
        "base_case": base_case,
        "mild_shock": mild_shock,
        "severe_shock": severe_shock
    }
    result["global"] = {
        "market": market,
        "pressure": pressure,
        "adjustment_reasons": reasons
    }

    return result, reasons


def attach_lens_global_context(lens_data: dict, market: dict):
    pressure = get_global_pressure_context(market)

    lens_id = lens_data.get("id", "")
    global_focus = []

    if lens_id == "logistics":
        global_focus = [
            "fx pressure can amplify shipment and route fragility",
            "fuel and energy sources should be attached next for full logistics pressure visibility"
        ]
    elif lens_id == "trade":
        global_focus = [
            "fx pressure can distort trade execution continuity",
            "cross-border counterparties become more sensitive under macro volatility"
        ]
    elif lens_id == "invoice":
        global_focus = [
            "macro pressure can worsen collection delay behavior",
            "receivable quality should be read together with currency stress"
        ]
    elif lens_id == "sme":
        global_focus = [
            "small enterprise repayment behavior becomes more fragile under macro pressure",
            "cashflow sensitivity rises when currency pressure expands"
        ]
    elif lens_id == "compliance":
        global_focus = [
            "macro instability can increase reporting and control pressure",
            "control visibility should expand as system complexity grows"
        ]

    lens_data["global_context"] = {
        "pressure_level": pressure["level"],
        "pressure_reasons": pressure["reasons"],
        "global_focus": global_focus
    }

    return lens_data


# ---------------------------
# PHASE 3 DECISION LAYER
# ---------------------------

def normalize_sector_to_lens(sector: str):
    s = (sector or "").strip().lower()

    if s in ["invoice", "receivable", "collections"]:
        return "invoice"
    if s in ["logistics", "shipment", "transport", "delivery"]:
        return "logistics"
    if s in ["trade", "export", "import", "counterparty"]:
        return "trade"
    if s in ["compliance", "regtech", "aml", "policy"]:
        return "compliance"
    return "sme"


def build_decision(risk_score: float, pressure: dict, sector: str):
    lens = normalize_sector_to_lens(sector)
    level = pressure.get("level", "stable")

    action = "Proceed"
    strategy = "Continue normal operations"
    alert = "Stable context"
    rationale = "Risk and macro pressure remain inside acceptable range"

    if risk_score >= 70:
        action = "Restrict"
        strategy = "Reduce exposure and tighten controls"
        alert = "High risk context"
        rationale = "Risk score entered restrictive zone and requires stronger intervention"
    elif risk_score >= 40:
        action = "Monitor"
        strategy = "Increase review frequency and tighten approval discipline"
        alert = "Emerging pressure"
        rationale = "Risk score entered monitoring zone and should be watched more closely"

    if level == "high":
        if action == "Proceed":
            action = "Monitor"
        elif action == "Monitor":
            action = "Restrict"

        strategy = "Reduce exposure immediately and review macro-sensitive transactions"
        alert = "High macro pressure"
        rationale = "Global pressure amplified the base risk condition"
    elif level == "elevated":
        if action == "Proceed":
            action = "Monitor"
        strategy = "Tighten exposure discipline under elevated macro pressure"
        alert = "Elevated macro pressure"
        rationale = "Macro pressure increased the caution level of the base risk condition"
    elif level == "moderate" and action == "Proceed":
        strategy = "Proceed with caution and keep exposure under review"
        alert = "Moderate macro pressure"
        rationale = "Base risk remains manageable but macro context adds caution"

    if lens == "invoice":
        if action == "Restrict":
            strategy = "Accelerate collection workflow and shorten payment terms"
        elif action == "Monitor":
            strategy = "Review invoice aging and tighten payment terms"
        alert = alert + " / invoice sensitivity"
        rationale = rationale + " Invoice behavior is sensitive to delay and receivable quality."

    elif lens == "logistics":
        if action == "Restrict":
            strategy = "Review route fragility, shipment dependence, and cost pass-through"
        elif action == "Monitor":
            strategy = "Track route cost pressure and shipment delay concentration"
        alert = alert + " / logistics sensitivity"
        rationale = rationale + " Logistics flows become more fragile under macro and cost pressure."

    elif lens == "trade":
        if action == "Restrict":
            strategy = "Reduce counterparty exposure and tighten trade continuity controls"
        elif action == "Monitor":
            strategy = "Review counterparty reliability and execution concentration"
        alert = alert + " / trade sensitivity"
        rationale = rationale + " Trade execution depends on counterparties and cross-border conditions."

    elif lens == "compliance":
        if action == "Restrict":
            strategy = "Escalate control review and tighten policy enforcement"
        elif action == "Monitor":
            strategy = "Increase compliance review frequency and control visibility"
        alert = alert + " / compliance sensitivity"
        rationale = rationale + " Compliance pressure rises as system and market stress increase."

    elif lens == "sme":
        if action == "Restrict":
            strategy = "Reduce credit exposure and review cashflow fragility"
        elif action == "Monitor":
            strategy = "Monitor repayment behavior and dependency concentration"
        alert = alert + " / sme sensitivity"
        rationale = rationale + " Small enterprise resilience is more exposed to pressure shifts."

    return {
        "action": action,
        "strategy": strategy,
        "alert": alert,
        "rationale": rationale,
        "lens": lens
    }


def build_stress_decision(stress_score: float, pressure: dict, sector: str):
    lens = normalize_sector_to_lens(sector)
    level = pressure.get("level", "stable")

    action = "Proceed"
    strategy = "Stress remains manageable under current scenario set"
    alert = "Scenario set stable"
    rationale = "Scenario outputs remain inside acceptable operating tolerance"

    if stress_score >= 70:
        action = "Restrict"
        strategy = "Prepare containment plan and reduce scenario-sensitive exposure"
        alert = "High scenario pressure"
        rationale = "Stress scenario output entered restrictive zone"
    elif stress_score >= 40:
        action = "Monitor"
        strategy = "Increase scenario monitoring and prepare mitigation steps"
        alert = "Moderate scenario pressure"
        rationale = "Stress scenario output entered monitoring zone"

    if level in ["high", "elevated"]:
        if action == "Proceed":
            action = "Monitor"
        strategy = "Re-evaluate scenario tolerance under macro pressure"
        alert = alert + " / macro amplified"
        rationale = rationale + " Global pressure amplifies scenario fragility."

    if lens == "logistics":
        strategy = strategy + " Focus on route cost and shipment continuity."
    elif lens == "invoice":
        strategy = strategy + " Focus on collection pressure and term sensitivity."
    elif lens == "trade":
        strategy = strategy + " Focus on counterparty and execution continuity."
    elif lens == "compliance":
        strategy = strategy + " Focus on policy escalation and control discipline."
    elif lens == "sme":
        strategy = strategy + " Focus on cashflow fragility and partner dependence."

    return {
        "action": action,
        "strategy": strategy,
        "alert": alert,
        "rationale": rationale,
        "lens": lens
    }


# ---------------------------
# CORE ROUTES
# ---------------------------

@router.get("/health")
def health():
    return {
        "status": "ok",
        "system": "zentra-core",
        "phase": "phase1",
        "phase2_global_layer": "started",
        "phase2_binding_layer": "started",
        "phase3_decision_binding": "started"
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
        "global_layer": "phase2_fx_started",
        "binding_layer": "phase2_score_stress_lens_connected",
        "decision_layer": "phase3_started"
    }


@router.get("/global/market")
def global_market():
    market = get_global_market()
    pressure = get_global_pressure_context(market)
    return {
        "phase": "phase2",
        "layer": "global_data",
        "market": market,
        "pressure": pressure
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
    pressure = get_global_pressure_context(market)
    base_score = float(result.get("risk_score", 0))
    adjusted_score, adjustment_reasons = apply_global_adjustment(base_score, market)
    decision = build_decision(adjusted_score, pressure, sector)

    result["base_risk_score"] = base_score
    result["risk_score"] = adjusted_score
    result["global"] = {
        "market": market,
        "pressure": pressure,
        "adjustment_reasons": adjustment_reasons
    }
    result["decision"] = decision
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
            "global_adjustments": adjustment_reasons,
            "decision_action": decision.get("action")
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

    market = get_global_market()
    result, adjustment_reasons = apply_stress_global_adjustment(result, market)
    pressure = result.get("global", {}).get("pressure", {})
    decision = build_stress_decision(float(result.get("stress_score", 0)), pressure, sector)

    result["decision"] = decision
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
            "model": result.get("model"),
            "global_adjustments": adjustment_reasons,
            "decision_action": decision.get("action")
        }
    )

    return result


# ---------------------------
# LENS ROUTES
# ---------------------------

@router.get("/lens/list")
def lens_list():
    market = get_global_market()
    pressure = get_global_pressure_context(market)

    return {
        "phase": "phase1",
        "lens_count": 5,
        "lenses": get_lens_catalog(),
        "global_context": {
            "pressure_level": pressure["level"],
            "pressure_reasons": pressure["reasons"]
        }
    }


@router.get("/lens/{lens_id}")
def lens_detail(lens_id: str):
    lens_data = get_lens_detail(lens_id)
    market = get_global_market()
    lens_data = attach_lens_global_context(lens_data, market)
    return lens_data


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
        "global_layer": "phase2_fx_started",
        "binding_layer": "phase2_score_stress_lens_connected",
        "decision_layer": "phase3_score_stress_connected"
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
        "global_layer": "ok_started",
        "binding_layer": "ok_started",
        "decision_layer": "ok_started"
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
