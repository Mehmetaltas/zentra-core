#!/data/data/com.termux/files/usr/bin/bash

echo "=== ZENTRA FULL REALITY CHECK ==="
DATE=$(date +"%Y-%m-%d_%H-%M")
mkdir -p docs/reality

REPORT="docs/reality/REALITY_CHECK_$DATE.md"
: > "$REPORT"

say(){
  echo "$1"
  echo "$1" >> "$REPORT"
}

pass(){ say "✔ $1"; }
fail(){ say "❌ $1"; }
warn(){ say "⚠ $1"; }

say "# ZENTRA Reality Check — $DATE"
say ""

say "## 1) File Structure"
[ -f core/server.js ] && pass "core/server.js exists" || fail "core/server.js missing"
[ -f core/data.json ] && pass "core/data.json exists" || fail "core/data.json missing"
[ -f core/engine.js ] && pass "core/engine.js exists" || fail "core/engine.js missing"
[ -f app/zentra-commercial-core.js ] && pass "frontend commercial bridge exists" || fail "frontend commercial bridge missing"
[ -f app/account/index.html ] && pass "account page exists" || fail "account page missing"
[ -f app/index.html ] && pass "command center exists" || fail "command center missing"
say ""

say "## 2) Server Health"
HEALTH=$(curl -s http://127.0.0.1:4000/products)
if echo "$HEALTH" | grep -q "products"; then
  pass "core API responds"
else
  fail "core API not responding on 4000"
  say ""
  say "Start it with:"
  say "cd core && nohup node server.js > log.txt 2>&1 &"
fi
say ""

say "## 3) Login Test"
EMAIL="reality_$DATE@zentra.local"
LOGIN=$(curl -s -X POST http://127.0.0.1:4000/login \
-H "Content-Type: application/json" \
-d "{\"email\":\"$EMAIL\",\"name\":\"Reality Test\"}")

if echo "$LOGIN" | grep -q '"ok":true'; then
  pass "login/create user works"
else
  fail "login/create user failed"
fi

TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null)
USER_ID=$(echo "$LOGIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('user',{}).get('id',''))" 2>/dev/null)

[ -n "$TOKEN" ] && pass "token generated" || fail "token missing"
[ -n "$USER_ID" ] && pass "user_id generated" || fail "user_id missing"

# Reality test user must be upgraded to Expert so product actions test the real action flow, not free-plan blocking.
curl -s -X POST http://127.0.0.1:4000/admin/activate-plan \
-H "Content-Type: application/json" \
-d "{\"email\":\"$EMAIL\",\"plan\":\"expert\",\"admin_key\":\"ZENTRA_ADMIN_LOCAL\"}" >/dev/null

say ""

say "## 4) Workspace Test"
WORKSPACE=$(curl -s http://127.0.0.1:4000/workspace -H "Authorization: Bearer $TOKEN")
if echo "$WORKSPACE" | grep -q '"ok":true'; then
  pass "workspace works"
else
  fail "workspace failed"
fi
say ""

say "## 5) Payment Request Test"
PAY=$(curl -s -X POST http://127.0.0.1:4000/payment/request \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{"plan":"core"}')

if echo "$PAY" | grep -q '"pending_manual_payment"'; then
  pass "payment request / subscription pending works"
else
  fail "payment request failed"
fi
say ""

say "## 6) Product Action Tests"
for PRODUCT in risk trade credit portfolio contract sme; do
  ACTION=$(curl -s -X POST http://127.0.0.1:4000/action \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"product\":\"$PRODUCT\",\"type\":\"$PRODUCT\",\"input\":{\"asset\":\"THY\",\"case\":\"reality-check\"}}")

  if echo "$ACTION" | grep -q '"ok":true'; then
    pass "$PRODUCT action works"
  elif echo "$ACTION" | grep -q "plan_required"; then
    warn "$PRODUCT blocked by plan gate"
  else
    fail "$PRODUCT action failed"
  fi
done
say ""

say "## 7) History Test"
HISTORY=$(curl -s http://127.0.0.1:4000/history/$USER_ID)
if echo "$HISTORY" | grep -q "history"; then
  pass "history endpoint works"
else
  fail "history endpoint failed"
fi
say ""

say "## 8) Frontend Binding Check"
if grep -q "ZENTRA_COMMERCIAL_CORE" app/index.html && grep -q "zentra-commercial-core.js" app/index.html; then
  pass "command center bound to commercial core"
else
  fail "command center commercial binding missing"
fi

if grep -q "ZENTRA_COMMERCIAL_CORE" app/account/index.html; then
  pass "account page bound to commercial core"
else
  fail "account page commercial binding missing"
fi
say ""

say "## 9) Git Status"
GS=$(git status --short)
if [ -z "$GS" ]; then
  pass "git clean"
else
  warn "git has changes:"
  say "$GS"
fi
say ""

say "## FINAL"
if grep -q "❌" "$REPORT"; then
  say "FINAL STATUS: FIX REQUIRED"
elif grep -q "⚠" "$REPORT"; then
  say "FINAL STATUS: WORKING WITH WARNINGS"
else
  say "FINAL STATUS: REAL CORE WORKING"
fi

echo "=== REPORT SAVED: $REPORT ==="
