#!/data/data/com.termux/files/usr/bin/bash
set -e

PROJECT="zentra-live-system"
DOMAIN="zentrarisk.com"
WWW="www.zentrarisk.com"

echo "=== ZENTRA CLEAN LIVE DEPLOY START ==="

mkdir -p public
rm -rf public/app
cp -R app public/app

cat > public/index.html <<'HTML'
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=/app/index.html">
<title>ZENTRA</title>
</head>
<body>Redirecting to ZENTRA...</body>
</html>
HTML

cat > .vercelignore <<'IGNORE'
api_disabled
backend_disabled
docs
tools
logs
*.py
__pycache__
IGNORE

git add public .vercelignore
git commit -m "prepare zentra live static public" || true
git push origin main || true

echo "=== CHECK VERCEL CLI ==="
command -v vercel >/dev/null 2>&1 || npm i -g vercel@latest

echo "=== CLEAN OLD LOCAL VERCEL LINK ==="
rm -rf .vercel

echo "=== LINK CLEAN PROJECT ==="
vercel link --yes --project "$PROJECT"

echo "=== TRY PULL ENV FROM VERCEL ==="
vercel env pull .env.local --yes || true

echo "=== DEPLOY PRODUCTION ==="
DEPLOY_URL=$(vercel --prod --yes 2>&1 | tee logs/vercel-live-deploy.log | grep -Eo 'https://[^ ]+\.vercel\.app' | tail -1 || true)

echo "=== ADD DOMAINS ==="
vercel domains add "$DOMAIN" "$PROJECT" || true
vercel domains add "$WWW" "$PROJECT" || true

echo "=== DONE ==="
echo "Preview/Production URL:"
echo "$DEPLOY_URL"
echo ""
echo "Check:"
echo "https://$DOMAIN/app/index.html"
echo "https://$DOMAIN/app/cockpit-v2.html"
echo "https://$DOMAIN/app/report-v3.html"
echo ""
echo "If domain add says already assigned, remove domain from old Vercel project once, then rerun this script."
