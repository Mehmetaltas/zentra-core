# ZENTRA SYSTEM MASTER BOOK
## Final Clean System
## Living Technical Book / Yaşayan Teknik Kitap

---

# 1) SYSTEM IDENTITY

System Name: ZENTRA Matrix Ecosystem  
Layer Focus: ZENTRA Intel AI  
Type: Behavioral Financial Infrastructure  
Current Stage: Country-Aware Live Market Connected Cockpit + Report Layer

---

# 2) CURRENT SYSTEM STATE (LOCKED)

Status: LIVE CONNECTED / COUNTRY-AWARE / AUTO-RUNNING / REPORT-ENABLED  
Environment: Vercel  
Frontend: Root Entry + Premium Cockpit UI  
Backend: Vercel Functions  
External Data: Active  
Connection State: LIVE VERIFIED  
Rendering Model: Stabilized  
Decision Layer: Active  
Report Layer: Active

---

# 3) CORE ARCHITECTURE

## 3.1 Root Entry
- `index.html` = root system entry
- shell + router + state + cockpit birleşik yapı
- auto-live başlatma aktif
- single source render mantığı korunur

## 3.2 State Layer
- input / output / connection / ui state tutulur
- selected country state taşınır
- cockpit yeniden render akışı korunur
- live / loading / fallback state görünürlüğü korunur

## 3.3 Router Layer
- cockpit / report / modules aktif
- route state shell içinde yönetilir
- legacy “coming page” render mantığı kaldırılmıştır
- router stabilize edilmiştir

## 3.4 Cockpit Layer
Current cockpit includes:
- premium dark cockpit surface
- hero summary
- operator summary
- country chips
- market context card
- FX snapshot
- localized response
- TR / EN / AR active
- decision-aligned strategy text

## 3.5 Report Layer
Current report layer:
- cockpit output’tan canlı rapor üretir
- route üzerinden açılır
- satılabilir metin iskeleti oluşturur
- country / market / decision / rationale içerir

## 3.6 Backend Layer
Primary decision endpoint:
`/api/v1/credit-stress`

Market data endpoint:
`/api/v1/market-context?country=...`

---

# 4) EXTERNAL DATA STATUS

## 4.1 External Source
Source: Frankfurter API

Currently used live:
- USD/TRY
- EUR/USD
- USD/AED
- USD/SAR
- GBP/USD

## 4.2 Meaning
System no longer works on static internal-only scoring.

System now:
- fetches live external FX context
- reads selected country
- derives macro pressure
- derives FX adjustment
- injects live context into credit stress decision logic

---

# 5) COUNTRY-AWARE MODEL

Supported countries:
- TR
- EU
- UK
- AE
- SA
- US

Country now actively changes:
- external market fetch
- macro pressure
- fx adjustment
- final risk score
- final stress score
- final decision regime

Country is not decorative UI text anymore.  
Country is a live decision variable.

---

# 6) LIVE DECISION FLOW (LOCKED)

1. Page loads
2. Auto-live triggers
3. Selected country is read
4. `/api/v1/market-context?country=...` is called
5. Live FX context is received
6. Macro pressure + FX adjustment derived
7. `/api/v1/credit-stress` computes final score using:
   - delay penalty
   - customer penalty
   - exposure penalty
   - sector penalty
   - fx adjustment
   - macro penalty
8. Final output is rendered in cockpit
9. Report route can convert output into structured report
10. Connection state becomes LIVE

---

# 7) DECISION-STRATEGY ALIGNMENT STATUS

This checkpoint includes decision-strategy alignment.

Meaning:
- approve → proceed strategy
- monitor → controlled caution strategy
- reject → do not proceed / reduce exposure / reject strategy

This removed a major trust gap.

System no longer shows a reject decision with a proceed-style strategy.

---

# 8) VERIFIED LIVE EXAMPLE

Verified current live example (TR):

- Country: TR
- USD/TRY: 44.853
- EUR/USD: 1.1768
- Macro Pressure: high
- FX Adjustment: 18
- Macro Penalty: 12
- Risk Score: 36.9
- Stress Score: 47.4
- Decision: reject
- Regime: fragile
- Strategy: reject-aligned
- Connection: live

Meaning:
The system materially changes the final decision using external market pressure.

