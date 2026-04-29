#!/data/data/com.termux/files/usr/bin/bash

cd /data/data/com.termux/files/home/ZENTRA_MASTER/zentra-final || exit 1

LOG="logs/zentra-full-audit.log"
: > "$LOG"

say(){ echo "$1" | tee -a "$LOG"; }
fail(){ echo "FAIL: $1" | tee -a "$LOG"; }
pass(){ echo "PASS: $1" | tee -a "$LOG"; }

say "=== ZENTRA FULL SYSTEM AUDIT ==="
say "$(date)"
say ""

say "1) Required public files"
for f in \
app/index.html \
app/matrix.html \
app/intel/index.html \
app/market/index.html \
app/general-ai.html \
app/academia/index.html \
app/investor-demo.html \
app/premium-surface.css \
app/zui.css
do
  [ -f "$f" ] && pass "$f" || fail "missing $f"
done

say ""
say "2) Required modules"
for m in risk trade financial-trade credit alternative-finance
do
  [ -f "app/modules/$m.html" ] && pass "module $m" || fail "missing module $m"
  [ -f "app/cockpits/$m.html" ] && pass "cockpit $m" || fail "missing cockpit $m"
  [ -f "app/reports/$m.html" ] && pass "report $m" || fail "missing report $m"
done

say ""
say "3) CSS path check"
grep -R 'href="/app/' app/*.html app/*/*.html 2>/dev/null && fail "absolute /app css/link paths found" || pass "no problematic absolute paths found in nested public pages"

say ""
say "4) Forbidden public language"
grep -Rni "söküm\|rakip\|kopyala\|kopyalama\|zentrasız" app public 2>/dev/null && fail "forbidden public language found" || pass "public language clean"

say ""
say "5) Market overreach check"
grep -Rni "Academia AI\|General AI\|Governance\|Self-Healing\|Core" app/market 2>/dev/null && fail "market may include non-sellable/internal layers" || pass "market limited to sellable packs"

say ""
say "6) Broken local links basic scan"
python3 - <<'PY' | tee -a "$LOG"
from pathlib import Path
import re

root = Path("app")
bad = []
for p in root.rglob("*.html"):
    txt = p.read_text(errors="ignore")
    for href in re.findall(r'href="([^"]+)"', txt):
        if href.startswith(("http", "mailto:", "#")):
            continue
        if href.startswith("/app/"):
            target = Path("app") / href[len("/app/"):]
        else:
            target = (p.parent / href).resolve()
            try:
                target = target.relative_to(Path.cwd())
            except Exception:
                continue
        if not target.exists():
            bad.append((str(p), href, str(target)))
if bad:
    print("FAIL: broken links")
    for item in bad:
        print("  ", item)
else:
    print("PASS: no broken local links")
PY

say ""
say "7) Git status"
git status --short | tee -a "$LOG"

say ""
if grep -q "FAIL:" "$LOG"; then
  say "ZENTRA AUDIT RESULT: FIX REQUIRED"
else
  say "ZENTRA AUDIT RESULT: CLEAN"
fi
