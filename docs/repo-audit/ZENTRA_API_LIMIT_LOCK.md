# ZENTRA API LIMIT LOCK

## Status
LOCKED

## Rule
Vercel Hobby function limit must not be exceeded.

## Active API Functions
Only active runtime endpoints remain under api/.

## Current Active API Target
- api/health.js
- api/v1/send-report.js
- api/v1/report/view.js
- api/v1/credit-stress.js

## Removed Legacy API Groups
- document-intelligence
- document-rules
- knowledge-base
- market-context
- rule-registry
- source-registry

## Future Rule
New ZENTRA features must not create new API files by default.

New features go into:
- lib/
- core/
- existing send-report pipeline
- existing core/server runtime

Only if absolutely required, API function count is checked first:

find api -type f -name "*.js" | wc -l
