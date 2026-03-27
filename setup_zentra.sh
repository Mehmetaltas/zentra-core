#!/bin/bash

echo "ZENTRA FULL SETUP STARTING..."

mkdir -p app/api app/core app/models app/services app/utils config tests docs

touch app/main.py \
app/api/routes.py \
app/core/engine.py \
app/models/risk.py \
app/services/scoring.py \
app/utils/helpers.py \
config/settings.py \
README.md

cat > app/main.py << 'EOF'
from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(title="ZENTRA CORE SYSTEM")

app.include_router(router)

@app.get("/")
def root():
    return {"system": "ZENTRA ACTIVE"}
EOF

cat > app/api/routes.py << 'EOF'
from fastapi import APIRouter
from app.services.scoring import calculate_score

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.post("/score")
def score(data: dict):
    return calculate_score(data)
EOF

cat > app/services/scoring.py << 'EOF'
def calculate_score(data):
    delay = data.get("payment_delay_days", 0)

    #!/bin/bash

echo "ZENTRA FULL SETUP STARTING..."

mkdir -p app/api app/core app/models app/services app/utils config tests docs

touch app/main.py \
app/api/routes.py \
app/core/engine.py \
app/models/risk.py \
app/services/scoring.py \
app/utils/helpers.py \
config/settings.py \
README.md

cat > app/main.py << 'EOF'
from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(title="ZENTRA CORE SYSTEM")

app.include_router(router)

@app.get("/")
def root():
    return {"system": "ZENTRA ACTIVE"}
EOF

cat > app/api/routes.py << 'EOF'
from fastapi import APIRouter
from app.services.scoring import calculate_score

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.post("/score")
def score(data: dict):
    return calculate_score(data)
EOF

cat > app/services/scoring.py << 'EOF'
def calculate_score(data):
    delay = data.get("payment_delay_days", 0)

    score = max(0, 100 - delay)

    return {
        "risk_score": score,
        "risk_band": "HIGH" if score < 40 else "MID" if score < 70 else "LOW",
        "flags": ["delay"] if delay > 10 else [],
        "model": "zentra_v1"
    }
EOF

echo "# ZENTRA CORE SYSTEM" > README.md

echo "SETUP COMPLETE"
+
