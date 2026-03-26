from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(title="ZENTRA CORE")

app.include_router(router)

@app.get("/")
def root():
    return {"system": "ZENTRA CORE ACTIVE"}
