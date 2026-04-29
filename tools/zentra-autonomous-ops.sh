#!/data/data/com.termux/files/usr/bin/bash

cd /data/data/com.termux/files/home/ZENTRA_MASTER/zentra-final || exit 1

mkdir -p logs app docs/strategy/autonomous

LOG="logs/zentra-autonomous-ops.log"
: > "$LOG"

say(){
  echo "$1" | tee -a "$LOG"
}

pass(){
  say "PASS: $1"
}

fail(){
  say "FAIL: $1"
}

repair_file(){
  FILE="$1"
  CONTENT="$2"

  if [ -f "$FILE" ]; then
    pass "$FILE"
  else
    fail "$FILE missing"
    say "REPAIR: creating fallback $FILE"
    mkdir -p "$(dirname "$FILE")"
    printf "%s\n" "$CONTENT" > "$FILE"
  fi
}

say "=== ZENTRA AUTONOMOUS OPERATIONS $(date) ==="

say ""
say "1) Required UI files"
repair_file "app/cockpit-v2.html" "<!doctype html><html><body><h1>ZENTRA Cockpit V2</h1><p>Fallback cockpit active.</p></body></html>"
repair_file "app/report-v3.html" "<!doctype html><html><body><h1>ZENTRA Report V3</h1><p>Fallback report active.</p></body></html>"
repair_file "app/report-visual.html" "<!doctype html><html><body><h1>ZENTRA Visual Report</h1><p>Fallback visual report active.</p></body></html>"

say ""
say "2) Required API files"
repair_file "api/v1/send-report.js" "// fallback marker: send-report api missing"
repair_file "api/v1/report/view.js" "// fallback marker: report view api missing"

say ""
say "3) Required governance files"
repair_file "docs/strategy/core/GLOBAL_CONTROL_LAYER.md" "# ZENTRA — GLOBAL CONTROL LAYER\n\nFallback global control record."
repair_file "docs/strategy/security/CYBER_CLOUD_GOVERNANCE.md" "# ZENTRA — CYBER CLOUD GOVERNANCE\n\nFallback security governance record."
repair_file "docs/strategy/legal/GLOBAL_LEGAL_COMMERCIAL_FRAMEWORK.md" "# ZENTRA — LEGAL COMMERCIAL FRAMEWORK\n\nFallback legal framework record."
repair_file "docs/strategy/accessibility/ACCESSIBILITY_INCLUSIVE_USE_LAYER.md" "# ZENTRA — ACCESSIBILITY LAYER\n\nFallback accessibility record."
repair_file "docs/strategy/launch/FINAL_LAUNCH_CONTROL.md" "# ZENTRA — FINAL LAUNCH CONTROL\n\nFallback launch control record."

say ""
say "4) Key content checks"

grep -q "FINAL STATUS: LAUNCH LOCKED" docs/strategy/launch/FINAL_LAUNCH_CONTROL.md && pass "launch locked" || fail "launch lock text missing"
grep -q "GLOBAL CONTROL" docs/strategy/core/GLOBAL_CONTROL_LAYER.md && pass "global control exists" || fail "global control weak"
grep -q "Accessibility" docs/strategy/accessibility/ACCESSIBILITY_INCLUSIVE_USE_LAYER.md && pass "accessibility exists" || fail "accessibility weak"
grep -q "Legal" docs/strategy/legal/GLOBAL_LEGAL_COMMERCIAL_FRAMEWORK.md && pass "legal exists" || fail "legal weak"

say ""
say "5) Git status"
git status --short | tee -a "$LOG"

say ""
say "6) System links"
say "Cockpit: http://127.0.0.1:8080/app/cockpit-v2.html"
say "Report:  http://127.0.0.1:8080/app/report-v3.html"
say "Visual:  http://127.0.0.1:8080/app/report-visual.html"

say ""
say "7) Decision"
if grep -q "FAIL:" "$LOG"; then
  say "ZENTRA STATUS: AUTO-REPAIRED OR NEEDS GOVERNANCE REVIEW"
else
  say "ZENTRA STATUS: READY"
fi

say ""
say "Starting local server on 8080..."
python3 -m http.server 8080
