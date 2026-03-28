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
# DEVIATION LAYER (Phase 4)
# ---------------------------

def safe_ratio(actual: float, planned: float):
    if planned == 0:
        return None
    return round((actual - planned) / planned, 6)


def classify_impact_from_ratio(ratio):
    if ratio is None:
        return "unknown"
    ar = abs(ratio)
    if ar < 0.05:
        return "low"
    if ar < 0.15:
        return "moderate"
    return "high"


def metric_direction(actual: float, planned: float, preferred: str):
    if actual == planned:
        return "neutral"

    if preferred == "lower":
        return "adverse" if actual > planned else "favorable"

    if preferred == "higher":
        return "adverse" if actual < planned else "favorable"

    return "neutral"


def build_metric_deviation(name: str, planned, actual, preferred: str):
    if planned is None:
        return None

    planned_f = float(planned)
    actual_f = float(actual)
    absolute_deviation = round(actual_f - planned_f, 6)
    deviation_ratio = safe_ratio(actual_f, planned_f)
    impact_level = classify_impact_from_ratio(deviation_ratio)
    direction = metric_direction(actual_f, planned_f, preferred)

    return {
        "metric": name,
        "planned": planned_f,
        "actual": actual_f,
        "absolute_deviation": absolute_deviation,
        "deviation_ratio": deviation_ratio,
        "direction": direction,
        "impact_level": impact_level
    }


def calculate_population_std(values):
    clean = [float(v) for v in values if isinstance(v, (int, float))]
    if not clean:
        return 0.0
    mean = sum(clean) / len(clean)
    variance = sum((x - mean) ** 2 for x in clean) / len(clean)
    return round(math.sqrt(variance), 6)


def classify_std_severity(std_value: float):
    s = float(std_value)

    if s < 0.05:
        return "stable"
    if s < 0.15:
        return "elevated"
    return "volatile"


def aggregate_deviation_context(
    planned_amount,
    planned_payment_delay_days,
    planned_customer_score,
    planned_exposure_ratio,
    amount,
    payment_delay_days,
    customer_score,
    exposure_ratio
):
    metrics = []

    amount_dev = build_metric_deviation("amount", planned_amount, amount, "neutral")
    delay_dev = build_metric_deviation("payment_delay_days", planned_payment_delay_days, payment_delay_days, "lower")
    customer_dev = build_metric_deviation("customer_score", planned_customer_score, customer_score, "higher")
    exposure_dev = build_metric_deviation("exposure_ratio", planned_exposure_ratio, exposure_ratio, "lower")

    for item in [amount_dev, delay_dev, customer_dev, exposure_dev]:
        if item is not None:
            metrics.append(item)

    adverse_metrics = [m for m in metrics if m["direction"] == "adverse"]

    overall_level = "none"
    if adverse_metrics:
        if any(m["impact_level"] == "high" for m in adverse_metrics):
            overall_level = "high"
        elif any(m["impact_level"] == "moderate" for m in adverse_metrics):
            overall_level = "moderate"
        else:
            overall_level = "low"

    reasons = [f'{m["metric"]}_{m["direction"]}_{m["impact_level"]}' for m in adverse_metrics]

    deviation_ratios = [
        abs(m["deviation_ratio"])
        for m in metrics
        if m.get("deviation_ratio") is not None
    ]

    std_dev = calculate_population_std(deviation_ratios)
    std_severity = classify_std_severity(std_dev)

    volatility_adjustment = 0
    if std_severity == "volatile":
        volatility_adjustment = 4
    elif std_severity == "elevated":
        volatility_adjustment = 2

    base_risk_adjustment = 0
    if overall_level == "high":
        base_risk_adjustment = 10
    elif overall_level == "moderate":
        base_risk_adjustment = 5
    elif overall_level == "low":
        base_risk_adjustment = 2

    risk_adjustment = base_risk_adjustment + volatility_adjustment

    return {
        "metrics": metrics,
        "overall_level": overall_level,
        "reasons": reasons,
        "dispersion": {
            "deviation_ratios": deviation_ratios,
            "std_dev": std_dev,
            "std_severity": std_severity
        },
        "base_risk_adjustment": base_risk_adjustment,
        "volatility_adjustment": volatility_adjustment,
        "risk_adjustment": risk_adjustment
    }


# ---------------------------
# BANDS
# ---------------------------

def calculate_risk_band(score: float):
    s = float(score)
    if s >= 70:
        return "HIGH"
    if s >= 40:
        return "MID"
    return "LOW"


def calculate_stress_band(score: float):
    s = float(score)
    if s >= 70:
        return "HIGH"
    if s >= 40:
        return "MID"
    return "LOW"


