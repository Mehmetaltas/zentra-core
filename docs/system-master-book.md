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