This is a major architectural threshold.

---

# 9) REPORT STATUS

## 9.1 Current Report Capability
System now produces:
- country-aware report text
- market-aware report text
- decision-aware report text
- rationale-aware report text

## 9.2 Meaning
The system is no longer only a cockpit.

It can now also output:
- structured operator-facing report
- investor / partner / mail-ready narrative base
- sales-convertible analysis layer

## 9.3 Limitation
Current report layer is text surface, not yet:
- PDF export
- share flow
- email packaging
- branded client export

But report generation itself is now active.

---

# 10) UI STATUS

## 10.1 Current UI Identity
Current cockpit UI is:
- dark premium
- mobile safer
- country chip based
- no white exploding native country selector
- stronger information hierarchy
- stabilized route rendering

## 10.2 Key Surfaces
- Hero Summary
- Live Input
- Operator Summary
- Market Context
- FX Snapshot
- Localized Response
- Report Page
- Modules Page

## 10.3 Language Status
TR / EN / AR are active.  
Decision, macro, regime, strategy, rationale and localized response are largely aligned.

---

# 11) FALLBACK STATUS

Fallback still exists, but only as:
- safety layer
- request failure protection
- startup protection if live fetch fails

Fallback is not the main operating model anymore.

Main operating model is:
LIVE AUTO-RUN + EXTERNAL MARKET CONNECTED + REPORT-ENABLED

---

# 12) WHAT IS NOW TRUE

ZENTRA is no longer:

❌ static UI  
❌ internal-only calculator  
❌ mock dashboard  
❌ passive form surface  
❌ strategy-misaligned output  

ZENTRA is now:

✅ live connected decision engine  
✅ country-aware market-sensitive cockpit  
✅ external-data-informed risk surface  
✅ decision-strategy-aligned operator layer  
✅ report-enabled economic intelligence surface  

---

# 13) OPEN ITEMS

## Product / Quality
- report export (PDF / share / mail-ready)
- richer report formatting
- multi-country deeper non-FX effect
- deeper multilingual closure on minor labels
- visual market driver charting

## Technical
- external fetch retry / timeout control
- observability layer
- developer raw toggle if needed
- additional external data sources beyond FX
- country premium / non-FX macro influence expansion

---

# 14) NEXT CORRECT BLOCKS

1. Report export layer  
2. Multi-country deeper effect beyond FX  
3. Country premium layer  
4. Additional external market inputs  
5. Modules expansion  
6. Book + report synchronization  

---

# 15) LOCKED CONCLUSION

As of this checkpoint, ZENTRA Final Clean System has crossed into:

**Country-Aware Live Market Connected Cockpit + Report Layer**

This means:
- live external data is active
- country selection changes decision context
- macro and FX environment affect final score
- cockpit loads automatically and renders live state
- strategy is aligned with final decision
- report surface is active
- system behaves like a real operator-facing economic decision surface

This is not a demo checkpoint.

This is a real product-core checkpoint in the new ZENTRA line.


---

# ZENTRA MASTER BOOK UPDATE
## Date: 2026-04-22
## Sync Block: Core Closure Alignment + Investor Runtime + Book 3 Recovery

## 1. Strategic Lock
- ZENTRA is not demo-first.
- ZENTRA is not pilot-first.
- ZENTRA is built as a full launch-ready system.
- The core is accepted as completed and locked.
- Current work is full-system completion, hardening and implementation on top of the locked core.

## 2. Three-Book Discipline
- Book 1: main/simple book
- Book 2: technical master book
- Book 3: living technical book with dated trace
- Book 3 had lagged behind and was restored through ZENTRA_LIVE_LOG.md
- From now on: no major closure without book trace + runtime trace

## 3. System Structure
Top umbrella:
- ZENTRA Holding / ZENTRA Matrix Ecosystem

Distinct product/business families:
- ZENTRA Intel AI
- ZENTRA General AI
- ZENTRA Academia AI

Principle:
- separate where needed
- consolidate where required
- no uncontrolled system mixing

## 4. Finance & Accounting Reading
Accepted structure:
- real accounting-program discipline preserved
- Netsis-style accounting reference preserved
- daily cash / open record / delayed processing logic preserved
- holding-level consolidated visibility
- unit-level separation
- shared vs direct distinction
- plasiyer/sales support treated as support logic, not product ownership