# ---------------------------
# LENS PROFILES
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


def get_lens_risk_profile(lens: str):
    profiles = {
        "invoice": {
            "monitor_threshold": 38,
            "restrict_threshold": 68,
            "volatility_weight": 1.2,
            "priority": "collection"
        },
        "logistics": {
            "monitor_threshold": 40,
            "restrict_threshold": 70,
            "volatility_weight": 1.3,
            "priority": "route_continuity"
        },
        "trade": {
            "monitor_threshold": 42,
            "restrict_threshold": 72,
            "volatility_weight": 1.25,
            "priority": "counterparty_execution"
        },
        "compliance": {
            "monitor_threshold": 35,
            "restrict_threshold": 65,
            "volatility_weight": 1.4,
            "priority": "control_visibility"
        },
        "sme": {
            "monitor_threshold": 40,
            "restrict_threshold": 70,
            "volatility_weight": 1.15,
            "priority": "cashflow_resilience"
        }
    }

    return profiles.get(
        lens,
        {
            "monitor_threshold": 40,
            "restrict_threshold": 70,
            "volatility_weight": 1.0,
            "priority": "general"
        }
    )


def apply_lens_behavior(score, sector, payment_delay_days, exposure_ratio, customer_score, std_level, deviation_level):
    lens = normalize_sector_to_lens(sector)

    adjustment = 0
    reasons = []

    if lens == "logistics":
        if payment_delay_days >= 10:
            adjustment += 3
            reasons.append("logistics_delay_sensitivity")
        if exposure_ratio >= 0.4:
            adjustment += 2
            reasons.append("logistics_exposure_pressure")
        if std_level == "volatile":
            adjustment += 2
            reasons.append("logistics_volatility_fragility")

    elif lens == "invoice":
        if payment_delay_days >= 7:
            adjustment += 4
            reasons.append("invoice_collection_risk")
        if customer_score <= 60:
            adjustment += 2
            reasons.append("invoice_customer_quality")
        if deviation_level == "high":
            adjustment += 2
            reasons.append("invoice_behavior_shift")

    elif lens == "trade":
        if exposure_ratio >= 0.5:
            adjustment += 3
            reasons.append("trade_counterparty_exposure")
        if std_level == "volatile":
            adjustment += 3
            reasons.append("trade_execution_fragility")

    elif lens == "compliance":
        if std_level != "stable":
            adjustment += 3
            reasons.append("compliance_instability_alert")
        if deviation_level in ["moderate", "high"]:
            adjustment += 2
            reasons.append("compliance_control_pressure")

    elif lens == "sme":
        if customer_score <= 65:
            adjustment += 3
            reasons.append("sme_cashflow_risk")
        if exposure_ratio >= 0.4:
            adjustment += 2
            reasons.append("sme_dependency_risk")

    return adjustment, reasons


# ---------------------------
# PHASE 3 DECISION LAYER
# ---------------------------

def build_decision(risk_score: float, pressure: dict, sector: str, deviation_context: dict = None):
    lens = normalize_sector_to_lens(sector)
    profile = get_lens_risk_profile(lens)
    monitor_threshold = profile["monitor_threshold"]
    restrict_threshold = profile["restrict_threshold"]

    level = pressure.get("level", "stable")

    action = "Proceed"
    strategy = "Continue normal operations"
    alert = "Stable context"
    rationale = "Risk and macro pressure remain inside acceptable range"

    if risk_score >= restrict_threshold:
        action = "Restrict"
        strategy = "Reduce exposure and tighten controls"
        alert = "High risk context"
        rationale = "Risk score entered restrictive zone and requires stronger intervention"
    elif risk_score >= monitor_threshold:
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

    if deviation_context:
        deviation_level = deviation_context.get("overall_level", "none")
        deviation_reasons = deviation_context.get("reasons", [])

        if deviation_level == "high":
            if action == "Proceed":
                action = "Monitor"
            elif action == "Monitor":
                action = "Restrict"
            strategy = "Investigate high deviation drivers and tighten response discipline"
            alert = alert + " / high deviation"
            rationale = rationale + f" Adverse deviation materially changed the operating picture: {', '.join(deviation_reasons)}."
        elif deviation_level == "moderate":
            if action == "Proceed":
                action = "Monitor"
            alert = alert + " / moderate deviation"
            rationale = rationale + f" Adverse deviation requires review: {', '.join(deviation_reasons)}."
        elif deviation_level == "low":
            alert = alert + " / low deviation"
            rationale = rationale + " Minor adverse deviation is present and should stay under observation."

        dispersion = deviation_context.get("dispersion", {})
        std_severity = dispersion.get("std_severity", "stable")

        if std_severity == "volatile":
            if action == "Proceed":
                action = "Monitor"
            elif action == "Monitor":
                action = "Restrict"

            alert = alert + " / volatile deviation"
            rationale = rationale + " Deviation dispersion is volatile, indicating unstable operating behavior."

        elif std_severity == "elevated":
            if action == "Proceed":
                action = "Monitor"

            alert = alert + " / elevated deviation dispersion"
            rationale = rationale + " Deviation dispersion is elevated and suggests growing instability."

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
        "lens": lens,
        "profile": profile
    }


