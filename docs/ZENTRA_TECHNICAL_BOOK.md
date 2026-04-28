# ZENTRA TECHNICAL BOOK

## Core Engine
- intelligence.js
- portfolio-intel.js
- action.js

## Backend
- server.js
- db.js
- audit.js
- payment.js
- report.js

## Flow
request → engine → decision → audit → response

---

# TECHNICAL LOCK — FULL MODULE INVENTORY AND GAP MAP

## Current Core State

The current ZENTRA technical core includes:

- single-origin Node architecture
- backend API
- premium cockpit
- risk endpoint
- portfolio endpoint
- intelligence layer
- dual explain layer
- portfolio intelligence
- action layer
- user context logic
- JSON DB foundation
- audit / evidence log
- report endpoint
- mock payment flow
- self-repair memory

## Required Productization Template

Every module must include the following before being considered product-ready:

1. App / screen
2. Cockpit
3. Assistant
4. Report
5. Audit / evidence
6. Pricing / license
7. Market package

## Module Gap Map

### Risk Intelligence
Working core exists. Missing:
- dedicated assistant
- pricing
- market packaging

### Portfolio Intelligence
Working core exists. Missing:
- deeper assistant
- portfolio-level evidence
- pricing
- market packaging

### Financial Trade Intelligence
Started and partially working. Missing:
- full cockpit
- assistant
- pricing
- market packaging

### Credit Intelligence
Credit stress core exists. Missing:
- app
- cockpit
- assistant
- pricing
- market packaging

### Invoice / Receivables
Bridge exists. Missing:
- cockpit
- assistant
- sales package

### Alternative Finance / Tasarruf
Decomposition exists. Missing:
- app
- assistant
- cockpit
- market package

### Trade / Banking / Contract / Compliance / Fraud / Treasury / Collateral / Insurance / Logistics / ERP / Cyber Cloud
Planned or decomposed. Missing:
- app
- cockpit
- assistant
- report
- audit
- pricing
- market package

### Academia
System exists. Missing:
- productization
- research assistant
- market package

### General AI
Not started. Must be treated as a separate product universe after current ZENTRA Intel/Core completion path.

## Core System Gaps

- role system
- admin panel
- assistant binding
- module-level plan gates
- product registry
- proof pack generator
- launch surface alignment

## Technical Rule

A module is not complete because its name exists. A module is complete only when code, cockpit, assistant, report, audit, license and market packaging are aligned.


---

# REPO STRUCTURE — TECH LOCK

## Status
LOCKED

## Canonical Runtime Folders
- api
- core
- lib
- app
- public
- data
- docs

## Canonical Books
- docs/ZENTRA_MAIN_BOOK.md
- docs/ZENTRA_TECHNICAL_BOOK.md
- docs/books/living/ZENTRA_LIVING_BOOK.md

## Vercel Function Limit
Before adding any new API file:
find api -type f -name "*.js" | wc -l

## Cleanup Rule
Backup, temp, logs, pycache and duplicate root living book files are not active system files.

---

# API FUNCTION LIMIT — TECH LOCK

## Status
LOCKED

## Active Endpoint Strategy
ZENTRA does not grow by adding uncontrolled Vercel serverless functions.

## Active Runtime Expansion
- Existing send-report pipeline
- Existing core/server runtime
- lib modules
- core modules

## Removed
Legacy API endpoints removed from active repo.

## Check
find api -type f -name "*.js" | wc -l

---

# GITHUB CLEAN STATE — TECH LOCK

## Status
LOCKED

## Active Repositories
- zentra-core
- zentra-ui

## Removed
All legacy repositories permanently deleted.

## Rule
No parallel repository structures allowed.
System evolves inside single core architecture.

---

# TECHNICAL LOCK — MULTI-LANGUAGE ENGINE

ZENTRA multi-language foundation has been added.

## Files
- core/i18n/languages.js
- core/i18n/i18n-engine.js
- core/i18n/check-i18n.js
- data/i18n/core-copy.json

## Active Languages
TR / EN / AR

## Extended Ready Languages
ES / FR / DE / RU / CN

## Technical Rule
Every language entry must include active languages.

Missing active language = failed health check.

## Vercel Limit Note
This language engine does not add a new serverless function. It is a core/data layer addition only. Vercel Hobby 12 Serverless Function limit remains protected.

