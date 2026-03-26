from fastapi import APIRouter
from app.services.scoring import calculate_score

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.post("/score")
def score(data: dict):
    return calculate_score(data)
