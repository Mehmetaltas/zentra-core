# ZENTRA TECHNICAL BOOK

---

# ZENTRA MATRIX ECOSYSTEM — TECHNICAL INFRASTRUCTURE STANDARD

## Date
2026-04-24

## Status
LOCKED

## Technical Rule
The full ZENTRA Matrix Ecosystem will be aligned to the Vercel + Neon operating pattern only after the current infrastructure state is verified.

## Verification First
Before implementation, check:

- Vercel deployment status
- Existing API routes
- Existing environment variables
- Existing Neon connection
- Existing database usage
- Existing system files depending on Vercel or Neon

## Target Layer Separation

### Vercel Layer
- deployment
- web surfaces
- API endpoints
- cockpit / investor / report interfaces

### Neon Layer
- memory
- data records
- proof records
- audit records
- explain / confidence records

### ZENTRA Core Logic
- decision intelligence
- orchestration
- simulation
- lens / telescope logic
- aggregation
- policy
- proof logic

## Critical Rule
Books and system must stay equal.

No new runtime architecture is allowed before the current Vercel + Neon reality is verified.

---

# ZENTRA MATRIX ECOSYSTEM — CORE PRODUCT & MOAT (TECH LOCK)

## Status
LOCKED

## Layer Definition

ZDB-13:
Operational decision engine.

ZDB-14:
Advanced decision evaluation layer.

ZDB-15:
Proof and validation layer.

---

## Moat Components

Decision Trace:
rule → signal → explain → outcome

Proof Base:
stored validated cases

Simulation Base:
scenario testing layer

Policy Layer:
standardized output format

Data Loop:
continuous improvement

Audit Layer:
full trace logging

---

## Technical Principle

- layers are connected
- layers do not overwrite each other
- proof is generated after decision
- audit must be traceable


---

# ZENTRA MATRIX ECOSYSTEM — POST ZDB-15 TECH IMPLEMENTATION (LOCK)

## Status
LOCKED

## Rule
All additions must run on existing Vercel + Neon system.

---

## Modules

### competitor_matrix
- static + versioned dataset
- JSON-based mapping

### proof_library
- database-backed (Neon)
- stores cases and comparisons

### simulation_bank
- scenario generator
- reusable test inputs

### decision_trace
- structured trace object
- attach to every decision

### licensing_pack
- formatted outputs
- institution-ready JSON + HTML

---

## Principle

- no new engine
- no parallel system
- no core separation
- everything extends current pipeline


# ZDB-15 CHECKPOINT — FINAL LOCK

## Tarih
2026-04-24

## Durum
LOCKED

## Sistem
- tek engine
- tek endpoint (send-report)
- tek pipeline

## Özellikler
- decision
- explain
- derived metrics (DTI, payment load, limit ratio)
- trace
- proof library (DB kayıt)
- report link

## Simulation
- ayrı endpoint yok
- batch execution
- same pipeline reuse
- edge / stress test destekli

## İlke
ZENTRA genişlemez, derinleşir.

## Sonuç
ZENTRA:
- karar verir
- nasıl verdiğini gösterir
- DB’ye kaydeder
- tekrar üretilebilir
- paylaşılabilir

---

# POLICY LAYER — TECH LOCK

## Status
LOCKED

## Engine Rule
Core engine remains single.

Policy is a contextual layer inside the same send-report pipeline.

## Policy Modes
- ON
- OFF
- CONDITIONAL
- EXPERIMENTAL

## Active Rules
- payment_load > 0.5 => Reddet
- limit_ratio > 4 => Reddet

## Output
Policy result is included in:
- result.policy
- trace.policy
- proof_library trace


---

# LIVE DATA LAYER — TECH LOCK

## Status
ACTIVE - PARTIAL LIVE

## File
lib/live-data.js

## Pipeline
send-report:
input → derived → rules → policy → decision → live_context → trace → proof

## Output
- result.live_context
- trace.live_context
- proof_library.trace

## Sources
- TCMB daily FX XML
- World Bank API

## Not Connected
- BIST real-time data requires licensed market data access.

---

# ZENTRA OWN DATA LAYER — TECH LOCK

## Status
ACTIVE

## Files
- lib/zentra-own-data.js
- api/v1/send-report.js

## DB Table
zentra_own_data_records

## Output
- result.own_data
- trace.own_data
- zentra_own_data_records

## Generated Scores
- risk_indicator
- payment_stress_indicator
- limit_pressure_indicator
- reality_gap_score
- proof_score

## Constraint
No new endpoint.
No parallel engine.
Same send-report pipeline.

---

# ZENTRA DATA UNIVERSE — TECH BIRTH LOCK

## Status
ACTIVE

## Registry Files
- data/zentra-data-universe-registry.json
- docs/data-universe/ZENTRA_DATA_UNIVERSE_FULL_BIRTH.md

## Active Connected
- TCMB
- World Bank
- ZENTRA own data
- proof library
- indicator records

## Planned Sources
- TUIK
- Wikipedia
- public reports
- papers
- patents
- datasets

## Licensed / API Required
- BIST real-time data
- Bloomberg
- TradingView market data
- YouTube API
- X API
- Facebook / Instagram APIs

## Rule
No fake connection.
No parallel system.
Everything is registered before integration.

---

# LEARNING ENGINE v2 — TECH LOCK

## Status
ACTIVE

## File
lib/learning-mutation-engine.js

## Tables
- learning_policy_state
- rule_adjustments

## Runtime Policy Keys
- payment_load_threshold
- limit_ratio_threshold
- zero_income_policy

## Mode
safe_proposal_mode

## Output
- result.learning_mutation
- trace.learning_mutation

## Constraint
No uncontrolled mutation.
No blind rule update.

---

# AGENT WORKFORCE v1 — TECH LOCK

## Status
ACTIVE

## File
lib/agent-workforce-v1.js

## Tables
- agent_runtime_log
- financial_trade_registry
- financial_trade_indicators

## Output
- result.agent_workforce

## Agents
- data_collector_agent
- validator_agent
- simulator_agent
- learning_agent
- proposal_validation_agent
- execution_agent
- financial_trade_agent

## Constraint
Licensed feeds are registered as not_connected / licensed_required.
