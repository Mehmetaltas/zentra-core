from fastapi import APIRouter, Request
from app.services.scoring import calculate_score
from app.services.stress import calculate_stress
from app.core.rate_limit import check_rate_limit

rout        "eurusd": 1.08,
        "notes": ["static fallback"]
    }

def get_macro_pressure(market: dict):
    usdtry = float(market.get("usdtry", 30.0))
    eurusd = float(market.get("eurusd", 1.08))

    level = "stable"
    reasons = []

    if usdtry >= 40:
        level = "high"
        reasons.append("high_fx_pressure")
    elif usdtry >= 35:
        level = "elevated"
        reasons.append("elevated_fx_pressure")
    elif usdtry >= 30:
        level = "moderate"
        reasons.append("moderate_fx_pressure")

    if eurusd <= 1.03:
        reasons.append("eurusd_compression")
        if level == "stable":
            level = "moderate"

    return {
        "level": level,
        "reasons": reasons
    }

def apply_macro_overlay(score: float, market: dict):
    pressure = get_macro_pressure(market)
    level = pressure["level"]

    adjustment = 0
    reasons = []

    if level == "high":
        adjustment = 10
        reasons.append("high_fx_pressure")
    elif level == "elevated":
        adjustment = 6
        reasons.append("elevated_fx_pressure")
    elif level == "moderate":
        adjustment = 3
        reasons.append("moderate_fx_pressure")

    return score + adjustment, adjustment, reasons, pressure


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

        direction = "neutral"
        if actual > planned:
            direction = "up"
        elif actual < planned:
            direction = "down"

        return {
            "metric": name,
            "planned": planned,
            "actual": actual,
            "ratio": round(r, 4),
            "direction": direction,
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

    reasons = [f'{m["metric"]}_{m["direction"]}_{m["impact"]}' for m in metrics if m["impact"] in ["moderate", "high"]]

    return {
        "metrics": metrics,
        "level": level,
        "adjustment": adj,
        "reasons": reasons
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
# LENS
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


def get_lens_profile(lens: str):
    profiles = {
        "invoice": {
            "monitor_threshold": 38,
            "restrict_threshold": 68,
            "priority": "collection_discipline"
        },
        "logistics": {
            "monitor_threshold": 40,
            "restrict_threshold": 70,
            "priority": "route_continuity"
        },
        "trade": {
            "monitor_threshold": 42,
            "restrict_threshold": 72,
            "priority": "counterparty_execution"
        },
        "compliance": {
            "monitor_threshold": 35,
            "restrict_threshold": 65,
            "priority": "control_visibility"
        },
        "sme": {
            "monitor_threshold": 40,
            "restrict_threshold": 70,
            "priority": "cashflow_resilience"
        }
    }
    return profiles.get(
        lens,
        {
            "monitor_threshold": 40,
            "restrict_threshold": 70,
            "priority": "general"
        }
    )


# ---------------------------
# DECISION ENGINE
# ---------------------------

def build_decision(final_score: float, macro_pressure: dict, sector: str, deviation: dict):
    lens = normalize_sector_to_lens(sector)
    profile = get_lens_profile(lens)

    monitor_threshold = profile["monitor_threshold"]
    restrict_threshold = profile["restrict_threshold"]

    macro_level = macro_pressure.get("level", "stable")
    deviation_level = deviation.get("level", "none")
    deviation_reasons = deviation.get("reasons", [])

    action = "Proceed"
    alert = "Stable context"
    strategy = "Continue with standard operating discipline"
    rationale = "Risk remains within acceptable baseline range."

    if final_score >= restrict_threshold:
        action = "Restrict"
        alert = "High risk context"
        strategy = "Reduce exposure and tighten approval control"
        rationale = "Final risk score entered the restrictive zone."
    elif final_score >= monitor_threshold:
        action = "Monitor"
        alert = "Emerging pressure"
        strategy = "Increase review frequency and tighten decision discipline"
        rationale = "Final risk score entered the monitoring zone."

    if macro_level == "high":
        if action == "Proceed":
            action = "Monitor"
        elif action == "Monitor":
            action = "Restrict"
        alert = alert + " / high macro pressure"
        strategy = "Re-evaluate exposure under strong macro stress"
        rationale = rationale + " Macro pressure materially amplifies the operating risk."
    elif macro_level == "elevated":
        if action == "Proceed":
            action = "Monitor"
        alert = alert + " / elevated macro pressure"
        rationale = rationale + " Macro pressure adds caution to the baseline profile."
    elif macro_level == "moderate" and action == "Proceed":
        alert = "Moderate macro pressure"
        strategy = "Proceed with caution and keep exposure under observation"
        rationale = rationale + " Macro conditions require mild caution."

    if deviation_level == "high":
        if action == "Proceed":
            action = "Monitor"
        elif action == "Monitor":
            action = "Restrict"
        alert = alert + " / high deviation"
        strategy = "Investigate deviation drivers and tighten execution controls"
        rationale = rationale + f" Adverse deviation materially changed the picture: {', '.join(deviation_reasons)}."
    elif deviation_level == "moderate":
        if action == "Proceed":
            action = "Monitor"
        alert = alert + " / moderate deviation"
        rationale = rationale + f" Moderate deviation requires review: {', '.join(deviation_reasons)}."
    elif deviation_level == "low":
        alert = alert + " / low deviation"
        rationale = rationale + " Minor deviation is present but remains manageable."

    if lens == "logistics":
        if action == "Restrict":
            strategy = "Review route fragility, delay concentration, and cost pass-through"
        elif action == "Monitor":
            strategy = "Track route continuity, shipment delays, and concentration risk"
        alert = alert + " / logistics sensitivity"
        rationale = rationale + " Logistics operations are sensitive to delay and route disruption."

    elif lens == "invoice":
        if action == "Restrict":
            strategy = "Accelerate collections and tighten payment term discipline"
        elif action == "Monitor":
            strategy = "Review aging behavior and strengthen collection monitoring"
        alert = alert + " / invoice sensitivity"
        rationale = rationale + " Invoice performance is sensitive to collection behavior and receivable quality."

    elif lens == "trade":
        if action == "Restrict":
            strategy = "Reduce counterparty exposure and tighten execution controls"
        elif action == "Monitor":
            strategy = "Review counterparty concentration and execution continuity"
        alert = alert + " / trade sensitivity"
        rationale = rationale + " Trade activity is sensitive to counterparties and cross-border execution."

    elif lens == "compliance":
        if action == "Restrict":
            strategy = "Escalate control review and tighten enforcement discipline"
        elif action == "Monitor":
            strategy = "Increase compliance review frequency and visibility"
        alert = alert + " / compliance sensitivity"
        rationale = rationale + " Compliance risk can intensify quickly under operational or macro stress."

    elif lens == "sme":
        if action == "Restrict":
            strategy = "Reduce credit appetite and review cashflow fragility"
        elif action == "Monitor":
            strategy = "Monitor resilience, concentration, and repayment behavior"
        alert = alert + " / sme sensitivity"
        rationale = rationale + " SME profiles are more exposed to fragility under pressure shifts."

    return {
        "action": action,
        "alert": alert,
        "strategy": strategy,
        "rationale": rationale,
        "lens": lens,
        "profile": profile
    }


def build_stress_decision(final_score: float, macro_pressure: dict, sector: str, deviation: dict):
    lens = normalize_sector_to_lens(sector)
    profile = get_lens_profile(lens)

    monitor_threshold = profile["monitor_threshold"]
    restrict_threshold = profile["restrict_threshold"]

    macro_level = macro_pressure.get("level", "stable")
    deviation_level = deviation.get("level", "none")
    deviation_reasons = deviation.get("reasons", [])

    action = "Proceed"
    alert = "Scenario set stable"
    strategy = "Stress remains manageable under the current scenario set"
    rationale = "Stress outputs remain inside acceptable tolerance."

    if final_score >= restrict_threshold:
        action = "Restrict"
        alert = "High scenario pressure"
        strategy = "Prepare containment and reduce scenario-sensitive exposure"
        rationale = "Stress score entered the restrictive zone."
    elif final_score >= monitor_threshold:
        action = "Monitor"
        alert = "Moderate scenario pressure"
        strategy = "Increase scenario monitoring and prepare mitigation"
        rationale = "Stress score entered the monitoring zone."

    if macro_level in ["high", "elevated"]:
        if action == "Proceed":
            action = "Monitor"
        alert = alert + " / macro amplified"
        rationale = rationale + " Macro conditions amplify scenario fragility."

    if deviation_level == "high":
        if action == "Proceed":
            action = "Monitor"
        alert = alert + " / high deviation"
        rationale = rationale + f" Deviation suggests faster deterioration: {', '.join(deviation_reasons)}."
    elif deviation_level == "moderate":
        alert = alert + " / moderate deviation"
        rationale = rationale + " Deviation adds caution to the scenario outlook."

    if lens == "logistics":
        strategy = strategy + " Focus on route continuity and shipment delay pressure."
    elif lens == "invoice":
        strategy = strategy + " Focus on collection pressure and term sensitivity."
    elif lens == "trade":
        strategy = strategy + " Focus on counterparties and execution continuity."
    elif lens == "compliance":
        strategy = strategy + " Focus on control escalation and enforcement readiness."
    elif lens == "sme":
        strategy = strategy + " Focus on cashflow fragility and resilience."

    return {
        "action": action,
        "alert": alert,
        "strategy": strategy,
        "rationale": rationale,
        "lens": lens,
        "profile": profile
    }


# ---------------------------
# BASIC ROUTES
# ---------------------------

@router.get("/")
def root():
    return {"api": "ZENTRA CORE ACTIVE"}

@router.get("/health")
def health():
    return {
        "status": "ok",
        "system": "zentra-core",
        "layers": [
            "base_risk",
            "macro_overlay",
            "deviation_overlay",
            "decision_engine",
            "lens_intelligence"
        ]
    }

@router.get("/version")
def version():
    return {
        "product": "ZENTRA Risk Core",
        "score_model": "zentra_v2_base_risk",
        "stress_model": "zentra_v2_base_stress",
        "decision_engine": "enabled",
        "lens_layer": "enabled"
    }

@router.get("/global/market")
def global_market():    market = get_global_market()
    pressure = get_macro_pressure(market)
    return {
        "market": market,
        "pressure": pressure
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
    try:
        # === BASE MODEL ===
        base_risk_score = (
            (payment_delay_days * 2)
            + ((100 - customer_score) * 0.3)
            + (exposure_ratio *


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

    base = calculate_score({
        "amount": amount,
        "payment_delay_days": payment_delay_days,
        "sector": sector,
        "customer_score": customer_score,
        "exposure_ratio": exposure_ratio
    })

    base_score = float(base["risk_score"])

    market = get_global_market()
    macro_score, macro_adj, macro_reasons, macro_pressure = apply_macro_overlay(base_score, market)

    deviation = calculate_deviation({
        "amount": amount,
        "delay": payment_delay_days,
        "customer": customer_score,
        "exposure": exposure_ratio,
        "planned_amount": planned_amount,
        "planned_delay": planned_payment_delay_days,
        "planned_customer": planned_customer_score,
        "planned_exposure": planned_exposure_ratio,
    })

    final_score = round(min(100.0, macro_score + deviation["adjustment"]), 2)

    decision = build_decision(final_score, macro_pressure, sector, deviation)

    return {
        "base_risk_score": base_score,
        "macro_adjustment": macro_adj,
        "macro_adjusted_risk_score": round(macro_score, 2),
        "deviation_adjustment": deviation["adjustment"],
        "final_risk_score": final_score,
        "risk_band": band(final_score),
        "drivers": base.get("drivers", []),
        "flags": base.get("flags", []),
        "deviation": deviation,
        "macro": {
            "market": market,
            "pressure": macro_pressure,
            "reasons": macro_reasons
        }exit
clear
cd ~/zentra-core
nano app/api/routes.py
cd ~/zentra-core
nano app/api/routes.py
+0
+
        "decision": decision,
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

    base_score = float(base["stress_score"])

    market = get_global_market()
    macro_score, macro_adj, macro_reasons, macro_pressure = apply_macro_overlay(base_score, market)

    deviation = calculate_deviation({
        "amount": amount,
        "delay": payment_delay_days,
        "customer": customer_score,
        "exposure": exposure_ratio,
        "planned_amount": planned_amount,
        "planned_delay": planned_payment_delay_days,
        "planned_customer": planned_customer_score,
        "planned_exposure": planned_exposure_ratio,
    })

    final_score = round(min(100.0, macro_score + deviation["adjustment"]), 2)

    scenarios = base.get("scenarios", {})
    base_case = round(min(100.0, float(scenarios.get("base_case", base_score)) + macro_adj + deviation["adjustment"]), 2)
    mild_shock = round(min(100.0, float(scenarios.get("mild_shock", base_case)) + macro_adj + deviation["adjustment"]), 2)
    severe_shock = round(min(100.0, float(scenarios.get("severe_shock", base_case)) + macro_adj + deviation["adjustment"]), 2)

    decision = build_stress_decision(final_score, macro_pressure, sector, deviation)

    return {
        "base_stress_score": base_score,
        "macro_adjustment": macro_adj,
        "macro_adjusted_stress_score": round(macro_score, 2),
        "deviation_adjustment": deviation["adjustment"],
        "final_stress_score": final_score,
        "stress_band": band(final_score),
        "scenarios": {
            "base_case": base_case,
            "mild_shock": mild_shock,
            "severe_shock": severe_shock
        },
        "drivers": base.get("drivers", []),
        "deviation": deviation,
        "macro": {
            "market": market,
            "pressure": macro_pressure,
            "reasons": macro_reasons
        },
        "decision": decision,
        "control": rl
    }
@router.get("/score")
def score(
    amount: float,
    payment_delay_days: float,
    sector: str,
    customer_score: float,
    exposure_ratio: float,
    planned_amount: float = None,
    planned_payment_delay_days: float = None,
    planned_customer_score: float = None,
    planned_exposure_ratio: float = None
):
    try:

        # === BASE MODEL ===
        base_risk_score = (
            (payment_delay_days * 2)
            + ((100 - customer_score) * 0.3)
            + (exposure_ratio * 100 * 0.4)
        )

        # === MACRO ===
        macro_adjustment = 3
        macro_adjusted_risk_score = base_risk_score + macro_adjustment

        # === DEVIATION ===
        deviation_adjustment = 0
        deviation_reasons = []

        if planned_amount and amount > planned_amount:
            deviation_adjustment += 3
            deviation_reasons.append("amount_up")

        if planned_payment_delay_days and payment_delay_days > planned_payment_delay_days:
            deviation_adjustment += 4
            deviation_reasons.append("delay_up")

        if planned_customer_score and customer_score < planned_customer_score:
            deviation_adjustment += 2
            deviation_reasons.append("customer_down")

        if planned_exposure_ratio and exposure_ratio > planned_exposure_ratio:
            deviation_adjustment += 3
            deviation_reasons.append("exposure_up")

        final_risk_score = macro_adjusted_risk_score + deviation_adjustment

        # === BAND ===
        if final_risk_score < 40:
            risk_band = "LOW"
            action = "Proceed"
        elif final_risk_score < 70:
            risk_band = "MID"
            action = "Monitor"
        else:
            risk_band = "HIGH"
            action = "Restrict"

        # === DECISION SAFE ===
        decision = {
            "action": action,
            "alert": "Risk evaluation completed",
            "strategy": "Review exposure and repayment behaviour",
            "rationale": "Score generated from behavioral + macro + deviation layers",
            "lens": sector,
            "profile": {
                "monitor_threshold": 40,
                "restrict_threshold": 70
            },
            "problem": "Risk exposure increasing",
            "solution": "Adjust exposure and monitor behavior",
            "benefit": "Risk stabilization",
            "monetary_impact": "Loss probability reduction",
            "evidence": {
                "confidence": 0.80,
                "source_mode": "model",
                "source_name": "zentra_core"
            }
        }

        # === AI SAFE ===
        ai = {
            "summary": f"Risk is {action} under {risk_band} band",
            "recommendation": "Follow decision strategy",
            "confidence_note": "Model based",
            "benefit_note": "Risk control improves",
            "money_note": "Loss reduction",
            "reasoning_scope": "score+macro+deviation"
        }

        # === OUTPUT ===
        return {
            "base_risk_score": base_risk_score,
            "macro_adjustment": macro_adjustment,
            "macro_adjusted_risk_score": macro_adjusted_risk_score,
            "deviation_adjustment": deviation_adjustment,
            "final_risk_score": final_risk_score,
            "risk_band": risk_band,
            "drivers": [],
            "flags": deviation_reasons,
            "deviation": {
                "metrics": [],
                "level": "basic",
                "adjustment": deviation_adjustment,
                "reasons": deviation_reasons
            },
            "macro": {
                "market": {
                    "usdtry": 30,
                    "eurusd": 1.08,
                    "source": {
                        "source_name": "fallback",
                        "is_live": False
                    }
                },
                "pressure": {
                    "level": "moderate"
                }
            },
            "decision": decision,
            "evidence": {
                "source_type": "model",
                "decision_confidence": 0.80
            },
            "ai": ai
        }

    except Exception as e:
        return {"error": str(e)}
@router.get("/score")
def score(
    amount: float,
    payment_delay_days: float,
    sector: str,
    customer_score: float,
    exposure_ratio: float,
    planned_amount: float = None,
    planned_payment_delay_days: float = None,
    planned_customer_score: float = None,
    planned_exposure_ratio: float = None
):
    try:

        # === BASE MODEL ===
        base_risk_score = (
            (payment_delay_days * 2)
            + ((100 - customer_score) * 0.3)
            + (exposure_ratio * 100 * 0.4)
        )

        # === MACRO ===
        macro_adjustment = 3
        macro_adjusted_risk_score = base_risk_score + macro_adjustment

        # === DEVIATION ===
        deviation_adjustment = 0
        deviation_reasons = []

        if planned_amount and amount > planned_amount:
            deviation_adjustment += 3
            deviation_reasons.append("amount_up")

        if planned_payment_delay_days and payment_delay_days > planned_payment_delay_days:
            deviation_adjustment += 4
            deviation_reasons.append("delay_up")

        if planned_customer_score and customer_score < planned_customer_score:
            deviation_adjustment += 2
            deviation_reasons.append("customer_down")

        if planned_exposure_ratio and exposure_ratio > planned_exposure_ratio:
            deviation_adjustment += 3
            deviation_reasons.append("exposure_up")

        final_risk_score = macro_adjusted_risk_score + deviation_adjustment

        # === BAND ===
        if final_risk_score < 40:
            risk_band = "LOW"
            action = "Proceed"
        elif final_risk_score < 70:
            risk_band = "MID"
            action = "Monitor"
        else:
            risk_band = "HIGH"
            action = "Restrict"

        # === DECISION SAFE ===
        decision = {
            "action": action,
            "alert": "Risk evaluation completed",
            "strategy": "Review exposure and repayment behaviour",
            "rationale": "Score generated from behavioral + macro + deviation layers",
            "lens": sector,
            "profile": {
                "monitor_threshold": 40,
                "restrict_threshold": 70
            },
            "problem": "Risk exposure increasing",
            "solution": "Adjust exposure and monitor behavior",
            "benefit": "Risk stabilization",
            "monetary_impact": "Loss probability reduction",
            "evidence": {
                "confidence": 0.80,
                "source_mode": "model",
                "source_name": "zentra_core"
            }
        }

        # === AI SAFE ===
        ai = {
            "summary": f"Risk is {action} under {risk_band} band",
            "recommendation": "Follow decision strategy",
            "confidence_note": "Model based",
            "benefit_note": "Risk control improves",
            "money_note": "Loss reduction",
            "reasoning_scope": "score+macro+deviation"
        }

        # === OUTPUT ===
        return {
            "base_risk_score": base_risk_score,
            "macro_adjustment": macro_adjustment,
            "macro_adjusted_risk_score": macro_adjusted_risk_score,
            "deviation_adjustment": deviation_adjustment,
            "final_risk_score": final_risk_score,
            "risk_band": risk_band,
            "drivers": [],
            "flags": deviation_reasons,
            "deviation": {
                "metrics": [],
                "level": "basic",
                "adjustment": deviation_adjustment,
                "reasons": deviation_reasons
            },
            "macro": {
                "market": {
                    "usdtry": 30,
                    "eurusd": 1.08,
                    "source": {
                        "source_name": "fallback",
                        "is_live": False
                    }
                },
                "pressure": {
                    "level": "moderate"
                }
            },
            "decision": decision,
            "evidence": {
                "source_type": "model",
                "decision_confidence": 0.80
            },
            "ai": ai
        }

    except Exception as e:
        return {"error": str(e)}nano app/api/routes.py
@router.get("/score")
@router.get("/score")
def score(
    amount: float,
    payment_delay_days: float,
    sector: str,
    customer_score: float,
    exposure_ratio: float,
    planned_amount: float = None,
    planned_payment_delay_days: float = None,
    planned_customer_score: float = None,
    planned_exposure_ratio: float = None
):
    try:

        # === BASE MODEL ===
        base_risk_score = (
            (payment_delay_days * 2)
            + ((100 - customer_score) * 0.3)
            + (exposure_ratio * 100 * 0.4)
        )

        # === MACRO ===
        macro_adjustment = 3
        macro_adjusted_risk_score = base_risk_score + macro_adjustment

        # === DEVIATION ===
        deviation_adjustment = 0
        deviation_reasons = []

        if planned_amount and amount > planned_amount:
            deviation_adjustment += 3
            deviation_reasons.append("amount_up")

        if planned_payment_delay_days and payment_delay_days > planned_payment_delay_days:
            deviation_adjustment += 4
            deviation_reasons.append("delay_up")

        if planned_customer_score and customer_score < planned_customer_score:
            deviation_adjustment += 2
            deviation_reasons.append("customer_down")

        if planned_exposure_ratio and exposure_ratio > planned_exposure_ratio:
            deviation_adjustment += 3
            deviation_reasons.append("exposure_up")

        final_risk_score = macro_adjusted_risk_score + deviation_adjustment

        # === BAND ===
        if final_risk_score < 40:
            risk_band = "LOW"
            action = "Proceed"
        elif final_risk_score < 70:
            risk_band = "MID"
            action = "Monitor"
        else:
            risk_band = "HIGH"
            action = "Restrict"

        # === DECISION SAFE ===
        decision = {
            "action": action,
            "alert": "Risk evaluation completed",
            "strategy": "Review exposure and repayment behaviour",
            "rationale": "Score generated from behavioral + macro + deviation layers",
            "lens": sector,
            "profile": {
                "monitor_threshold": 40,
                "restrict_threshold": 70
            },
            "problem": "Risk exposure increasing",
            "solution": "Adjust exposure and monitor behavior",
            "benefit": "Risk stabilization",
            "monetary_impact": "Loss probability reduction",
            "evidence": {
                "confidence": 0.80,
                "source_mode": "model",
                "source_name": "zentra_core"
            }
        }

        # === AI SAFE ===
        ai = {
            "summary": f"Risk is {action} under {risk_band} band",
            "recommendation": "Follow decision strategy",
            "confidence_note": "Model based",
            "benefit_note": "Risk control improves",
            "money_note": "Loss reduction",
            "reasoning_scope": "score+macro+deviation"
        }

        # === OUTPUT ===
        return {
            "base_risk_score": base_risk_score,
            "macro_adjustment": macro_adjustment,
            "macro_adjusted_risk_score": macro_adjusted_risk_score,
            "deviation_adjustment": deviation_adjustment,
            "final_risk_score": final_risk_score,
            "risk_band": risk_band,
            "drivers": [],
            "flags": deviation_reasons,
            "deviation": {
                "metrics": [],
                "level": "basic",
                "adjustment": deviation_adjustment,
                "reasons": deviation_reasons
            },
            "macro": {
                "market": {
                    "usdtry": 30,
                    "eurusd": 1.08,
                    "source": {
                        "source_name": "fallback",
                        "is_live": False
                    }
                },
                "pressure": {
                    "level": "moderate"
                }
            },
            "decision": decision,
            "evidence": {
                "source_type": "model",
                "decision_confidence": 0.80
            },
            "ai": ai
        }

    except Exception as e:
        return {"error": str(e)}
cd ~/zentra-core
nano app/api/routes.py
+
pkg update
pkg install python
pkg install git
pkg install clang
pkg install make
pkg install python-dev
pkg install libffi-dev
pkg install libssl-dev
+
