# ZENTRA TECHNICAL BOOK

---

# ZENTRA MATRIX ECOSYSTEM — TECHNICAL INFRASTRUCTURE STANDARD

## Date
2026-04-24

## Status
LOCKED

## Architecture Rule
Full ZENTRA Matrix Ecosystem uses the Vercel + Neon operating pattern.

## Layer Separation

### Vercel Layer
Used for:
- deployment
- web surfaces
- API endpoints
- cockpit / investor / report interfaces

### Neon Layer
Used for:
- memory
- data records
- proof records
- audit records
- explain / confidence records

### ZENTRA Core Logic
Used for:
- decision intelligence
- orchestration
- simulation
- lens / telescope logic
- aggregation
- policy
- proof logic

## Portability Rule
ZENTRA Core Logic must remain independent.

If Vercel is replaced, the system can move to another deployment layer.

If Neon is replaced, the system can move to another database layer.

## Decision Layer
Core A and Core B exist inside the same Decision Layer.

- Core A: existing operational decision line
- Core B: ZDB proof decision line

They run side by side for testing.

## Critical Rule
Core B will NOT replace Core A until testing is completed.

No merge.
No production switch.
No architecture change before proof.
