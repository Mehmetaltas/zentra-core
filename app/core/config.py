import os

def get_founder_key() -> str:
    return os.getenv("ZENTRA_FOUNDER_KEY", "changeme-founder-key")

def get_public_routes():
    return [
        "/",
        "/health",
        "/version",
        "/score",
        "/stress",
        "/docs",
        "/openapi.json"
    ]

def get_protected_routes():
    return [
        "/founder/status",
        "/founder/config",
        "/founder/healthcheck"
    ]

def get_rate_limit_per_minute() -> int:
    raw = os.getenv("ZENTRA_RATE_LIMIT_PER_MINUTE", "60")
    try:
        return int(raw)
    except Exception:
        return 60
