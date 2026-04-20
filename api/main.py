from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

app = FastAPI(title="ZENTRA Credit Stress API")

API_KEY = "zentra-demo-key"

class Input(BaseModel):
    principal: float
    interest_rate: float
    term_months: int
    monthly_income: float
    sector: str = "trade"
    sector_risk_level: float = 0.5
    payment_delay_days: int = 0
    customer_score: float = 50
    exposure_ratio: float = 0.5

def clamp(v, lo, hi):
    return max(lo, min(hi, v))

def score_logic(data: Input):
    base = 100

    delay_penalty = clamp(data.payment_delay_days * 0.6, 0, 30)
    customer_penalty = clamp((100 - data.customer_score) * 0.3, 0, 30)
    exposure_penalty = clamp(data.exposure_ratio * 40, 0, 40)
    sector_penalty = clamp(data.sector_risk_level * 25, 0, 25)

    risk = base - (delay_penalty + customer_penalty + exposure_penalty + sector_penalty)
    risk = clamp(risk, 0, 100)

    stress = clamp(
        delay_penalty * 1.2 +
        exposure_penalty * 0.8 +
        (100 - data.customer_score) * 0.2,
        0,
        100
    )

    if risk >= 70:
        decision = "approve"
    elif risk >= 40:
        decision = "monitor"
    else:
        decision = "reject"

    if stress >= 70:
        macro = "high"
    elif stress >= 40:
        macro = "moderate"
    else:
        macro = "stable"

    return {
        "risk_score": round(risk, 2),
        "stress_score": round(stress, 2),
        "decision": decision,
        "macro_pressure": macro,
        "trade_signal": round(risk * 0.9, 2),
        "deviation_level": "low" if stress < 40 else "moderate" if stress < 70 else "high",
        "regime": "trend" if risk > 50 else "fragile",
        "dominant_lens": data.sector,
        "strategy": "Proceed with controlled caution and keep exposure monitored.",
        "rationale": "Calculated via clean ZENTRA stress model."
    }

@app.post("/v1/credit-stress")
def credit_stress(input: Input, x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return score_logic(input)

@app.get("/health")
def health():
    return {"ok": True}
