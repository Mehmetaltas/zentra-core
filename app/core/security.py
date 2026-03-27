from fastapi import Header, HTTPException
from app.core.config import get_founder_key

def verify_founder_key(x_api_key: str = Header(default="")):
    expected = get_founder_key()

    if not x_api_key or x_api_key != expected:
        raise HTTPException(status_code=401, detail="Unauthorized founder access")

    return True