def build_stress_decision(stress_score: float, pressure: dict, sector: str, deviation_context: dict = None):
    lens = normalize_sector_to_lens(sector)
    profile = get_lens_risk_profile(lens)
    monitor_threshold = profile["monitor_threshold"]
    restrict_threshold = profile["restrict_threshold"]

    level = pressure.get("level", "stable")

    action = "Proceed"
    strategy = "Stress remains manageable under current scenario set"
    alert = "Scenario set stable"
    rationale = "Scenario outputs remain inside acceptable operating tolerance"

    if stress_score >= restrict_threshold:
        action = "Restrict"
        strategy = "Prepare containment plan and reduce scenario-sensitive exposure"
        alert = "High scenario pressure"
        rationale = "Stress scenario output entered restrictive zone"
    elif stress_score >= monitor_threshold:
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

    if deviation_context:
        deviation_level = deviation_context.get("overall_level", "none")
        if deviation_level == "high":
            if action == "Proceed":
                action = "Monitor"
            alert = alert + " / high deviation"
            rationale = rationale + " Adverse deviation suggests the stress profile may deteriorate faster."
        elif deviation_level == "moderate":
            alert = alert + " / moderate deviation"
            rationale = rationale + " Adverse deviation adds caution to the scenario view."

        dispersion = deviation_context.get("dispersion", {})
        std_severity = dispersion.get("std_severity", "stable")

        if std_severity == "volatile":
            if action == "Proceed":
                action = "Monitor"
            alert = alert + " / volatile deviation"
            rationale = rationale + " Scenario fragility is amplified by volatile deviation dispersion."
        elif std_severity == "elevated":
            alert = alert + " / elevated deviation dispersion"
            rationale = rationale + " Scenario view is under added caution due to elevated deviation dispersion."

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
        "lens": lens,
        "profile": profile
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
        "phase3_decision_binding": "started",
        "phase4_deviation_layer": "started",
        "std_dispersion_layer": "started",
        "lens_behavior_layer": "started"
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
        "decision_layer": "phase3_started",
        "deviation_layer": "phase4_started",
        "dispersion_layer": "std_enabled",
        "lens_behavior": "enabled"
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


