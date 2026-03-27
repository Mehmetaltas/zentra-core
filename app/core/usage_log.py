import time
from collections import deque, defaultdict

_USAGE_EVENTS = deque(maxlen=200)
_USAGE_COUNTERS = defaultdict(int)

def log_usage(endpoint: str, client_ip: str, payload: dict, result_summary: dict):
    event = {
        "timestamp": round(time.time(), 3),
        "endpoint": endpoint,
        "client_ip": client_ip,
        "payload": payload,
        "result_summary": result_summary,
    }
    _USAGE_EVENTS.appendleft(event)
    _USAGE_COUNTERS[endpoint] += 1

def get_usage_summary():
    return {
        "total_events_stored": len(_USAGE_EVENTS),
        "endpoint_counters": dict(_USAGE_COUNTERS)
    }

def get_recent_usage(limit: int = 20):
    limit = max(1, min(limit, 100))
    return list(_USAGE_EVENTS)[:limit]
