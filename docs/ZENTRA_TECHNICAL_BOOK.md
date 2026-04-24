
---

# ZENTRA MATRIX ECOSYSTEM — TECHNICAL INFRASTRUCTURE STANDARD

## Date
2026-04-24

## Status
LOCKED

## Architecture Rule
The full ZENTRA Matrix Ecosystem will follow a Vercel + Neon operating pattern.

This decision applies beyond ZDB-013.

It is the infrastructure standard for the full ZENTRA system and future ecosystem expansion.

## Layer Separation

### Vercel Layer
Used for:
- deployment
- public and private web surfaces
- API endpoints
- investor / cockpit / report interfaces
- controlled external access

### Neon Layer
Used for:
- persistent memory
- decision records
- proof records
- audit traces
- explain / confidence records
- scenario and comparison history
- system logs and future learning memory

### ZENTRA Core Logic
Used for:
- decision intelligence
- ZDB backbone
- orchestration
- simulation
- lens / telescope logic
- final aggregation
- policy and proof logic

## Portability Rule
ZENTRA Core Logic must remain independent.

If Vercel is replaced, the system can move to another deployment layer.

If Neon is replaced, the system can move to another database layer.

The intelligence layer must not depend on vendor-specific logic.

## Data Separation Rule
Core A and Core B must use separated database tables or schemas.

Suggested structure:

- core_a_decisions
- core_a_reports
- core_b_proof_cases
- core_b_proof_metrics
- core_bridge_comparisons
- audit_events
- explain_records

## Integration Rule
Core B cannot overwrite Core A.

Core B can only be merged into Core A after:

- proof quality is verified
- decision delta is measured
- loss impact is measured
- explain is stronger
- regulatory language is preserved
- living book record is completed

