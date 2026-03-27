from fastapi import
FastAPI
from app.api.routes import
router

app = FastAPI(title="ZENTRA CORE
SYSTEM")
app.include_router(router)

@app.get("/")
def root():
    return
{"system": "ZENTRA ACTIVE"}
