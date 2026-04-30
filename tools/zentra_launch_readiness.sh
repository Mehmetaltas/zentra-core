#!/data/data/com.termux/files/usr/bin/bash
set -e

DATE=$(date +"%Y-%m-%d_%H-%M")
mkdir -p docs/launch
R="docs/launch/LAUNCH_READINESS_$DATE.md"

echo "# ZENTRA Launch Readiness — $DATE" > "$R"

check(){
  LABEL="$1"
  FILE="$2"
  if [ -e "$FILE" ]; then
    echo "✔ $LABEL" >> "$R"
  else
    echo "❗ MISSING: $LABEL ($FILE)" >> "$R"
  fi
}

check "Command Center" app/index.html
check "Markets" app/markets/index.html
check "Portfolio" app/portfolio/index.html
check "Packages" app/packages/index.html
check "Pricing" app/pricing/index.html
check "Assistant" app/zentra-assistant-float.js
check "Assistant Operator V2" app/assistant-operator-v2.js
check "Depth Engine V2" app/intelligence/depth-engine-v2.js
check "Report Intelligence V2" app/intelligence/report-intelligence-v2.js
check "Legal" app/legal/index.html
check "Support" app/support/index.html
check "Proof Standard" docs/proof/PROOF_FLOW_STANDARD.md

if grep -q "MISSING" "$R"; then
  echo "FINAL STATUS: FIX REQUIRED" >> "$R"
else
  echo "FINAL STATUS: LAUNCH READY BASELINE" >> "$R"
fi

cat "$R"
