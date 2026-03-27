from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(title="ZENTRA CORE SYSTEM")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mehmetaltas.github.io",
        "https://mehmetaltas.github.io/zentra-v2",
        "https://zentrarisk.com",
        "https://www.zentrarisk.com",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {"system": "ZENTRA ACTIVE"}

