from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
import uuid
import time
import json
import urllib.request

app = FastAPI(title="ZENTRA CORE SYSTEM")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    started_at = time.time()

    response = await call_next(request)

    duration_ms = round((time.time() - started_at) * 1000, 2)
    response.headers["X-Request-Id"] = request_id
    response.headers["X-Response-Time-Ms"] = str(duration_ms)

    return response

app.include_router(router)

@app.get("/")
def root():
    return {"system": "ZENTRA ACTIVE"}

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    return {}

def get_global_data():
    usdtry = 30.0
    oil = 80.0
    gold = 1900.0

    try:
        with urllib.request.urlopen(
            "https://api.exchangerate.host/latest?base=USD&symbols=TRY",
            timeout=10
        ) as response:
            data = json.loads(response.read().decode("utf-8"))
            usdtry = float(data["rates"]["TRY"])
    except Exception:
        pass

    return {
        "usdtry": usdtry,
        "oil": oil,
        "gold": gold
    }

def calculate_risk(delay: float, score: float, exp: float, global_data: dict) -> float:
    risk = (delay * 1.5) + (exp * 50) + (100 - score)

    if global_data["usdtry"] > 30:
        risk += 10

    if global_data["oil"] > 85:
        risk += 10

    return max(0.0, min(100.0, risk))

def make_decision(risk: float) -> str:
    if risk < 40:
        return "Proceed"
    if risk < 70:
        return "Monitor"
    return "Restrict"

@app.get("/engine/run")
def engine_run(delay: float, score: float, exp: float):
    global_data = get_global_data()
    risk = calculate_risk(delay, score, exp, global_data)
    decision = make_decision(risk)

    return {
        "risk": round(risk, 2),
        "decision": decision,
        "global": global_data
    }
@app.get("/engine/run")
def engine_run(delay: float, score: float, exp: float):
    global_data = get_global_data()
    risk = calculate_risk(delay, score, exp, global_data)
    decision = make_decision(risk)

    return {
        "risk": round(risk, 2),
        "decision": decision,
        "global": global_data
    }
