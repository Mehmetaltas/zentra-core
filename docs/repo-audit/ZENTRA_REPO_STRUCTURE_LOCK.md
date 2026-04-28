# ZENTRA REPO STRUCTURE LOCK

## Status
LOCKED

## Vercel Limit Rule
Vercel Hobby deployment has a strict Serverless Function limit.
Before adding any new file under api/, function count must be checked.

Command:
find api -type f -name "*.js" | wc -l

## Canonical Books
- docs/ZENTRA_MAIN_BOOK.md
- docs/ZENTRA_TECHNICAL_BOOK.md
- docs/books/living/ZENTRA_LIVING_BOOK.md

## Legacy Archive
- archive/legacy-books/ZENTRA_LIVING_BOOK.root.legacy.md

The archive is reference only.
It is not an active system book.

## Active Runtime
- api/
- core/
- lib/
- app/
- public/

## Active Data
- data/

## Rule
Only active runtime, active books, active registry files and controlled archive remain.

No backup files.
No temp files.
No logs.
No duplicate root living book.
No uncontrolled api function growth.
