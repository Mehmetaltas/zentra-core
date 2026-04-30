#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "=== ZENTRA AUTO BUILDER V3 START ==="

DATE=$(date +"%Y-%m-%d_%H-%M")
mkdir -p docs/completeness docs/trace docs/auto

REPORT="docs/completeness/COMPLETENESS_$DATE.md"

echo "# ZENTRA COMPLETENESS REPORT — $DATE" > $REPORT

check_block () {
  NAME=$1
  shift
  MISSING=0
  echo "## $NAME" >> $REPORT
  for f in "$@"; do
    if [ -f "$f" ]; then
      echo "✔ $f" >> $REPORT
    else
      echo "❗ MISSING: $f" >> $REPORT
      MISSING=1
    fi
  done
  if [ $MISSING -eq 0 ]; then
    echo "STATUS: READY" >> $REPORT
  else
    echo "STATUS: FIX REQUIRED" >> $REPORT
  fi
  echo "" >> $REPORT
}

# 1) CORE
check_block "CORE SYSTEM" \
app/index.html \
app/matrix.html \
app/markets/index.html \
app/portfolio/index.html

# 2) INTEL
check_block "INTEL AI" \
app/modules/risk.html \
app/modules/financial-trade.html \
app/modules/credit.html

# 3) GENERAL AI
check_block "GENERAL AI" \
app/general-ai.html \
tools/general_ai

# 4) ACADEMIA
check_block "ACADEMIA AI" \
app/academia/index.html

# 5) PACKAGES
check_block "PACKAGES" \
app/packages/index.html \
app/pricing/index.html

# 6) TRUST / LEGAL
check_block "LEGAL / SUPPORT" \
app/account/index.html \
app/legal/index.html \
app/support/index.html

# 7) ASSISTANT
check_block "ASSISTANT" \
app/zentra-assistant-float.js

# 8) PROOF
check_block "PROOF FLOW" \
docs/proof

# 9) AUTO SYSTEM
check_block "AUTO BUILDER" \
tools/zentra_auto_build.sh

# 10) RESULT SUMMARY
if grep -q "MISSING" $REPORT; then
  echo "FINAL STATUS: FIX REQUIRED" >> $REPORT
else
  echo "FINAL STATUS: SYSTEM READY" >> $REPORT
fi

# 11) PUBLIC SYNC
rm -rf public/app
mkdir -p public
cp -R app public/app

# 12) CLEAN
rm -f data/out_*.txt 2>/dev/null || true

# 13) BOOK SYNC
echo "## $DATE — COMPLETENESS CHECK" >> docs/books/ZENTRA_SIMPLE_BOOK.md
echo "Completeness report generated." >> docs/books/ZENTRA_SIMPLE_BOOK.md

echo "## $DATE — COMPLETENESS ENGINE" >> docs/books/ZENTRA_TECHNICAL_BOOK.md
echo "Completeness engine executed." >> docs/books/ZENTRA_TECHNICAL_BOOK.md

echo "### $DATE — COMPLETENESS" >> docs/books/ZENTRA_LIVING_SYSTEM_BOOK.md
echo "System self-evaluated." >> docs/books/ZENTRA_LIVING_SYSTEM_BOOK.md

# 14) TRACE
cat > docs/trace/COMPLETENESS_TRACE_$DATE.md <<TRACE
ZENTRA ran completeness engine.
TRACE

# 15) GIT
git add app public docs tools 2>/dev/null || true
git commit -m "completeness engine run $DATE" || true
git push origin main

# 16) AUDIT
./tools/zentra-full-audit.sh
./tools/zentra-experience-audit.sh

echo "=== COMPLETENESS REPORT ==="
cat $REPORT

echo "=== ZENTRA AUTO BUILDER V3 DONE ==="
