# ZENTRA SYSTEM MASTER BOOK
## Final Clean System
## Living Technical Book / Yaşayan Teknik Kitap

---

# 1) SYSTEM IDENTITY

System Name: ZENTRA Matrix Ecosystem  
Layer Focus: ZENTRA Intel AI  
Type: Behavioral Financial Infrastructure  
Current Stage: Country-Aware Live Market Connected Cockpit

---

# 2) CURRENT SYSTEM STATE (LOCKED)

Status: LIVE CONNECTED / COUNTRY-AWARE / AUTO-RUNNING  
Environment: Vercel  
Frontend: Root Entry + Premium Cockpit UI  
Backend: Vercel Functions  
External Data: Active  
Connection State: LIVE VERIFIED

---

# 3) CORE ARCHITECTURE

## 3.1 Root Entry
- `index.html` = root system entry
- shell + router + state + cockpit birleşik
- auto-live başlatma aktif

## 3.2 State Layer
- input / output / connection / ui state tutulur
- selected country state taşınır
- cockpit yeniden render akışı korunur

## 3.3 Router Layer
- cockpit / report / modules aktif
- root shell içinde yönlenir

## 3.4 Cockpit Layer
- premium dark cockpit surface
- hero summary
- operator summary
- country chips
- market context card
- FX snapshot
- localized raw response
- TR / EN / AR active

## 3.5 Backend Layer
Primary decision endpoint:
`/api/v1/credit-stress`

Market data endpoint:
`/api/v1/market-context?country=...`

---

# 4) EXTERNAL DATA STATUS

## 4.1 External Source
Source: Frankfurter API

Used live:
- USD/TRY
- EUR/USD
- USD/AED
- USD/SAR
- GBP/USD

## 4.2 Current Meaning
System no longer runs on static internal-only scoring.

It now:
- fetches live external FX context
- reads selected country
- derives macro pressure
- derives FX adjustment
- injects that context into the credit stress decision model

---

# 5) COUNTRY-AWARE MODEL

Supported active countries:
- TR
- EU
- UK
- AE
- SA
- US

Country is now not decorative UI text.

Country actively changes:
- external market fetch
- macro pressure
- fx adjustment
- final risk score
- final stress score
- final decision regime

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
9. Connection state becomes LIVE

---

# 7) VERIFIED LIVE EXAMPLE

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

Meaning:
The system now materially changes the final decision using external market pressure.

This is a major architectural threshold.

---

# 8) WHAT IS NOW TRUE

ZENTRA is no longer:

❌ static UI  
❌ internal-only calculator  
❌ mock dashboard  
❌ passive form surface  

ZENTRA is now:

✅ live connected decision engine  
✅ country-aware market-sensitive cockpit  
✅ external-data-informed risk surface  
✅ operator-facing economic intelligence layer  

---

# 9) UI STATUS

## 9.1 Current UI Identity
Current cockpit UI is now:
- dark premium
- mobile safer
- country chip based
- no white exploding native selector for country
- stronger information hierarchy

## 9.2 Key Surfaces
- Hero Summary
- Live Input
- Operator Summary
- Market Context
- FX Snapshot
- Localized Response

## 9.3 Language Status
TR / EN / AR are active.  
Decision, macro, regime, strategy, rationale and raw-localized output are largely localized.

---

# 10) FALLBACK STATUS

Fallback still exists, but now only as:
- safety layer
- request failure protection
- startup protection if live fetch fails

Fallback is not the main operating model anymore.

Main operating model is:
LIVE AUTO-RUN + EXTERNAL MARKET CONNECTED

---

# 11) OPEN ITEMS

## Product / Quality
- decision-strategy full alignment
- report engine
- modules page expansion
- deeper multilingual closure on all minor labels
- richer market driver visualization

## Technical
- possibly cache / retry control on external market fetch
- structured observability
- developer raw toggle if needed
- additional external data sources beyond FX

---

# 12) NEXT CORRECT BLOCKS

1. Decision-strategy alignment  
2. Report engine  
3. Book + report synchronization  
4. Additional live external data layers  
5. Modules expansion  

---

# 13) LOCKED CONCLUSION

As of this checkpoint, ZENTRA Final Clean System has crossed into:

**Country-Aware Live Market Connected Cockpit**

This means:
- live external data is active
- country selection changes decision context
- macro and FX environment affect final score
- cockpit loads automatically and renders live state
- system behaves like a real operator-facing economic decision surface

This is a major birth checkpoint of the new ZENTRA line.

