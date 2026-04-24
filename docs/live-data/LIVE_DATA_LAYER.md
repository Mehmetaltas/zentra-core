# ZENTRA LIVE DATA LAYER

## Status
ACTIVE - PARTIAL LIVE

## Connected Sources

### TCMB Daily FX
Status: Connected  
Use: USD / EUR / GBP daily reference context  
Access: public XML  

### World Bank Macro API
Status: Connected  
Use:
- GDP growth
- CPI inflation
- unemployment

### BIST / Market Data
Status: Not connected  
Reason:
Real-time and official BIST market data requires licensed data access.

## Integration Rule
No new endpoint.

Live data is attached to the existing send-report pipeline as:

- result.live_context
- trace.live_context
- proof_library.trace

## Principle
ZENTRA does not create a parallel data system.

Live data enters the same decision / trace / proof pipeline.
