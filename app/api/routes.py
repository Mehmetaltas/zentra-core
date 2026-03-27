from fastapi import APIRouter
from app.services.scoring import calculate_score
from app.models.risk import RiskInput

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/")
def api_root():
    return {"api": "ZENTRA CORE ROUTES ACTIVE"}

@router.get("/version")
def version():
    return {
        "name": "zentra-core",
        "version": "0.1.0",
        "model": "zentra_v1"
    }

@router.get("/score")
def score_get(
    amount: float = 0,
    payment_delay_days: int = 0,
    sector: str = "",
    customer_score: float = 0,
    exposure_ratio: float = 0,
):
    data = {
        "amount": amount,
        "payment_delay_days": payment_delay_days,
        "sector": sector,
        "customer_score": customer_score,
        "exposure_ratio": exposure_ratio,
    }
    return calculate_score(data)

@router.post("/score")
def score_post(data: RiskInput):
    return calculate_score(data.dict())
