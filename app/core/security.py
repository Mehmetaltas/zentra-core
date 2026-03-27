from fastapi import Header, HTTPException, Query
from app.core.config import get_founder_key

def verify_founder_key(
    x_api_key: str = Header(default=""),
    api_key: str = Query(default="")
):
    expected = get_founder_key()

    key = x_api_key or api_key

    if not key or key != expected:
        raise HTTPException(status_code=401, detail="Unauthorized founder access")

    return True