@router.get("/deviation")
def deviation_get(
    amount: float = 0,
    payment_delay_days: float = 0,
    customer_score: float = 0,
    exposure_ratio: float = 0,
    planned_amount: float = None,
    planned_payment_delay_days: float = None,
    planned_customer_score: float = None,
    planned_exposure_ratio: float = None,
):
    deviation_context = aggregate_deviation_context(
        planned_amount=planned_amount,
        planned_payment_delay_days=planned_payment_delay_days,
        planned_customer_score=planned_customer_score,
        planned_exposure_ratio=planned_exposure_ratio,
        amount=amount,
        payment_delay_days=payment_delay_days,
        customer_score=customer_score,
        exposure_ratio=exposure_ratio
    )

    return {
        "phase": "phase4",
        "layer": "deviation",
        "deviation": deviation_context
    }


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
        "planned_amount": planned_amount,
        "planned_payment_delay_days": planned_payment_delay_days,
        "planned_customer_score": planned_customer_score,
        "planned_exposure_ratio": planned_exposure_ratio,
    }

    result = calculate_score(data)

    market = get_global_market()
    pressure = get_global_pressure_context(market)

    base_score = float(result.get("risk_score", 0))
    adjusted_score, adjustment_reasons = apply_global_adjustment(base_score, market)

    deviation_context = aggregate_deviation_context(
        planned_amount=planned_amount,
        planned_payment_delay_days=planned_payment_delay_days,
        planned_customer_score=planned_customer_score,
        planned_exposure_ratio=planned_exposure_ratio,
        amount=amount,
        payment_delay_days=payment_delay_days,
        customer_score=customer_score,
        exposure_ratio=exposure_ratio
    )

    adjusted_score = max(
        0.0,
        min(100.0, round(adjusted_score + deviation_context.get("risk_adjustment", 0), 2))
    )

    std_severity = deviation_context.get("dispersion", {}).get("std_severity", "stable")
    deviation_level = deviation_context.get("overall_level", "none")

    lens_adjustment, lens_reasons = apply_lens_behavior(
        adjusted_score,
        sector,
        payment_delay_days,
        exposure_ratio,
        customer_score,
        std_severity,
        deviation_level
    )

    adjusted_score = max(0.0, min(100.0, round(adjusted_score + lens_adjustment, 2)))

    decision = build_decision(adjusted_score, pressure, sector, deviation_context)
    risk_band = calculate_risk_band(adjusted_score)

    result["base_risk_score"] = base_score
    result["risk_score"] = adjusted_score
    result["risk_band"] = risk_band
    result["global"] = {
        "market": market,
        "pressure": pressure,
        "adjustment_reasons": adjustment_reasons
    }
    result["deviation"] = deviation_context
    result["lens_adjustment"] = {
        "value": lens_adjustment,
        "reasons": lens_reasons
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
            "deviation_level": deviation_context.get("overall_level"),
            "std_severity": deviation_context.get("dispersion", {}).get("std_severity"),
            "lens_adjustment": lens_adjustment,
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
        "planned_amount": planned_amount,
        "planned_payment_delay_days": planned_payment_delay_days,
        "planned_customer_score": planned_customer_score,
        "planned_exposure_ratio": planned_exposure_ratio,
    }

    result = calculate_stress(data)

    market = get_global_market()
    result, adjustment_reasons = apply_stress_global_adjustment(result, market)
    pressure = result.get("global", {}).get("pressure", {})

    deviation_context = aggregate_deviation_context(
        planned_amount=planned_amount,
        planned_payment_delay_days=planned_payment_delay_days,
        planned_customer_score=planned_customer_score,
        planned_exposure_ratio=planned_exposure_ratio,
        amount=amount,
        payment_delay_days=payment_delay_days,
        customer_score=customer_score,
        exposure_ratio=exposure_ratio
    )

    stress_score = float(result.get("stress_score", 0))
    stress_score = max(
        0.0,
        min(100.0, round(stress_score + deviation_context.get("risk_adjustment", 0), 2))
    )

    std_severity = deviation_context.get("dispersion", {}).get("std_severity", "stable")
    deviation_level = deviation_context.get("overall_level", "none")

    lens_adjustment, lens_reasons = apply_lens_behavior(
        stress_score,
        sector,
        payment_delay_days,
        exposure_ratio,
        customer_score,
        std_severity,
        deviation_level
    )

    stress_score = max(0.0, min(100.0, round(stress_score + lens_adjustment, 2)))

    scenarios = result.get("scenarios", {})
    scenarios["base_case"] = max(
        0.0,
        min(100.0, round(float(scenarios.get("base_case", 0)) + deviation_context.get("risk_adjustment", 0) + lens_adjustment, 2))
    )
    scenarios["mild_shock"] = max(
        0.0,
        min(100.0, round(float(scenarios.get("mild_shock", 0)) + deviation_context.get("risk_adjustment", 0) + lens_adjustment, 2))
    )
    scenarios["severe_shock"] = max(
        0.0,
        min(100.0, round(float(scenarios.get("severe_shock", 0)) + deviation_context.get("risk_adjustment", 0) + lens_adjustment, 2))
    )

    result["stress_score"] = stress_score
    result["stress_band"] = calculate_stress_band(stress_score)
    result["scenarios"] = scenarios
    result["deviation"] = deviation_context
    result["lens_adjustment"] = {
        "value": lens_adjustment,
        "reasons": lens_reasons
    }

    decision = build_stress_decision(stress_score, pressure, sector, deviation_context)
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
            "deviation_level": deviation_context.get("overall_level"),
            "std_severity": deviation_context.get("dispersion", {}).get("std_severity"),
            "lens_adjustment": lens_adjustment,
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
            "/deviation",
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
        "decision_layer": "phase3_score_stress_connected",
        "deviation_layer": "phase4_score_stress_connected",
        "dispersion_layer": "std_enabled",
        "lens_behavior": "enabled"
    }


@router.get("/founder/config", dependencies=[Depends(verify_founder_key)])
def founder_config():
    return {
        "public_routes": get_public_routes() + [
            "/global/market",
            "/deviation",
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
        "decision_layer": "ok_started",
        "deviation_layer": "ok_started",
        "dispersion_layer": "ok_started",
        "lens_behavior": "ok_started"
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
