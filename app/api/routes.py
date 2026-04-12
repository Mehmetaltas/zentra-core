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
# DEVIATION LAYER (Phase 4 Foundation)
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

    risk_adjustment = 0
    if overall_level == "high":
        risk_adjustment = 10
    elif overall_level == "moderate":
        risk_adjustment = 5
    elif overall_level == "low":
        risk_adjustment = 2

    return {
        "metrics": metrics,
        "overall_level": overall_level,
        "reasons": reasons,
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


def build_confidence(score: float, pressure: dict, deviation_context: dict = None):
    base = 0.85

    if score >= 70:
        base -= 0.25
    elif score >= 40:
        base -= 0.15
    else:
        base -= 0.05

    level = pressure.get("level", "stable")
    if level == "high":
        base -= 0.25
    elif level == "elevated":
        base -= 0.15
    elif level == "moderate":
        base -= 0.08

    if deviation_context:
        deviation_level = deviation_context.get("overall_level", "none")
        if deviation_level == "high":
            base -= 0.20
        elif deviation_level == "moderate":
            base -= 0.10
        elif deviation_level == "low":
            base -= 0.05

    confidence_score = max(0.05, min(0.95, round(base, 2)))

    if confidence_score >= 0.75:
        confidence_label = "high"
    elif confidence_score >= 0.50:
        confidence_label = "medium"
    else:
        confidence_label = "low"

    return {
        "score": confidence_score,
        "label": confidence_label
    }


def build_decision(risk_score: float, pressure: dict, sector: str, deviation_context: dict = None):
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

    confidence = build_confidence(risk_score, pressure, deviation_context)

    return {
        "action": action,
        "strategy": strategy,
        "alert": alert,
        "rationale": rationale,
        "lens": lens,
        "confidence": confidence
    }


def build_stress_decision(stress_score: float, pressure: dict, sector: str, deviation_context: dict = None):
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

    confidence = build_confidence(stress_score, pressure, deviation_context)

    return {
        "action": action,
        "strategy": strategy,
        "alert": alert,
        "rationale": rationale,
        "lens": lens,
        "confidence": confidence
    }

def build_agent_core(
    risk_score: float = 0.0,
    stress_score: float = 0.0,
    pressure: dict = None,
    sector: str = "",
    deviation_context: dict = None
):
    pressure = pressure or {}
    deviation_context = deviation_context or {}

    level = pressure.get("level", "stable")
    deviation_level = deviation_context.get("overall_level", "none")

    active_agents = []
    missions = []

    def add_agent(name: str):
        if name not in active_agents:
            active_agents.append(name)

    def add_mission(mission_id: str, owner: str, mission_type: str, priority: str, reason: str):
        missions.append({
            "mission_id": mission_id,
            "owner": owner,
            "type": mission_type,
            "priority": priority,
            "reason": reason
        })

    if risk_score >= 70:
        add_agent("Risk Agent")
        add_mission(
            "risk_restriction_review",
            "Risk Agent",
            "ACTION",
            "critical",
            "Risk entered restrictive zone"
        )
    elif risk_score >= 40:
        add_agent("Risk Agent")
        add_mission(
            "risk_escalation_monitor",
            "Risk Agent",
            "ACTION",
            "high",
            "Risk entered monitoring zone"
        )

    if stress_score >= 70:
        add_agent("Stress Agent")
        add_mission(
            "stress_containment_watch",
            "Stress Agent",
            "ACTION",
            "critical",
            "Stress entered restrictive zone"
        )
    elif stress_score >= 40:
        add_agent("Stress Agent")
        add_mission(
            "stress_scenario_monitor",
            "Stress Agent",
            "ACTION",
            "high",
            "Stress entered monitoring zone"
        )

    if level in ["high", "elevated"]:
        add_agent("Telescope Agent")
        add_mission(
            "macro_pressure_watch",
            "Telescope Agent",
            "REVIEW",
            "critical" if level == "high" else "high",
            f"Macro pressure is {level}"
        )

    if deviation_level == "high":
        add_agent("Deviation Agent")
        add_mission(
            "deviation_break_review",
            "Deviation Agent",
            "REVIEW",
            "critical",
            "Deviation materially changed the operating picture"
        )
    elif deviation_level == "moderate":
        add_agent("Deviation Agent")
        add_mission(
            "deviation_watch",
            "Deviation Agent",
            "REVIEW",
            "medium",
            "Deviation requires caution review"
        )

    if sector in ["trade", "logistics", "invoice"] and risk_score < 70 and stress_score < 70:
        add_agent("Trade Agent")
        add_mission(
            "trade_selectivity_review",
            "Trade Agent",
            "GUIDANCE",
            "medium",
            "Trade-sensitive sector should remain selective under current conditions"
        )

    add_agent("Learning Agent")

    return {
        "active_agents": active_agents,
        "mission_count": len(missions),
        "missions": missions,
        "learning_status": "tracking_only",
        "operator_binding": "not_started"
    }


def build_operator_binding(decision: dict, agent_core: dict, sector: str = ""):
    decision = decision or {}
    agent_core = agent_core or {}

    base_action = decision.get("action", "Proceed")
    missions = agent_core.get("missions", [])
    active_agents = agent_core.get("active_agents", [])

    severity = "normal"
    bias = "neutral"
    reasons = []

    def escalate_severity(current: str, new: str) -> str:
        order = {"normal": 0, "medium": 1, "high": 2, "critical": 3}
        return new if order.get(new, 0) > order.get(current, 0) else current

    operator_action = "TUT"

    if base_action == "Restrict":
        operator_action = "RISK AZALT"
        severity = "high"
        bias = "defensive"
    elif base_action == "Monitor":
        operator_action = "BEKLE"
        severity = "medium"
        bias = "cautious"
    elif sector in ["trade", "logistics", "invoice"]:
        operator_action = "SEÇİCİ AL"
        bias = "selective"
    else:
        operator_action = "TUT"

    for mission in missions:
        mission_id = mission.get("mission_id", "")
        priority = mission.get("priority", "medium")
        reason = mission.get("reason", "")

        if priority == "critical":
            severity = escalate_severity(severity, "critical")
        elif priority == "high":
            severity = escalate_severity(severity, "high")
        elif priority == "medium":
            severity = escalate_severity(severity, "medium")

        if mission_id in ["risk_restriction_review", "stress_containment_watch"]:
            operator_action = "RISK AZALT"
            bias = "defensive"
            reasons.append(f"Mission {mission_id} forced defensive posture")
        elif mission_id == "macro_pressure_watch":
            if operator_action == "SEÇİCİ AL":
                operator_action = "BEKLE"
            elif operator_action == "TUT":
                operator_action = "BEKLE"
            bias = "defensive"
            reasons.append(f"Mission {mission_id} increased macro caution")
        elif mission_id == "deviation_break_review":
            if operator_action == "SEÇİCİ AL":
                operator_action = "AZALT"
            elif operator_action == "TUT":
                operator_action = "AZALT"
            elif operator_action == "BEKLE":
                operator_action = "AZALT"
            bias = "defensive"
            reasons.append(f"Mission {mission_id} reacted to adverse deviation")
        elif mission_id == "deviation_watch":
            if operator_action == "SEÇİCİ AL":
                operator_action = "BEKLE"
            reasons.append(f"Mission {mission_id} added caution review")
        elif mission_id == "trade_selectivity_review" and operator_action in ["TUT", "SEÇİCİ AL"]:
            operator_action = "SEÇİCİ AL"
            bias = "selective"
            reasons.append(f"Mission {mission_id} preserved selective participation")

        if reason and len(reasons) < 5 and f"Mission {mission_id}" not in " ".join(reasons):
            reasons.append(f"Mission {mission_id}: {reason}")

    mission_effect = "mission_adjusted" if reasons else "base_decision_only"

    return {
        "base_action": base_action,
        "operator_action": operator_action,
        "bias": bias,
        "severity": severity,
        "mission_effect": mission_effect,
        "reasons": reasons[:5],
        "active_agents": active_agents
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
        "phase4_deviation_layer": "started"
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
        "deviation_layer": "phase4_started"
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

    decision = build_decision(adjusted_score, pressure, sector, deviation_context)
    agent_core = build_agent_core(
        risk_score=adjusted_score,
        stress_score=float(result.get("stress_score", 0)),
        pressure=pressure,
        sector=sector,
        deviation_context=deviation_context
    )
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
    result["decision"] = decision
    result["agent_core"] = agent_core
    operator_binding = build_operator_binding(decision, agent_core, sector)
    result["operator_binding"] = operator_binding
    result["decision"]["operator_action"] = operator_binding.get("operator_action")
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

    scenarios = result.get("scenarios", {})
    scenarios["base_case"] = max(0.0, min(100.0, round(float(scenarios.get("base_case", 0)) + deviation_context.get("risk_adjustment", 0), 2)))
    scenarios["mild_shock"] = max(0.0, min(100.0, round(float(scenarios.get("mild_shock", 0)) + deviation_context.get("risk_adjustment", 0), 2)))
    scenarios["severe_shock"] = max(0.0, min(100.0, round(float(scenarios.get("severe_shock", 0)) + deviation_context.get("risk_adjustment", 0), 2)))

    result["stress_score"] = stress_score
    result["stress_band"] = calculate_stress_band(stress_score)
    result["scenarios"] = scenarios
    result["deviation"] = deviation_context

    decision = build_stress_decision(stress_score, pressure, sector, deviation_context)
    agent_core = build_agent_core(
        risk_score=float(result.get("risk_score", 0)),
        stress_score=stress_score,
        pressure=pressure,
        sector=sector,
        deviation_context=deviation_context
    )
    result["decision"] = decision
    result["agent_core"] = agent_core
    operator_binding = build_operator_binding(decision, agent_core, sector)
    result["operator_binding"] = operator_binding
    result["decision"]["operator_action"] = operator_binding.get("operator_action")

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
        "deviation_layer": "phase4_score_stress_connected"
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
        "deviation_layer": "ok_started"
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
