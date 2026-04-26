# ZENTRA Living Book — Self-Repair Memory

## Locked Decision

ZENTRA must maintain a living repair memory.

Every failure becomes structured knowledge:

- symptom
- fault class
- root cause
- safe fix
- verification
- log
- future prevention

## Known Fault Classes

### 1. Runtime Faults
Examples:
- server closed
- port conflict
- process stuck

Repair:
- inspect process
- kill stale process
- restart controlled service

### 2. Network / CORS / Origin Faults
Examples:
- Failed to fetch
- curl works but browser fails
- localhost / 127.0.0.1 mismatch

Repair:
- prefer single-origin architecture
- serve frontend and API from same Node server
- add CORS headers only when needed

### 3. API Faults
Examples:
- endpoint missing
- JSON invalid
- source fallback

Repair:
- test endpoint
- validate response schema
- use backend proxy
- never output zero data without source label

### 4. Frontend Faults
Examples:
- blank screen
- login stuck
- old version visible
- event binding broken

Repair:
- JS syntax check
- version grep
- cache bust
- restore last stable cockpit

### 5. Auth / Plan Faults
Examples:
- login fails
- plan wrong
- token missing
- admin appears as free

Repair:
- test login endpoint
- validate token
- plan must come from backend
- never trust frontend-only plan

### 6. Data Faults
Examples:
- BTC/ETH zero
- all assets same
- source fallback
- external API blocked

Repair:
- asset-aware backend
- fallback values must be non-zero
- source must show backend/live/fallback
- symbol parameter must be verified

### 7. Portfolio Faults
Examples:
- weight total not 100
- portfolio risk wrong

Repair:
- normalize total weight
- calculate weighted total risk

### 8. Decision Faults
Examples:
- decision always same
- risk and decision mismatch

Repair:
- decision must use risk + trend + context
- explain layer must show reason

### 9. Git / Version Faults
Examples:
- wrong file served
- untracked backup files
- commit missing

Repair:
- git status
- version grep
- commit stable state
- remove junk backups

## Permanent Rule

ZENTRA does not merely report faults.
ZENTRA diagnoses, repairs safely, verifies the repair, logs the case, and learns from it.

