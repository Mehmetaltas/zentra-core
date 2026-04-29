#!/data/data/com.termux/files/usr/bin/bash

cd /data/data/com.termux/files/home/ZENTRA_MASTER/zentra-final || exit 1

LOG="logs/zentra-experience-audit.log"
: > "$LOG"

say(){ echo "$1" | tee -a "$LOG"; }
fail(){ echo "FAIL: $1" | tee -a "$LOG"; }
pass(){ echo "PASS: $1" | tee -a "$LOG"; }

say "=== ZENTRA FULL EXPERIENCE AUDIT ==="
say "$(date)"
say ""

PAGES="
app/index.html
app/matrix.html
app/intel/index.html
app/market/index.html
app/general-ai.html
app/academia/index.html
app/investor-demo.html
"

say "1) Assistant presence"
for f in $PAGES; do
  grep -Eqi "assistant|guidance|WHY|ACTION|WARNING|yönlendirme|rehber" "$f" && pass "$f assistant/guidance" || fail "$f missing assistant/guidance"
done

say ""
say "2) Multilingual presence"
for f in $PAGES; do
  grep -Eqi "TR|EN|AR" "$f" && pass "$f language marker" || fail "$f missing TR/EN/AR"
done

say ""
say "3) Visual / indicator presence"
for f in app/index.html app/matrix.html app/intel/index.html app/market/index.html app/cockpits/*.html; do
  grep -Eqi "bars|chart|indicator|signal|grafik|indikatör|Signal|Pressure" "$f" && pass "$f visual signal" || fail "$f missing visual/indicator layer"
done

say ""
say "4) Module completeness"
for m in risk trade financial-trade credit alternative-finance contract compliance fraud treasury; do
  [ -f "app/modules/$m.html" ] && pass "module $m page" || fail "missing module $m page"
  [ -f "app/cockpits/$m.html" ] && pass "module $m cockpit" || fail "missing module $m cockpit"
  [ -f "app/reports/$m.html" ] && pass "module $m report" || fail "missing module $m report"
done

say ""
say "5) Product description completeness"
for f in app/modules/*.html; do
  grep -Eqi "Cockpit|Report|Market|ürün|çıktı|kim|kapsam|risk|karar|rapor" "$f" && pass "$f product explanation" || fail "$f weak product explanation"
done

say ""
say "6) Market discipline"
grep -Eqi "Core|Governance|Self-Healing|development engine|internal" app/market/index.html && fail "market includes internal/non-sellable layer" || pass "market sellable-only discipline"

say ""
say "7) Public forbidden language"
grep -Rni "söküm\|rakip\|kopyalama\|zentrasız" app public 2>/dev/null && fail "forbidden public language found" || pass "public language clean"

say ""
if grep -q "FAIL:" "$LOG"; then
  say "ZENTRA EXPERIENCE AUDIT RESULT: FIX REQUIRED"
else
  say "ZENTRA EXPERIENCE AUDIT RESULT: CLEAN"
fi
