from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
import uuid
import time

app = FastAPI(title="ZENTRA CORE SYSTEM")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mehmetaltas.github.io",
        "https://zentrarisk.com",
        "https://www.zentrarisk.com",
    ],
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
