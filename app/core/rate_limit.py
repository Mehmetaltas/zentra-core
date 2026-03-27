import time
from collections import defaultdict, deque
from fastapi import Request, HTTPException
from app.core.config import get_rate_limit_per_minute

_REQUEST_LOG = defaultdict(deque)

def check_rate_limit(request: Request):
    limit = get_rate_limit_per_minute()

    forwarded = request.headers.get("x-forwarded-for", "")
    client_ip = forwarded.split(",")[0].strip() if forwarded else "unknown"

    now = time.time()
    window_start = now - 60

    q = _REQUEST_LOG[client_ip]

    while q and q[0] < window_start:
        q.popleft()

    if len(q) >= limit:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    q.append(now)

    return {
        "client_ip": client_ip,
        "request_count_last_minute": len(q),
        "limit_per_minute": limit
    }
