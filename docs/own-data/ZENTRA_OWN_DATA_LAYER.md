# ZENTRA OWN DATA LAYER

## Status
ACTIVE

## Purpose
ZENTRA does not only consume external data.

ZENTRA now generates its own decision data from every run.

## Generated Data
- automatic scenario type
- risk indicator
- payment stress indicator
- limit pressure indicator
- reality gap score
- proof score
- synthetic tags
- data loop signal

## Database
Table:
zentra_own_data_records

## Pipeline
send-report:
input
→ derived
→ rules
→ policy
→ live context
→ own data
→ trace
→ proof
→ DB record

## Rule
No new endpoint.
No parallel system.
Own data is generated inside the existing pipeline.

## Result
ZENTRA starts building its own internal evidence and learning dataset.