Current operational simplification:
- each transaction goes to one primary unit
- forced allocation is avoided
- clarity is preferred over fake precision

## 5. Governance / Audit / Evidence
Accepted as required system hardening:
- audit trace
- evidence-linked logic
- edit/change trace
- no critical silent modification
- governance is a core system rule, not cosmetic layer

## 6. Cockpit / Workspace / UX
Accepted structure:
- core remains closed
- cockpit is controlled visible surface
- user sees outputs, not raw core internals
- onboarding / empty state / loading / error / next-step logic accepted
- TR / EN / AR remain mandatory

## 7. Data Flow / Integration
Accepted flow:
- source -> intake -> processing -> storage -> output -> cockpit
- internal/manual + external/system-fed data together
- semi-automatic interpretation
- open record discipline preserved

## 8. AI Workforce / Agent System
Accepted:
- orchestrator logic
- event -> task -> output flow
- finance, risk/intel, governance, publishing and support agents
- task-based operating structure

## 9. Agent Cards
The following cards were defined as active operational map:
- System Orchestrator Agent
- Finance Agent
- Sales / Plasiyer Agent
- Content / Publishing Agent
- Response Agent
- Risk / Intel Agent
- Governance / Audit Agent
- Market Watch Agent
- Copyright / IP Agent
- Product Agent
- Pricing Agent
- UX / Workspace Agent
- Portfolio / Cross-Lens Agent

## 10. Response Rules
Locked language/behavior principles:
- TR / EN / AR mandatory
- internal / professional / public / investor mode distinction
- no hype
- no fake certainty
- no uncontrolled claims
- short / medium / deep answer structure

## 11. Product + Pricing Framework
Accepted product architecture:
- Intel AI = enterprise / institutional
- General AI = broader subscription/use layer
- Academia AI = research / knowledge / education layer

Accepted pricing reading:
- Intel = custom / enterprise / license logic
- General = subscription logic
- Academia = report / package / education logic

## 12. Publishing System
Accepted as controlled distribution layer:
- LinkedIn / Instagram / X structure
- content production flow
- review / publish / response logic
- system voice, not random posting

## 13. IP / Copyright / Market Watch
Accepted:
- content protection
- source tracking
- market watch
- brand protection
- ZENTRA publishes and monitors/protects

## 14. Cross-Lens / Portfolio (Step 32)
Accepted as upper intelligence layer:
- multiple lenses together
- merged portfolio output
- conflict handling across lenses
- unified decision output

## 15. Moat Framework
Moat is a mandatory planning heading.

Accepted moat components:
- system moat
- execution moat
- trust moat
- control moat
- security moat
- distribution moat

Principle:
- moat is not a single feature
- moat comes from integrated system architecture and discipline

## 16. Cloud / Cyber / Security / Safeguard
Recognized as required hardening block.
This area must remain attached to main-system closure and cannot be forgotten.

Accepted reading:
- cloud discipline
- cyber/security control
- access boundaries
- misuse/abuse prevention
- safeguard posture

## 17. Investor Runtime Implementation
Actual implementation completed in repo/runtime:

Completed:
- investor/index.html created
- premium investor v2 page written
- multi-language structure included
- premium dashboard-feel UI included
- moat / products / proof / architecture sections included
- investor.html created at root
- route corrected to /investor.html
- main index investor entry button added
- contact field corrected to contact@zentrarisk.com
- wording fixes applied for live-status interpretation

Confirmed live investor route:
- /investor.html

## 18. Mail Plan (Planned, not fully activated)
Planned structure:
- contact@zentrarisk.com
- invest@zentrarisk.com
- partners@zentrarisk.com

Trigger phrase:
- "mail aç"

## 19. Book Alignment Status
This update aligns:
- main book
- living technical book
- recent runtime implementation

Current position:
- core locked
- major main-book system blocks closed
- investor runtime surface implemented
- Book 3 restored through ZENTRA_LIVE_LOG.md

## 20. Rule Going Forward
From this point:
- no major closure without master-book trace
- no major runtime work without live-log trace
- no drift between discussion, book and implementation

## Snapshot
- MASTER-BOOK-SYNC-2026-04-22
- Status: ACTIVE

