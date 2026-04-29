#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "=== ZENTRA FULL RESET START ==="

PROJECT="zentra"
OLD="zentra-core"
DOMAIN="zentrarisk.com"

echo "=== TRY DELETE OLD VERCEL PROJECT ==="
vercel remove $OLD --yes || true

echo "=== CLEAN LOCAL VERCEL ==="
rm -rf .vercel

echo "=== CLEAN BUILD STRUCTURE ==="
rm -rf public
mkdir -p public

echo "=== COPY FINAL APP ==="
cp -R app public/app

echo "=== ROOT REDIRECT ==="
cat > public/index.html <<HTML
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=/app/index.html">
<title>ZENTRA</title>
</head>
<body>Redirecting...</body>
</html>
HTML

echo "=== IGNORE BACKEND ==="
cat > .vercelignore <<IGNORE
api_disabled
backend_disabled
*.py
__pycache__
docs
IGNORE

echo "=== COMMIT CLEAN STATE ==="
git add .
git commit -m "final system clean state" || true
git push origin main || true

echo "=== CREATE NEW VERCEL PROJECT ==="
vercel link --yes --project "$PROJECT"

echo "=== DEPLOY ==="
vercel --prod --yes

echo "=== DOMAIN BIND ==="
vercel domains add $DOMAIN || true
vercel domains add www.$DOMAIN || true

echo "=== BOOK SYSTEM SYNC ==="
mkdir -p docs/final
cat > docs/final/FINAL_SYSTEM_STATE.md <<DOC
ZENTRA FINAL STATE

- Core: locked
- Public Surface: unified
- Cockpit: live
- Report: live
- General AI: connected
- Academia: integrated
- Deployment: single project
- Domain: bound

Rule:
No fragmented systems.
Single source of truth.
DOC

git add docs/final
git commit -m "sync final system book" || true
git push origin main || true

echo "=== DONE ==="
echo "OPEN:"
echo "https://$DOMAIN/app/index.html"
echo "https://$DOMAIN/app/cockpit-v2.html"
echo "https://$DOMAIN/app/report-v3.html"
